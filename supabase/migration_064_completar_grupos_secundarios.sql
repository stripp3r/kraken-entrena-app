-- Migración 064: completa huecos reales de etiquetado en
-- exercise_definitions.grupos_musculares -- no es una fórmula más precisa,
-- es completar el dato. Trapecio no estaba tageado en NINGÚN ejercicio
-- compuesto (remos, peso muerto, dominadas, face pull) a pesar de que
-- biomecánicamente esos movimientos sí lo involucran, solo aparecía en los
-- 4 encogimientos dedicados. Además había una inconsistencia lisa: "Remo
-- parado con barra agarre cerrado" tenía [Espalda,Bíceps] pero "Remo con
-- barra parado" (mismo movimiento) solo [Espalda].
--
-- El orden del array importa (pesoPorGrupo en pentagono.ts): posición 0 =
-- principal (peso 1), posiciones 1-2 = secundario (peso 0.5), posición 3+ =
-- terciario (peso 0.25, categoría nueva de este mismo cambio).
--
-- Correr en el SQL Editor de Supabase.

-- Pulldowns verticales: agregar Bíceps (secundario) -- consistencia con sus
-- hermanos "agarre cerrado/supino" que ya lo tienen.
update public.exercise_definitions
set grupos_musculares = array['Espalda', 'Bíceps']
where id in (30, 145, 9, 65);
-- 30 Jalón lateral con polea a un brazo, 145 Pulldown a un brazo en polea
-- alta, 9 Dorsales en máquina, 65 Dorsales en polea alta

-- Remos horizontales: agregar Bíceps (secundario) + Trapecio (terciario) --
-- el remo, a diferencia del jalón vertical, recluta más los retractores de
-- escápula.
update public.exercise_definitions
set grupos_musculares = array['Espalda', 'Bíceps', 'Trapecio']
where id in (37, 38, 39, 40, 41, 42, 66, 78);
-- 37 Remo arrodillado en polea alta, 38 Remo con barra parado, 39 Remo con
-- mancuerna a un brazo, 40 Remo en máquina sentado, 41 Remo en máquina T
-- landmine, 42 Remo en polea baja a un brazo sentado, 66 Remo sentado
-- agarre cerrado, 78 Meadows Row

-- Ya tenían [Espalda, Bíceps] -- agregar Trapecio (terciario) en 3ra
-- posición.
update public.exercise_definitions
set grupos_musculares = array['Espalda', 'Bíceps', 'Trapecio']
where id in (141, 67, 138, 139, 140, 68, 142, 143, 136, 146);
-- 141 Dominadas (Pull ups), 67 Chin up agarre abierto, 138 Chin up agarre
-- cerrado, 139 Dominada asistida con banda elástica, 140 Dominada con
-- agarre invertido, 68 Dominadas lastradas, 142 Dorsales en polea alta
-- agarre cerrado, 143 Dorsales en polea alta agarre supino, 136 Jalón al
-- pecho en polea alta agarre supino, 146 Remo parado con barra agarre
-- cerrado

-- Face pull: agregar Trapecio (terciario).
update public.exercise_definitions
set grupos_musculares = array['Hombros', 'Espalda', 'Trapecio']
where id = 25;

-- Peso muerto: agregar Trapecio y Antebrazos (terciarios) -- se mantiene
-- Isquiotibiales principal, Glúteos y Espalda secundarios exactamente como
-- ya funciona hoy.
update public.exercise_definitions
set grupos_musculares = array['Isquiotibiales', 'Glúteos', 'Espalda', 'Trapecio', 'Antebrazos']
where id = 59;

-- Remo al mentón en polea: RECLASIFICAR (no es agregar, es corregir) -- es
-- un upright row, target real es Hombros + Trapecio, el dorsal casi no
-- interviene acá.
update public.exercise_definitions
set grupos_musculares = array['Hombros', 'Trapecio']
where id = 170;
