/** Where coping data lives on the server; the sync engine does the sending and pulling. */
export const TOOLKIT_PATH = '/me/toolkit';
export const TOOL_USES_PATH = '/me/tool-uses';
export const STRESS_ENTRIES_PATH = '/me/stress-entries';
export const CRISIS_PLAN_PROGRESS_PATH = '/me/crisis-plan-progress';

export const toolkitItemPath = (id: string) => `${TOOLKIT_PATH}/${id}`;
export const toolUsePath = (id: string) => `${TOOL_USES_PATH}/${id}`;
export const stressEntryPath = (id: string) => `${STRESS_ENTRIES_PATH}/${id}`;
