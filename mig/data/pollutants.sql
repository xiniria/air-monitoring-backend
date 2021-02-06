INSERT INTO pollutants (full_name, short_name, description, waqi_name, is_pollutant, unit)
VALUES ('Indice de qualité de l''air', 'AQI', '', 'aqi', TRUE),
       ('Monoxyde de carbone', 'CO', '', 'co', TRUE, 'ppm'),
       ('Humidité', 'H', '', 'h', FALSE, '%'),
       ('Dioxyde d''azote', 'NO2', '', 'no2', TRUE, 'µg/m³'),
       ('Ozone', 'O3', '', 'o3', TRUE, 'µg/m³'),
       ('Pression', 'P', '', 'p', FALSE, 'hPa'),
       ('Particules fines PM10', 'PM10', '', 'pm10', TRUE, 'µg/m³'),
       ('Particules fines PM2.5', 'PM25', '', 'pm25', TRUE, 'µg/m³'),
       ('Dioxyde de soufre', 'SO2', '', 'so2', TRUE, 'µg/m³'),
       ('Température', 'T', '', 't', FALSE, '°C'),
       ('Inconnu', 'DEW', '', 'dew', FALSE),
       ('Vent', 'W', '', 'w', FALSE, 'm/s'),
       ('Inconnu', 'WG', '', 'wg', FALSE);
