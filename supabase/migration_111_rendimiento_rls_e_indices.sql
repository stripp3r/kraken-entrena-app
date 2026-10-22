-- Migración 111: rendimiento de la base (diagnóstico del 2026-10-22).
--
-- 1) Políticas RLS que llamaban a auth.uid() / es_coach() directamente: Postgres las reevalúa FILA POR FILA.
--    Envueltas en (select ...) se calculan una sola vez por consulta (aviso auth_rls_initplan de Supabase;
--    con muchos registros de entrenamiento la diferencia es grande). Es equivalente en lo que permiten o niegan:
--    solo cambia cómo se evalúa. Se usa ALTER POLICY (atómico, no hay instante sin política).
-- 2) Índices en claves foráneas sin cobertura (aviso unindexed_foreign_keys): acelera joins y borrados en cascada.

alter policy "usuarios ven sus propias aceptaciones" on public."aceptaciones_legales"
  using (((select auth.uid()) = user_id));

alter policy "usuarios confirman sus propios avisos" on public."avisos_precio_confirmaciones"
  with check (((select auth.uid()) = user_id));

alter policy "usuarios ven sus confirmaciones de aviso" on public."avisos_precio_confirmaciones"
  using (((select auth.uid()) = user_id));

alter policy "usuarios borran sus propias medidas" on public."body_measurements"
  using (((select auth.uid()) = user_id));

alter policy "usuarios crean sus propias medidas" on public."body_measurements"
  with check (((select auth.uid()) = user_id));

alter policy "usuarios editan sus propias medidas" on public."body_measurements"
  using (((select auth.uid()) = user_id));

alter policy "usuarios ven sus propias medidas" on public."body_measurements"
  using (((select auth.uid()) = user_id));

alter policy "usuarios borran su propio cardio" on public."cardio_logs"
  using (((select auth.uid()) = user_id));

alter policy "usuarios cargan su propio cardio" on public."cardio_logs"
  with check (((select auth.uid()) = user_id));

alter policy "usuarios editan su propio cardio" on public."cardio_logs"
  using (((select auth.uid()) = user_id));

alter policy "usuarios ven su propio cardio" on public."cardio_logs"
  using (((select auth.uid()) = user_id));

alter policy "usuarios crean sus propias finalizaciones" on public."entrenamientos_finalizados"
  with check (((select auth.uid()) = user_id));

alter policy "usuarios ven sus propias finalizaciones" on public."entrenamientos_finalizados"
  using (((select auth.uid()) = user_id));

alter policy "coach lee formularios de ingreso" on public."formularios_ingreso"
  using ((select public.es_coach()));

alter policy "usuarios crean su formulario de ingreso" on public."formularios_ingreso"
  with check (((select auth.uid()) = user_id));

alter policy "usuarios editan su formulario de ingreso" on public."formularios_ingreso"
  using (((select auth.uid()) = user_id));

alter policy "usuarios ven su formulario de ingreso" on public."formularios_ingreso"
  using (((select auth.uid()) = user_id));

alter policy "usuarios leen su propia guia" on public."guias_alimenticias"
  using (((select auth.uid()) = user_id));

alter policy "usuarios borran sus sesiones de pose" on public."pose_sesiones_prueba"
  using (((select auth.uid()) = user_id));

alter policy "usuarios crean sus sesiones de pose" on public."pose_sesiones_prueba"
  with check (((select auth.uid()) = user_id));

alter policy "usuarios ven sus sesiones de pose" on public."pose_sesiones_prueba"
  using (((select auth.uid()) = user_id));

alter policy "usuarios ven su propio acceso a rutinas" on public."profile_routine_access"
  using (((select auth.uid()) = user_id));

alter policy "usuarios cierran su propio historial de rutinas" on public."profile_routine_history"
  using (((select auth.uid()) = user_id));

alter policy "usuarios crean su propio historial de rutinas" on public."profile_routine_history"
  with check (((select auth.uid()) = user_id));

alter policy "usuarios ven su propio historial de rutinas" on public."profile_routine_history"
  using (((select auth.uid()) = user_id));

alter policy "coach lee todos los perfiles" on public."profiles"
  using ((select public.es_coach()));

alter policy "usuarios crean su propio perfil" on public."profiles"
  with check (((select auth.uid()) = id));

alter policy "usuarios editan su propio perfil" on public."profiles"
  using (((select auth.uid()) = id));

alter policy "usuarios ven su propio perfil" on public."profiles"
  using (((select auth.uid()) = id));

alter policy "usuarios borran sus propias fotos" on public."progress_photos"
  using (((select auth.uid()) = user_id));

alter policy "usuarios suben sus propias fotos" on public."progress_photos"
  with check (((select auth.uid()) = user_id));

alter policy "usuarios ven sus propias fotos" on public."progress_photos"
  using (((select auth.uid()) = user_id));

alter policy "usuarios logueados leen ejercicios de rutina" on public."routine_exercises"
  using ((EXISTS ( SELECT 1
   FROM routines r
  WHERE ((r.id = routine_exercises.routine_id) AND ((NOT r.es_privada) OR (EXISTS ( SELECT 1
           FROM profile_routine_access pra
          WHERE ((pra.user_id = (select auth.uid())) AND (pra.routine_id = r.id)))) OR (select public.es_coach()))))));

alter policy "usuarios logueados leen rutinas" on public."routines"
  using (((NOT es_privada) OR (EXISTS ( SELECT 1
   FROM profile_routine_access pra
  WHERE ((pra.user_id = (select auth.uid())) AND (pra.routine_id = routines.id)))) OR (select public.es_coach())));

alter policy "usuarios ven su propia suscripcion" on public."suscripciones"
  using (((select auth.uid()) = user_id));

alter policy "usuarios borran sus propios registros" on public."workout_logs"
  using (((select auth.uid()) = user_id));

alter policy "usuarios crean sus propios registros" on public."workout_logs"
  with check (((select auth.uid()) = user_id));

alter policy "usuarios editan sus propios registros" on public."workout_logs"
  using (((select auth.uid()) = user_id));

alter policy "usuarios ven sus propios registros" on public."workout_logs"
  using (((select auth.uid()) = user_id));

-- Índices de claves foráneas
create index if not exists avisos_precio_confirmaciones_aviso_id_idx on public."avisos_precio_confirmaciones" ("aviso_id");
create index if not exists body_measurements_user_id_idx on public."body_measurements" ("user_id");
create index if not exists compras_producto_id_idx on public."compras" ("producto_id");
create index if not exists compras_user_id_idx on public."compras" ("user_id");
create index if not exists entrenamientos_finalizados_routine_id_idx on public."entrenamientos_finalizados" ("routine_id");
create index if not exists exercise_definitions_alternativa_id_idx on public."exercise_definitions" ("alternativa_id");
create index if not exists pose_sesiones_prueba_exercise_definition_id_idx on public."pose_sesiones_prueba" ("exercise_definition_id");
create index if not exists producto_rutinas_routine_id_idx on public."producto_rutinas" ("routine_id");
create index if not exists profile_routine_access_routine_id_idx on public."profile_routine_access" ("routine_id");
create index if not exists profile_routine_history_routine_id_idx on public."profile_routine_history" ("routine_id");
create index if not exists profiles_routine_id_idx on public."profiles" ("routine_id");
create index if not exists routine_exercises_alternativa_id_idx on public."routine_exercises" ("alternativa_id");
create index if not exists routine_exercises_exercise_definition_id_idx on public."routine_exercises" ("exercise_definition_id");
create index if not exists routine_exercises_routine_id_idx on public."routine_exercises" ("routine_id");
create index if not exists suscripciones_user_id_idx on public."suscripciones" ("user_id");
create index if not exists tareas_reembolso_user_id_idx on public."tareas_reembolso" ("user_id");
create index if not exists workout_logs_exercise_definition_id_idx on public."workout_logs" ("exercise_definition_id");
create index if not exists workout_logs_exercise_id_idx on public."workout_logs" ("exercise_id");
