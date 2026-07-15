// ========================================================================
// 8-Bit-Hintergrund (#about) + verstecktes Mini-Dungeon-Crawler-Easter-Egg
// Komplett eigenständig: eigenes Canvas, eigene Game-Loop, kein Einfluss
// auf script.js. Alles wird hier dynamisch ins DOM eingehängt.
// ========================================================================

(function () {
  'use strict';

  const TILE = 20;
  const COLS = 16;
  const ROWS = 9;
  const CANVAS_W = TILE * COLS; // 320
  const CANVAS_H = TILE * ROWS; // 180

  const COLORS = {
    floor: '#241a38',
    floorAlt: '#2c2144',
    wall: '#120c1f',
    wallEdge: '#4a3a78',
    locked: '#5c2a2a',
    lockedEdge: '#b04b4b',
    key: '#ffd447',
    amulet: '#4ad9ff',
    scroll: '#f4f0ff',
    chest: '#c8863b',
    chestDark: '#8a5a24',
    enemy: '#e0475a',
    enemyDark: '#8c2231',
    player: '#4ad98e',
    playerDark: '#237a53',
    sword: '#f4f0ff',
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ------------------------------------------------------------------
  // Raum-Aufbau
  // ------------------------------------------------------------------
  function makeGrid(openings) {
    const grid = [];
    for (let r = 0; r < ROWS; r++) {
      const row = [];
      for (let c = 0; c < COLS; c++) {
        const isBorder = r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1;
        row.push(isBorder ? '#' : '.');
      }
      grid.push(row);
    }
    openings.forEach((o) => {
      o.rows.forEach((r) => {
        grid[r][o.col] = o.type || '.';
      });
    });
    return grid;
  }

  const DOOR_ROWS = [3, 4, 5];
  const midY = (r) => r * TILE + TILE / 2;

  function makeEnemy(x, y, patrolTo, hp) {
    return {
      x, y, w: 14, h: 14,
      speed: 34,
      hp: hp || 1,
      alive: true,
      patrolFrom: { x, y },
      patrolTo: patrolTo || { x, y },
      dir: 1,
    };
  }

  function buildRooms() {
    return {
      1: {
        grid: makeGrid([{ col: COLS - 1, rows: DOOR_ROWS, type: 'L' }]),
        enemies: [makeEnemy(TILE * 8, TILE * 2.5, { x: TILE * 8, y: TILE * 6.5 }, 1)],
        items: [
          { type: 'key', x: TILE * 6, y: TILE * 4.5, w: 12, h: 12, collected: false, label: 'Schlüssel gefunden! Die Tür nach rechts ist jetzt offen.' },
        ],
        doors: [
          { col: COLS - 1, rows: DOOR_ROWS, toRoom: 2, requiresKey: true, spawn: { x: TILE * 1.5, y: midY(4) } },
        ],
        drops: [],
      },
      2: {
        grid: makeGrid([
          { col: 0, rows: DOOR_ROWS },
          { col: COLS - 1, rows: DOOR_ROWS },
        ]),
        enemies: [
          makeEnemy(TILE * 5, TILE * 2.5, { x: TILE * 5, y: TILE * 6 }, 1),
          makeEnemy(TILE * 10, TILE * 6, { x: TILE * 10, y: TILE * 2.5 }, 1),
        ],
        items: [
          { type: 'amulet', x: TILE * 8, y: TILE * 4.5, w: 12, h: 12, collected: false, label: 'Terraform-Amulett gefunden! (+Infrastructure as Code)' },
        ],
        doors: [
          { col: 0, rows: DOOR_ROWS, toRoom: 1, spawn: { x: TILE * (COLS - 1.5), y: midY(4) } },
          { col: COLS - 1, rows: DOOR_ROWS, toRoom: 3, spawn: { x: TILE * 1.5, y: midY(4) } },
        ],
        drops: [],
      },
      3: {
        grid: makeGrid([
          { col: 0, rows: DOOR_ROWS },
          { col: COLS - 1, rows: DOOR_ROWS },
        ]),
        enemies: [
          makeEnemy(TILE * 4, TILE * 2, { x: TILE * 12, y: TILE * 2 }, 1),
          makeEnemy(TILE * 12, TILE * 6.5, { x: TILE * 4, y: TILE * 6.5 }, 1),
          makeEnemy(TILE * 8, TILE * 4.5, { x: TILE * 8, y: TILE * 2 }, 2),
        ],
        items: [
          { type: 'scroll', x: TILE * 8, y: TILE * 6.5, w: 12, h: 12, collected: false, label: 'PowerShell-Schriftrolle gefunden! (+Automatisierung)' },
        ],
        doors: [
          { col: 0, rows: DOOR_ROWS, toRoom: 2, spawn: { x: TILE * (COLS - 1.5), y: midY(4) } },
          { col: COLS - 1, rows: DOOR_ROWS, toRoom: 4, spawn: { x: TILE * 1.5, y: midY(4) } },
        ],
        drops: [],
      },
      4: {
        grid: makeGrid([{ col: 0, rows: DOOR_ROWS }]),
        enemies: [makeEnemy(TILE * 8, TILE * 4.5, { x: TILE * 8, y: TILE * 4.5 }, 2)],
        items: [
          { type: 'chest', x: TILE * 13, y: TILE * 4.5, w: 16, h: 14, collected: false, label: 'Geschafft!' },
        ],
        doors: [
          { col: 0, rows: DOOR_ROWS, toRoom: 3, spawn: { x: TILE * (COLS - 1.5), y: midY(4) } },
        ],
        drops: [],
      },
    };
  }

  let rooms = buildRooms();
  let currentRoomId = 1;

  function freshPlayer() {
    return {
      x: TILE * 2, y: midY(4),
      w: 13, h: 13,
      facing: 'down',
      moving: false,
      hearts: 3,
      maxHearts: 3,
      hasKey: false,
      inventory: [],
      gold: 0,
      invulnTimer: 0,
      attacking: false,
      attackTimer: 0,
      attackHitEnemies: new Set(),
    };
  }

  let player = freshPlayer();

  function resetGame() {
    rooms = buildRooms();
    currentRoomId = 1;
    player = freshPlayer();
  }

  // ------------------------------------------------------------------
  // DOM-Aufbau
  // ------------------------------------------------------------------
  let bgCanvas, bgCtx;
  let overlay, gameCanvas, gameCtx;
  let heartsEl, inventoryEl, toastEl, rotateHintEl;
  let introScreen, gameOverScreen, winScreen;
  let touchControlsEl;

  function buildBackgroundCanvas() {
    const about = document.getElementById('about');
    if (!about) return;
    bgCanvas = document.createElement('canvas');
    bgCanvas.className = 'eg-bg-canvas';
    bgCanvas.width = BG_W;
    bgCanvas.height = BG_H;
    bgCanvas.setAttribute('aria-hidden', 'true');
    about.insertBefore(bgCanvas, about.firstChild);
    bgCtx = bgCanvas.getContext('2d');
    updateCanvasResolution();

    bgCanvas.addEventListener('pointerdown', onBgPointerDown);
    bgCanvas.addEventListener('pointermove', onBgPointerMove);

    let resizeT = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeT);
      resizeT = setTimeout(() => {
        updateCanvasResolution();
        if (mode === 'bg') drawIdleFrame(performance.now());
      }, 150);
    });
  }

  function buildOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'eg-overlay hidden';
    overlay.innerHTML = `
      <div class="eg-topbar">
        <button class="eg-exit-btn" type="button" aria-label="Spiel verlassen">× Verlassen</button>
      </div>
      <div class="eg-screen-wrap">
        <canvas id="eg-canvas" width="${CANVAS_W}" height="${CANVAS_H}"></canvas>
        <div class="eg-hud">
          <div class="eg-hearts" id="eg-hearts"></div>
          <div class="eg-inventory" id="eg-inventory"></div>
        </div>
        <div class="eg-toast" id="eg-toast"></div>
        <div class="eg-rotate-hint" id="eg-rotate-hint">🔄 Für optimales Spielerlebnis: Gerät ins Querformat drehen!</div>

        <div class="eg-screen hidden" id="eg-screen-intro">
          <h2>Dungeon-Modus!</h2>
          <p class="eg-controls-list">
            <span>▲▼◀▶ / WASD — Bewegen</span>
            <span>Leertaste — Angriff</span>
            <span>ESC — Verlassen</span>
          </p>
          <div class="eg-screen-actions">
            <button type="button" data-action="start">Los geht's!</button>
          </div>
        </div>

        <div class="eg-screen hidden" id="eg-screen-gameover">
          <h2>GAME OVER</h2>
          <p>Die Gegner in der WIIT-Testumgebung waren zu stark. Zum Glück war das nur eine Simulation.</p>
          <div class="eg-screen-actions">
            <button type="button" data-action="retry">Nochmal versuchen</button>
            <button type="button" data-action="exit">Verlassen</button>
          </div>
        </div>

        <div class="eg-screen hidden" id="eg-screen-win">
          <h2>Geschafft! 🏆</h2>
          <p>Zielerreichung: 100&nbsp;% — genau wie beim echten IHK-Abschlussprojekt.</p>
          <div class="eg-screen-actions">
            <button type="button" data-action="retry">Nochmal spielen</button>
            <button type="button" data-action="exit">Verlassen</button>
          </div>
        </div>
      </div>

      <div class="eg-touch-controls" id="eg-touch-controls">
        <div class="eg-dpad">
          <button type="button" class="eg-dpad-btn eg-dpad-up" data-dir="up" aria-label="Hoch">▲</button>
          <button type="button" class="eg-dpad-btn eg-dpad-left" data-dir="left" aria-label="Links">◀</button>
          <button type="button" class="eg-dpad-btn eg-dpad-right" data-dir="right" aria-label="Rechts">▶</button>
          <button type="button" class="eg-dpad-btn eg-dpad-down" data-dir="down" aria-label="Runter">▼</button>
        </div>
        <button type="button" class="eg-attack-btn" id="eg-attack-btn" aria-label="Angriff">⚔</button>
      </div>
    `;
    document.body.appendChild(overlay);

    gameCanvas = overlay.querySelector('#eg-canvas');
    gameCtx = gameCanvas.getContext('2d');
    heartsEl = overlay.querySelector('#eg-hearts');
    inventoryEl = overlay.querySelector('#eg-inventory');
    toastEl = overlay.querySelector('#eg-toast');
    rotateHintEl = overlay.querySelector('#eg-rotate-hint');
    introScreen = overlay.querySelector('#eg-screen-intro');
    gameOverScreen = overlay.querySelector('#eg-screen-gameover');
    winScreen = overlay.querySelector('#eg-screen-win');
    touchControlsEl = overlay.querySelector('#eg-touch-controls');

    overlay.querySelector('.eg-exit-btn').addEventListener('click', closeGame);
    overlay.querySelectorAll('[data-action="exit"]').forEach((btn) => btn.addEventListener('click', closeGame));
    overlay.querySelectorAll('[data-action="retry"]').forEach((btn) => btn.addEventListener('click', () => {
      resetGame();
      hideEndScreens();
      startGameLoop();
    }));

    setupTouchControls();
  }

  function hideEndScreens() {
    gameOverScreen.classList.add('hidden');
    winScreen.classList.add('hidden');
  }

  let introDismissKeyHandler = null;

  function showIntro(onDone) {
    introScreen.classList.remove('hidden');
    const dismiss = () => {
      introScreen.classList.add('hidden');
      if (introDismissKeyHandler) {
        window.removeEventListener('keydown', introDismissKeyHandler);
        introDismissKeyHandler = null;
      }
      onDone();
    };
    introDismissKeyHandler = (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        dismiss();
      }
    };
    window.addEventListener('keydown', introDismissKeyHandler);
    overlay.querySelector('#eg-screen-intro [data-action="start"]').onclick = dismiss;
  }

  // ------------------------------------------------------------------
  // Idle-Hintergrund-Animation: 8-Bit-Stadtszene (Tag/Nacht)
  // ------------------------------------------------------------------
  const BG_W = 400;
  let BG_H = 180;

  // Passt die interne Canvas-Höhe an das tatsächliche Seitenverhältnis von #about an,
  // damit die Szene nie nicht-uniform gestreckt/gestaucht wird (v.a. auf schmalen,
  // hohen Mobile-Layouts). Die Breite bleibt fix, damit genug horizontales Detail
  // (Gebäude, Fahrzeuge) erhalten bleibt.
  function updateCanvasResolution() {
    if (!bgCanvas) return;
    const rect = bgCanvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const targetH = Math.round(BG_W / (rect.width / rect.height));
    BG_H = Math.min(1200, Math.max(140, targetH));
    bgCanvas.width = BG_W;
    bgCanvas.height = BG_H;
  }
  let hoveringVehicle = null; // 'car' | 'carriage' | null

  function hash(n) {
    const x = Math.sin(n * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }

  // Die Straßen-/Gehweg-Zone liegt immer im unteren Rand-Padding von #about
  // (per CSS reserviert, siehe easter-egg.css), damit Fahrzeuge auf keiner
  // Bildschirmgröße vom Inhalt (Profilbild/Text) überdeckt/unklickbar werden.
  const STREET_BAND_PADDING_PX = 136; // entspricht #about padding-bottom (8.5rem)
  function computeLayout() {
    let bandInternal = 90;
    let aspectFix = 1;
    if (bgCanvas) {
      const rect = bgCanvas.getBoundingClientRect();
      if (rect.height) {
        bandInternal = (STREET_BAND_PADDING_PX * BG_H) / rect.height;
        // Gleicht die nicht-uniforme CSS-Streckung aus, damit Kreise (Sonne/Mond)
        // auf sehr schmalen/hohen Viewports nicht oval verzerrt wirken.
        const stretchX = rect.width / BG_W;
        const stretchY = rect.height / BG_H;
        aspectFix = stretchX / stretchY;
      }
    }
    const roadH = Math.min(64, Math.max(28, bandInternal * 0.56));
    const sidewalkH = Math.min(36, Math.max(18, bandInternal * 0.36));
    const roadY = BG_H - roadH;
    const sidewalkY = roadY - sidewalkH;
    return { roadY, roadH, sidewalkY, sidewalkH, horizonY: sidewalkY, aspectFix };
  }

  function isNightMode() {
    return document.body.classList.contains('dark');
  }

  function toCanvasCoords(canvas, clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  }

  function pointInRect(x, y, r) {
    return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
  }

  // Eigene Fahrspur je Richtung: von links (dir=1) auf der vorderen (näheren),
  // von rechts (dir=-1) auf der hinteren (ferneren) Spur — wie echter Gegenverkehr.
  function laneY(v, layout) {
    const frac = v.dir === 1 ? 0.78 : 0.3;
    return layout.roadY + layout.roadH * frac;
  }

  function vehicleRect(v, layout) {
    const y = laneY(v, layout);
    if (v.type === 'carriage') return { x: v.x - 18, y: y - 24, w: 46, h: 28 };
    return { x: v.x - 12, y: y - 15, w: 24, h: 18 };
  }

  function findVehicleAt(px, py) {
    const layout = computeLayout();
    for (const v of vehicles) {
      if (pointInRect(px, py, vehicleRect(v, layout))) return v;
    }
    return null;
  }

  function onBgPointerDown(e) {
    const p = toCanvasCoords(bgCanvas, e.clientX, e.clientY);
    const v = findVehicleAt(p.x, p.y);
    if (!v) return;
    if (v.type === 'carriage') {
      openGame();
    } else {
      v.honkT = 900;
    }
  }

  function onBgPointerMove(e) {
    const p = toCanvasCoords(bgCanvas, e.clientX, e.clientY);
    const v = findVehicleAt(p.x, p.y);
    hoveringVehicle = v ? v.type : null;
    bgCanvas.style.cursor = hoveringVehicle ? 'pointer' : 'default';
  }

  // -- Fußgänger -------------------------------------------------------
  let pedestrians = null;
  function initPedestrians() {
    pedestrians = [0, 1, 2, 3].map((i) => ({
      x: hash(i * 17.31) * BG_W,
      dir: hash(i * 31.13) > 0.5 ? 1 : -1,
      speed: 6 + hash(i * 5.27) * 5,
      tint: ['#e0475a', '#4ad98e', '#4ad9ff', '#ffd447'][i % 4],
    }));
  }

  function updatePedestrians(dt) {
    if (!pedestrians) initPedestrians();
    pedestrians.forEach((p) => {
      p.x += p.dir * p.speed * dt;
      if (p.x > BG_W + 8) p.x = -8;
      if (p.x < -8) p.x = BG_W + 8;
    });
  }

  function drawPedestrians(ctx, layout, t) {
    const y = layout.sidewalkY + layout.sidewalkH - 3;
    const legFrame = Math.floor(t / 220) % 2 === 0;
    pedestrians.forEach((p) => {
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(p.x - 2, y + 1, 5, 1);
      ctx.fillStyle = '#e8c9a0';
      ctx.fillRect(p.x - 1, y - 8, 3, 3);
      ctx.fillStyle = p.tint;
      ctx.fillRect(p.x - 2, y - 5, 4, 4);
      ctx.fillStyle = '#2a2438';
      if (legFrame === (p.dir > 0)) {
        ctx.fillRect(p.x - 2, y - 1, 2, 3);
        ctx.fillRect(p.x, y - 1, 1, 2);
      } else {
        ctx.fillRect(p.x - 2, y - 1, 1, 2);
        ctx.fillRect(p.x, y - 1, 2, 3);
      }
    });
  }

  // -- Gebäude (Parallax) ----------------------------------------------
  let scrollFar = 0;
  let scrollNear = 0;

  function drawBuildingLayer(ctx, scrollX, layerIdx, layout, isNight) {
    const slotW = layerIdx === 0 ? 50 : 34;
    const minH = layerIdx === 0 ? 34 : 46;
    const rangeH = layerIdx === 0 ? 30 : 44;
    const bodyColor = layerIdx === 0
      ? (isNight ? '#1c1533' : '#aebede')
      : (isNight ? '#120c22' : '#8898bc');

    const startSlot = Math.floor(scrollX / slotW) - 1;
    const endSlot = startSlot + Math.ceil(BG_W / slotW) + 2;
    for (let slot = startSlot; slot <= endSlot; slot++) {
      const h = minH + hash(slot * 7.13 + layerIdx * 91.7) * rangeH;
      const x = slot * slotW - scrollX;
      const y = layout.horizonY - h;
      ctx.fillStyle = bodyColor;
      ctx.fillRect(x, y, slotW - 4, h);

      if (layerIdx === 1) {
        const cols = Math.max(1, Math.floor((slotW - 8) / 6));
        const rows = Math.max(1, Math.floor((h - 8) / 9));
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const lit = hash(slot * 3.1 + r * 5.7 + c * 2.3) > (isNight ? 0.6 : 0.85);
            ctx.fillStyle = lit
              ? (isNight ? '#ffd76b' : 'rgba(255,255,255,0.55)')
              : (isNight ? '#241c3a' : 'rgba(255,255,255,0.18)');
            ctx.fillRect(x + 3 + c * 6, y + 5 + r * 9, 3, 4);
          }
        }
      }
    }
  }

  // -- Straßenlaternen ---------------------------------------------------
  function drawStreetlights(ctx, scrollX, layout, isNight) {
    const spacing = 95;
    const startSlot = Math.floor(scrollX / spacing) - 1;
    const endSlot = startSlot + Math.ceil(BG_W / spacing) + 2;
    for (let slot = startSlot; slot <= endSlot; slot++) {
      const x = slot * spacing - scrollX + 46;
      const topY = layout.sidewalkY - 30;
      ctx.fillStyle = isNight ? '#413a5c' : '#8a8a9a';
      ctx.fillRect(x, topY, 2, layout.sidewalkY - topY);
      ctx.save();
      if (isNight) {
        ctx.shadowColor = 'rgba(255, 214, 71, 0.85)';
        ctx.shadowBlur = 9;
      }
      ctx.fillStyle = isNight ? '#ffd647' : '#5a5a6a';
      ctx.fillRect(x - 3, topY - 3, 8, 4);
      ctx.restore();
    }
  }

  // -- Fahrzeuge (Autos + Kutsche) ---------------------------------------
  let vehicles = [];
  let nextCarSpawn = 1.5;
  let nextCarriageSpawn = 14 + Math.random() * 10;

  function spawnCar() {
    const dir = Math.random() > 0.5 ? 1 : -1;
    vehicles.push({
      type: 'car',
      x: dir === 1 ? -20 : BG_W + 20,
      dir,
      speed: 42 + Math.random() * 22,
      color: ['#e0475a', '#4ad9ff', '#ffd447', '#c9c9d8', '#8c5cff'][Math.floor(Math.random() * 5)],
      honkT: 0,
    });
  }

  function spawnCarriage() {
    const dir = Math.random() > 0.5 ? 1 : -1;
    vehicles.push({ type: 'carriage', x: dir === 1 ? -40 : BG_W + 40, dir, speed: 26 });
  }

  function updateTraffic(dt) {
    nextCarSpawn -= dt;
    if (nextCarSpawn <= 0 && vehicles.filter((v) => v.type === 'car').length < 3) {
      spawnCar();
      nextCarSpawn = 3 + Math.random() * 3.5;
    }
    nextCarriageSpawn -= dt;
    if (nextCarriageSpawn <= 0 && !vehicles.some((v) => v.type === 'carriage')) {
      spawnCarriage();
      nextCarriageSpawn = 20 + Math.random() * 20; // "ab und an" alle ~20-40s
    }
    vehicles.forEach((v) => {
      v.x += v.dir * v.speed * dt;
      if (v.honkT > 0) v.honkT -= dt * 1000;
    });
    vehicles = vehicles.filter((v) => v.x > -70 && v.x < BG_W + 70);
  }

  function drawVehicle(ctx, v, layout, isNight) {
    const y = laneY(v, layout);
    const facingRight = v.dir === 1;
    ctx.save();
    ctx.translate(v.x, 0);
    if (!facingRight) ctx.scale(-1, 1);

    if (v.type === 'car') {
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(-13, y + 4, 26, 2);
      ctx.fillStyle = v.color;
      ctx.fillRect(-12, y - 10, 24, 8);
      ctx.fillRect(-6, y - 15, 13, 6);
      ctx.fillStyle = 'rgba(200,230,255,0.55)';
      ctx.fillRect(-4, y - 14, 9, 4);
      ctx.fillStyle = '#0b0716';
      ctx.fillRect(-9, y - 2, 5, 5);
      ctx.fillRect(4, y - 2, 5, 5);
      ctx.fillStyle = isNight ? '#fff6c8' : '#fff';
      ctx.save();
      if (isNight) { ctx.shadowColor = '#ffe9a3'; ctx.shadowBlur = 4; }
      ctx.fillRect(10, y - 8, 3, 3);
      ctx.restore();
      if (v.honkT > 0) {
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.font = 'bold 9px monospace';
        const label = facingRight ? '!' : '!';
        ctx.save();
        if (!facingRight) ctx.scale(-1, 1);
        ctx.fillText(label, facingRight ? -2 : 2, y - 20);
        ctx.restore();
      }
    } else {
      // Kutsche: bewusst deutlich anders als Autos (Holz, Räder, Pferd)
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(-18, y + 4, 44, 2);

      ctx.fillStyle = '#4a3225';
      ctx.fillRect(16, y - 16, 4, 10);
      ctx.fillRect(20, y - 16, 12, 9);
      ctx.fillRect(30, y - 20, 6, 7);
      ctx.fillStyle = '#2a1c14';
      ctx.fillRect(21, y - 4, 3, 6);
      ctx.fillRect(28, y - 4, 3, 6);

      // Offene Ladefläche hinten mit sichtbarer Schatztruhe
      ctx.fillStyle = '#4a3018';
      ctx.fillRect(-27, y - 10, 12, 9);
      ctx.fillStyle = '#2a1c10';
      ctx.fillRect(-27, y - 2, 12, 2);
      drawChestSprite(ctx, -26, y - 19, 10, 10, false);

      ctx.fillStyle = '#6b4118';
      ctx.fillRect(-16, y - 17, 28, 13);
      ctx.fillStyle = '#caa24a';
      ctx.fillRect(-14, y - 15, 24, 3);
      ctx.fillStyle = '#3a2410';
      ctx.fillRect(-14, y - 12, 6, 8);
      ctx.fillRect(-4, y - 12, 6, 8);

      ctx.fillStyle = '#3a2410';
      ctx.beginPath(); ctx.arc(-10, y - 1, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(6, y - 1, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#caa24a';
      ctx.beginPath(); ctx.arc(-10, y - 1, 1.6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(6, y - 1, 1.6, 0, Math.PI * 2); ctx.fill();

      if (isNight) {
        ctx.save();
        ctx.shadowColor = 'rgba(255,214,71,0.8)';
        ctx.shadowBlur = 6;
        ctx.fillStyle = '#ffd647';
        ctx.fillRect(-16, y - 12, 3, 3);
        ctx.restore();
      }
    }
    ctx.restore();
  }

  // -- Haupt-Zeichenfunktion --------------------------------------------
  function drawIdleFrame(t) {
    if (!bgCtx) return;
    const ctx = bgCtx;
    const isNight = isNightMode();
    const layout = computeLayout();

    ctx.clearRect(0, 0, BG_W, BG_H);

    const sky = ctx.createLinearGradient(0, 0, 0, layout.horizonY);
    if (isNight) {
      sky.addColorStop(0, '#0a0818');
      sky.addColorStop(1, '#241b3d');
    } else {
      sky.addColorStop(0, '#7ec4e8');
      sky.addColorStop(1, '#cfe8f2');
    }
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, BG_W, layout.horizonY + 20);

    if (isNight) {
      for (let i = 0; i < 26; i++) {
        const sx = (i * 53.7) % BG_W;
        const sy = (i * 29.3) % (layout.horizonY - 10);
        ctx.fillStyle = `rgba(255,255,255,${0.3 + hash(i * 4.1) * 0.5})`;
        ctx.fillRect(sx, sy + 4, 1, 1);
      }
      ctx.fillStyle = '#f4f0d8';
      ctx.beginPath(); ctx.ellipse(BG_W - 50, 26, 10 / layout.aspectFix, 10, 0, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = '#fff4c2';
      ctx.beginPath(); ctx.ellipse(50, 24, 12 / layout.aspectFix, 12, 0, 0, Math.PI * 2); ctx.fill();
    }

    drawBuildingLayer(ctx, scrollFar, 0, layout, isNight);
    drawBuildingLayer(ctx, scrollNear, 1, layout, isNight);
    drawStreetlights(ctx, scrollNear, layout, isNight);

    // Gehweg
    ctx.fillStyle = isNight ? '#2a2440' : '#c9c3b8';
    ctx.fillRect(0, layout.sidewalkY, BG_W, layout.sidewalkH);
    updatePedestrians(reduceMotion ? 0 : 1 / 18);
    drawPedestrians(ctx, layout, t);

    // Straße
    ctx.fillStyle = isNight ? '#141020' : '#3a3a44';
    ctx.fillRect(0, layout.roadY, BG_W, layout.roadH);
    const dashY = layout.roadY + layout.roadH * 0.5;
    for (let x = -((scrollNear * 1.4) % 24); x < BG_W; x += 24) {
      ctx.fillStyle = isNight ? '#4a4560' : '#e8e4d8';
      ctx.fillRect(x, dashY, 12, 2);
    }

    updateTraffic(reduceMotion ? 0 : 1 / 18);
    vehicles.forEach((v) => drawVehicle(ctx, v, layout, isNight));

    if (!reduceMotion) {
      scrollFar += 4 / 18;
      scrollNear += 11 / 18;
    }

    if (hoveringVehicle === 'carriage') {
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = '8px monospace';
      ctx.fillText('?', BG_W / 2, layout.roadY - 6);
    }
  }

  function drawChestSprite(ctx, x, y, w, h, open) {
    ctx.fillStyle = COLORS.chestDark;
    ctx.fillRect(x, y + h * 0.4, w, h * 0.6);
    ctx.fillStyle = COLORS.chest;
    ctx.fillRect(x, y, w, h * 0.45);
    ctx.fillStyle = '#a5652a';
    ctx.fillRect(x, y + h * 0.4 - 1, w, 2);
    ctx.fillStyle = '#6b4118';
    ctx.fillRect(x + 1, y + h * 0.45, 2, h * 0.5);
    ctx.fillRect(x + w - 3, y + h * 0.45, 2, h * 0.5);
    ctx.fillStyle = '#ffd447';
    ctx.fillRect(x + w / 2 - 2, y + h * 0.38, 4, 5);
    if (open) {
      ctx.fillStyle = 'rgba(255, 230, 150, 0.4)';
      ctx.fillRect(x - 3, y - 10, w + 6, 10);
    }
  }

  let idleIntervalId = null;

  function startIdleLoop() {
    if (idleIntervalId || !bgCtx) return;
    if (reduceMotion) {
      drawIdleFrame(0);
      return;
    }
    idleIntervalId = setInterval(() => drawIdleFrame(performance.now()), 1000 / 18);
  }

  function stopIdleLoop() {
    if (idleIntervalId) {
      clearInterval(idleIntervalId);
      idleIntervalId = null;
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopIdleLoop();
    } else if (mode === 'bg') {
      startIdleLoop();
    }
  });

  // ------------------------------------------------------------------
  // Spiel-Logik
  // ------------------------------------------------------------------
  let mode = 'bg'; // 'bg' | 'game'
  let state = 'playing'; // 'playing' | 'gameover' | 'win'
  const keys = { up: false, down: false, left: false, right: false };
  let rafId = null;
  let lastTime = 0;

  function isSolid(tile, hasKey) {
    if (tile === '#') return true;
    if (tile === 'L') return !hasKey;
    return false;
  }

  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function playerRect(px, py) {
    return { x: px - player.w / 2, y: py - player.h / 2, w: player.w, h: player.h };
  }

  function collides(px, py) {
    const r = playerRect(px, py);
    const grid = rooms[currentRoomId].grid;
    const corners = [
      [r.x, r.y], [r.x + r.w, r.y], [r.x, r.y + r.h], [r.x + r.w, r.y + r.h],
    ];
    for (const [cx, cy] of corners) {
      const col = Math.floor(cx / TILE);
      const row = Math.floor(cy / TILE);
      if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return true;
      if (isSolid(grid[row][col], player.hasKey)) return true;
    }
    return false;
  }

  function showToast(text) {
    toastEl.textContent = text;
    toastEl.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }

  function checkItems() {
    const room = rooms[currentRoomId];
    const pr = playerRect(player.x, player.y);
    room.items.forEach((item) => {
      if (item.collected) return;
      const ir = { x: item.x - item.w / 2, y: item.y - item.h / 2, w: item.w, h: item.h };
      if (rectsOverlap(pr, ir)) {
        item.collected = true;
        if (item.type === 'key') player.hasKey = true;
        if (item.type === 'chest') {
          state = 'win';
          showEndScreen(winScreen);
          return;
        }
        player.inventory.push(item.type);
        showToast(item.label);
      }
    });
  }

  function checkDoors() {
    const room = rooms[currentRoomId];
    const pr = playerRect(player.x, player.y);
    for (const door of room.doors) {
      const dr = {
        x: door.col * TILE,
        y: door.rows[0] * TILE,
        w: TILE,
        h: door.rows.length * TILE,
      };
      if (rectsOverlap(pr, dr)) {
        if (door.requiresKey && !player.hasKey) continue;
        currentRoomId = door.toRoom;
        player.x = door.spawn.x;
        player.y = door.spawn.y;
        return;
      }
    }
  }

  function checkEnemyTouch() {
    if (player.invulnTimer > 0) return;
    const room = rooms[currentRoomId];
    const pr = playerRect(player.x, player.y);
    for (const e of room.enemies) {
      if (!e.alive) continue;
      const er = { x: e.x - e.w / 2, y: e.y - e.h / 2, w: e.w, h: e.h };
      if (rectsOverlap(pr, er)) {
        player.hearts -= 1;
        player.invulnTimer = 900;
        const dx = player.x - e.x;
        const dy = player.y - e.y;
        const dist = Math.hypot(dx, dy) || 1;
        player.x += (dx / dist) * 14;
        player.y += (dy / dist) * 14;
        if (player.hearts <= 0) {
          state = 'gameover';
          showEndScreen(gameOverScreen);
        }
        return;
      }
    }
  }

  function tryAttack() {
    if (player.attackTimer > 0) return;
    player.attacking = true;
    player.attackTimer = 220;
    player.attackHitEnemies = new Set();
  }

  // Angriffs-Hitbox wird aus der AKTUELLEN Spielerposition berechnet, damit sie
  // mitwandert, falls sich der Spieler während des Schwungs noch bewegt.
  function getAttackHitbox() {
    const reach = 14;
    let hx = player.x, hy = player.y;
    if (player.facing === 'up') hy -= reach;
    if (player.facing === 'down') hy += reach;
    if (player.facing === 'left') hx -= reach;
    if (player.facing === 'right') hx += reach;
    return { x: hx - 9, y: hy - 9, w: 18, h: 18 };
  }

  // Trifft über die gesamte aktive Schwungdauer (nicht nur einen Frame), prüft
  // aber jeden Gegner pro Schwung nur einmal (attackHitEnemies-Set).
  const ATTACK_ACTIVE_WINDOW = 160;
  function updateAttackHits() {
    if (player.attackTimer <= 0 || player.attackTimer < 220 - ATTACK_ACTIVE_WINDOW) return;
    const hitbox = getAttackHitbox();
    const room = rooms[currentRoomId];
    room.enemies.forEach((e) => {
      if (!e.alive || player.attackHitEnemies.has(e)) return;
      const er = { x: e.x - e.w / 2, y: e.y - e.h / 2, w: e.w, h: e.h };
      if (rectsOverlap(hitbox, er)) {
        player.attackHitEnemies.add(e);
        e.hp -= 1;
        if (e.hp <= 0) {
          e.alive = false;
          maybeDropLoot(e, room);
        }
      }
    });
  }

  // 75% Chance auf einen Drop (Herz oder Gold, je 50/50), wenn ein Gegner besiegt wird
  function maybeDropLoot(enemy, room) {
    if (Math.random() >= 0.75) return;
    const type = Math.random() < 0.5 ? 'heart' : 'gold';
    room.drops.push({ type, x: enemy.x, y: enemy.y, w: 10, h: 10, ttl: 6000 });
  }

  function updateDrops(dt) {
    const room = rooms[currentRoomId];
    const pr = playerRect(player.x, player.y);
    room.drops = room.drops.filter((d) => {
      d.ttl -= dt * 1000;
      if (d.ttl <= 0) return false;
      const dr = { x: d.x - d.w / 2, y: d.y - d.h / 2, w: d.w, h: d.h };
      if (rectsOverlap(pr, dr)) {
        if (d.type === 'heart') {
          if (player.hearts < player.maxHearts) {
            player.hearts += 1;
            showToast('❤ Herz gefunden!');
          } else {
            showToast('❤ Herz war schon voll, nichts passiert.');
          }
        } else {
          player.gold += 1;
          showToast(`💰 Gold gefunden! (${player.gold})`);
        }
        return false;
      }
      return true;
    });
  }

  function updatePlayer(dt) {
    let dx = 0, dy = 0;
    if (keys.up) dy -= 1;
    if (keys.down) dy += 1;
    if (keys.left) dx -= 1;
    if (keys.right) dx += 1;

    player.moving = dx !== 0 || dy !== 0;
    if (player.moving) {
      const len = Math.hypot(dx, dy);
      dx /= len; dy /= len;
      player.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    }

    const speed = 70;
    const nx = player.x + dx * speed * dt;
    const ny = player.y + dy * speed * dt;

    if (!collides(nx, player.y)) player.x = nx;
    if (!collides(player.x, ny)) player.y = ny;

    checkDoors();
    checkItems();
    checkEnemyTouch();
  }

  function updateEnemies(dt) {
    const room = rooms[currentRoomId];
    room.enemies.forEach((e) => {
      if (!e.alive) return;
      const dx = player.x - e.x;
      const dy = player.y - e.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 55) {
        e.x += (dx / dist) * e.speed * dt;
        e.y += (dy / dist) * e.speed * dt;
      } else {
        const target = e.dir === 1 ? e.patrolTo : e.patrolFrom;
        const pdx = target.x - e.x;
        const pdy = target.y - e.y;
        const pdist = Math.hypot(pdx, pdy);
        if (pdist < 2) {
          e.dir *= -1;
        } else {
          e.x += (pdx / pdist) * e.speed * dt;
          e.y += (pdy / pdist) * e.speed * dt;
        }
      }
    });
  }

  function drawTile(ctx, tile, x, y) {
    if (tile === '#') {
      ctx.fillStyle = COLORS.wall;
      ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = COLORS.wallEdge;
      ctx.fillRect(x, y, TILE, 2);
    } else if (tile === 'L') {
      ctx.fillStyle = COLORS.locked;
      ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = COLORS.lockedEdge;
      for (let i = 2; i < TILE; i += 6) ctx.fillRect(x + i, y, 2, TILE);
    } else {
      ctx.fillStyle = (Math.floor(x / TILE) + Math.floor(y / TILE)) % 2 === 0 ? COLORS.floor : COLORS.floorAlt;
      ctx.fillRect(x, y, TILE, TILE);
    }
  }

  function drawRoom() {
    const grid = rooms[currentRoomId].grid;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        drawTile(gameCtx, grid[r][c], c * TILE, r * TILE);
      }
    }
  }

  function drawItems() {
    rooms[currentRoomId].items.forEach((item) => {
      if (item.collected) return;
      const x = item.x, y = item.y;
      gameCtx.save();
      if (item.type === 'key') {
        gameCtx.fillStyle = COLORS.key;
        gameCtx.fillRect(x - 5, y - 2, 10, 4);
        gameCtx.fillRect(x + 3, y - 5, 4, 4);
      } else if (item.type === 'amulet') {
        gameCtx.fillStyle = COLORS.amulet;
        gameCtx.fillRect(x - 5, y - 5, 10, 10);
        gameCtx.fillStyle = '#0b0716';
        gameCtx.fillRect(x - 2, y - 2, 4, 4);
      } else if (item.type === 'scroll') {
        gameCtx.fillStyle = COLORS.scroll;
        gameCtx.fillRect(x - 6, y - 5, 12, 10);
        gameCtx.fillStyle = '#9a90c0';
        gameCtx.fillRect(x - 4, y - 2, 8, 1);
        gameCtx.fillRect(x - 4, y + 1, 8, 1);
      } else if (item.type === 'chest') {
        drawChestSprite(gameCtx, x - 9, y - 8, 18, 16, false);
      }
      gameCtx.restore();
    });
  }

  function drawDrops(t) {
    rooms[currentRoomId].drops.forEach((d) => {
      const bob = reduceMotion ? 0 : Math.sin(t / 200 + d.x) * 1.5;
      const fading = d.ttl < 1500 && Math.floor(d.ttl / 150) % 2 === 0;
      gameCtx.save();
      if (fading) gameCtx.globalAlpha = 0.35;
      if (d.type === 'heart') {
        gameCtx.fillStyle = '#e0475a';
        gameCtx.fillRect(d.x - 4, d.y - 2 + bob, 3, 3);
        gameCtx.fillRect(d.x + 1, d.y - 2 + bob, 3, 3);
        gameCtx.fillRect(d.x - 3, d.y + bob, 6, 2);
        gameCtx.fillRect(d.x - 1, d.y + 2 + bob, 2, 2);
      } else {
        gameCtx.fillStyle = '#ffd447';
        gameCtx.beginPath();
        gameCtx.arc(d.x, d.y + bob, 4, 0, Math.PI * 2);
        gameCtx.fill();
        gameCtx.fillStyle = '#a5652a';
        gameCtx.fillRect(d.x - 1, d.y - 1 + bob, 2, 2);
      }
      gameCtx.restore();
    });
  }

  function drawEnemies() {
    rooms[currentRoomId].enemies.forEach((e) => {
      if (!e.alive) return;
      const x = e.x, y = e.y;
      const bob = reduceMotion ? 0 : Math.sin(performance.now() / 220 + x) * 1;

      // Schatten
      gameCtx.fillStyle = 'rgba(0,0,0,0.35)';
      gameCtx.fillRect(x - e.w / 2, y + e.h / 2 - 1, e.w, 2);

      // Körper (Slime/Imp-artig, kein 1:1 Zelda-Design)
      gameCtx.fillStyle = COLORS.enemyDark;
      gameCtx.fillRect(x - e.w / 2, y - e.h / 2 + 4 + bob, e.w, e.h - 4);
      gameCtx.fillStyle = COLORS.enemy;
      gameCtx.fillRect(x - e.w / 2 + 1, y - e.h / 2 + 1 + bob, e.w - 2, e.h - 6);
      gameCtx.fillStyle = 'rgba(255,255,255,0.18)';
      gameCtx.fillRect(x - e.w / 2 + 2, y - e.h / 2 + 2 + bob, e.w - 6, 2);

      // Hörner
      gameCtx.fillStyle = '#2b1420';
      gameCtx.fillRect(x - e.w / 2 + 1, y - e.h / 2 - 2 + bob, 2, 4);
      gameCtx.fillRect(x + e.w / 2 - 3, y - e.h / 2 - 2 + bob, 2, 4);

      // Augen
      gameCtx.fillStyle = '#fff';
      gameCtx.fillRect(x - 4, y - 2 + bob, 3, 3);
      gameCtx.fillRect(x + 1, y - 2 + bob, 3, 3);
      gameCtx.fillStyle = '#1a0d14';
      gameCtx.fillRect(x - 3, y - 1 + bob, 1, 1);
      gameCtx.fillRect(x + 2, y - 1 + bob, 1, 1);
    });
  }

  function drawPlayer() {
    const x = player.x, y = player.y;
    const w = player.w, h = player.h;
    const flash = player.invulnTimer > 0 && Math.floor(player.invulnTimer / 100) % 2 === 0;
    gameCtx.save();
    if (flash) gameCtx.globalAlpha = 0.4;

    // Schatten
    gameCtx.fillStyle = 'rgba(0,0,0,0.35)';
    gameCtx.fillRect(x - w / 2, y + h / 2 - 1, w, 2);

    // Schild (nur sichtbar, wenn nicht gerade angegriffen wird)
    if (player.attackTimer <= 0) {
      const shieldOffsetX = player.facing === 'left' ? w / 2 - 2 : -w / 2 - 2;
      gameCtx.fillStyle = '#caa24a';
      gameCtx.fillRect(x + shieldOffsetX, y - 3, 4, 8);
      gameCtx.fillStyle = '#8a6a1e';
      gameCtx.fillRect(x + shieldOffsetX + 1, y - 1, 2, 4);
    }

    // Tunika / Körper
    gameCtx.fillStyle = COLORS.playerDark;
    gameCtx.fillRect(x - w / 2, y - h / 2 + 5, w, h - 5);
    gameCtx.fillStyle = COLORS.player;
    gameCtx.fillRect(x - w / 2, y - h / 2 + 3, w, h - 8);
    gameCtx.fillStyle = '#2c8a5f';
    gameCtx.fillRect(x - w / 2, y + h / 2 - 5, w, 2); // Gürtel

    // Kopf + Haube (angelehnt, aber bewusst andersfarbig/-form als das Vorbild)
    gameCtx.fillStyle = '#e8c9a0';
    gameCtx.fillRect(x - 3, y - h / 2 + 1, 6, 4);
    gameCtx.fillStyle = '#3d6b8a';
    gameCtx.beginPath();
    gameCtx.moveTo(x - 4, y - h / 2 + 2);
    gameCtx.lineTo(x + 4, y - h / 2 + 2);
    gameCtx.lineTo(x, y - h / 2 - 5);
    gameCtx.closePath();
    gameCtx.fill();
    gameCtx.fillStyle = '#e8d979';
    gameCtx.fillRect(x - 1, y - h / 2 - 2, 2, 2);

    if (player.attackTimer > 0) {
      gameCtx.fillStyle = COLORS.sword;
      if (player.facing === 'up') gameCtx.fillRect(x - 2, y - 20, 4, 12);
      if (player.facing === 'down') gameCtx.fillRect(x - 2, y + 8, 4, 12);
      if (player.facing === 'left') gameCtx.fillRect(x - 20, y - 2, 12, 4);
      if (player.facing === 'right') gameCtx.fillRect(x + 8, y - 2, 12, 4);
      gameCtx.fillStyle = '#caa24a';
      if (player.facing === 'up') gameCtx.fillRect(x - 3, y - 10, 6, 2);
      if (player.facing === 'down') gameCtx.fillRect(x - 3, y + 8, 6, 2);
      if (player.facing === 'left') gameCtx.fillRect(x - 10, y - 3, 2, 6);
      if (player.facing === 'right') gameCtx.fillRect(x + 8, y - 3, 2, 6);
    }
    gameCtx.restore();
  }

  function drawGameFrame() {
    gameCtx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    drawRoom();
    drawItems();
    drawDrops(performance.now());
    drawEnemies();
    drawPlayer();
  }

  function updateHUD() {
    let hearts = '';
    for (let i = 0; i < player.maxHearts; i++) {
      hearts += i < player.hearts ? '❤' : '🖤';
    }
    heartsEl.textContent = hearts;

    const icons = { key: '🗝', amulet: '🔷', scroll: '📜' };
    const invText = player.inventory.map((t) => icons[t] || '').join(' ');
    inventoryEl.textContent = `${invText}  💰${player.gold}`.trim();
  }

  function showEndScreen(screenEl) {
    hideEndScreens();
    screenEl.classList.remove('hidden');
  }

  function gameLoop(ts) {
    if (state !== 'playing') {
      rafId = null;
      return;
    }
    if (!lastTime) lastTime = ts;
    const dt = Math.min((ts - lastTime) / 1000, 0.05);
    lastTime = ts;

    if (player.invulnTimer > 0) player.invulnTimer -= dt * 1000;
    if (player.attackTimer > 0) player.attackTimer -= dt * 1000;

    updatePlayer(dt);
    updateEnemies(dt);
    updateAttackHits();
    updateDrops(dt);
    drawGameFrame();
    updateHUD();

    rafId = requestAnimationFrame(gameLoop);
  }

  function startGameLoop() {
    state = 'playing';
    lastTime = 0;
    updateHUD();
    if (!rafId) rafId = requestAnimationFrame(gameLoop);
  }

  // ------------------------------------------------------------------
  // Steuerung
  // ------------------------------------------------------------------
  const MOVE_KEYS = {
    ArrowUp: 'up', w: 'up', W: 'up',
    ArrowDown: 'down', s: 'down', S: 'down',
    ArrowLeft: 'left', a: 'left', A: 'left',
    ArrowRight: 'right', d: 'right', D: 'right',
  };

  function onKeyDown(e) {
    if (e.key === 'Escape') { closeGame(); return; }
    if (MOVE_KEYS[e.key]) {
      keys[MOVE_KEYS[e.key]] = true;
      e.preventDefault();
    } else if (e.key === ' ') {
      if (!e.repeat) tryAttack();
      e.preventDefault();
    }
  }

  function onKeyUp(e) {
    if (MOVE_KEYS[e.key]) {
      keys[MOVE_KEYS[e.key]] = false;
      e.preventDefault();
    }
  }

  function setupTouchControls() {
    overlay.querySelectorAll('.eg-dpad-btn').forEach((btn) => {
      const dir = btn.getAttribute('data-dir');
      const setKey = (val) => (e) => { e.preventDefault(); keys[dir] = val; };
      btn.addEventListener('pointerdown', setKey(true));
      btn.addEventListener('pointerup', setKey(false));
      btn.addEventListener('pointerleave', setKey(false));
      btn.addEventListener('pointercancel', setKey(false));
    });
    const attackBtn = overlay.querySelector('#eg-attack-btn');
    attackBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); tryAttack(); });
  }

  // ------------------------------------------------------------------
  // Öffnen / Schließen
  // ------------------------------------------------------------------
  function openGame() {
    if (mode === 'game') return;
    mode = 'game';
    stopIdleLoop();
    resetGame();
    hideEndScreens();

    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    touchControlsEl.classList.toggle('active', isCoarse);
    overlay.classList.toggle('has-touch-controls', isCoarse);

    startGameLoop();
    showIntro(() => {
      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);
    });

    updateRotateHint(isCoarse);
    window.addEventListener('orientationchange', onOrientationChange);
    screen.orientation?.addEventListener?.('change', onOrientationChange);
  }

  function isPortrait() {
    return window.matchMedia('(orientation: portrait)').matches;
  }

  function updateRotateHint(isCoarse) {
    if (!rotateHintEl) return;
    const show = isCoarse && isPortrait();
    rotateHintEl.classList.toggle('show', show);
    if (show) {
      clearTimeout(updateRotateHint._t);
      updateRotateHint._t = setTimeout(() => rotateHintEl.classList.remove('show'), 4500);
    }
  }

  function onOrientationChange() {
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    updateRotateHint(isCoarse);
  }

  function closeGame() {
    if (mode !== 'game') return;
    mode = 'bg';
    state = 'idle';
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }

    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('orientationchange', onOrientationChange);
    screen.orientation?.removeEventListener?.('change', onOrientationChange);
    if (introDismissKeyHandler) {
      window.removeEventListener('keydown', introDismissKeyHandler);
      introDismissKeyHandler = null;
    }
    introScreen.classList.add('hidden');
    if (rotateHintEl) rotateHintEl.classList.remove('show');
    Object.keys(keys).forEach((k) => { keys[k] = false; });

    overlay.classList.add('hidden');
    document.body.style.overflow = '';

    startIdleLoop();
  }

  // ------------------------------------------------------------------
  // Init
  // ------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    buildBackgroundCanvas();
    buildOverlay();
    if (bgCtx) {
      drawIdleFrame(0);
      startIdleLoop();
    }
  });

  // Kleiner Debug-Hook (z.B. für QA in der Konsole): window.__eg.openGame()
  window.__eg = { openGame, closeGame };
})();
