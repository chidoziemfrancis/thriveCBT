/** Where planned activities live on the server; the sync engine does the sending and pulling. */
export const PLANNED_ACTIVITIES_PATH = '/me/planned-activities';

export const plannedActivityPath = (id: string) => `${PLANNED_ACTIVITIES_PATH}/${id}`;
