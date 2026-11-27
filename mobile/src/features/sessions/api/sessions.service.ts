/** Where session progress lives on the server; the sync engine does the sending and pulling. */
export const SESSIONS_PATH = '/me/sessions';

export const sessionPath = (sessionId: number) => `${SESSIONS_PATH}/${sessionId}`;
