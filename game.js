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
      this.dom.hudMeta.textContent = '4 Interactive Levels';
    } else {
      this.dom.hudTitle.textContent = 'Christmas Decorating Fun';
      this.dom.hudMeta.textContent = '4 Festive Scenes';
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
        item.type === 'gift_tall';
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
    if (invItem.type === 'roof_light_strand') return { x: 640 + jitterX, y: 175 };
    if (invItem.type === 'pathway_marker') return { x: 640 + jitterX, y: 575 + jitterY * 0.5 };
    return { x: 640 + jitterX * 2, y: 535 + jitterY * 0.5 };
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
    if (this.draggingItem && !this.dragMoved && this.draggingItem.type === 'snowman') {
      this.draggingItem.interactTimer = 1.4;
      this.sound.playSave();
    }
    const movedItem = this.draggingItem && this.dragMoved;
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
    } else if (item.type === 'gift_box' || item.type === 'gift_tall') {
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

    const panels = ['baubleStudio', 'stockingStudio', 'stickerStudio', 'sleighStudio'];
    panels.forEach((pid) => {
      document.getElementById(pid).classList.toggle('hidden', pid !== level.studioId);
    });

    if (level.id === 0) this.renderBaubleStudio();
    if (level.id === 1) this.renderStockingStudio();
    if (level.id === 2) this.renderStickerStudio();
    if (level.id === 3) this.renderSleighStudio();
  }

  closeStudioModal() {
    this.setState(GAME_STATES.PLAYING);
  }

  initStudios() {
    this.initBaubleStudio();
    this.initStockingStudio();
    this.initStickerStudio();
    this.initSleighStudio();
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
    const snowMult =
      this.state !== GAME_STATES.MAIN_MENU && this.activeLevelIndex === 3
        ? (this.levels[3].settings.snowSpeed ?? 1)
        : 1;
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

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

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
    if (level.id === 0) {
      renderLevel1Scene(ctx, this.elapsed, level.settings);
    } else if (level.id === 1) {
      renderLevel2Scene(ctx, this.elapsed, level.settings, level.stockings);
    } else if (level.id === 2) {
      renderLevel3Scene(ctx, this.elapsed, level.settings);
    } else {
      renderLevel4Scene(ctx, this.elapsed, level.settings, this.snowParticles);
    }

    // Highlight active drop zones subtly while dragging
    if (this.trayDragPayload || this.draggingItem) {
      this.renderDropZoneHints(ctx, level);
    }

    // Render all placed items
    for (let i = 0; i < level.placedItems.length; i++) {
      const item = level.placedItems[i];
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
    roundRectPath(ctx, 290, 145, 700, 420, 22);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#d4a353';
    ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FOUR-SCENE HOLIDAY DECORATING STUDIO', 640, 212);

    ctx.fillStyle = '#f6efe2';
    ctx.font = '700 48px "Fraunces", Georgia, serif';
    ctx.fillText('Christmas Decorating Fun', 640, 286);

    ctx.fillStyle = '#b6c2ba';
    ctx.font = '400 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Paint custom baubles, embroider family stockings,', 640, 344);
    ctx.fillText('cut symmetrical snowflakes, and light up the winter garden.', 640, 374);
    ctx.restore();

    // Interactive Canvas Buttons
    const startRect = { x: 400, y: 430, w: 230, h: 64 };
    const levelsRect = { x: 650, y: 430, w: 230, h: 64 };

    this.menuHitBoxes = [
      { rect: startRect, action: () => this.setState(GAME_STATES.PLAYING, 0) },
      { rect: levelsRect, action: () => this.setState(GAME_STATES.LEVEL_SELECT) }
    ];

    this.drawCanvasButton(ctx, startRect, 'Start Decorating', true);
    this.drawCanvasButton(ctx, levelsRect, 'Choose Scene', false);
  }

  renderLevelSelect(ctx) {
    const bgGrad = ctx.createRadialGradient(640, 320, 80, 640, 360, 780);
    bgGrad.addColorStop(0, '#1c3a30');
    bgGrad.addColorStop(1, '#081410');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    ctx.fillStyle = '#f6efe2';
    ctx.font = '700 40px "Fraunces", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('Choose a Holiday Scene', 640, 96);

    const cards = [
      {
        idx: 0,
        title: '1. Evergreen Tree',
        desc: 'Custom tree hues, flashing lights, tinsel & painted baubles.',
        accent: '#15803d'
      },
      {
        idx: 1,
        title: '2. Hearth & Mantle',
        desc: 'Garlands, lanterns, candles & personalized family stockings.',
        accent: '#b91c1c'
      },
      {
        idx: 2,
        title: '3. Winter Living Room',
        desc: 'Streamers, balloons, fairy lights & window snowflake stickers.',
        accent: '#0284c7'
      },
      {
        idx: 3,
        title: '4. Illuminated Garden',
        desc: 'House facade, glowing deer, snowmen & custom-painted sleigh.',
        accent: '#d97706'
      }
    ];

    this.levelSelectHitBoxes = [];
    const cardW = 500;
    const cardH = 210;
    const gapX = 40;
    const gapY = 32;
    const startX = (LOGICAL_WIDTH - (cardW * 2 + gapX)) * 0.5;
    const startY = 148;

    cards.forEach((c, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const rect = {
        x: startX + col * (cardW + gapX),
        y: startY + row * (cardH + gapY),
        w: cardW,
        h: cardH
      };
      this.levelSelectHitBoxes.push({ rect, levelIndex: c.idx });

      const hovered = CoordinateMapper.rectContainsPoint(rect, this.hoverPt.x, this.hoverPt.y);

      ctx.save();
      const cGrad = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
      cGrad.addColorStop(0, hovered ? '#214237' : '#162f27');
      cGrad.addColorStop(1, '#0e1f1a');
      ctx.fillStyle = cGrad;
      ctx.strokeStyle = hovered ? '#f5d07a' : 'rgba(212, 163, 83, 0.35)';
      ctx.lineWidth = hovered ? 2.5 : 1.5;
      ctx.shadowColor = 'rgba(0,0,0,0.45)';
      ctx.shadowBlur = 16;
      roundRectPath(ctx, rect.x, rect.y, rect.w, rect.h, 16);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.stroke();

      // Accent emblem
      ctx.fillStyle = c.accent;
      ctx.beginPath();
      ctx.arc(rect.x + 48, rect.y + 52, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 20px "Fraunces", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(c.idx + 1), rect.x + 48, rect.y + 53);

      // Card text
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#f6efe2';
      ctx.font = '700 26px "Fraunces", Georgia, serif';
      ctx.fillText(c.title, rect.x + 86, rect.y + 60);

      ctx.fillStyle = '#b6c2ba';
      ctx.font = '400 17px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(c.desc, rect.x + 30, rect.y + 114, rect.w - 60);

      const placed = this.levels[c.idx].placedItems.length;
      ctx.fillStyle = '#d4a353';
      ctx.font = '600 15px "JetBrains Mono", monospace';
      ctx.fillText(`${placed} decorations placed · Click to enter`, rect.x + 30, rect.y + 174);
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
            streamerSchemeId: lvl.settings.streamerScheme ? lvl.settings.streamerScheme.id : null
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
            return new DragItem({
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

    if (level.id === 0) {
      renderLevel1Scene(snapCtx, this.elapsed, level.settings);
    } else if (level.id === 1) {
      renderLevel2Scene(snapCtx, this.elapsed, level.settings, level.stockings);
    } else if (level.id === 2) {
      renderLevel3Scene(snapCtx, this.elapsed, level.settings);
    } else {
      renderLevel4Scene(snapCtx, this.elapsed, level.settings, this.snowParticles);
    }

    for (let i = 0; i < level.placedItems.length; i++) {
      level.placedItems[i].draw(snapCtx, this.elapsed, false);
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
