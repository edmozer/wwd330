import { $, setHidden, clear, create } from "./dom.js";
import { getVolume } from "./api/googleBooksApi.js";
import { getCoverUrlByIsbn } from "./api/openLibraryApi.js";
import { formatAuthors } from "./utils.js";
import { normalizeVolume } from "./models.js";
import { addToReadingList, isInReadingList, removeFromReadingList } from "./storage.js";

let els;

function getEls() {
  return {
    view: $("#view"),
    resultsPanel: $("#results").closest("section"),
    message: $("#message"),
  };
}

function stripHtml(html) {
  return html ? html.replace(/<[^>]+>/g, "").trim() : "";
}

function createChip(label, value) {
  const chip = create("div", { className: "chip" });
  const k = create("span", { className: "chip-k", text: label });
  const v = create("span", { className: "chip-v", text: value || "-" });
  chip.appendChild(k);
  chip.appendChild(v);
  return chip;
}

function renderDetail(book) {
  const root = create("div", { className: "detail-layout" });

  const left = create("div", { className: "detail-left" });
  const right = create("div", { className: "detail-right" });

  const coverUrl = book.isbn ? getCoverUrlByIsbn(book.isbn, "L") : book.thumbnail;
  const aura = create("div", { className: "detail-aura", attrs: { "aria-hidden": "true" } });
  if (coverUrl) aura.style.backgroundImage = `url('${coverUrl}')`;

  const cover = create("div", { className: "detail-cover" });
  if (coverUrl) {
    const img = create("img", {
      attrs: { src: coverUrl, alt: `Cover for ${book.title}` },
    });
    img.addEventListener("error", () => {
      if (book.thumbnail && img.src !== book.thumbnail) img.src = book.thumbnail;
    });
    cover.appendChild(img);
  }

  const actions = create("div", { className: "detail-actions" });
  const inList = isInReadingList(book.id);
  const primary = create("button", {
    className: "btn btn-primary",
    text: inList ? "Remove from Reading List" : "Add to Reading List",
  });
  primary.type = "button";
  primary.addEventListener("click", () => {
    if (isInReadingList(book.id)) {
      removeFromReadingList(book.id);
      primary.textContent = "Add to Reading List";
      return;
    }
    addToReadingList(book);
    primary.textContent = "Remove from Reading List";
  });

  const back = create("a", {
    className: "btn btn-ghost",
    text: "Back to results",
    attrs: { href: "#/" },
  });

  actions.appendChild(primary);
  actions.appendChild(back);

  left.appendChild(aura);
  left.appendChild(cover);
  left.appendChild(actions);

  const title = create("h2", { className: "detail-title", text: book.title });
  const author = create("p", { className: "detail-author", text: formatAuthors(book.authors) });
  const descTitle = create("h3", { className: "detail-h", text: "Description" });
  const desc = create("p", { className: "detail-desc" });
  desc.textContent = stripHtml(book.description) || "No description.";

  const metaTitle = create("h3", { className: "detail-h", text: "Metadata" });
  const chips = create("div", { className: "chip-list" });
  chips.appendChild(createChip("Pages", book.pageCount ? String(book.pageCount) : "-"));
  chips.appendChild(createChip("Published", book.publishedDate || "-"));
  chips.appendChild(createChip("ISBN", book.isbn || "-"));

  const tagsTitle = create("h3", { className: "detail-h", text: "Categories" });
  const tags = create("div", { className: "badge-row" });
  (book.categories || []).slice(0, 8).forEach((c) => tags.appendChild(create("span", { className: "badge", text: c })));

  right.appendChild(title);
  right.appendChild(author);
  right.appendChild(descTitle);
  right.appendChild(desc);
  right.appendChild(metaTitle);
  right.appendChild(chips);
  if ((book.categories || []).length) {
    right.appendChild(tagsTitle);
    right.appendChild(tags);
  }

  root.appendChild(left);
  root.appendChild(right);
  return root;
}

export function initDetailView() {
  els = getEls();
}


export async function showDetailView(volumeId) {
  els = els || getEls();
  setHidden(els.resultsPanel, true);
  setHidden(els.view, false);
  clear(els.view);
  els.view.classList.add("detail-panel");
  els.view.appendChild(create("p", { className: "muted", text: "Loading book details…" }));

  try {
    const data = await getVolume(volumeId);
    const book = normalizeVolume(data);
    clear(els.view);
    els.view.appendChild(renderDetail(book));
  } catch (err) {
    clear(els.view);
    els.view.appendChild(
      create("div", {
        className: "message",
        text: err instanceof Error ? err.message : "Failed to load details",
      })
    );
  }
}
