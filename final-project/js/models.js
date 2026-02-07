export function normalizeVolume(item) {
  const info = item?.volumeInfo || {};
  const identifiers = info.industryIdentifiers || [];
  const isbn13 = identifiers.find((x) => x.type === "ISBN_13")?.identifier;
  const isbn10 = identifiers.find((x) => x.type === "ISBN_10")?.identifier;
  const isbn = isbn13 || isbn10 || "";

  const thumb =
    info.imageLinks?.thumbnail ||
    info.imageLinks?.smallThumbnail ||
    "";

  return {
    id: item.id,
    title: info.title || "Untitled",
    authors: info.authors || [],
    description: info.description || "",
    publishedDate: info.publishedDate || "",
    pageCount: info.pageCount || 0,
    categories: info.categories || [],
    isbn,
    thumbnail: thumb,
  };
}
