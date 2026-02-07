import { showSearchView } from "./searchView.js";
import { showReadingListView } from "./readingListView.js";
import { showDetailView } from "./detailView.js";

function parseRoute(hash) {
  const cleaned = (hash || "").replace(/^#/, "");
  const path = cleaned.startsWith("/") ? cleaned : "/";
  return path;
}

function getBookIdFromHash(hash) {
  const cleaned = (hash || "").replace(/^#/, "");
  // Supports: #/book/<id>
  const match = cleaned.match(/^\/book\/(.+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function initRouter() {
  function onRoute() {
    const hash = window.location.hash;
    const bookId = getBookIdFromHash(hash);
    if (bookId) {
      showDetailView(bookId);
      return;
    }

    const route = parseRoute(hash);
    if (route === "/list") {
      showReadingListView();
      return;
    }

    showSearchView();
  }

  window.addEventListener("hashchange", onRoute);
  onRoute();
}
