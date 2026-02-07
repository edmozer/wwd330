const BOOKS = "https://openlibrary.org/api/books";

export function getCoverUrlByIsbn(isbn, size = "L") {
  // size: S, M, L
  return `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(isbn)}-${size}.jpg`;
}

export async function getBookByIsbn(isbn) {
  const url = new URL(BOOKS);
  url.searchParams.set("bibkeys", `ISBN:${isbn}`);
  url.searchParams.set("format", "json");
  url.searchParams.set("jscmd", "data");

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Open Library fetch failed (${res.status})`);
  }
  const data = await res.json();
  return data[`ISBN:${isbn}`] || null;
}
