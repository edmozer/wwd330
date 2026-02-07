const KEY = "book-finder.readingList.v1";

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getReadingList() {
  const raw = localStorage.getItem(KEY);
  const parsed = raw ? safeParse(raw) : null;
  return Array.isArray(parsed) ? parsed : [];
}

export function isInReadingList(id) {
  return getReadingList().some((b) => b.id === id);
}

export function addToReadingList(book) {
  const list = getReadingList();
  if (list.some((b) => b.id === book.id)) return;
  const entry = {
    id: book.id,
    title: book.title,
    authors: book.authors,
    thumbnail: book.thumbnail,
    isbn: book.isbn,
    status: "wantToRead",
    addedDate: new Date().toISOString(),
    dataVersion: "v1",
  };
  list.unshift(entry);
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function removeFromReadingList(id) {
  const list = getReadingList().filter((b) => b.id !== id);
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function setReadingStatus(id, status) {
  const list = getReadingList().map((b) => (b.id === id ? { ...b, status } : b));
  localStorage.setItem(KEY, JSON.stringify(list));
}
