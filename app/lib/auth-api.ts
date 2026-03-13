interface RegisterRequest {
  name: string;
  phoneNumber: string;
  password: string;
}

interface RegisterResponse {
  status?: string;
  token?: string;
  newUser?: {
    userId?: string;
    name?: string;
  };
}

interface LoginRequest {
  phone: string;
  password: string;
}

interface LoginResponse {
  token?: string;
  user?: {
    id?: string;
    phone?: string;
    role?: "broadcaster" | "user";
  };
}

interface ForgotPasswordRequest {
  phone: string;
}

interface VerifyOtpRequest {
  phone: string;
  code: string;
}

interface ResetPasswordRequest {
  phone: string;
  code: string;
  newPassword: string;
}

function normalizePhone(value: string): string {
  return value.trim();
}

async function authRequest<T>(path: string, body: unknown): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`/api/auth/${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new Error("Unable to reach the local authentication proxy. Please try again.");
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message = getErrorMessage(payload) || "Authentication request failed.";
    throw new Error(message);
  }

  return payload as T;
}

function getErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;

  const entry = payload as Record<string, unknown>;
  const candidates = [entry.message, entry.error, entry.details, entry.status];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate;
    }
  }

  return null;
}

export async function registerUser(input: RegisterRequest): Promise<RegisterResponse> {
  return authRequest<RegisterResponse>("register", {
    name: input.name.trim(),
    phoneNumber: normalizePhone(input.phoneNumber),
    password: input.password,
  });
}

export async function loginUser(input: LoginRequest): Promise<LoginResponse> {
  return authRequest<LoginResponse>("login", {
    phone: normalizePhone(input.phone),
    password: input.password,
  });
}

export async function forgotPassword(input: ForgotPasswordRequest): Promise<{ message?: string }> {
  return authRequest<{ message?: string }>("forgot-password", {
    phone: normalizePhone(input.phone),
  });
}

export async function verifyOtp(input: VerifyOtpRequest): Promise<{ message?: string }> {
  return authRequest<{ message?: string }>("verify-otp", {
    phone: normalizePhone(input.phone),
    code: input.code.trim(),
  });
}

export async function resetPassword(input: ResetPasswordRequest): Promise<{ message?: string }> {
  return authRequest<{ message?: string }>("reset-password", {
    phone: normalizePhone(input.phone),
    code: input.code.trim(),
    newPassword: input.newPassword,
  });
}

export type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  ForgotPasswordRequest,
  VerifyOtpRequest,
  ResetPasswordRequest,
};
