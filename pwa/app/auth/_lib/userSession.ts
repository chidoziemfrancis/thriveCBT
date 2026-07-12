const STORAGE_KEY = "user_session";

type UserSession = { email?: string };

function read(): UserSession {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function getUserSession(): UserSession {
  return read();
}

export function setUserSession(patch: Partial<UserSession>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...read(), ...patch }));
}

export function clearUserSession() {
  localStorage.removeItem(STORAGE_KEY);
}
