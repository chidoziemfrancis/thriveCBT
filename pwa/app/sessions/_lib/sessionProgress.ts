const STORAGE_KEY = "session_progress";

type Progress = Record<string, string[]>;

function read(): Progress {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function getCompletedModules(sessionId: number): string[] {
  return read()[String(sessionId)] ?? [];
}

export function completeModule(sessionId: number, moduleId: string) {
  const data = read();
  const key = String(sessionId);
  const existing = data[key] ?? [];
  if (!existing.includes(moduleId)) {
    data[key] = [...existing, moduleId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}
