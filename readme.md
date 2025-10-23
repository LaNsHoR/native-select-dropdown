# select-dropdown

A fully native, dependency-free HTML dropdown component.

- Works with plain HTML and JavaScript — **no libraries or frameworks required**.
- Distributed as a single JavaScript file or as an npm package.
- **Full CSS styling control** via shadow parts.
- Supports inner HTML content inside options.
- Keyboard accessible and lightweight.

---

## Example

```html
<select-dropdown>
    <select-option placeholder hidden>Choose an animal</select-option>
    <select-option>Dog</select-option>
    <select-option>Cat</select-option>
    <select-option disabled>Snake</select-option>
    <select-option>Panda</select-option>
</select-dropdown>
```

renders as:

[![localhost-9000.gif](https://i.postimg.cc/R0N6y2V5/localhost-9000.gif)](https://postimg.cc/FfXHJWLD)

---

# Installation

## Vanilla HTML / JS

Copy the `select-dropdown.js` file from the `src` folder and include it in your project.

```html
<script src="select-dropdown.js"></script>
```

## Node / npm

Install from npm:

```bash
npm install native-select-dropdown --save
```

Then import or require it:

```js
import 'native-select-dropdown'
// or
require('native-select-dropdown')
```

---

# Usage

After setup, you get three new HTML elements:  
`<select-dropdown>`, `<select-option>` and `<select-arrow>`.

They behave similarly to native `<select>` / `<option>`, but are fully stylable and accessible.

---

## `<select-dropdown>`

Defines a custom dropdown element.  
All its children must be `<select-option>` elements — non-option children are ignored.

### Attributes

#### `show-selected-on`
Controls how the selected option and placeholder behave when the dropdown opens.

- **`both`** (default) – the selected option appears both in the button and the options list.  
- **`button`** – the selected option is hidden from the list and shown only in the button.  
- **`list`** – when opened, the button shows the placeholder while the list shows the selected option.

#### `disabled`
Disables all user interaction.  
This is a boolean attribute: its mere presence disables the dropdown.  
By default, a disabled dropdown has `opacity: 0.5` (you can override this via CSS).

#### `display-search`
Controls when to show the built-in search box above the options list.

- If **absent**, the search box is hidden.
- If present **without value** (`display-search`), the search box is **always shown**.
- If present with a **numeric value** (`display-search="5"`), the search box is shown only if the dropdown has **at least that many visible options**.

Example:

```html
<select-dropdown display-search="3">
    <select-option placeholder hidden>Choose a fruit</select-option>
    <select-option>Apple</select-option>
    <select-option>Banana</select-option>
    <select-option>Cherry</select-option>
    <select-option>Mango</select-option>
</select-dropdown>
```

If there are 3 or more visible options, the search input appears automatically.  
Typing inside it will dynamically **filter** the visible options.

---

### Reading the value

```js
const dropdown = document.getElementById('my-select-dropdown')
console.log(dropdown.value)
```

- The returned value is always a **string**.
- If no custom `value` attribute is defined on the selected option, the `textContent` is used.
- If a placeholder is selected, the value is an empty string `""`.

---

### Setting the value

```js
const dropdown = document.getElementById('my-select-dropdown')
dropdown.value = 'Dog'
```

- The dropdown will select the option with matching `value` or text content.
- If no matching option exists, the assignment has no effect.

You can also set the value by adding the `selected` attribute directly to an option.

---

## `<select-option>`

Represents an option inside a dropdown.

### Attributes

- **`placeholder`** — marks this option as the placeholder (selected by default, empty value).  
- **`hidden`** — hides the option from the list (still selectable programmatically).  
- **`disabled`** — visible but not selectable.  
- **`value`** — sets a custom value for the option.  
- **`selected`** — marks it as selected (auto-managed by the component).  
- **`label`** — alternative text or HTML for the button when selected.  
- **`button-content`** — internal/advanced; used by the component to render button content.

---

## `<select-arrow>`

Defines an optional arrow displayed as part of the dropdown button.

### Attributes

- **`position`** – either `left` or `right` (default: `right`).

Example:

```html
<select-dropdown show-selected-on="button">
  <select-arrow position="left">🡇</select-arrow>
  <select-option placeholder hidden>Select Something</select-option>
  <select-option>One</select-option>
  <select-option>Two</select-option>
</select-dropdown>
```

---

# 🔍 Search Box

When visible (`display-search` active), a search bar appears above the options list.

### Structure

Inside the shadow DOM:

```html
<div part="search-box">
  <input type="search" part="search-input" />
  <button part="search-x">✕</button>
</div>
```

### Behavior

- Typing filters the options in real time.  
- Filtering compares both the option’s `label` attribute and its visible text content (case-insensitive).  
- The ✕ button clears the filter.  
- The native clear button in `<input type="search">` also triggers filtering (via `search` event).  
- The search box is **fully themeable** via `::part()`.

### Parts available for styling

| Part | Description |
|------|--------------|
| `search-box` | The container for the search bar |
| `search-input` | The `<input type="search">` element |
| `search-x` | The ✕ clear button |

Example CSS theme:

```css
.dark::part(search-box) {
  background: #333;
  padding: 6px;
  border-bottom: 1px solid #555;
}

.dark::part(search-input) {
  color: #eee;
  background: #222;
  border: none;
  border-bottom: 1px solid #555;
}

.dark::part(search-x) {
  color: #ccc;
  background: transparent;
  cursor: pointer;
}
```

---

# Styling

See below for an overview of how to style the dropdown globally or with custom themes.

## Styling using classes

Because the component uses Shadow DOM, you can customize it using the [`::part()`](https://developer.mozilla.org/en-US/docs/Web/CSS/::part) pseudo-element.

Example dark theme:

```css
.dark {
  font-family: monospace;
}

.dark::part(button) {
  border: 2px solid #000;
  background: #3d3d3d;
  color: #05ff86;
  box-shadow: none;
  border-radius: 0;
}

.dark::part(button):focus-visible {
  outline: 2px solid #37d85a;
}

.dark::part(options) {
  background: #3d3d3d;
  padding: 10px;
  border: 2px solid #000;
  margin-top: 10px;
}

.dark select-option {
  background: #1b1b1a;
  color: #c8c8c8;
  border: 0;
}

.dark select-option[pre-selected],
.dark select-option:focus-within {
  color: #05ff86;
}

.dark select-option[disabled] {
  color: #92908c;
  text-decoration: line-through;
}

.dark select-option[selected] {
  color: #05ff86;
  font-weight: 800;
}
```

---

# Using HTML content in options

`<select-option>` supports arbitrary HTML inside, e.g.:

```html
<select-dropdown show-selected-on="list">
  <select-option placeholder hidden>Choose your Arthur</select-option>
  <select-option>
    <div><img src="arthur-1.jpg" />Arthur 1</div>
  </select-option>
  <select-option>
    <div><img src="arthur-2.jpg" />Arthur 2</div>
  </select-option>
</select-dropdown>
```

---

# License

MIT License — © [LaNsHoR](https://github.com/LaNsHoR)
