/* =====================================================================
   RITAR APPEN (Claude Desktop, mörkt läge) som HTML.
   Etiketter och platshållare följer skärmbilderna, se notes/handoff.md avsnitt 7.
   ===================================================================== */
const ICONS = {
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4-4"/>',
  projects: '<rect x="4" y="9" width="16" height="11" rx="1"/><path d="M6 6h12M8 3h8"/>',
  artifacts: '<rect x="4" y="4" width="10" height="14" rx="1"/><path d="M14 7h4a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8"/>',
  clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
  palette: '<path d="M12 4a8 8 0 1 0 0 16c1.5 0 1.5-1.5.8-2.3-.7-.9-.2-2.2 1-2.2H16a4 4 0 0 0 4-4c0-4.1-3.6-7.5-8-7.5z"/><circle cx="8" cy="11" r="1"/><circle cx="12" cy="8" r="1"/>',
  bag: '<rect x="3" y="8" width="18" height="12" rx="1"/><path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  lock: '<rect x="5" y="10.5" width="14" height="9.5" rx="1"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
  pin: '<path d="M9 3h6l-1 6 4 4H6l4-4z"/><path d="M12 13v8"/>',
  dots: '<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  down: '<path d="M7 10l5 5 5-5"/>',
  chat: '<path d="M5 19l1.4-3.6A7.5 7.5 0 1 1 9.2 19.8z"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  min: '<path d="M5 12h14"/>',
  max: '<rect x="6" y="6" width="12" height="12"/>',
  menu: '<path d="M4 7h16M4 12h11M4 17h16"/>',
  panel: '<rect x="4" y="5" width="16" height="14" rx="1"/><path d="M9 5v14"/>',
  back: '<path d="M15 6l-6 6 6 6"/>',
  fwd: '<path d="M9 6l6 6-6 6"/>',
  sort: '<path d="M8 4v16M4 8l4-4 4 4M16 20V4M12 16l4 4 4-4"/>',
  folder: '<path d="M3 6h6l2 2h10v11H3z"/>',
  folderAdd: '<path d="M3 7h6l2 2h10v10H3z"/><path d="M12 11.5v5M9.5 14h5"/>',
  building: '<rect x="4" y="4" width="10" height="16"/><path d="M14 10h6v10h-6M7 8h2M7 12h2M7 16h2"/>',
  skip: '<path d="M5 6l6 6-6 6M12 6l6 6-6 6"/>',
  file: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/>',
  code: '<path d="M9 8l-4 4 4 4M15 8l4 4-4 4"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  cursor: '<path d="M5 2.5l13.5 10.2-6 .9 3.3 6.6-2.6 1.3-3.3-6.6L5.5 19z"/>'
};
const ic = (name, cls = "") => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;

const PROJECT = "Exempel-bolaget";
const DESC = "Införande av nytt CRM. Scope, beslut och mötesanteckningar på ett ställe.";
const FILES = ["Scope.pdf", "Beslutslogg.docx"];
const TASK = { name: "Morgonkoll", when: "Daily 08:00" };
const crumbFor = (name) => `Projects<span class="sep">/</span><b>${name}</b>`;

const INSTR_SHORT = `Projektet gäller införandet av ett nytt CRM hos Exempel-bolaget.

Svara utifrån underlaget i Context. Räcker det inte, säg det i stället för att gissa.

Skriv kort och på svenska.`;

// Vad som redan finns i projektet när respektive scen börjar.
const STORY = {
  instructions: {},
  context: { instr: true },
  folder: { instr: true, files: true },
  work: { instr: true, files: true, folder: true },
  scheduled: { instr: true, files: true, folder: true },
  memory: { instr: true, files: true, folder: true, task: true },
  share: { instr: true, files: true, folder: true, task: true },
  recap: { instr: true, files: true, folder: true, task: true }
};

function fileRow(name) {
  return `<div class="w-file">${ic("file")}<span>${name}</span></div>`;
}
function folderRow() {
  return `<div class="w-file" data-verify="folder-added">${ic("folder")}<span>${PROJECT}</span></div>`;
}
function taskRow() {
  return `<div class="w-task" data-verify="scheduled-added">${ic("clock")}<span>${TASK.name}</span><em>${TASK.when}</em></div>`;
}

function sidebar(active) {
  const nav = [["New", "plus"], ["Search", "search"], ["Projects", "projects"], ["Artifacts", "artifacts"],
               ["Scheduled", "clock"], ["Design", "palette"], ["Customize", "bag"]];
  return `<aside class="w-side">
    <div class="w-side-top">${ic("menu")}${ic("panel")}${ic("back")}${ic("fwd", "dim")}<span class="w-mode">${ic("chat")}${ic("code")}</span></div>
    ${nav.map(([t, i]) => `<div class="w-nav${t === active ? " on" : ""}" data-t="nav-${t.toLowerCase()}">${ic(i)}${t}</div>`).join("")}
    <div class="w-side-label">Pinned ${ic("down", "tiny")}</div>
    <div class="w-nav">${ic("projects")}Kundportal</div>
    <div class="w-nav">${ic("projects")}Kvartalsrapport</div>
    <div class="w-side-label">Chats and tasks ${ic("down", "tiny")}</div>
    <div class="w-chat"><i></i>Sammanfatta mötesanteckningar</div>
    <div class="w-chat"><i></i>Utkast till offert</div>
    <div class="w-chat"><i></i>Frågor om integrationen</div>
    <div class="w-user"><span class="w-avatar"></span>Du <span class="w-muted">· Din organisation</span>${ic("down", "tiny")}</div>
  </aside>`;
}

function topbar(crumb) {
  return `<div class="w-top${crumb ? "" : " flat"}"><div class="w-crumb">${crumb}</div>
    <div class="w-winctl">${ic("min")}${ic("max")}${ic("x")}</div></div>`;
}

function projectsPage() {
  const cards = [["Kundportal", "2 days ago"], ["Kvartalsrapport", "5 days ago"]];
  return `<div class="w-projects" data-screen="projects">
    <h1>Projects</h1>
    <div class="w-ptabs"><span class="on">Your projects</span><span>Organization</span><span>Shared with you</span>
      <div class="w-ptools">${ic("search")}${ic("sort")}<span class="w-btn-light" data-t="new-project">New project</span></div></div>
    <div class="w-pgrid">${cards.map(([n, t]) =>
      `<div class="w-pcard"><span class="w-pico">${ic("projects")}</span><div><b>${n}</b><span>${t}</span></div>${ic("pin", "pinned")}</div>`).join("")}
    </div></div>`;
}

function projectPage({ hidden = false, desc = DESC, state = {} } = {}) {
  const instrText = state.instr ? INSTR_SHORT.split("\n")[0] : "Add instructions to tailor Claude’s responses";
  return `<div class="w-project" data-screen="project"${hidden ? " hidden" : ""}>
    <div class="w-phead">
      <div><div class="w-ptitle">${PROJECT}</div>
        <div class="w-pmeta">Created by you <span>·</span> ${ic("lock")} Private</div>
        <div class="w-pdesc">${desc}</div></div>
      <div class="w-pact">${ic("pin")}<span class="w-share" data-t="share">${ic("lock")}Share</span>${ic("dots")}</div>
    </div>
    <div class="w-pbody">
      <div class="w-left">
        <div class="w-composer" data-t="composer">
          <div class="w-draft ph" data-t="composer-text" data-ph="How can I help you today?"></div>
          <div class="w-crow">${ic("plus")}
            <span class="w-seg" data-t="mode"><span data-t="mode-chat">Chat</span><span class="on" data-t="mode-cowork">Cowork</span></span>
            <span class="w-model">Opus 5.5<i>Medium</i></span>${ic("mic")}${ic("down", "tiny")}</div>
        </div>
        <div class="w-under"><span data-t="add-folder">Add folder</span><span data-t="manual">Manual</span></div>
        <div class="w-tabs"><span class="on">Chats and tasks</span><span>Activity</span>
          <span class="w-private" data-t="private-note">${ic("lock")}All chats are private unless shared</span></div>
        <div class="w-empty">${ic("chat")}<p>Give Claude a task and it’ll pick up your project context automatically.</p></div>
      </div>
      <div class="w-right">
        <div class="w-sec" data-t="instructions">
          <div class="w-sec-row"><b>Instructions</b><span class="w-plus" data-t="instr-add">${ic("plus")}</span></div>
          <p data-t="instr-sub"${state.instr ? ' data-verify="instructions-saved"' : ""}>${instrText}</p></div>
        <div class="w-sec" data-t="memory">
          <div class="w-sec-row"><b>Memory</b><span class="w-sec-tools"><span class="w-chip" data-t="memory-only">${ic("lock")}Only you</span><span class="w-link" data-t="view-memory">View memory</span></span></div>
          <p>Project memory will show here after a few chats.</p></div>
        <div class="w-sec" data-t="context">
          <div class="w-sec-row"><b>Context</b><span class="w-plus" data-t="context-add">${ic("plus")}</span></div>
          <div class="w-files" data-t="files" data-verify="context-files">${state.files ? FILES.map(fileRow).join("") : ""}</div>
          ${state.files ? "" : `<div class="w-drop"><div class="w-docs"><span></span><span></span><span class="big"></span></div>
            <p>Add PDFs, documents, or other text to reference in this project.</p></div>`}</div>
        <div class="w-sec" data-t="folder">
          <div class="w-sec-row"><b>Folder</b><span class="w-sec-tools"><span class="w-chip" data-t="folder-only">${ic("lock")}Only you</span><span class="w-plus" data-t="folder-add">${ic("plus")}</span></span></div>
          <div data-t="folder-slot">${state.folder ? folderRow() : "<p>Add a folder on this computer for Claude to work in.</p>"}</div></div>
        <div class="w-sec" data-t="scheduled">
          <div class="w-sec-row"><b>Scheduled</b><span class="w-plus" data-t="sched-add">${ic("plus")}</span></div>
          <div data-t="sched-slot">${state.task ? taskRow() : "<p>Set up recurring tasks for this project.</p>"}</div></div>
      </div>
    </div></div>`;
}

function createModal() {
  return `<div class="w-overlay" data-modal="create" hidden><div class="w-modal w-create">
    <div class="w-mhead"><b>Create a project</b>${ic("x")}</div>
    <label>What are you working on?</label>
    <div class="w-input focus ph" data-t="name" data-ph="Name your project"></div>
    <label>What are you trying to achieve?</label>
    <div class="w-input area ph" data-t="desc" data-ph="Describe your project, goals, subject, etc..."></div>
    <div class="w-usefolder">${ic("folderAdd")}Use a folder</div>
    <label>Visibility</label>
    <div class="w-radio" data-t="vis-org"><i></i><div><b>${ic("building")}Din organisation</b><span>Everyone in your organization can view and use this project</span></div></div>
    <div class="w-radio on" data-t="vis-private"><i></i><div><b>${ic("lock")}Private</b><span>Only invited members can view and use this project</span></div></div>
    <div class="w-mfoot"><span class="w-btn-dark">Cancel</span><span class="w-btn-light" data-t="create-btn">Create project</span></div>
  </div></div>`;
}

function instructionsModal() {
  return `<div class="w-overlay" data-modal="instr" hidden><div class="w-modal w-instr">
    <b class="w-mtitle">Set project instructions</b>
    <p class="w-mdesc">Provide Claude with relevant instructions and information for chats within ${PROJECT}. This will work alongside your <u>profile instructions</u> and the selected style in a chat.</p>
    <div class="w-input big ph" data-t="instr-text" data-ph="Think step by step and show reasoning for complex problems. Use specific examples."></div>
    <div class="w-mfoot"><span class="w-btn-dark">Cancel</span><span class="w-btn-light off" data-t="instr-save">Save instructions</span></div>
  </div></div>`;
}

function scheduledModal() {
  return `<div class="w-overlay" data-modal="sched" hidden><div class="w-modal w-sched">
    <div class="w-mhead"><b>New scheduled task</b>${ic("x")}</div>
    <label>Name</label>
    <div class="w-input ph" data-t="sched-name" data-ph="Daily briefing"></div>
    <div class="w-taskbox">
      <div class="w-input bare ph" data-t="sched-text" data-ph="Give instructions for how you want this task to go"></div>
      <div class="w-taskbar"><span data-t="auto-approve">${ic("skip")}Automatically approve ${ic("down", "tiny")}</span><span>Default model ${ic("down", "tiny")}</span></div>
    </div>
    <div class="w-info">For this task, Claude will work and use connectors without pausing for approval. <u>See safe use tips</u></div>
    <div class="w-trigger" data-t="trigger"><b>Trigger</b><span class="w-pill">${ic("clock")}Schedule ${ic("down", "tiny")}</span><span class="w-pill">Daily ${ic("down", "tiny")}</span><span class="w-time" data-t="time">09:28</span></div>
    <div class="w-adv">Advanced settings ${ic("down")}</div>
    <div class="w-mfoot"><span class="w-btn-dark">Cancel</span><span class="w-btn-light" data-t="sched-create">Create</span></div>
  </div></div>`;
}

// Byggd efter skärmdump av delningsrutan. VERIFY: share-after-typing (vad som visas när man skrivit ett namn).
function shareModal() {
  return `<div class="w-overlay" data-modal="share" hidden><div class="w-modal w-sharem">
    <div class="w-mhead"><b>Share “${PROJECT}”</b>${ic("x")}</div>
    <label>Add people by email</label>
    <div class="w-input ph" data-t="share-input" data-ph="Search by name or email..."></div>
    <label>People with access</label>
    <div class="w-person" data-t="people"><span class="w-initials">AL</span>
      <div><b>Alex Lindqvist <span class="w-muted">(you)</span></b><span>alex@exempel.se</span></div><em>Owner</em></div>
    <label>General access</label>
    <div class="w-access" data-t="general-access" data-verify="general-access">${ic("lock")}<b>Only people invited</b>${ic("down", "tiny")}</div>
    <div class="w-mfoot"><span class="w-btn-dark w-copylink">${ic("link")}Copy link</span><span class="w-btn-dark off" data-t="share-send">Share</span></div>
  </div></div>`;
}

function frame({ side = null, crumb = "", body = "", modals = "" }) {
  return `<div class="w-win">${side ? sidebar(side) : ""}<div class="w-main">${topbar(crumb)}<div class="w-content">${body}</div></div>${modals}</div>`;
}


const OVERLAY = `<div class="g-ring" hidden></div><div class="g-ripple"></div><div class="g-note" hidden></div>
  <div class="g-cursor"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS.cursor}</svg></div>`;
