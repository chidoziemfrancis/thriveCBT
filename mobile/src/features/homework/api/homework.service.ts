/** Where homework ticks live on the server; the sync engine does the sending and pulling. */
export const HOMEWORK_TICKS_PATH = '/me/homework-ticks';

export const homeworkTickPath = (id: string) => `${HOMEWORK_TICKS_PATH}/${id}`;
