export type UserRole = "broadcaster" | "user";

export interface AuthUser {
  id: string;
  phone: string;
  role: UserRole;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

interface RegisterResponseLike {
  token?: unknown;
  newUser?: {
    userId?: unknown;
  };
}

const AUTH_TOKEN_KEY = "kuas24-auth-token";
const AUTH_USER_KEY = "kuas24-auth-user";
const AUTH_CHANGE_EVENT = "kuas24-auth-changed";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function emitAuthChange() {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT));
}

function parseUser(input: unknown): AuthUser | null {
  if (!input || typeof input !== "object") return null;

  const candidate = input as Record<string, unknown>;
  const id = typeof candidate.id === "string" ? candidate.id : null;
  const phone = typeof candidate.phone === "string" ? candidate.phone : null;
  const role = candidate.role === "broadcaster" || candidate.role === "user" ? candidate.role : null;

  if (!id || !phone || !role) return null;

  return { id, phone, role };
}

export function readAuthSession(): AuthSession | null {
  if (!isBrowser()) return null;

  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const rawUser = localStorage.getItem(AUTH_USER_KEY);

  if (!token || !rawUser) return null;

  try {
    const parsed = JSON.parse(rawUser) as unknown;
    const user = parseUser(parsed);
    if (!user) return null;

    return { token, user };
  } catch {
    return null;
  }
}

export function setAuthSession(session: AuthSession): void {
  if (!isBrowser()) return;

  localStorage.setItem(AUTH_TOKEN_KEY, session.token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(session.user));
  emitAuthChange();
}

export function setAuthSessionFromRegisterResponse(payload: unknown, phone: string): AuthSession | null {
  if (!payload || typeof payload !== "object") return null;

  const candidate = payload as RegisterResponseLike;
  const token = typeof candidate.token === "string" ? candidate.token : null;
  const userId =
    candidate.newUser && typeof candidate.newUser.userId === "string"
      ? candidate.newUser.userId
      : null;
  const normalizedPhone = phone.trim();

  if (!token || !userId || !normalizedPhone) return null;

  const session: AuthSession = {
    token,
    user: {
      id: userId,
      phone: normalizedPhone,
      role: "user",
    },
  };

  setAuthSession(session);
  return session;
}

export function setAuthSessionFromLoginResponse(payload: unknown): AuthSession | null {
  if (!payload || typeof payload !== "object") return null;

  const candidate = payload as Record<string, unknown>;
  const token = typeof candidate.token === "string" ? candidate.token : null;
  const user = parseUser(candidate.user);

  if (!token || !user) return null;

  const session = { token, user };
  setAuthSession(session);
  return session;
}

export function clearAuthSession(): void {
  if (!isBrowser()) return;

  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  emitAuthChange();
}

export function isBroadcaster(session: AuthSession | null): boolean {
  return session?.user.role === "broadcaster";
}

export function getAuthHeaderValue(): string | null {
  const session = readAuthSession();
  return session?.token ? `Bearer ${session.token}` : null;
}

export { AUTH_CHANGE_EVENT };