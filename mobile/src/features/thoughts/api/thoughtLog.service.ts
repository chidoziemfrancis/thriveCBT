/** Where thought records live on the server; the sync engine does the sending and pulling. */
export const THOUGHT_RECORDS_PATH = '/me/thought-records';

export const thoughtRecordPath = (id: string) => `${THOUGHT_RECORDS_PATH}/${id}`;
