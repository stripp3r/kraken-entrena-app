// Clave usada para indexar el historial de progreso por ejercicio: cada
// día tiene su propio balde de logs, aunque el mismo ejercicio se repita
// en más de un día de la rutina (ver "Independencia estricta por día" en
// CLAUDE.md) -- nunca se comparte un balde entre días por
// exercise_definition_id solo.
export function claveEjercicioDia(exerciseDefinitionId: number, dia: string): string {
  return `${exerciseDefinitionId}:${dia}`;
}
