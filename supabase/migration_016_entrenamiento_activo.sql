-- Migración 016: soporte para "Iniciar entrenamiento" (sesión guiada con
-- cronómetro de descanso) — cada ejercicio se clasifica como compuesto/
-- aislado y unilateral/bilateral, y cada set puede registrar de qué lado es
-- (solo aplica a ejercicios unilaterales; el resto sigue con lado = null,
-- sin ningún cambio de comportamiento en las fórmulas de Progreso, que ya
-- reducen todo a un "top set" por día sin importar cuántas filas haya).

alter table public.exercises
  add column if not exists tipo_esfuerzo text not null default 'compuesto'
    check (tipo_esfuerzo in ('compuesto', 'aislado'));

alter table public.exercises
  add column if not exists unilateral boolean not null default false;

alter table public.workout_logs
  add column if not exists lado text check (lado in ('derecho', 'izquierdo'));

-- ============ DÍA A ============
update public.exercises set tipo_esfuerzo = 'compuesto', unilateral = false where nombre = 'Press militar con mancuernas';
update public.exercises set tipo_esfuerzo = 'aislado',   unilateral = true  where nombre = 'Vuelo lateral con polea';
update public.exercises set tipo_esfuerzo = 'aislado',   unilateral = true  where nombre = 'Vuelo lateral con mancuerna a un brazo';
update public.exercises set tipo_esfuerzo = 'compuesto', unilateral = false where nombre = 'Fondos en paralelas';
update public.exercises set tipo_esfuerzo = 'compuesto', unilateral = false where nombre = 'Press de hombro en maquina Smith';
update public.exercises set tipo_esfuerzo = 'aislado',   unilateral = false where nombre = 'Elevacion lateral con mancuernas';
update public.exercises set tipo_esfuerzo = 'aislado',   unilateral = false where nombre = 'Elevacion lateral en maquina';
update public.exercises set tipo_esfuerzo = 'compuesto', unilateral = false where nombre = 'Fondos en banco';

-- ============ DÍA B ============
update public.exercises set tipo_esfuerzo = 'compuesto', unilateral = true  where nombre = 'Remo en polea baja a un brazo sentado';
update public.exercises set tipo_esfuerzo = 'compuesto', unilateral = false where nombre = 'Remo en máquina sentado';
update public.exercises set tipo_esfuerzo = 'compuesto', unilateral = true  where nombre = 'Jalón lateral con polea a un brazo';
update public.exercises set tipo_esfuerzo = 'compuesto', unilateral = false where nombre = 'Dorsales en máquina';
update public.exercises set tipo_esfuerzo = 'aislado',   unilateral = false where nombre = 'Curl femoral';
update public.exercises set tipo_esfuerzo = 'aislado',   unilateral = false where nombre = 'Curl femoral sentado';
update public.exercises set tipo_esfuerzo = 'aislado',   unilateral = false where nombre = 'Hiperextensiones';
update public.exercises set tipo_esfuerzo = 'compuesto', unilateral = false where nombre = 'Peso muerto rumano';
update public.exercises set tipo_esfuerzo = 'aislado',   unilateral = false where nombre = 'Curl de bíceps en banco inclinado con mancuernas';
update public.exercises set tipo_esfuerzo = 'aislado',   unilateral = false where nombre = 'Curl de bíceps con mancuerna parado';
update public.exercises set tipo_esfuerzo = 'aislado',   unilateral = true  where nombre = 'Curl en polea a un brazo en banco Scott';
update public.exercises set tipo_esfuerzo = 'aislado',   unilateral = false where nombre = 'Bíceps en banco Scott';

-- ============ DÍA C ============
update public.exercises set tipo_esfuerzo = 'compuesto', unilateral = false where nombre = 'Press inclinado en máquina Smith';
update public.exercises set tipo_esfuerzo = 'compuesto', unilateral = false where nombre = 'Flexiones de brazos';
update public.exercises set tipo_esfuerzo = 'compuesto', unilateral = false where nombre = 'Press de banco con mancuernas';
update public.exercises set tipo_esfuerzo = 'aislado',   unilateral = false where nombre = 'Encogimiento de hombros con mancuernas';
update public.exercises set tipo_esfuerzo = 'aislado',   unilateral = false where nombre = 'Encogimiento de hombros con barra';
update public.exercises set tipo_esfuerzo = 'compuesto', unilateral = false where nombre = 'Remo en máquina T (landmine)';
update public.exercises set tipo_esfuerzo = 'compuesto', unilateral = false where nombre = 'Remo con barra parado';
update public.exercises set tipo_esfuerzo = 'compuesto', unilateral = true  where nombre = 'Remo con mancuerna a un brazo';
update public.exercises set tipo_esfuerzo = 'compuesto', unilateral = true  where nombre = 'Remo arrodillado en polea alta';
update public.exercises set tipo_esfuerzo = 'aislado',   unilateral = false where nombre = 'Face pull';
update public.exercises set tipo_esfuerzo = 'aislado',   unilateral = false where nombre = 'Deltoides posteriores en banco inclinado con mancuernas';
update public.exercises set tipo_esfuerzo = 'compuesto', unilateral = false where nombre = 'Press banco plano con barra';

-- ============ DÍA D ============
update public.exercises set tipo_esfuerzo = 'aislado',   unilateral = false where nombre = 'Extensión de cuádriceps';
update public.exercises set tipo_esfuerzo = 'compuesto', unilateral = false where nombre = 'Cuádriceps en prensa';
update public.exercises set tipo_esfuerzo = 'compuesto', unilateral = false where nombre = 'Sentadillas';
update public.exercises set tipo_esfuerzo = 'compuesto', unilateral = false where nombre = 'Sentadilla en máquina Smith';
update public.exercises set tipo_esfuerzo = 'compuesto', unilateral = true  where nombre = 'Estocada búlgara en el banco';
update public.exercises set tipo_esfuerzo = 'compuesto', unilateral = true  where nombre = 'Estocadas';
update public.exercises set tipo_esfuerzo = 'aislado',   unilateral = false where nombre = 'Sentadilla sissy';
update public.exercises set tipo_esfuerzo = 'aislado',   unilateral = false where nombre = 'Sentadilla isométrica';
update public.exercises set tipo_esfuerzo = 'aislado',   unilateral = false where nombre = 'Elevación de talón en máquina Smith';
update public.exercises set tipo_esfuerzo = 'aislado',   unilateral = false where nombre = 'Elevación de talón parado';
update public.exercises set tipo_esfuerzo = 'aislado',   unilateral = true  where nombre = 'Elevación de talón parado a una pierna';
update public.exercises set tipo_esfuerzo = 'aislado',   unilateral = false where nombre = 'Elevación de talón sentado con mancuerna';
