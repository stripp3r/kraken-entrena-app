-- Migración 107: completa el video_url de ejercicios de la rutina "Grasa Sub-0" que no lo tenían,
-- reutilizando el video de un ejercicio hermano cercano (regla de la app: nunca dejar el video en null
-- si hay un hermano razonable). Solo se completa donde está vacío; no pisa videos existentes.
-- Sin hermano razonable en la biblioteca (todavía sin video): gemelos (11, 79, 245), extensión de cuádriceps (20),
-- prensas (111, 124), tríceps en polea / sobre la cabeza (284, 77) y press francés (132).
--   7   Curl femoral sentado               <- 6   Curl femoral
--   57  Elevación de piernas colgado       <- 90  Elevación de piernas acostado
--   102 Vuelo posterior con mancuernas     <- 8   Deltoides posteriores en banco inclinado
--   109 Curl martillo parado               <- 60  Curl martillo con mancuernas sentado
--   142 Dorsales agarre cerrado            <- 65  Dorsales en polea alta
--   152 Cruce en polea parado              <- 103 Aperturas en máquina Pec Deck
--   211 Crunch en polea de rodillas        <- 86  Crunch básico
--   235 Remo en máquina T con pecho apoyado<- 41  Remo en máquina T landmine
--   112 Press de pecho en máquina          <- 33  Press de banco con mancuernas
--   4   Curl bíceps banco inclinado        <- 60  Curl martillo con mancuernas sentado
--   174 Curl bíceps con barra en polea baja<- 60  Curl martillo con mancuernas sentado

update public.exercise_definitions d
set video_url = h.video_url
from (values (7, 6), (57, 90), (102, 8), (109, 60), (142, 65), (152, 103), (211, 86), (235, 41), (112, 33), (4, 60), (174, 60)) as m(destino, hermano)
join public.exercise_definitions h on h.id = m.hermano
where d.id = m.destino and d.video_url is null and h.video_url is not null;
