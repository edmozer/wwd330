import { GOOGLE_BOOKS_API_KEY } from "../config.js";

const BASE = "https://www.googleapis.com/books/v1";

export async function searchVolumes({ q, maxResults = 24 }) {
  const url = new URL(`${BASE}/volumes`);
  url.searchParams.set("q", q);
  url.searchParams.set("maxResults", String(maxResults));
  // optional key
  if (GOOGLE_BOOKS_API_KEY) url.searchParams.set("key", GOOGLE_BOOKS_API_KEY);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Google Books search failed (${res.status})`);
  }
  return res.json();
}

export async function getVolume(volumeId) {
  const url = new URL(`${BASE}/volumes/${encodeURIComponent(volumeId)}`);
  if (GOOGLE_BOOKS_API_KEY) url.searchParams.set("key", GOOGLE_BOOKS_API_KEY);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Google Books detail failed (${res.status})`);
  }
  return res.json();
}
