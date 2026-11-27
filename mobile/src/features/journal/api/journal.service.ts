/** Where journal entries live on the server; the sync engine does the sending and pulling. */
export const JOURNAL_PATH = '/me/journal';

export const journalPath = (id: string) => `${JOURNAL_PATH}/${id}`;
