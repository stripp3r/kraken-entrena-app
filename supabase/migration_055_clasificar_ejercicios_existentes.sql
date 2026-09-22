-- Migracion 055: clasifica por grupo muscular real los 115 ejercicios
-- que ya existian antes de la migracion 054 (esos nunca se clasificaron,
-- solo se clasificaron los 65 nuevos -- por eso Abdominales/Gemelos/
-- Cuadriceps aparecian casi vacios en el buscador de 'Crea tu rutina').
--
-- Tambien agrega 4 grupos musculares nuevos a la lista fija (Trapecio,
-- Abductores, Antebrazos, Cuello) para calcar 1 a 1 las carpetas reales
-- de la biblioteca de referencia, y corrige 5 ejercicios de la migracion
-- 054 que habian quedado mal clasificados (encogimientos de hombros iban
-- a Espalda en vez de Trapecio; abducciones iban a Gluteos en vez de
-- Abductores).
--
-- Correr en el SQL Editor de Supabase despues de la migracion 054.

-- Correccion de los 5 mal clasificados en la migracion 054:
update exercise_definitions set grupos_musculares = ARRAY['Trapecio'] where nombre = 'Encogimiento de hombros con polea';
update exercise_definitions set grupos_musculares = ARRAY['Trapecio'] where nombre = 'Encogimientos de hombros banco inclinado';
update exercise_definitions set grupos_musculares = ARRAY['Abductores'] where nombre = 'Abductores externos en polea';
update exercise_definitions set grupos_musculares = ARRAY['Abductores'] where nombre = 'Abductores internos en máquina';
update exercise_definitions set grupos_musculares = ARRAY['Abductores'] where nombre = 'Abductores internos en polea';

-- Clasificacion de los 115 ejercicios que ya existian:
update exercise_definitions set grupos_musculares = ARRAY['Bíceps'] where id = 1;
update exercise_definitions set grupos_musculares = ARRAY['Cuádriceps'] where id = 2;
update exercise_definitions set grupos_musculares = ARRAY['Bíceps'] where id = 3;
update exercise_definitions set grupos_musculares = ARRAY['Bíceps'] where id = 4;
update exercise_definitions set grupos_musculares = ARRAY['Bíceps'] where id = 5;
update exercise_definitions set grupos_musculares = ARRAY['Isquiotibiales'] where id = 6;
update exercise_definitions set grupos_musculares = ARRAY['Isquiotibiales'] where id = 7;
update exercise_definitions set grupos_musculares = ARRAY['Hombros'] where id = 8;
update exercise_definitions set grupos_musculares = ARRAY['Espalda'] where id = 9;
update exercise_definitions set grupos_musculares = ARRAY['Pantorrillas'] where id = 10;
update exercise_definitions set grupos_musculares = ARRAY['Pantorrillas'] where id = 11;
update exercise_definitions set grupos_musculares = ARRAY['Pantorrillas'] where id = 12;
update exercise_definitions set grupos_musculares = ARRAY['Pantorrillas'] where id = 13;
update exercise_definitions set grupos_musculares = ARRAY['Hombros'] where id = 14;
update exercise_definitions set grupos_musculares = ARRAY['Hombros'] where id = 15;
update exercise_definitions set grupos_musculares = ARRAY['Trapecio'] where id = 16;
update exercise_definitions set grupos_musculares = ARRAY['Trapecio'] where id = 17;
update exercise_definitions set grupos_musculares = ARRAY['Cuádriceps','Glúteos'] where id = 18;
update exercise_definitions set grupos_musculares = ARRAY['Cuádriceps','Glúteos'] where id = 19;
update exercise_definitions set grupos_musculares = ARRAY['Cuádriceps'] where id = 20;
update exercise_definitions set grupos_musculares = ARRAY['Tríceps'] where id = 21;
update exercise_definitions set grupos_musculares = ARRAY['Tríceps'] where id = 22;
update exercise_definitions set grupos_musculares = ARRAY['Tríceps'] where id = 23;
update exercise_definitions set grupos_musculares = ARRAY['Tríceps'] where id = 24;
update exercise_definitions set grupos_musculares = ARRAY['Hombros','Espalda'] where id = 25;
update exercise_definitions set grupos_musculares = ARRAY['Pecho','Tríceps'] where id = 26;
update exercise_definitions set grupos_musculares = ARRAY['Tríceps','Pecho'] where id = 27;
update exercise_definitions set grupos_musculares = ARRAY['Pecho','Tríceps'] where id = 28;
update exercise_definitions set grupos_musculares = ARRAY['Isquiotibiales','Glúteos'] where id = 29;
update exercise_definitions set grupos_musculares = ARRAY['Espalda'] where id = 30;
update exercise_definitions set grupos_musculares = ARRAY['Isquiotibiales','Glúteos'] where id = 31;
update exercise_definitions set grupos_musculares = ARRAY['Pecho'] where id = 32;
update exercise_definitions set grupos_musculares = ARRAY['Pecho'] where id = 33;
update exercise_definitions set grupos_musculares = ARRAY['Hombros'] where id = 34;
update exercise_definitions set grupos_musculares = ARRAY['Pecho'] where id = 35;
update exercise_definitions set grupos_musculares = ARRAY['Hombros'] where id = 36;
update exercise_definitions set grupos_musculares = ARRAY['Espalda'] where id = 37;
update exercise_definitions set grupos_musculares = ARRAY['Espalda'] where id = 38;
update exercise_definitions set grupos_musculares = ARRAY['Espalda'] where id = 39;
update exercise_definitions set grupos_musculares = ARRAY['Espalda'] where id = 40;
update exercise_definitions set grupos_musculares = ARRAY['Espalda'] where id = 41;
update exercise_definitions set grupos_musculares = ARRAY['Espalda'] where id = 42;
update exercise_definitions set grupos_musculares = ARRAY['Cuádriceps','Glúteos'] where id = 43;
update exercise_definitions set grupos_musculares = ARRAY['Cuádriceps'] where id = 44;
update exercise_definitions set grupos_musculares = ARRAY['Cuádriceps'] where id = 45;
update exercise_definitions set grupos_musculares = ARRAY['Cuádriceps','Glúteos'] where id = 46;
update exercise_definitions set grupos_musculares = ARRAY['Hombros'] where id = 47;
update exercise_definitions set grupos_musculares = ARRAY['Hombros'] where id = 48;
update exercise_definitions set grupos_musculares = ARRAY['Abdominales'] where id = 57;
update exercise_definitions set grupos_musculares = ARRAY['Abdominales'] where id = 58;
update exercise_definitions set grupos_musculares = ARRAY['Isquiotibiales','Glúteos','Espalda'] where id = 59;
update exercise_definitions set grupos_musculares = ARRAY['Bíceps'] where id = 60;
update exercise_definitions set grupos_musculares = ARRAY['Pecho'] where id = 61;
update exercise_definitions set grupos_musculares = ARRAY['Pecho','Tríceps'] where id = 62;
update exercise_definitions set grupos_musculares = ARRAY['Hombros'] where id = 63;
update exercise_definitions set grupos_musculares = ARRAY['Glúteos'] where id = 64;
update exercise_definitions set grupos_musculares = ARRAY['Espalda'] where id = 65;
update exercise_definitions set grupos_musculares = ARRAY['Espalda'] where id = 66;
update exercise_definitions set grupos_musculares = ARRAY['Espalda','Bíceps'] where id = 67;
update exercise_definitions set grupos_musculares = ARRAY['Espalda','Bíceps'] where id = 68;
update exercise_definitions set grupos_musculares = ARRAY['Bíceps'] where id = 69;
update exercise_definitions set grupos_musculares = ARRAY['Pecho'] where id = 72;
update exercise_definitions set grupos_musculares = ARRAY['Pecho'] where id = 73;
update exercise_definitions set grupos_musculares = ARRAY['Tríceps'] where id = 74;
update exercise_definitions set grupos_musculares = ARRAY['Hombros'] where id = 75;
update exercise_definitions set grupos_musculares = ARRAY['Abductores'] where id = 76;
update exercise_definitions set grupos_musculares = ARRAY['Tríceps'] where id = 77;
update exercise_definitions set grupos_musculares = ARRAY['Espalda'] where id = 78;
update exercise_definitions set grupos_musculares = ARRAY['Pantorrillas'] where id = 79;
update exercise_definitions set grupos_musculares = ARRAY['Isquiotibiales'] where id = 80;
update exercise_definitions set grupos_musculares = ARRAY['Cuádriceps'] where id = 81;
update exercise_definitions set grupos_musculares = ARRAY['Abductores'] where id = 82;
update exercise_definitions set grupos_musculares = ARRAY['Cuádriceps','Glúteos'] where id = 83;
update exercise_definitions set grupos_musculares = ARRAY['Abdominales'] where id = 84;
update exercise_definitions set grupos_musculares = ARRAY['Abdominales'] where id = 85;
update exercise_definitions set grupos_musculares = ARRAY['Abdominales'] where id = 86;
update exercise_definitions set grupos_musculares = ARRAY['Abdominales'] where id = 87;
update exercise_definitions set grupos_musculares = ARRAY['Abdominales'] where id = 88;
update exercise_definitions set grupos_musculares = ARRAY['Abdominales'] where id = 89;
update exercise_definitions set grupos_musculares = ARRAY['Abdominales'] where id = 90;
update exercise_definitions set grupos_musculares = ARRAY['Abdominales'] where id = 91;
update exercise_definitions set grupos_musculares = ARRAY['Abdominales'] where id = 92;
update exercise_definitions set grupos_musculares = ARRAY['Abdominales'] where id = 93;
update exercise_definitions set grupos_musculares = ARRAY['Abdominales'] where id = 94;
update exercise_definitions set grupos_musculares = ARRAY['Abdominales'] where id = 95;
update exercise_definitions set grupos_musculares = ARRAY['Abdominales'] where id = 96;
update exercise_definitions set grupos_musculares = ARRAY['Abdominales'] where id = 97;
update exercise_definitions set grupos_musculares = ARRAY['Abdominales'] where id = 98;
update exercise_definitions set grupos_musculares = ARRAY['Abdominales'] where id = 99;
update exercise_definitions set grupos_musculares = ARRAY['Bíceps'] where id = 100;
update exercise_definitions set grupos_musculares = ARRAY['Hombros'] where id = 101;
update exercise_definitions set grupos_musculares = ARRAY['Hombros'] where id = 102;
update exercise_definitions set grupos_musculares = ARRAY['Pecho'] where id = 103;
update exercise_definitions set grupos_musculares = ARRAY['Glúteos'] where id = 104;
update exercise_definitions set grupos_musculares = ARRAY['Glúteos'] where id = 105;
update exercise_definitions set grupos_musculares = ARRAY['Glúteos'] where id = 106;
update exercise_definitions set grupos_musculares = ARRAY['Glúteos'] where id = 107;
update exercise_definitions set grupos_musculares = ARRAY['Glúteos'] where id = 108;
update exercise_definitions set grupos_musculares = ARRAY['Bíceps'] where id = 109;
update exercise_definitions set grupos_musculares = ARRAY['Cuádriceps'] where id = 111;
update exercise_definitions set grupos_musculares = ARRAY['Pecho'] where id = 112;
update exercise_definitions set grupos_musculares = ARRAY['Isquiotibiales'] where id = 115;
update exercise_definitions set grupos_musculares = ARRAY['Abdominales'] where id = 116;
update exercise_definitions set grupos_musculares = ARRAY['Cuádriceps','Glúteos'] where id = 121;
update exercise_definitions set grupos_musculares = ARRAY['Cuádriceps','Glúteos'] where id = 123;
update exercise_definitions set grupos_musculares = ARRAY['Cuádriceps'] where id = 124;
update exercise_definitions set grupos_musculares = ARRAY['Espalda','Pecho'] where id = 125;
update exercise_definitions set grupos_musculares = ARRAY['Pantorrillas'] where id = 127;
update exercise_definitions set grupos_musculares = ARRAY['Tríceps'] where id = 129;
update exercise_definitions set grupos_musculares = ARRAY['Isquiotibiales'] where id = 130;
update exercise_definitions set grupos_musculares = ARRAY['Pecho'] where id = 131;
update exercise_definitions set grupos_musculares = ARRAY['Tríceps'] where id = 132;
update exercise_definitions set grupos_musculares = ARRAY['Pantorrillas'] where id = 133;
update exercise_definitions set grupos_musculares = ARRAY['Cuádriceps','Glúteos'] where id = 135;
update exercise_definitions set grupos_musculares = ARRAY['Espalda','Bíceps'] where id = 136;
