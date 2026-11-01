/* =====================================================================
   SIDANS ANIMATIONER
   1. Scener       scenes = { namn: { w, h, build, run } }
                   build() ritar startläget, run(h) spelar upp animationen.
                   h.say("...") skriver bildtexten under bilden.
   2. Spelaren     spelar en scen i loop medan den syns, med Pausa/Spela.
   3. Demon        "Det här får Claude med sig", i kapitlet Varför.
   4. Sidan        skenan som följer med och kopieringsknappen.

   Bygger på app.js (sidebar, projectPage, modalerna, frame, OVERLAY, STORY).

   ATT KONTROLLERA MOT APPEN (sök efter VERIFY och data-verify):
   - new-chat-screen      hur en tom chatt utanför projekt ser ut
   - instructions-saved   vad Instructions-rutan visar efter att du sparat
   - context-files        hur uppladdade filer visas under Context
   - folder-added         hur Folder-rutan ser ut när en mapp är vald
   - scheduled-added      hur Scheduled-rutan ser ut när ett jobb finns
   - share-after-typing   vad som visas när man skrivit ett namn i Share
   - general-access       vilka val som finns under General access
   ===================================================================== */
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const CANCEL = Symbol("cancel");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const toSelector = (t) => /^[\w-]+$/.test(t) ? `[data-t="${t}"]` : t;

// VERIFY: new-chat-screen. Ritad utan skärmbild: tom chatt med rutan i mitten.
function newChatPage() {
  return `<div class="w-newchat" data-verify="new-chat-screen">
    <div class="w-composer w-composer-center">
      <div class="w-draft ph" data-ph="How can I help you today?"></div>
      <div class="w-crow">${ic("plus")}<span class="w-model">Opus 5.5<i>Medium</i></span>${ic("mic")}${ic("down", "tiny")}</div>
    </div>
  </div>`;
}

const PAGE = { w: 1000, h: 690 };
const pageFor = (scene, modals = "") =>
  frame({ crumb: crumbFor(PROJECT), body: projectPage({ state: STORY[scene] }), modals });


/* =====================================================================
   1. SCENER
   ===================================================================== */
const scenes = {
  create: {
    w: 1200, h: 740,
    build: () => frame({ side: "Projects", body: projectsPage() + projectPage({ hidden: true, desc: "" }), modals: createModal() }),
    async run(h) {
      await h.wait(500);
      await h.move("nav-projects");
      h.say("Projects hittar du i menyn till vänster.");
      await h.click();
      await h.wait(900);
      await h.move("new-project");
      h.say("New project ligger uppe till höger.");
      await h.wait(500);
      await h.click();
      h.show('[data-modal="create"]');
      await h.wait(500);
      h.say("Ge projektet ett namn som kollegorna känner igen direkt.");
      await h.move("name");
      await h.type("name", PROJECT, 45);
      await h.wait(400);
      h.cls("name", "focus", false);
      h.cls("desc", "focus", true);
      h.say("En rad om vad projektet ska hjälpa till med räcker.");
      await h.move("desc");
      await h.type("desc", DESC, 18);
      await h.wait(500);
      await h.move("vis-private");
      h.say("Private är förvalt. Bara du och de du bjuder in kommer åt projektet.");
      await h.wait(2400);
      await h.move("create-btn");
      h.say("Klicka på Create project.");
      await h.wait(500);
      await h.click();
      h.hide('[data-modal="create"]');
      h.hide('[data-screen="projects"]');
      h.show('[data-screen="project"]');
      h.html(".w-crumb", crumbFor(PROJECT));
      h.q(".w-top").classList.remove("flat");
      h.text(".w-pdesc", DESC);
      h.cls("nav-projects", "on", false);
      h.noRing();
      h.say("Klart. Projektet är tomt än så länge, det fyller du på i nästa steg.");
      await h.wait(3000);
    }
  },

  instructions: {
    ...PAGE,
    build: () => pageFor("instructions", instructionsModal()),
    async run(h) {
      await h.wait(500);
      await h.move("instr-add");
      h.say("Klicka på plusset vid Instructions i högerspalten.");
      await h.wait(900);
      await h.click();
      h.show('[data-modal="instr"]');
      await h.wait(500);
      await h.move("instr-text");
      h.say("Skriv vad projektet gäller och hur du vill att Claude jobbar.");
      await h.click();
      await h.type("instr-text", INSTR_SHORT, 14);
      h.cls("instr-save", "off", false);
      await h.wait(500);
      await h.move("instr-save");
      h.say("Spara med Save instructions.");
      await h.wait(600);
      await h.click();
      h.hide('[data-modal="instr"]');
      h.text('[data-t="instr-sub"]', INSTR_SHORT.split("\n")[0]);   // VERIFY: instructions-saved
      await h.move("instructions");
      h.say("Nu gäller instruktionerna i alla chattar i projektet.");
      await h.wait(3000);
    }
  },

  context: {
    ...PAGE,
    build: () => pageFor("context"),
    async run(h) {
      await h.wait(500);
      await h.move("context");
      h.say("Context ligger i högerspalten, under Memory.");
      await h.wait(1800);
      await h.move("context-add");
      h.say("Klicka på plusset och välj filerna.");
      await h.wait(600);
      await h.click();
      await h.wait(500);
      h.hide(".w-drop");
      h.addFile(FILES[0]);             // VERIFY: context-files
      await h.wait(500);
      h.addFile(FILES[1]);
      await h.wait(600);
      await h.move("context");
      h.say("Filerna finns nu med i alla chattar i projektet.");
      await h.wait(3000);
    }
  },

  folder: {
    ...PAGE,
    build: () => pageFor("folder"),
    async run(h) {
      await h.wait(500);
      await h.move("folder");
      h.say("Folder ligger längre ner i högerspalten.");
      await h.wait(1800);
      await h.move("folder-add");
      h.say("Klicka på plusset och välj en mapp på datorn.");
      await h.wait(700);
      await h.click();
      await h.wait(700);
      h.html("folder-slot", folderRow());   // VERIFY: folder-added
      await h.wait(600);
      await h.move("folder-only");
      h.say("Only you: mappen är bara din och följer inte med när du delar projektet.");
      await h.wait(3200);
    }
  },

  work: {
    ...PAGE,
    build: () => pageFor("work"),
    async run(h) {
      await h.wait(500);
      await h.move("composer-text");
      h.say("Skriv i rutan som vanligt. Instruktionerna och underlaget följer med av sig själva.");
      await h.click();
      await h.type("composer-text", "Sammanfatta besluten i beslutsloggen, nyaste först.", 32);
      await h.wait(1200);
      await h.move("private-note");
      h.say("Dina chattar i projektet syns bara för dig, så länge du inte delar dem.");
      await h.wait(3000);
    }
  },

  scheduled: {
    ...PAGE,
    build: () => pageFor("scheduled", scheduledModal()),
    async run(h) {
      await h.wait(500);
      await h.move("sched-add");
      h.say("Klicka på plusset vid Scheduled.");
      await h.wait(700);
      await h.click();
      h.show('[data-modal="sched"]');
      await h.wait(500);
      await h.move("sched-name");
      h.say("Ge jobbet ett namn och beskriv vad Claude ska göra.");
      await h.click();
      await h.type("sched-name", TASK.name, 45);
      await h.move("sched-text");
      await h.click();
      await h.type("sched-text", "Gå igenom projektets underlag och lista frågor som fortfarande är öppna.", 18);
      await h.wait(400);
      await h.move("auto-approve");
      h.say("Automatically approve är förvalt. Då kör Claude utan att stanna och fråga.");
      await h.wait(2800);
      await h.move("trigger");
      h.say("Under Trigger väljer du hur ofta och när.");
      await h.wait(600);
      await h.move("time");
      await h.click();
      h.text('[data-t="time"]', "");
      await h.type("time", "08:00", 90);
      await h.wait(500);
      await h.move("sched-create");
      h.say("Klicka på Create.");
      await h.wait(500);
      await h.click();
      h.hide('[data-modal="sched"]');
      await h.wait(400);
      h.html("sched-slot", taskRow());   // VERIFY: scheduled-added
      await h.move("scheduled");
      h.say("Klart. Jobbet körs varje morgon klockan åtta.");
      await h.wait(3000);
    }
  },

  memory: {
    ...PAGE,
    build: () => pageFor("memory"),
    async run(h) {
      await h.wait(500);
      await h.move("memory");
      h.say("Minnet dyker upp under Memory efter några chattar.");
      await h.wait(2400);
      await h.move("memory-only");
      h.say("Only you: minnet är ditt eget, även när projektet är delat.");
      await h.wait(2600);
      await h.move("view-memory");
      h.say("Under View memory ser du vad Claude har sparat.");
      await h.wait(900);
      await h.click();
      await h.wait(2200);
    }
  },

  share: {
    ...PAGE,
    build: () => pageFor("share", shareModal()),
    async run(h) {
      await h.wait(500);
      await h.move("share");
      h.say("Share hittar du uppe till höger på projektsidan.");
      await h.wait(700);
      await h.click();
      h.show('[data-modal="share"]');
      await h.wait(500);
      await h.move("share-input");
      h.say("Sök fram kollegan på namn eller e-post.");
      await h.click();
      h.cls("share-input", "focus", true);
      await h.type("share-input", "Anna Svensson", 45);
      h.cls("share-input", "focus", false);
      await h.wait(500);
      await h.move("people");
      h.say("Under People with access ser du vilka som redan är med.");
      await h.wait(2400);
      await h.move("general-access");
      h.say("Only people invited betyder att bara de du bjuder in kommer åt projektet.");
      await h.wait(2600);
      h.cls("share-send", "off", false);   // VERIFY: share-after-typing
      h.cls("share-send", "w-btn-dark", false);
      h.cls("share-send", "w-btn-light", true);
      await h.move("share-send");
      h.say("Klicka på Share.");
      await h.wait(500);
      await h.click();
      h.hide('[data-modal="share"]');
      h.noRing();
      h.say("Klart. Kollegan får samma instruktioner och underlag, men ser inte dina chattar.");
      await h.wait(3200);
    }
  }
};


/* =====================================================================
   2. SPELAREN
   ===================================================================== */
function makeHelper(canvas, getScale, run, ui) {
  const q = (t) => {
    const el = canvas.querySelector(toSelector(t));
    if (!el) throw new Error("Hittar inte " + t);
    return el;
  };
  const alive = () => { if (run.cancelled) throw CANCEL; };
  const cursor = q(".g-cursor"), ring = q(".g-ring"), ripple = q(".g-ripple");
  const W = canvas.offsetWidth, H = canvas.offsetHeight;
  let pos = { x: W * 0.62, y: H * 0.92 };

  cursor.style.transition = "none";
  cursor.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
  void cursor.offsetWidth;
  cursor.style.transition = "";

  function rect(t) {
    const r = q(t).getBoundingClientRect(), c = canvas.getBoundingClientRect(), s = getScale();
    return { x: (r.left - c.left) / s, y: (r.top - c.top) / s, w: r.width / s, h: r.height / s };
  }

  return {
    q,
    async wait(ms) {
      alive();
      while (run.paused && !run.instant) { await sleep(120); alive(); }
      if (!run.instant) await sleep(ms);
      alive();
    },
    say(text) { ui.setCaption(text); },
    async move(t) {
      const r = rect(t), pad = 6;
      Object.assign(ring.style, { left: (r.x - pad) + "px", top: (r.y - pad) + "px", width: (r.w + pad * 2) + "px", height: (r.h + pad * 2) + "px" });
      ring.hidden = false;
      pos = { x: r.x + Math.min(r.w / 2, 60), y: r.y + r.h * 0.6 };
      cursor.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
      await this.wait(480);
    },
    async click() {
      if (run.instant) return;
      ripple.style.left = pos.x + "px";
      ripple.style.top = pos.y + "px";
      ripple.classList.remove("go");
      void ripple.offsetWidth;
      ripple.classList.add("go");
      await this.wait(180);
    },
    async type(t, text, speed = 30) {
      const el = q(t);
      el.classList.remove("ph");
      if (run.instant) { el.textContent = text; return; }
      el.classList.add("typing");
      for (let i = 1; i <= text.length; i++) {
        el.textContent = text.slice(0, i);
        el.scrollTop = el.scrollHeight;
        await this.wait(speed);
      }
      el.classList.remove("typing");
    },
    noRing() { ring.hidden = true; },
    show(t) { q(t).hidden = false; },
    hide(t) { q(t).hidden = true; },
    text(t, value) { q(t).textContent = value; },
    html(t, value) { q(t).innerHTML = value; },
    cls(t, name, on) { q(t).classList.toggle(name, on); },
    addFile(name) {
      const row = document.createElement("div");
      row.className = "w-file";
      row.innerHTML = ic("file") + "<span></span>";
      row.querySelector("span").textContent = name;
      q("files").append(row);
    }
  };
}

// Hela appen och bildtexten ska rymmas på skärmen, även när någon zoomar in.
function fitToScreen(figure, w, h) {
  figure.style.setProperty("--fit", `min(1040px, calc((100vh - 230px) * ${(w / h).toFixed(3)}))`);
}

function makeCanvas(viewport, w, h) {
  viewport.style.aspectRatio = `${w} / ${h}`;
  const canvas = document.createElement("div");
  canvas.className = "canvas";
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  viewport.append(canvas);
  return canvas;
}

function initPlayer(figure) {
  const scene = scenes[figure.dataset.scene];
  const viewport = figure.querySelector(".viewport");
  const caption = figure.querySelector(".caption");
  const playButton = figure.querySelector(".play");
  fitToScreen(figure, scene.w, scene.h);

  const canvas = makeCanvas(viewport, scene.w, scene.h);
  let scale = 1;
  const fit = () => { scale = viewport.clientWidth / scene.w || 1; canvas.style.transform = `scale(${scale})`; };
  new ResizeObserver(fit).observe(viewport);
  fit();

  const ui = { setCaption(text) { caption.textContent = text; } };
  const build = () => { canvas.innerHTML = scene.build() + OVERLAY; };
  build();

  if (REDUCED) {
    figure.classList.add("still");
    scene.run(makeHelper(canvas, () => scale, { instant: true }, ui)).catch(console.error);
    return;
  }

  let run = null, paused = false;
  async function loop(current) {
    while (!current.cancelled) {
      build();
      try {
        await scene.run(makeHelper(canvas, () => scale, current, ui));
        await sleep(1200);
      } catch (e) {
        if (e !== CANCEL) console.error(e);
        return;
      }
    }
  }

  playButton.addEventListener("click", () => {
    paused = !paused;
    if (run) run.paused = paused;
    playButton.textContent = paused ? "Spela" : "Pausa";
  });

  new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !run) { run = { cancelled: false, paused }; loop(run); }
      else if (!entry.isIntersecting && run) { run.cancelled = true; run = null; }
    });
  }, { threshold: 0.4 }).observe(figure);
}


/* =====================================================================
   3. DEMON: vad Claude får med sig när du skriver
   ===================================================================== */
const DEMO_STATES = [
  { view: "chat", lit: 0, ms: 3600, text: "En vanlig chatt. Claude får ditt meddelande, plus det som minnet råkar ha plockat upp." },
  { view: "project", lit: 1, ms: 3000, text: "I ett projekt följer instruktionerna med i varje chatt." },
  { view: "project", lit: 2, ms: 3600, text: "Dokumenten i Context följer också med. Blir det mycket söker Claude fram de delar som verkar relevanta." },
  { view: "project", lit: 3, ms: 3600, text: "Och projektminnet, alltså det Claude har lärt sig av dina chattar i projektet. Det är bara ditt." },
  { view: "project", lit: 3, ms: 3200, text: "Allt det här får Claude med sig, varje gång du skriver i projektet." }
];
const LIT_SECTIONS = [["instructions", 1], ["context", 2], ["memory", 3]];

function initContextDemo(figure) {
  const W = 1200, H = 740;
  const viewport = figure.querySelector(".viewport");
  const caption = figure.querySelector(".caption");
  const legend = [...figure.querySelectorAll(".legend li[data-layer]")];
  const playButton = figure.querySelector(".play");
  fitToScreen(figure, W, H);
  const canvas = makeCanvas(viewport, W, H);
  const fit = () => { canvas.style.transform = `scale(${viewport.clientWidth / W || 1})`; };
  new ResizeObserver(fit).observe(viewport);

  const views = {
    chat: frame({ side: "New", body: newChatPage() }),
    project: frame({ side: "Projects", crumb: crumbFor(PROJECT), body: projectPage({ state: { instr: true, files: true } }) })
  };
  let current = "";

  function show(state) {
    if (state.view !== current) { canvas.innerHTML = views[state.view]; current = state.view; fit(); }
    if (state.view === "project") {
      LIT_SECTIONS.forEach(([t, n]) => {
        const sec = canvas.querySelector(`[data-t="${t}"]`);
        sec.dataset.badge = String(n);
        sec.classList.toggle("lit", n <= state.lit);
      });
    }
    legend.forEach((li) => li.classList.toggle("on", Number(li.dataset.layer) <= state.lit));
    caption.textContent = state.text;
  }

  if (REDUCED) { figure.classList.add("still"); show(DEMO_STATES[DEMO_STATES.length - 1]); return; }

  let index = 0, timer = null, paused = false;
  const tick = () => {
    show(DEMO_STATES[index]);
    timer = setTimeout(() => { index = (index + 1) % DEMO_STATES.length; tick(); }, DEMO_STATES[index].ms);
  };
  const stop = () => { clearTimeout(timer); timer = null; };
  show(DEMO_STATES[0]);

  playButton.addEventListener("click", () => {
    paused = !paused;
    playButton.textContent = paused ? "Spela" : "Pausa";
    if (paused) stop(); else if (!timer) tick();
  });
  new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !timer && !paused) { index = 0; tick(); }
      else if (!entry.isIntersecting) stop();
    });
  }, { threshold: 0.4 }).observe(figure);
}


/* =====================================================================
   4. SIDAN
   ===================================================================== */
function initRail() {
  const links = [...document.querySelectorAll(".rail a.ch")];
  const targets = links.map((link) => document.querySelector(link.getAttribute("href")));
  function update() {
    const line = window.innerHeight * 0.35;
    let current = 0;
    targets.forEach((target, i) => { if (target.getBoundingClientRect().top <= line) current = i; });
    links.forEach((link, i) => link.setAttribute("aria-current", String(i === current)));
  }
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
}

function initCopy() {
  const button = document.getElementById("copy");
  if (!button) return;
  button.addEventListener("click", async () => {
    const status = document.getElementById("copy-status");
    try {
      await navigator.clipboard.writeText(document.getElementById("example").textContent);
      status.textContent = "Kopierat. Klistra in under Instructions i ditt projekt.";
    } catch (err) {
      status.textContent = "Webbläsaren stoppade kopieringen. Markera texten och tryck Ctrl+C eller Cmd+C.";
    }
  });
}

document.querySelectorAll(".player[data-scene]").forEach(initPlayer);
document.querySelectorAll(".player-demo").forEach(initContextDemo);
initRail();
initCopy();
