#!/usr/bin/env python3
"""Headless smoke test for Book Finder (local).

Runs a minimal E2E flow:
- Search books
- Open details
- Add to reading list (localStorage)
- Open reading list, change status, remove

Outputs screenshots to final-project/tests/evidence/.
"""

from __future__ import annotations

import json
import os
import time
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

BASE_URL = os.environ.get("BASE_URL", "http://127.0.0.1:8000/final-project/")
EVIDENCE_DIR = Path(__file__).resolve().parent / "evidence"
STORAGE_KEY = "book-finder.readingList.v1"


def snap(page, name: str) -> None:
    path = EVIDENCE_DIR / f"{name}.png"
    page.screenshot(path=str(path), full_page=True)


def get_list(page):
    raw = page.evaluate(f"() => localStorage.getItem('{STORAGE_KEY}')")
    if not raw:
        return []
    try:
        data = json.loads(raw)
        return data if isinstance(data, list) else []
    except json.JSONDecodeError:
        return []


def main() -> int:
    EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)
    started = time.time()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()
        page.set_default_timeout(30_000)

        # Home
        page.goto(BASE_URL, wait_until="domcontentloaded")
        page.locator("#searchForm").wait_for()
        page.evaluate(f"() => localStorage.removeItem('{STORAGE_KEY}')")
        snap(page, "01-home")

        # Search
        page.locator("#q").fill("Dune")
        page.locator("#searchForm button[type=submit]").click()
        page.locator("#results .card-link").first.wait_for()
        snap(page, "02-results")

        # Open first result -> details
        page.locator("#results .card-link").first.click()
        page.wait_for_function("() => location.hash.startsWith('#/book/')")
        expect(page.locator("#view")).to_be_visible()
        expect(page.locator("#view")).to_contain_text("Description")
        snap(page, "03-detail")

        # Add to reading list
        add_btn = page.locator("#view .btn-primary")
        expect(add_btn).to_be_visible()
        add_btn.click()
        expect(add_btn).to_contain_text("Remove")
        snap(page, "04-added")

        items = get_list(page)
        assert len(items) == 1, f"Expected 1 reading list item, got {len(items)}"
        volume_id = items[0].get("id")
        assert volume_id, "Expected saved item to include id"

        # Go to reading list
        page.get_by_role("link", name="Reading List").click()
        page.wait_for_function("() => location.hash === '#/list'")
        expect(page.locator("#view")).to_contain_text("Reading List")
        snap(page, "05-reading-list")

        # Change status
        page.locator("#view select.search-select").first.select_option("reading")
        snap(page, "06-status-reading")

        items = get_list(page)
        assert items and items[0]["id"] == volume_id
        assert items[0].get("status") == "reading", f"Expected status=reading, got {items[0].get('status')}"

        # Remove
        page.locator("#view button", has_text="Remove").first.click()
        expect(page.locator("#view")).to_contain_text("Your reading list is empty")
        snap(page, "07-empty")

        browser.close()

    dur = time.time() - started
    print(f"PASS - headless smoke test ({dur:.1f}s)")
    print(f"Evidence: {EVIDENCE_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
