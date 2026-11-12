-- Migración 121: KRAKEN GYM Push A — "Fondos en máquina" (la máquina sentada con placas, no la asistida).
-- Ejercicio nuevo con el GIF "Lever Seated Dip"; alternativa: Fondos en paralelas (con lastre).
-- Push A pasa de "Fondos en paralelas asistida" (154) al nuevo ejercicio. Push B no cambia.
do $$
declare rid bigint; fm bigint; filas int;
begin
  select id into rid from public.routines where nombre = 'KRAKEN GYM';
  if rid is null then raise exception 'No existe KRAKEN GYM'; end if;

  select id into fm from public.exercise_definitions where nombre = 'Fondos en máquina';
  if fm is null then
    insert into public.exercise_definitions (nombre, categoria, imagen_url, tipo_esfuerzo, unilateral, grupos_musculares, modalidad_carga, alternativa_id, como_hacerlo)
    values ('Fondos en máquina', 'Push',
      'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/webp/fondos-maquina-0a27fe74.webp',
      'compuesto', false, array['Pecho', 'Tríceps'], 'con_peso', 28,
      E'Paso inicial: Sentate en la máquina de fondos, ajustá el asiento para que las manijas queden a la altura de la parte baja del pecho y cargá el peso con la clavija.\n\nPosición inicial: Espalda apoyada, pecho arriba, manos en las manijas y brazos casi estirados, hombros lejos de las orejas.\n\nMovimiento: Empujá las manijas hacia abajo hasta estirar los codos sin bloquearlos, y volvé de forma controlada (2-3 segundos) hasta sentir el estiramiento del pecho, sin dejar que los hombros se vayan hacia adelante.\n\nConsejos: Inclinando apenas el torso hacia adelante cargás más el pecho; más vertical, más tríceps. No rebotes abajo.')
    returning id into fm;
  end if;

  update public.routine_exercises set exercise_definition_id = fm
   where routine_id = rid and dia = 'A' and exercise_definition_id = 154;
  get diagnostics filas = row_count;
  if filas <> 1 then raise exception 'Se esperaba reemplazar 1 fila y fueron %', filas; end if;
end
$$;
