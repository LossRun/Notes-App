// --- State Management ---
let notes = [];
let activeNoteId = null;
let currentPreviewTrashId = null;
let activeFilter = 'all'; // 'all' | 'pinned' | tag
let savedSelectionRange = null;

let settings = {
  theme: 'dark',
  animations: true,
  viewMode: 'grid', // 'grid' | 'list'
  sortOrder: 'By modified'
};

// --- DOM References ---
const appRoot = document.documentElement;

// Screens
const listView = document.getElementById('list-view');
const editorView = document.getElementById('editor-view');
const settingsView = document.getElementById('settings-view');
const trashView = document.getElementById('trash-view');
const trashPreviewView = document.getElementById('trash-preview-view');

// Lists & Streams
const notesContainer = document.getElementById('notes-container');
const trashContainer = document.getElementById('trash-container');
const emptyState = document.getElementById('empty-state');
const trashEmptyState = document.getElementById('trash-empty-state');
const smartTagsBar = document.getElementById('smart-tags-bar');
const newNoteBtn = document.getElementById('new-note-btn');

// Search & Controls
const searchInput = document.getElementById('search-input');
const searchClearBtn = document.getElementById('search-clear-btn');
const homeMenuBtn = document.getElementById('home-menu-btn');
const homePopup = document.getElementById('home-popup');
const popBackup = document.getElementById('pop-backup');
const popTrash = document.getElementById('pop-trash');
const popSettings = document.getElementById('pop-settings');
const viewModeToggleBtn = document.getElementById('view-mode-toggle-btn');

// Command Palette
const cmdPaletteBtn = document.getElementById('cmd-palette-btn');
const cmdPaletteBackdrop = document.getElementById('cmd-palette-backdrop');
const cmdSearchInput = document.getElementById('cmd-search-input');
const cmdResults = document.getElementById('cmd-results');

// Editor Elements
const editorBackBtn = document.getElementById('editor-back-btn');
const editorPinBtn = document.getElementById('editor-pin-btn');
const editorOverflowBtn = document.getElementById('editor-overflow-btn');
const editorOverflowPopup = document.getElementById('editor-overflow-popup');
const noteTitle = document.getElementById('note-title');
const noteMetaSubtitle = document.getElementById('note-meta-subtitle');
const noteContent = document.getElementById('note-content');
const editorBottomStrip = document.getElementById('editor-bottom-strip');
const dockBtnChecklist = document.getElementById('dock-btn-checklist');
const dockBtnMath = document.getElementById('dock-btn-math');
const dockBtnClock = document.getElementById('dock-btn-clock');
const btnInsertMath = document.getElementById('btn-insert-math');
const btnExportMd = document.getElementById('btn-export-md');
const btnExportTxt = document.getElementById('btn-export-txt');
const btnDeleteActive = document.getElementById('btn-delete-active');

// Settings Elements
const settingsBackBtn = document.getElementById('settings-back-btn');
const switchTheme = document.getElementById('switch-theme');
const valThemeStatus = document.getElementById('val-theme-status');
const switchAnimations = document.getElementById('switch-animations');
const valAnimStatus = document.getElementById('val-anim-status');
const optListOrder = document.getElementById('opt-list-order');
const valListOrder = document.getElementById('val-list-order');
const optBackupExport = document.getElementById('opt-backup-export');
const optBackupImport = document.getElementById('opt-backup-import');
const settingsFileInput = document.getElementById('settings-file-input');

// Trash View Elements
const trashBackBtn = document.getElementById('trash-back-btn');
const trashEmptyAllBtn = document.getElementById('trash-empty-all-btn');
const trashPreviewBackBtn = document.getElementById('trash-preview-back-btn');
const trashPreviewTitle = document.getElementById('trash-preview-title');
const trashPreviewDate = document.getElementById('trash-preview-date');
const trashPreviewContent = document.getElementById('trash-preview-content');
const trashPreviewRestoreBtn = document.getElementById('trash-preview-restore-btn');
const trashPreviewDeleteBtn = document.getElementById('trash-preview-delete-btn');

// Confirmation Modal
const confirmBackdrop = document.getElementById('confirm-backdrop');
const confirmTitle = document.getElementById('confirm-title');
const confirmMessage = document.getElementById('confirm-message');
const confirmCancelBtn = document.getElementById('confirm-cancel-btn');
const confirmActionBtn = document.getElementById('confirm-action-btn');
let confirmCallback = null;

// --- Android Keyboard Viewport Tracking ---
function attachKeyboardTracker() {
  if (window.visualViewport) {
    const onViewportChange = () => {
      const keyboardOffset = Math.max(0, window.innerHeight - window.visualViewport.height);
      editorBottomStrip.style.transform = `translateY(-${keyboardOffset}px)`;
    };
    window.visualViewport.addEventListener('resize', onViewportChange);
    window.visualViewport.addEventListener('scroll', onViewportChange);
  }
}
attachKeyboardTracker();

// --- Absolute Keyboard Guard ---
document.querySelectorAll('.keyboard-guard').forEach((el) => {
  el.addEventListener('pointerdown', (e) => {
    saveSelection();
    e.preventDefault();
  });
  el.addEventListener('touchstart', (e) => {
    saveSelection();
  }, { passive: true });
});

function saveSelection() {
  const sel = window.getSelection();
  if (sel.rangeCount > 0) savedSelectionRange = sel.getRangeAt(0);
}

function restoreSelection() {
  if (savedSelectionRange) {
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(savedSelectionRange);
  }
}

// --- Screen Switching Coordinator ---
function switchScreen(screen) {
  [listView, editorView, settingsView, trashView, trashPreviewView].forEach((v) => {
    v.classList.remove('active');
  });
  screen.classList.add('active');
  closePopovers();
}

function closePopovers() {
  homePopup.classList.add('hidden');
  editorOverflowPopup.classList.add('hidden');
  cmdPaletteBackdrop.classList.add('hidden');
}

// --- Local Storage Management ---
function loadData() {
  const rawNotes = localStorage.getItem('zen_notes');
  notes = rawNotes ? JSON.parse(rawNotes) : [];
  const rawSettings = localStorage.getItem('zen_settings');
  if (rawSettings) settings = { ...settings, ...JSON.parse(rawSettings) };
  applySettings();
}

function saveData() {
  localStorage.setItem('zen_notes', JSON.stringify(notes));
  localStorage.setItem('zen_settings', JSON.stringify(settings));
}

function applySettings() {
  appRoot.setAttribute('data-theme', settings.theme);
  appRoot.setAttribute('data-animations', settings.animations ? 'true' : 'false');
  appRoot.setAttribute('data-view-mode', settings.viewMode);

  switchTheme.checked = (settings.theme === 'dark');
  valThemeStatus.textContent = settings.theme === 'dark' ? 'Dark mode active' : 'Light mode active';
  switchAnimations.checked = settings.animations;
  valAnimStatus.textContent = settings.animations ? 'Enabled (fluid transitions)' : 'Disabled (instant)';
  valListOrder.textContent = settings.sortOrder;
}

// --- Home Stream & Smart Tag Engine ---
function renderHome() {
  notesContainer.innerHTML = '';
  const query = searchInput.value.trim().toLowerCase();

  let list = notes.filter((n) => !n.isDeleted);

  // Extract Hashtags Dynamically
  const tagSet = new Set();
  list.forEach((n) => {
    const tags = ((n.title + ' ' + n.content).match(/#[\w-]+/g) || []);
    tags.forEach((t) => tagSet.add(t));
  });
  renderSmartTags(tagSet);

  if (activeFilter === 'pinned') {
    list = list.filter((n) => n.isPinned);
  } else if (activeFilter.startsWith('#')) {
    list = list.filter((n) => (n.title + ' ' + n.content).includes(activeFilter));
  }

  if (query) {
    list = list.filter((n) => (n.title || '').toLowerCase().includes(query) || (n.content || '').toLowerCase().includes(query));
  }

  // Sorting
  list.sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    if (settings.sortOrder === 'By modified') return b.updatedAt - a.updatedAt;
    return (a.title || '').localeCompare(b.title || '');
  });

  if (list.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');

  list.forEach((n) => {
    const card = document.createElement('div');
    card.className = 'note-card';

    const plain = (n.content || '').replace(/<[^>]*>/g, '').trim();
    card.innerHTML = `
      <div class="note-card-title">${escapeHtml(n.title || 'Untitled')}</div>
      ${plain ? `<div class="note-card-snippet">${escapeHtml(plain)}</div>` : ''}
      <div class="note-card-footer">
        <span>${formatDate(n.updatedAt)}</span>
        ${n.isPinned ? '<span class="note-card-pin">★</span>' : ''}
      </div>
    `;
    card.addEventListener('click', () => openEditor(n.id));
    notesContainer.appendChild(card);
  });
}

function renderSmartTags(tagSet) {
  smartTagsBar.innerHTML = `
    <button type="button" class="tag-chip ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">All</button>
    <button type="button" class="tag-chip ${activeFilter === 'pinned' ? 'active' : ''}" data-filter="pinned">Pinned</button>
  `;
  tagSet.forEach((t) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `tag-chip ${activeFilter === t ? 'active' : ''}`;
    btn.textContent = t;
    btn.dataset.filter = t;
    smartTagsBar.appendChild(btn);
  });

  smartTagsBar.querySelectorAll('.tag-chip').forEach((b) => {
    b.addEventListener('click', () => {
      activeFilter = b.dataset.filter;
      renderHome();
    });
  });
}

// Search Inputs
searchInput.addEventListener('input', () => {
  searchClearBtn.classList.toggle('hidden', searchInput.value.length === 0);
  renderHome();
});

searchClearBtn.addEventListener('click', () => {
  searchInput.value = '';
  searchClearBtn.classList.add('hidden');
  searchInput.focus();
  renderHome();
});

viewModeToggleBtn.addEventListener('click', () => {
  settings.viewMode = settings.viewMode === 'grid' ? 'list' : 'grid';
  saveData();
  applySettings();
});

// --- Command Palette (Ctrl+K) ---
cmdPaletteBtn.addEventListener('click', openCmdPalette);
window.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    openCmdPalette();
  }
});

function openCmdPalette() {
  cmdSearchInput.value = '';
  cmdPaletteBackdrop.classList.remove('hidden');
  cmdSearchInput.focus();
  renderCmdResults();
}

cmdSearchInput.addEventListener('input', () => renderCmdResults(cmdSearchInput.value.trim().toLowerCase()));

function renderCmdResults(q = '') {
  cmdResults.innerHTML = '';
  const commands = [
    { label: 'Create New Note', act: () => { closePopovers(); openEditor(); } },
    { label: 'Toggle Dark / Light Theme', act: () => { switchTheme.click(); } },
    { label: 'Open Settings', act: () => { switchScreen(settingsView); } },
    { label: 'Open Recycle Bin', act: () => { openTrash(); } }
  ];

  commands.filter((c) => c.label.toLowerCase().includes(q)).forEach((c) => {
    const item = document.createElement('div');
    item.className = 'cmd-item';
    item.textContent = c.label;
    item.addEventListener('click', () => { closePopovers(); c.act(); });
    cmdResults.appendChild(item);
  });

  notes.filter((n) => !n.isDeleted && ((n.title || '').toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q))).slice(0, 5).forEach((n) => {
    const item = document.createElement('div');
    item.className = 'cmd-item';
    item.textContent = 'Note: ' + (n.title || 'Untitled');
    item.addEventListener('click', () => { closePopovers(); openEditor(n.id); });
    cmdResults.appendChild(item);
  });
}

cmdPaletteBackdrop.addEventListener('click', (e) => {
  if (e.target === cmdPaletteBackdrop) cmdPaletteBackdrop.classList.add('hidden');
});

// --- Editor Operations & Auto-Save ---
function openEditor(id = null) {
  switchScreen(editorView);

  if (id) {
    activeNoteId = id;
    const note = notes.find((n) => n.id === id);
    if (note) {
      noteTitle.value = note.title;
      noteContent.innerHTML = note.content;
      renderMathElements();
      updateEditorSubtitle(note.updatedAt, note.content);
      editorPinBtn.querySelector('.pin-icon').classList.toggle('pinned', !!note.isPinned);
    }
  } else {
    const newNote = {
      id: Date.now().toString(),
      title: '',
      content: '',
      isPinned: false,
      isDeleted: false,
      updatedAt: Date.now()
    };
    notes.unshift(newNote);
    activeNoteId = newNote.id;
    noteTitle.value = '';
    noteContent.innerHTML = '';
    updateEditorSubtitle(newNote.updatedAt, '');
    editorPinBtn.querySelector('.pin-icon').classList.remove('pinned');
    saveData();
  }
}

function updateActiveNote() {
  if (!activeNoteId) return;
  const note = notes.find((n) => n.id === activeNoteId);
  if (!note) return;

  note.title = noteTitle.value.trim();
  note.content = noteContent.innerHTML;
  note.updatedAt = Date.now();
  updateEditorSubtitle(note.updatedAt, note.content);
  saveData();
}

noteTitle.addEventListener('input', updateActiveNote);

// Ambient Focus Dimming while typing
let typingTimer = null;
noteContent.addEventListener('input', () => {
  editorView.classList.add('deep-focus');
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    editorView.classList.remove('deep-focus');
  }, 1200);

  parseMarkdownTriggers();
  updateActiveNote();
});

// Instant Checklist on [] + Space
function parseMarkdownTriggers() {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  const node = sel.anchorNode;
  const text = node ? node.textContent : '';

  if (text && /(?:^|\s)\[\]$/.test(text)) {
    const range = sel.getRangeAt(0);
    range.setStart(node, text.lastIndexOf('[]'));
    range.deleteContents();
    const task = document.createElement('div');
    task.className = 'task-item';
    task.innerHTML = '<input type="checkbox"> <span></span>';
    range.insertNode(task);
  }
}

// LaTeX Auto-Renderer
function renderMathElements() {
  if (typeof katex === 'undefined') return;

  noteContent.querySelectorAll('.latex-inline').forEach((el) => {
    if (!el.dataset.rendered && el.dataset.tex) {
      try {
        katex.render(el.dataset.tex, el, { displayMode: false, throwOnError: false });
        el.dataset.rendered = 'true';
      } catch (err) {}
    }
  });
}

function updateEditorSubtitle(timestamp, html) {
  const d = new Date(timestamp);
  const plain = (html || '').replace(/<[^>]*>/g, '').trim();
  const words = plain ? plain.split(/\s+/).length : 0;
  noteMetaSubtitle.textContent = `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} • ${words} words`;
}

editorPinBtn.addEventListener('click', () => {
  if (!activeNoteId) return;
  const note = notes.find((n) => n.id === activeNoteId);
  if (note) {
    note.isPinned = !note.isPinned;
    editorPinBtn.querySelector('.pin-icon').classList.toggle('pinned', note.isPinned);
    saveData();
  }
});

editorBackBtn.addEventListener('click', () => { switchScreen(listView); renderHome(); });

// Formatting Commands
document.querySelectorAll('.dock-btn[data-cmd]').forEach((b) => {
  b.addEventListener('click', () => {
    restoreSelection();
    document.execCommand(b.dataset.cmd, false, null);
    updateActiveNote();
  });
});

dockBtnChecklist.addEventListener('click', () => {
  restoreSelection();
  document.execCommand('insertHTML', false, '<div class="task-item"><input type="checkbox"> <span>Task item</span></div><br>');
  updateActiveNote();
});

function insertMathFormula() {
  restoreSelection();
  const latexSpan = document.createElement('span');
  latexSpan.className = 'latex-inline';
  latexSpan.dataset.tex = 'E = mc^2';
  try {
    katex.render('E = mc^2', latexSpan, { throwOnError: false });
  } catch (e) {
    latexSpan.textContent = '$E = mc^2$';
  }
  const sel = window.getSelection();
  if (sel.rangeCount) {
    sel.getRangeAt(0).insertNode(latexSpan);
  }
  updateActiveNote();
}

dockBtnMath.addEventListener('click', insertMathFormula);
btnInsertMath.addEventListener('click', () => { closePopovers(); insertMathFormula(); });

dockBtnClock.addEventListener('click', () => {
  restoreSelection();
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  document.execCommand('insertText', false, ` ${time} `);
  updateActiveNote();
});

noteContent.addEventListener('change', (e) => {
  if (e.target.matches('.task-item input[type="checkbox"]')) {
    const parent = e.target.closest('.task-item');
    if (parent) {
      parent.classList.toggle('checked', e.target.checked);
      if (e.target.checked) e.target.setAttribute('checked', 'checked');
      else e.target.removeAttribute('checked');
      updateActiveNote();
    }
  }
});

// Three-Dots Menu
editorOverflowBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  editorOverflowPopup.classList.toggle('hidden');
});

btnExportMd.addEventListener('click', () => {
  closePopovers();
  if (!activeNoteId) return;
  const note = notes.find((n) => n.id === activeNoteId);
  const title = note.title || 'Untitled';
  const md = `# ${title}\n\n` + note.content.replace(/<[^>]*>/g, '\n');
  downloadBlob(md, `${title}.md`, 'text/markdown');
});

btnExportTxt.addEventListener('click', () => {
  closePopovers();
  if (!activeNoteId) return;
  const note = notes.find((n) => n.id === activeNoteId);
  const title = note.title || 'Untitled';
  downloadBlob(note.content.replace(/<[^>]*>/g, '\n'), `${title}.txt`, 'text/plain');
});

btnDeleteActive.addEventListener('click', () => {
  closePopovers();
  showConfirmation('Delete Note', 'Move this note to the recycle bin?', 'Move to bin', () => {
    const note = notes.find((n) => n.id === activeNoteId);
    if (note) {
      note.isDeleted = true;
      note.updatedAt = Date.now();
      saveData();
      switchScreen(listView);
      renderHome();
    }
  });
});

// --- Settings Screen Operations ---
homeMenuBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  homePopup.classList.toggle('hidden');
});

popSettings.addEventListener('click', () => {
  closePopovers();
  switchScreen(settingsView);
});

settingsBackBtn.addEventListener('click', () => {
  switchScreen(listView);
  renderHome();
});

switchTheme.addEventListener('change', (e) => {
  settings.theme = e.target.checked ? 'dark' : 'light';
  saveData();
  applySettings();
});

switchAnimations.addEventListener('change', (e) => {
  settings.animations = e.target.checked;
  saveData();
  applySettings();
});

optListOrder.addEventListener('click', () => {
  settings.sortOrder = settings.sortOrder === 'By modified' ? 'By title (A-Z)' : 'By modified';
  saveData();
  applySettings();
  renderHome();
});

optBackupExport.addEventListener('click', exportJsonFile);
popBackup.addEventListener('click', () => { closePopovers(); exportJsonFile(); });

optBackupImport.addEventListener('click', () => settingsFileInput.click());
settingsFileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const imp = JSON.parse(event.target.result);
      if (Array.isArray(imp)) {
        notes = imp;
        saveData();
        renderHome();
        showConfirmation('Restore Complete', 'Backup imported successfully.', 'OK', () => {});
      }
    } catch {
      showConfirmation('Error', 'Invalid backup JSON file.', 'OK', () => {});
    }
  };
  reader.readAsText(file);
});

function exportJsonFile() {
  const blob = new Blob([JSON.stringify(notes, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `notes_backup_${Date.now()}.json`, 'application/json');
}

// --- Recycle Bin & Read-Only Viewer ---
popTrash.addEventListener('click', () => {
  closePopovers();
  openTrash();
});

function openTrash() {
  switchScreen(trashView);
  renderTrash();
}

trashBackBtn.addEventListener('click', () => switchScreen(listView));

function renderTrash() {
  trashContainer.innerHTML = '';
  const trashed = notes.filter((n) => n.isDeleted);

  if (trashed.length === 0) {
    trashEmptyState.classList.remove('hidden');
    trashEmptyAllBtn.classList.add('hidden');
    return;
  }
  trashEmptyState.classList.add('hidden');
  trashEmptyAllBtn.classList.remove('hidden');

  trashed.forEach((n) => {
    const card = document.createElement('div');
    card.className = 'note-card';
    const plain = (n.content || '').replace(/<[^>]*>/g, '').trim();
    card.innerHTML = `
      <div class="note-card-title">${escapeHtml(n.title || 'Untitled')}</div>
      ${plain ? `<div class="note-card-snippet">${escapeHtml(plain)}</div>` : ''}
      <div class="note-card-footer">
        <span>Deleted: ${formatDate(n.updatedAt)}</span>
      </div>
    `;
    card.addEventListener('click', () => openTrashPreview(n.id));
    trashContainer.appendChild(card);
  });
}

function openTrashPreview(id) {
  currentPreviewTrashId = id;
  const note = notes.find((n) => n.id === id);
  if (!note) return;

  trashPreviewTitle.textContent = note.title || 'Untitled';
  trashPreviewDate.textContent = 'Deleted: ' + formatDate(note.updatedAt);
  trashPreviewContent.innerHTML = note.content || '<i>Empty note</i>';
  switchScreen(trashPreviewView);
}

trashPreviewBackBtn.addEventListener('click', () => switchScreen(trashView));

trashPreviewRestoreBtn.addEventListener('click', () => {
  if (!currentPreviewTrashId) return;
  const note = notes.find((n) => n.id === currentPreviewTrashId);
  if (note) {
    note.isDeleted = false;
    note.updatedAt = Date.now();
    saveData();
    switchScreen(trashView);
    renderTrash();
  }
});

trashPreviewDeleteBtn.addEventListener('click', () => {
  if (!currentPreviewTrashId) return;
  showConfirmation('Delete Forever', 'This note will be permanently removed. Proceed?', 'Delete', () => {
    notes = notes.filter((n) => n.id !== currentPreviewTrashId);
    saveData();
    switchScreen(trashView);
    renderTrash();
  });
});

trashEmptyAllBtn.addEventListener('click', () => {
  showConfirmation('Empty Trash', 'Permanently delete all items in Recycle Bin?', 'Wipe All', () => {
    notes = notes.filter((n) => !n.isDeleted);
    saveData();
    renderTrash();
  });
});

// --- Confirmation Modal Support ---
function showConfirmation(title, msg, btnText, onConfirm) {
  confirmTitle.textContent = title;
  confirmMessage.textContent = msg;
  confirmActionBtn.textContent = btnText || 'Confirm';
  confirmCallback = onConfirm;
  confirmBackdrop.classList.remove('hidden');
}

confirmCancelBtn.addEventListener('click', () => {
  confirmBackdrop.classList.add('hidden');
  confirmCallback = null;
});

confirmActionBtn.addEventListener('click', () => {
  confirmBackdrop.classList.add('hidden');
  if (confirmCallback) confirmCallback();
});

// --- Helpers ---
function downloadBlob(content, filename, type) {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

newNoteBtn.addEventListener('click', () => openEditor());

// Boot Application
loadData();
renderHome();
