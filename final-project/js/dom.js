export function $(selector, root = document) {
  const el = root.querySelector(selector);
  if (!el) throw new Error(`Missing element: ${selector}`);
  return el;
}

export function setHidden(el, hidden) {
  el.hidden = Boolean(hidden);
}

export function clear(el) {
  el.textContent = "";
  while (el.firstChild) el.removeChild(el.firstChild);
}

export function create(tag, options = {}) {
  const el = document.createElement(tag);
  if (options.className) el.className = options.className;
  if (options.text) el.textContent = options.text;
  if (options.attrs) {
    Object.entries(options.attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
  }
  return el;
}
