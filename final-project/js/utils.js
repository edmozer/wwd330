export function debounce(fn, delayMs = 250) {
  let timer;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), delayMs);
  };
}

export function formatAuthors(authors) {
  if (!authors || !authors.length) return "Unknown author";
  return authors.join(", ");
}

export function toSearchQuery(raw, type) {
  const q = raw.trim();
  if (!q) return "";
  switch (type) {
    case "title":
      return `intitle:${q}`;
    case "author":
      return `inauthor:${q}`;
    case "subject":
      return `subject:${q}`;
    default:
      return q;
  }
}
