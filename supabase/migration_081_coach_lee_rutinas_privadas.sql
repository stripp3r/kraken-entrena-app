-- Migración 081: el coach necesita leer rutinas PRIVADAS ajenas.
--
-- Migración 035 introdujo `routines.es_privada`: una rutina privada
-- solo es visible para quien tiene una fila explícita en
-- `profile_routine_access`. Eso es correcto para un cliente cualquiera,
-- pero bloquea también al coach -- y las rutinas privadas (armadas a
-- mano para una mentoría puntual, ej. "Rocío Pace", "Lorena Tobares",
-- "Santiago Pelotti") son justamente las que más necesita poder
-- inspeccionar, porque son las que arma él mismo y las que más
-- probabilidad tienen de tener un error humano (GIF mal asignado,
-- ejercicio equivocado). Se agrega la misma función `public.es_coach()`
-- de la migración 080 como condición extra en las dos policies que
-- migración 035 ya había definido.

drop policy if exists "usuarios logueados leen rutinas" on public.routines;
create policy "usuarios logueados leen rutinas"
  on public.routines for select
  to authenticated
  using (
    not es_privada
    or exists (
      select 1 from public.profile_routine_access pra
      where pra.user_id = auth.uid() and pra.routine_id = routines.id
    )
    or public.es_coach()
  );

drop policy if exists "usuarios logueados leen ejercicios de rutina" on public.routine_exercises;
create policy "usuarios logueados leen ejercicios de rutina"
  on public.routine_exercises for select
  to authenticated
  using (
    exists (
      select 1 from public.routines r
      where r.id = routine_exercises.routine_id
        and (
          not r.es_privada
          or exists (
            select 1 from public.profile_routine_access pra
            where pra.user_id = auth.uid() and pra.routine_id = r.id
          )
          or public.es_coach()
        )
    )
  );
