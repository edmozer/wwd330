import { $, setHidden, clear, create } from "./dom.js";
import { searchVolumes } from "./api/googleBooksApi.js";
import { formatAuthors, toSearchQuery } from "./utils.js";
import { normalizeVolume } from "./models.js";

let els;
let hasUserSearched = false;
let featuredLoaded = false;
let loadingOffTimer;

const FEATURED_SHELVES = [
  { title: "Harry Potter", query: "Harry Potter", type: "title" },
  { title: "Lord of the Rings", query: "Lord of the Rings", type: "title" },
  { title: "Science Fiction", query: "science fiction", type: "subject" },
];

function getEls() {
  return {
    form: $("#searchForm"),
    q: $("#q"),
    type: $("#searchType"),
    loading: $("#loading"),
    message: $("#message"),
    results: $("#results"),
    resultsMeta: $("#resultsMeta"),
    view: $("#view"),
    resultsPanel: $("#results").closest("section"),
  };
}

function showMessage(text) {
  els.message.textContent = text;
  setHidden(els.message, !text);
}

function setLoading(isLoading) {
  if (loadingOffTimer) {
    window.clearTimeout(loadingOffTimer);
    loadingOffTimer = undefined;
  }
  setHidden(els.loading, !isLoading);
}

function setLoadingOffDelayed(delayMs = 900) {
  if (loadingOffTimer) window.clearTimeout(loadingOffTimer);
  loadingOffTimer = window.setTimeout(() => setHidden(els.loading, true), delayMs);
}

function renderCard(book) {
  const card = create("article", { className: "card", attrs: { role: "listitem" } });
  const link = create("a", {
    className: "card-link",
    attrs: {
      href: `#/book/${encodeURIComponent(book.id)}`,
      "data-volume-id": book.id,
    },
  });

  const cover = create("div", { className: "cover" });
  if (book.thumbnail) {
    const img = create("img", {
      attrs: { src: book.thumbnail, alt: `Cover for ${book.title}`, loading: "lazy" },
    });
    cover.appendChild(img);
  }
  const meta = create("div", { className: "meta" });
  const title = create("h3", { className: "title", text: book.title });
  const author = create("p", { className: "author", text: formatAuthors(book.authors) });
  const badges = create("div", { className: "badge-row" });
  if (book.isbn) badges.appendChild(create("span", { className: "badge", text: `ISBN: ${book.isbn}` }));
  if (book.categories?.length) {
    badges.appendChild(create("span", { className: "badge", text: book.categories[0] }));
  }

  meta.appendChild(title);
  meta.appendChild(author);
  meta.appendChild(badges);

  link.appendChild(cover);
  link.appendChild(meta);
  card.appendChild(link);
  return card;
}

function renderShelf(title, books) {
  const shelf = create("section", { className: "shelf" });
  const head = create("div", { className: "shelf-head" });
  head.appendChild(create("h3", { className: "shelf-title", text: title }));
  head.appendChild(create("p", { className: "shelf-meta", text: `${books.length} pick(s)` }));
  shelf.appendChild(head);

  const grid = create("div", { className: "results" });
  const frag = document.createDocumentFragment();
  books.forEach((b) => frag.appendChild(renderCard(b)));
  grid.appendChild(frag);
  shelf.appendChild(grid);
  return shelf;
}

async function loadFeaturedShelves() {
  if (hasUserSearched) return;
  if (featuredLoaded) return;
  if (window.location.hash && window.location.hash !== "#/" && window.location.hash !== "#") return;

  // Featured picks should not show the "Searching books..." loader.
  setLoading(false);
  showMessage("");
  clear(els.results);
  els.results.classList.remove("results");
  els.results.classList.add("shelves");
  els.resultsMeta.textContent = "Featured picks";

  try {
    const settled = await Promise.allSettled(
      FEATURED_SHELVES.map(async (shelf) => {
        const q = toSearchQuery(shelf.query, shelf.type);
        const data = await searchVolumes({ q, maxResults: 9 });
        const items = Array.isArray(data.items) ? data.items : [];
        const books = items.map(normalizeVolume).filter((b) => Boolean(b.id));
        return { title: shelf.title, books };
      })
    );

    const frag = document.createDocumentFragment();
    const ok = settled
      .filter((r) => r.status === "fulfilled")
      .map((r) => r.value)
      .filter((x) => x.books.length);

    if (!ok.length) {
      showMessage("Could not load featured books. Try searching above.");
      return;
    }

    ok.forEach((s) => frag.appendChild(renderShelf(s.title, s.books.slice(0, 6))));
    els.results.appendChild(frag);

    featuredLoaded = true;
  } catch (err) {
    showMessage(err instanceof Error ? err.message : "Failed to load featured books");
  } finally {
    setLoading(false);
  }
}

async function onSubmit(e) {
  e.preventDefault();

  const raw = els.q.value;
  const q = toSearchQuery(raw, els.type.value);
  if (!q) return;

  hasUserSearched = true;

  setLoading(true);
  showMessage("");
  clear(els.results);
  els.results.classList.add("results");
  els.results.classList.remove("shelves");
  els.resultsMeta.textContent = "Searching…";
  setHidden(els.view, true);
  setHidden(els.resultsPanel, false);

  try {
    const data = await searchVolumes({ q });
    const items = Array.isArray(data.items) ? data.items : [];
    if (!items.length) {
      els.resultsMeta.textContent = "0 results";
      showMessage("No books found. Try a different search.");
      return;
    }

    const books = items.map(normalizeVolume);
    els.resultsMeta.textContent = `${books.length} result(s)`;

    const frag = document.createDocumentFragment();
    books.forEach((book) => frag.appendChild(renderCard(book)));
    els.results.appendChild(frag);
  } catch (err) {
    els.resultsMeta.textContent = "Error";
    showMessage(err instanceof Error ? err.message : "Search failed");
  } finally {
    // Keep the loader briefly so the state change feels intentional.
    setLoadingOffDelayed(900);
  }
}

export function initSearch() {
  els = getEls();
  els.form.addEventListener("submit", onSubmit);
  loadFeaturedShelves();
}

export function showSearchView() {
  els = els || getEls();
  els.view.classList.remove("detail-panel");
  setHidden(els.view, true);
  setHidden(els.resultsPanel, false);
  loadFeaturedShelves();
}
