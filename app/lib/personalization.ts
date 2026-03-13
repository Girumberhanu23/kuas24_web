import type {
  PersonalizationOption,
  PersonalizationOptions,
  PersonalizationPreferences,
} from "./types";
import { getAuthHeaderValue } from "./auth";

interface ApiPersonalizationOption {
  _id?: string;
  id?: string;
  name?: string;
  logo?: string;
  type?: string;
}

const EMPTY_OPTIONS: PersonalizationOptions = {
  leagues: [],
  clubs: [],
};

const EMPTY_PREFERENCES: PersonalizationPreferences = {
  preferredLeagues: [],
  preferredClubs: [],
};

async function fetchPersonalizationJson(
  path: string,
  init?: RequestInit
): Promise<unknown> {
  const authorization = getAuthHeaderValue();
  let response: Response;

  try {
    response = await fetch(`/api/${path}`, {
      cache: "no-store",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
        ...(init?.headers ?? {}),
      },
      ...init,
    });
  } catch {
    throw new Error(
      "Unable to reach personalization service. Please verify the backend is running and try again."
    );
  }

  if (!response.ok) {
    let message = "Personalization request failed.";

    try {
      const payload = (await response.json()) as Record<string, unknown>;
      if (typeof payload.message === "string") {
        message = payload.message;
      } else if (typeof payload.error === "string") {
        message = payload.error;
      }
    } catch {
      // Ignore non-JSON error payloads.
    }

    throw new Error(message);
  }

  return response.json();
}

function mapOption(
  input: ApiPersonalizationOption,
  fallbackType: "league" | "club"
): PersonalizationOption | null {
  const id = input._id || input.id;
  const name = input.name?.trim();

  if (!id || !name) return null;

  return {
    id,
    name,
    logo: input.logo,
    type: input.type === "club" || input.type === "league" ? input.type : fallbackType,
  };
}

function parseOptionsPayload(payload: unknown): PersonalizationOptions {
  if (!payload || typeof payload !== "object") return EMPTY_OPTIONS;

  const record = payload as Record<string, unknown>;
  const leagues = Array.isArray(record.leagues) ? record.leagues : [];
  const clubs = Array.isArray(record.clubs) ? record.clubs : [];

  return {
    leagues: leagues
      .map((entry) => mapOption(entry as ApiPersonalizationOption, "league"))
      .filter((entry): entry is PersonalizationOption => entry !== null),
    clubs: clubs
      .map((entry) => mapOption(entry as ApiPersonalizationOption, "club"))
      .filter((entry): entry is PersonalizationOption => entry !== null),
  };
}

function uniqueStringList(input: unknown): string[] {
  if (!Array.isArray(input)) return [];

  return Array.from(
    new Set(
      input.filter((value): value is string => typeof value === "string" && value.length > 0)
    )
  );
}

function parsePreferencesPayload(payload: unknown): PersonalizationPreferences {
  if (!payload || typeof payload !== "object") return EMPTY_PREFERENCES;

  const record = payload as Record<string, unknown>;
  const nestedCandidates = [record.data, record.result, record.preferences, record.user];

  const preferredLeagues = uniqueStringList(
    record.preferredLeagues ?? record.selectedLeagues
  );
  const preferredClubs = uniqueStringList(record.preferredClubs ?? record.selectedClubs);

  if (preferredLeagues.length > 0 || preferredClubs.length > 0) {
    return {
      preferredLeagues,
      preferredClubs,
    };
  }

  for (const nested of nestedCandidates) {
    const parsed = parsePreferencesPayload(nested);
    if (
      parsed.preferredLeagues.length > 0 ||
      parsed.preferredClubs.length > 0
    ) {
      return parsed;
    }
  }

  return EMPTY_PREFERENCES;
}

export function getSelectedInterestNames(
  options: PersonalizationOptions,
  preferences: PersonalizationPreferences
): { leagues: string[]; clubs: string[] } {
  const leagueNames = options.leagues
    .filter((option) => preferences.preferredLeagues.includes(option.id))
    .map((option) => option.name);
  const clubNames = options.clubs
    .filter((option) => preferences.preferredClubs.includes(option.id))
    .map((option) => option.name);

  return {
    leagues: leagueNames,
    clubs: clubNames,
  };
}

export async function fetchPersonalizationOptions(): Promise<PersonalizationOptions> {
  const payload = await fetchPersonalizationJson("personalization/options", {
    method: "GET",
  });

  return parseOptionsPayload(payload);
}

export async function fetchPersonalizationPreferences(): Promise<PersonalizationPreferences> {
  const payload = await fetchPersonalizationJson("personalization/preferences", {
    method: "GET",
  });

  return parsePreferencesPayload(payload);
}

export async function savePersonalizationPreferences(
  preferences: PersonalizationPreferences
): Promise<PersonalizationPreferences> {
  const payload = await fetchPersonalizationJson("personalization/preferences", {
    method: "POST",
    body: JSON.stringify({
      selectedLeagues: preferences.preferredLeagues,
      selectedClubs: preferences.preferredClubs,
    }),
  });

  const parsed = parsePreferencesPayload(payload);

  return {
    preferredLeagues:
      parsed.preferredLeagues.length > 0
        ? parsed.preferredLeagues
        : preferences.preferredLeagues,
    preferredClubs:
      parsed.preferredClubs.length > 0
        ? parsed.preferredClubs
        : preferences.preferredClubs,
  };
}

export { EMPTY_OPTIONS, EMPTY_PREFERENCES };