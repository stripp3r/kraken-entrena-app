-- Migración 108: diagnóstico de cada intento con la cámara (aunque no haya contado nada).
--
-- Hasta ahora solo se guardaban las series en las que el contador llegó a contar repeticiones, así que los
-- intentos que fallaron (no tomó el video, no se armó, mala posición) no dejaban rastro y no se podían
-- diagnosticar. Se agrega una columna con un resumen numérico del intento: cuántos cuadros tuvo cada
-- estado de encuadre, resolución, si analizó con GPU o CPU, qué modelo, cuántos segundos tardó en armarse, etc.
-- Solo números (sin video). Aditiva; solo la escriben las cuentas de prototipos.

alter table public.pose_sesiones_prueba add column if not exists diagnostico jsonb;
