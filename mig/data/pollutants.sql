-- noinspection SpellCheckingInspectionForFile

INSERT INTO pollutants (full_name, short_name, waqi_name, is_pollutant, description, unit)
VALUES ('Indice de qualité de l''air', 'AQI', 'aqi', TRUE, 'Un AQI est donc une échelle qui permet d’harmoniser les valeurs de concentrations (exprimées en µg/m³) des différents polluants par rapport à l’impact qu’ils ont sur la santé.

En effet tous les polluants n’ont pas le même effet sur la santé aux mêmes concentrations : si le benzène est cancérigène à partir de concentrations aussi faibles que 1 µg/m³, l’ozone ne commence à avoir des effets importants qu’à partir de 100 µg/m³ ! Le but d’un AQI est donc d’exprimer les niveaux de pollution selon l’échelle qui importe : celle de l’impact sur la santé. Ainsi, plus la valeur de l’AQI est élevée, plus grand est le risque pour la santé, et inversement, un AQI faible est synonyme d’un impact réduit.

La plupart des pays utilisent des AQI différents, basés sur des seuils différents, mais aussi des polluants différents pris en compte, des méthodes calcul différentes et un nombre de catégories différent. Cette hétérogénéité est notamment due à des législations locales spécifiques. Ainsi, il existe un AQI européen, un AQI chinois, un AQI canadien, un pour les Etats-Unis… Pas évident de s’y retrouver si on veut comparer la pollution à l’échelle mondiale ! Notre application utilise pour sa part l’AQI chinois, car c’est une entité chinoise qui nous fournit nos données de pollution de l’air.', ''),
       ('Monoxyde de carbone', 'CO', 'co', TRUE, 'Le monoxyde de carbone (CO) est un gaz incolore, inodore, toxique et potentiellement mortel.

Il résulte d’une combustion incomplète, et ce quel que soit le combustible utilisé : bois, butane, charbon, essence, fuel, gaz naturel, pétrole, propane. Il diffuse très vite dans l’environnement. Chaque année, ce gaz toxique est responsable d’une centaine de décès en France.

Les symptômes – maux de tête, fatigue, nausées – apparaissent plus ou moins rapidement et peuvent toucher plusieurs personnes. Une intoxication importante peut conduire au coma et à la mort, parfois en quelques minutes. Il est donc important d’agir très vite :

En cas de suspicion d’intoxication, aérez immédiatement les locaux, arrêtez si possible les appareils à combustion, évacuez les locaux et appelez les secours en composant le 15, le 18 ou le 112 (et le 114 pour les personnes malentendantes).

La prise en charge des personnes intoxiquées doit intervenir rapidement, dès les premiers symptômes, et peut nécessiter une hospitalisation spécialisée.

- Moyenne journalière maximum admissible pour la France : 10 000 µg/m³.', 'ppm'),
       ('Humidité', 'H', 'h', FALSE, '', '%'),
       ('Dioxyde d''azote', 'NO₂', 'no2', TRUE, 'Le dioxyde d’azote est un gaz brun-rouge toxique suffocant à l’odeur âcre et piquante caractéristique, qui constitue le polluant majeur de l’atmosphère terrestre.

Il est notamment produit par les moteurs à combustion interne et les centrales thermiques. Dans l’air, le NO2 a les effets suivants :

- C’est un gaz toxique entraînant une inflammation importante des voies respiratoires à des concentrations dépassant 200 µg/m³, sur de courtes durées.

- C’est le principal agent responsable de la formation des aérosols de nitrates, qui représentent une proportion importante des PM2.5et d’ozone, en présence de rayons ultraviolets.

Les études épidémiologiques ont montré que les symptômes bronchitiques chez l’enfant asthmatique augmentent avec une exposition de longue durée au NO2. On associe également une diminution de la fonction pulmonaire aux concentrations actuellement mesurées (ou observées) dans les villes d’Europe et d’Amérique du Nord.

- Moyenne annuelle maximum admissible pour la France : 40 µg/m³.
- Moyenne horaire maximum admissible pour la France : 200 µg/m³ à ne pas dépasser plus de 18 heures par an.', 'µg/m³'),
       ('Ozone', 'O₃', 'o3', TRUE, 'L’ozone est un gaz quasiment incolore – même s’il peut être perçu par une couleur bleutée – qui dégage une odeur caractéristique proche de celle de l’eau de Javel.

Même s’il apparaît instable et qu’il a tendance à se décomposer en dioxygène, l’ozone est naturellement présent dans l’atmosphère terrestre. Dans la haute atmosphère, la stratosphère, il forme ce que l’on nomme la couche d’ozone qui protège la Terre de la majorité du rayonnement ultraviolet du soleil. Certains gaz, comme les CFC (chlorofluorocarbones), ont la fâcheuse tendance à catalyser la transformation de l’ozone en dioxygène. C’est l’origine du fameux trou de la couche d’ozone.

On trouve aussi de l’ozone dans la basse atmosphère, la troposphère. Son origine peut être plutôt naturelle lorsqu’il émane de feux de forêt par exemple. Mais elle peut aussi être plus directement anthropique lorsqu’il émane de gaz d’échappement ou de solvants. Et dans la basse atmosphère, l’ozone se transforme en un véritable polluant. Il est en effet alors nuisible à notre système respiratoire notamment, mais il peut aussi provoquer, par exemple, des irritations oculaires. Pour des concentrations de 50 ppm, l’ozone devient même mortel en quelques minutes seulement.

Notez que l’ozone est également utilisé dans l’industrie. Il sert ainsi à désinfecter les eaux, d’égouts ou de piscines, à blanchir les textiles ou la pâte à papier ou encore à stériliser le matériel médical.

- Moyenne journalière maximum admissible pour la CEE : 120 µg/m³.', 'µg/m³'),
       ('Pression', 'P', 'p', FALSE, '', 'hPa'),
       ('Particules fines PM10', 'PM10', 'pm10', TRUE, 'Les particules en suspension (notées « PM » en anglais pour « Particulate matter ») sont d’une manière générale les fines particules solides portées par l’eau et/ou liquides portées par l’air.

Pour faire simple, les particules fines, c’est de la poussière. Dans le cas de la pollution de l’air, ces poussières sont souvent issues de combustions qui ne sont pas totales. Elles génèrent ce qu’on appelle des imbrûlés. Quand on voit la fumée sortir du cheminée, d’un pot d’échappement ou quand on recrache de la fumée de cigarettes, c’est parce qu’il y a énormément de particules, de plus ou moins petites tailles. Les particules peuvent être d’origine anthropique (humaine) ou naturelle.

Les particules fines pénètrent en profondeur dans les poumons. Elles peuvent être à l’origine d’inflammations, et de l’aggravation de l’état de santé des personnes atteintes de maladies cardiaques et pulmonaires. De plus, elles peuvent transporter des composés cancérigènes absorbés sur leur surface jusque dans les poumons.

Les particules PM10 sont les particules fines d’un diamètre inférieur à 10 micromètres.

- Moyenne journalière maximum admissible pour la France : 50 µg/m³, à ne pas dépasser plus de 35 jours par an.
- Moyenne annuelle maximum admissible pour la France : 40 µg/m³, avec un objectif à 30 µg/m³.', 'µg/m³'),
       ('Particules fines PM2.5', 'PM25', 'pm25', TRUE, 'Les particules en suspension (notées « PM » en anglais pour « Particulate matter ») sont d’une manière générale les fines particules solides portées par l’eau et/ou liquides portées par l’air.

Pour faire simple, les particules fines, c’est de la poussière. Dans le cas de la pollution de l’air, ces poussières sont souvent issues de combustions qui ne sont pas totales. Elles génèrent ce qu’on appelle des imbrûlés. Quand on voit la fumée sortir du cheminée, d’un pot d’échappement ou quand on recrache de la fumée de cigarettes, c’est parce qu’il y a énormément de particules, de plus ou moins petites tailles. Les particules peuvent être d’origine anthropique (humaine) ou naturelle.

Les particules fines pénètrent en profondeur dans les poumons. Elles peuvent être à l’origine d’inflammations, et de l’aggravation de l’état de santé des personnes atteintes de maladies cardiaques et pulmonaires. De plus, elles peuvent transporter des composés cancérigènes absorbés sur leur surface jusque dans les poumons.

Les particules PM2.5 sont les particules fines d’un diamètre inférieur à 2,5 micromètres.

- Moyenne annuelle maximum admissible pour la France : 25 µg/m³, avec un objectif à 10 µg/m³.', 'µg/m³'),
       ('Dioxyde de soufre', 'SO₂', 'so2', TRUE, 'Le dioxyde de soufre est un gaz sans couleur et ininflammable avec une odeur pénétrante qui irrite les yeux et les voies respiratoires.

Il réagit sur la surface d’une variété de particules en suspension solides, il est soluble dans l’eau et peut être oxydé dans les gouttelettes d’eau portées par le vent. Le dioxyde de soufre provient principalement de la combustion des combustibles fossiles (charbons, fuels, …), au cours de laquelle les impuretés soufrées contenus dans les combustibles sont oxydées par l’oxygène de l’air en dioxyde de soufre. Ce polluant gazeux est ainsi rejeté par de multiples petites sources (installations de chauffage domestique, véhicules à moteur diesel, …) et par des sources ponctuelles plus importantes (centrales de production électrique ou de vapeur, chaufferies urbaines, …).

Les concentrations de dioxyde de soufre ont fortement baissé ces dernières années. Cette évolution récente s’explique notamment par l’amélioration des combustibles et carburants, la désulfuration des fumées des grandes installations de combustion (et la réduction du taux de marche des centrales thermiques d’EDF), le traitement des fumées des usines d’incinération d’ordures ménagères. Mais il demeure l’un des responsables des pluies acides car, dans l’atmosphère, il peut se transformer en acide sulfurique. En outre certaines zones très industrielles (Le Havre, Fos-Berre par exemple) demeurent encore soumises à des pointes de pollution par le dioxyde de soufre.

Le dioxyde de soufre est un irritant des muqueuses, de la peau et des voies respiratoires. Inhalé à concentration de quelques centaines de microgrammes par mètre cube d’air, il est absorbé à 85-99 % par les muqueuses du nez et du tractus respiratoire supérieur du fait de sa grande solubilité. Une faible fraction peut néanmoins se fixer sur des particules fines et atteindre ainsi les voies respiratoires inférieures.

Effet sur la végétation : le dioxyde de soufre avec les oxydes d’azote contribuent à la formation des pluies acides. Outre leur effet direct sur les végétaux, ils peuvent changer les caractéristiques des sols, notamment des sols acides (granite, schistes acides, grès).

- Moyenne annuelle maximum admissible pour l’OMS : 50 µg/m³.
- Moyenne annuelle maximum admissible pour la CEE : 40-60 µg/m³.', 'µg/m³'),
       ('Température', 'T', 't', FALSE, '', '°C'),
       ('Inconnu', 'DEW', 'dew', FALSE, '', ''),
       ('Vent', 'W', 'w', FALSE, '', 'm/s'),
       ('Inconnu', 'WG', 'wg', FALSE, '', '');
