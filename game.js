import {
  LOGICAL_WIDTH,
  LOGICAL_HEIGHT,
  ASSETS,
  CoordinateMapper,
  UnifiedInputManager,
  CanvasBrush,
  DragItem,
  traceBaubleShape,
  traceSleighBodyPath,
  drawStockingComposite,
  renderLevel1Scene,
  renderLevel2Scene,
  renderLevel3Scene,
  renderLevel4Scene,
  renderLevel5Scene,
  renderLevel6Scene,
  renderLevel7Scene,
  renderLevel8Scene,
  renderLevel9Scene,
  renderLevel10Scene,
  renderLevel11Scene,
  drawToySilhouetteComposite,
  drawCookieComposite,
  drawReindeerBlanketComposite,
  drawSignboardComposite,
  drawSleighPanelComposite,
  drawWrappedGiftComposite,
  drawVillageFlagComposite,
  WORKSHOP_SHELVES,
  WORKSHOP_SACK_ZONE,
  BAKERY_WORKSTATIONS,
  STABLE_REINDEER_FRAMES,
  TOWN_STREETLAMP_HITBOXES,
  LAUNCHPAD_BELL_HITBOX,
  LAUNCHPAD_SLEIGH_ZONES,
  IsometricGrid,
  getIsoGroundOffsetRatio,
  renderThumbnailDataURL,
  roundRectPath,
  shadeColor
} from './components.js';

const STORAGE_KEY = 'christmas_decorating_fun_save_v1';

const GAME_STATES = {
  MAIN_MENU: 'MainMenu',
  LEVEL_SELECT: 'LevelSelect',
  PLAYING: 'Playing',
  DESIGNING: 'Designing'
};

const TREE_PALETTES = [
  { id: 'spruce', name: 'Classic Spruce', swatch: '#1f633f', light: '#2f7a53', mid: '#1b5336', dark: '#0c2c1b' },
  { id: 'blue', name: 'Blue Spruce', swatch: '#2e6f7e', light: '#4794a5', mid: '#265c6b', dark: '#102b36' },
  { id: 'frost', name: 'Alpine Frost', swatch: '#cbd5e1', light: '#f1f5f9', mid: '#94a3b8', dark: '#475569' },
  { id: 'emerald', name: 'Royal Pine', swatch: '#15803d', light: '#22c55e', mid: '#15803d', dark: '#052e16' },
  { id: 'plum', name: 'Winter Berry', swatch: '#6d28d9', light: '#8b5cf6', mid: '#5b21b6', dark: '#2e1065' }
];

const HOUSE_COLORS = [
  { name: 'Barn Crimson', color: '#8c2d2d' },
  { name: 'Sage Clapboard', color: '#3b6255' },
  { name: 'Nordic Navy', color: '#28405c' },
  { name: 'Warm Cream', color: '#c4b49a' },
  { name: 'Slate Stone', color: '#475569' }
];

const STUDIO_PAINT_COLORS = [
  '#ffffff',
  '#facc15',
  '#ef4444',
  '#22c55e',
  '#38bdf8',
  '#f472b6',
  '#a855f7',
  '#1e293b'
];

const STOCKING_FABRICS = ['#b91c1c', '#15803d', '#1d4ed8', '#7e22ce', '#9a3412', '#334155'];
const STOCKING_CUFFS = ['#f5efe2', '#fef3c7', '#e2e8f0', '#fecaca', '#bbf7d0', '#d4a353'];

const LIGHT_SCHEMES = [
  { id: 'multi', name: 'Multi-Color', swatch: '#f43f5e', colors: ['#ff4d4d', '#ffd166', '#38bdf8', '#4ade80', '#f472b6'] },
  { id: 'warm', name: 'Warm Gold', swatch: '#fbbf24', colors: ['#fef9c3', '#fde047', '#fbbf24', '#f59e0b'] },
  { id: 'ice', name: 'Ice Blue', swatch: '#38bdf8', colors: ['#f0f9ff', '#bae6fd', '#38bdf8', '#0284c7'] },
  { id: 'candy', name: 'Candy Cane', swatch: '#ef4444', colors: ['#ef4444', '#ffffff', '#dc2626', '#fef2f2'] },
  { id: 'emerald', name: 'Holly Green', swatch: '#22c55e', colors: ['#86efac', '#4ade80', '#22c55e', '#fde047'] },
  { id: 'berry', name: 'Berry Violet', swatch: '#c084fc', colors: ['#f472b6', '#c084fc', '#e879f9', '#38bdf8'] }
];

const STREAMER_SCHEMES = [
  { id: 'festive', name: 'Festive Trio', swatch: '#dc2626', colors: ['#dc2626', '#d4a353', '#15803d'] },
  { id: 'winter', name: 'Frost & Silver', swatch: '#38bdf8', colors: ['#38bdf8', '#e2e8f0', '#1d4ed8'] },
  { id: 'champagne', name: 'Gold & Ivory', swatch: '#d4a353', colors: ['#d4a353', '#fef3c7', '#b45309'] },
  { id: 'berry', name: 'Berry Party', swatch: '#db2777', colors: ['#db2777', '#9333ea', '#facc15'] },
  { id: 'evergreen', name: 'Pine & Mint', swatch: '#15803d', colors: ['#15803d', '#4ade80', '#fef3c7'] }
];

const BALLOON_COLORS = ['#dc2626', '#d4a353', '#15803d', '#2563eb', '#db2777', '#9333ea'];

const TINSEL_PALETTES = [
  { id: 'gold', name: 'Classic Gold', swatch: '#eab308', edge: '#c89b3c', center: '#fff3c4', glow: 'rgba(255, 232, 160, 0.5)' },
  { id: 'silver', name: 'Frost Silver', swatch: '#cbd5e1', edge: '#94a3b8', center: '#ffffff', glow: 'rgba(226, 232, 240, 0.55)' },
  { id: 'ruby', name: 'Ruby Red', swatch: '#ef4444', edge: '#b91c1c', center: '#fecaca', glow: 'rgba(248, 113, 113, 0.5)' },
  { id: 'ice', name: 'Ice Blue', swatch: '#38bdf8', edge: '#0284c7', center: '#e0f2fe', glow: 'rgba(56, 189, 248, 0.55)' },
  { id: 'emerald', name: 'Emerald', swatch: '#22c55e', edge: '#15803d', center: '#bbf7d0', glow: 'rgba(74, 222, 128, 0.5)' },
  { id: 'rose', name: 'Rose Pink', swatch: '#f472b6', edge: '#db2777', center: '#fce7f3', glow: 'rgba(244, 114, 182, 0.5)' }
];

const GIFT_SCHEMES = [
  { color: '#b91c1c', ribbonColor: '#f5d07a' },
  { color: '#15803d', ribbonColor: '#fef3c7' },
  { color: '#1d4ed8', ribbonColor: '#e2e8f0' },
  { color: '#7e22ce', ribbonColor: '#facc15' },
  { color: '#f8fafc', ribbonColor: '#dc2626' },
  { color: '#d97706', ribbonColor: '#991b1b' }
];

const WALLPAPER_PALETTES = [
  { id: 'hearth_umber', name: 'Warm Hearth', swatch: '#4a2b1e', top: '#3a2218', mid: '#251713', bot: '#120b09' },
  { id: 'teal_slate', name: 'Teal Slate', swatch: '#294b57', top: '#182b33', mid: '#213a43', bot: '#142329' },
  { id: 'deep_pine', name: 'Deep Pine', swatch: '#214d39', top: '#294a3b', mid: '#182d24', bot: '#0c1813' },
  { id: 'burgundy', name: 'Burgundy Velvet', swatch: '#6b232e', top: '#591e27', mid: '#381118', bot: '#1a070b' },
  { id: 'midnight', name: 'Midnight Navy', swatch: '#233b66', top: '#1e2f4f', mid: '#131e36', bot: '#090f1d' },
  { id: 'ivory', name: 'Cream Plaster', swatch: '#cfc4b0', top: '#c7bca8', mid: '#a39680', bot: '#786c58' },
  { id: 'plum', name: 'Winter Plum', swatch: '#4f2c59', top: '#43254d', mid: '#28152e', bot: '#130917' }
];

const SNOW_SPEEDS = [
  { label: 'Slow', value: 0.4 },
  { label: 'Med', value: 1 },
  { label: 'Fast', value: 2 },
  { label: 'Blizzard', value: 3.2 }
];

class SoundFX {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  _ensureCtx() {
    if (!this.enabled) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playTone(freq, duration = 0.14, type = 'sine', gainVal = 0.08) {
    const ctx = this._ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(gainVal, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  playPlace() {
    this.playTone(587.33, 0.1, 'triangle', 0.08);
    setTimeout(() => this.playTone(880, 0.16, 'sine', 0.07), 55);
  }

  playSave() {
    this.playTone(523.25, 0.11, 'sine', 0.07);
    setTimeout(() => this.playTone(659.25, 0.12, 'sine', 0.07), 80);
    setTimeout(() => this.playTone(783.99, 0.2, 'sine', 0.08), 160);
  }

  playChime() {
    this.playTone(1046.5, 0.22, 'sine', 0.06);
  }

  playSleighBells() {
    const notes = [1318.5, 1567.98, 2093.0, 1760.0];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 0.16, 'triangle', 0.065), idx * 45);
    });
  }
}

class ChristmasMusicPlayer {
  constructor(soundFX) {
    this.sound = soundFX;
    this.enabled = true;
    this.timerId = null;
    this.noteIndex = 0;

    this.NOTES = {
      C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
      C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
      C6: 1046.50, REST: 0
    };

    this.MELODIES = {
      menu: [
        ['E5', 0.4], ['E5', 0.4], ['E5', 0.8],
        ['E5', 0.4], ['E5', 0.4], ['E5', 0.8],
        ['E5', 0.4], ['G5', 0.4], ['C5', 0.4], ['D5', 0.4], ['E5', 1.6]
      ],
      level0: [ // Jingle Bells
        ['E5', 0.3], ['E5', 0.3], ['E5', 0.6],
        ['E5', 0.3], ['E5', 0.3], ['E5', 0.6],
        ['E5', 0.3], ['G5', 0.3], ['C5', 0.45], ['D5', 0.15], ['E5', 1.2],
        ['F5', 0.3], ['F5', 0.3], ['F5', 0.45], ['F5', 0.15], ['F5', 0.3], ['E5', 0.3], ['E5', 0.3], ['E5', 0.15], ['E5', 0.15],
        ['E5', 0.3], ['D5', 0.3], ['D5', 0.3], ['E5', 0.3], ['D5', 0.6], ['G5', 0.6]
      ],
      level1: [ // We Wish You A Merry Christmas
        ['G4', 0.4], ['C5', 0.4], ['C5', 0.2], ['D5', 0.2], ['C5', 0.2], ['B4', 0.2], ['A4', 0.4], ['A4', 0.4],
        ['A4', 0.4], ['D5', 0.4], ['D5', 0.2], ['E5', 0.2], ['D5', 0.2], ['C5', 0.2], ['B4', 0.4], ['G4', 0.4],
        ['G4', 0.4], ['E5', 0.4], ['E5', 0.2], ['F5', 0.2], ['E5', 0.2], ['D5', 0.2], ['C5', 0.4], ['A4', 0.4],
        ['G4', 0.3], ['G4', 0.3], ['A4', 0.4], ['D5', 0.4], ['B4', 0.4], ['C5', 1.2]
      ],
      level2: [ // Deck the Halls
        ['G5', 0.6], ['F5', 0.2], ['E5', 0.4], ['D5', 0.4], ['C5', 0.8], ['D5', 0.4], ['E5', 0.4], ['C5', 0.4],
        ['D5', 0.2], ['E5', 0.2], ['F5', 0.2], ['G5', 0.2], ['E5', 0.4], ['D5', 0.6], ['C5', 1.2],
        ['G5', 0.6], ['F5', 0.2], ['E5', 0.4], ['D5', 0.4], ['C5', 0.8], ['D5', 0.4], ['E5', 0.4], ['C5', 0.4],
        ['D5', 0.4], ['E5', 0.4], ['D5', 0.4], ['C5', 1.6]
      ],
      level3: [ // Silent Night
        ['G5', 0.8], ['A5', 0.4], ['G5', 0.8], ['E5', 2.0],
        ['G5', 0.8], ['A5', 0.4], ['G5', 0.8], ['E5', 2.0],
        ['D6', 1.2], ['D6', 0.4], ['B5', 2.0],
        ['C6', 1.2], ['C6', 0.4], ['G5', 2.0]
      ],
      level4: [ // Jolly Old St Nicholas (Toy Workshop)
        ['E5', 0.32], ['E5', 0.32], ['E5', 0.32], ['E5', 0.32], ['D5', 0.32], ['D5', 0.32], ['D5', 0.64],
        ['C5', 0.32], ['C5', 0.32], ['C5', 0.32], ['C5', 0.32], ['E5', 0.96], ['REST', 0.32],
        ['A4', 0.32], ['A4', 0.32], ['A4', 0.32], ['A4', 0.32], ['G4', 0.32], ['C5', 0.32], ['E5', 0.64],
        ['D5', 0.32], ['C5', 0.32], ['D5', 0.32], ['E5', 0.32], ['D5', 1.1]
      ],
      level5: [ // Up on the Housetop (Gingerbread Bakery)
        ['G5', 0.35], ['G5', 0.2], ['A5', 0.2], ['G5', 0.35], ['E5', 0.35], ['C5', 0.35], ['E5', 0.35], ['G5', 0.7],
        ['A5', 0.35], ['A5', 0.35], ['G5', 0.35], ['E5', 0.35], ['D5', 0.35], ['G5', 0.35], ['G5', 0.7],
        ['G5', 0.35], ['G5', 0.2], ['A5', 0.2], ['G5', 0.35], ['E5', 0.35], ['C5', 0.35], ['E5', 0.35], ['G5', 0.7],
        ['A5', 0.35], ['A5', 0.35], ['G5', 0.35], ['F5', 0.35], ['E5', 0.35], ['D5', 0.35], ['C5', 0.9]
      ],
      level6: [ // Joy to the World (North Pole Stable)
        ['C6', 0.6], ['B5', 0.45], ['A5', 0.18], ['G5', 0.75], ['F5', 0.32], ['E5', 0.55], ['D5', 0.55], ['C5', 0.95],
        ['G5', 0.35], ['A5', 0.75], ['A5', 0.35], ['B5', 0.75], ['B5', 0.35], ['C6', 1.1]
      ],
      level7: [ // Hark! The Herald Angels Sing (Town Square)
        ['G4', 0.45], ['C5', 0.45], ['C5', 0.65], ['B4', 0.25], ['C5', 0.45], ['E5', 0.45], ['E5', 0.45], ['D5', 0.8],
        ['G5', 0.45], ['G5', 0.45], ['G5', 0.65], ['F5', 0.25], ['E5', 0.45], ['D5', 0.45], ['E5', 0.9]
      ],
      level8: [ // Carol of the Bells motif (Sleigh Launchpad)
        ['A5', 0.35], ['G5', 0.18], ['A5', 0.18], ['F5', 0.35],
        ['A5', 0.35], ['G5', 0.18], ['A5', 0.18], ['F5', 0.35],
        ['A5', 0.35], ['G5', 0.18], ['A5', 0.18], ['F5', 0.35],
        ['E5', 0.35], ['D5', 0.18], ['E5', 0.18], ['C5', 0.5]
      ],
      level9: [ // O Christmas Tree (Gift Wrapping Station)
        ['G4', 0.4], ['C5', 0.4], ['C5', 0.2], ['C5', 0.45], ['D5', 0.4], ['E5', 0.4], ['E5', 0.2], ['E5', 0.6],
        ['E5', 0.25], ['D5', 0.25], ['E5', 0.25], ['F5', 0.45], ['B4', 0.45], ['D5', 0.45], ['C5', 0.9]
      ],
      level10: [ // Winter Wonderland / Festive Waltz (Bonus Village Diorama)
        ['G5', 0.5], ['E5', 0.35], ['G5', 0.35], ['C6', 0.7], ['B5', 0.35], ['A5', 0.35], ['G5', 0.8],
        ['F5', 0.4], ['D5', 0.4], ['F5', 0.4], ['A5', 0.7], ['G5', 0.4], ['F5', 0.4], ['E5', 0.9]
      ]
    };

    this.startLoop();
  }

  startLoop() {
    const playNextNote = () => {
      if (!this.enabled || !this.sound || !this.sound.enabled) {
        this.timerId = setTimeout(playNextNote, 400);
        return;
      }

      let melodyKey = 'menu';
      if (window.yuletideGame) {
        const game = window.yuletideGame;
        if (game.state === GAME_STATES.PLAYING || game.state === GAME_STATES.DESIGNING) {
          melodyKey = `level${game.activeLevelIndex}`;
        }
      }

      const melody = this.MELODIES[melodyKey] || this.MELODIES.menu;
      const notePair = melody[this.noteIndex % melody.length];
      this.noteIndex = (this.noteIndex + 1) % melody.length;

      const [noteName, duration] = notePair;
      const freq = this.NOTES[noteName];
      if (freq && freq > 0) {
        this.sound.playTone(freq, duration * 0.85, 'triangle', 0.045);
      }

      this.timerId = setTimeout(playNextNote, duration * 1000);
    };

    playNextNote();
  }

  stop() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }
}

class ChristmasDecoratorGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.sound = new SoundFX();
    this.music = new ChristmasMusicPlayer(this.sound);

    this.destroyed = false;
    this.rafId = null;
    this.inputManagers = [];

    this.state = GAME_STATES.MAIN_MENU;
    this.activeLevelIndex = 0;
    this.elapsed = 0;
    this.lastFrameTime = performance.now();

    // Interactive state for dragging & hover
    this.selectedItemId = null;
    this.draggingItem = null;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;
    this.dragMoved = false;
    this.dragStartPt = null;
    this.hoverPt = { x: -1, y: -1 };
    this.trayDragPayload = null;
    this.lastTrayTouchTime = 0;

    // Ambient snow particles for Menu & Level 4 Garden
    this.snowParticles = Array.from({ length: 75 }, () => ({
      x: Math.random() * LOGICAL_WIDTH,
      y: Math.random() * LOGICAL_HEIGHT,
      r: 1.4 + Math.random() * 2.8,
      vy: 28 + Math.random() * 44,
      vx: -12 + Math.random() * 24
    }));

    // Canvas UI button regions for MainMenu and LevelSelect
    this.menuHitBoxes = [];
    this.levelSelectHitBoxes = [];

    // Initialize 4 Levels & restore any saved progress
    this.levels = this.createInitialLevels();
    this.loadProgress();

    // Initialize DOM refs & studio subsystems
    this.cacheDom();
    this.initStudios();
    this.bindEvents();
    this.syncUI();

    this.rafId = requestAnimationFrame((ts) => this.tick(ts));
  }

  cacheDom() {
    this.dom = {
      btnMenu: document.getElementById('btnMenu'),
      btnLevels: document.getElementById('btnLevels'),
      hudTitle: document.getElementById('hudTitle'),
      hudMeta: document.getElementById('hudMeta'),
      btnAudio: document.getElementById('btnAudio'),
      btnMusic: document.getElementById('btnMusic'),
      btnUndo: document.getElementById('btnUndo'),
      btnClearLevel: document.getElementById('btnClearLevel'),
      btnTakePhoto: document.getElementById('btnTakePhoto'),
      btnOpenStudio: document.getElementById('btnOpenStudio'),
      selectionControls: document.getElementById('selectionControls'),
      selectedItemName: document.getElementById('selectedItemName'),
      btnCycleColor: document.getElementById('btnCycleColor'),
      btnScaleDown: document.getElementById('btnScaleDown'),
      btnScaleUp: document.getElementById('btnScaleUp'),
      btnRotate: document.getElementById('btnRotate'),
      btnDuplicateItem: document.getElementById('btnDuplicateItem'),
      btnDeleteItem: document.getElementById('btnDeleteItem'),
      bottomDock: document.getElementById('bottomDock'),
      levelQuickControls: document.getElementById('levelQuickControls'),
      inventoryTray: document.getElementById('inventoryTray'),
      dragGhost: document.getElementById('dragGhost'),
      designerOverlay: document.getElementById('designerOverlay'),
      designerModalTitle: document.getElementById('designerModalTitle'),
      designerModalSubtitle: document.getElementById('designerModalSubtitle'),
      btnCloseModal: document.getElementById('btnCloseModal'),
      photoOverlay: document.getElementById('photoOverlay'),
      photoPreviewImg: document.getElementById('photoPreviewImg'),
      btnClosePhoto: document.getElementById('btnClosePhoto'),
      btnSharePhoto: document.getElementById('btnSharePhoto'),
      btnDownloadPhoto: document.getElementById('btnDownloadPhoto')
    };
  }

  createInitialLevels() {
    const windowPanes = [];
    const winX = 340;
    const winY = 80;
    const paneW = 600 / 3;
    const paneH = 370 / 2;
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 3; c++) {
        windowPanes.push({
          rect: { x: winX + c * paneW, y: winY + r * paneH, w: paneW, h: paneH }
        });
      }
    }

    return [
      {
        id: 0,
        title: 'Level 1 · Evergreen Tree',
        shortTitle: 'Christmas Tree',
        studioButtonLabel: 'Bauble Studio',
        studioId: 'baubleStudio',
        studioTitle: 'Custom Bauble Designer',
        studioSubtitle: 'Choose a profile, paint a custom ornament, and hang it on the tree',
        settings: {
          treePalette: TREE_PALETTES[0],
          tinselPalette: TINSEL_PALETTES[0],
          showTinsel: true,
          showLights: true,
          lightScheme: LIGHT_SCHEMES[0],
          lightColors: LIGHT_SCHEMES[0].colors
        },
        dropZones: [
          {
            name: 'Tree Canopy',
            polygon: [
              { x: 640, y: 65 },
              { x: 945, y: 575 },
              { x: 335, y: 575 }
            ]
          },
          {
            name: 'Under Tree Floor',
            rect: { x: 260, y: 550, w: 760, h: 135 }
          }
        ],
        placedItems: [],
        undoStack: [],
        inventory: this.buildInventory([
          { type: 'bauble_red', label: 'Ruby Bauble', width: 46, height: 46 },
          { type: 'bauble_gold', label: 'Gold Bauble', width: 46, height: 46 },
          { type: 'star_topper', label: 'Star Topper', width: 70, height: 70 },
          { type: 'angel_topper', label: 'Angel Topper', width: 72, height: 84 },
          { type: 'candy_cane', label: 'Candy Cane', width: 46, height: 56 },
          { type: 'bell', label: 'Brass Bell', width: 46, height: 46 },
          { type: 'pine_cone', label: 'Pine Cone', width: 44, height: 48 },
          { type: 'gift_box', label: 'Wrapped Gift', width: 64, height: 52, customData: { ...GIFT_SCHEMES[0] } },
          { type: 'gift_tall', label: 'Tall Present', width: 52, height: 72, customData: { ...GIFT_SCHEMES[1] } }
        ])
      },
      {
        id: 1,
        title: 'Level 2 · Hearth & Mantle',
        shortTitle: 'Fireplace',
        studioButtonLabel: 'Stocking Creator',
        studioId: 'stockingStudio',
        studioTitle: 'Family Stocking Creator',
        studioSubtitle: 'Pick fabric colors, embroider a family name, and hang it along the mantle',
        settings: {
          fireBoost: false,
          wallpaperPalette: WALLPAPER_PALETTES[0],
          lightScheme: LIGHT_SCHEMES[0],
          lightColors: LIGHT_SCHEMES[0].colors
        },
        stockings: [
          { name: 'Clara', bodyColor: '#b91c1c', cuffColor: '#f5efe2', accentCanvas: null },
          { name: 'Arthur', bodyColor: '#15803d', cuffColor: '#fef3c7', accentCanvas: null }
        ],
        dropZones: [
          {
            name: 'Mantle & Hearth',
            rect: { x: 230, y: 40, w: 820, h: 580 }
          }
        ],
        placedItems: [],
        undoStack: [],
        inventory: this.buildInventory([
          { type: 'garland', label: 'Pine Garland', width: 150, height: 54 },
          { type: 'light_string', label: 'Light String', width: 150, height: 52, customData: { schemeId: LIGHT_SCHEMES[0].id, colors: LIGHT_SCHEMES[0].colors } },
          { type: 'candle', label: 'Taper Candle', width: 48, height: 68 },
          { type: 'bell', label: 'Sleigh Bell', width: 48, height: 52 },
          { type: 'poinsettia', label: 'Poinsettia', width: 58, height: 58 },
          { type: 'tinsel_line', label: 'Tinsel Line', width: 145, height: 42 },
          { type: 'lantern', label: 'Hearth Lantern', width: 58, height: 74 },
          { type: 'bow', label: 'Velvet Bow', width: 64, height: 52 }
        ])
      },
      {
        id: 2,
        title: 'Level 3 · Winter Living Room',
        shortTitle: 'Living Room',
        studioButtonLabel: 'Snowflake Studio',
        studioId: 'stickerStudio',
        studioTitle: 'Snowflake & Sticker Editor',
        studioSubtitle: 'Draw 6-fold symmetrical snowflakes or holiday stickers for the window panes',
        settings: {
          windowFrost: true,
          wallpaperPalette: WALLPAPER_PALETTES[1],
          lightScheme: LIGHT_SCHEMES[1],
          lightColors: LIGHT_SCHEMES[1].colors,
          streamerScheme: STREAMER_SCHEMES[0],
          streamerColors: STREAMER_SCHEMES[0].colors
        },
        windowPanes,
        dropZones: [
          {
            name: 'Living Room & Windows',
            rect: { x: 60, y: 20, w: 1160, h: 660 }
          }
        ],
        placedItems: [],
        undoStack: [],
        inventory: this.buildInventory([
          { type: 'streamer', label: 'Ceiling Streamer', width: 190, height: 68, customData: { schemeId: STREAMER_SCHEMES[0].id, colors: STREAMER_SCHEMES[0].colors } },
          { type: 'balloon', label: 'Crimson Balloon', width: 58, height: 78, customData: { color: '#dc2626' } },
          { type: 'balloon', label: 'Gold Balloon', width: 58, height: 78, customData: { color: '#d4a353' } },
          { type: 'balloon', label: 'Emerald Balloon', width: 58, height: 78, customData: { color: '#15803d' } },
          { type: 'fairy_lights', label: 'Fairy Lights', width: 170, height: 95, customData: { schemeId: LIGHT_SCHEMES[1].id, colors: LIGHT_SCHEMES[1].colors } },
          { type: 'garland', label: 'Window Garland', width: 165, height: 56 },
          { type: 'bow', label: 'Curtain Bow', width: 62, height: 52 }
        ])
      },
      {
        id: 3,
        title: 'Level 4 · Illuminated Garden',
        shortTitle: 'Garden',
        studioButtonLabel: 'Garden Studio',
        studioId: 'sleighStudio',
        studioTitle: 'Sleigh & Garden Prop Studio',
        studioSubtitle: 'Paint the festive sleigh or switch to Freeform mode to draw any garden decoration',
        settings: {
          houseColor: HOUSE_COLORS[0].color,
          roofLights: true,
          windowLights: true,
          showSnow: true,
          snowSpeed: 1,
          lightScheme: LIGHT_SCHEMES[0],
          lightColors: LIGHT_SCHEMES[0].colors
        },
        dropZones: [
          {
            name: 'Front Lawn & House',
            rect: { x: 40, y: 95, w: 1200, h: 605 }
          }
        ],
        placedItems: [],
        undoStack: [],
        inventory: this.buildInventory([
          { type: 'nutcracker', label: 'Nutcracker', width: 68, height: 105 },
          { type: 'glowing_deer', label: 'Glowing Deer', width: 104, height: 96 },
          { type: 'pathway_marker', label: 'Path Marker', width: 44, height: 76 },
          { type: 'roof_light_strand', label: 'String Lights', width: 150, height: 52, customData: { schemeId: LIGHT_SCHEMES[0].id, colors: LIGHT_SCHEMES[0].colors } },
          { type: 'snowman', label: 'Interactive Snowman', width: 82, height: 105 }
        ])
      },
      {
        id: 4,
        title: "Level 5 · Santa's Toy Workshop",
        shortTitle: 'Toy Workshop',
        studioButtonLabel: 'Toy Painter',
        studioId: 'toyWorkshopStudio',
        studioTitle: 'Custom Toy Maker Studio',
        studioSubtitle: 'Select a toy silhouette, paint or stamp stencils, add a name tag, and snap to shelves or sack',
        settings: {
          conveyorActive: true,
          workshopGlow: true,
          lightScheme: LIGHT_SCHEMES[0],
          lightColors: LIGHT_SCHEMES[0].colors,
          streamerScheme: STREAMER_SCHEMES[0],
          streamerColors: STREAMER_SCHEMES[0].colors
        },
        dropZones: [
          {
            name: 'Rafters, Shelves & Sack',
            rect: { x: 40, y: 40, w: 1200, h: 620 }
          }
        ],
        placedItems: [],
        undoStack: [],
        inventory: this.buildInventory([
          { type: 'wooden_train', label: 'Wooden Train', width: 88, height: 68 },
          { type: 'plush_bear', label: 'Plush Bear', width: 68, height: 76 },
          { type: 'brass_drum', label: 'Brass Drum', width: 64, height: 64 },
          { type: 'toy_robot', label: 'Clockwork Bot', width: 68, height: 82 },
          { type: 'gift_tag', label: 'Elf Gift Tag', width: 78, height: 48, customData: { text: 'For Mia' } },
          { type: 'tinsel_line', label: 'Workshop Tinsel', width: 148, height: 44 },
          {
            type: 'light_string',
            label: 'Flashing Lights',
            width: 156,
            height: 54,
            customData: { schemeId: LIGHT_SCHEMES[0].id, colors: LIGHT_SCHEMES[0].colors }
          },
          {
            type: 'streamer',
            label: 'Rafter Streamer',
            width: 156,
            height: 52,
            customData: { schemeId: STREAMER_SCHEMES[0].id, colors: STREAMER_SCHEMES[0].colors }
          }
        ])
      },
      {
        id: 5,
        title: 'Level 6 · Gingerbread Bakery',
        shortTitle: 'Bakery',
        studioButtonLabel: 'Cookie Studio',
        studioId: 'bakeryStudio',
        studioTitle: 'Gingerbread Cookie & Icing Studio',
        studioSubtitle: 'Pipe royal icing onto full gingerbread stencils and serve cookies on trays, parchment, and racks',
        settings: {
          ovenGlow: true,
          flourDusting: true,
          counterColor: '#d6c8b4'
        },
        dropZones: [
          {
            name: 'Serving Trays, Parchment & Cooling Rack',
            rect: { x: 50, y: 120, w: 1180, h: 520 }
          }
        ],
        placedItems: [],
        undoStack: [],
        inventory: this.buildInventory([
          { type: 'cookie_plate', label: 'Serving Plate', width: 130, height: 88 },
          { type: 'wooden_serving_tray', label: 'Timber Tray', width: 152, height: 94 },
          { type: 'tiered_cake_stand', label: 'Cake Stand', width: 118, height: 122 },
          { type: 'gingerbread_cookie', label: 'Gingerbread Man', width: 64, height: 68 },
          { type: 'star_sugar_cookie', label: 'Star Cookie', width: 62, height: 62 },
          { type: 'tree_cookie_item', label: 'Tree Cookie', width: 64, height: 68 },
          { type: 'peppermint_candy', label: 'Peppermint', width: 46, height: 46 },
          { type: 'gumdrop_cluster', label: 'Gumdrops', width: 54, height: 48 },
          { type: 'frosting_swirl', label: 'Icing Swirl', width: 52, height: 48 },
          { type: 'sugar_star', label: 'Sugar Star', width: 52, height: 52 },
          { type: 'sprinkle_mix', label: 'Sprinkles', width: 56, height: 48 },
          { type: 'cinnamon_bundle', label: 'Cinnamon', width: 58, height: 46 }
        ])
      },
      {
        id: 6,
        title: 'Level 7 · North Pole Stable',
        shortTitle: 'Reindeer Stable',
        studioButtonLabel: 'Blanket Weaver',
        studioId: 'stableStudio',
        studioTitle: 'Reindeer Blanket & Collar Studio',
        studioSubtitle: 'Weave a custom wool blanket pattern matrix, engrave a brass collar tag, and clip onto reindeer',
        settings: {
          auroraSky: true,
          stableLanterns: true
        },
        dropZones: [
          {
            name: 'Reindeer Stalls',
            rect: { x: 60, y: 80, w: 1160, h: 560 }
          }
        ],
        placedItems: [],
        undoStack: [],
        inventory: this.buildInventory([
          { type: 'hanging_lantern', label: 'Hanging Lantern', width: 54, height: 76 },
          { type: 'holly_wreath', label: 'Holly Wreath', width: 68, height: 68 },
          { type: 'glossy_bell', label: 'Glossy Bell', width: 60, height: 66 },
          { type: 'mistletoe_sprig', label: 'Mistletoe Sprig', width: 64, height: 72 },
          { type: 'stable_garland', label: 'Stall Garland', width: 145, height: 52 },
          { type: 'golden_harness', label: 'Gold Harness', width: 78, height: 54 },
          { type: 'stable_bell', label: 'Stall Bells', width: 78, height: 56 },
          { type: 'hay_bundle', label: 'Hay Bundle', width: 88, height: 58 },
          { type: 'carrot_basket', label: 'Carrot Basket', width: 68, height: 64 }
        ])
      },
      {
        id: 7,
        title: 'Level 8 · Town Square & Shops',
        shortTitle: 'Town Square',
        studioButtonLabel: 'Signboard Studio',
        studioId: 'townSquareStudio',
        studioTitle: 'Shop Signboard & Window Glow Studio',
        studioSubtitle: 'Paint a Victorian signboard, type custom shop lettering, and tune display window illumination',
        settings: {
          windowGlowColor: '#fde047',
          windowGlowIntensity: 85,
          townTreeLights: true,
          showSnow: true,
          lightScheme: LIGHT_SCHEMES[0],
          lightColors: LIGHT_SCHEMES[0].colors,
          streetlampIntensities: [2, 2, 2]
        },
        dropZones: [
          {
            name: 'Town Square & Shops',
            rect: { x: 40, y: 110, w: 1200, h: 565 }
          }
        ],
        placedItems: [],
        undoStack: [],
        inventory: this.buildInventory([
          { type: 'public_ornament', label: 'Town Ornament', width: 46, height: 46 },
          { type: 'shop_wreath', label: 'Shop Wreath', width: 68, height: 68 },
          { type: 'cobble_bench', label: 'Park Bench', width: 105, height: 58 },
          { type: 'caroler_lantern', label: 'Caroler Lantern', width: 54, height: 68 },
          { type: 'candy_pillar', label: 'Candy Pillar', width: 44, height: 84 },
          { type: 'festive_banner', label: 'Street Banner', width: 108, height: 58 },
          { type: 'streetlamp_prop', label: 'Streetlamp', width: 52, height: 118, customData: { intensity: 2 } }
        ])
      },
      {
        id: 8,
        title: 'Level 9 · Sleigh Launchpad',
        shortTitle: 'Launchpad',
        studioButtonLabel: 'License Plate',
        studioId: 'launchpadStudio',
        studioTitle: 'North Pole License Plate Studio',
        studioSubtitle: 'Paint and stamp a rectangular sleigh license plate, then drag it anywhere onto the grand sleigh',
        settings: {
          runwayLights: true,
          stardustBoost: false,
          lightScheme: LIGHT_SCHEMES[0],
          lightColors: LIGHT_SCHEMES[0].colors,
          bellJingleTimer: 0
        },
        dropZones: [
          {
            name: 'Sleigh & Runway',
            rect: { x: 50, y: 120, w: 1180, h: 560 }
          }
        ],
        placedItems: [],
        undoStack: [],
        inventory: this.buildInventory([
          { type: 'toy_stack', label: 'Toy Stack', width: 86, height: 86 },
          { type: 'magic_lantern_pole', label: 'Lantern Pole', width: 74, height: 118 },
          { type: 'festive_ribbon', label: 'Sleigh Ribbon', width: 126, height: 64 },
          { type: 'harness_bells', label: 'Harness Bells', width: 88, height: 62 },
          { type: 'beacon_torch', label: 'Runway Beacon', width: 52, height: 84 },
          { type: 'cargo_sack', label: 'Cargo Sack', width: 82, height: 78 },
          { type: 'stardust_trail', label: 'Stardust Trail', width: 130, height: 56 },
          { type: 'runway_marker', label: 'Light Marker', width: 44, height: 72 },
          { type: 'brass_horn', label: 'Sleigh Horn', width: 64, height: 64 }
        ])
      },
      {
        id: 9,
        title: 'Level 10 · Gift Wrapping Station',
        shortTitle: 'Gift Station',
        studioButtonLabel: 'Pattern Studio',
        studioId: 'wrappingStudio',
        studioTitle: 'Tiling Grid Pattern Wrapping Studio',
        studioSubtitle: 'Doodle on the 64x64 tile canvas to seamlessly wrap custom square, cylinder, or plush presents',
        settings: {
          tableGlow: true
        },
        dropZones: [
          {
            name: 'Wrapping Cutting Mat',
            rect: { x: 160, y: 80, w: 960, h: 560 }
          }
        ],
        placedItems: [],
        undoStack: [],
        inventory: this.buildInventory([
          {
            type: 'gift_cube',
            label: 'Gift Cube',
            width: 82,
            height: 78,
            customData: { color: GIFT_SCHEMES[0].color, ribbonColor: GIFT_SCHEMES[0].ribbonColor }
          },
          {
            type: 'gift_cylinder',
            label: 'Gift Cylinder',
            width: 78,
            height: 86,
            customData: { color: GIFT_SCHEMES[1].color, ribbonColor: GIFT_SCHEMES[1].ribbonColor }
          },
          {
            type: 'gift_plush',
            label: 'Plush Parcel',
            width: 78,
            height: 86,
            customData: { color: GIFT_SCHEMES[2].color, ribbonColor: GIFT_SCHEMES[2].ribbonColor }
          },
          { type: 'satin_bow', label: 'Satin Bow', width: 66, height: 54 },
          { type: 'wax_seal', label: 'Wax Seal', width: 48, height: 48 },
          { type: 'pine_sprig', label: 'Pine Sprig', width: 96, height: 44 },
          { type: 'gift_tag', label: 'Gift Tag', width: 78, height: 48, customData: { text: 'Merry Xmas' } },
          { type: 'gold_cord', label: 'Gold Cord', width: 105, height: 42 },
          { type: 'confetti_box', label: 'Royal Present', width: 72, height: 68 }
        ])
      },
      {
        id: 10,
        title: "Level 11 · BONUS Village Diorama",
        shortTitle: 'Village Sandbox',
        studioButtonLabel: 'Flag Painter',
        studioId: 'dioramaStudio',
        studioTitle: 'Village Community Flag Painter',
        studioSubtitle: 'Paint custom banners and flags to plant across your 14x14 isometric Santa Village',
        settings: {
          weatherMode: 'snow',
          showIsoGrid: true
        },
        dropZones: [
          {
            name: 'Isometric Village Map',
            rect: { x: 140, y: 110, w: 1000, h: 530 }
          }
        ],
        placedItems: [],
        undoStack: [],
        inventory: this.buildInventory([
          { type: 'toy_factory', label: 'Toy Factory', width: 114, height: 102 },
          { type: 'gingerbread_bakery', label: 'Ginger Bakery', width: 108, height: 98 },
          { type: 'elf_cottage', label: 'Elf Cottage', width: 98, height: 90 },
          { type: 'village_clocktower', label: 'Clocktower', width: 88, height: 136 },
          { type: 'mini_train_car', label: 'Train Car', width: 92, height: 74 },
          { type: 'candy_cane_path', label: 'Candy Path', width: 74, height: 42 },
          { type: 'santas_house', label: "Santa's House", width: 108, height: 96 },
          { type: 'elf_barracks', label: 'Elf Barracks', width: 100, height: 90 },
          { type: 'cocoa_shop', label: 'Cocoa Shop', width: 96, height: 88 },
          { type: 'toy_tower', label: 'Toy Tower', width: 92, height: 106 },
          { type: 'pine_cluster', label: 'Snowy Pines', width: 84, height: 76 },
          { type: 'frozen_fountain', label: 'Ice Fountain', width: 86, height: 74 }
        ])
      }
    ];
  }

  buildInventory(specs) {
    return specs.map((spec, idx) => ({
      id: `inv_${spec.type}_${idx}_${Math.random().toString(36).slice(2, 6)}`,
      type: spec.type,
      label: spec.label,
      width: spec.width,
      height: spec.height,
      customData: spec.customData || {},
      image: null,
      thumbUrl: renderThumbnailDataURL(spec.type, spec.customData || {}),
      isCustom: false
    }));
  }

  getActiveLevel() {
    return this.levels[this.activeLevelIndex];
  }

  /* ==========================================================================
     UNIFIED CANVAS + DOM EVENT BINDING
     ========================================================================== */

  bindEvents() {
    this.canvasInput = new UnifiedInputManager(this.canvas, {
      onStart: (pt) => this.handleCanvasStart(pt),
      onMove: (pt) => this.handleCanvasMove(pt),
      onHover: (pt) => {
        this.hoverPt = pt;
      },
      onEnd: (pt) => this.handleCanvasEnd(pt)
    });
    this.inputManagers.push(this.canvasInput);

    this.dom.btnMenu.addEventListener('click', () => {
      this.sound.playChime();
      this.setState(GAME_STATES.MAIN_MENU);
    });

    this.dom.btnLevels.addEventListener('click', () => {
      this.sound.playChime();
      this.setState(GAME_STATES.LEVEL_SELECT);
    });

    this.dom.btnAudio.addEventListener('click', () => {
      this.sound.enabled = !this.sound.enabled;
      this.dom.btnAudio.textContent = this.sound.enabled ? 'Sound On' : 'Sound Off';
      this.dom.btnAudio.setAttribute('aria-pressed', String(this.sound.enabled));
      if (this.sound.enabled) this.sound.playChime();
    });

    this.dom.btnMusic.addEventListener('click', () => {
      if (this.music) {
        this.music.enabled = !this.music.enabled;
        this.dom.btnMusic.textContent = this.music.enabled ? 'Music On' : 'Music Off';
        this.dom.btnMusic.setAttribute('aria-pressed', String(this.music.enabled));
        if (this.music.enabled) this.sound.playChime();
      }
    });

    this.dom.btnUndo.addEventListener('click', () => this.undoLastAction());
    this.dom.btnClearLevel.addEventListener('click', () => this.resetActiveLevel());
    this.dom.btnTakePhoto.addEventListener('click', () => this.takePhoto());
    this.dom.btnOpenStudio.addEventListener('click', () => this.openActiveStudio());
    this.dom.btnCloseModal.addEventListener('click', () => this.closeStudioModal());
    this.dom.btnClosePhoto.addEventListener('click', () => this.closePhotoModal());
    this.dom.btnSharePhoto.addEventListener('click', () => this.shareLastPhoto());

    this.dom.btnCycleColor.addEventListener('click', () => this.cycleSelectedItemColor());
    this.dom.btnScaleDown.addEventListener('click', () => this.modifySelectedItem({ scaleDelta: -0.15 }));
    this.dom.btnScaleUp.addEventListener('click', () => this.modifySelectedItem({ scaleDelta: 0.15 }));
    this.dom.btnRotate.addEventListener('click', () => this.modifySelectedItem({ rotateDelta: Math.PI / 12 }));
    this.dom.btnDuplicateItem.addEventListener('click', () => this.duplicateSelectedItem());
    this.dom.btnDeleteItem.addEventListener('click', () => this.deleteSelectedItem());

    // Global drag-from-tray handlers (Mouse + Touch)
    this._onWinMouseMove = (e) => this.handleTrayDragMove(e.clientX, e.clientY);
    this._onWinMouseUp = (e) => this.handleTrayDragEnd(e.clientX, e.clientY);
    this._onWinTouchMove = (e) => {
      if (this.trayDragPayload && e.touches.length > 0) {
        e.preventDefault();
        this.handleTrayDragMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    this._onWinTouchEnd = (e) => {
      if (this.trayDragPayload) {
        const touch = e.changedTouches && e.changedTouches[0];
        this.handleTrayDragEnd(touch ? touch.clientX : 0, touch ? touch.clientY : 0);
      }
    };

    // Automatic save when app is minimized, backgrounded, or closed
    this._onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        this.saveProgress();
      }
    };
    this._onPageHide = () => this.saveProgress();
    this._onBeforeUnload = () => this.saveProgress();

    window.addEventListener('mousemove', this._onWinMouseMove);
    window.addEventListener('mouseup', this._onWinMouseUp);
    window.addEventListener('touchmove', this._onWinTouchMove, { passive: false });
    window.addEventListener('touchend', this._onWinTouchEnd);
    document.addEventListener('visibilitychange', this._onVisibilityChange);
    window.addEventListener('pagehide', this._onPageHide);
    window.addEventListener('beforeunload', this._onBeforeUnload);
  }

  destroy() {
    this.saveProgress();
    this.destroyed = true;
    if (this.music) {
      this.music.stop();
    }
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    for (const mgr of this.inputManagers) {
      mgr.destroy();
    }
    this.inputManagers = [];
    if (this._onWinMouseMove) window.removeEventListener('mousemove', this._onWinMouseMove);
    if (this._onWinMouseUp) window.removeEventListener('mouseup', this._onWinMouseUp);
    if (this._onWinTouchMove) window.removeEventListener('touchmove', this._onWinTouchMove);
    if (this._onWinTouchEnd) window.removeEventListener('touchend', this._onWinTouchEnd);
    if (this._onVisibilityChange) document.removeEventListener('visibilitychange', this._onVisibilityChange);
    if (this._onPageHide) window.removeEventListener('pagehide', this._onPageHide);
    if (this._onBeforeUnload) window.removeEventListener('beforeunload', this._onBeforeUnload);
  }

  setState(nextState, levelIdx = null) {
    if (levelIdx !== null && levelIdx >= 0 && levelIdx < this.levels.length) {
      this.activeLevelIndex = levelIdx;
    }
    this.state = nextState;
    this.selectedItemId = null;
    this.draggingItem = null;
    this.syncUI();
    this.saveProgress();
  }

  syncUI() {
    const level = this.getActiveLevel();
    const isPlaying = this.state === GAME_STATES.PLAYING;
    const isDesigning = this.state === GAME_STATES.DESIGNING;

    this.dom.btnUndo.classList.toggle('hidden', !isPlaying);
    this.dom.btnClearLevel.classList.toggle('hidden', !isPlaying);
    this.dom.btnTakePhoto.classList.toggle('hidden', !isPlaying);
    this.dom.btnOpenStudio.classList.toggle('hidden', !isPlaying);
    this.dom.bottomDock.classList.toggle('hidden', !isPlaying);
    this.dom.designerOverlay.classList.toggle('hidden', !isDesigning);

    if (isPlaying || isDesigning) {
      this.dom.hudTitle.textContent = level.title;
      const countText =
        level.id === 1
          ? `${level.placedItems.length} placed · ${level.stockings.length} stockings`
          : `${level.placedItems.length} placed`;
      this.dom.hudMeta.textContent = countText;
      this.dom.btnOpenStudio.textContent = level.studioButtonLabel;
    } else if (this.state === GAME_STATES.LEVEL_SELECT) {
      this.dom.hudTitle.textContent = 'Select Holiday Scene';
      this.dom.hudMeta.textContent = '10 Core Levels + 1 Bonus Sandbox';
    } else {
      this.dom.hudTitle.textContent = 'Christmas Decorating Fun';
      this.dom.hudMeta.textContent = '11 Festive Scenes';
    }

    this.updateSelectionToolbar();
    if (isPlaying) {
      this.renderQuickControls();
      this.renderInventoryTray();
    }
  }

  updateSelectionToolbar() {
    const level = this.getActiveLevel();
    const item = level.placedItems.find((it) => it.id === this.selectedItemId);
    if (this.state === GAME_STATES.PLAYING && item) {
      this.dom.selectionControls.classList.remove('hidden');
      this.dom.selectedItemName.textContent = item.label;
      const colorable =
        item.type === 'light_string' ||
        item.type === 'fairy_lights' ||
        item.type === 'roof_light_strand' ||
        item.type === 'streamer' ||
        item.type === 'balloon' ||
        item.type === 'gift_box' ||
        item.type === 'gift_tall' ||
        item.type === 'gift_cube' ||
        item.type === 'gift_cylinder' ||
        item.type === 'gift_plush';
      this.dom.btnCycleColor.classList.toggle('hidden', !colorable);
    } else {
      this.dom.selectionControls.classList.add('hidden');
      this.dom.btnCycleColor.classList.add('hidden');
    }
  }

  /* ==========================================================================
     QUICK LEVEL CONTROLS & TOUCH INVENTORY DOCK
     ========================================================================== */

  renderQuickControls() {
    const level = this.getActiveLevel();
    const container = this.dom.levelQuickControls;
    container.innerHTML = '';

    if (level.id === 0) {
      const colorGroup = document.createElement('div');
      colorGroup.className = 'quick-group';
      const lbl = document.createElement('span');
      lbl.className = 'quick-label';
      lbl.textContent = 'Tree Color:';
      colorGroup.appendChild(lbl);

      TREE_PALETTES.forEach((pal) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'swatch-btn swatch-btn-sm' + (level.settings.treePalette.id === pal.id ? ' active' : '');
        btn.style.backgroundColor = pal.swatch;
        btn.title = pal.name;
        btn.setAttribute('aria-label', pal.name);
        btn.addEventListener('click', () => {
          level.settings.treePalette = pal;
          this.sound.playChime();
          this.renderQuickControls();
          this.saveProgress();
        });
        colorGroup.appendChild(btn);
      });
      container.appendChild(colorGroup);

      const tinselBtn = this.makeQuickToggle('Tinsel', level.settings.showTinsel, () => {
        level.settings.showTinsel = !level.settings.showTinsel;
        this.sound.playChime();
        this.renderQuickControls();
        this.saveProgress();
      });
      container.appendChild(tinselBtn);
      this.appendTinselColorGroup(container, level);

      const lightsBtn = this.makeQuickToggle('Flashing Lights', level.settings.showLights, () => {
        level.settings.showLights = !level.settings.showLights;
        this.sound.playChime();
        this.renderQuickControls();
        this.saveProgress();
      });
      container.appendChild(lightsBtn);
      this.appendLightsColorGroup(container, level);
    } else if (level.id === 1) {
      const fireBtn = this.makeQuickToggle('Roaring Fire', level.settings.fireBoost, () => {
        level.settings.fireBoost = !level.settings.fireBoost;
        this.sound.playChime();
        this.renderQuickControls();
        this.saveProgress();
      });
      container.appendChild(fireBtn);
      this.appendWallpaperColorGroup(container, level);
      this.appendLightsColorGroup(container, level);

      const clearStockingsBtn = document.createElement('button');
      clearStockingsBtn.type = 'button';
      clearStockingsBtn.className = 'quick-toggle';
      clearStockingsBtn.textContent = `Clear Stockings (${level.stockings.length})`;
      clearStockingsBtn.addEventListener('click', () => {
        if (level.stockings.length > 0) {
          level.stockings.pop();
          this.sound.playChime();
          this.syncUI();
          this.saveProgress();
        }
      });
      container.appendChild(clearStockingsBtn);
    } else if (level.id === 2) {
      const frostBtn = this.makeQuickToggle('Window Frost', level.settings.windowFrost, () => {
        level.settings.windowFrost = !level.settings.windowFrost;
        this.sound.playChime();
        this.renderQuickControls();
        this.saveProgress();
      });
      container.appendChild(frostBtn);
      this.appendWallpaperColorGroup(container, level);
      this.appendLightsColorGroup(container, level);
      this.appendStreamerColorGroup(container, level);
    } else if (level.id === 3) {
      const houseGroup = document.createElement('div');
      houseGroup.className = 'quick-group';
      const lbl = document.createElement('span');
      lbl.className = 'quick-label';
      lbl.textContent = 'House Siding:';
      houseGroup.appendChild(lbl);

      HOUSE_COLORS.forEach((hc) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'swatch-btn swatch-btn-sm' + (level.settings.houseColor === hc.color ? ' active' : '');
        btn.style.backgroundColor = hc.color;
        btn.title = hc.name;
        btn.setAttribute('aria-label', hc.name);
        btn.addEventListener('click', () => {
          level.settings.houseColor = hc.color;
          this.sound.playChime();
          this.renderQuickControls();
          this.saveProgress();
        });
        houseGroup.appendChild(btn);
      });
      container.appendChild(houseGroup);

      const winLightsBtn = this.makeQuickToggle('Window Lights', level.settings.windowLights !== false, () => {
        level.settings.windowLights = !(level.settings.windowLights !== false);
        this.sound.playChime();
        this.renderQuickControls();
        this.saveProgress();
      });
      container.appendChild(winLightsBtn);

      const roofBtn = this.makeQuickToggle('Roofline Lights', level.settings.roofLights, () => {
        level.settings.roofLights = !level.settings.roofLights;
        this.sound.playChime();
        this.renderQuickControls();
        this.saveProgress();
      });
      container.appendChild(roofBtn);
      this.appendLightsColorGroup(container, level);

      const snowBtn = this.makeQuickToggle('Snow', level.settings.showSnow !== false, () => {
        level.settings.showSnow = !(level.settings.showSnow !== false);
        this.sound.playChime();
        this.renderQuickControls();
        this.saveProgress();
      });
      container.appendChild(snowBtn);
      this.appendSnowSpeedGroup(container, level);

      const hint = document.createElement('span');
      hint.className = 'quick-label';
      hint.textContent = 'Tap placed Snowmen to wave!';
      container.appendChild(hint);
    } else if (level.id === 4) {
      const convBtn = this.makeQuickToggle('Conveyor Belt', level.settings.conveyorActive !== false, () => {
        level.settings.conveyorActive = !(level.settings.conveyorActive !== false);
        this.sound.playChime();
        this.renderQuickControls();
        this.saveProgress();
      });
      container.appendChild(convBtn);

      const glowBtn = this.makeQuickToggle('Workshop Glow', level.settings.workshopGlow !== false, () => {
        level.settings.workshopGlow = !(level.settings.workshopGlow !== false);
        this.sound.playChime();
        this.renderQuickControls();
        this.saveProgress();
      });
      container.appendChild(glowBtn);

      this.appendLightsColorGroup(container, level);
      this.appendStreamerColorGroup(container, level);

      const hint = document.createElement('span');
      hint.className = 'quick-label';
      hint.textContent = "Toys snap to Shelves & Santa's Sack!";
      container.appendChild(hint);
    } else if (level.id === 5) {
      const ovenBtn = this.makeQuickToggle("Baker's Oven", level.settings.ovenGlow !== false, () => {
        level.settings.ovenGlow = !(level.settings.ovenGlow !== false);
        this.sound.playChime();
        this.renderQuickControls();
        this.saveProgress();
      });
      container.appendChild(ovenBtn);

      const flourBtn = this.makeQuickToggle('Flour Dusting', level.settings.flourDusting !== false, () => {
        level.settings.flourDusting = !(level.settings.flourDusting !== false);
        this.sound.playChime();
        this.renderQuickControls();
        this.saveProgress();
      });
      container.appendChild(flourBtn);

      const counterGroup = document.createElement('div');
      counterGroup.className = 'quick-group';
      const lbl = document.createElement('span');
      lbl.className = 'quick-label';
      lbl.textContent = 'Counter:';
      counterGroup.appendChild(lbl);
      ['#d6c8b4', '#f1f5f9', '#b88b61', '#94a3b8'].forEach((col) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'swatch-btn swatch-btn-sm' + (level.settings.counterColor === col ? ' active' : '');
        btn.style.backgroundColor = col;
        btn.addEventListener('click', () => {
          level.settings.counterColor = col;
          this.sound.playChime();
          this.renderQuickControls();
          this.saveProgress();
        });
        counterGroup.appendChild(btn);
      });
      container.appendChild(counterGroup);

      const hint = document.createElement('span');
      hint.className = 'quick-label';
      hint.textContent = 'Place cookies on Trays, Parchment, or Cooling Rack!';
      container.appendChild(hint);
    } else if (level.id === 6) {
      const auroraBtn = this.makeQuickToggle('Aurora Sky', level.settings.auroraSky !== false, () => {
        level.settings.auroraSky = !(level.settings.auroraSky !== false);
        this.sound.playChime();
        this.renderQuickControls();
        this.saveProgress();
      });
      container.appendChild(auroraBtn);

      const lanBtn = this.makeQuickToggle('Stable Lanterns', level.settings.stableLanterns !== false, () => {
        level.settings.stableLanterns = !(level.settings.stableLanterns !== false);
        this.sound.playChime();
        this.renderQuickControls();
        this.saveProgress();
      });
      container.appendChild(lanBtn);

      const hint = document.createElement('span');
      hint.className = 'quick-label';
      hint.textContent = 'Blankets clip to Dasher, Comet & Rudolph!';
      container.appendChild(hint);
    } else if (level.id === 7) {
      const glowGroup = document.createElement('div');
      glowGroup.className = 'quick-group';
      const lbl = document.createElement('span');
      lbl.className = 'quick-label';
      lbl.textContent = 'Window Glow:';
      glowGroup.appendChild(lbl);
      ['#fde047', '#38bdf8', '#fb7185', '#4ade80', '#f8fafc'].forEach((col) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'swatch-btn swatch-btn-sm' + (level.settings.windowGlowColor === col ? ' active' : '');
        btn.style.backgroundColor = col;
        btn.addEventListener('click', () => {
          level.settings.windowGlowColor = col;
          this.sound.playChime();
          this.renderQuickControls();
          this.saveProgress();
        });
        glowGroup.appendChild(btn);
      });
      container.appendChild(glowGroup);

      const treeBtn = this.makeQuickToggle('Town Tree Lights', level.settings.townTreeLights !== false, () => {
        level.settings.townTreeLights = !(level.settings.townTreeLights !== false);
        this.sound.playChime();
        this.renderQuickControls();
        this.saveProgress();
      });
      container.appendChild(treeBtn);

      const snowBtn = this.makeQuickToggle('Snow', level.settings.showSnow !== false, () => {
        level.settings.showSnow = !(level.settings.showSnow !== false);
        this.sound.playChime();
        this.renderQuickControls();
        this.saveProgress();
      });
      container.appendChild(snowBtn);

      const hint = document.createElement('span');
      hint.className = 'quick-label';
      hint.textContent = 'Tap Streetlamps to toggle brightness!';
      container.appendChild(hint);
    } else if (level.id === 8) {
      const runBtn = this.makeQuickToggle('Runway Lights', level.settings.runwayLights !== false, () => {
        level.settings.runwayLights = !(level.settings.runwayLights !== false);
        this.sound.playChime();
        this.renderQuickControls();
        this.saveProgress();
      });
      container.appendChild(runBtn);

      const starBtn = this.makeQuickToggle('Aurora Boost', level.settings.stardustBoost === true, () => {
        level.settings.stardustBoost = !level.settings.stardustBoost;
        this.sound.playChime();
        this.renderQuickControls();
        this.saveProgress();
      });
      container.appendChild(starBtn);
      this.appendLightsColorGroup(container, level);

      const hint = document.createElement('span');
      hint.className = 'quick-label';
      hint.textContent = 'Tap Harness Bells for a jingle chime!';
      container.appendChild(hint);
    } else if (level.id === 9) {
      const lampBtn = this.makeQuickToggle('Craft Lamp', level.settings.tableGlow !== false, () => {
        level.settings.tableGlow = !(level.settings.tableGlow !== false);
        this.sound.playChime();
        this.renderQuickControls();
        this.saveProgress();
      });
      container.appendChild(lampBtn);

      const hint = document.createElement('span');
      hint.className = 'quick-label';
      hint.textContent = 'Open Pattern Studio to draw 64x64 tiled wrapping paper!';
      container.appendChild(hint);
    } else if (level.id === 10) {
      const weatherGroup = document.createElement('div');
      weatherGroup.className = 'quick-group';
      const wLbl = document.createElement('span');
      wLbl.className = 'quick-label';
      wLbl.textContent = 'Weather:';
      weatherGroup.appendChild(wLbl);

      [
        { id: 'clear', label: 'Clear' },
        { id: 'snow', label: 'Snow' },
        { id: 'blizzard', label: 'Blizzard' },
        { id: 'aurora', label: 'Aurora' }
      ].forEach((wm) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quick-toggle' + ((level.settings.weatherMode || 'snow') === wm.id ? ' active' : '');
        btn.textContent = wm.label;
        btn.addEventListener('click', () => {
          level.settings.weatherMode = wm.id;
          this.sound.playChime();
          this.renderQuickControls();
          this.saveProgress();
        });
        weatherGroup.appendChild(btn);
      });
      container.appendChild(weatherGroup);

      const gridBtn = this.makeQuickToggle('Iso Grid', level.settings.showIsoGrid !== false, () => {
        level.settings.showIsoGrid = !(level.settings.showIsoGrid !== false);
        this.sound.playChime();
        this.renderQuickControls();
        this.saveProgress();
      });
      container.appendChild(gridBtn);
    }
  }

  appendTinselColorGroup(container, level) {
    const group = document.createElement('div');
    group.className = 'quick-group';
    const lbl = document.createElement('span');
    lbl.className = 'quick-label';
    lbl.textContent = 'Tinsel Color:';
    group.appendChild(lbl);

    TINSEL_PALETTES.forEach((pal) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className =
        'swatch-btn swatch-btn-sm' +
        (level.settings.tinselPalette && level.settings.tinselPalette.id === pal.id ? ' active' : '');
      btn.style.backgroundColor = pal.swatch;
      btn.title = `Tinsel: ${pal.name}`;
      btn.setAttribute('aria-label', `Tinsel ${pal.name}`);
      btn.addEventListener('click', () => {
        level.settings.tinselPalette = pal;
        this.sound.playChime();
        this.renderQuickControls();
        this.saveProgress();
      });
      group.appendChild(btn);
    });
    container.appendChild(group);
  }

  appendWallpaperColorGroup(container, level) {
    const group = document.createElement('div');
    group.className = 'quick-group';
    const lbl = document.createElement('span');
    lbl.className = 'quick-label';
    lbl.textContent = 'Wallpaper:';
    group.appendChild(lbl);

    WALLPAPER_PALETTES.forEach((wp) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className =
        'swatch-btn swatch-btn-sm' +
        (level.settings.wallpaperPalette && level.settings.wallpaperPalette.id === wp.id ? ' active' : '');
      btn.style.backgroundColor = wp.swatch;
      btn.title = `Wallpaper: ${wp.name}`;
      btn.setAttribute('aria-label', `Wallpaper ${wp.name}`);
      btn.addEventListener('click', () => {
        level.settings.wallpaperPalette = wp;
        this.sound.playChime();
        this.renderQuickControls();
        this.saveProgress();
      });
      group.appendChild(btn);
    });
    container.appendChild(group);
  }

  appendSnowSpeedGroup(container, level) {
    const group = document.createElement('div');
    group.className = 'quick-group';
    const lbl = document.createElement('span');
    lbl.className = 'quick-label';
    lbl.textContent = 'Snow Speed:';
    group.appendChild(lbl);

    const currentSpeed = level.settings.snowSpeed ?? 1;
    SNOW_SPEEDS.forEach((sp) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quick-toggle' + (Math.abs(currentSpeed - sp.value) < 0.05 ? ' active' : '');
      btn.textContent = sp.label;
      btn.addEventListener('click', () => {
        level.settings.snowSpeed = sp.value;
        if (level.settings.showSnow === false) {
          level.settings.showSnow = true;
        }
        this.sound.playChime();
        this.renderQuickControls();
        this.saveProgress();
      });
      group.appendChild(btn);
    });
    container.appendChild(group);
  }

  appendLightsColorGroup(container, level) {
    const group = document.createElement('div');
    group.className = 'quick-group';
    const lbl = document.createElement('span');
    lbl.className = 'quick-label';
    lbl.textContent = 'Lights Color:';
    group.appendChild(lbl);

    LIGHT_SCHEMES.forEach((scheme) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className =
        'swatch-btn swatch-btn-sm' +
        (level.settings.lightScheme && level.settings.lightScheme.id === scheme.id ? ' active' : '');
      btn.style.backgroundColor = scheme.swatch;
      btn.title = `Lights: ${scheme.name}`;
      btn.setAttribute('aria-label', `Lights ${scheme.name}`);
      btn.addEventListener('click', () => {
        level.settings.lightScheme = scheme;
        level.settings.lightColors = scheme.colors;
        // Update placed and inventory light items so change is immediate across the scene
        level.placedItems.forEach((it) => {
          if (
            it.type === 'light_string' ||
            it.type === 'fairy_lights' ||
            it.type === 'roof_light_strand'
          ) {
            it.customData.colors = scheme.colors;
            it.customData.schemeId = scheme.id;
          }
        });
        level.inventory.forEach((inv) => {
          if (
            inv.type === 'light_string' ||
            inv.type === 'fairy_lights' ||
            inv.type === 'roof_light_strand'
          ) {
            inv.customData.colors = scheme.colors;
            inv.customData.schemeId = scheme.id;
            inv.thumbUrl = renderThumbnailDataURL(inv.type, inv.customData);
          }
        });
        this.sound.playChime();
        this.renderQuickControls();
        this.renderInventoryTray();
        this.saveProgress();
      });
      group.appendChild(btn);
    });
    container.appendChild(group);
  }

  appendStreamerColorGroup(container, level) {
    const group = document.createElement('div');
    group.className = 'quick-group';
    const lbl = document.createElement('span');
    lbl.className = 'quick-label';
    lbl.textContent = 'Streamers:';
    group.appendChild(lbl);

    STREAMER_SCHEMES.forEach((scheme) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className =
        'swatch-btn swatch-btn-sm' +
        (level.settings.streamerScheme && level.settings.streamerScheme.id === scheme.id ? ' active' : '');
      btn.style.backgroundColor = scheme.swatch;
      btn.title = `Streamers: ${scheme.name}`;
      btn.setAttribute('aria-label', `Streamers ${scheme.name}`);
      btn.addEventListener('click', () => {
        level.settings.streamerScheme = scheme;
        level.settings.streamerColors = scheme.colors;
        level.placedItems.forEach((it) => {
          if (it.type === 'streamer') {
            it.customData.colors = scheme.colors;
            it.customData.schemeId = scheme.id;
          }
        });
        level.inventory.forEach((inv) => {
          if (inv.type === 'streamer') {
            inv.customData.colors = scheme.colors;
            inv.customData.schemeId = scheme.id;
            inv.thumbUrl = renderThumbnailDataURL(inv.type, inv.customData);
          }
        });
        this.sound.playChime();
        this.renderQuickControls();
        this.renderInventoryTray();
        this.saveProgress();
      });
      group.appendChild(btn);
    });
    container.appendChild(group);
  }

  makeQuickToggle(label, isActive, onClick) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'quick-toggle' + (isActive ? ' active' : '');
    btn.textContent = `${label}: ${isActive ? 'On' : 'Off'}`;
    btn.addEventListener('click', onClick);
    return btn;
  }

  renderInventoryTray() {
    const level = this.getActiveLevel();
    const tray = this.dom.inventoryTray;
    tray.innerHTML = '';

    level.inventory.forEach((invItem) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'inventory-card' + (invItem.isCustom ? ' is-custom' : '');
      card.setAttribute('role', 'listitem');
      card.title = `Drag or tap to place ${invItem.label}`;

      const img = document.createElement('img');
      img.className = 'inventory-thumb';
      img.src = invItem.thumbUrl;
      img.alt = invItem.label;

      const label = document.createElement('span');
      label.className = 'inventory-label';
      label.textContent = invItem.label;

      card.appendChild(img);
      card.appendChild(label);

      // Unified drag start from tray (mouse + touch)
      card.addEventListener('mousedown', (e) => {
        if (Date.now() - this.lastTrayTouchTime < 450) return;
        e.preventDefault();
        this.startTrayDrag(invItem, e.clientX, e.clientY);
      });

      card.addEventListener(
        'touchstart',
        (e) => {
          this.lastTrayTouchTime = Date.now();
          if (e.touches.length === 0) return;
          e.preventDefault();
          const t = e.touches[0];
          this.startTrayDrag(invItem, t.clientX, t.clientY);
        },
        { passive: false }
      );

      tray.appendChild(card);
    });
  }

  startTrayDrag(invItem, clientX, clientY) {
    this.trayDragPayload = {
      invItem,
      startX: clientX,
      startY: clientY,
      moved: false
    };
    this.dom.dragGhost.innerHTML = `<img src="${invItem.thumbUrl}" alt="" />`;
    this.dom.dragGhost.style.left = `${clientX}px`;
    this.dom.dragGhost.style.top = `${clientY}px`;
    this.dom.dragGhost.classList.remove('hidden');
  }

  handleTrayDragMove(clientX, clientY) {
    if (!this.trayDragPayload) return;
    const dist = CoordinateMapper.distanceBetween(
      this.trayDragPayload.startX,
      this.trayDragPayload.startY,
      clientX,
      clientY
    );
    if (dist > 6) {
      this.trayDragPayload.moved = true;
    }
    this.dom.dragGhost.style.left = `${clientX}px`;
    this.dom.dragGhost.style.top = `${clientY}px`;
    this.hoverPt = CoordinateMapper.toLocal(clientX, clientY, this.canvas);
  }

  handleTrayDragEnd(clientX, clientY) {
    if (!this.trayDragPayload) return;
    const payload = this.trayDragPayload;
    this.trayDragPayload = null;
    this.dom.dragGhost.classList.add('hidden');

    const rect = this.canvas.getBoundingClientRect();
    const droppedOnCanvas =
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom;

    if (!payload.moved) {
      // Quick tap spawns neatly inside the active level's focal area
      const spawnPt = this.getDefaultSpawnPoint(payload.invItem);
      this.spawnItemOnCanvas(payload.invItem, spawnPt.x, spawnPt.y);
      return;
    }

    if (droppedOnCanvas) {
      const localPt = CoordinateMapper.toLocal(clientX, clientY, this.canvas);
      this.spawnItemOnCanvas(payload.invItem, localPt.x, localPt.y);
    }
  }

  getDefaultSpawnPoint(invItem) {
    const level = this.getActiveLevel();
    const jitterX = (Math.random() - 0.5) * 140;
    const jitterY = (Math.random() - 0.5) * 90;

    if (level.id === 0) {
      if (invItem.type === 'star_topper' || invItem.type === 'angel_topper') return { x: 640, y: 72 };
      if (invItem.type === 'gift_box' || invItem.type === 'gift_tall') {
        return { x: 640 + jitterX * 1.6, y: 605 + (Math.random() - 0.5) * 34 };
      }
      return { x: 640 + jitterX, y: 340 + jitterY };
    }
    if (level.id === 1) {
      if (invItem.type === 'garland' || invItem.type === 'light_string' || invItem.type === 'tinsel_line') {
        return { x: 640 + jitterX * 0.6, y: 262 };
      }
      return { x: 640 + jitterX * 1.4, y: 225 };
    }
    if (level.id === 2) {
      if (invItem.type === 'streamer') return { x: 640 + jitterX, y: 58 };
      if (invItem.type === 'custom_sticker') return { x: 640 + jitterX * 1.6, y: 255 + jitterY * 0.9 };
      return { x: 640 + jitterX * 1.8, y: 220 + jitterY };
    }
    if (level.id === 3) {
      if (invItem.type === 'roof_light_strand') return { x: 640 + jitterX, y: 175 };
      if (invItem.type === 'pathway_marker') return { x: 640 + jitterX, y: 575 + jitterY * 0.5 };
      return { x: 640 + jitterX * 2, y: 535 + jitterY * 0.5 };
    }
    if (level.id === 4) {
      if (
        invItem.type === 'tinsel_line' ||
        invItem.type === 'light_string' ||
        invItem.type === 'streamer'
      ) {
        return { x: 640 + jitterX * 2.1, y: 68 + Math.random() * 26 };
      }
      return { x: 260 + (Math.random() > 0.5 ? 0 : 760) + (Math.random() - 0.5) * 140, y: 185 };
    }
    if (level.id === 5) {
      const isTray =
        invItem.type === 'cookie_plate' ||
        invItem.type === 'wooden_serving_tray' ||
        invItem.type === 'tiered_cake_stand';
      if (!isTray) {
        const trays = level.placedItems.filter(
          (it) =>
            it.type === 'cookie_plate' ||
            it.type === 'wooden_serving_tray' ||
            it.type === 'tiered_cake_stand'
        );
        if (trays.length > 0) {
          const targetTray = trays[Math.floor(Math.random() * trays.length)];
          return {
            x: targetTray.x + (Math.random() - 0.5) * 34,
            y: targetTray.type === 'tiered_cake_stand' ? targetTray.y - 24 : targetTray.y - 6
          };
        }
        return {
          x: BAKERY_WORKSTATIONS.rollingPinZone.x + 150 + jitterX * 0.5,
          y: BAKERY_WORKSTATIONS.rollingPinZone.snapY - 4
        };
      }
      return { x: 640 + jitterX * 1.8, y: 500 + (Math.random() - 0.5) * 20 };
    }
    if (level.id === 6) {
      if (invItem.type === 'reindeer_blanket' || invItem.type === 'golden_harness') {
        const rf = STABLE_REINDEER_FRAMES[Math.floor(Math.random() * STABLE_REINDEER_FRAMES.length)];
        return { x: rf.blanketX, y: rf.blanketY };
      }
      if (
        invItem.type === 'hanging_lantern' ||
        invItem.type === 'holly_wreath' ||
        invItem.type === 'glossy_bell' ||
        invItem.type === 'mistletoe_sprig' ||
        invItem.type === 'stable_garland' ||
        invItem.type === 'stable_bell'
      ) {
        return { x: 640 + jitterX * 2.2, y: 155 + (Math.random() - 0.5) * 36 };
      }
      return { x: 640 + jitterX * 2.1, y: 545 + (Math.random() - 0.5) * 28 };
    }
    if (level.id === 7) {
      return { x: 640 + jitterX * 2, y: 495 + jitterY * 0.5 };
    }
    if (level.id === 8) {
      if (invItem.type === 'custom_license_plate' || invItem.type === 'custom_launchpad_sleigh') {
        return {
          x: 485 + (Math.random() - 0.5) * 80,
          y: 470 + (Math.random() - 0.5) * 24
        };
      }
      if (invItem.type === 'toy_stack' || invItem.type === 'cargo_sack') {
        return {
          x: LAUNCHPAD_SLEIGH_ZONES.cargoSnap.snapX + (Math.random() - 0.5) * 36,
          y: LAUNCHPAD_SLEIGH_ZONES.cargoSnap.snapY
        };
      }
      if (invItem.type === 'festive_ribbon' || invItem.type === 'harness_bells') {
        return {
          x: 610 + (Math.random() - 0.5) * 90,
          y: LAUNCHPAD_SLEIGH_ZONES.ribbonSnap.snapY
        };
      }
      return { x: 640 + jitterX * 1.8, y: 545 + jitterY * 0.35 };
    }
    if (level.id === 9) {
      return { x: 640 + jitterX * 1.6, y: 360 + jitterY };
    }
    // Level 11 isometric 14x14 sandbox grid (flush grounded)
    const snap = IsometricGrid.snapScreen(640 + jitterX * 2.2, 370 + jitterY * 1.4);
    const offsetRatio = getIsoGroundOffsetRatio(invItem.type);
    return { x: snap.x, y: snap.y - (invItem.height || 90) * offsetRatio };
  }

  applyLevelSnapLogic(level, candidate) {
    if (level.id === 4) {
      if (
        candidate.type === 'tinsel_line' ||
        candidate.type === 'light_string' ||
        candidate.type === 'streamer'
      ) {
        return;
      }
      // Snap toys onto workshop shelves or Santa's giant sack
      const sk = WORKSHOP_SACK_ZONE;
      if (
        candidate.x >= sk.x &&
        candidate.x <= sk.x + sk.w &&
        candidate.y >= sk.y &&
        candidate.y <= sk.y + sk.h
      ) {
        candidate.x = CoordinateMapper.clamp(candidate.x, sk.snapX - 42, sk.snapX + 42);
        candidate.y = sk.snapY;
        return;
      }
      for (const sh of WORKSHOP_SHELVES) {
        if (candidate.x >= sh.x1 - 24 && candidate.x <= sh.x2 + 24 && Math.abs(candidate.y - (sh.y - 24)) <= 46) {
          candidate.x = CoordinateMapper.clamp(candidate.x, sh.x1 + 26, sh.x2 - 26);
          candidate.y = sh.y - candidate.height * candidate.scale * 0.42;
          return;
        }
      }
    } else if (level.id === 5) {
      const isTray =
        candidate.type === 'cookie_plate' ||
        candidate.type === 'wooden_serving_tray' ||
        candidate.type === 'tiered_cake_stand';
      if (!isTray) {
        // Snap cookies & candies onto nearest placed serving tray / cake stand
        for (const other of level.placedItems) {
          if (
            other.id !== candidate.id &&
            (other.type === 'cookie_plate' ||
              other.type === 'wooden_serving_tray' ||
              other.type === 'tiered_cake_stand')
          ) {
            const dist = CoordinateMapper.distanceBetween(candidate.x, candidate.y, other.x, other.y);
            if (dist <= 82) {
              candidate.x = other.x + CoordinateMapper.clamp(candidate.x - other.x, -42, 42);
              if (other.type === 'tiered_cake_stand') {
                candidate.y = candidate.y < other.y - 10 ? other.y - 26 : other.y + 6;
              } else {
                candidate.y = other.y - 6;
              }
              return;
            }
          }
        }
        // Or snap cleanly onto Display Board, Rolling Pin Parchment, or Cooling Rack
        const zones = [
          BAKERY_WORKSTATIONS.displayBoard,
          BAKERY_WORKSTATIONS.rollingPinZone,
          BAKERY_WORKSTATIONS.coolingRack
        ];
        for (const z of zones) {
          if (
            candidate.x >= z.x - 12 &&
            candidate.x <= z.x + z.w + 12 &&
            candidate.y >= z.y - 20 &&
            candidate.y <= z.y + z.h + 20
          ) {
            candidate.x = CoordinateMapper.clamp(candidate.x, z.x + 24, z.x + z.w - 24);
            candidate.y = z.snapY - 4;
            return;
          }
        }
      }
    } else if (level.id === 6 && (candidate.type === 'reindeer_blanket' || candidate.type === 'golden_harness')) {
      // Clip blankets & harnesses onto nearest reindeer frame
      let bestFrame = null;
      let bestDist = 140;
      for (const rf of STABLE_REINDEER_FRAMES) {
        const dist = CoordinateMapper.distanceBetween(candidate.x, candidate.y, rf.cx, rf.cy);
        if (dist < bestDist) {
          bestDist = dist;
          bestFrame = rf;
        }
      }
      if (bestFrame) {
        candidate.x = bestFrame.blanketX;
        candidate.y = bestFrame.blanketY;
        candidate.customData.snappedReindeerId = bestFrame.id;
      }
    } else if (level.id === 8) {
      if (candidate.type === 'toy_stack' || candidate.type === 'cargo_sack') {
        const cz = LAUNCHPAD_SLEIGH_ZONES.cargoSnap;
        if (CoordinateMapper.rectContainsPoint(cz, candidate.x, candidate.y)) {
          candidate.x = CoordinateMapper.clamp(candidate.x, cz.x + 28, cz.x + cz.w - 28);
          candidate.y = cz.snapY;
        }
      } else if (candidate.type === 'festive_ribbon' || candidate.type === 'harness_bells') {
        const bz = LAUNCHPAD_SLEIGH_ZONES.bodySnap;
        if (CoordinateMapper.rectContainsPoint(bz, candidate.x, candidate.y)) {
          candidate.x = CoordinateMapper.clamp(candidate.x, bz.x + 48, bz.x + bz.w - 36);
          candidate.y = LAUNCHPAD_SLEIGH_ZONES.ribbonSnap.snapY;
        }
      }
    } else if (level.id === 10) {
      // Snap buildings, trains, paths, and flags flush onto the 14x14 isometric grid
      const offsetRatio = getIsoGroundOffsetRatio(candidate.type);
      const groundY = candidate.y + candidate.height * candidate.scale * offsetRatio;
      const snap = IsometricGrid.snapScreen(candidate.x, groundY);
      candidate.x = snap.x;
      candidate.y = snap.y - candidate.height * candidate.scale * offsetRatio;
      candidate.customData.isoCol = snap.col;
      candidate.customData.isoRow = snap.row;
    }
  }

  spawnItemOnCanvas(invItem, x, y) {
    const level = this.getActiveLevel();
    const candidate = new DragItem({
      type: invItem.type,
      label: invItem.label,
      x: CoordinateMapper.clamp(x, 30, LOGICAL_WIDTH - 30),
      y: CoordinateMapper.clamp(y, 30, LOGICAL_HEIGHT - 30),
      width: invItem.width,
      height: invItem.height,
      image: invItem.image,
      customData: { ...invItem.customData }
    });

    // Collision threshold checking against level drop zones
    const zoneValid = level.dropZones.some((z) => candidate.collidesWithZone(z, 36));
    if (!zoneValid && level.id === 0) {
      if (invItem.type === 'gift_box' || invItem.type === 'gift_tall') {
        candidate.x = CoordinateMapper.clamp(candidate.x, 320, 960);
        candidate.y = CoordinateMapper.clamp(candidate.y, 565, 660);
      } else {
        // Gently snap ornaments into tree boundary if dropped just outside boughs
        candidate.x = CoordinateMapper.clamp(candidate.x, 430, 850);
        candidate.y = CoordinateMapper.clamp(candidate.y, 130, 540);
      }
    }

    // Level 3 window pane center snap assist if dropped near pane edge
    if (level.id === 2 && invItem.type === 'custom_sticker' && level.windowPanes) {
      for (const pane of level.windowPanes) {
        if (CoordinateMapper.rectContainsPoint(pane.rect, candidate.x, candidate.y)) {
          candidate.x = CoordinateMapper.clamp(
            candidate.x,
            pane.rect.x + 28,
            pane.rect.x + pane.rect.w - 28
          );
          candidate.y = CoordinateMapper.clamp(
            candidate.y,
            pane.rect.y + 28,
            pane.rect.y + pane.rect.h - 28
          );
          break;
        }
      }
    }

    this.applyLevelSnapLogic(level, candidate);

    level.undoStack.push([...level.placedItems]);
    level.placedItems.push(candidate);
    this.selectedItemId = candidate.id;
    this.sound.playPlace();
    this.syncUI();
    this.saveProgress();
  }

  /* ==========================================================================
     CANVAS POINTER INTERACTION (MENU, LEVEL SELECT, PLACED ITEMS)
     ========================================================================== */

  handleCanvasStart(pt) {
    if (this.state === GAME_STATES.MAIN_MENU) {
      for (const box of this.menuHitBoxes) {
        if (CoordinateMapper.rectContainsPoint(box.rect, pt.x, pt.y)) {
          this.sound.playSave();
          box.action();
          return;
        }
      }
      return;
    }

    if (this.state === GAME_STATES.LEVEL_SELECT) {
      for (const box of this.levelSelectHitBoxes) {
        if (CoordinateMapper.rectContainsPoint(box.rect, pt.x, pt.y)) {
          this.sound.playSave();
          this.setState(GAME_STATES.PLAYING, box.levelIndex);
          return;
        }
      }
      return;
    }

    if (this.state !== GAME_STATES.PLAYING) return;

    const level = this.getActiveLevel();
    // Hit test top-most item first
    for (let i = level.placedItems.length - 1; i >= 0; i--) {
      const item = level.placedItems[i];
      if (item.containsPoint(pt.x, pt.y)) {
        this.selectedItemId = item.id;
        this.draggingItem = item;
        this.dragOffsetX = item.x - pt.x;
        this.dragOffsetY = item.y - pt.y;
        this.dragMoved = false;
        this.dragStartPt = { x: pt.x, y: pt.y };

        // Bring selected item to front
        level.placedItems.splice(i, 1);
        level.placedItems.push(item);
        this.updateSelectionToolbar();
        return;
      }
    }

    // Level 8: Tap built-in streetlamps to cycle light intensity (0 -> 1 -> 2)
    if (level.id === 7) {
      for (const lamp of TOWN_STREETLAMP_HITBOXES) {
        if (CoordinateMapper.rectContainsPoint(lamp, pt.x, pt.y)) {
          const arr = level.settings.streetlampIntensities || [2, 2, 2];
          arr[lamp.id] = ((arr[lamp.id] ?? 2) + 1) % 3;
          level.settings.streetlampIntensities = arr;
          this.sound.playChime();
          this.saveProgress();
          return;
        }
      }
    }

    // Level 9: Tap sleigh harness bells to play audio chime
    if (level.id === 8 && CoordinateMapper.rectContainsPoint(LAUNCHPAD_BELL_HITBOX, pt.x, pt.y)) {
      level.settings.bellJingleTimer = 1.1;
      this.sound.playSleighBells();
      return;
    }

    this.selectedItemId = null;
    this.updateSelectionToolbar();
  }

  handleCanvasMove(pt) {
    this.hoverPt = pt;
    if (this.state !== GAME_STATES.PLAYING || !this.draggingItem) return;

    if (
      this.dragStartPt &&
      CoordinateMapper.distanceBetween(this.dragStartPt.x, this.dragStartPt.y, pt.x, pt.y) > 5
    ) {
      this.dragMoved = true;
    }

    this.draggingItem.x = CoordinateMapper.clamp(pt.x + this.dragOffsetX, 24, LOGICAL_WIDTH - 24);
    this.draggingItem.y = CoordinateMapper.clamp(pt.y + this.dragOffsetY, 24, LOGICAL_HEIGHT - 24);
  }

  handleCanvasEnd() {
    const level = this.getActiveLevel();
    if (this.draggingItem && !this.dragMoved) {
      if (this.draggingItem.type === 'snowman') {
        this.draggingItem.interactTimer = 1.4;
        this.sound.playSave();
      } else if (this.draggingItem.type === 'harness_bells' || this.draggingItem.type === 'stable_bell') {
        this.draggingItem.interactTimer = 1.2;
        this.sound.playSleighBells();
      } else if (this.draggingItem.type === 'streetlamp_prop') {
        this.draggingItem.customData.intensity = ((this.draggingItem.customData.intensity ?? 2) + 1) % 3;
        this.sound.playChime();
        this.saveProgress();
      }
    }
    const movedItem = this.draggingItem && this.dragMoved;
    if (movedItem) {
      this.applyLevelSnapLogic(level, this.draggingItem);
    }
    this.draggingItem = null;
    this.dragStartPt = null;
    if (movedItem) {
      this.saveProgress();
    }
  }

  modifySelectedItem({ scaleDelta = 0, rotateDelta = 0 }) {
    const level = this.getActiveLevel();
    const item = level.placedItems.find((it) => it.id === this.selectedItemId);
    if (!item) return;
    item.scale = CoordinateMapper.clamp(item.scale + scaleDelta, 0.5, 2.2);
    item.rotation += rotateDelta;
    this.sound.playChime();
    this.saveProgress();
  }

  cycleSelectedItemColor() {
    const level = this.getActiveLevel();
    const item = level.placedItems.find((it) => it.id === this.selectedItemId);
    if (!item) return;

    if (item.type === 'balloon') {
      const idx = BALLOON_COLORS.indexOf(item.customData.color);
      item.customData.color = BALLOON_COLORS[(idx + 1) % BALLOON_COLORS.length];
    } else if (item.type === 'streamer') {
      const idx = STREAMER_SCHEMES.findIndex((s) => s.id === item.customData.schemeId);
      const next = STREAMER_SCHEMES[(idx + 1) % STREAMER_SCHEMES.length];
      item.customData.schemeId = next.id;
      item.customData.colors = next.colors;
    } else if (
      item.type === 'gift_box' ||
      item.type === 'gift_tall' ||
      item.type === 'gift_cube' ||
      item.type === 'gift_cylinder' ||
      item.type === 'gift_plush'
    ) {
      const idx = GIFT_SCHEMES.findIndex((g) => g.color === item.customData.color);
      const next = GIFT_SCHEMES[(idx + 1) % GIFT_SCHEMES.length];
      item.customData.color = next.color;
      item.customData.ribbonColor = next.ribbonColor;
    } else if (
      item.type === 'light_string' ||
      item.type === 'fairy_lights' ||
      item.type === 'roof_light_strand'
    ) {
      const idx = LIGHT_SCHEMES.findIndex((s) => s.id === item.customData.schemeId);
      const next = LIGHT_SCHEMES[(idx + 1) % LIGHT_SCHEMES.length];
      item.customData.schemeId = next.id;
      item.customData.colors = next.colors;
    }
    this.sound.playChime();
    this.saveProgress();
  }

  duplicateSelectedItem() {
    const level = this.getActiveLevel();
    const item = level.placedItems.find((it) => it.id === this.selectedItemId);
    if (!item) return;

    const clonedCustomData = { ...item.customData };
    if (Array.isArray(clonedCustomData.colors)) {
      clonedCustomData.colors = [...clonedCustomData.colors];
    }

    const offsetX = item.x + 28 > LOGICAL_WIDTH - 40 ? -28 : 28;
    const offsetY = item.y + 24 > LOGICAL_HEIGHT - 40 ? -24 : 24;

    const duplicate = new DragItem({
      type: item.type,
      label: item.label,
      x: CoordinateMapper.clamp(item.x + offsetX, 30, LOGICAL_WIDTH - 30),
      y: CoordinateMapper.clamp(item.y + offsetY, 30, LOGICAL_HEIGHT - 30),
      width: item.width,
      height: item.height,
      scale: item.scale,
      rotation: item.rotation,
      image: item.image,
      customData: clonedCustomData
    });

    level.undoStack.push([...level.placedItems]);
    level.placedItems.push(duplicate);
    this.selectedItemId = duplicate.id;
    this.sound.playPlace();
    this.syncUI();
    this.saveProgress();
  }

  deleteSelectedItem() {
    const level = this.getActiveLevel();
    const idx = level.placedItems.findIndex((it) => it.id === this.selectedItemId);
    if (idx === -1) return;
    level.undoStack.push([...level.placedItems]);
    level.placedItems.splice(idx, 1);
    this.selectedItemId = null;
    this.sound.playChime();
    this.syncUI();
    this.saveProgress();
  }

  undoLastAction() {
    const level = this.getActiveLevel();
    if (level.undoStack.length > 0) {
      level.placedItems = level.undoStack.pop();
      this.selectedItemId = null;
      this.sound.playChime();
      this.syncUI();
      this.saveProgress();
    }
  }

  resetActiveLevel() {
    const level = this.getActiveLevel();
    if (level.placedItems.length > 0) {
      level.undoStack.push([...level.placedItems]);
      level.placedItems = [];
    }
    this.selectedItemId = null;
    this.sound.playChime();
    this.syncUI();
    this.saveProgress();
  }

  /* ==========================================================================
     CUSTOM DESIGNER STUDIOS (BAUBLE, STOCKING, SNOWFLAKE STICKER, SLEIGH)
     ========================================================================== */

  openActiveStudio() {
    const level = this.getActiveLevel();
    this.setState(GAME_STATES.DESIGNING);

    this.dom.designerModalTitle.textContent = level.studioTitle;
    this.dom.designerModalSubtitle.textContent = level.studioSubtitle;

    const panels = [
      'baubleStudio',
      'stockingStudio',
      'stickerStudio',
      'sleighStudio',
      'toyWorkshopStudio',
      'bakeryStudio',
      'stableStudio',
      'townSquareStudio',
      'launchpadStudio',
      'wrappingStudio',
      'dioramaStudio'
    ];
    panels.forEach((pid) => {
      const el = document.getElementById(pid);
      if (el) el.classList.toggle('hidden', pid !== level.studioId);
    });

    if (level.id === 0) this.renderBaubleStudio();
    if (level.id === 1) this.renderStockingStudio();
    if (level.id === 2) this.renderStickerStudio();
    if (level.id === 3) this.renderSleighStudio();
    if (level.id === 4) this.renderToyWorkshopStudio();
    if (level.id === 5) this.renderBakeryStudio();
    if (level.id === 6) this.renderStableStudio();
    if (level.id === 7) this.renderTownSquareStudio();
    if (level.id === 8) this.renderLaunchpadStudio();
    if (level.id === 9) this.renderWrappingStudio();
    if (level.id === 10) this.renderDioramaStudio();
  }

  closeStudioModal() {
    this.setState(GAME_STATES.PLAYING);
  }

  initStudios() {
    this.initBaubleStudio();
    this.initStockingStudio();
    this.initStickerStudio();
    this.initSleighStudio();
    this.initToyWorkshopStudio();
    this.initBakeryStudio();
    this.initStableStudio();
    this.initTownSquareStudio();
    this.initLaunchpadStudio();
    this.initWrappingStudio();
    this.initDioramaStudio();
  }

  /* --- LEVEL 1: BAUBLE DESIGNER --- */
  initBaubleStudio() {
    const canvas = document.getElementById('baubleCanvas');
    const paintLayer = document.createElement('canvas');
    paintLayer.width = canvas.width;
    paintLayer.height = canvas.height;

    this.baubleStudio = {
      canvas,
      ctx: canvas.getContext('2d'),
      paintLayer,
      paintCtx: paintLayer.getContext('2d'),
      shape: 'ball',
      baseColor: '#b91c1c',
      brush: new CanvasBrush({ color: '#facc15', size: 9 })
    };

    const shapeBtns = document.querySelectorAll('#baubleShapeGroup .seg-btn');
    shapeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        shapeBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.baubleStudio.shape = btn.dataset.shape;
        this.renderBaubleStudio();
      });
    });

    this.populateSwatches('baubleBaseSwatches', ['#b91c1c', '#d4a353', '#15803d', '#1d4ed8', '#7e22ce', '#f8fafc'], this.baubleStudio.baseColor, (col) => {
      this.baubleStudio.baseColor = col;
      this.renderBaubleStudio();
    });

    this.populateSwatches('baubleColorSwatches', STUDIO_PAINT_COLORS, this.baubleStudio.brush.color, (col) => {
      this.baubleStudio.brush.eraser = false;
      this.baubleStudio.brush.color = col;
      this.syncBrushButtons('baubleSizeGroup', this.baubleStudio.brush);
    });

    this.bindBrushSizeGroup('baubleSizeGroup', this.baubleStudio.brush);

    this.inputManagers.push(
      new UnifiedInputManager(canvas, {
        onStart: (pt) => {
          this.baubleStudio.brush.beginPath(pt.x, pt.y);
          this.redrawBaublePaintLayer();
          this.renderBaubleStudio();
        },
        onMove: (pt) => {
          this.baubleStudio.brush.addPoint(pt.x, pt.y);
          this.redrawBaublePaintLayer();
          this.renderBaubleStudio();
        },
        onEnd: () => {
          this.baubleStudio.brush.endPath();
        }
      })
    );

    document.getElementById('btnClearBauble').addEventListener('click', () => {
      this.baubleStudio.brush.clear();
      this.redrawBaublePaintLayer();
      this.renderBaubleStudio();
    });

    document.getElementById('btnSaveBauble').addEventListener('click', () => {
      this.renderBaubleStudio();
      const dataUrl = canvas.toDataURL('image/png');
      const img = new Image();
      img.onload = () => {
        const level = this.levels[0];
        const shapeLabel =
          this.baubleStudio.shape.charAt(0).toUpperCase() + this.baubleStudio.shape.slice(1);
        level.inventory.push({
          id: `custom_bauble_${Date.now()}`,
          type: 'custom_bauble',
          label: `My ${shapeLabel}`,
          width: 58,
          height: 58,
          customData: { shape: this.baubleStudio.shape },
          image: img,
          thumbUrl: dataUrl,
          isCustom: true
        });
        this.sound.playSave();
        this.saveProgress();
        this.closeStudioModal();
      };
      img.src = dataUrl;
    });
  }

  redrawBaublePaintLayer() {
    const { paintLayer, paintCtx, brush } = this.baubleStudio;
    paintCtx.clearRect(0, 0, paintLayer.width, paintLayer.height);
    brush.renderToContext(paintCtx, paintLayer.width, paintLayer.height);
  }

  renderBaubleStudio() {
    const { canvas, ctx, paintLayer, shape, baseColor } = this.baubleStudio;
    const W = canvas.width;
    const H = canvas.height;
    const cx = W * 0.5;
    const cy = H * 0.54;
    const r = 108;

    ctx.clearRect(0, 0, W, H);

    // Metallic brass ornament cap
    ctx.save();
    const capGrad = ctx.createLinearGradient(cx - 20, 0, cx + 20, 0);
    capGrad.addColorStop(0, '#926727');
    capGrad.addColorStop(0.5, '#f5d07a');
    capGrad.addColorStop(1, '#78501a');
    ctx.fillStyle = capGrad;
    roundRectPath(ctx, cx - 18, cy - r - 22, 36, 26, 4);
    ctx.fill();
    ctx.strokeStyle = '#f5d07a';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(cx, cy - r - 30, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Clipped silhouette with radial gradient + user painting + glass sheen
    ctx.save();
    traceBaubleShape(ctx, shape, cx, cy, r);
    const baseGrad = ctx.createRadialGradient(cx - r * 0.32, cy - r * 0.32, 12, cx, cy, r * 1.15);
    baseGrad.addColorStop(0, shadeColor(baseColor, 46));
    baseGrad.addColorStop(0.55, baseColor);
    baseGrad.addColorStop(1, shadeColor(baseColor, -42));
    ctx.fillStyle = baseGrad;
    ctx.fill();

    ctx.clip();
    ctx.drawImage(paintLayer, 0, 0);

    // Subtle glass specular highlight
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.35, cy - r * 0.35, r * 0.22, r * 0.12, -0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Crisp rim outline
    ctx.save();
    traceBaubleShape(ctx, shape, cx, cy, r);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  /* --- LEVEL 2: PERSONALIZED STOCKING CREATOR --- */
  initStockingStudio() {
    const canvas = document.getElementById('stockingCanvas');
    const accentLayer = document.createElement('canvas');
    accentLayer.width = canvas.width;
    accentLayer.height = canvas.height;
    const nameInput = document.getElementById('stockingNameInput');

    this.stockingStudio = {
      canvas,
      ctx: canvas.getContext('2d'),
      accentLayer,
      accentCtx: accentLayer.getContext('2d'),
      bodyColor: STOCKING_FABRICS[0],
      cuffColor: STOCKING_CUFFS[0],
      brush: new CanvasBrush({ color: '#facc15', size: 7 })
    };

    nameInput.addEventListener('input', () => this.renderStockingStudio());

    this.populateSwatches('stockingBodySwatches', STOCKING_FABRICS, this.stockingStudio.bodyColor, (col) => {
      this.stockingStudio.bodyColor = col;
      this.renderStockingStudio();
    });

    this.populateSwatches('stockingCuffSwatches', STOCKING_CUFFS, this.stockingStudio.cuffColor, (col) => {
      this.stockingStudio.cuffColor = col;
      this.renderStockingStudio();
    });

    this.populateSwatches('stockingAccentSwatches', ['#facc15', '#ffffff', '#38bdf8', '#f472b6', '#22c55e'], this.stockingStudio.brush.color, (col) => {
      this.stockingStudio.brush.color = col;
    });

    this.inputManagers.push(
      new UnifiedInputManager(canvas, {
        onStart: (pt) => {
          this.stockingStudio.brush.beginPath(pt.x, pt.y);
          this.redrawStockingAccentLayer();
          this.renderStockingStudio();
        },
        onMove: (pt) => {
          this.stockingStudio.brush.addPoint(pt.x, pt.y);
          this.redrawStockingAccentLayer();
          this.renderStockingStudio();
        },
        onEnd: () => {
          this.stockingStudio.brush.endPath();
        }
      })
    );

    document.getElementById('btnClearStocking').addEventListener('click', () => {
      this.stockingStudio.brush.clear();
      this.redrawStockingAccentLayer();
      this.renderStockingStudio();
    });

    document.getElementById('btnSaveStocking').addEventListener('click', () => {
      const level = this.levels[1];
      const nameStr = (nameInput.value || '').trim() || 'Family';
      // Clone accentLayer snapshot for this stocking
      const snapshot = document.createElement('canvas');
      snapshot.width = accentLayer.width;
      snapshot.height = accentLayer.height;
      snapshot.getContext('2d').drawImage(accentLayer, 0, 0);

      // Generate PNG URL via toDataURL as well for clean asset serialization
      const previewUrl = canvas.toDataURL('image/png');
      level.stockings.push({
        name: nameStr,
        bodyColor: this.stockingStudio.bodyColor,
        cuffColor: this.stockingStudio.cuffColor,
        accentCanvas: snapshot,
        dataUrl: previewUrl
      });

      this.sound.playSave();
      this.saveProgress();
      this.closeStudioModal();
    });
  }

  redrawStockingAccentLayer() {
    const { accentLayer, accentCtx, brush } = this.stockingStudio;
    accentCtx.clearRect(0, 0, accentLayer.width, accentLayer.height);
    brush.renderToContext(accentCtx, accentLayer.width, accentLayer.height);
  }

  renderStockingStudio() {
    const { canvas, ctx, accentLayer, bodyColor, cuffColor } = this.stockingStudio;
    const nameStr = document.getElementById('stockingNameInput').value;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStockingComposite(ctx, {
      cx: canvas.width * 0.5,
      cy: canvas.height * 0.52,
      scale: 1,
      bodyColor,
      cuffColor,
      name: nameStr,
      accentCanvas: accentLayer
    });
  }

  /* --- LEVEL 3: SNOWFLAKE & STICKER EDITOR --- */
  initStickerStudio() {
    const canvas = document.getElementById('stickerCanvas');
    const paintLayer = document.createElement('canvas');
    paintLayer.width = canvas.width;
    paintLayer.height = canvas.height;

    this.stickerStudio = {
      canvas,
      ctx: canvas.getContext('2d'),
      paintLayer,
      paintCtx: paintLayer.getContext('2d'),
      mode: 'symmetry',
      brush: new CanvasBrush({ color: '#ffffff', size: 4, symmetry: 6 })
    };

    const modeBtns = document.querySelectorAll('#stickerModeGroup .seg-btn');
    modeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        modeBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.stickerStudio.mode = btn.dataset.mode;
        this.stickerStudio.brush.symmetry = btn.dataset.mode === 'symmetry' ? 6 : 1;
        this.renderStickerStudio();
      });
    });

    this.populateSwatches(
      'stickerColorSwatches',
      ['#ffffff', '#bae6fd', '#fde047', '#f87171', '#86efac', '#d8b4fe'],
      this.stickerStudio.brush.color,
      (col) => {
        this.stickerStudio.brush.eraser = false;
        this.stickerStudio.brush.color = col;
        this.syncBrushButtons('stickerSizeGroup', this.stickerStudio.brush);
      }
    );

    this.bindBrushSizeGroup('stickerSizeGroup', this.stickerStudio.brush);

    this.inputManagers.push(
      new UnifiedInputManager(canvas, {
        onStart: (pt) => {
          this.stickerStudio.brush.beginPath(pt.x, pt.y);
          this.redrawStickerPaintLayer();
          this.renderStickerStudio();
        },
        onMove: (pt) => {
          this.stickerStudio.brush.addPoint(pt.x, pt.y);
          this.redrawStickerPaintLayer();
          this.renderStickerStudio();
        },
        onEnd: () => {
          this.stickerStudio.brush.endPath();
        }
      })
    );

    document.getElementById('btnClearSticker').addEventListener('click', () => {
      this.stickerStudio.brush.clear();
      this.redrawStickerPaintLayer();
      this.renderStickerStudio();
    });

    document.getElementById('btnSaveSticker').addEventListener('click', () => {
      // Export transparent artwork without guide spokes!
      const exportUrl = this.stickerStudio.paintLayer.toDataURL('image/png');
      const img = new Image();
      img.onload = () => {
        const level = this.levels[2];
        const label =
          this.stickerStudio.mode === 'symmetry' ? 'Snowflake' : 'Window Sticker';
        level.inventory.push({
          id: `custom_sticker_${Date.now()}`,
          type: 'custom_sticker',
          label,
          width: 92,
          height: 92,
          customData: { mode: this.stickerStudio.mode },
          image: img,
          thumbUrl: exportUrl,
          isCustom: true
        });
        this.sound.playSave();
        this.saveProgress();
        this.closeStudioModal();
      };
      img.src = exportUrl;
    });
  }

  redrawStickerPaintLayer() {
    const { paintLayer, paintCtx, brush } = this.stickerStudio;
    paintCtx.clearRect(0, 0, paintLayer.width, paintLayer.height);
    brush.renderToContext(paintCtx, paintLayer.width, paintLayer.height);
  }

  renderStickerStudio() {
    const { canvas, ctx, paintLayer, mode } = this.stickerStudio;
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Subtle radial symmetry guide spokes (not exported into sticker!)
    if (mode === 'symmetry') {
      ctx.save();
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.18)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      const cx = W * 0.5;
      const cy = H * 0.5;
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * 145, cy + Math.sin(a) * 145);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(cx, cy, 120, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.drawImage(paintLayer, 0, 0);
  }

  /* --- LEVEL 4: FESTIVE SLEIGH & FREEFORM GARDEN PROP STUDIO --- */
  initSleighStudio() {
    const canvas = document.getElementById('sleighCanvas');
    const paintLayer = document.createElement('canvas');
    paintLayer.width = canvas.width;
    paintLayer.height = canvas.height;
    const trimGroup = document.getElementById('sleighTrimGroup');
    const nameInput = document.getElementById('gardenItemNameInput');

    this.sleighStudio = {
      canvas,
      ctx: canvas.getContext('2d'),
      paintLayer,
      paintCtx: paintLayer.getContext('2d'),
      mode: 'sleigh',
      trimColor: '#d4a353',
      brush: new CanvasBrush({ color: '#facc15', size: 10 })
    };

    const modeBtns = document.querySelectorAll('#sleighModeGroup .seg-btn');
    modeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        modeBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.sleighStudio.mode = btn.dataset.mode;
        trimGroup.classList.toggle('hidden', this.sleighStudio.mode === 'freeform');
        this.renderSleighStudio();
      });
    });

    this.populateSwatches(
      'sleighTrimSwatches',
      ['#d4a353', '#e2e8f0', '#b91c1c', '#15803d', '#38bdf8'],
      this.sleighStudio.trimColor,
      (col) => {
        this.sleighStudio.trimColor = col;
        this.renderSleighStudio();
      }
    );

    this.populateSwatches(
      'sleighColorSwatches',
      STUDIO_PAINT_COLORS,
      this.sleighStudio.brush.color,
      (col) => {
        this.sleighStudio.brush.eraser = false;
        this.sleighStudio.brush.color = col;
        this.syncBrushButtons('sleighSizeGroup', this.sleighStudio.brush);
      }
    );

    this.bindBrushSizeGroup('sleighSizeGroup', this.sleighStudio.brush);

    this.inputManagers.push(
      new UnifiedInputManager(canvas, {
        onStart: (pt) => {
          this.sleighStudio.brush.beginPath(pt.x, pt.y);
          this.redrawSleighPaintLayer();
          this.renderSleighStudio();
        },
        onMove: (pt) => {
          this.sleighStudio.brush.addPoint(pt.x, pt.y);
          this.redrawSleighPaintLayer();
          this.renderSleighStudio();
        },
        onEnd: () => {
          this.sleighStudio.brush.endPath();
        }
      })
    );

    document.getElementById('btnClearSleigh').addEventListener('click', () => {
      this.sleighStudio.brush.clear();
      this.redrawSleighPaintLayer();
      this.renderSleighStudio();
    });

    document.getElementById('btnSaveSleigh').addEventListener('click', () => {
      const isFreeform = this.sleighStudio.mode === 'freeform';
      let dataUrl;
      if (isFreeform) {
        dataUrl = this.sleighStudio.paintLayer.toDataURL('image/png');
      } else {
        this.renderSleighStudio();
        dataUrl = canvas.toDataURL('image/png');
      }
      const typedName = (nameInput.value || '').trim();
      const itemLabel = typedName || (isFreeform ? 'Garden Prop' : 'Custom Sleigh');

      const img = new Image();
      img.onload = () => {
        const level = this.levels[3];
        level.inventory.push({
          id: `custom_garden_${Date.now()}`,
          type: isFreeform ? 'custom_garden_prop' : 'custom_sleigh',
          label: itemLabel,
          width: isFreeform ? 155 : 190,
          height: isFreeform ? 96 : 118,
          customData: { mode: this.sleighStudio.mode },
          image: img,
          thumbUrl: dataUrl,
          isCustom: true
        });
        this.sound.playSave();
        this.saveProgress();
        this.closeStudioModal();
      };
      img.src = dataUrl;
    });
  }

  redrawSleighPaintLayer() {
    const { paintLayer, paintCtx, brush } = this.sleighStudio;
    paintCtx.clearRect(0, 0, paintLayer.width, paintLayer.height);
    brush.renderToContext(paintCtx, paintLayer.width, paintLayer.height);
  }

  renderSleighStudio() {
    const { canvas, ctx, paintLayer, trimColor, mode } = this.sleighStudio;
    const W = canvas.width;
    const H = canvas.height;
    const cx = W * 0.5;
    const cy = H * 0.48;

    ctx.clearRect(0, 0, W, H);

    if (mode === 'freeform') {
      // Unclipped freeform canvas for drawing any custom garden item
      ctx.drawImage(paintLayer, 0, 0);
      return;
    }

    // Sleigh metal runners & struts
    ctx.save();
    ctx.strokeStyle = trimColor;
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 125, cy + 78);
    ctx.lineTo(cx + 110, cy + 78);
    ctx.bezierCurveTo(cx + 150, cy + 78, cx + 165, cy + 40, cx + 138, cy + 28);
    ctx.stroke();

    // Runner supports
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx - 75, cy + 48);
    ctx.lineTo(cx - 85, cy + 78);
    ctx.moveTo(cx + 55, cy + 48);
    ctx.lineTo(cx + 65, cy + 78);
    ctx.stroke();
    ctx.restore();

    // Sleigh body with rich crimson lacquer gradient + clipped paint strokes
    ctx.save();
    traceSleighBodyPath(ctx, cx, cy, 1);
    const bodyGrad = ctx.createLinearGradient(cx - 130, cy - 60, cx + 130, cy + 55);
    bodyGrad.addColorStop(0, '#dc2626');
    bodyGrad.addColorStop(0.55, '#991b1b');
    bodyGrad.addColorStop(1, '#581010');
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    ctx.clip();
    ctx.drawImage(paintLayer, 0, 0);
    ctx.restore();

    // Gold/trim outline
    ctx.save();
    traceSleighBodyPath(ctx, cx, cy, 1);
    ctx.strokeStyle = trimColor;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
  }

  /* --- LEVEL 5: SANTA'S TOY WORKSHOP STUDIO --- */
  initToyWorkshopStudio() {
    const canvas = document.getElementById('toyCanvas');
    if (!canvas) return;
    const paintLayer = document.createElement('canvas');
    paintLayer.width = canvas.width;
    paintLayer.height = canvas.height;
    const nameInput = document.getElementById('toyNameInput');

    this.toyWorkshopStudio = {
      canvas,
      ctx: canvas.getContext('2d'),
      paintLayer,
      paintCtx: paintLayer.getContext('2d'),
      shape: 'teddy',
      baseColor: '#b45309',
      stencil: 'none',
      brush: new CanvasBrush({ color: '#ef4444', size: 9 })
    };

    const shapeBtns = document.querySelectorAll('#toyShapeGroup .seg-btn');
    shapeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        shapeBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.toyWorkshopStudio.shape = btn.dataset.shape;
        this.renderToyWorkshopStudio();
      });
    });

    const stencilBtns = document.querySelectorAll('#toyStencilGroup .seg-btn');
    stencilBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        stencilBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.toyWorkshopStudio.stencil = btn.dataset.stencil;
      });
    });

    nameInput.addEventListener('input', () => this.renderToyWorkshopStudio());

    this.populateSwatches('toyBaseSwatches', ['#b45309', '#dc2626', '#15803d', '#2563eb', '#f5efe2'], this.toyWorkshopStudio.baseColor, (col) => {
      this.toyWorkshopStudio.baseColor = col;
      this.renderToyWorkshopStudio();
    });

    this.populateSwatches('toyColorSwatches', STUDIO_PAINT_COLORS, this.toyWorkshopStudio.brush.color, (col) => {
      this.toyWorkshopStudio.brush.eraser = false;
      this.toyWorkshopStudio.brush.color = col;
      this.syncBrushButtons('toySizeGroup', this.toyWorkshopStudio.brush);
    });

    this.bindBrushSizeGroup('toySizeGroup', this.toyWorkshopStudio.brush);

    this.inputManagers.push(
      new UnifiedInputManager(canvas, {
        onStart: (pt) => {
          const st = this.toyWorkshopStudio.stencil;
          if (st && st !== 'none') {
            this.stampToyStencil(pt.x, pt.y, st);
            this.renderToyWorkshopStudio();
            return;
          }
          this.toyWorkshopStudio.brush.beginPath(pt.x, pt.y);
          this.redrawToyPaintLayer();
          this.renderToyWorkshopStudio();
        },
        onMove: (pt) => {
          if (this.toyWorkshopStudio.stencil !== 'none') return;
          this.toyWorkshopStudio.brush.addPoint(pt.x, pt.y);
          this.redrawToyPaintLayer();
          this.renderToyWorkshopStudio();
        },
        onEnd: () => {
          this.toyWorkshopStudio.brush.endPath();
        }
      })
    );

    document.getElementById('btnClearToy').addEventListener('click', () => {
      this.toyWorkshopStudio.brush.clear();
      this.toyWorkshopStudio.paintCtx.clearRect(0, 0, paintLayer.width, paintLayer.height);
      this.renderToyWorkshopStudio();
    });

    document.getElementById('btnSaveToy').addEventListener('click', () => {
      this.renderToyWorkshopStudio();
      const dataUrl = canvas.toDataURL('image/png');
      const img = new Image();
      img.onload = () => {
        const level = this.levels[4];
        const tag = (nameInput.value || '').trim();
        level.inventory.push({
          id: `custom_toy_${Date.now()}`,
          type: 'custom_toy',
          label: tag || `Custom ${this.toyWorkshopStudio.shape}`,
          width: 82,
          height: 78,
          customData: { shape: this.toyWorkshopStudio.shape, tagName: tag },
          image: img,
          thumbUrl: dataUrl,
          isCustom: true
        });
        this.sound.playSave();
        this.saveProgress();
        this.closeStudioModal();
      };
      img.src = dataUrl;
    });
  }

  stampToyStencil(x, y, stencilType) {
    const { paintCtx, brush } = this.toyWorkshopStudio;
    paintCtx.save();
    paintCtx.fillStyle = brush.color;
    paintCtx.translate(x, y);
    if (stencilType === 'star') {
      paintCtx.beginPath();
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? 18 : 8;
        const a = (i * Math.PI) / 5 - Math.PI / 2;
        if (i === 0) paintCtx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        else paintCtx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      paintCtx.closePath();
      paintCtx.fill();
    } else if (stencilType === 'heart') {
      paintCtx.beginPath();
      paintCtx.moveTo(0, 8);
      paintCtx.bezierCurveTo(-18, -6, -16, -20, 0, -8);
      paintCtx.bezierCurveTo(16, -20, 18, -6, 0, 8);
      paintCtx.fill();
    } else if (stencilType === 'dots') {
      [[-10, -8], [10, -8], [0, 8]].forEach(([dx, dy]) => {
        paintCtx.beginPath();
        paintCtx.arc(dx, dy, 5.5, 0, Math.PI * 2);
        paintCtx.fill();
      });
    }
    paintCtx.restore();
  }

  redrawToyPaintLayer() {
    const { paintLayer, paintCtx, brush } = this.toyWorkshopStudio;
    paintCtx.clearRect(0, 0, paintLayer.width, paintLayer.height);
    brush.renderToContext(paintCtx, paintLayer.width, paintLayer.height);
  }

  renderToyWorkshopStudio() {
    const { canvas, ctx, paintLayer, shape, baseColor } = this.toyWorkshopStudio;
    const tagName = document.getElementById('toyNameInput').value;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawToySilhouetteComposite(ctx, {
      cx: canvas.width * 0.45,
      cy: canvas.height * 0.5,
      scale: 0.9,
      shape,
      baseColor,
      tagName,
      paintLayer
    });
  }

  /* --- LEVEL 6: GINGERBREAD BAKERY STUDIO --- */
  initBakeryStudio() {
    const canvas = document.getElementById('cookieCanvas');
    if (!canvas) return;
    const icingLayer = document.createElement('canvas');
    icingLayer.width = canvas.width;
    icingLayer.height = canvas.height;

    this.bakeryStudio = {
      canvas,
      ctx: canvas.getContext('2d'),
      icingLayer,
      icingCtx: icingLayer.getContext('2d'),
      shape: 'gingerbread_man',
      doughColor: '#b4692e',
      brush: new CanvasBrush({ color: '#ffffff', size: 3 })
    };

    const shapeBtns = document.querySelectorAll('#cookieShapeGroup .seg-btn');
    shapeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        shapeBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.bakeryStudio.shape = btn.dataset.shape;
        this.renderBakeryStudio();
      });
    });

    this.populateSwatches('cookieBakeSwatches', ['#b4692e', '#c98443', '#7c3f1c', '#e2be87'], this.bakeryStudio.doughColor, (col) => {
      this.bakeryStudio.doughColor = col;
      this.renderBakeryStudio();
    });

    this.populateSwatches('cookieIcingSwatches', ['#ffffff', '#ef4444', '#22c55e', '#facc15', '#38bdf8', '#f472b6'], this.bakeryStudio.brush.color, (col) => {
      this.bakeryStudio.brush.eraser = false;
      this.bakeryStudio.brush.color = col;
      this.syncBrushButtons('cookieSizeGroup', this.bakeryStudio.brush);
    });

    this.bindBrushSizeGroup('cookieSizeGroup', this.bakeryStudio.brush);

    this.inputManagers.push(
      new UnifiedInputManager(canvas, {
        onStart: (pt) => {
          this.bakeryStudio.brush.beginPath(pt.x, pt.y);
          this.redrawCookieIcingLayer();
          this.renderBakeryStudio();
        },
        onMove: (pt) => {
          this.bakeryStudio.brush.addPoint(pt.x, pt.y);
          this.redrawCookieIcingLayer();
          this.renderBakeryStudio();
        },
        onEnd: () => {
          this.bakeryStudio.brush.endPath();
        }
      })
    );

    document.getElementById('btnClearCookie').addEventListener('click', () => {
      this.bakeryStudio.brush.clear();
      this.redrawCookieIcingLayer();
      this.renderBakeryStudio();
    });

    document.getElementById('btnSaveCookie').addEventListener('click', () => {
      this.renderBakeryStudio();
      const dataUrl = canvas.toDataURL('image/png');
      const img = new Image();
      img.onload = () => {
        const level = this.levels[5];
        level.inventory.push({
          id: `custom_cookie_${Date.now()}`,
          type: 'custom_cookie',
          label: 'Iced Cookie',
          width: 68,
          height: 68,
          customData: { shape: this.bakeryStudio.shape },
          image: img,
          thumbUrl: dataUrl,
          isCustom: true
        });
        this.sound.playSave();
        this.saveProgress();
        this.closeStudioModal();
      };
      img.src = dataUrl;
    });
  }

  redrawCookieIcingLayer() {
    const { icingLayer, icingCtx, brush } = this.bakeryStudio;
    icingCtx.clearRect(0, 0, icingLayer.width, icingLayer.height);
    brush.renderToContext(icingCtx, icingLayer.width, icingLayer.height);
  }

  renderBakeryStudio() {
    const { canvas, ctx, icingLayer, shape, doughColor } = this.bakeryStudio;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCookieComposite(ctx, {
      cx: canvas.width * 0.5,
      cy: canvas.height * 0.5,
      shape,
      doughColor,
      icingLayer
    });
  }

  /* --- LEVEL 7: NORTH POLE STABLE PATTERN MATRIX & BRASS TAG --- */
  initStableStudio() {
    const gridEl = document.getElementById('blanketMatrixGrid');
    const previewCanvas = document.getElementById('blanketPreviewCanvas');
    const nameInput = document.getElementById('reindeerNameInput');
    if (!gridEl || !previewCanvas) return;

    const createMatrix = (preset = 'tartan') => {
      const m = [];
      for (let r = 0; r < 6; r++) {
        const row = [];
        for (let c = 0; c < 8; c++) {
          if (preset === 'chevron') {
            row.push((r + Math.abs(c - 3.5)) % 2 < 1 ? '#15803d' : '#dc2626');
          } else if (preset === 'fairisle') {
            row.push((r + c) % 2 === 0 ? '#1d4ed8' : (r % 2 === 0 ? '#f8fafc' : '#facc15'));
          } else {
            row.push(r === 2 || c === 3 ? '#facc15' : (c % 2 === 0 ? '#b91c1c' : '#15803d'));
          }
        }
        m.push(row);
      }
      return m;
    };

    this.stableStudio = {
      gridEl,
      previewCanvas,
      ctx: previewCanvas.getContext('2d'),
      activeColor: '#facc15',
      matrix: createMatrix('tartan'),
      isPaintingMatrix: false
    };

    const rebuildMatrixDom = () => {
      gridEl.innerHTML = '';
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 8; c++) {
          const cell = document.createElement('button');
          cell.type = 'button';
          cell.className = 'matrix-cell';
          cell.style.backgroundColor = this.stableStudio.matrix[r][c];
          cell.dataset.r = String(r);
          cell.dataset.c = String(c);
          const paintCell = () => {
            this.stableStudio.matrix[r][c] = this.stableStudio.activeColor;
            cell.style.backgroundColor = this.stableStudio.activeColor;
            this.renderStableStudio();
          };
          cell.addEventListener('mousedown', () => {
            this.stableStudio.isPaintingMatrix = true;
            paintCell();
          });
          cell.addEventListener('mouseenter', () => {
            if (this.stableStudio.isPaintingMatrix) paintCell();
          });
          cell.addEventListener('touchstart', (e) => {
            e.preventDefault();
            paintCell();
          }, { passive: false });
          gridEl.appendChild(cell);
        }
      }
    };

    window.addEventListener('mouseup', () => {
      if (this.stableStudio) this.stableStudio.isPaintingMatrix = false;
    });

    rebuildMatrixDom();

    document.querySelectorAll('#matrixPresetGroup .seg-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.stableStudio.matrix = createMatrix(btn.dataset.preset);
        rebuildMatrixDom();
        this.renderStableStudio();
      });
    });

    nameInput.addEventListener('input', () => this.renderStableStudio());

    this.populateSwatches('matrixColorSwatches', ['#b91c1c', '#15803d', '#facc15', '#f8fafc', '#1d4ed8', '#7e22ce'], this.stableStudio.activeColor, (col) => {
      this.stableStudio.activeColor = col;
    });

    document.getElementById('btnClearBlanket').addEventListener('click', () => {
      this.stableStudio.matrix = Array.from({ length: 6 }, () => Array(8).fill('#b91c1c'));
      rebuildMatrixDom();
      this.renderStableStudio();
    });

    document.getElementById('btnSaveBlanket').addEventListener('click', () => {
      this.renderStableStudio();
      const dataUrl = previewCanvas.toDataURL('image/png');
      const img = new Image();
      img.onload = () => {
        const level = this.levels[6];
        const tag = (nameInput.value || '').trim() || 'Comet';
        level.inventory.push({
          id: `custom_blanket_${Date.now()}`,
          type: 'reindeer_blanket',
          label: `${tag} Blanket`,
          width: 120,
          height: 88,
          customData: { reindeerName: tag },
          image: img,
          thumbUrl: dataUrl,
          isCustom: true
        });
        this.sound.playSave();
        this.saveProgress();
        this.closeStudioModal();
      };
      img.src = dataUrl;
    });
  }

  renderStableStudio() {
    if (!this.stableStudio) return;
    const { previewCanvas, ctx, matrix } = this.stableStudio;
    const nameStr = document.getElementById('reindeerNameInput').value;
    ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    drawReindeerBlanketComposite(ctx, {
      cx: previewCanvas.width * 0.43,
      cy: previewCanvas.height * 0.52,
      matrix,
      name: nameStr,
      scale: 0.94
    });
  }

  /* --- LEVEL 8: TOWN SQUARE SIGNBOARD & WINDOW GLOW STUDIO --- */
  initTownSquareStudio() {
    const canvas = document.getElementById('signboardCanvas');
    if (!canvas) return;
    const paintLayer = document.createElement('canvas');
    paintLayer.width = canvas.width;
    paintLayer.height = canvas.height;
    const textInput = document.getElementById('signboardTextInput');
    const glowRange = document.getElementById('signboardGlowRange');

    this.townSquareStudio = {
      canvas,
      ctx: canvas.getContext('2d'),
      paintLayer,
      paintCtx: paintLayer.getContext('2d'),
      shape: 'arch',
      baseColor: '#1e3a2f',
      glowColor: '#fde047',
      glowIntensity: 85,
      brush: new CanvasBrush({ color: '#f5d07a', size: 8 })
    };

    const shapeBtns = document.querySelectorAll('#signboardShapeGroup .seg-btn');
    shapeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        shapeBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.townSquareStudio.shape = btn.dataset.shape;
        this.renderTownSquareStudio();
      });
    });

    textInput.addEventListener('input', () => this.renderTownSquareStudio());
    glowRange.addEventListener('input', () => {
      const val = Number(glowRange.value || 85);
      this.townSquareStudio.glowIntensity = val;
      this.levels[7].settings.windowGlowIntensity = val;
      this.renderTownSquareStudio();
    });

    this.populateSwatches('signboardBaseSwatches', ['#1e3a2f', '#7f1d1d', '#1e3a5f', '#4a2c1a', '#1e293b'], this.townSquareStudio.baseColor, (col) => {
      this.townSquareStudio.baseColor = col;
      this.renderTownSquareStudio();
    });

    this.populateSwatches('signboardGlowSwatches', ['#fde047', '#38bdf8', '#fb7185', '#4ade80', '#f8fafc'], this.townSquareStudio.glowColor, (col) => {
      this.townSquareStudio.glowColor = col;
      this.levels[7].settings.windowGlowColor = col;
      this.renderTownSquareStudio();
    });

    this.populateSwatches('signboardColorSwatches', STUDIO_PAINT_COLORS, this.townSquareStudio.brush.color, (col) => {
      this.townSquareStudio.brush.eraser = false;
      this.townSquareStudio.brush.color = col;
      this.syncBrushButtons('signboardSizeGroup', this.townSquareStudio.brush);
    });

    this.bindBrushSizeGroup('signboardSizeGroup', this.townSquareStudio.brush);

    this.inputManagers.push(
      new UnifiedInputManager(canvas, {
        onStart: (pt) => {
          this.townSquareStudio.brush.beginPath(pt.x, pt.y);
          this.redrawSignboardPaintLayer();
          this.renderTownSquareStudio();
        },
        onMove: (pt) => {
          this.townSquareStudio.brush.addPoint(pt.x, pt.y);
          this.redrawSignboardPaintLayer();
          this.renderTownSquareStudio();
        },
        onEnd: () => {
          this.townSquareStudio.brush.endPath();
        }
      })
    );

    document.getElementById('btnClearSignboard').addEventListener('click', () => {
      this.townSquareStudio.brush.clear();
      this.redrawSignboardPaintLayer();
      this.renderTownSquareStudio();
    });

    document.getElementById('btnSaveSignboard').addEventListener('click', () => {
      this.renderTownSquareStudio();
      const dataUrl = canvas.toDataURL('image/png');
      const img = new Image();
      img.onload = () => {
        const level = this.levels[7];
        const title = (textInput.value || '').trim() || 'Shop Sign';
        level.inventory.push({
          id: `custom_signboard_${Date.now()}`,
          type: 'custom_signboard',
          label: title,
          width: 155,
          height: 90,
          customData: { shape: this.townSquareStudio.shape },
          image: img,
          thumbUrl: dataUrl,
          isCustom: true
        });
        this.sound.playSave();
        this.saveProgress();
        this.closeStudioModal();
      };
      img.src = dataUrl;
    });
  }

  redrawSignboardPaintLayer() {
    const { paintLayer, paintCtx, brush } = this.townSquareStudio;
    paintCtx.clearRect(0, 0, paintLayer.width, paintLayer.height);
    brush.renderToContext(paintCtx, paintLayer.width, paintLayer.height);
  }

  renderTownSquareStudio() {
    const { canvas, ctx, paintLayer, shape, baseColor, glowColor, glowIntensity } = this.townSquareStudio;
    const text = document.getElementById('signboardTextInput').value;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSignboardComposite(ctx, {
      cx: canvas.width * 0.5,
      cy: canvas.height * 0.52,
      shape,
      baseColor,
      text,
      glowColor,
      glowIntensity,
      paintLayer
    });
  }

  /* --- LEVEL 9: SLEIGH LAUNCHPAD SIDE-PANEL & LICENSE PLATE STUDIO --- */
  initLaunchpadStudio() {
    const canvas = document.getElementById('launchpadCanvas');
    if (!canvas) return;
    const paintLayer = document.createElement('canvas');
    paintLayer.width = canvas.width;
    paintLayer.height = canvas.height;
    const plateInput = document.getElementById('licensePlateInput');

    this.launchpadStudio = {
      canvas,
      ctx: canvas.getContext('2d'),
      paintLayer,
      paintCtx: paintLayer.getContext('2d'),
      baseColor: '#991b1b',
      trimColor: '#d4a353',
      brush: new CanvasBrush({ color: '#fde047', size: 8 })
    };

    plateInput.addEventListener('input', () => this.renderLaunchpadStudio());

    this.populateSwatches('launchpadBaseSwatches', ['#991b1b', '#15803d', '#1d4ed8', '#581c87', '#1e293b'], this.launchpadStudio.baseColor, (col) => {
      this.launchpadStudio.baseColor = col;
      this.renderLaunchpadStudio();
    });

    this.populateSwatches('launchpadTrimSwatches', ['#d4a353', '#f8fafc', '#38bdf8', '#fb7185'], this.launchpadStudio.trimColor, (col) => {
      this.launchpadStudio.trimColor = col;
      this.renderLaunchpadStudio();
    });

    this.populateSwatches('launchpadColorSwatches', STUDIO_PAINT_COLORS, this.launchpadStudio.brush.color, (col) => {
      this.launchpadStudio.brush.eraser = false;
      this.launchpadStudio.brush.color = col;
      this.syncBrushButtons('launchpadSizeGroup', this.launchpadStudio.brush);
    });

    this.bindBrushSizeGroup('launchpadSizeGroup', this.launchpadStudio.brush);

    this.inputManagers.push(
      new UnifiedInputManager(canvas, {
        onStart: (pt) => {
          this.launchpadStudio.brush.beginPath(pt.x, pt.y);
          this.redrawLaunchpadPaintLayer();
          this.renderLaunchpadStudio();
        },
        onMove: (pt) => {
          this.launchpadStudio.brush.addPoint(pt.x, pt.y);
          this.redrawLaunchpadPaintLayer();
          this.renderLaunchpadStudio();
        },
        onEnd: () => {
          this.launchpadStudio.brush.endPath();
        }
      })
    );

    document.getElementById('btnClearLaunchpad').addEventListener('click', () => {
      this.launchpadStudio.brush.clear();
      this.redrawLaunchpadPaintLayer();
      this.renderLaunchpadStudio();
    });

    document.getElementById('btnSaveLaunchpad').addEventListener('click', () => {
      this.renderLaunchpadStudio();
      const dataUrl = canvas.toDataURL('image/png');
      const img = new Image();
      img.onload = () => {
        const level = this.levels[8];
        const plate = (plateInput.value || '').trim().toUpperCase() || 'SANTA-1';
        level.inventory.push({
          id: `custom_license_plate_${Date.now()}`,
          type: 'custom_license_plate',
          label: `Plate [${plate}]`,
          width: 132,
          height: 66,
          customData: { plate },
          image: img,
          thumbUrl: dataUrl,
          isCustom: true
        });
        this.sound.playSave();
        this.saveProgress();
        this.closeStudioModal();
      };
      img.src = dataUrl;
    });
  }

  redrawLaunchpadPaintLayer() {
    const { paintLayer, paintCtx, brush } = this.launchpadStudio;
    paintCtx.clearRect(0, 0, paintLayer.width, paintLayer.height);
    brush.renderToContext(paintCtx, paintLayer.width, paintLayer.height);
  }

  renderLaunchpadStudio() {
    const { canvas, ctx, paintLayer, baseColor, trimColor } = this.launchpadStudio;
    const plateText = document.getElementById('licensePlateInput').value;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSleighPanelComposite(ctx, {
      cx: canvas.width * 0.5,
      cy: canvas.height * 0.5,
      baseColor,
      trimColor,
      plateText,
      paintLayer
    });
  }

  /* --- LEVEL 10: TILING GRID PATTERN GIFT WRAPPING STUDIO (64x64) --- */
  initWrappingStudio() {
    const tileCanvas = document.getElementById('wrapTileCanvas');
    const previewCanvas = document.getElementById('wrapPreviewCanvas');
    if (!tileCanvas || !previewCanvas) return;

    this.wrappingStudio = {
      tileCanvas,
      tileCtx: tileCanvas.getContext('2d'),
      previewCanvas,
      previewCtx: previewCanvas.getContext('2d'),
      shape: 'square',
      paperColor: '#b91c1c',
      ribbonColor: '#f5d07a',
      brush: new CanvasBrush({ color: '#fef9c3', size: 4 })
    };

    const shapeBtns = document.querySelectorAll('#wrapShapeGroup .seg-btn');
    shapeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        shapeBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.wrappingStudio.shape = btn.dataset.shape;
        this.renderWrappingStudio();
      });
    });

    this.populateSwatches('wrapPaperSwatches', ['#b91c1c', '#15803d', '#1d4ed8', '#f8fafc', '#4f46e5', '#0f172a'], this.wrappingStudio.paperColor, (col) => {
      this.wrappingStudio.paperColor = col;
      this.renderWrappingStudio();
    });

    this.populateSwatches('wrapRibbonSwatches', ['#f5d07a', '#dc2626', '#f8fafc', '#22c55e', '#38bdf8'], this.wrappingStudio.ribbonColor, (col) => {
      this.wrappingStudio.ribbonColor = col;
      this.renderWrappingStudio();
    });

    this.populateSwatches('wrapColorSwatches', STUDIO_PAINT_COLORS, this.wrappingStudio.brush.color, (col) => {
      this.wrappingStudio.brush.eraser = false;
      this.wrappingStudio.brush.color = col;
      this.syncBrushButtons('wrapSizeGroup', this.wrappingStudio.brush);
    });

    this.bindBrushSizeGroup('wrapSizeGroup', this.wrappingStudio.brush);

    this.inputManagers.push(
      new UnifiedInputManager(tileCanvas, {
        onStart: (pt) => {
          this.wrappingStudio.brush.beginPath(pt.x, pt.y);
          this.redrawWrapTileLayer();
          this.renderWrappingStudio();
        },
        onMove: (pt) => {
          this.wrappingStudio.brush.addPoint(pt.x, pt.y);
          this.redrawWrapTileLayer();
          this.renderWrappingStudio();
        },
        onEnd: () => {
          this.wrappingStudio.brush.endPath();
        }
      })
    );

    document.getElementById('btnClearWrap').addEventListener('click', () => {
      this.wrappingStudio.brush.clear();
      this.redrawWrapTileLayer();
      this.renderWrappingStudio();
    });

    document.getElementById('btnSaveWrap').addEventListener('click', () => {
      this.renderWrappingStudio();
      const dataUrl = previewCanvas.toDataURL('image/png');
      const img = new Image();
      img.onload = () => {
        const level = this.levels[9];
        const shapeName =
          this.wrappingStudio.shape.charAt(0).toUpperCase() + this.wrappingStudio.shape.slice(1);
        level.inventory.push({
          id: `custom_wrapped_gift_${Date.now()}`,
          type: 'custom_wrapped_gift',
          label: `Tiled ${shapeName}`,
          width: 96,
          height: 96,
          customData: { shape: this.wrappingStudio.shape },
          image: img,
          thumbUrl: dataUrl,
          isCustom: true
        });
        this.sound.playSave();
        this.saveProgress();
        this.closeStudioModal();
      };
      img.src = dataUrl;
    });
  }

  redrawWrapTileLayer() {
    const { tileCanvas, tileCtx, brush } = this.wrappingStudio;
    tileCtx.clearRect(0, 0, tileCanvas.width, tileCanvas.height);
    brush.renderToContext(tileCtx, tileCanvas.width, tileCanvas.height);
  }

  renderWrappingStudio() {
    const { tileCanvas, previewCanvas, previewCtx, shape, paperColor, ribbonColor } = this.wrappingStudio;
    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    drawWrappedGiftComposite(previewCtx, {
      cx: previewCanvas.width * 0.5,
      cy: previewCanvas.height * 0.54,
      shape,
      paperColor,
      ribbonColor,
      tileCanvas
    });
  }

  /* --- LEVEL 11: BONUS VILLAGE COMMUNITY FLAG PAINTER --- */
  initDioramaStudio() {
    const canvas = document.getElementById('flagCanvas');
    if (!canvas) return;
    const paintLayer = document.createElement('canvas');
    paintLayer.width = canvas.width;
    paintLayer.height = canvas.height;
    const labelInput = document.getElementById('flagLabelInput');

    this.dioramaStudio = {
      canvas,
      ctx: canvas.getContext('2d'),
      paintLayer,
      paintCtx: paintLayer.getContext('2d'),
      shape: 'pennant',
      baseColor: '#b91c1c',
      brush: new CanvasBrush({ color: '#fde047', size: 8 })
    };

    const shapeBtns = document.querySelectorAll('#flagShapeGroup .seg-btn');
    shapeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        shapeBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.dioramaStudio.shape = btn.dataset.shape;
        this.renderDioramaStudio();
      });
    });

    labelInput.addEventListener('input', () => this.renderDioramaStudio());

    this.populateSwatches('flagBaseSwatches', ['#b91c1c', '#15803d', '#1d4ed8', '#7e22ce', '#f8fafc'], this.dioramaStudio.baseColor, (col) => {
      this.dioramaStudio.baseColor = col;
      this.renderDioramaStudio();
    });

    this.populateSwatches('flagColorSwatches', STUDIO_PAINT_COLORS, this.dioramaStudio.brush.color, (col) => {
      this.dioramaStudio.brush.eraser = false;
      this.dioramaStudio.brush.color = col;
      this.syncBrushButtons('flagSizeGroup', this.dioramaStudio.brush);
    });

    this.bindBrushSizeGroup('flagSizeGroup', this.dioramaStudio.brush);

    this.inputManagers.push(
      new UnifiedInputManager(canvas, {
        onStart: (pt) => {
          this.dioramaStudio.brush.beginPath(pt.x, pt.y);
          this.redrawDioramaPaintLayer();
          this.renderDioramaStudio();
        },
        onMove: (pt) => {
          this.dioramaStudio.brush.addPoint(pt.x, pt.y);
          this.redrawDioramaPaintLayer();
          this.renderDioramaStudio();
        },
        onEnd: () => {
          this.dioramaStudio.brush.endPath();
        }
      })
    );

    document.getElementById('btnClearFlag').addEventListener('click', () => {
      this.dioramaStudio.brush.clear();
      this.redrawDioramaPaintLayer();
      this.renderDioramaStudio();
    });

    document.getElementById('btnSaveFlag').addEventListener('click', () => {
      this.renderDioramaStudio();
      const dataUrl = canvas.toDataURL('image/png');
      const img = new Image();
      img.onload = () => {
        const level = this.levels[10];
        const motto = (labelInput.value || '').trim() || 'Village Flag';
        level.inventory.push({
          id: `custom_village_flag_${Date.now()}`,
          type: 'custom_village_flag',
          label: motto,
          width: 82,
          height: 76,
          customData: { shape: this.dioramaStudio.shape },
          image: img,
          thumbUrl: dataUrl,
          isCustom: true
        });
        this.sound.playSave();
        this.saveProgress();
        this.closeStudioModal();
      };
      img.src = dataUrl;
    });
  }

  redrawDioramaPaintLayer() {
    const { paintLayer, paintCtx, brush } = this.dioramaStudio;
    paintCtx.clearRect(0, 0, paintLayer.width, paintLayer.height);
    brush.renderToContext(paintCtx, paintLayer.width, paintLayer.height);
  }

  renderDioramaStudio() {
    const { canvas, ctx, paintLayer, shape, baseColor } = this.dioramaStudio;
    const labelText = document.getElementById('flagLabelInput').value;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawVillageFlagComposite(ctx, {
      cx: canvas.width * 0.5,
      cy: canvas.height * 0.52,
      shape,
      baseColor,
      labelText,
      paintLayer
    });
  }

  /* --- STUDIO UI HELPERS --- */
  populateSwatches(containerId, colors, initialColor, onSelect) {
    const el = document.getElementById(containerId);
    el.innerHTML = '';
    colors.forEach((col) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'swatch-btn' + (col === initialColor ? ' active' : '');
      btn.style.backgroundColor = col;
      btn.setAttribute('aria-label', `Color ${col}`);
      btn.addEventListener('click', () => {
        el.querySelectorAll('.swatch-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        onSelect(col);
      });
      el.appendChild(btn);
    });
  }

  bindBrushSizeGroup(groupId, brush) {
    const group = document.getElementById(groupId);
    const btns = group.querySelectorAll('.seg-btn');
    btns.forEach((btn) => {
      btn.addEventListener('click', () => {
        btns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        if (btn.dataset.eraser === 'true') {
          brush.eraser = true;
        } else {
          brush.eraser = false;
          brush.size = Number(btn.dataset.size || 8);
        }
      });
    });
  }

  syncBrushButtons(groupId, brush) {
    const group = document.getElementById(groupId);
    const btns = group.querySelectorAll('.seg-btn');
    btns.forEach((btn) => {
      if (btn.dataset.eraser === 'true') {
        btn.classList.toggle('active', brush.eraser);
      } else {
        btn.classList.toggle('active', !brush.eraser && Number(btn.dataset.size) === brush.size);
      }
    });
  }

  /* ==========================================================================
     MAIN ANIMATION & RENDER LOOP
     ========================================================================== */

  tick(timestamp) {
    if (this.destroyed) return;
    const dt = Math.min((timestamp - this.lastFrameTime) / 1000, 0.05);
    this.lastFrameTime = timestamp;
    this.elapsed += dt;

    // Update falling snow & interactive timers
    let snowMult = 1;
    if (this.state !== GAME_STATES.MAIN_MENU) {
      if (this.activeLevelIndex === 3) {
        snowMult = this.levels[3].settings.snowSpeed ?? 1;
      } else if (this.activeLevelIndex === 10) {
        snowMult = this.levels[10].settings.weatherMode === 'blizzard' ? 2.8 : 1;
      }
    }
    for (let i = 0; i < this.snowParticles.length; i++) {
      const p = this.snowParticles[i];
      p.y += p.vy * snowMult * dt;
      p.x += p.vx * snowMult * dt;
      if (p.y > LOGICAL_HEIGHT + 8) {
        p.y = -8;
        p.x = Math.random() * LOGICAL_WIDTH;
      }
      if (p.x < -8) p.x = LOGICAL_WIDTH + 8;
      if (p.x > LOGICAL_WIDTH + 8) p.x = -8;
    }

    const activeLvl = this.getActiveLevel();
    if (activeLvl.settings && activeLvl.settings.bellJingleTimer > 0) {
      activeLvl.settings.bellJingleTimer = Math.max(0, activeLvl.settings.bellJingleTimer - dt);
    }
    for (let i = 0; i < activeLvl.placedItems.length; i++) {
      if (activeLvl.placedItems[i].interactTimer > 0) {
        activeLvl.placedItems[i].interactTimer = Math.max(
          0,
          activeLvl.placedItems[i].interactTimer - dt
        );
      }
    }

    this.render();
    this.rafId = requestAnimationFrame((ts) => this.tick(ts));
  }

  renderSceneForLevel(ctx, level) {
    if (level.id === 0) renderLevel1Scene(ctx, this.elapsed, level.settings);
    else if (level.id === 1) renderLevel2Scene(ctx, this.elapsed, level.settings, level.stockings);
    else if (level.id === 2) renderLevel3Scene(ctx, this.elapsed, level.settings);
    else if (level.id === 3) renderLevel4Scene(ctx, this.elapsed, level.settings, this.snowParticles);
    else if (level.id === 4) renderLevel5Scene(ctx, this.elapsed, level.settings);
    else if (level.id === 5) renderLevel6Scene(ctx, this.elapsed, level.settings);
    else if (level.id === 6) renderLevel7Scene(ctx, this.elapsed, level.settings);
    else if (level.id === 7) renderLevel8Scene(ctx, this.elapsed, level.settings, this.snowParticles);
    else if (level.id === 8) renderLevel9Scene(ctx, this.elapsed, level.settings);
    else if (level.id === 9) renderLevel10Scene(ctx, this.elapsed, level.settings);
    else renderLevel11Scene(ctx, this.elapsed, level.settings, this.snowParticles);
  }

  getOrderedDrawItems(level) {
    if (level.id === 5) {
      // Draw serving plates, timber trays & tiered cake stands underneath cookies & candies
      const isTray = (it) =>
        it.type === 'cookie_plate' ||
        it.type === 'wooden_serving_tray' ||
        it.type === 'tiered_cake_stand';
      return [
        ...level.placedItems.filter(isTray),
        ...level.placedItems.filter((it) => !isTray(it))
      ];
    }
    if (level.id === 10) {
      // Isometric back-to-front depth sort by tile diagonal (col + row), with flat paths first
      return [...level.placedItems].sort((a, b) => {
        const ga =
          typeof a.customData.isoCol === 'number' && typeof a.customData.isoRow === 'number'
            ? { col: a.customData.isoCol, row: a.customData.isoRow }
            : IsometricGrid.toGrid(a.x, a.y + a.height * a.scale * getIsoGroundOffsetRatio(a.type));
        const gb =
          typeof b.customData.isoCol === 'number' && typeof b.customData.isoRow === 'number'
            ? { col: b.customData.isoCol, row: b.customData.isoRow }
            : IsometricGrid.toGrid(b.x, b.y + b.height * b.scale * getIsoGroundOffsetRatio(b.type));
        const depthDiff = ga.col + ga.row - (gb.col + gb.row);
        if (depthDiff !== 0) return depthDiff;
        const aFlat = a.type === 'candy_cane_path' ? 0 : 1;
        const bFlat = b.type === 'candy_cane_path' ? 0 : 1;
        if (aFlat !== bFlat) return aFlat - bFlat;
        return a.y - b.y;
      });
    }
    return level.placedItems;
  }

  render() {
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    ctx.setLineDash([]);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.state === GAME_STATES.MAIN_MENU) {
      this.renderMainMenu(ctx);
      return;
    }

    if (this.state === GAME_STATES.LEVEL_SELECT) {
      this.renderLevelSelect(ctx);
      return;
    }

    // Playing or Designing (render active scene behind modal)
    const level = this.getActiveLevel();
    this.renderSceneForLevel(ctx, level);

    // Highlight active drop zones subtly while dragging
    if (this.trayDragPayload || this.draggingItem) {
      this.renderDropZoneHints(ctx, level);
    }

    // Render all placed items
    const orderedItems = this.getOrderedDrawItems(level);
    for (let i = 0; i < orderedItems.length; i++) {
      const item = orderedItems[i];
      item.draw(ctx, this.elapsed, item.id === this.selectedItemId);
    }
  }

  renderDropZoneHints(ctx, level) {
    ctx.save();
    if (level.id === 2 && level.windowPanes) {
      for (const pane of level.windowPanes) {
        const hovered = CoordinateMapper.rectContainsPoint(pane.rect, this.hoverPt.x, this.hoverPt.y);
        ctx.strokeStyle = hovered ? 'rgba(253, 224, 71, 0.85)' : 'rgba(186, 230, 253, 0.25)';
        ctx.lineWidth = hovered ? 3 : 1.5;
        ctx.setLineDash([6, 6]);
        ctx.strokeRect(pane.rect.x + 6, pane.rect.y + 6, pane.rect.w - 12, pane.rect.h - 12);
      }
    } else if (level.id === 0) {
      const draggedType =
        (this.trayDragPayload && this.trayDragPayload.invItem.type) ||
        (this.draggingItem && this.draggingItem.type);
      ctx.strokeStyle = 'rgba(245, 208, 122, 0.35)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      if ((draggedType === 'gift_box' || draggedType === 'gift_tall') && level.dropZones[1]) {
        const floorRect = level.dropZones[1].rect;
        ctx.strokeRect(floorRect.x, floorRect.y, floorRect.w, floorRect.h);
      } else {
        const poly = level.dropZones[0].polygon;
        ctx.beginPath();
        ctx.moveTo(poly[0].x, poly[0].y);
        ctx.lineTo(poly[1].x, poly[1].y);
        ctx.lineTo(poly[2].x, poly[2].y);
        ctx.closePath();
        ctx.stroke();
      }
    } else if (level.id === 4) {
      ctx.strokeStyle = 'rgba(245, 208, 122, 0.45)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      WORKSHOP_SHELVES.forEach((sh) => {
        ctx.strokeRect(sh.x1, sh.y - 52, sh.x2 - sh.x1, 52);
      });
      const sk = WORKSHOP_SACK_ZONE;
      ctx.strokeRect(sk.x, sk.y, sk.w, sk.h);
    } else if (level.id === 5) {
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.48)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      [
        BAKERY_WORKSTATIONS.displayBoard,
        BAKERY_WORKSTATIONS.rollingPinZone,
        BAKERY_WORKSTATIONS.coolingRack
      ].forEach((z) => {
        ctx.strokeRect(z.x, z.y, z.w, z.h);
      });
      level.placedItems.forEach((it) => {
        if (
          it.type === 'cookie_plate' ||
          it.type === 'wooden_serving_tray' ||
          it.type === 'tiered_cake_stand'
        ) {
          ctx.beginPath();
          ctx.arc(it.x, it.y, 58, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
    } else if (level.id === 6) {
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.55)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      STABLE_REINDEER_FRAMES.forEach((rf) => {
        ctx.beginPath();
        ctx.arc(rf.blanketX, rf.blanketY, 56, 0, Math.PI * 2);
        ctx.stroke();
      });
    } else if (level.id === 8) {
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.52)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      const bz = LAUNCHPAD_SLEIGH_ZONES.bodySnap;
      ctx.strokeRect(bz.x, bz.y, bz.w, bz.h);
    } else if (level.id === 10) {
      const snap = IsometricGrid.snapScreen(this.hoverPt.x, this.hoverPt.y);
      const hw = IsometricGrid.tileW * 0.5;
      const hh = IsometricGrid.tileH * 0.5;
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.9)';
      ctx.fillStyle = 'rgba(253, 224, 71, 0.22)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(snap.x, snap.y - hh);
      ctx.lineTo(snap.x + hw, snap.y);
      ctx.lineTo(snap.x, snap.y + hh);
      ctx.lineTo(snap.x - hw, snap.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  renderMainMenu(ctx) {
    // Deep festive night gradient
    const bgGrad = ctx.createRadialGradient(640, 280, 60, 640, 360, 760);
    bgGrad.addColorStop(0, '#1e4234');
    bgGrad.addColorStop(0.55, '#0f261e');
    bgGrad.addColorStop(1, '#06110d');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    // Falling snow
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    for (const p of this.snowParticles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Glowing festive top garland lights
    const colors = ['#f87171', '#facc15', '#38bdf8', '#4ade80'];
    ctx.save();
    for (let i = 0; i <= 24; i++) {
      const bx = 40 + (i / 24) * (LOGICAL_WIDTH - 80);
      const by = 32 + Math.sin((i / 24) * Math.PI * 4) * 14;
      const col = colors[i % colors.length];
      const pulse = 0.55 + 0.45 * Math.sin(this.elapsed * 3.5 + i * 0.7);
      ctx.shadowColor = col;
      ctx.shadowBlur = 14 * pulse;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(bx, by, 5.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Central title plaque
    ctx.save();
    ctx.fillStyle = 'rgba(13, 28, 23, 0.84)';
    ctx.strokeStyle = 'rgba(212, 163, 83, 0.5)';
    ctx.lineWidth = 2;
    roundRectPath(ctx, 270, 145, 740, 420, 22);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#d4a353';
    ctx.font = '600 17px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('YULETIDE ATELIER · 11-SCENE HOLIDAY DECORATING STUDIO', 640, 212);

    ctx.fillStyle = '#f6efe2';
    ctx.font = '700 46px "Fraunces", Georgia, serif';
    ctx.fillText('Christmas Decorating Fun', 640, 286);

    ctx.fillStyle = '#b6c2ba';
    ctx.font = '400 19px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Decorate trees, hearths, toy workshops, gingerbread bakeries,', 640, 344);
    ctx.fillText('town squares, sleigh launchpads & the Santa Village diorama.', 640, 374);
    ctx.restore();

    // Interactive Canvas Buttons
    const startRect = { x: 400, y: 430, w: 230, h: 64 };
    const levelsRect = { x: 650, y: 430, w: 230, h: 64 };

    this.menuHitBoxes = [
      { rect: startRect, action: () => this.setState(GAME_STATES.PLAYING, 0) },
      { rect: levelsRect, action: () => this.setState(GAME_STATES.LEVEL_SELECT) }
    ];

    this.drawCanvasButton(ctx, startRect, 'Start Decorating', true);
    this.drawCanvasButton(ctx, levelsRect, 'Choose Scene (11)', false);
  }

  renderLevelSelect(ctx) {
    const bgGrad = ctx.createRadialGradient(640, 320, 80, 640, 360, 780);
    bgGrad.addColorStop(0, '#1c3a30');
    bgGrad.addColorStop(1, '#081410');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    ctx.fillStyle = '#f6efe2';
    ctx.font = '700 34px "Fraunces", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('Choose a Holiday Scene (10 Core + Bonus Sandbox)', 640, 56);

    const cards = [
      { idx: 0, title: 'Evergreen Tree', desc: 'Tree hues, lights, tinsel & baubles', accent: '#15803d' },
      { idx: 1, title: 'Hearth & Mantle', desc: 'Garlands, fire & family stockings', accent: '#b91c1c' },
      { idx: 2, title: 'Living Room', desc: 'Streamers, lights & window stickers', accent: '#0284c7' },
      { idx: 3, title: 'Winter Garden', desc: 'House, snowmen & custom sleigh', accent: '#d97706' },
      { idx: 4, title: 'Toy Workshop', desc: 'Conveyor, toy painter & name tags', accent: '#9a3412' },
      { idx: 5, title: 'Cookie Bakery', desc: 'Cookie cutters & fine icing brush', accent: '#b45309' },
      { idx: 6, title: 'North Pole Stable', desc: 'Weave matrix blanket & collar tags', accent: '#4f46e5' },
      { idx: 7, title: 'Town Square', desc: 'Signboards, window glow & lamps', accent: '#0f766e' },
      { idx: 8, title: 'Sleigh Launchpad', desc: 'Sleigh panels, plates & jingle bells', accent: '#be123c' },
      { idx: 9, title: 'Gift Station', desc: '64x64 tiled pattern gift wrapper', accent: '#7e22ce' },
      { idx: 10, title: "BONUS · Santa's Village Diorama", desc: 'Isometric sandbox builder, community flags & animated weather cycles', accent: '#d4a353', bonus: true }
    ];

    this.levelSelectHitBoxes = [];
    const cardW = 280;
    const cardH = 182;
    const gapX = 20;
    const gapY = 18;
    const startX = 50;
    const startY = 86;

    cards.forEach((c, i) => {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const w = c.bonus ? cardW * 2 + gapX : cardW;
      const rect = {
        x: startX + col * (cardW + gapX),
        y: startY + row * (cardH + gapY),
        w,
        h: cardH
      };
      this.levelSelectHitBoxes.push({ rect, levelIndex: c.idx });

      const hovered = CoordinateMapper.rectContainsPoint(rect, this.hoverPt.x, this.hoverPt.y);

      ctx.save();
      const cGrad = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
      cGrad.addColorStop(0, hovered ? '#244a3d' : (c.bonus ? '#253927' : '#162f27'));
      cGrad.addColorStop(1, '#0e1f1a');
      ctx.fillStyle = cGrad;
      ctx.strokeStyle = hovered ? '#f5d07a' : (c.bonus ? 'rgba(245, 208, 122, 0.72)' : 'rgba(212, 163, 83, 0.35)');
      ctx.lineWidth = hovered || c.bonus ? 2.2 : 1.4;
      ctx.shadowColor = 'rgba(0,0,0,0.45)';
      ctx.shadowBlur = 14;
      roundRectPath(ctx, rect.x, rect.y, rect.w, rect.h, 14);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.stroke();

      // Number badge
      ctx.fillStyle = c.accent;
      ctx.beginPath();
      ctx.arc(rect.x + 34, rect.y + 38, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = c.bonus ? '#1c1305' : '#ffffff';
      ctx.font = '700 15px "Fraunces", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(c.idx + 1), rect.x + 34, rect.y + 39);

      // Card text
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = c.bonus ? '#fde68a' : '#f6efe2';
      ctx.font = '700 19px "Fraunces", Georgia, serif';
      ctx.fillText(c.title, rect.x + 60, rect.y + 44, rect.w - 76);

      ctx.fillStyle = '#b6c2ba';
      ctx.font = '400 14px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(c.desc, rect.x + 18, rect.y + 92, rect.w - 36);

      const placed = this.levels[c.idx].placedItems.length;
      ctx.fillStyle = '#d4a353';
      ctx.font = '600 13px "JetBrains Mono", monospace';
      ctx.fillText(`${placed} placed · Enter`, rect.x + 18, rect.y + 154);
      ctx.restore();
    });
  }

  drawCanvasButton(ctx, rect, text, isPrimary) {
    const hovered = CoordinateMapper.rectContainsPoint(rect, this.hoverPt.x, this.hoverPt.y);
    ctx.save();
    if (isPrimary) {
      const grad = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
      grad.addColorStop(0, hovered ? '#f0c77c' : '#e2b462');
      grad.addColorStop(1, hovered ? '#d69e43' : '#c48d34');
      ctx.fillStyle = grad;
      ctx.strokeStyle = '#fbe3b5';
    } else {
      ctx.fillStyle = hovered ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.08)';
      ctx.strokeStyle = 'rgba(212, 163, 83, 0.5)';
    }
    ctx.lineWidth = 2;
    roundRectPath(ctx, rect.x, rect.y, rect.w, rect.h, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isPrimary ? '#1c1305' : '#f6efe2';
    ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, rect.x + rect.w * 0.5, rect.y + rect.h * 0.5);
    ctx.restore();
  }

  /* ==========================================================================
     PERSISTENT LOCALSTORAGE SAVE & RESTORE
     ========================================================================== */

  saveProgress() {
    try {
      const payload = {
        version: 1,
        activeLevelIndex: this.activeLevelIndex,
        levels: this.levels.map((lvl) => ({
          id: lvl.id,
          settings: {
            treePaletteId: lvl.settings.treePalette ? lvl.settings.treePalette.id : null,
            tinselPaletteId: lvl.settings.tinselPalette ? lvl.settings.tinselPalette.id : null,
            wallpaperId: lvl.settings.wallpaperPalette ? lvl.settings.wallpaperPalette.id : null,
            showTinsel: lvl.settings.showTinsel,
            showLights: lvl.settings.showLights,
            fireBoost: lvl.settings.fireBoost,
            windowFrost: lvl.settings.windowFrost,
            houseColor: lvl.settings.houseColor,
            roofLights: lvl.settings.roofLights,
            windowLights: lvl.settings.windowLights,
            showSnow: lvl.settings.showSnow,
            snowSpeed: lvl.settings.snowSpeed,
            lightSchemeId: lvl.settings.lightScheme ? lvl.settings.lightScheme.id : null,
            streamerSchemeId: lvl.settings.streamerScheme ? lvl.settings.streamerScheme.id : null,
            conveyorActive: lvl.settings.conveyorActive,
            workshopGlow: lvl.settings.workshopGlow,
            ovenGlow: lvl.settings.ovenGlow,
            flourDusting: lvl.settings.flourDusting,
            counterColor: lvl.settings.counterColor,
            auroraSky: lvl.settings.auroraSky,
            stableLanterns: lvl.settings.stableLanterns,
            windowGlowColor: lvl.settings.windowGlowColor,
            windowGlowIntensity: lvl.settings.windowGlowIntensity,
            townTreeLights: lvl.settings.townTreeLights,
            streetlampIntensities: lvl.settings.streetlampIntensities,
            runwayLights: lvl.settings.runwayLights,
            stardustBoost: lvl.settings.stardustBoost,
            tableGlow: lvl.settings.tableGlow,
            weatherMode: lvl.settings.weatherMode,
            showIsoGrid: lvl.settings.showIsoGrid
          },
          stockings: lvl.stockings
            ? lvl.stockings.map((s) => ({
                name: s.name,
                bodyColor: s.bodyColor,
                cuffColor: s.cuffColor,
                accentDataUrl: s.accentCanvas ? s.accentCanvas.toDataURL('image/png') : null
              }))
            : null,
          customInventory: lvl.inventory
            .filter((inv) => inv.isCustom)
            .map((inv) => ({
              id: inv.id,
              type: inv.type,
              label: inv.label,
              width: inv.width,
              height: inv.height,
              customData: inv.customData || {},
              thumbUrl: inv.thumbUrl
            })),
          placedItems: lvl.placedItems.map((it) => ({
            id: it.id,
            type: it.type,
            label: it.label,
            x: it.x,
            y: it.y,
            width: it.width,
            height: it.height,
            scale: it.scale,
            rotation: it.rotation,
            phase: it.phase,
            customData: it.customData || {},
            imageSrc: it.image ? it.image.src : null
          }))
        }))
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (_err) {
      // Ignore storage quota or private-mode restrictions cleanly
    }
  }

  loadProgress() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (!saved || !Array.isArray(saved.levels)) return;

      if (
        typeof saved.activeLevelIndex === 'number' &&
        saved.activeLevelIndex >= 0 &&
        saved.activeLevelIndex < this.levels.length
      ) {
        this.activeLevelIndex = saved.activeLevelIndex;
      }

      saved.levels.forEach((savedLvl) => {
        const level = this.levels.find((l) => l.id === savedLvl.id);
        if (!level) return;

        // Restore level settings
        if (savedLvl.settings) {
          const s = savedLvl.settings;
          if (s.treePaletteId) {
            const pal = TREE_PALETTES.find((p) => p.id === s.treePaletteId);
            if (pal) level.settings.treePalette = pal;
          }
          if (s.tinselPaletteId) {
            const tPal = TINSEL_PALETTES.find((p) => p.id === s.tinselPaletteId);
            if (tPal) level.settings.tinselPalette = tPal;
          }
          if (s.wallpaperId) {
            const wp = WALLPAPER_PALETTES.find((p) => p.id === s.wallpaperId);
            if (wp) level.settings.wallpaperPalette = wp;
          }
          if (typeof s.showTinsel === 'boolean') level.settings.showTinsel = s.showTinsel;
          if (typeof s.showLights === 'boolean') level.settings.showLights = s.showLights;
          if (typeof s.fireBoost === 'boolean') level.settings.fireBoost = s.fireBoost;
          if (typeof s.windowFrost === 'boolean') level.settings.windowFrost = s.windowFrost;
          if (typeof s.houseColor === 'string') level.settings.houseColor = s.houseColor;
          if (typeof s.roofLights === 'boolean') level.settings.roofLights = s.roofLights;
          if (typeof s.windowLights === 'boolean') level.settings.windowLights = s.windowLights;
          if (typeof s.showSnow === 'boolean') level.settings.showSnow = s.showSnow;
          if (typeof s.snowSpeed === 'number') level.settings.snowSpeed = s.snowSpeed;
          if (typeof s.conveyorActive === 'boolean') level.settings.conveyorActive = s.conveyorActive;
          if (typeof s.workshopGlow === 'boolean') level.settings.workshopGlow = s.workshopGlow;
          if (typeof s.ovenGlow === 'boolean') level.settings.ovenGlow = s.ovenGlow;
          if (typeof s.flourDusting === 'boolean') level.settings.flourDusting = s.flourDusting;
          if (typeof s.counterColor === 'string') level.settings.counterColor = s.counterColor;
          if (typeof s.auroraSky === 'boolean') level.settings.auroraSky = s.auroraSky;
          if (typeof s.stableLanterns === 'boolean') level.settings.stableLanterns = s.stableLanterns;
          if (typeof s.windowGlowColor === 'string') level.settings.windowGlowColor = s.windowGlowColor;
          if (typeof s.windowGlowIntensity === 'number') level.settings.windowGlowIntensity = s.windowGlowIntensity;
          if (typeof s.townTreeLights === 'boolean') level.settings.townTreeLights = s.townTreeLights;
          if (Array.isArray(s.streetlampIntensities)) level.settings.streetlampIntensities = s.streetlampIntensities;
          if (typeof s.runwayLights === 'boolean') level.settings.runwayLights = s.runwayLights;
          if (typeof s.stardustBoost === 'boolean') level.settings.stardustBoost = s.stardustBoost;
          if (typeof s.tableGlow === 'boolean') level.settings.tableGlow = s.tableGlow;
          if (typeof s.weatherMode === 'string') level.settings.weatherMode = s.weatherMode;
          if (typeof s.showIsoGrid === 'boolean') level.settings.showIsoGrid = s.showIsoGrid;

          if (s.lightSchemeId) {
            const scheme = LIGHT_SCHEMES.find((ls) => ls.id === s.lightSchemeId);
            if (scheme) {
              level.settings.lightScheme = scheme;
              level.settings.lightColors = scheme.colors;
              level.inventory.forEach((inv) => {
                if (
                  inv.type === 'light_string' ||
                  inv.type === 'fairy_lights' ||
                  inv.type === 'roof_light_strand'
                ) {
                  inv.customData.schemeId = scheme.id;
                  inv.customData.colors = scheme.colors;
                  inv.thumbUrl = renderThumbnailDataURL(inv.type, inv.customData);
                }
              });
            }
          }

          if (s.streamerSchemeId) {
            const strScheme = STREAMER_SCHEMES.find((ss) => ss.id === s.streamerSchemeId);
            if (strScheme) {
              level.settings.streamerScheme = strScheme;
              level.settings.streamerColors = strScheme.colors;
              level.inventory.forEach((inv) => {
                if (inv.type === 'streamer') {
                  inv.customData.schemeId = strScheme.id;
                  inv.customData.colors = strScheme.colors;
                  inv.thumbUrl = renderThumbnailDataURL(inv.type, inv.customData);
                }
              });
            }
          }
        }

        // Restore family stockings (Level 2) including custom drawn accents
        if (Array.isArray(savedLvl.stockings) && level.stockings) {
          level.stockings = savedLvl.stockings.map((st) => {
            let accentCanvas = null;
            if (st.accentDataUrl) {
              accentCanvas = document.createElement('canvas');
              accentCanvas.width = 320;
              accentCanvas.height = 360;
              const accentCtx = accentCanvas.getContext('2d');
              const accentImg = new Image();
              accentImg.onload = () => {
                accentCtx.drawImage(accentImg, 0, 0);
              };
              accentImg.src = st.accentDataUrl;
            }
            return {
              name: st.name || 'Family',
              bodyColor: st.bodyColor || STOCKING_FABRICS[0],
              cuffColor: st.cuffColor || STOCKING_CUFFS[0],
              accentCanvas
            };
          });
        }

        // Restore custom studio creations into inventory tray
        if (Array.isArray(savedLvl.customInventory)) {
          savedLvl.customInventory.forEach((ci) => {
            if (!ci.thumbUrl) return;
            const img = new Image();
            img.src = ci.thumbUrl;
            level.inventory.push({
              id: ci.id || `custom_restored_${Date.now()}`,
              type: ci.type,
              label: ci.label || 'Custom',
              width: ci.width || 64,
              height: ci.height || 64,
              customData: ci.customData || {},
              image: img,
              thumbUrl: ci.thumbUrl,
              isCustom: true
            });
          });
        }

        // Restore placed decorations
        if (Array.isArray(savedLvl.placedItems)) {
          level.placedItems = savedLvl.placedItems.map((pi) => {
            let img = null;
            if (pi.imageSrc) {
              img = new Image();
              img.src = pi.imageSrc;
            }
            const restored = new DragItem({
              id: pi.id,
              type: pi.type,
              label: pi.label,
              x: pi.x,
              y: pi.y,
              width: pi.width,
              height: pi.height,
              scale: pi.scale,
              rotation: pi.rotation,
              phase: pi.phase,
              customData: pi.customData || {},
              image: img
            });
            if (level.id === 10) {
              // Ensure restored diorama pieces anchor flush on the expanded 14x14 isometric grid
              this.applyLevelSnapLogic(level, restored);
            }
            return restored;
          });
        }
      });
    } catch (_err) {
      // Fall back to fresh default levels if stored data is malformed
    }
  }

  /* ==========================================================================
     FLATTENED JPEG CAMERA / SNAPSHOT EXPORT
     ========================================================================== */

  takePhoto() {
    if (this.state !== GAME_STATES.PLAYING) return;
    const level = this.getActiveLevel();

    // Render onto a clean opaque 1280x720 canvas with zero selection outlines
    const snapCanvas = document.createElement('canvas');
    snapCanvas.width = LOGICAL_WIDTH;
    snapCanvas.height = LOGICAL_HEIGHT;
    const snapCtx = snapCanvas.getContext('2d');

    snapCtx.fillStyle = '#0a1411';
    snapCtx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    this.renderSceneForLevel(snapCtx, level);

    const orderedItems = this.getOrderedDrawItems(level);
    for (let i = 0; i < orderedItems.length; i++) {
      orderedItems[i].draw(snapCtx, this.elapsed, false);
    }

    const jpegDataUrl = snapCanvas.toDataURL('image/jpeg', 0.92);
    const filename = `christmas-decorating-fun-level-${level.id + 1}.jpg`;
    this.lastPhotoFile = null;

    if (this.dom.photoPreviewImg) {
      this.dom.photoPreviewImg.src = jpegDataUrl;
    }
    if (this.dom.btnDownloadPhoto) {
      this.dom.btnDownloadPhoto.href = jpegDataUrl;
      this.dom.btnDownloadPhoto.setAttribute('download', filename);
    }

    // Prepare File object for native mobile Share / Save to Photos if supported
    if (typeof navigator !== 'undefined' && navigator.share && typeof File !== 'undefined') {
      snapCanvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], filename, { type: 'image/jpeg' });
            if (!navigator.canShare || navigator.canShare({ files: [file] })) {
              this.lastPhotoFile = file;
              this.dom.btnSharePhoto.classList.remove('hidden');
            } else {
              this.dom.btnSharePhoto.classList.add('hidden');
            }
          }
        },
        'image/jpeg',
        0.92
      );
    } else if (this.dom.btnSharePhoto) {
      this.dom.btnSharePhoto.classList.add('hidden');
    }

    this.sound.playSave();
    if (this.dom.photoOverlay) {
      this.dom.photoOverlay.classList.remove('hidden');
    }
    if (this.dom.btnDownloadPhoto) {
      this.dom.btnDownloadPhoto.click();
    }
  }

  shareLastPhoto() {
    if (!this.lastPhotoFile || !navigator.share) return;
    navigator
      .share({
        title: 'Christmas Decorating Fun',
        text: 'Check out my Christmas scene!',
        files: [this.lastPhotoFile]
      })
      .catch(() => {});
  }

  closePhotoModal() {
    if (this.dom.photoOverlay) {
      this.dom.photoOverlay.classList.add('hidden');
    }
  }
}

export { ChristmasDecoratorGame };

export function initYuletideGame() {
  if (window.yuletideGame && typeof window.yuletideGame.destroy === 'function') {
    window.yuletideGame.destroy();
  }
  const instance = new ChristmasDecoratorGame();
  window.yuletideGame = instance;
  return instance;
}
