export const WAQI_POLLUTANT_NAMES = [
  'co',
  'dew',
  'h',
  'no2',
  'o3',
  'p',
  'pm10',
  'pm25',
  'so2',
  't',
  'w',
  'wg',
];

export type WaqiPollutantName = typeof WAQI_POLLUTANT_NAMES[number];
