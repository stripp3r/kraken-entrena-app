-- Migración 046: las 4 rutinas de planes autoguiados (migración 042) se
-- crearon sin es_privada = true, así que quedaron como rutinas públicas
-- comunes -- cualquier cuenta en trial o Golden ya podía cambiarse a ellas
-- gratis desde "Rutinas adquiridas", sin haberlas comprado. Se corrige con
-- el mismo mecanismo que ya usa "Kraken Split" (migración 035): marcarlas
-- es_privada = true, así vuelven a exigir una fila explícita en
-- profile_routine_access (la que procesarCompraAprobada() ya crea al
-- comprar) sin importar si la cuenta es premium. No hace falta tocar
-- código -- RLS de routines/routine_exercises, cambiarRutinaActiva() y la
-- lista de "Rutinas adquiridas" ya respetan es_privada de forma genérica.
--
-- Correr en el SQL Editor de Supabase después de la migración 045.

update public.routines
set es_privada = true
where nombre in ('Grasa Sub-Cero', 'Híbrido', 'En Casa', 'Minimalista');
