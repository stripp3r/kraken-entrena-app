// Clave usada para indexar el historial de progreso por ejercicio: cuando
// un ejercicio diverge entre días (ver divergencia-dia.ts), cada día
// necesita su propio balde de logs en vez de compartir uno solo por
// exercise_definition_id.
export function claveEjercicioDia(exerciseDefinitionId: number, dia: string): string {
  return `${exerciseDefinitionId}:${dia}`;
}
