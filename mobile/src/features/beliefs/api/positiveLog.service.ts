/** Where the positive log lives on the server; the sync engine does the sending and pulling. */
export const POSITIVE_ENTRIES_PATH = '/me/positive-entries';

export const positiveEntryPath = (id: string) => `${POSITIVE_ENTRIES_PATH}/${id}`;
