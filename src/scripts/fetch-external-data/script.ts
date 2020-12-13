import fetch from 'node-fetch';
import { createConnection, Repository } from 'typeorm';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import connectionOptions from '../../../ormconfig';
import { Pollutant, PollutantData, Station } from '../../entities';
import { responseIsError, WaqiApiResponse, WaqiApiSuccess } from './waqi-api-response';
import { WaqiDataValidator } from './validation/validation';

const WAQI_API_URL = 'https://api.waqi.info/feed';

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
): Promise<void> {
  for (const [pollutantName, valueObject] of Object.entries(response.data.iaqi)) {
    const pollutant: Pollutant | undefined = waqiPollutantToDbPollutant[pollutantName];
    if (!pollutant)
      throw new Error(
        `Unknown pollutant "${pollutantName}" received in WAQI API response.\n` +
          `Full response: ${JSON.stringify(response)}`,
      );

    const pollutantData = pollutantDataRepository.create({
      stationId: station.id,
      pollutantId: pollutant.id,
      datetime: response.data.time.iso,
      value: valueObject.v,
    });

    await pollutantDataRepository.save(pollutantData);
  }
}

export async function fetchExternalData() {
  const connection = await createConnection(connectionOptions);

  const stationRepository = connection.getRepository(Station);
  const pollutantRepository = connection.getRepository(Pollutant);
  const pollutantDataRepository = connection.getRepository(PollutantData);

  const stations = await stationRepository.find();
  const pollutants = await pollutantRepository.find();
  const waqiPollutantToDbPollutant = {};
  pollutants.forEach((pollutant) => {
    waqiPollutantToDbPollutant[pollutant.waqiName] = pollutant;
  });

  try {
    await Promise.all(
      stations.map(async (station) => {
        const response = await makeApiRequest(station);
        await validateApiResponse(response, station);
        return insertDataInDb(
          response,
          pollutantDataRepository,
          station,
          waqiPollutantToDbPollutant,
        );
      }),
    );
  } catch (err: any) {
    console.warn(err);
  }
}
