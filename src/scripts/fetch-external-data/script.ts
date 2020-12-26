import fetch from 'node-fetch';
import { createConnection, Repository } from 'typeorm';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import * as dayjs from 'dayjs';
import connectionOptions from '../../../ormconfig';
import { Pollutant, PollutantData, Station } from '../../entities';
import { responseIsError, WaqiApiResponse, WaqiApiSuccess } from './waqi-api-response';
import { WaqiDataValidator } from './validation/validation';

const WAQI_API_URL = 'https://api.waqi.info/feed';

interface PollutantDataPoint {
  stationId: number;
  datetime: string;
}

export async function makeApiRequest(station: Station): Promise<WaqiApiSuccess> {
  const url = encodeURI(`${WAQI_API_URL}/@${station.externalId}/?token=${process.env.WAQI_TOKEN}`);

  let json: WaqiApiResponse;
  try {
    json = await fetch(url).then((res) => res.json());
  } catch (err: any) {
    throw new Error(`There was an error fetching data on the WAQI API: ${err.toString()}`);
  }

  if (responseIsError(json)) {
    throw new Error(
      `WAQI API responded with an error for station with id ${station.externalId}: "${json.message}"`,
    );
  }

  return json;
}

export async function validateApiResponse(
  response: WaqiApiSuccess,
  station: Station,
): Promise<void> {
  const dataAsValidatorInstance = plainToClass(WaqiDataValidator, response.data);
  const errors = await validate(dataAsValidatorInstance);

  if (errors.length > 0) {
    throw new Error(
      `Validation failed for WAQI API response for station with id ${station.externalId}.\n` +
        `Validation errors:\n\n${errors.map((e) => e.toString()).join('\n')}\n` +
        `Full response: ${JSON.stringify(response)}`,
    );
  }
}

export async function insertDataInDb(
  response: WaqiApiSuccess,
  pollutantDataRepository: Repository<PollutantData>,
  station: Station,
  waqiPollutantToDbPollutant: { [key: string]: Pollutant },
  pollutantDataPoints: PollutantDataPoint[],
): Promise<number> {
  const isoTime = response.data.time.iso;
  const isoTimeDayJs = dayjs(isoTime);
  let insertedDataPoints = 0;

  const existingDataPoints = pollutantDataPoints.filter(
    (dataPoint) => dataPoint.stationId === station.id && isoTimeDayJs.isSame(dataPoint.datetime),
  );
  if (existingDataPoints.length > 0) {
    console.info(`Data already saved for station ${station.id} at time ${isoTime}`);
    return 0;
  }

  for (const [pollutantName, valueObject] of Object.entries({
    ...response.data.iaqi,
    aqi: { v: response.data.aqi },
  })) {
    if (typeof valueObject.v !== 'number') {
      console.info(`No AQI in API response for station ${station.id}.`);
      continue;
    }
    const pollutant: Pollutant | undefined = waqiPollutantToDbPollutant[pollutantName];
    if (!pollutant)
      throw new Error(
        `Unknown pollutant "${pollutantName}" received in WAQI API response.\n` +
          `Full response: ${JSON.stringify(response)}`,
      );

    const pollutantData = pollutantDataRepository.create({
      stationId: station.id,
      pollutantId: pollutant.id,
      datetime: isoTime,
      value: valueObject.v,
    });

    await pollutantDataRepository.save(pollutantData);
    insertedDataPoints++;
  }

  return insertedDataPoints;
}

export async function fetchExternalData() {
  console.info('Starting fetch-external-data script');
  console.info('Creating connection with the database...');
  const connection = await createConnection(connectionOptions);
  console.info('Connection created');

  const stationRepository = connection.getRepository(Station);
  const pollutantRepository = connection.getRepository(Pollutant);
  const pollutantDataRepository = connection.getRepository(PollutantData);

  console.info('Fetching station and pollutant data...');
  const stations = await stationRepository.find();
  const pollutants = await pollutantRepository.find();
  const waqiPollutantToDbPollutant = {};
  pollutants.forEach((pollutant) => {
    waqiPollutantToDbPollutant[pollutant.waqiName] = pollutant;
  });

  // fetch last five data points' datetimes for each station
  const lastDataPoints = (await connection.query(`
SELECT station_id AS "stationId", datetime
FROM (
    SELECT DISTINCT station_id,
                    datetime,
                    RANK() OVER (
                        PARTITION BY station_id, pollutant_id
                        ORDER BY datetime DESC
                    ) AS rank
    FROM pollutant_data
) AS rpd
WHERE rpd.rank <= 5;
  `)) as PollutantDataPoint[];
  console.info('Data fetched');

  let insertedDataPoints = 0;

  try {
    await Promise.all(
      stations.map(async (station) => {
        console.info(`Making API request for station ${station.id}...`);
        const response = await makeApiRequest(station);
        console.info(`Validating API response for station ${station.id}...`);
        await validateApiResponse(response, station);
        console.info(`Inserting new data in DB for station ${station.id}...`);
        const newDataPoints = await insertDataInDb(
          response,
          pollutantDataRepository,
          station,
          waqiPollutantToDbPollutant,
          lastDataPoints,
        );
        insertedDataPoints += newDataPoints;
      }),
    );

    console.info(
      `Inserted ${insertedDataPoints} new data points in DB for ${stations.length} stations and ${pollutants.length} pollutants.`,
    );
  } catch (err: any) {
    console.error(err);
    process.exitCode = 1;
  }

  console.info(`Script over, closing connection with the database...`);
  await connection.close();
  console.info(`Connection closed, exiting`);
}
