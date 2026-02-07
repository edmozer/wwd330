import { $, setHidden, clear, create } from "./dom.js";
import { formatAuthors } from "./utils.js";
import { getReadingList, removeFromReadingList, setReadingStatus } from "./storage.js";

let els;

function getEls() {
  return {
    view: $("#view"),
    resultsPanel: $("#results").closest("section"),
  };
}

function renderListItem(book) {
  const card = create("article", { className: "card" });
  const row = create("div", { className: "card-link" });
  row.style.gridTemplateColumns = "84px 1fr";
  row.style.cursor = "default";

  const cover = create("div", { className: "cover" });
  if (book.thumbnail) {
    cover.appendChild(create("img", { attrs: { src: book.thumbnail, alt: `Cover for ${book.title}` } }));
  }

  const meta = create("div", { className: "meta" });
  meta.appendChild(create("h3", { className: "title", text: book.title }));
  meta.appendChild(create("p", { className: "author", text: formatAuthors(book.authors || []) }));

  const controls = create("div", { className: "badge-row" });
  controls.style.alignItems = "center";

  const select = create("select", { className: "search-select" });
  select.style.height = "36px";
  select.style.borderRadius = "12px";
  [
    ["wantToRead", "Want to Read"],
    ["reading", "Currently Reading"],
    ["read", "Read"],
  ].forEach(([value, label]) => {
    const opt = create("option", { text: label, attrs: { value } });
    if (book.status === value) opt.selected = true;
    select.appendChild(opt);
  });
  select.addEventListener("change", () => setReadingStatus(book.id, select.value));

  const details = create("a", {
    className: "nav-link",
    text: "View Details",
    attrs: { href: `#/book/${encodeURIComponent(book.id)}` },
  });
  details.style.border = "1px solid var(--line)";
  details.style.background = "rgba(255,255,255,0.55)";

  const remove = create("button", { className: "nav-link", text: "Remove" });
  remove.type = "button";
  remove.style.border = "1px solid var(--line)";
  remove.style.background = "rgba(255,255,255,0.55)";
  remove.addEventListener("click", () => {
    removeFromReadingList(book.id);
    showReadingListView();
  });

  controls.appendChild(select);
  controls.appendChild(details);
  controls.appendChild(remove);

  meta.appendChild(controls);

  row.appendChild(cover);
  row.appendChild(meta);
  card.appendChild(row);
  return card;
}

export function initListView() {
  els = getEls();
}

export function showReadingListView() {
  els = els || getEls();
  els.view.classList.remove("detail-panel");
  setHidden(els.resultsPanel, true);
  setHidden(els.view, false);
  clear(els.view);

  els.view.appendChild(
    create("div", {
      className: "panel-head",
      attrs: { style: "margin-bottom: 12px" },
    })
  );

  const head = els.view.firstElementChild;
  head.appendChild(create("h2", { className: "panel-title", text: "Reading List" }));
  head.appendChild(create("p", { className: "panel-meta", text: "Saved in your browser" }));

  const list = getReadingList();
  if (!list.length) {
    els.view.appendChild(
      create("div", {
        className: "message",
        text: "Your reading list is empty. Search for a book and add it!",
      })
    );
    els.view.appendChild(
      create("a", { className: "search-button", text: "Start Searching", attrs: { href: "#/" } })
    );
    return;
  }

  const grid = create("div", { className: "results" });
  const frag = document.createDocumentFragment();
  list.forEach((b) => frag.appendChild(renderListItem(b)));
  grid.appendChild(frag);
  els.view.appendChild(grid);
}
