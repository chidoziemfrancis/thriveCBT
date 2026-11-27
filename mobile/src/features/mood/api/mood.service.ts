/** Where moods live on the server; the sync engine does the sending and pulling. */
export const MOODS_PATH = '/me/moods';

export const moodPath = (id: string) => `${MOODS_PATH}/${id}`;
