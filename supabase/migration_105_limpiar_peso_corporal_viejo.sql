-- Migración 105: limpieza de registros viejos de ejercicios de peso corporal.
--
-- Antes de la migración 103 la ficha solo tenía "Peso", y en abdominales, fondos,
-- dominadas, hiperextensiones, etc. la gente cargaba su propio peso corporal ahí (ej. 82).
-- El análisis lo leía como si hubiera levantado 82 kg.
--
-- Regla (única, para todos los usuarios): el "peso corporal" de cada usuario es el valor
-- que más repite en estos ejercicios (si empatan, el mayor). Para cada registro:
--   - dentro de +-12 % de ese valor  -> era el cuerpo: peso = null, peso_corporal_ref = valor cargado
--   - más de 12 % por encima         -> cuerpo + carga extra: lastre = diferencia (a 0,5 kg), ref = su peso corporal
--   - más de 12 % por debajo         -> el número ya era la carga extra: lastre = valor cargado, ref = su peso corporal
-- No se pierde información: se guarda una copia del peso original de cada fila tocada en
-- workout_logs_peso_original_105 (para revertir: peso = original, lastre = null,
-- peso_corporal_ref = null).

create table if not exists public.workout_logs_peso_original_105 as
select l.id, l.peso, l.lastre, l.peso_corporal_ref
from public.workout_logs l
join public.exercise_definitions d on d.id = l.exercise_definition_id
where d.modalidad_carga = 'peso_corporal' and l.peso is not null;

alter table public.workout_logs_peso_original_105 enable row level security;
-- Sin policies: solo la service role puede leerla.

with obj as (
  select l.id, l.user_id, l.peso
  from public.workout_logs l
  join public.exercise_definitions d on d.id = l.exercise_definition_id
  where d.modalidad_carga = 'peso_corporal' and l.peso is not null
),
modal as (
  select distinct on (user_id) user_id, peso as bw
  from (select user_id, peso, count(*) as c from obj group by user_id, peso) t
  order by user_id, c desc, peso desc
),
calc as (
  select o.id,
    case
      when abs(o.peso - m.bw) / m.bw <= 0.12 then null
      when o.peso > m.bw * 1.12 then round((o.peso - m.bw) * 2) / 2
      else o.peso
    end as lastre,
    case when abs(o.peso - m.bw) / m.bw <= 0.12 then o.peso else m.bw end as ref
  from obj o join modal m using (user_id)
)
update public.workout_logs l
set peso = null, lastre = c.lastre, peso_corporal_ref = c.ref
from calc c
where l.id = c.id;
