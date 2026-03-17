const DEFAULT_API_BASE_URL = "http://localhost:3003";

function normalizeBaseUrl(value: string): string {
	return value.endsWith("/") ? value : `${value}/`;
}

export const API_BASE_URL = normalizeBaseUrl(
	process.env.NEWS_API_BASE_URL ||
		process.env.NEXT_PUBLIC_NEWS_API_BASE_URL ||
		process.env.BACKEND_API_URL ||
		process.env.NEXT_PUBLIC_BACKEND_API_URL ||
		DEFAULT_API_BASE_URL
);
