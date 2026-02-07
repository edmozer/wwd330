# Test Plan: Book Finder + Reading List

## 1. Overview
This plan covers manual testing of the Book Finder application to ensure core functionality works as expected before Week 07 final submission.

**Scope:**
- Search (Google Books API)
- Details View (API data + Open Library covers)
- Reading List (localStorage CRUD operations)
- Navigation (Routing)
- Responsive Design (Mobile/Desktop)

---

## 2. Test Cases

### Suite A: Search Functionality
| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| A1 | **Basic Search** | 1. Enter "Dune" in search input.<br>2. Click Search. | Loading spinner appears. Results grid populates with ~10-24 books. | |
| A2 | **Search Filters** | 1. Select "Author" from dropdown.<br>2. Enter "Tolkien".<br>3. Click Search. | Results are predominantly by J.R.R. Tolkien. | |
| A3 | **Empty Input** | 1. Leave input blank.<br>2. Click Search. | Search should not trigger (or show validation message). | |
| A4 | **No Results** | 1. Enter random string "xyz123abc999".<br>2. Click Search. | "0 results" message displays. User-friendly "No books found" message appears. | |
| A5 | **API Error** | 1. Disconnect network.<br>2. Click Search. | Error message "Failed to fetch" or similar appears in UI (not just console). | |

### Suite B: Book Details & Routing
| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| B1 | **Open Details** | 1. Click any book card from search results. | URL hash changes to `#/book/<id>`. View switches to Details panel. | |
| B2 | **Data Verification**| 1. Check Title, Author, Description.<br>2. Check badges (ISBN, Pages). | Data matches the selected book. Fallbacks display if data missing. | |
| B3 | **Cover Image** | 1. Observe cover image. | High-res cover loads. If missing, falls back to thumbnail or placeholder. | |
| B4 | **Back Navigation** | 1. Click "Back to results". | View returns to Search results without reloading page (state preserved). | |

### Suite C: Reading List (LocalStorage)
| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| C1 | **Add Book** | 1. In Details view, click "Add to Reading List". | Button text changes to "Remove...". Book saved to localStorage. | |
| C2 | **Persist Data** | 1. Refresh the page.<br>2. Go to Reading List. | The added book appears in the list. | |
| C3 | **Change Status** | 1. Change dropdown from "Want to Read" to "Reading".<br>2. Refresh page. | Status remains "Reading". | |
| C4 | **Remove Book** | 1. Click "Remove" button in Reading List. | Card disappears immediately. | |
| C5 | **Empty List** | 1. Remove all books. | "Your reading list is empty" message appears with CTA button. | |

### Suite D: UI & Responsiveness
| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| D1 | **Mobile View** | 1. Resize browser to < 500px width. | Search bar stacks vertically. Grid becomes 1 column. | |
| D2 | **Desktop View** | 1. Resize browser to > 1024px width. | Search bar is inline. Grid is 3-4 columns. Details page splits into 2 columns. | |

---

## 3. Automated Sanity Check (Console)

Run these commands in the browser console (`F12` > Console) to verify internal modules:

```javascript
// Check if modules loaded
import('./js/storage.js').then(m => console.log('Storage loaded', m));

// Verify LocalStorage direct access
localStorage.getItem('book-finder.readingList.v1');
```

## 4. Cross-Browser Testing
- [ ] Chrome (Primary)
- [ ] Safari (MacOS check)
- [ ] Firefox
- [ ] Mobile (iOS/Android) or DevTools Mobile Emulation
