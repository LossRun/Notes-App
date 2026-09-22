# 📝 Notes App — High-Performance Offline Note Manager

<p align="center">
  <img src="assets/icon.png" width="140" height="140" style="border-radius: 28px; box-shadow: 0 16px 40px rgba(0,0,0,0.6);" alt="App Logo">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-Completed-success.svg" alt="Status">
  <img src="https://img.shields.io/badge/platform-web%20%7C%20mobile-blue.svg" alt="Platform">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/language-JavaScript-yellow.svg" alt="Language">
</p>

---

## 🚀 Executive Summary & Architecture

    The Notes App is an elite, offline-first mobile and desktop note-taking web application built from the ground up with vanilla HTML5, CSS3, and modern JavaScript. It features an obsidian-and-slate monochrome palette, Apple/OneUI-grade fluid motion curves, tactile micro-spring feedback, and native Android/iOS keyboard synchronization.

---

## 🌟 Comprehensive Feature Matrix & Tagging Matrix

### 1. Lightning-Fast Local Storage & Auto-Saving
    * **Instant Persistence:** Every keystroke, title modification, and checklist toggle is instantly saved to localStorage via an automated, debounced pipeline. No annoying "Save" buttons required.
    * **Backup & Restore Archives:** Export your entire notes database into a structured .json archive file for safe keeping, and restore your notes seamlessly using the built-in file import handler inside Settings.
    * **Tags:** `#storage` `#autosave` `#json` `#python` `#javascript`

### 2. Rich Text Formatting Engine & Keyboard Focus Guard
    * **Active Toolbar States:** Instant text formatting controls for Bold (B), Italic (I), and Strikethrough (S). When formatting is active on the current selection, toolbar buttons light up with clear background highlights and accent rings.
    * **Absolute Keyboard Focus Guard:** Engineered with touch/pointer event interception (pointerdown and touchstart with preventDefault()), ensuring your mobile virtual keyboard never dismisses when tapping formatting chips, checklists, or menu items.
    * **Interactive Checklists:** Easily insert and manage interactive to-do task items with dynamic strikethrough styling upon completion.
    * **Timestamps:** One-tap insertion of current time stamps (⏱) for quick logging.
    * **Tags:** `#formatting` `#keyboard` `#checklists` `#rust` `#cpp`

### 3. Advanced Typography & Offline LaTeX Math Support
    * **KaTeX Mathematics Integration:** Offline-capable KaTeX math rendering allowing users to write inline formulas (e.g., $E = mc^2$) and structured math layouts cleanly.
    * **Clean Markdown Shortcuts:** Real-time text parsing for headers, bullet points, and dynamic hashtag extraction.
    * **Tags:** `#typography` `#latex` `#markdown` `#math`

### 4. Command Palette & Quick Navigation
    * **Universal Command Launcher (Ctrl + K or Cmd + K):** Trigger a global command search modal from anywhere in the application to instantly jump to notes, create a new entry, toggle themes, or switch views.
    * **Smart Hashtag Filtering:** Dynamically extracts hashtags (e.g., `#ideas`, `#todo`, `#work`) from note titles and content, auto-generating clean filter chips on the home dashboard.
    * **Pinned Notes & Grid/List Toggling:** Pin critical thoughts to the top of your workspace and toggle fluidly between a dual-column Bento card grid and a streamlined single-column list layout.
    * **Tags:** `#commands` `#navigation` `#filtering` `#ruby` `#java`

### 5. Dedicated Recycle Bin & Read-Only Viewer
    * **Safety Net:** Deleted items are sent safely to the Recycle Bin rather than being instantly destroyed.
    * **Read-Only Previewer:** Click on any trashed note to inspect its contents in a clean preview window before choosing to Restore or Delete Forever.
    * **Batch & Global Actions:** Restore individual items, wipe single notes permanently, or clear the entire recycle bin with confirmation security dialogues.
    * **Tags:** `#recyclebin` `#safety` `#recovery` `#sql`

### 6. Premium Fluid Motion & Interface Aesthetics
    * **Tactile Micro-Spring Feedback:** Buttons, navigation elements, and note cards physically depress slightly on touch (transform: scale(0.97)), mimicking physical objects responding to human touch.
    * **Dynamic Keyboard Dock Synchronization:** Utilizes the modern window.visualViewport API to track virtual keyboard resizing in real time, keeping the formatting dock pinned perfectly above the keyboard.
    * **Ambient Focus Dimming:** When actively typing inside the editor, non-essential interface chrome dims down smoothly by opacity to allow deep focus, instantly re-illuminating upon inactivity.
    * **Master Animation Toggle:** A dedicated switch in Settings to instantly disable or re-enable all layout and transition animations.
    * **Tags:** `#ui` `#animations` `#glassmorphism` `#css` `#html`

---

## 📱 Visual Previews & Interface Layout

### Workspace Dashboard Interface
<div align="center">
  <img src="https://images.unsplash.com/photo-1517842645767-c639042777db?w=700&auto=format&fit=crop&q=80" alt="Workspace Stream Preview" style="border-radius: 18px; border: 1px solid rgba(255,255,255,0.12); width: 100%; max-width: 650px;">
</div>
*Clean bento grid view featuring high horizontal margins, clean typography, and zero visual clutter.*

### Distraction-Free Editor View
<div align="center">
  <img src="https://images.unsplash.com/photo-1584697964190-de959aab4462?w=700&auto=format&fit=crop&q=80" alt="Editor Workspace Preview" style="border-radius: 18px; border: 1px solid rgba(255,255,255,0.12); width: 100%; max-width: 650px;">
</div>
*Obsidian-and-slate monochrome layout with auto-saving, live metadata stats, and synchronized keyboard formatting strip.*

---

## 💡 Advanced Usage Guide & Tips

    * **Organizing with Tags:** Simply type hashtags like `#work`, `#personal`, or `#urgent` anywhere in your note titles or note contents. The app will automatically parse them and populate smart filter chips on the home dashboard view. (`#tips` `#organization`)
    * **Executing Commands:** Press `Ctrl + K` (Windows/Linux) or `Cmd + K` (Mac) at any time to open the Command Palette. You can instantly search through all your notes by name or run system commands. (`#shortcuts` `#workflow`)
    * **Recycle Bin Recovery:** If you delete a note, it moves securely to the Recycle Bin. Open Settings and click "Recently deleted" to view items, inspect them via the read-only previewer, and choose whether to restore them. (`#recovery` `#trash`)

---

## ⌨️ Keyboard Shortcuts Reference

| Action | Shortcut Key |
| :--- | :--- |
| **Command Palette** | `Ctrl + K` or `Cmd + K` |
| **New Line / Break** | `Enter` |
| **Escape / Shift Break** | `Shift + Enter` |

---

## 🛠 File Structure & Installation

Ensure your local directory (e.g., `/sdcard/Notes-App`) contains these required files:
1. `index.html` — Document structure and semantic view sections.
2. `style.css` — Design system, themes, animations, and grid layout rules.
3. `app.js` — Application state, storage handlers, and event orchestration.
4. `codeEngine.js` — Lexical definitions and formatting utility modules.
5. `assets/icon.png` — High-resolution application visual asset.

Open `index.html` in any modern web browser or local server environment to launch.

---

## 📄 License

Distributed under the MIT License. See project repository instructions for more information.
