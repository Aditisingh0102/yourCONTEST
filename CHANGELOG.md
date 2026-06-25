# 📋 yourCONTEST — Change Log

> **Purpose:** This document tracks every significant code change made to the project, including the file path, line numbers, old → new code, and the reason behind each change. Updated with every commit.

---

## 🔖 [2026-06-26] — Dark Mode Theme Toggle Fix

**Commit:** `d023d20`  
**Branch:** `main`  
**Author:** Antigravity AI  
**Summary:** The theme toggle button existed in the Navbar but dark mode wasn't working because `darkMode: 'class'` was missing from the Tailwind config. Additionally, the Navbar, Sidebar, and Sidebar1 components had no `dark:` variant classes, so their backgrounds, borders, and text stayed in light-mode styling when the theme was toggled.

---

### 1. `frontend/tailwind.config.js`

| Line | Old Code | New Code | Reason |
|------|----------|----------|--------|
| 2–3 | `export default {` ➜ `content: [` | `export default {` ➜ `darkMode: 'class',` ➜ `content: [` | **Root cause fix.** Without `darkMode: 'class'`, Tailwind ignores all `dark:` prefix utilities. Adding this enables class-based dark mode toggling via the `.dark` class on `<html>`. |

---

### 2. `frontend/src/components/Navbar.jsx`

| Line | Element | Old Class | New Class | Reason |
|------|---------|-----------|-----------|--------|
| 9 | Container `<div>` | `bg-white border-b border-gray-200` | `bg-white dark:bg-[#0f172a] border-b border-gray-200 dark:border-gray-700` | Dark background + border for the top navbar |
| 14 | Hamburger `<button>` | `text-gray-500 hover:bg-gray-100` | `text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700` | Visible icon + hover in dark mode |
| 24 | Logo divider `<div>` | `sm:border-gray-300` | `sm:border-gray-300 dark:sm:border-gray-600` | Subtle divider line in dark mode |
| 25 | Platform title `<span>` | `text-gray-800` | `text-gray-800 dark:text-gray-100` | Readable title text in dark mode |
| 26 | Portal subtitle `<span>` | `text-gray-500` | `text-gray-500 dark:text-gray-400` | Readable subtitle in dark mode |
| 65 | Bell `<button>` | `text-gray-400 hover:bg-gray-100` | `text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700` | Bell icon visibility in dark mode |
| 71 | Avatar `<img>` | `border-gray-200` | `border-gray-200 dark:border-gray-600` | Avatar border contrast in dark mode |
| 73 | User name `<p>` | `text-gray-800` | `text-gray-800 dark:text-gray-100` | Readable user name in dark mode |
| 74 | User role `<p>` | `text-gray-500` | `text-gray-500 dark:text-gray-400` | Readable role label in dark mode |

---

### 3. `frontend/src/components/Sidebar.jsx`

| Line | Element | Old Class | New Class | Reason |
|------|---------|-----------|-----------|--------|
| 109 | Sidebar container | `bg-white border-r border-gray-200` | `bg-white dark:bg-[#0f172a] border-r border-gray-200 dark:border-gray-700` | Dark sidebar background + border |
| 116 | Mobile header border | `border-b border-gray-100` | `border-b border-gray-100 dark:border-gray-700` | Visible mobile divider in dark mode |
| 121 | Mobile title | `text-gray-800` | `text-gray-800 dark:text-gray-100` | Readable title in dark mobile drawer |
| 125 | Close button | `hover:bg-gray-100 text-gray-400` | `hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500` | Visible close icon + hover in dark mode |
| 165 | Account section border | `border-t border-gray-100` | `border-t border-gray-100 dark:border-gray-700` | Bottom section divider in dark mode |
| 173 | Profile card container | `border-gray-100 hover:bg-slate-50 hover:border-blue-100` | `border-gray-100 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-800 hover:border-blue-100 dark:hover:border-gray-600` | Profile card dark mode interactivity |
| 182 | Avatar border (collapsed) | `border-gray-200` | `border-gray-200 dark:border-gray-600` | Avatar ring contrast |
| 184 | Online dot border (collapsed) | `border-white` | `border-white dark:border-gray-800` | Online dot blends with dark bg |
| 198 | Avatar border (expanded) | `border-gray-200` | `border-gray-200 dark:border-gray-600` | Avatar ring contrast |
| 200 | Online dot border (expanded) | `border-white` | `border-white dark:border-gray-800` | Online dot blends with dark bg |
| 203 | Profile name | `text-gray-800` | `text-gray-800 dark:text-gray-100` | Readable name in dark mode |
| 210 | Roll/Faculty ID | `text-gray-400` | `text-gray-400 dark:text-gray-500` | Readable ID in dark mode |
| 253 | Logout modal container | `bg-white border-gray-100` | `bg-white dark:bg-slate-800 border-gray-100 dark:border-gray-700` | Dark modal background |
| 254 | Modal title | `text-gray-900` | `text-gray-900 dark:text-white` | Readable modal title |
| 255 | Modal description | `text-gray-500` | `text-gray-500 dark:text-gray-400` | Readable modal text |
| 260 | Cancel button | `bg-white text-gray-700 border-gray-200` | `bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600` | Visible cancel button in dark mode |

---

### 4. `frontend/src/components/Sidebar1.jsx`

> **Note:** Sidebar1.jsx received identical changes to Sidebar.jsx since both components share the same structure. All line-level changes listed above for Sidebar.jsx apply to Sidebar1.jsx at corresponding line numbers (offset by ~3 lines).

| Line | Element | Change | Reason |
|------|---------|--------|--------|
| 106 | Sidebar container | Added `dark:bg-[#0f172a] dark:border-gray-700` | Dark sidebar background |
| 113 | Mobile header | Added `dark:border-gray-700` | Mobile divider |
| 118 | Mobile title | Added `dark:text-gray-100` | Readable title |
| 122 | Close button | Added `dark:hover:bg-gray-700 dark:text-gray-500 dark:hover:text-gray-300` | Visible close icon |
| 162 | Account border | Added `dark:border-gray-700` | Bottom divider |
| 169 | Profile card | Added `dark:border-gray-700 dark:hover:bg-gray-800 dark:hover:border-gray-600` | Profile card interactivity |
| 178 | Avatar border | Added `dark:border-gray-600` | Avatar ring |
| 180 | Online dot | Added `dark:border-gray-800` | Dot blending |
| 194 | Avatar border | Added `dark:border-gray-600` | Avatar ring |
| 196 | Online dot | Added `dark:border-gray-800` | Dot blending |
| 199 | Profile name | Added `dark:text-gray-100` | Readable name |
| 206 | Roll/Faculty ID | Added `dark:text-gray-500` | Readable ID |
| 249 | Logout modal | Added `dark:bg-slate-800 dark:border-gray-700` | Dark modal |
| 250 | Modal title | Added `dark:text-white` | Readable title |
| 251 | Modal text | Added `dark:text-gray-400` | Readable text |
| 256 | Cancel button | Added `dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600` | Visible button |

---

## 📝 Template for Future Entries

```markdown
## 🔖 [YYYY-MM-DD] — Short Description

**Commit:** `hash`  
**Branch:** `branch-name`  
**Author:** Name  
**Summary:** Brief explanation of what changed and why.

---

### File: `path/to/file`

| Line | Element | Old Code / Class | New Code / Class | Reason |
|------|---------|------------------|------------------|--------|
| XX   | ...     | ...              | ...              | ...    |
```
