/**
 * Reusable geometry, input, brush, drag-item, and procedural Canvas asset components
 * for Yuletide Atelier.
 */

export const LOGICAL_WIDTH = 1280;
export const LOGICAL_HEIGHT = 720;

/**
 * Clear image asset registry.
 * Any entry may be replaced with a loaded HTMLImageElement (e.g. from a high-res PNG)
 * via setCustomAssetImage(key, url) without changing any rendering or game logic.
 */
export const ASSETS = {
  treeImage: null,
  fireplaceBg: null,
  livingRoomBg: null,
  gardenBg: null,
  statueSprite: null,
  deerSprite: null,
  snowmanSprite: null,
  sleighBaseSprite: null,
  workshopBg: null,
  bakeryBg: null,
  stableBg: null,
  townSquareBg: null,
  launchpadBg: null,
  wrappingBg: null,
  dioramaBg: null
};

export function setCustomAssetImage(assetKey, srcUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      ASSETS[assetKey] = img;
      resolve(img);
    };
    img.onerror = (err) => reject(err);
    img.src = srcUrl;
  });
}

export const CoordinateMapper = {
  /**
   * Maps viewport client coordinates to the canvas's internal coordinate system,
   * accounting for CSS object-fit: contain or responsive scaling.
   */
  toLocal(clientX, clientY, canvas) {
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return { x: 0, y: 0 };
    }
    const canvasAspect = canvas.width / canvas.height;
    const rectAspect = rect.width / rect.height;

    let renderW = rect.width;
    let renderH = rect.height;
    let offsetX = 0;
    let offsetY = 0;

    if (rectAspect > canvasAspect) {
      renderW = rect.height * canvasAspect;
      offsetX = (rect.width - renderW) * 0.5;
    } else if (rectAspect < canvasAspect) {
      renderH = rect.width / canvasAspect;
      offsetY = (rect.height - renderH) * 0.5;
    }

    const x = ((clientX - rect.left - offsetX) / renderW) * canvas.width;
    const y = ((clientY - rect.top - offsetY) / renderH) * canvas.height;
    return { x, y };
  },

  clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  },

  distanceBetween(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
  },

  rectContainsPoint(rect, x, y) {
    return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
  },

  pointInPolygon(poly, x, y) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i].x;
      const yi = poly[i].y;
      const xj = poly[j].x;
      const yj = poly[j].y;
      const intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-9) + xi;
      if (intersect) {
        inside = !inside;
      }
    }
    return inside;
  }
};

/**
 * Unified Mouse + Touch interaction controller with touch-synthesis deduplication.
 */
export class UnifiedInputManager {
  constructor(element, callbacks) {
    this.element = element;
    this.callbacks = callbacks || {};
    this.active = false;
    this.lastTouchTime = 0;

    this._onMouseDown = this.handleMouseDown.bind(this);
    this._onMouseMove = this.handleMouseMove.bind(this);
    this._onMouseUp = this.handleMouseUp.bind(this);
    this._onTouchStart = this.handleTouchStart.bind(this);
    this._onTouchMove = this.handleTouchMove.bind(this);
    this._onTouchEnd = this.handleTouchEnd.bind(this);

    this.attach();
  }

  attach() {
    this.element.addEventListener('mousedown', this._onMouseDown);
    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('mouseup', this._onMouseUp);

    this.element.addEventListener('touchstart', this._onTouchStart, { passive: false });
    window.addEventListener('touchmove', this._onTouchMove, { passive: false });
    window.addEventListener('touchend', this._onTouchEnd, { passive: false });
    window.addEventListener('touchcancel', this._onTouchEnd, { passive: false });
  }

  destroy() {
    this.element.removeEventListener('mousedown', this._onMouseDown);
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('mouseup', this._onMouseUp);

    this.element.removeEventListener('touchstart', this._onTouchStart);
    window.removeEventListener('touchmove', this._onTouchMove);
    window.removeEventListener('touchend', this._onTouchEnd);
    window.removeEventListener('touchcancel', this._onTouchEnd);
  }

  getPoint(clientX, clientY) {
    return CoordinateMapper.toLocal(clientX, clientY, this.element);
  }

  handleMouseDown(e) {
    if (Date.now() - this.lastTouchTime < 450) return;
    if (e.button !== 0) return;
    this.active = true;
    const pt = this.getPoint(e.clientX, e.clientY);
    if (this.callbacks.onStart) this.callbacks.onStart(pt, e);
  }

  handleMouseMove(e) {
    const pt = this.getPoint(e.clientX, e.clientY);
    if (this.callbacks.onHover) this.callbacks.onHover(pt, e);
    if (!this.active) return;
    if (this.callbacks.onMove) this.callbacks.onMove(pt, e);
  }

  handleMouseUp(e) {
    if (!this.active) return;
    this.active = false;
    const pt = this.getPoint(e.clientX, e.clientY);
    if (this.callbacks.onEnd) this.callbacks.onEnd(pt, e);
  }

  handleTouchStart(e) {
    this.lastTouchTime = Date.now();
    if (e.touches.length === 0) return;
    e.preventDefault();
    this.active = true;
    const touch = e.touches[0];
    const pt = this.getPoint(touch.clientX, touch.clientY);
    if (this.callbacks.onStart) this.callbacks.onStart(pt, e);
  }

  handleTouchMove(e) {
    if (!this.active || e.touches.length === 0) return;
    e.preventDefault();
    this.lastTouchTime = Date.now();
    const touch = e.touches[0];
    const pt = this.getPoint(touch.clientX, touch.clientY);
    if (this.callbacks.onMove) this.callbacks.onMove(pt, e);
  }

  handleTouchEnd(e) {
    if (!this.active) return;
    this.lastTouchTime = Date.now();
    this.active = false;
    const touch = e.changedTouches && e.changedTouches[0];
    const pt = touch ? this.getPoint(touch.clientX, touch.clientY) : { x: 0, y: 0 };
    if (this.callbacks.onEnd) this.callbacks.onEnd(pt, e);
  }
}

/**
 * Reusable interactive Canvas Brush with path tracking, smooth curves,
 * eraser support, and 6-fold radial symmetry for snowflake geometry.
 */
export class CanvasBrush {
  constructor(options = {}) {
    this.color = options.color || '#ffffff';
    this.size = options.size || 8;
    this.eraser = false;
    this.symmetry = options.symmetry || 1;
    this.paths = [];
    this.currentPath = null;
  }

  beginPath(x, y) {
    this.currentPath = {
      color: this.color,
      size: this.size,
      eraser: this.eraser,
      symmetry: this.symmetry,
      points: [{ x, y }]
    };
    this.paths.push(this.currentPath);
  }

  addPoint(x, y) {
    if (!this.currentPath) return;
    const pts = this.currentPath.points;
    const last = pts[pts.length - 1];
    if (!last || CoordinateMapper.distanceBetween(last.x, last.y, x, y) >= 2.2) {
      pts.push({ x, y });
    }
  }

  endPath() {
    this.currentPath = null;
  }

  clear() {
    this.paths = [];
    this.currentPath = null;
  }

  renderToContext(ctx, width, height) {
    const cx = width * 0.5;
    const cy = height * 0.5;

    for (let i = 0; i < this.paths.length; i++) {
      const path = this.paths[i];
      if (!path.points.length) continue;

      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = path.size;

      if (path.eraser) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.fillStyle = 'rgba(0,0,0,1)';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = path.color;
        ctx.fillStyle = path.color;
        if (path.symmetry > 1) {
          ctx.shadowColor = path.color;
          ctx.shadowBlur = 4;
        }
      }

      const folds = path.symmetry || 1;
      for (let f = 0; f < folds; f++) {
        ctx.save();
        if (folds > 1) {
          ctx.translate(cx, cy);
          ctx.rotate((Math.PI * 2 * f) / folds);
          ctx.translate(-cx, -cy);
        }
        this._strokeSmoothPoints(ctx, path.points, path.size);
        ctx.restore();
      }
      ctx.restore();
    }
  }

  _strokeSmoothPoints(ctx, pts, size) {
    if (pts.length === 1) {
      ctx.beginPath();
      ctx.arc(pts[0].x, pts[0].y, size * 0.5, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length - 1; i++) {
      const midX = (pts[i].x + pts[i + 1].x) * 0.5;
      const midY = (pts[i].y + pts[i + 1].y) * 0.5;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, midX, midY);
    }
    const last = pts[pts.length - 1];
    ctx.lineTo(last.x, last.y);
    ctx.stroke();
  }
}

/**
 * Reusable DragItem class with bounding/hit math, collision threshold checking,
 * transformation, and unified drawing.
 */
export class DragItem {
  constructor(config) {
    this.id = config.id || `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    this.type = config.type;
    this.label = config.label || 'Decoration';
    this.x = config.x || 640;
    this.y = config.y || 360;
    this.width = config.width || 64;
    this.height = config.height || 64;
    this.scale = config.scale || 1;
    this.rotation = config.rotation || 0;
    this.image = config.image || null;
    this.customData = config.customData || {};
    this.phase = config.phase !== undefined ? config.phase : Math.random() * Math.PI * 2;
    this.interactTimer = 0;
  }

  getBounds() {
    const w = this.width * this.scale;
    const h = this.height * this.scale;
    return {
      x: this.x - w * 0.5,
      y: this.y - h * 0.5,
      w,
      h
    };
  }

  containsPoint(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    const cos = Math.cos(-this.rotation);
    const sin = Math.sin(-this.rotation);
    const localX = dx * cos - dy * sin;
    const localY = dx * sin + dy * cos;

    const pad = 10;
    const hw = (this.width * this.scale) * 0.5 + pad;
    const hh = (this.height * this.scale) * 0.5 + pad;
    return Math.abs(localX) <= hw && Math.abs(localY) <= hh;
  }

  /**
   * Checks whether this item falls within a target DropZone's polygon or rectangle
   * within an optional distance threshold.
   */
  collidesWithZone(zone, threshold = 24) {
    if (!zone) return true;
    if (zone.polygon) {
      if (CoordinateMapper.pointInPolygon(zone.polygon, this.x, this.y)) {
        return true;
      }
      for (let i = 0; i < zone.polygon.length; i++) {
        const a = zone.polygon[i];
        const b = zone.polygon[(i + 1) % zone.polygon.length];
        if (pointToSegmentDistance(this.x, this.y, a.x, a.y, b.x, b.y) <= threshold) {
          return true;
        }
      }
      return false;
    }
    if (zone.rect) {
      const expanded = {
        x: zone.rect.x - threshold,
        y: zone.rect.y - threshold,
        w: zone.rect.w + threshold * 2,
        h: zone.rect.h + threshold * 2
      };
      return CoordinateMapper.rectContainsPoint(expanded, this.x, this.y);
    }
    return true;
  }

  draw(ctx, elapsed, isSelected = false) {
    ctx.save();
    let bobY = 0;
    if (this.type === 'balloon') {
      bobY = Math.sin(elapsed * 2.1 + this.phase) * 5;
    } else if (this.type === 'snowman' && this.interactTimer > 0) {
      bobY = -Math.abs(Math.sin(this.interactTimer * 10)) * 10;
    }

    ctx.translate(this.x, this.y + bobY);
    ctx.rotate(this.rotation);
    ctx.scale(this.scale, this.scale);

    if (this.image) {
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;
      ctx.drawImage(this.image, -this.width * 0.5, -this.height * 0.5, this.width, this.height);
    } else {
      drawProceduralItem(ctx, this.type, this.width, this.height, elapsed, this);
    }

    if (isSelected) {
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.strokeStyle = '#f5d07a';
      ctx.lineWidth = 2 / this.scale;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(
        -this.width * 0.5 - 6,
        -this.height * 0.5 - 6,
        this.width + 12,
        this.height + 12
      );
      ctx.setLineDash([]);
    }

    ctx.restore();
  }
}

function pointToSegmentDistance(px, py, x1, y1, x2, y2) {
  const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (l2 === 0) return CoordinateMapper.distanceBetween(px, py, x1, y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return CoordinateMapper.distanceBetween(px, py, x1 + t * (x2 - x1), y1 + t * (y2 - y1));
}

/* ============================================================================
   SILHOUETTE TRACERS (for Baubles, Stockings, Sleighs)
   ============================================================================ */

export function traceBaubleShape(ctx, shape, cx, cy, r) {
  ctx.beginPath();
  if (shape === 'star') {
    const spikes = 5;
    const outerR = r * 1.05;
    const innerR = r * 0.48;
    for (let i = 0; i < spikes * 2; i++) {
      const rad = i % 2 === 0 ? outerR : innerR;
      const angle = (i * Math.PI) / spikes - Math.PI / 2;
      const x = cx + Math.cos(angle) * rad;
      const y = cy + Math.sin(angle) * rad;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  } else if (shape === 'teardrop') {
    ctx.moveTo(cx, cy - r * 1.08);
    ctx.bezierCurveTo(
      cx + r * 0.45,
      cy - r * 0.55,
      cx + r * 0.92,
      cy + r * 0.15,
      cx + r * 0.68,
      cy + r * 0.68
    );
    ctx.bezierCurveTo(
      cx + r * 0.42,
      cy + r * 1.08,
      cx - r * 0.42,
      cy + r * 1.08,
      cx - r * 0.68,
      cy + r * 0.68
    );
    ctx.bezierCurveTo(
      cx - r * 0.92,
      cy + r * 0.15,
      cx - r * 0.45,
      cy - r * 0.55,
      cx,
      cy - r * 1.08
    );
    ctx.closePath();
  } else {
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
  }
}

export function traceSleighBodyPath(ctx, cx, cy, scale = 1) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.moveTo(-135, -30);
  ctx.bezierCurveTo(-115, 25, -80, 52, 0, 52);
  ctx.lineTo(75, 52);
  ctx.bezierCurveTo(118, 52, 138, 12, 145, -18);
  ctx.bezierCurveTo(122, -26, 98, -18, 86, 4);
  ctx.lineTo(-10, 4);
  ctx.bezierCurveTo(-48, 4, -78, -56, -118, -68);
  ctx.bezierCurveTo(-142, -74, -148, -46, -135, -30);
  ctx.closePath();
  ctx.restore();
}

export function drawStockingComposite(ctx, opts) {
  const {
    cx = 160,
    cy = 185,
    scale = 1,
    bodyColor = '#b91c1c',
    cuffColor = '#f5efe2',
    name = 'Clara',
    accentCanvas = null,
    sway = 0
  } = opts;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(sway);
  ctx.scale(scale, scale);

  // Hanging loop
  ctx.strokeStyle = '#d4a353';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(-28, -124, 11, Math.PI * 0.4, Math.PI * 1.9);
  ctx.stroke();

  // Stocking body path
  ctx.beginPath();
  ctx.moveTo(-36, -92);
  ctx.lineTo(36, -92);
  ctx.lineTo(36, 22);
  ctx.bezierCurveTo(36, 56, 78, 58, 92, 84);
  ctx.bezierCurveTo(104, 108, 80, 132, 42, 130);
  ctx.lineTo(-18, 124);
  ctx.bezierCurveTo(-48, 120, -54, 88, -44, 52);
  ctx.lineTo(-36, -92);
  ctx.closePath();

  const bodyGrad = ctx.createLinearGradient(-45, -80, 75, 130);
  bodyGrad.addColorStop(0, shadeColor(bodyColor, 18));
  bodyGrad.addColorStop(0.55, bodyColor);
  bodyGrad.addColorStop(1, shadeColor(bodyColor, -34));
  ctx.fillStyle = bodyGrad;
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 6;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Clip inside body for heel/toe patches & custom drawing accents
  ctx.save();
  ctx.clip();

  // Toe cap & heel accent
  const patchGrad = ctx.createRadialGradient(72, 100, 6, 72, 100, 46);
  patchGrad.addColorStop(0, shadeColor(cuffColor, 10));
  patchGrad.addColorStop(1, shadeColor(cuffColor, -18));
  ctx.fillStyle = patchGrad;
  ctx.beginPath();
  ctx.arc(84, 102, 42, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(-40, 92, 30, 0, Math.PI * 2);
  ctx.fill();

  if (accentCanvas) {
    ctx.drawImage(accentCanvas, -160, -185, 320, 360);
  }
  ctx.restore();

  // Subtle knit stitch border
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Plush cuff
  const cuffGrad = ctx.createLinearGradient(-48, -118, 48, -68);
  cuffGrad.addColorStop(0, shadeColor(cuffColor, 14));
  cuffGrad.addColorStop(0.6, cuffColor);
  cuffGrad.addColorStop(1, shadeColor(cuffColor, -22));
  ctx.fillStyle = cuffGrad;
  roundRectPath(ctx, -46, -116, 92, 42, 12);
  ctx.fill();

  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Embroidered name
  const displayName = (name || '').trim() || 'Guest';
  ctx.fillStyle = getContrastInk(cuffColor);
  ctx.font = '700 18px "Fraunces", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(displayName, 0, -94, 78);

  ctx.restore();
}

/* ============================================================================
   LEVEL BACKGROUND RENDERERS (WITH GRADIENTS & DYNAMIC LIGHTING)
   ============================================================================ */

export function renderLevel1Scene(ctx, elapsed, settings) {
  const W = LOGICAL_WIDTH;
  const H = LOGICAL_HEIGHT;

  // Parlor walls with warm ambient gradient
  const wallGrad = ctx.createRadialGradient(W * 0.5, H * 0.38, 60, W * 0.5, H * 0.45, 760);
  wallGrad.addColorStop(0, '#2a4136');
  wallGrad.addColorStop(0.55, '#192922');
  wallGrad.addColorStop(1, '#0d1713');
  ctx.fillStyle = wallGrad;
  ctx.fillRect(0, 0, W, H);

  // Subtle vertical wainscoting panels
  ctx.strokeStyle = 'rgba(212, 163, 83, 0.08)';
  ctx.lineWidth = 2;
  for (let x = 80; x < W; x += 140) {
    ctx.strokeRect(x, 40, 110, 480);
  }

  // Hardwood floor with warm sheen
  const floorGrad = ctx.createLinearGradient(0, 560, 0, H);
  floorGrad.addColorStop(0, '#3a2216');
  floorGrad.addColorStop(0.35, '#4c2d1d');
  floorGrad.addColorStop(1, '#26140c');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, 560, W, H - 560);

  // Floor plank seams
  ctx.strokeStyle = 'rgba(15, 7, 4, 0.45)';
  ctx.lineWidth = 1.5;
  for (let y = 588; y < H; y += 28) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Braided circular tree skirt
  const skirtGrad = ctx.createRadialGradient(W * 0.5, 616, 20, W * 0.5, 616, 210);
  skirtGrad.addColorStop(0, '#991b1b');
  skirtGrad.addColorStop(0.65, '#7f1d1d');
  skirtGrad.addColorStop(0.9, '#d4a353');
  skirtGrad.addColorStop(1, '#581212');
  ctx.fillStyle = skirtGrad;
  ctx.beginPath();
  ctx.ellipse(W * 0.5, 618, 210, 44, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tree trunk
  const trunkGrad = ctx.createLinearGradient(610, 520, 670, 520);
  trunkGrad.addColorStop(0, '#2e1a10');
  trunkGrad.addColorStop(0.45, '#5b3622');
  trunkGrad.addColorStop(1, '#24120a');
  ctx.fillStyle = trunkGrad;
  ctx.fillRect(614, 520, 52, 92);

  // Draw customizable Christmas Tree (or external ASSETS.treeImage if replaced)
  if (ASSETS.treeImage instanceof HTMLImageElement) {
    ctx.drawImage(ASSETS.treeImage, 370, 60, 540, 500);
  } else {
    drawProceduralTree(ctx, settings.treePalette);
  }

  // Optional procedural tinsel garlands draped across boughs
  if (settings.showTinsel) {
    drawTreeTinsel(ctx, elapsed, settings.tinselPalette);
  }

  // Optional multi-colored or custom-colored flashing string lights with shadowBlur glow
  if (settings.showLights) {
    drawTreeLights(ctx, elapsed, settings.lightColors);
  }
}

function drawProceduralTree(ctx, palette) {
  const p = palette || { light: '#2f7a53', mid: '#1b5336', dark: '#0c2c1b' };
  const tiers = [
    { topY: 75, botY: 200, halfW: 112 },
    { topY: 155, botY: 300, halfW: 162 },
    { topY: 240, botY: 405, halfW: 214 },
    { topY: 335, botY: 515, halfW: 262 },
    { topY: 425, botY: 572, halfW: 298 }
  ];
  const cx = 640;

  for (let t = tiers.length - 1; t >= 0; t--) {
    const tier = tiers[t];
    const grad = ctx.createRadialGradient(
      cx - tier.halfW * 0.2,
      tier.topY + 40,
      14,
      cx,
      (tier.topY + tier.botY) * 0.5,
      tier.halfW * 1.1
    );
    grad.addColorStop(0, p.light);
    grad.addColorStop(0.55, p.mid);
    grad.addColorStop(1, p.dark);

    ctx.fillStyle = grad;
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 8;

    ctx.beginPath();
    ctx.moveTo(cx, tier.topY);
    ctx.lineTo(cx + tier.halfW, tier.botY - 12);
    const scallops = 7;
    for (let s = scallops; s >= 0; s--) {
      const sx = cx - tier.halfW + (s / scallops) * (tier.halfW * 2);
      const dip = s % 2 === 0 ? 0 : 18;
      ctx.lineTo(sx, tier.botY + dip);
    }
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }
}

function drawTreeTinsel(ctx, elapsed, tinselPalette) {
  const pal = tinselPalette || {
    edge: '#c89b3c',
    center: '#fff3c4',
    glow: 'rgba(255, 232, 160, 0.5)'
  };
  const bands = [
    { y1: 180, x1: 565, x2: 715, sag: 22 },
    { y1: 270, x1: 505, x2: 775, sag: 28 },
    { y1: 368, x1: 452, x2: 828, sag: 34 },
    { y1: 470, x1: 405, x2: 875, sag: 40 }
  ];

  for (let i = 0; i < bands.length; i++) {
    const b = bands[i];
    ctx.save();
    const grad = ctx.createLinearGradient(b.x1, b.y1, b.x2, b.y1);
    grad.addColorStop(0, pal.edge);
    grad.addColorStop(0.5, pal.center);
    grad.addColorStop(1, pal.edge);

    ctx.strokeStyle = grad;
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.shadowColor = pal.glow;
    ctx.shadowBlur = 8;

    ctx.beginPath();
    ctx.moveTo(b.x1, b.y1);
    ctx.quadraticCurveTo(640, b.y1 + b.sag, b.x2, b.y1 + 6);
    ctx.stroke();

    // Shimmer needles along tinsel
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.72)';
    ctx.lineWidth = 1.5;
    const steps = 22;
    for (let s = 1; s < steps; s++) {
      const t = s / steps;
      const px = (1 - t) * (1 - t) * b.x1 + 2 * (1 - t) * t * 640 + t * t * b.x2;
      const py =
        (1 - t) * (1 - t) * b.y1 + 2 * (1 - t) * t * (b.y1 + b.sag) + t * t * (b.y1 + 6);
      const twinkle = 4 + Math.sin(elapsed * 4 + s + i) * 2.5;
      ctx.beginPath();
      ctx.moveTo(px - twinkle, py - twinkle * 0.6);
      ctx.lineTo(px + twinkle, py + twinkle * 0.6);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawTreeLights(ctx, elapsed, lightColors) {
  const strands = [
    { x1: 580, y1: 150, x2: 702, y2: 175, sag: 20, count: 7 },
    { x1: 525, y1: 235, x2: 760, y2: 262, sag: 26, count: 10 },
    { x1: 470, y1: 332, x2: 814, y2: 362, sag: 32, count: 13 },
    { x1: 420, y1: 432, x2: 862, y2: 465, sag: 36, count: 15 },
    { x1: 380, y1: 520, x2: 900, y2: 542, sag: 30, count: 16 }
  ];
  const colors =
    Array.isArray(lightColors) && lightColors.length > 0
      ? lightColors
      : ['#ff4d4d', '#ffd166', '#38bdf8', '#4ade80', '#f472b6'];

  for (let s = 0; s < strands.length; s++) {
    const st = strands[s];
    ctx.save();
    ctx.strokeStyle = 'rgba(18, 40, 26, 0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(st.x1, st.y1);
    ctx.quadraticCurveTo(640, st.y1 + st.sag, st.x2, st.y2);
    ctx.stroke();

    for (let i = 0; i < st.count; i++) {
      const t = i / (st.count - 1);
      const bx = (1 - t) * (1 - t) * st.x1 + 2 * (1 - t) * t * 640 + t * t * st.x2;
      const by =
        (1 - t) * (1 - t) * st.y1 + 2 * (1 - t) * t * (st.y1 + st.sag) + t * t * st.y2;
      const color = colors[(i + s * 2) % colors.length];
      const pulse = 0.55 + 0.45 * Math.sin(elapsed * 3.8 + i * 0.9 + s * 1.4);

      ctx.shadowColor = color;
      ctx.shadowBlur = 12 * pulse + 4;
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.45 + 0.55 * pulse;
      ctx.beginPath();
      ctx.arc(bx, by + 3, 5.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.75 * pulse;
      ctx.beginPath();
      ctx.arc(bx - 1.2, by + 1.5, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawGiftBox(ctx, x, y, w, h, boxColor, ribbonColor) {
  ctx.save();
  const grad = ctx.createLinearGradient(x, y, x + w, y + h);
  grad.addColorStop(0, shadeColor(boxColor, 18));
  grad.addColorStop(1, shadeColor(boxColor, -28));
  ctx.fillStyle = grad;
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 8;
  roundRectPath(ctx, x, y, w, h, 4);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = ribbonColor;
  ctx.fillRect(x + w * 0.42, y, w * 0.16, h);
  ctx.fillRect(x, y + h * 0.36, w, h * 0.16);
  ctx.restore();
}

export function renderLevel2Scene(ctx, elapsed, settings, stockings) {
  const W = LOGICAL_WIDTH;
  const H = LOGICAL_HEIGHT;

  if (ASSETS.fireplaceBg instanceof HTMLImageElement) {
    ctx.drawImage(ASSETS.fireplaceBg, 0, 0, W, H);
  } else {
    // Cozy wallpapered room backdrop
    const wp = settings.wallpaperPalette || {
      top: '#3a2218',
      mid: '#251713',
      bot: '#120b09'
    };
    const wallGrad = ctx.createRadialGradient(640, 440, 80, 640, 380, 780);
    wallGrad.addColorStop(0, wp.top);
    wallGrad.addColorStop(0.55, wp.mid);
    wallGrad.addColorStop(1, wp.bot);
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, W, H);

    // Subtle striped damask accent
    ctx.fillStyle = 'rgba(212, 163, 83, 0.06)';
    for (let x = 0; x < W; x += 64) {
      ctx.fillRect(x, 0, 28, 560);
    }

    // Hearth floor & rug
    const floorGrad = ctx.createLinearGradient(0, 560, 0, H);
    floorGrad.addColorStop(0, '#331d14');
    floorGrad.addColorStop(1, '#180d08');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, 560, W, H - 560);

    const rugGrad = ctx.createRadialGradient(640, 645, 30, 640, 645, 360);
    rugGrad.addColorStop(0, '#7f1d1d');
    rugGrad.addColorStop(0.85, '#4c1010');
    rugGrad.addColorStop(1, '#2b0909');
    ctx.fillStyle = rugGrad;
    ctx.beginPath();
    ctx.ellipse(640, 648, 360, 56, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stone & brick chimney breast
    const chimneyGrad = ctx.createLinearGradient(290, 0, 990, 0);
    chimneyGrad.addColorStop(0, '#3a211b');
    chimneyGrad.addColorStop(0.5, '#59332a');
    chimneyGrad.addColorStop(1, '#321b16');
    ctx.fillStyle = chimneyGrad;
    ctx.fillRect(300, 0, 680, 570);

    // Individual bricks with gradients & mortar
    drawBrickPattern(ctx, 304, 8, 672, 558);

    // Framed winter landscape above mantle
    drawMantleArtwork(ctx, 515, 42, 250, 175);

    // Oak mantlepiece shelf
    const mantleGrad = ctx.createLinearGradient(250, 254, 250, 300);
    mantleGrad.addColorStop(0, '#7d4d30');
    mantleGrad.addColorStop(0.45, '#5c3620');
    mantleGrad.addColorStop(1, '#311a0e');
    ctx.fillStyle = mantleGrad;
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 8;
    roundRectPath(ctx, 255, 255, 770, 40, 6);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Mantel trim lip
    ctx.fillStyle = '#925b39';
    roundRectPath(ctx, 246, 250, 788, 12, 4);
    ctx.fill();

    // Firebox opening
    const boxGrad = ctx.createLinearGradient(440, 345, 440, 565);
    boxGrad.addColorStop(0, '#0d0706');
    boxGrad.addColorStop(1, '#26120c');
    ctx.fillStyle = boxGrad;
    roundRectPath(ctx, 435, 345, 410, 225, 18);
    ctx.fill();

    // Stone hearth base
    const slabGrad = ctx.createLinearGradient(340, 558, 940, 590);
    slabGrad.addColorStop(0, '#5a534c');
    slabGrad.addColorStop(0.5, '#7c736b');
    slabGrad.addColorStop(1, '#47413c');
    ctx.fillStyle = slabGrad;
    roundRectPath(ctx, 345, 558, 590, 28, 4);
    ctx.fill();
  }

  // Animated roaring hearth fire
  drawHearthFire(ctx, 640, 540, elapsed, settings.fireBoost ? 1.25 : 1);

  // Brass stocking hooks & sequential family stockings along the mantle line
  for (let i = 0; i < stockings.length; i++) {
    const spacing = Math.min(125, 620 / Math.max(stockings.length, 1));
    const finalX =
      stockings.length === 1 ? 640 : 640 + (i - (stockings.length - 1) * 0.5) * spacing;

    // Brass hook on mantle edge
    ctx.fillStyle = '#e2b462';
    ctx.beginPath();
    ctx.arc(finalX, 293, 5, 0, Math.PI * 2);
    ctx.fill();

    const sway = Math.sin(elapsed * 1.4 + i * 1.1) * 0.035;
    drawStockingComposite(ctx, {
      cx: finalX,
      cy: 365,
      scale: 0.56,
      bodyColor: stockings[i].bodyColor,
      cuffColor: stockings[i].cuffColor,
      name: stockings[i].name,
      accentCanvas: stockings[i].accentCanvas,
      sway
    });
  }
}

function drawBrickPattern(ctx, rx, ry, rw, rh) {
  const bw = 56;
  const bh = 26;
  let row = 0;
  for (let y = ry; y < ry + rh; y += bh) {
    const offset = row % 2 === 0 ? 0 : bw * 0.5;
    for (let x = rx - offset; x < rx + rw; x += bw) {
      const bx = Math.max(rx, x + 2);
      const bxEnd = Math.min(rx + rw, x + bw - 2);
      const w = bxEnd - bx;
      if (w <= 4) continue;
      const hueShift = ((row * 7 + Math.floor(x / bw) * 13) % 18) - 9;
      const bGrad = ctx.createLinearGradient(bx, y, bx, y + bh - 3);
      bGrad.addColorStop(0, shadeColor('#753d30', hueShift + 10));
      bGrad.addColorStop(1, shadeColor('#542920', hueShift - 8));
      ctx.fillStyle = bGrad;
      roundRectPath(ctx, bx, y + 2, w, bh - 4, 2);
      ctx.fill();
    }
    row++;
  }
}

function drawMantleArtwork(ctx, x, y, w, h) {
  ctx.save();
  const frameGrad = ctx.createLinearGradient(x, y, x + w, y + h);
  frameGrad.addColorStop(0, '#d4a353');
  frameGrad.addColorStop(0.5, '#9d722c');
  frameGrad.addColorStop(1, '#e8c179');
  ctx.fillStyle = frameGrad;
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 12;
  roundRectPath(ctx, x - 10, y - 10, w + 20, h + 20, 6);
  ctx.fill();
  ctx.shadowBlur = 0;

  const skyGrad = ctx.createLinearGradient(x, y, x, y + h);
  skyGrad.addColorStop(0, '#10253f');
  skyGrad.addColorStop(1, '#315475');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(x, y, w, h);

  // Moon & snowy hills inside frame
  ctx.fillStyle = '#fef3c7';
  ctx.beginPath();
  ctx.arc(x + w * 0.78, y + h * 0.28, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#d7e3ee';
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + h * 0.65);
  ctx.quadraticCurveTo(x + w * 0.35, y + h * 0.5, x + w * 0.7, y + h * 0.7);
  ctx.lineTo(x + w, y + h * 0.6);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawHearthFire(ctx, cx, baseY, elapsed, intensity = 1) {
  ctx.save();
  // Warm ambient hearth radial glow
  const flicker = 0.9 + Math.sin(elapsed * 9.5) * 0.08 + Math.cos(elapsed * 14.2) * 0.04;
  const ambient = ctx.createRadialGradient(cx, baseY - 35, 10, cx, baseY - 25, 250 * intensity * flicker);
  ambient.addColorStop(0, 'rgba(255, 165, 55, 0.45)');
  ambient.addColorStop(0.5, 'rgba(234, 88, 12, 0.16)');
  ambient.addColorStop(1, 'rgba(234, 88, 12, 0)');
  ctx.fillStyle = ambient;
  ctx.beginPath();
  ctx.arc(cx, baseY - 25, 260 * intensity, 0, Math.PI * 2);
  ctx.fill();

  // Charred logs
  ctx.fillStyle = '#2d160c';
  roundRectPath(ctx, cx - 88, baseY - 12, 176, 22, 10);
  ctx.fill();
  ctx.fillStyle = '#432112';
  roundRectPath(ctx, cx - 72, baseY - 26, 144, 18, 8);
  ctx.fill();

  // Multi-layered flickering flames with shadowBlur
  const tongues = [
    { dx: -42, h: 74, w: 32, phase: 0 },
    { dx: 0, h: 108, w: 46, phase: 1.5 },
    { dx: 44, h: 78, w: 34, phase: 3.1 }
  ];
  for (let i = 0; i < tongues.length; i++) {
    const f = tongues[i];
    const sway = Math.sin(elapsed * 7.5 + f.phase) * 9;
    const fh = f.h * intensity * (0.9 + Math.sin(elapsed * 11 + f.phase) * 0.12);

    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 22;
    const fGrad = ctx.createLinearGradient(cx + f.dx, baseY - 12, cx + f.dx + sway, baseY - 12 - fh);
    fGrad.addColorStop(0, '#ea580c');
    fGrad.addColorStop(0.55, '#fbbf24');
    fGrad.addColorStop(1, 'rgba(254, 240, 138, 0.1)');
    ctx.fillStyle = fGrad;

    ctx.beginPath();
    ctx.moveTo(cx + f.dx - f.w * 0.5, baseY - 12);
    ctx.quadraticCurveTo(cx + f.dx - f.w * 0.4, baseY - 12 - fh * 0.55, cx + f.dx + sway, baseY - 12 - fh);
    ctx.quadraticCurveTo(cx + f.dx + f.w * 0.4, baseY - 12 - fh * 0.55, cx + f.dx + f.w * 0.5, baseY - 12);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

export function renderLevel3Scene(ctx, elapsed, settings) {
  const W = LOGICAL_WIDTH;
  const H = LOGICAL_HEIGHT;

  if (ASSETS.livingRoomBg instanceof HTMLImageElement) {
    ctx.drawImage(ASSETS.livingRoomBg, 0, 0, W, H);
    return;
  }

  // Living room walls with customizable wallpaper gradient
  const wp = settings.wallpaperPalette || {
    top: '#182b33',
    mid: '#213a43',
    bot: '#142329'
  };
  const wallGrad = ctx.createLinearGradient(0, 0, 0, 560);
  wallGrad.addColorStop(0, wp.mid);
  wallGrad.addColorStop(0.45, wp.top);
  wallGrad.addColorStop(1, wp.bot);
  ctx.fillStyle = wallGrad;
  ctx.fillRect(0, 0, W, H);

  // Subtle wallpaper stripe texture
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  for (let x = 24; x < W; x += 72) {
    ctx.fillRect(x, 32, 26, 415);
  }

  // Crown molding at ceiling
  const crownGrad = ctx.createLinearGradient(0, 0, 0, 36);
  crownGrad.addColorStop(0, '#f3ebd9');
  crownGrad.addColorStop(1, '#bfb39a');
  ctx.fillStyle = crownGrad;
  ctx.fillRect(0, 0, W, 32);

  // Lower wainscoting
  const wainsGrad = ctx.createLinearGradient(0, 445, 0, 565);
  wainsGrad.addColorStop(0, '#ded3bc');
  wainsGrad.addColorStop(1, '#b6a78b');
  ctx.fillStyle = wainsGrad;
  ctx.fillRect(0, 445, W, 120);

  // Hardwood floor
  const floorGrad = ctx.createLinearGradient(0, 565, 0, H);
  floorGrad.addColorStop(0, '#4d3020');
  floorGrad.addColorStop(1, '#26140b');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, 565, W, H - 565);

  // Large structural bay window in center (x: 340..940, y: 80..450)
  const winX = 340;
  const winY = 80;
  const winW = 600;
  const winH = 370;

  // Starry snowy night visible outside window
  const nightSky = ctx.createLinearGradient(winX, winY, winX, winY + winH);
  nightSky.addColorStop(0, '#071426');
  nightSky.addColorStop(0.7, '#112a4a');
  nightSky.addColorStop(1, '#1d4169');
  ctx.fillStyle = nightSky;
  ctx.fillRect(winX, winY, winW, winH);

  // Crescent moon & stars outside window
  ctx.fillStyle = '#fef3c7';
  ctx.shadowColor = '#fde68a';
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.arc(winX + 490, winY + 72, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  for (let i = 0; i < 24; i++) {
    const sx = winX + 25 + ((i * 83) % (winW - 50));
    const sy = winY + 20 + ((i * 47) % (winH - 130));
    const tw = 0.4 + 0.6 * Math.abs(Math.sin(elapsed * 2.2 + i));
    ctx.fillStyle = `rgba(255,255,255,${tw})`;
    ctx.beginPath();
    ctx.arc(sx, sy, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Snowy hills outside window
  const hillGrad = ctx.createLinearGradient(winX, winY + 260, winX, winY + winH);
  hillGrad.addColorStop(0, '#dce8f5');
  hillGrad.addColorStop(1, '#98b4cf');
  ctx.fillStyle = hillGrad;
  ctx.beginPath();
  ctx.moveTo(winX, winY + winH);
  ctx.lineTo(winX, winY + 285);
  ctx.quadraticCurveTo(winX + 210, winY + 240, winX + 410, winY + 295);
  ctx.quadraticCurveTo(winX + 515, winY + 265, winX + winW, winY + 290);
  ctx.lineTo(winX + winW, winY + winH);
  ctx.closePath();
  ctx.fill();

  // Optional window frost vignette
  if (settings.windowFrost) {
    const frostGrad = ctx.createRadialGradient(
      winX + winW * 0.5,
      winY + winH * 0.5,
      winW * 0.2,
      winX + winW * 0.5,
      winY + winH * 0.5,
      winW * 0.62
    );
    frostGrad.addColorStop(0, 'rgba(224, 242, 254, 0)');
    frostGrad.addColorStop(1, 'rgba(224, 242, 254, 0.28)');
    ctx.fillStyle = frostGrad;
    ctx.fillRect(winX, winY, winW, winH);
  }

  // Window mullions & outer timber frame (3 columns x 2 rows = 6 structural window panes!)
  ctx.strokeStyle = '#efe5d0';
  ctx.lineWidth = 14;
  ctx.strokeRect(winX, winY, winW, winH);

  ctx.lineWidth = 8;
  // 2 vertical mullions
  for (let c = 1; c <= 2; c++) {
    const mx = winX + (winW / 3) * c;
    ctx.beginPath();
    ctx.moveTo(mx, winY);
    ctx.lineTo(mx, winY + winH);
    ctx.stroke();
  }
  // 1 horizontal transom
  ctx.beginPath();
  ctx.moveTo(winX, winY + winH * 0.5);
  ctx.lineTo(winX + winW, winY + winH * 0.5);
  ctx.stroke();

  // Window sill
  const sillGrad = ctx.createLinearGradient(winX - 24, winY + winH, winX - 24, winY + winH + 20);
  sillGrad.addColorStop(0, '#f7efe0');
  sillGrad.addColorStop(1, '#c7b89c');
  ctx.fillStyle = sillGrad;
  roundRectPath(ctx, winX - 22, winY + winH - 2, winW + 44, 20, 4);
  ctx.fill();

  // Velvet curtains flanking the window
  drawCurtain(ctx, 240, 56, 110, 508, true);
  drawCurtain(ctx, 930, 56, 110, 508, false);

  // Cozy armchair on left & side table on right
  drawArmchair(ctx, 130, 440);
  drawRug(ctx, 640, 648, 370, 54);
}

function drawCurtain(ctx, x, y, w, h, isLeft) {
  ctx.save();
  const grad = ctx.createLinearGradient(x, y, x + w, y);
  grad.addColorStop(0, '#7f1d1d');
  grad.addColorStop(0.45, '#b91c1c');
  grad.addColorStop(0.75, '#7f1d1d');
  grad.addColorStop(1, '#991b1b');
  ctx.fillStyle = grad;
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w + (isLeft ? -14 : 10), y + h);
  ctx.lineTo(x + (isLeft ? -10 : 14), y + h);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawArmchair(ctx, x, y) {
  ctx.save();
  const chairGrad = ctx.createLinearGradient(x, y, x + 150, y + 160);
  chairGrad.addColorStop(0, '#2c6b4f');
  chairGrad.addColorStop(1, '#143828');
  ctx.fillStyle = chairGrad;
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 14;
  roundRectPath(ctx, x + 18, y, 116, 100, 20);
  ctx.fill();
  roundRectPath(ctx, x, y + 66, 152, 66, 16);
  ctx.fill();
  ctx.restore();
}

function drawRug(ctx, cx, cy, rx, ry) {
  ctx.save();
  const grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, rx);
  grad.addColorStop(0, '#a38963');
  grad.addColorStop(0.7, '#755e3f');
  grad.addColorStop(1, '#4f3d26');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function renderLevel4Scene(ctx, elapsed, settings, snowParticles) {
  const W = LOGICAL_WIDTH;
  const H = LOGICAL_HEIGHT;

  if (ASSETS.gardenBg instanceof HTMLImageElement) {
    ctx.drawImage(ASSETS.gardenBg, 0, 0, W, H);
  } else {
    // Twilight winter sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 445);
    skyGrad.addColorStop(0, '#061124');
    skyGrad.addColorStop(0.55, '#132a4f');
    skyGrad.addColorStop(1, '#26466d');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, 450);

    // Moon & twinkling stars
    ctx.save();
    ctx.fillStyle = '#fef9c3';
    ctx.shadowColor = '#fde68a';
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(165, 105, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    for (let i = 0; i < 42; i++) {
      const sx = (i * 119 + 40) % W;
      const sy = (i * 53 + 18) % 280;
      const alpha = 0.35 + 0.65 * Math.abs(Math.sin(elapsed * 2 + i));
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.beginPath();
      ctx.arc(sx, sy, (i % 2) + 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Distant pine treeline silhouette
    ctx.fillStyle = '#0d2229';
    for (let x = 0; x < W; x += 65) {
      const th = 75 + ((x * 13) % 45);
      ctx.beginPath();
      ctx.moveTo(x, 445);
      ctx.lineTo(x + 34, 445 - th);
      ctx.lineTo(x + 68, 445);
      ctx.closePath();
      ctx.fill();
    }

    // Snowy rolling front lawn
    const lawnGrad = ctx.createLinearGradient(0, 430, 0, H);
    lawnGrad.addColorStop(0, '#dceaf7');
    lawnGrad.addColorStop(0.45, '#b8d0e8');
    lawnGrad.addColorStop(1, '#82a2c4');
    ctx.fillStyle = lawnGrad;
    ctx.fillRect(0, 430, W, H - 430);

    // Winding cobblestone pathway from porch to bottom
    const pathGrad = ctx.createLinearGradient(580, 460, 640, H);
    pathGrad.addColorStop(0, '#64748b');
    pathGrad.addColorStop(1, '#334155');
    ctx.fillStyle = pathGrad;
    ctx.beginPath();
    ctx.moveTo(605, 456);
    ctx.lineTo(675, 456);
    ctx.quadraticCurveTo(715, 580, 760, H);
    ctx.lineTo(520, H);
    ctx.quadraticCurveTo(565, 580, 605, 456);
    ctx.closePath();
    ctx.fill();

    // Editable House Facade
    drawHouseFacade(ctx, elapsed, settings);
  }

  // Roofline string lights (toggleable + glowing + customizable colors)
  if (settings.roofLights) {
    drawRooflineLights(ctx, elapsed, settings.lightColors);
  }

  // Falling winter snow overlay (toggleable)
  if (snowParticles && settings.showSnow !== false) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    for (let i = 0; i < snowParticles.length; i++) {
      const p = snowParticles[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawHouseFacade(ctx, elapsed, settings) {
  const siding = settings.houseColor || '#8c2d2d';
  const trim = '#f5efe2';

  // Main house body
  const bodyGrad = ctx.createLinearGradient(390, 220, 890, 456);
  bodyGrad.addColorStop(0, shadeColor(siding, 12));
  bodyGrad.addColorStop(0.6, siding);
  bodyGrad.addColorStop(1, shadeColor(siding, -26));
  ctx.fillStyle = bodyGrad;
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 18;
  ctx.fillRect(405, 235, 470, 222);
  ctx.shadowBlur = 0;

  // Horizontal clapboard lines
  ctx.strokeStyle = 'rgba(0,0,0,0.16)';
  ctx.lineWidth = 1.5;
  for (let y = 252; y < 455; y += 16) {
    ctx.beginPath();
    ctx.moveTo(405, y);
    ctx.lineTo(875, y);
    ctx.stroke();
  }

  // Gable & main roof with snow blanket
  const roofGrad = ctx.createLinearGradient(365, 110, 915, 240);
  roofGrad.addColorStop(0, '#334155');
  roofGrad.addColorStop(1, '#1e293b');
  ctx.fillStyle = roofGrad;
  ctx.beginPath();
  ctx.moveTo(365, 245);
  ctx.lineTo(640, 108);
  ctx.lineTo(915, 245);
  ctx.closePath();
  ctx.fill();

  // Snow cap on roof eaves
  const snowRoofGrad = ctx.createLinearGradient(365, 108, 365, 245);
  snowRoofGrad.addColorStop(0, '#f8fafc');
  snowRoofGrad.addColorStop(1, '#cbd5e1');
  ctx.strokeStyle = snowRoofGrad;
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(365, 244);
  ctx.lineTo(640, 108);
  ctx.lineTo(915, 244);
  ctx.stroke();

  // Brick chimney
  ctx.fillStyle = '#6b2d26';
  ctx.fillRect(760, 120, 44, 72);
  ctx.fillStyle = '#e2e8f0';
  roundRectPath(ctx, 756, 116, 52, 10, 4);
  ctx.fill();

  // House windows (warm glow when on, dark night glass when off)
  const lightsOn = settings.windowLights !== false;
  const glowPulse = 0.92 + 0.08 * Math.sin(elapsed * 2);
  drawHouseWindow(ctx, 455, 280, 92, 92, trim, glowPulse, lightsOn);
  drawHouseWindow(ctx, 733, 280, 92, 92, trim, glowPulse, lightsOn);
  drawHouseWindow(ctx, 608, 172, 64, 54, trim, glowPulse, lightsOn);

  // Front Door & Porch
  const doorGrad = ctx.createLinearGradient(602, 305, 678, 455);
  doorGrad.addColorStop(0, '#1e5638');
  doorGrad.addColorStop(1, '#0f301e');
  ctx.fillStyle = doorGrad;
  roundRectPath(ctx, 602, 305, 76, 150, 4);
  ctx.fill();
  ctx.strokeStyle = trim;
  ctx.lineWidth = 4;
  ctx.stroke();

  // Porch steps
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(584, 448, 112, 12);

  // Door wreath
  ctx.strokeStyle = '#15803d';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(640, 355, 16, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.arc(640, 339, 4.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawHouseWindow(ctx, x, y, w, h, trim, glowPulse, lightsOn = true) {
  ctx.save();
  if (lightsOn) {
    ctx.shadowColor = `rgba(253, 224, 71, ${0.65 * glowPulse})`;
    ctx.shadowBlur = 22;
    const winGrad = ctx.createRadialGradient(x + w * 0.5, y + h * 0.5, 8, x + w * 0.5, y + h * 0.5, w * 0.75);
    winGrad.addColorStop(0, '#fef9c3');
    winGrad.addColorStop(0.65, '#facc15');
    winGrad.addColorStop(1, '#ca8a04');
    ctx.fillStyle = winGrad;
  } else {
    const darkGrad = ctx.createLinearGradient(x, y, x + w, y + h);
    darkGrad.addColorStop(0, '#172536');
    darkGrad.addColorStop(0.6, '#0d1724');
    darkGrad.addColorStop(1, '#060c14');
    ctx.fillStyle = darkGrad;
  }
  ctx.fillRect(x, y, w, h);
  ctx.shadowBlur = 0;

  if (!lightsOn) {
    ctx.fillStyle = 'rgba(148, 163, 184, 0.14)';
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 4);
    ctx.lineTo(x + w * 0.55, y + 4);
    ctx.lineTo(x + 4, y + h * 0.65);
    ctx.closePath();
    ctx.fill();
  }

  ctx.strokeStyle = trim;
  ctx.lineWidth = 5;
  ctx.strokeRect(x, y, w, h);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.5, y);
  ctx.lineTo(x + w * 0.5, y + h);
  ctx.moveTo(x, y + h * 0.5);
  ctx.lineTo(x + w, y + h * 0.5);
  ctx.stroke();
  ctx.restore();
}

function drawRooflineLights(ctx, elapsed, lightColors) {
  const colors =
    Array.isArray(lightColors) && lightColors.length > 0
      ? lightColors
      : ['#fde047', '#f87171', '#38bdf8', '#4ade80'];
  const pts = [];
  const leftCount = 12;
  for (let i = 0; i <= leftCount; i++) {
    const t = i / leftCount;
    pts.push({
      x: 365 + (640 - 365) * t,
      y: 245 + (108 - 245) * t
    });
  }
  for (let i = 1; i <= leftCount; i++) {
    const t = i / leftCount;
    pts.push({
      x: 640 + (915 - 640) * t,
      y: 108 + (245 - 108) * t
    });
  }

  ctx.save();
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const color = colors[i % colors.length];
    const pulse = 0.55 + 0.45 * Math.sin(elapsed * 4.2 + i * 0.65);
    ctx.shadowColor = color;
    ctx.shadowBlur = 14 * pulse + 4;
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.55 + 0.45 * pulse;
    ctx.beginPath();
    ctx.arc(p.x, p.y + 4, 4.8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/* ============================================================================
   PROCEDURAL PLACEABLE ITEM RENDERERS (GRADIENTS + SHADOWBLUR GLOWS)
   ============================================================================ */

export function drawProceduralItem(ctx, type, width, height, elapsed = 0, itemRef = null) {
  switch (type) {
    case 'bauble_red':
      drawGlossyBauble(ctx, '#dc2626', '#f5d07a', width * 0.42);
      break;
    case 'bauble_gold':
      drawGlossyBauble(ctx, '#d97706', '#fef3c7', width * 0.42);
      break;
    case 'star_topper':
      drawGoldStarTopper(ctx, width * 0.46, elapsed);
      break;
    case 'angel_topper':
      drawAngelTopper(ctx, width, height, elapsed);
      break;
    case 'gift_box':
      drawGiftItem(
        ctx,
        width,
        height,
        (itemRef && itemRef.customData.color) || '#b91c1c',
        (itemRef && itemRef.customData.ribbonColor) || '#f5d07a'
      );
      break;
    case 'gift_tall':
      drawGiftItem(
        ctx,
        width,
        height,
        (itemRef && itemRef.customData.color) || '#15803d',
        (itemRef && itemRef.customData.ribbonColor) || '#fef3c7'
      );
      break;
    case 'candy_cane':
      drawCandyCane(ctx, width, height);
      break;
    case 'pine_cone':
      drawPineCone(ctx, width, height);
      break;
    case 'garland':
      drawGarland(ctx, width, height);
      break;
    case 'light_string':
      drawLightStringItem(ctx, width, height, elapsed, itemRef && itemRef.customData.colors);
      break;
    case 'candle':
      drawCandleItem(ctx, width, height, elapsed);
      break;
    case 'bell':
      drawBellItem(ctx, width, height);
      break;
    case 'poinsettia':
      drawPoinsettiaItem(ctx, width, height);
      break;
    case 'tinsel_line':
      drawTinselLineItem(ctx, width, height, elapsed);
      break;
    case 'lantern':
      drawLanternItem(ctx, width, height, elapsed);
      break;
    case 'bow':
      drawVelvetBowItem(ctx, width, height);
      break;
    case 'streamer':
      drawCeilingStreamer(ctx, width, height, itemRef && itemRef.customData.colors);
      break;
    case 'balloon':
      drawPartyBalloon(ctx, width, height, itemRef && itemRef.customData.color);
      break;
    case 'fairy_lights':
      drawFairyLightsCurtain(ctx, width, height, elapsed, itemRef && itemRef.customData.colors);
      break;
    case 'nutcracker':
      drawNutcrackerStatue(ctx, width, height, elapsed);
      break;
    case 'glowing_deer':
      drawGlowingDeer(ctx, width, height, elapsed);
      break;
    case 'pathway_marker':
      drawPathwayMarker(ctx, width, height, elapsed);
      break;
    case 'roof_light_strand':
      drawLightStringItem(ctx, width, height, elapsed, itemRef && itemRef.customData.colors);
      break;
    case 'snowman':
      drawInteractiveSnowman(ctx, width, height, elapsed, itemRef ? itemRef.interactTimer : 0);
      break;
    case 'wooden_train':
      drawWoodenTrainItem(ctx, width, height);
      break;
    case 'plush_bear':
      drawPlushBearItem(ctx, width, height);
      break;
    case 'brass_drum':
      drawBrassDrumItem(ctx, width, height);
      break;
    case 'toy_robot':
      drawToyRobotItem(ctx, width, height, elapsed);
      break;
    case 'gift_tag':
      drawGiftTagItem(ctx, width, height, itemRef && itemRef.customData.text);
      break;
    case 'cookie_plate':
      drawCookiePlateItem(ctx, width, height);
      break;
    case 'wooden_serving_tray':
      drawWoodenServingTrayItem(ctx, width, height);
      break;
    case 'tiered_cake_stand':
      drawTieredCakeStandItem(ctx, width, height);
      break;
    case 'gingerbread_cookie':
      drawPredecoratedCookieItem(ctx, width, height, 'gingerbread_man');
      break;
    case 'star_sugar_cookie':
      drawPredecoratedCookieItem(ctx, width, height, 'star_cookie');
      break;
    case 'tree_cookie_item':
      drawPredecoratedCookieItem(ctx, width, height, 'tree_cookie');
      break;
    case 'sprinkle_mix':
      drawSprinkleMixItem(ctx, width, height);
      break;
    case 'peppermint_candy':
      drawPeppermintCandyItem(ctx, width, height);
      break;
    case 'gumdrop_cluster':
      drawGumdropClusterItem(ctx, width, height);
      break;
    case 'cinnamon_bundle':
      drawCinnamonBundleItem(ctx, width, height);
      break;
    case 'frosting_swirl':
      drawFrostingSwirlItem(ctx, width, height);
      break;
    case 'sugar_star':
      drawSugarStarItem(ctx, width, height);
      break;
    case 'golden_harness':
      drawGoldenHarnessItem(ctx, width, height);
      break;
    case 'holly_wreath':
      drawHollyWreathItem(ctx, width, height);
      break;
    case 'hanging_lantern':
      drawHangingLanternItem(ctx, width, height, elapsed);
      break;
    case 'glossy_bell':
      drawGlossyBellItem(ctx, width, height);
      break;
    case 'mistletoe_sprig':
      drawMistletoeSprigItem(ctx, width, height);
      break;
    case 'stable_garland':
      drawStableGarlandItem(ctx, width, height);
      break;
    case 'hay_bundle':
      drawHayBundleItem(ctx, width, height);
      break;
    case 'carrot_basket':
      drawCarrotBasketItem(ctx, width, height);
      break;
    case 'stable_bell':
      drawHarnessBellsItem(ctx, width, height, elapsed, itemRef ? itemRef.interactTimer : 0);
      break;
    case 'shop_wreath':
      drawHollyWreathItem(ctx, width, height);
      break;
    case 'cobble_bench':
      drawCobbleBenchItem(ctx, width, height);
      break;
    case 'caroler_lantern':
      drawLanternItem(ctx, width, height, elapsed);
      break;
    case 'candy_pillar':
      drawCandyPillarItem(ctx, width, height);
      break;
    case 'festive_banner':
      drawFestiveBannerItem(ctx, width, height);
      break;
    case 'public_ornament':
      drawGlossyBauble(ctx, '#b91c1c', '#f5d07a', width * 0.42);
      break;
    case 'streetlamp_prop':
      drawStreetlampPropItem(ctx, width, height, elapsed, itemRef && itemRef.customData.intensity);
      break;
    case 'harness_bells':
      drawHarnessBellsItem(ctx, width, height, elapsed, itemRef ? itemRef.interactTimer : 0);
      break;
    case 'toy_stack':
      drawToyStackItem(ctx, width, height);
      break;
    case 'magic_lantern_pole':
      drawMagicLanternPoleItem(ctx, width, height, elapsed);
      break;
    case 'festive_ribbon':
      drawFestiveRibbonItem(ctx, width, height);
      break;
    case 'beacon_torch':
      drawBeaconTorchItem(ctx, width, height, elapsed);
      break;
    case 'cargo_sack':
      drawCargoSackItem(ctx, width, height);
      break;
    case 'stardust_trail':
      drawStardustTrailItem(ctx, width, height, elapsed);
      break;
    case 'runway_marker':
      drawRunwayMarkerItem(ctx, width, height, elapsed);
      break;
    case 'brass_horn':
      drawBrassHornItem(ctx, width, height);
      break;
    case 'gift_cube':
      drawGiftItem(
        ctx,
        width,
        height,
        (itemRef && itemRef.customData.color) || '#b91c1c',
        (itemRef && itemRef.customData.ribbonColor) || '#facc15'
      );
      break;
    case 'gift_cylinder':
      drawGiftCylinderItem(
        ctx,
        width,
        height,
        (itemRef && itemRef.customData.color) || '#15803d',
        (itemRef && itemRef.customData.ribbonColor) || '#f5d07a'
      );
      break;
    case 'gift_plush':
      drawGiftPlushItem(
        ctx,
        width,
        height,
        (itemRef && itemRef.customData.color) || '#1d4ed8',
        (itemRef && itemRef.customData.ribbonColor) || '#f8fafc'
      );
      break;
    case 'satin_bow':
      drawVelvetBowItem(ctx, width, height);
      break;
    case 'wax_seal':
      drawWaxSealItem(ctx, width, height);
      break;
    case 'pine_sprig':
      drawPineSprigItem(ctx, width, height);
      break;
    case 'gold_cord':
      drawGoldCordItem(ctx, width, height);
      break;
    case 'confetti_box':
      drawGiftItem(ctx, width, height, '#1d4ed8', '#facc15');
      break;
    case 'santas_house':
      drawIsoSantasHouse(ctx, width, height, elapsed);
      break;
    case 'elf_barracks':
      drawIsoElfBarracks(ctx, width, height, elapsed);
      break;
    case 'cocoa_shop':
      drawIsoCocoaShop(ctx, width, height, elapsed);
      break;
    case 'toy_tower':
      drawIsoToyTower(ctx, width, height, elapsed);
      break;
    case 'toy_factory':
      drawIsoToyFactory(ctx, width, height, elapsed);
      break;
    case 'gingerbread_bakery':
      drawIsoGingerbreadBakery(ctx, width, height, elapsed);
      break;
    case 'elf_cottage':
      drawIsoElfCottage(ctx, width, height, elapsed);
      break;
    case 'village_clocktower':
      drawIsoClocktower(ctx, width, height, elapsed);
      break;
    case 'mini_train_car':
      drawIsoTrainCar(ctx, width, height, elapsed);
      break;
    case 'candy_cane_path':
      drawIsoCandyPath(ctx, width, height, elapsed);
      break;
    case 'pine_cluster':
      drawIsoPineCluster(ctx, width, height);
      break;
    case 'frozen_fountain':
      drawIsoFrozenFountain(ctx, width, height, elapsed);
      break;
    default:
      drawGlossyBauble(ctx, '#b91c1c', '#f5d07a', width * 0.4);
      break;
  }
}

export function renderThumbnailDataURL(type, customData = {}, width = 88, height = 88) {
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  const ctx = c.getContext('2d');
  ctx.translate(width * 0.5, height * 0.5);
  const fakeItem = { customData, interactTimer: 0 };
  drawProceduralItem(ctx, type, width * 0.72, height * 0.72, 1.2, fakeItem);
  return c.toDataURL('image/png');
}

function drawGlossyBauble(ctx, baseColor, capColor, r) {
  // Cap
  ctx.fillStyle = capColor;
  ctx.fillRect(-r * 0.22, -r * 1.12, r * 0.44, r * 0.25);
  ctx.strokeStyle = capColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -r * 1.18, r * 0.14, 0, Math.PI * 2);
  ctx.stroke();

  const grad = ctx.createRadialGradient(-r * 0.32, -r * 0.32, r * 0.1, 0, 0, r);
  grad.addColorStop(0, shadeColor(baseColor, 48));
  grad.addColorStop(0.55, baseColor);
  grad.addColorStop(1, shadeColor(baseColor, -42));
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  // Specular highlight
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.3, -r * 0.32, r * 0.2, r * 0.12, -0.6, 0, Math.PI * 2);
  ctx.fill();
}

function drawGoldStarTopper(ctx, r, elapsed) {
  ctx.save();
  ctx.shadowColor = '#fde047';
  ctx.shadowBlur = 12 + Math.sin(elapsed * 3) * 4;
  const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, r);
  grad.addColorStop(0, '#fef9c3');
  grad.addColorStop(0.55, '#f59e0b');
  grad.addColorStop(1, '#92400e');
  ctx.fillStyle = grad;

  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.44;
    const ang = (i * Math.PI) / 5 - Math.PI / 2;
    const px = Math.cos(ang) * rad;
    const py = Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawAngelTopper(ctx, w, h, elapsed) {
  ctx.save();
  const haloPulse = 0.75 + 0.25 * Math.sin(elapsed * 3.2);

  // Feathered pearl wings
  const wingGrad = ctx.createLinearGradient(-w * 0.48, -h * 0.15, w * 0.48, h * 0.1);
  wingGrad.addColorStop(0, '#e2e8f0');
  wingGrad.addColorStop(0.5, '#ffffff');
  wingGrad.addColorStop(1, '#cbd5e1');
  ctx.fillStyle = wingGrad;
  ctx.shadowColor = 'rgba(254, 243, 199, 0.55)';
  ctx.shadowBlur = 10;

  ctx.beginPath();
  ctx.moveTo(-4, -h * 0.08);
  ctx.bezierCurveTo(-w * 0.46, -h * 0.36, -w * 0.52, h * 0.08, -w * 0.14, h * 0.14);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(4, -h * 0.08);
  ctx.bezierCurveTo(w * 0.46, -h * 0.36, w * 0.52, h * 0.08, w * 0.14, h * 0.14);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Flowing ivory & gold-hemmed robe
  const gownGrad = ctx.createLinearGradient(0, -h * 0.14, 0, h * 0.44);
  gownGrad.addColorStop(0, '#fffdf7');
  gownGrad.addColorStop(0.7, '#f3e7cf');
  gownGrad.addColorStop(1, '#d4a353');
  ctx.fillStyle = gownGrad;
  ctx.beginPath();
  ctx.moveTo(-w * 0.1, -h * 0.14);
  ctx.lineTo(w * 0.1, -h * 0.14);
  ctx.bezierCurveTo(w * 0.22, h * 0.1, w * 0.34, h * 0.3, w * 0.32, h * 0.44);
  ctx.lineTo(-w * 0.32, h * 0.44);
  ctx.bezierCurveTo(-w * 0.34, h * 0.3, -w * 0.22, h * 0.1, -w * 0.1, -h * 0.14);
  ctx.closePath();
  ctx.fill();

  // Golden sash
  ctx.strokeStyle = '#d4a353';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-w * 0.11, -h * 0.04);
  ctx.quadraticCurveTo(0, h * 0.01, w * 0.11, -h * 0.04);
  ctx.stroke();

  // Glowing halo behind head
  ctx.save();
  ctx.shadowColor = '#fde047';
  ctx.shadowBlur = 14 * haloPulse;
  ctx.strokeStyle = '#fde047';
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.ellipse(0, -h * 0.38, w * 0.15, h * 0.055, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Hair & face
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.arc(0, -h * 0.24, w * 0.135, 0, Math.PI * 2);
  ctx.fill();

  const faceGrad = ctx.createRadialGradient(-2, -h * 0.25, 1, 0, -h * 0.23, w * 0.11);
  faceGrad.addColorStop(0, '#ffedd5');
  faceGrad.addColorStop(1, '#fed7aa');
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.arc(0, -h * 0.23, w * 0.105, 0, Math.PI * 2);
  ctx.fill();

  // Tiny glowing star held in hands
  ctx.shadowColor = '#fde047';
  ctx.shadowBlur = 8 * haloPulse;
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(0, h * 0.06, 4.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawGiftItem(ctx, w, h, boxColor, ribbonColor) {
  ctx.save();
  const bx = -w * 0.44;
  const by = -h * 0.32;
  const bw = w * 0.88;
  const bh = h * 0.74;

  // Box base with shading
  const boxGrad = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
  boxGrad.addColorStop(0, shadeColor(boxColor, 20));
  boxGrad.addColorStop(0.6, boxColor);
  boxGrad.addColorStop(1, shadeColor(boxColor, -30));
  ctx.fillStyle = boxGrad;
  ctx.shadowColor = 'rgba(0,0,0,0.38)';
  ctx.shadowBlur = 8;
  roundRectPath(ctx, bx, by + bh * 0.14, bw, bh * 0.86, 4);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Box lid overhanging slightly
  const lidGrad = ctx.createLinearGradient(bx - 3, by, bx + bw + 3, by + bh * 0.24);
  lidGrad.addColorStop(0, shadeColor(boxColor, 28));
  lidGrad.addColorStop(1, shadeColor(boxColor, -12));
  ctx.fillStyle = lidGrad;
  roundRectPath(ctx, bx - 3, by, bw + 6, bh * 0.22, 3);
  ctx.fill();

  // Satin ribbon cross
  const ribGrad = ctx.createLinearGradient(-bw * 0.1, by, bw * 0.1, by + bh);
  ribGrad.addColorStop(0, shadeColor(ribbonColor, 18));
  ribGrad.addColorStop(1, shadeColor(ribbonColor, -14));
  ctx.fillStyle = ribGrad;
  ctx.fillRect(-bw * 0.11, by, bw * 0.22, bh);
  ctx.fillRect(bx, by + bh * 0.48, bw, bh * 0.16);

  // Top bow loops
  ctx.strokeStyle = ribbonColor;
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.ellipse(-bw * 0.14, by - 5, bw * 0.13, bh * 0.11, -0.35, 0, Math.PI * 2);
  ctx.ellipse(bw * 0.14, by - 5, bw * 0.13, bh * 0.11, 0.35, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = shadeColor(ribbonColor, 10);
  ctx.beginPath();
  ctx.arc(0, by - 2, 4.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawCandyCane(ctx, w, h) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineWidth = w * 0.22;
  ctx.strokeStyle = '#f8fafc';
  ctx.beginPath();
  ctx.moveTo(w * 0.14, h * 0.36);
  ctx.lineTo(w * 0.14, -h * 0.14);
  ctx.arc(-w * 0.02, -h * 0.14, w * 0.16, 0, Math.PI, true);
  ctx.stroke();

  ctx.strokeStyle = '#dc2626';
  ctx.setLineDash([6, 8]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function drawPineCone(ctx, w, h) {
  ctx.save();
  const grad = ctx.createRadialGradient(-4, -6, 3, 0, 0, w * 0.42);
  grad.addColorStop(0, '#925b39');
  grad.addColorStop(1, '#3b2113');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, 0, w * 0.28, h * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 224, 185, 0.35)';
  ctx.lineWidth = 1.5;
  for (let y = -h * 0.24; y <= h * 0.24; y += h * 0.14) {
    ctx.beginPath();
    ctx.arc(0, y, w * 0.2, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawGarland(ctx, w, h) {
  ctx.save();
  const grad = ctx.createLinearGradient(-w * 0.5, 0, w * 0.5, 0);
  grad.addColorStop(0, '#14532d');
  grad.addColorStop(0.5, '#227041');
  grad.addColorStop(1, '#0f3f21');
  ctx.strokeStyle = grad;
  ctx.lineWidth = h * 0.34;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-w * 0.46, -h * 0.14);
  ctx.quadraticCurveTo(0, h * 0.34, w * 0.46, -h * 0.14);
  ctx.stroke();

  // Holly berries along garland
  ctx.fillStyle = '#dc2626';
  for (let t = 0.2; t <= 0.85; t += 0.3) {
    const bx = -w * 0.46 + w * 0.92 * t;
    const by = -h * 0.14 + Math.sin(t * Math.PI) * h * 0.24;
    ctx.beginPath();
    ctx.arc(bx, by, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawLightStringItem(ctx, w, h, elapsed, customColors) {
  ctx.save();
  ctx.strokeStyle = '#1f2937';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-w * 0.46, -h * 0.12);
  ctx.quadraticCurveTo(0, h * 0.26, w * 0.46, -h * 0.12);
  ctx.stroke();

  const colors =
    Array.isArray(customColors) && customColors.length > 0
      ? customColors
      : ['#f87171', '#facc15', '#38bdf8', '#4ade80', '#f472b6'];
  const count = 6;
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const bx = -w * 0.46 + w * 0.92 * t;
    const by = -h * 0.12 + Math.sin(t * Math.PI) * h * 0.2;
    const col = colors[i % colors.length];
    const pulse = 0.55 + 0.45 * Math.sin(elapsed * 4 + i * 1.1);
    ctx.shadowColor = col;
    ctx.shadowBlur = 12 * pulse + 4;
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(bx, by + 5, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawCandleItem(ctx, w, h, elapsed) {
  ctx.save();
  // Brass holder
  const holderGrad = ctx.createLinearGradient(-w * 0.28, 0, w * 0.28, 0);
  holderGrad.addColorStop(0, '#926727');
  holderGrad.addColorStop(0.5, '#f2d085');
  holderGrad.addColorStop(1, '#7a541e');
  ctx.fillStyle = holderGrad;
  roundRectPath(ctx, -w * 0.26, h * 0.25, w * 0.52, h * 0.14, 4);
  ctx.fill();

  // Pillar wax
  const waxGrad = ctx.createLinearGradient(-w * 0.16, 0, w * 0.16, 0);
  waxGrad.addColorStop(0, '#dc2626');
  waxGrad.addColorStop(0.45, '#f87171');
  waxGrad.addColorStop(1, '#991b1b');
  ctx.fillStyle = waxGrad;
  roundRectPath(ctx, -w * 0.15, -h * 0.18, w * 0.3, h * 0.44, 3);
  ctx.fill();

  // Flickering flame
  const sway = Math.sin(elapsed * 8) * 2.2;
  ctx.shadowColor = '#fbbf24';
  ctx.shadowBlur = 16;
  const flameGrad = ctx.createRadialGradient(sway, -h * 0.3, 1, sway, -h * 0.3, 12);
  flameGrad.addColorStop(0, '#ffffff');
  flameGrad.addColorStop(0.45, '#fde047');
  flameGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');
  ctx.fillStyle = flameGrad;
  ctx.beginPath();
  ctx.ellipse(sway, -h * 0.3, 6, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBellItem(ctx, w, h) {
  ctx.save();
  const grad = ctx.createLinearGradient(-w * 0.3, -h * 0.3, w * 0.3, h * 0.3);
  grad.addColorStop(0, '#fef08a');
  grad.addColorStop(0.45, '#d4a353');
  grad.addColorStop(1, '#784e16');
  ctx.fillStyle = grad;

  ctx.beginPath();
  ctx.moveTo(0, -h * 0.38);
  ctx.bezierCurveTo(w * 0.28, -h * 0.36, w * 0.28, h * 0.08, w * 0.38, h * 0.24);
  ctx.lineTo(-w * 0.38, h * 0.24);
  ctx.bezierCurveTo(-w * 0.28, h * 0.08, -w * 0.28, -h * 0.36, 0, -h * 0.38);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#92400e';
  ctx.beginPath();
  ctx.arc(0, h * 0.28, w * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPoinsettiaItem(ctx, w, h) {
  ctx.save();
  const r = Math.min(w, h) * 0.44;
  // Green leaves
  ctx.fillStyle = '#15803d';
  for (let i = 0; i < 4; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI) / 2 + 0.4);
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.58, r * 0.25, r * 0.52, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // Crimson petals
  for (let i = 0; i < 6; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI) / 3);
    const pGrad = ctx.createLinearGradient(0, 0, 0, -r);
    pGrad.addColorStop(0, '#991b1b');
    pGrad.addColorStop(0.6, '#dc2626');
    pGrad.addColorStop(1, '#ef4444');
    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.48, r * 0.22, r * 0.48, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // Gold center stamens
  ctx.fillStyle = '#facc15';
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * 4, Math.sin(a) * 4, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawTinselLineItem(ctx, w, h, elapsed) {
  ctx.save();
  const grad = ctx.createLinearGradient(-w * 0.5, 0, w * 0.5, 0);
  grad.addColorStop(0, '#d4a353');
  grad.addColorStop(0.5, '#fef3c7');
  grad.addColorStop(1, '#d4a353');
  ctx.strokeStyle = grad;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.shadowColor = 'rgba(253, 224, 71, 0.6)';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(-w * 0.46, 0);
  ctx.quadraticCurveTo(0, h * 0.25, w * 0.46, 0);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = 1.4;
  for (let i = -3; i <= 3; i++) {
    const px = i * (w * 0.12);
    const py = (1 - Math.abs(i) / 4) * h * 0.12;
    const sp = 4 + Math.sin(elapsed * 4 + i) * 2;
    ctx.beginPath();
    ctx.moveTo(px - sp, py - sp);
    ctx.lineTo(px + sp, py + sp);
    ctx.stroke();
  }
  ctx.restore();
}

function drawLanternItem(ctx, w, h, elapsed) {
  ctx.save();
  const pulse = 0.85 + 0.15 * Math.sin(elapsed * 5);
  ctx.shadowColor = '#fbbf24';
  ctx.shadowBlur = 18 * pulse;
  const glassGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, w * 0.34);
  glassGrad.addColorStop(0, '#fef9c3');
  glassGrad.addColorStop(0.6, '#f59e0b');
  glassGrad.addColorStop(1, 'rgba(180, 83, 9, 0.4)');
  ctx.fillStyle = glassGrad;
  roundRectPath(ctx, -w * 0.24, -h * 0.24, w * 0.48, h * 0.54, 4);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Frame
  ctx.strokeStyle = '#1f2937';
  ctx.lineWidth = 3;
  ctx.strokeRect(-w * 0.24, -h * 0.24, w * 0.48, h * 0.54);
  ctx.fillStyle = '#111827';
  roundRectPath(ctx, -w * 0.3, -h * 0.34, w * 0.6, h * 0.12, 4);
  ctx.fill();
  roundRectPath(ctx, -w * 0.3, h * 0.28, w * 0.6, h * 0.12, 4);
  ctx.fill();
  ctx.restore();
}

function drawVelvetBowItem(ctx, w, h) {
  ctx.save();
  const grad = ctx.createLinearGradient(-w * 0.4, -h * 0.2, w * 0.4, h * 0.2);
  grad.addColorStop(0, '#991b1b');
  grad.addColorStop(0.5, '#ef4444');
  grad.addColorStop(1, '#7f1d1d');
  ctx.fillStyle = grad;

  // Ribbons
  ctx.beginPath();
  ctx.moveTo(-4, 4);
  ctx.lineTo(-w * 0.28, h * 0.42);
  ctx.lineTo(-w * 0.12, h * 0.42);
  ctx.lineTo(0, 8);
  ctx.lineTo(w * 0.12, h * 0.42);
  ctx.lineTo(w * 0.28, h * 0.42);
  ctx.lineTo(4, 4);
  ctx.fill();

  // Loops
  ctx.beginPath();
  ctx.ellipse(-w * 0.22, -h * 0.08, w * 0.22, h * 0.18, -0.25, 0, Math.PI * 2);
  ctx.ellipse(w * 0.22, -h * 0.08, w * 0.22, h * 0.18, 0.25, 0, Math.PI * 2);
  ctx.fill();

  // Center knot
  ctx.fillStyle = '#b91c1c';
  roundRectPath(ctx, -w * 0.09, -h * 0.12, w * 0.18, h * 0.22, 6);
  ctx.fill();
  ctx.restore();
}

function drawCeilingStreamer(ctx, w, h, customColors) {
  ctx.save();
  const colors =
    Array.isArray(customColors) && customColors.length > 0
      ? customColors
      : ['#dc2626', '#d4a353', '#15803d'];
  for (let i = 0; i < 3; i++) {
    const baseCol = colors[i % colors.length];
    const grad = ctx.createLinearGradient(-w * 0.48, 0, w * 0.48, 0);
    grad.addColorStop(0, shadeColor(baseCol, -18));
    grad.addColorStop(0.5, shadeColor(baseCol, 18));
    grad.addColorStop(1, shadeColor(baseCol, -18));
    ctx.strokeStyle = grad;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-w * 0.48, -h * 0.22 + i * 6);
    ctx.quadraticCurveTo(0, h * 0.28 + i * 6, w * 0.48, -h * 0.22 + i * 6);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPartyBalloon(ctx, w, h, colorOverride) {
  const col = colorOverride || '#dc2626';
  ctx.save();
  // String
  ctx.strokeStyle = 'rgba(245, 239, 226, 0.7)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.22);
  ctx.quadraticCurveTo(8, h * 0.38, -4, h * 0.56);
  ctx.stroke();

  const grad = ctx.createRadialGradient(-w * 0.14, -h * 0.18, 4, 0, -h * 0.04, w * 0.42);
  grad.addColorStop(0, shadeColor(col, 48));
  grad.addColorStop(0.6, col);
  grad.addColorStop(1, shadeColor(col, -36));
  ctx.fillStyle = grad;

  ctx.beginPath();
  ctx.ellipse(0, -h * 0.06, w * 0.34, h * 0.36, 0, 0, Math.PI * 2);
  ctx.fill();

  // Glossy specular dot
  ctx.fillStyle = 'rgba(255,255,255,0.48)';
  ctx.beginPath();
  ctx.ellipse(-w * 0.12, -h * 0.2, w * 0.08, h * 0.12, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawFairyLightsCurtain(ctx, w, h, elapsed, customColors) {
  ctx.save();
  ctx.strokeStyle = 'rgba(226, 232, 240, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-w * 0.46, -h * 0.35);
  ctx.lineTo(w * 0.46, -h * 0.35);
  ctx.stroke();

  const colors =
    Array.isArray(customColors) && customColors.length > 0
      ? customColors
      : ['#fef9c3', '#fde047'];

  const drops = 5;
  for (let d = 0; d < drops; d++) {
    const dx = -w * 0.4 + (d / (drops - 1)) * (w * 0.8);
    const len = h * (0.48 + (d % 2) * 0.2);
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.35)';
    ctx.beginPath();
    ctx.moveTo(dx, -h * 0.35);
    ctx.lineTo(dx, -h * 0.35 + len);
    ctx.stroke();

    for (let b = 1; b <= 3; b++) {
      const by = -h * 0.35 + (b / 3) * len;
      const pulse = 0.55 + 0.45 * Math.sin(elapsed * 3.5 + d + b);
      const col = colors[(d + b) % colors.length];
      ctx.shadowColor = col;
      ctx.shadowBlur = 12 * pulse + 3;
      ctx.fillStyle = col;
      ctx.globalAlpha = 0.5 + 0.5 * pulse;
      ctx.beginPath();
      ctx.arc(dx, by, 3.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawNutcrackerStatue(ctx, w, h, elapsed) {
  if (ASSETS.statueSprite instanceof HTMLImageElement) {
    ctx.drawImage(ASSETS.statueSprite, -w * 0.5, -h * 0.5, w, h);
    return;
  }
  ctx.save();
  // Illuminated glow pedestal
  const glow = 0.75 + 0.25 * Math.sin(elapsed * 2.5);
  ctx.shadowColor = `rgba(250, 204, 21, ${0.5 * glow})`;
  ctx.shadowBlur = 14;

  // Boots & Legs
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-w * 0.16, h * 0.16, w * 0.12, h * 0.26);
  ctx.fillRect(w * 0.04, h * 0.16, w * 0.12, h * 0.26);

  // Coat
  const coatGrad = ctx.createLinearGradient(-w * 0.2, -h * 0.1, w * 0.2, h * 0.18);
  coatGrad.addColorStop(0, '#ef4444');
  coatGrad.addColorStop(1, '#991b1b');
  ctx.fillStyle = coatGrad;
  roundRectPath(ctx, -w * 0.2, -h * 0.08, w * 0.4, h * 0.26, 4);
  ctx.fill();

  // Gold belt & buttons
  ctx.fillStyle = '#facc15';
  ctx.fillRect(-w * 0.2, h * 0.06, w * 0.4, h * 0.04);

  // Head
  ctx.fillStyle = '#fde68a';
  roundRectPath(ctx, -w * 0.14, -h * 0.26, w * 0.28, h * 0.18, 4);
  ctx.fill();

  // Tall Crown Hat
  const hatGrad = ctx.createLinearGradient(0, -h * 0.48, 0, -h * 0.26);
  hatGrad.addColorStop(0, '#334155');
  hatGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = hatGrad;
  roundRectPath(ctx, -w * 0.16, -h * 0.48, w * 0.32, h * 0.22, 4);
  ctx.fill();
  ctx.restore();
}

function drawGlowingDeer(ctx, w, h, elapsed) {
  if (ASSETS.deerSprite instanceof HTMLImageElement) {
    ctx.drawImage(ASSETS.deerSprite, -w * 0.5, -h * 0.5, w, h);
    return;
  }
  ctx.save();
  const pulse = 0.75 + 0.25 * Math.sin(elapsed * 3.2);
  ctx.shadowColor = '#fde047';
  ctx.shadowBlur = 18 * pulse;
  ctx.strokeStyle = '#fef08a';
  ctx.fillStyle = 'rgba(254, 240, 138, 0.24)';
  ctx.lineWidth = 3;

  // Body
  ctx.beginPath();
  ctx.ellipse(0, h * 0.06, w * 0.28, h * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Legs
  ctx.beginPath();
  ctx.moveTo(-w * 0.18, h * 0.14);
  ctx.lineTo(-w * 0.2, h * 0.42);
  ctx.moveTo(-w * 0.08, h * 0.18);
  ctx.lineTo(-w * 0.08, h * 0.42);
  ctx.moveTo(w * 0.1, h * 0.18);
  ctx.lineTo(w * 0.1, h * 0.42);
  ctx.moveTo(w * 0.2, h * 0.14);
  ctx.lineTo(w * 0.22, h * 0.42);
  ctx.stroke();

  // Neck & Head
  ctx.beginPath();
  ctx.moveTo(w * 0.18, 0);
  ctx.lineTo(w * 0.28, -h * 0.22);
  ctx.ellipse(w * 0.32, -h * 0.24, w * 0.1, h * 0.07, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Antlers
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.28, -h * 0.28);
  ctx.lineTo(w * 0.22, -h * 0.46);
  ctx.moveTo(w * 0.25, -h * 0.37);
  ctx.lineTo(w * 0.33, -h * 0.43);
  ctx.stroke();
  ctx.restore();
}

function drawPathwayMarker(ctx, w, h, elapsed) {
  ctx.save();
  ctx.fillStyle = '#334155';
  ctx.fillRect(-3, h * 0.02, 6, h * 0.42);

  const pulse = 0.75 + 0.25 * Math.sin(elapsed * 4.5);
  ctx.shadowColor = '#fbbf24';
  ctx.shadowBlur = 16 * pulse;
  const globeGrad = ctx.createRadialGradient(0, -h * 0.14, 2, 0, -h * 0.14, w * 0.26);
  globeGrad.addColorStop(0, '#ffffff');
  globeGrad.addColorStop(0.5, '#fde047');
  globeGrad.addColorStop(1, '#dc2626');
  ctx.fillStyle = globeGrad;
  ctx.beginPath();
  ctx.arc(0, -h * 0.14, w * 0.24, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawInteractiveSnowman(ctx, w, h, elapsed, interactTimer) {
  if (ASSETS.snowmanSprite instanceof HTMLImageElement) {
    ctx.drawImage(ASSETS.snowmanSprite, -w * 0.5, -h * 0.5, w, h);
    return;
  }
  ctx.save();
  const wave = interactTimer > 0 ? Math.sin(interactTimer * 18) * 0.45 : Math.sin(elapsed * 1.5) * 0.06;

  // Three snowballs with soft blue shadow gradients
  const balls = [
    { y: h * 0.22, r: w * 0.28 },
    { y: -h * 0.02, r: w * 0.21 },
    { y: -h * 0.24, r: w * 0.15 }
  ];
  for (let i = 0; i < balls.length; i++) {
    const b = balls[i];
    const grad = ctx.createRadialGradient(-b.r * 0.3, b.y - b.r * 0.3, 2, 0, b.y, b.r);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.75, '#e2e8f0');
    grad.addColorStop(1, '#94a3b8');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Twig arms (wave when tapped!)
  ctx.strokeStyle = '#5b3622';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.save();
  ctx.translate(-w * 0.18, -h * 0.04);
  ctx.rotate(-0.4 + wave);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-w * 0.22, -h * 0.1);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.translate(w * 0.18, -h * 0.04);
  ctx.rotate(0.4 - wave);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(w * 0.22, -h * 0.1);
  ctx.stroke();
  ctx.restore();

  // Scarf
  ctx.fillStyle = '#dc2626';
  roundRectPath(ctx, -w * 0.16, -h * 0.13, w * 0.32, h * 0.08, 4);
  ctx.fill();

  // Carrot nose & eyes
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(-w * 0.05, -h * 0.27, 2.2, 0, Math.PI * 2);
  ctx.arc(w * 0.05, -h * 0.27, 2.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.moveTo(0, -h * 0.25);
  ctx.lineTo(w * 0.14, -h * 0.22);
  ctx.lineTo(0, -h * 0.2);
  ctx.closePath();
  ctx.fill();

  // Top hat (tips when interacted!)
  ctx.save();
  ctx.translate(0, -h * 0.36);
  ctx.rotate(wave * 0.35);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-w * 0.16, -2, w * 0.32, 5);
  ctx.fillRect(-w * 0.11, -h * 0.14, w * 0.22, h * 0.14);
  ctx.restore();

  ctx.restore();
}

/* ============================================================================
   UTILITY HELPERS
   ============================================================================ */

export function addRoundRectSubpath(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w * 0.5, h * 0.5);
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

export function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  addRoundRectSubpath(ctx, x, y, w, h, r);
}

export function shadeColor(hex, percent) {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
  return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
}

export function getContrastInk(hex) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? '#1f1612' : '#f8fafc';
}

/* ============================================================================
   LEVEL 5-11 SNAP TARGETS, ISOMETRIC GRID & HITBOXES
   ============================================================================ */

export const WORKSHOP_SHELVES = [
  { id: 'shelf_top_left', x1: 90, x2: 430, y: 205 },
  { id: 'shelf_mid_left', x1: 90, x2: 430, y: 340 },
  { id: 'shelf_top_right', x1: 850, x2: 1185, y: 205 },
  { id: 'shelf_mid_right', x1: 850, x2: 1185, y: 340 }
];

export const WORKSHOP_SACK_ZONE = { x: 960, y: 420, w: 230, h: 200, snapX: 1075, snapY: 515 };

export const BAKERY_WORKSTATIONS = {
  displayBoard: { x: 85, y: 455, w: 295, h: 95, snapY: 502 },
  rollingPinZone: { x: 400, y: 450, w: 300, h: 100, snapY: 502 },
  coolingRack: { x: 855, y: 460, w: 330, h: 90, snapY: 504 }
};

export const STABLE_REINDEER_FRAMES = [
  { id: 0, name: 'Dasher', cx: 295, cy: 405, blanketX: 282, blanketY: 392, collarX: 350, collarY: 360 },
  { id: 1, name: 'Comet', cx: 640, cy: 405, blanketX: 627, blanketY: 392, collarX: 695, collarY: 360 },
  { id: 2, name: 'Rudolph', cx: 985, cy: 405, blanketX: 972, blanketY: 392, collarX: 1040, collarY: 360, redNose: true }
];

export const TOWN_STREETLAMP_HITBOXES = [
  { id: 0, x: 258, y: 270, w: 72, h: 255, lampX: 294, lampY: 295 },
  { id: 1, x: 525, y: 275, w: 72, h: 245, lampX: 561, lampY: 300 },
  { id: 2, x: 948, y: 270, w: 72, h: 255, lampX: 984, lampY: 295 }
];

export const LAUNCHPAD_BELL_HITBOX = { x: 995, y: 380, w: 150, h: 110, cx: 1070, cy: 435 };

export const LAUNCHPAD_SLEIGH_ZONES = {
  bodySnap: { x: 160, y: 260, w: 800, h: 325 },
  cargoSnap: { x: 170, y: 300, w: 225, h: 170, snapX: 270, snapY: 385 },
  ribbonSnap: { x: 355, y: 395, w: 495, h: 150, snapY: 465 }
};

export const IsometricGrid = {
  cols: 14,
  rows: 14,
  originX: 640,
  originY: 148,
  tileW: 68,
  tileH: 34,

  toScreen(col, row) {
    return {
      x: this.originX + (col - row) * (this.tileW * 0.5),
      y: this.originY + (col + row) * (this.tileH * 0.5)
    };
  },

  toGrid(sx, sy) {
    const dx = sx - this.originX;
    const dy = sy - this.originY;
    const hw = this.tileW * 0.5;
    const hh = this.tileH * 0.5;
    const col = Math.round((dx / hw + dy / hh) * 0.5);
    const row = Math.round((dy / hh - dx / hw) * 0.5);
    return {
      col: Math.max(0, Math.min(this.cols - 1, col)),
      row: Math.max(0, Math.min(this.rows - 1, row))
    };
  },

  snapScreen(sx, sy) {
    const cell = this.toGrid(sx, sy);
    const pt = this.toScreen(cell.col, cell.row);
    return { ...pt, col: cell.col, row: cell.row };
  }
};

export function getIsoGroundOffsetRatio(type) {
  if (type === 'candy_cane_path') return 0;
  if (type === 'custom_village_flag') return 0.39;
  if (type === 'village_clocktower') return 0.32;
  if (type === 'mini_train_car') return 0.22;
  if (type === 'frozen_fountain') return 0.24;
  return 0.26;
}

/* ============================================================================
   LEVEL 5-11 STUDIO SILHOUETTE & COMPOSITE DRAWERS
   ============================================================================ */

export function traceToySilhouette(ctx, shape, cx, cy, scale = 0.9) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.beginPath();
  if (shape === 'train') {
    addRoundRectSubpath(ctx, -108, -16, 155, 76, 10);
    addRoundRectSubpath(ctx, -96, -74, 66, 60, 6);
    addRoundRectSubpath(ctx, 18, -60, 24, 46, 4);
    ctx.moveTo(47, 14);
    ctx.lineTo(106, 60);
    ctx.lineTo(47, 60);
    ctx.closePath();
    [-68, -14, 34].forEach((wx) => {
      ctx.moveTo(wx + 20, 64);
      ctx.arc(wx, 64, 20, 0, Math.PI * 2);
    });
  } else if (shape === 'robot') {
    addRoundRectSubpath(ctx, -46, -102, 92, 64, 14);
    addRoundRectSubpath(ctx, -62, -32, 124, 98, 14);
    addRoundRectSubpath(ctx, -92, -22, 26, 68, 10);
    addRoundRectSubpath(ctx, 66, -22, 26, 68, 10);
    addRoundRectSubpath(ctx, -44, 68, 34, 44, 8);
    addRoundRectSubpath(ctx, 10, 68, 34, 44, 8);
  } else {
    // Full teddy bear silhouette without chord artifacts
    ctx.moveTo(-58 + 26, -82);
    ctx.arc(-58, -82, 26, 0, Math.PI * 2);
    ctx.moveTo(58 + 26, -82);
    ctx.arc(58, -82, 26, 0, Math.PI * 2);
    ctx.moveTo(56, -48);
    ctx.arc(0, -48, 56, 0, Math.PI * 2);
    ctx.moveTo(64, 42);
    ctx.ellipse(0, 42, 64, 68, 0, 0, Math.PI * 2);
    ctx.moveTo(-66 + 24 * Math.cos(0.35), 22 + 24 * Math.sin(0.35));
    ctx.ellipse(-66, 22, 24, 38, 0.35, 0, Math.PI * 2);
    ctx.moveTo(66 + 24 * Math.cos(-0.35), 22 + 24 * Math.sin(-0.35));
    ctx.ellipse(66, 22, 24, 38, -0.35, 0, Math.PI * 2);
    ctx.moveTo(-36 + 28, 98);
    ctx.ellipse(-36, 98, 28, 24, 0, 0, Math.PI * 2);
    ctx.moveTo(36 + 28, 98);
    ctx.ellipse(36, 98, 28, 24, 0, 0, Math.PI * 2);
  }
  ctx.restore();
}

export function drawToySilhouetteComposite(ctx, opts) {
  const {
    cx = 152,
    cy = 158,
    scale = 0.9,
    shape = 'teddy',
    baseColor = '#b45309',
    tagName = 'For Leo',
    paintLayer = null
  } = opts;

  ctx.save();
  traceToySilhouette(ctx, shape, cx, cy, scale);
  const grad = ctx.createRadialGradient(cx - 25, cy - 35, 10, cx, cy, 130);
  grad.addColorStop(0, shadeColor(baseColor, 30));
  grad.addColorStop(0.6, baseColor);
  grad.addColorStop(1, shadeColor(baseColor, -34));
  ctx.fillStyle = grad;
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 12;
  ctx.fill();
  ctx.shadowBlur = 0;

  // Clip painted strokes & stencils cleanly inside full toy silhouette
  ctx.save();
  ctx.clip();
  if (paintLayer) {
    ctx.drawImage(paintLayer, 0, 0);
  }
  ctx.restore();

  // Crisp subtle contour outline so every limb/part reads clearly
  ctx.strokeStyle = 'rgba(255, 248, 232, 0.36)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Silhouette feature details
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.strokeStyle = 'rgba(255,255,255,0.28)';
  ctx.lineWidth = 2;
  if (shape === 'train') {
    ctx.fillStyle = '#1e293b';
    [-68, -14, 34].forEach((wx) => {
      ctx.beginPath();
      ctx.arc(wx, 64, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d4a353';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.fillStyle = '#d4a353';
      ctx.beginPath();
      ctx.arc(wx, 64, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1e293b';
    });
    ctx.fillStyle = '#fef3c7';
    roundRectPath(ctx, -84, -56, 38, 28, 4);
    ctx.fill();
    ctx.fillStyle = '#d4a353';
    roundRectPath(ctx, 14, -64, 32, 9, 4);
    ctx.fill();
  } else if (shape === 'robot') {
    ctx.fillStyle = '#0f172a';
    roundRectPath(ctx, -30, -84, 60, 22, 6);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(-14, -73, 5, 0, Math.PI * 2);
    ctx.arc(14, -73, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
    roundRectPath(ctx, -36, -12, 72, 46, 8);
    ctx.fill();
    ctx.strokeStyle = '#d4a353';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -102);
    ctx.lineTo(0, -124);
    ctx.stroke();
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, -126, 6, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Inner ears, muzzle, belly patch, eyes & nose
    ctx.fillStyle = shadeColor(baseColor, 36);
    ctx.beginPath();
    ctx.arc(-58, -82, 13, 0, Math.PI * 2);
    ctx.arc(58, -82, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = shadeColor(baseColor, 42);
    ctx.beginPath();
    ctx.ellipse(0, -34, 24, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, 44, 34, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1e1b18';
    ctx.beginPath();
    ctx.arc(-20, -58, 5, 0, Math.PI * 2);
    ctx.arc(20, -58, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, -40, 8, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Attached parchment gift tag with custom name string
  const displayTag = (tagName || '').trim();
  if (displayTag) {
    ctx.save();
    ctx.translate(cx + 68 * scale, cy + 72 * scale);
    ctx.rotate(-0.18);
    ctx.strokeStyle = '#d4a353';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-40, -14);
    ctx.lineTo(-10, -4);
    ctx.stroke();

    const tagGrad = ctx.createLinearGradient(-16, -20, 74, 20);
    tagGrad.addColorStop(0, '#fef3c7');
    tagGrad.addColorStop(1, '#e5c98b');
    ctx.fillStyle = tagGrad;
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 6;
    roundRectPath(ctx, -16, -16, 94, 32, 6);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.arc(-6, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#29170a';
    ctx.font = '700 13px "Fraunces", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(displayTag, 35, 1, 70);
    ctx.restore();
  }

  ctx.restore();
}

export function traceCookieShape(ctx, shape, cx, cy, r = 110) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  if (shape === 'star_cookie') {
    for (let i = 0; i < 10; i++) {
      const rad = i % 2 === 0 ? r : r * 0.48;
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      const x = Math.cos(a) * rad;
      const y = Math.sin(a) * rad;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  } else if (shape === 'tree_cookie') {
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.48, -r * 0.25);
    ctx.lineTo(r * 0.28, -r * 0.25);
    ctx.lineTo(r * 0.68, r * 0.28);
    ctx.lineTo(r * 0.42, r * 0.28);
    ctx.lineTo(r * 0.84, r * 0.72);
    ctx.lineTo(r * 0.18, r * 0.72);
    ctx.lineTo(r * 0.18, r * 0.98);
    ctx.lineTo(-r * 0.18, r * 0.98);
    ctx.lineTo(-r * 0.18, r * 0.72);
    ctx.lineTo(-r * 0.84, r * 0.72);
    ctx.lineTo(-r * 0.42, r * 0.28);
    ctx.lineTo(-r * 0.68, r * 0.28);
    ctx.lineTo(-r * 0.28, -r * 0.25);
    ctx.lineTo(-r * 0.48, -r * 0.25);
    ctx.closePath();
  } else if (shape === 'bell_cookie') {
    ctx.moveTo(0, -r * 0.96);
    ctx.bezierCurveTo(r * 0.52, -r * 0.92, r * 0.56, r * 0.12, r * 0.82, r * 0.54);
    ctx.lineTo(r * 0.18, r * 0.54);
    ctx.arc(0, r * 0.64, r * 0.18, 0, Math.PI, false);
    ctx.lineTo(-r * 0.82, r * 0.54);
    ctx.bezierCurveTo(-r * 0.56, r * 0.12, -r * 0.52, -r * 0.92, 0, -r * 0.96);
    ctx.closePath();
  } else {
    // Full-bodied continuous gingerbread man silhouette contour
    ctx.moveTo(0, -r * 0.94);
    ctx.bezierCurveTo(r * 0.28, -r * 0.94, r * 0.34, -r * 0.68, r * 0.29, -r * 0.46);
    ctx.bezierCurveTo(r * 0.24, -r * 0.36, r * 0.28, -r * 0.3, r * 0.46, -r * 0.28);
    // Right arm
    ctx.bezierCurveTo(r * 0.78, -r * 0.28, r * 0.86, -r * 0.16, r * 0.84, -r * 0.05);
    ctx.bezierCurveTo(r * 0.82, r * 0.06, r * 0.62, r * 0.06, r * 0.32, r * 0.02);
    // Right waist & hip
    ctx.bezierCurveTo(r * 0.27, r * 0.16, r * 0.3, r * 0.34, r * 0.36, r * 0.56);
    // Right leg & foot
    ctx.bezierCurveTo(r * 0.42, r * 0.78, r * 0.38, r * 0.94, r * 0.22, r * 0.94);
    ctx.bezierCurveTo(r * 0.08, r * 0.94, r * 0.06, r * 0.72, r * 0.03, r * 0.48);
    ctx.quadraticCurveTo(0, r * 0.42, -r * 0.03, r * 0.48);
    // Left leg & foot
    ctx.bezierCurveTo(-r * 0.06, r * 0.72, -r * 0.08, r * 0.94, -r * 0.22, r * 0.94);
    ctx.bezierCurveTo(-r * 0.38, r * 0.94, -r * 0.42, r * 0.78, -r * 0.36, r * 0.56);
    // Left waist & hip
    ctx.bezierCurveTo(-r * 0.3, r * 0.34, -r * 0.27, r * 0.16, -r * 0.32, r * 0.02);
    // Left arm
    ctx.bezierCurveTo(-r * 0.62, r * 0.06, -r * 0.82, r * 0.06, -r * 0.84, -r * 0.05);
    ctx.bezierCurveTo(-r * 0.86, -r * 0.16, -r * 0.78, -r * 0.28, -r * 0.46, -r * 0.28);
    // Left neck & head
    ctx.bezierCurveTo(-r * 0.28, -r * 0.3, -r * 0.24, -r * 0.36, -r * 0.29, -r * 0.46);
    ctx.bezierCurveTo(-r * 0.34, -r * 0.68, -r * 0.28, -r * 0.94, 0, -r * 0.94);
    ctx.closePath();
  }
  ctx.restore();
}

export function drawCookieComposite(ctx, opts) {
  const {
    cx = 160,
    cy = 160,
    shape = 'gingerbread_man',
    doughColor = '#b4692e',
    icingLayer = null
  } = opts;

  ctx.save();
  traceCookieShape(ctx, shape, cx, cy, 112);
  const doughGrad = ctx.createRadialGradient(cx - 22, cy - 24, 14, cx, cy, 130);
  doughGrad.addColorStop(0, shadeColor(doughColor, 24));
  doughGrad.addColorStop(0.65, doughColor);
  doughGrad.addColorStop(1, shadeColor(doughColor, -30));
  ctx.fillStyle = doughGrad;
  ctx.shadowColor = 'rgba(0,0,0,0.42)';
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = shadeColor(doughColor, -36);
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.save();
  ctx.clip();
  // Subtle baked crumb speckles + soft rim bevel
  ctx.fillStyle = 'rgba(255, 224, 178, 0.14)';
  for (let i = 0; i < 26; i++) {
    const sx = cx - 95 + ((i * 53) % 190);
    const sy = cy - 95 + ((i * 37) % 190);
    ctx.beginPath();
    ctx.arc(sx, sy, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
  if (icingLayer) {
    ctx.drawImage(icingLayer, 0, 0);
  }
  ctx.restore();
  ctx.restore();
}

export function drawReindeerBlanketComposite(ctx, opts) {
  const {
    cx = 150,
    cy = 110,
    matrix = [],
    name = 'Comet',
    scale = 1
  } = opts;

  const rows = matrix.length || 6;
  const cols = (matrix[0] && matrix[0].length) || 8;
  const bw = 156;
  const bh = 106;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  // Saddled blanket body
  ctx.beginPath();
  ctx.moveTo(-bw * 0.5, -bh * 0.42);
  ctx.quadraticCurveTo(0, -bh * 0.54, bw * 0.5, -bh * 0.42);
  ctx.lineTo(bw * 0.54, bh * 0.36);
  ctx.quadraticCurveTo(0, bh * 0.48, -bw * 0.54, bh * 0.36);
  ctx.closePath();

  ctx.fillStyle = '#1e293b';
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.shadowBlur = 0;

  // Clip matrix wool squares inside blanket shape
  ctx.save();
  ctx.clip();
  const cellW = (bw * 1.1) / cols;
  const cellH = (bh * 0.96) / rows;
  const startX = -bw * 0.55;
  const startY = -bh * 0.48;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      ctx.fillStyle = (matrix[r] && matrix[r][c]) || '#b91c1c';
      ctx.fillRect(startX + c * cellW, startY + r * cellH, cellW + 0.6, cellH + 0.6);
    }
  }
  // Woven textile sheen
  const sheenGrad = ctx.createLinearGradient(0, -bh * 0.5, 0, bh * 0.5);
  sheenGrad.addColorStop(0, 'rgba(255,255,255,0.22)');
  sheenGrad.addColorStop(0.5, 'rgba(255,255,255,0)');
  sheenGrad.addColorStop(1, 'rgba(0,0,0,0.28)');
  ctx.fillStyle = sheenGrad;
  ctx.fillRect(-bw * 0.6, -bh * 0.6, bw * 1.2, bh * 1.2);
  ctx.restore();

  // Gold embroidered border
  ctx.strokeStyle = '#f5d07a';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Leather strap & brass collar tag hanging right
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(bw * 0.44, -bh * 0.16);
  ctx.quadraticCurveTo(bw * 0.66, -bh * 0.24, bw * 0.62, bh * 0.06);
  ctx.stroke();

  // Brass collar medallion + engraved name
  const tx = bw * 0.62;
  const ty = bh * 0.18;
  const tagGrad = ctx.createLinearGradient(tx - 44, ty - 18, tx + 44, ty + 18);
  tagGrad.addColorStop(0, '#fef08a');
  tagGrad.addColorStop(0.5, '#d4a353');
  tagGrad.addColorStop(1, '#92400e');
  ctx.fillStyle = tagGrad;
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 6;
  roundRectPath(ctx, tx - 46, ty - 16, 92, 32, 12);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#fef3c7';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#29170a';
  ctx.font = '700 13px "Fraunces", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText((name || 'Comet').trim() || 'Comet', tx, ty + 1, 78);

  ctx.restore();
}

export function drawSignboardComposite(ctx, opts) {
  const {
    cx = 190,
    cy = 110,
    shape = 'arch',
    baseColor = '#1e3a2f',
    text = 'Ye Olde Toyshop',
    glowColor = '#fde047',
    glowIntensity = 85,
    paintLayer = null
  } = opts;

  ctx.save();
  // Warm interior display window glow backdrop behind signboard
  const glowAlpha = Math.max(0.15, Math.min(1, glowIntensity / 100));
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 24 * glowAlpha;

  ctx.beginPath();
  if (shape === 'banner') {
    ctx.moveTo(cx - 155, cy - 52);
    ctx.lineTo(cx + 155, cy - 52);
    ctx.lineTo(cx + 135, cy);
    ctx.lineTo(cx + 155, cy + 52);
    ctx.lineTo(cx - 155, cy + 52);
    ctx.lineTo(cx - 135, cy);
    ctx.closePath();
  } else if (shape === 'plank') {
    roundRectPath(ctx, cx - 155, cy - 46, 310, 92, 8);
  } else {
    ctx.moveTo(cx - 152, cy + 54);
    ctx.lineTo(cx - 152, cy - 18);
    ctx.quadraticCurveTo(cx, cy - 92, cx + 152, cy - 18);
    ctx.lineTo(cx + 152, cy + 54);
    ctx.closePath();
  }

  const grad = ctx.createLinearGradient(cx - 150, cy - 60, cx + 150, cy + 60);
  grad.addColorStop(0, shadeColor(baseColor, 20));
  grad.addColorStop(0.55, baseColor);
  grad.addColorStop(1, shadeColor(baseColor, -26));
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.save();
  ctx.clip();
  if (paintLayer) {
    ctx.drawImage(paintLayer, 0, 0);
  }
  ctx.restore();

  // Gilded border
  ctx.strokeStyle = '#d4a353';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Shop lettering
  ctx.fillStyle = getContrastInk(baseColor);
  ctx.font = '700 24px "Fraunces", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText((text || '').trim() || 'Holiday Shoppe', cx, cy + 6, 260);
  ctx.restore();
}

export function drawLicensePlateComposite(ctx, opts) {
  const {
    cx = 190,
    cy = 95,
    baseColor = '#991b1b',
    trimColor = '#d4a353',
    plateText = 'SANTA-1',
    paintLayer = null
  } = opts;

  const pw = 348;
  const ph = 158;
  const px = cx - pw * 0.5;
  const py = cy - ph * 0.5;

  ctx.save();
  // Rectangular stamped license plate blank only (clean transparent corners for drag-and-drop)
  roundRectPath(ctx, px, py, pw, ph, 16);
  const bgGrad = ctx.createLinearGradient(px, py, px, py + ph);
  bgGrad.addColorStop(0, shadeColor(baseColor, 22));
  bgGrad.addColorStop(0.45, baseColor);
  bgGrad.addColorStop(1, shadeColor(baseColor, -28));
  ctx.fillStyle = bgGrad;
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 3;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Clip brushed sheen, embossed groove, and custom painted details inside the rectangular plate
  ctx.save();
  roundRectPath(ctx, px, py, pw, ph, 16);
  ctx.clip();

  // Subtle top metallic specular highlight
  const sheen = ctx.createLinearGradient(px, py, px, py + ph * 0.45);
  sheen.addColorStop(0, 'rgba(255,255,255,0.26)');
  sheen.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(px, py, pw, ph * 0.45);

  if (paintLayer) {
    ctx.drawImage(paintLayer, 0, 0);
  }
  ctx.restore();

  // Outer raised trim & inner recessed pinstripe border
  ctx.strokeStyle = trimColor;
  ctx.lineWidth = 6;
  roundRectPath(ctx, px + 3, py + 3, pw - 6, ph - 6, 14);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 1.6;
  roundRectPath(ctx, px + 11, py + 11, pw - 22, ph - 22, 9);
  ctx.stroke();

  // Four corner mounting bolt slots & rivets
  const holes = [
    [px + 26, py + 24],
    [px + pw - 26, py + 24],
    [px + 26, py + ph - 24],
    [px + pw - 26, py + ph - 24]
  ];
  holes.forEach(([hx, hy]) => {
    ctx.fillStyle = '#0f172a';
    roundRectPath(ctx, hx - 9, hy - 5, 18, 10, 5);
    ctx.fill();
    ctx.strokeStyle = trimColor;
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(hx, hy, 2.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Top registration header
  const ink = getContrastInk(baseColor);
  ctx.fillStyle = trimColor;
  ctx.font = '700 13px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('NORTH POLE · SLEIGH', cx, py + 31);

  // Embossed registration code
  const label = ((plateText || '').trim() || 'SANTA-1').toUpperCase();
  ctx.font = '800 50px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
  ctx.fillText(label, cx + 2, cy + 16, pw - 52);
  ctx.fillStyle = ink;
  ctx.fillText(label, cx, cy + 14, pw - 52);

  // Bottom year / express tag
  ctx.fillStyle = trimColor;
  ctx.font = '700 11px "JetBrains Mono", monospace';
  ctx.fillText('★ DEC 25 EXPRESS ★', cx, py + ph - 22);

  ctx.restore();
}

export function drawSleighPanelComposite(ctx, opts) {
  return drawLicensePlateComposite(ctx, opts);
}

export function drawWrappedGiftComposite(ctx, opts) {
  const {
    cx = 120,
    cy = 120,
    shape = 'square',
    paperColor = '#b91c1c',
    ribbonColor = '#f5d07a',
    tileCanvas = null
  } = opts;

  ctx.save();
  let tilePattern = null;
  if (tileCanvas) {
    // Composite paper base + 64x64 doodle tile into a seamless repeating pattern
    const patCanvas = document.createElement('canvas');
    patCanvas.width = tileCanvas.width;
    patCanvas.height = tileCanvas.height;
    const pCtx = patCanvas.getContext('2d');
    pCtx.fillStyle = paperColor;
    pCtx.fillRect(0, 0, patCanvas.width, patCanvas.height);
    pCtx.drawImage(tileCanvas, 0, 0);
    tilePattern = ctx.createPattern(patCanvas, 'repeat');
  }

  const fillStyle = tilePattern || paperColor;
  ctx.shadowColor = 'rgba(0,0,0,0.42)';
  ctx.shadowBlur = 12;

  if (shape === 'cylinder') {
    ctx.beginPath();
    ctx.ellipse(cx, cy + 56, 68, 22, 0, 0, Math.PI * 2);
    ctx.rect(cx - 68, cy - 48, 136, 104);
    ctx.fillStyle = fillStyle;
    ctx.fill();
    ctx.shadowBlur = 0;

    // 3D cylindrical shading
    const cylShade = ctx.createLinearGradient(cx - 68, 0, cx + 68, 0);
    cylShade.addColorStop(0, 'rgba(0,0,0,0.32)');
    cylShade.addColorStop(0.32, 'rgba(255,255,255,0.24)');
    cylShade.addColorStop(0.65, 'rgba(0,0,0,0.06)');
    cylShade.addColorStop(1, 'rgba(0,0,0,0.36)');
    ctx.fillStyle = cylShade;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 56, 68, 22, 0, 0, Math.PI * 2);
    ctx.rect(cx - 68, cy - 48, 136, 104);
    ctx.fill();

    // Lid ellipse with rim shadow
    ctx.fillStyle = fillStyle;
    ctx.beginPath();
    ctx.ellipse(cx, cy - 48, 72, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.32)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Satin ribbon band & bow
    ctx.fillStyle = ribbonColor;
    ctx.fillRect(cx - 11, cy - 52, 22, 128);
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.fillRect(cx - 4, cy - 52, 8, 128);
    drawRibbonBowOnTop(ctx, cx, cy - 54, ribbonColor);
  } else if (shape === 'plush') {
    ctx.beginPath();
    ctx.moveTo(cx - 28, cy - 52);
    ctx.bezierCurveTo(cx - 88, cy - 10, cx - 84, cy + 72, cx, cy + 74);
    ctx.bezierCurveTo(cx + 84, cy + 72, cx + 88, cy - 10, cx + 28, cy - 52);
    ctx.lineTo(cx + 42, cy - 78);
    ctx.lineTo(cx - 42, cy - 78);
    ctx.closePath();
    ctx.fillStyle = fillStyle;
    ctx.fill();
    ctx.shadowBlur = 0;

    const bagShade = ctx.createRadialGradient(cx - 24, cy, 10, cx, cy + 12, 86);
    bagShade.addColorStop(0, 'rgba(255,255,255,0.24)');
    bagShade.addColorStop(1, 'rgba(0,0,0,0.34)');
    ctx.fillStyle = bagShade;
    ctx.fill();

    // Folded gusset creases
    ctx.strokeStyle = 'rgba(0,0,0,0.22)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 16, cy - 44);
    ctx.quadraticCurveTo(cx - 28, cy + 12, cx - 18, cy + 60);
    ctx.moveTo(cx + 16, cy - 44);
    ctx.quadraticCurveTo(cx + 28, cy + 12, cx + 18, cy + 60);
    ctx.stroke();

    // Neck cinch ribbon
    ctx.fillStyle = ribbonColor;
    roundRectPath(ctx, cx - 34, cy - 56, 68, 14, 6);
    ctx.fill();
    drawRibbonBowOnTop(ctx, cx, cy - 49, ribbonColor);
  } else {
    // Crisp 3D-shaded square gift box
    roundRectPath(ctx, cx - 72, cy - 52, 144, 124, 8);
    ctx.fillStyle = fillStyle;
    ctx.fill();
    ctx.shadowBlur = 0;

    const shade = ctx.createLinearGradient(cx - 72, cy - 52, cx + 72, cy + 72);
    shade.addColorStop(0, 'rgba(255,255,255,0.2)');
    shade.addColorStop(0.55, 'rgba(0,0,0,0.04)');
    shade.addColorStop(1, 'rgba(0,0,0,0.34)');
    ctx.fillStyle = shade;
    ctx.fill();

    // Lid cast shadow on box front
    ctx.fillStyle = 'rgba(0,0,0,0.24)';
    ctx.fillRect(cx - 72, cy - 36, 144, 7);

    // Overhanging lid
    ctx.fillStyle = fillStyle;
    roundRectPath(ctx, cx - 78, cy - 62, 156, 26, 6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Crossed ribbon with sheen
    ctx.fillStyle = ribbonColor;
    ctx.fillRect(cx - 12, cy - 62, 24, 134);
    ctx.fillRect(cx - 72, cy + 2, 144, 22);
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(cx - 4, cy - 62, 8, 134);
    drawRibbonBowOnTop(ctx, cx, cy - 66, ribbonColor);
  }

  ctx.restore();
}

function drawRibbonBowOnTop(ctx, x, y, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.ellipse(x - 18, y - 6, 16, 10, -0.35, 0, Math.PI * 2);
  ctx.ellipse(x + 18, y - 6, 16, 10, 0.35, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = shadeColor(color, 16);
  ctx.beginPath();
  ctx.arc(x, y - 2, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawVillageFlagComposite(ctx, opts) {
  const {
    cx = 160,
    cy = 140,
    shape = 'pennant',
    baseColor = '#b91c1c',
    labelText = 'North Pole',
    paintLayer = null
  } = opts;

  ctx.save();
  // Brass pole & finial
  const poleX = cx - 88;
  const poleGrad = ctx.createLinearGradient(poleX - 5, 0, poleX + 5, 0);
  poleGrad.addColorStop(0, '#926727');
  poleGrad.addColorStop(0.5, '#f5d07a');
  poleGrad.addColorStop(1, '#784e16');
  ctx.fillStyle = poleGrad;
  roundRectPath(ctx, poleX - 5, cy - 110, 10, 220, 4);
  ctx.fill();

  ctx.fillStyle = '#fde047';
  ctx.beginPath();
  ctx.arc(poleX, cy - 116, 10, 0, Math.PI * 2);
  ctx.fill();

  // Flag cloth path
  ctx.beginPath();
  if (shape === 'swallowtail') {
    ctx.moveTo(poleX + 5, cy - 95);
    ctx.lineTo(cx + 110, cy - 95);
    ctx.lineTo(cx + 76, cy - 35);
    ctx.lineTo(cx + 110, cy + 25);
    ctx.lineTo(poleX + 5, cy + 25);
    ctx.closePath();
  } else if (shape === 'royal') {
    ctx.moveTo(poleX + 5, cy - 95);
    ctx.lineTo(cx + 108, cy - 95);
    ctx.lineTo(cx + 108, cy - 10);
    ctx.quadraticCurveTo(cx + 52, cy + 45, poleX + 5, cy + 25);
    ctx.closePath();
  } else {
    ctx.moveTo(poleX + 5, cy - 95);
    ctx.lineTo(cx + 116, cy - 35);
    ctx.lineTo(poleX + 5, cy + 25);
    ctx.closePath();
  }

  const clothGrad = ctx.createLinearGradient(poleX, cy - 95, cx + 110, cy + 25);
  clothGrad.addColorStop(0, shadeColor(baseColor, 18));
  clothGrad.addColorStop(1, shadeColor(baseColor, -28));
  ctx.fillStyle = clothGrad;
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.save();
  ctx.clip();
  if (paintLayer) {
    ctx.drawImage(paintLayer, 0, 0);
  }
  ctx.restore();

  ctx.strokeStyle = '#f5d07a';
  ctx.lineWidth = 3;
  ctx.stroke();

  const txt = (labelText || '').trim();
  if (txt) {
    ctx.fillStyle = getContrastInk(baseColor);
    ctx.font = '700 15px "Fraunces", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(txt, poleX + 86, cy - 35, 130);
  }
  ctx.restore();
}

/* ============================================================================
   LEVEL 5-11 SCENE BACKGROUND RENDERERS
   ============================================================================ */

export function renderLevel5Scene(ctx, elapsed, settings) {
  const W = LOGICAL_WIDTH;
  const H = LOGICAL_HEIGHT;

  if (ASSETS.workshopBg instanceof HTMLImageElement) {
    ctx.drawImage(ASSETS.workshopBg, 0, 0, W, H);
    return;
  }

  // Cozy timber workshop walls
  const wallGrad = ctx.createRadialGradient(640, 260, 80, 640, 320, 760);
  wallGrad.addColorStop(0, '#5d3420');
  wallGrad.addColorStop(0.55, '#3b2013');
  wallGrad.addColorStop(1, '#1e0f09');
  ctx.fillStyle = wallGrad;
  ctx.fillRect(0, 0, W, H);

  // Vertical wood plank paneling
  ctx.strokeStyle = 'rgba(0,0,0,0.22)';
  ctx.lineWidth = 2;
  for (let x = 0; x < W; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 530);
    ctx.stroke();
  }

  // Overhead wooden workshop ceiling rafters & brass brackets for hanging décor
  const rafterGrad = ctx.createLinearGradient(0, 0, 0, 62);
  rafterGrad.addColorStop(0, '#2a150b');
  rafterGrad.addColorStop(0.65, '#5b331d');
  rafterGrad.addColorStop(1, '#3b1f10');
  ctx.fillStyle = rafterGrad;
  ctx.fillRect(0, 0, W, 56);
  ctx.fillStyle = '#472514';
  ctx.fillRect(0, 56, W, 14);
  [180, 420, 860, 1100].forEach((rx) => {
    ctx.fillStyle = '#3f2011';
    ctx.beginPath();
    ctx.moveTo(rx - 14, 56);
    ctx.lineTo(rx + 14, 56);
    ctx.lineTo(rx + 34, 102);
    ctx.lineTo(rx - 34, 102);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#d4a353';
    ctx.beginPath();
    ctx.arc(rx, 64, 4.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Arched snowy workshop window in center
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(500, 315);
  ctx.lineTo(500, 145);
  ctx.arc(640, 145, 140, Math.PI, 0);
  ctx.lineTo(780, 315);
  ctx.closePath();
  const winSky = ctx.createLinearGradient(640, 10, 640, 315);
  winSky.addColorStop(0, '#0a1e38');
  winSky.addColorStop(1, '#264b73');
  ctx.fillStyle = winSky;
  ctx.fill();
  ctx.strokeStyle = '#d4a353';
  ctx.lineWidth = 8;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(640, 5);
  ctx.lineTo(640, 315);
  ctx.moveTo(500, 185);
  ctx.lineTo(780, 185);
  ctx.stroke();
  ctx.restore();

  // Left & Right Toy Workshop Shelves (Snap targets)
  WORKSHOP_SHELVES.forEach((sh) => {
    const shGrad = ctx.createLinearGradient(sh.x1, sh.y, sh.x1, sh.y + 20);
    shGrad.addColorStop(0, '#9a5b32');
    shGrad.addColorStop(1, '#542d14');
    ctx.fillStyle = shGrad;
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = 10;
    roundRectPath(ctx, sh.x1, sh.y, sh.x2 - sh.x1, 18, 5);
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  // Workshop Workbench / Floor
  const floorGrad = ctx.createLinearGradient(0, 515, 0, H);
  floorGrad.addColorStop(0, '#4e2c1b');
  floorGrad.addColorStop(1, '#24120a');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, 515, W, H - 515);

  // Moving Toy Conveyor Belt across middle-lower workshop
  const beltY = 445;
  const beltW = 870;
  const beltX = 75;
  ctx.save();
  const beltBody = ctx.createLinearGradient(beltX, beltY, beltX, beltY + 56);
  beltBody.addColorStop(0, '#334155');
  beltBody.addColorStop(0.5, '#1e293b');
  beltBody.addColorStop(1, '#0f172a');
  ctx.fillStyle = beltBody;
  roundRectPath(ctx, beltX, beltY, beltW, 56, 26);
  ctx.fill();
  ctx.strokeStyle = '#d4a353';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Animated conveyor slats & brass rollers
  const speed = settings.conveyorActive !== false ? 55 : 0;
  const offset = (elapsed * speed) % 44;
  ctx.strokeStyle = 'rgba(248, 250, 252, 0.25)';
  ctx.lineWidth = 3;
  for (let x = beltX + 24 + offset; x < beltX + beltW - 24; x += 44) {
    ctx.beginPath();
    ctx.moveTo(x, beltY + 6);
    ctx.lineTo(x, beltY + 50);
    ctx.stroke();
  }
  for (let x = beltX + 36; x <= beltX + beltW - 36; x += 90) {
    ctx.fillStyle = '#d4a353';
    ctx.beginPath();
    ctx.arc(x, beltY + 28, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(x, beltY + 28, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Santa's Giant Red Velvet Sack on Right (Snap target)
  const sk = WORKSHOP_SACK_ZONE;
  ctx.save();
  const sackGrad = ctx.createRadialGradient(sk.snapX - 24, sk.snapY, 16, sk.snapX, sk.snapY + 20, 140);
  sackGrad.addColorStop(0, '#dc2626');
  sackGrad.addColorStop(0.65, '#991b1b');
  sackGrad.addColorStop(1, '#450a0a');
  ctx.fillStyle = sackGrad;
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.moveTo(sk.snapX - 65, sk.y + 30);
  ctx.bezierCurveTo(sk.snapX - 125, sk.y + 110, sk.snapX - 110, sk.y + 215, sk.snapX, sk.y + 215);
  ctx.bezierCurveTo(sk.snapX + 115, sk.y + 215, sk.snapX + 125, sk.y + 110, sk.snapX + 65, sk.y + 30);
  ctx.lineTo(sk.snapX + 86, sk.y - 6);
  ctx.lineTo(sk.snapX - 86, sk.y - 6);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Gold rope tie & sack rim
  ctx.strokeStyle = '#f5d07a';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(sk.snapX - 70, sk.y + 32);
  ctx.quadraticCurveTo(sk.snapX, sk.y + 48, sk.snapX + 70, sk.y + 32);
  ctx.stroke();

  ctx.fillStyle = '#fef3c7';
  ctx.font = '700 14px "Fraunces", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText("SANTA'S SACK", sk.snapX, sk.y + 82);
  ctx.restore();

  // Optional warm workshop lantern glow
  if (settings.workshopGlow !== false) {
    const lanternGlow = ctx.createRadialGradient(640, 160, 20, 640, 260, 520);
    lanternGlow.addColorStop(0, 'rgba(253, 224, 71, 0.14)');
    lanternGlow.addColorStop(1, 'rgba(253, 224, 71, 0)');
    ctx.fillStyle = lanternGlow;
    ctx.fillRect(0, 0, W, H);
  }
}

export function renderLevel6Scene(ctx, elapsed, settings) {
  const W = LOGICAL_WIDTH;
  const H = LOGICAL_HEIGHT;

  if (ASSETS.bakeryBg instanceof HTMLImageElement) {
    ctx.drawImage(ASSETS.bakeryBg, 0, 0, W, H);
    return;
  }

  // Warm cream & cocoa bakery wall
  const wallGrad = ctx.createLinearGradient(0, 0, 0, 470);
  wallGrad.addColorStop(0, '#523426');
  wallGrad.addColorStop(1, '#311d14');
  ctx.fillStyle = wallGrad;
  ctx.fillRect(0, 0, W, 470);

  // Ceramic kitchen backsplash tiles
  ctx.fillStyle = 'rgba(246, 239, 226, 0.08)';
  ctx.strokeStyle = 'rgba(246, 239, 226, 0.12)';
  ctx.lineWidth = 1.5;
  for (let y = 240; y < 445; y += 34) {
    for (let x = 0; x < W; x += 68) {
      const off = (Math.floor(y / 34) % 2) * 34;
      ctx.strokeRect(x - off, y, 68, 34);
    }
  }

  // Brick Baker's Oven on Left
  ctx.save();
  const ovenGrad = ctx.createLinearGradient(70, 95, 360, 440);
  ovenGrad.addColorStop(0, '#7c3426');
  ovenGrad.addColorStop(1, '#4a1d14');
  ctx.fillStyle = ovenGrad;
  roundRectPath(ctx, 75, 110, 290, 340, 18);
  ctx.fill();

  // Arched glowing oven hearth
  ctx.beginPath();
  ctx.moveTo(130, 385);
  ctx.lineTo(130, 285);
  ctx.arc(220, 285, 90, Math.PI, 0);
  ctx.lineTo(310, 385);
  ctx.closePath();
  const ovenPulse = settings.ovenGlow !== false ? 0.85 + 0.15 * Math.sin(elapsed * 6) : 0.2;
  const fireGrad = ctx.createRadialGradient(220, 340, 12, 220, 320, 115);
  fireGrad.addColorStop(0, `rgba(254, 240, 138, ${ovenPulse})`);
  fireGrad.addColorStop(0.55, `rgba(249, 115, 22, ${0.85 * ovenPulse})`);
  fireGrad.addColorStop(1, '#1f0b07');
  ctx.fillStyle = fireGrad;
  ctx.fill();
  ctx.strokeStyle = '#d4a353';
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.restore();

  // Hanging Copper Pans & Spice Shelf on Right
  const shelfGrad = ctx.createLinearGradient(440, 150, 1200, 170);
  shelfGrad.addColorStop(0, '#854d27');
  shelfGrad.addColorStop(1, '#4e2b13');
  ctx.fillStyle = shelfGrad;
  roundRectPath(ctx, 450, 155, 740, 20, 6);
  ctx.fill();

  // Sugar, Sprinkles & Flour Jars on shelf
  [495, 575, 655].forEach((jx, idx) => {
    ctx.fillStyle = 'rgba(224, 242, 254, 0.35)';
    roundRectPath(ctx, jx, 92, 52, 63, 8);
    ctx.fill();
    ctx.fillStyle = idx === 0 ? '#fef3c7' : idx === 1 ? '#dc2626' : '#f8fafc';
    roundRectPath(ctx, jx + 5, 112, 42, 38, 4);
    ctx.fill();
    ctx.fillStyle = '#d4a353';
    roundRectPath(ctx, jx - 2, 84, 56, 12, 4);
    ctx.fill();
  });

  // Warm Hanging Copper Bakery Lamps illuminating workstation
  [550, 1020].forEach((lx) => {
    ctx.save();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(lx, 0);
    ctx.lineTo(lx, 120);
    ctx.stroke();
    const cone = ctx.createRadialGradient(lx, 145, 10, lx, 330, 270);
    cone.addColorStop(0, 'rgba(254, 240, 138, 0.24)');
    cone.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = cone;
    ctx.beginPath();
    ctx.moveTo(lx - 42, 142);
    ctx.lineTo(lx - 210, 490);
    ctx.lineTo(lx + 210, 490);
    ctx.lineTo(lx + 42, 142);
    ctx.closePath();
    ctx.fill();
    const hoodGrad = ctx.createLinearGradient(lx - 45, 115, lx + 45, 148);
    hoodGrad.addColorStop(0, '#c27138');
    hoodGrad.addColorStop(0.5, '#f59e0b');
    hoodGrad.addColorStop(1, '#7c2d12');
    ctx.fillStyle = hoodGrad;
    ctx.beginPath();
    ctx.moveTo(lx - 14, 114);
    ctx.lineTo(lx + 14, 114);
    ctx.lineTo(lx + 46, 145);
    ctx.lineTo(lx - 46, 145);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });

  // Kitchen Countertop spanning full lower stage
  const counterColor = settings.counterColor || '#d6c8b4';
  const topGrad = ctx.createLinearGradient(0, 445, 0, 560);
  topGrad.addColorStop(0, shadeColor(counterColor, 14));
  topGrad.addColorStop(1, shadeColor(counterColor, -18));
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 445, W, 120);

  // Counter front cabinetry
  const cabGrad = ctx.createLinearGradient(0, 565, 0, H);
  cabGrad.addColorStop(0, '#6a3822');
  cabGrad.addColorStop(1, '#3b1d10');
  ctx.fillStyle = cabGrad;
  ctx.fillRect(0, 565, W, H - 565);

  // Left Wooden Pastry Display Board (Workstation Zone 1)
  const db = BAKERY_WORKSTATIONS.displayBoard;
  ctx.save();
  const boardGrad = ctx.createLinearGradient(db.x, db.y, db.x + db.w, db.y + db.h);
  boardGrad.addColorStop(0, '#b4773e');
  boardGrad.addColorStop(1, '#7c4820');
  ctx.fillStyle = boardGrad;
  ctx.shadowColor = 'rgba(0,0,0,0.32)';
  ctx.shadowBlur = 10;
  roundRectPath(ctx, db.x, db.y + 8, db.w, db.h - 16, 14);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#d4a353';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // Center Rolling Pin Parchment Workstation (Workstation Zone 2)
  const rp = BAKERY_WORKSTATIONS.rollingPinZone;
  ctx.save();
  ctx.fillStyle = '#fef6e4';
  ctx.shadowColor = 'rgba(0,0,0,0.22)';
  ctx.shadowBlur = 8;
  roundRectPath(ctx, rp.x, rp.y + 10, rp.w, rp.h - 14, 8);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(180, 125, 70, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  if (settings.flourDusting !== false) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.beginPath();
    ctx.ellipse(rp.x + rp.w * 0.54, rp.y + 56, 112, 26, 0.08, 0, Math.PI * 2);
    ctx.fill();
  }
  // Wooden rolling pin resting at upper edge of parchment
  ctx.save();
  ctx.translate(rp.x + 115, rp.y + 22);
  ctx.rotate(-0.08);
  ctx.fillStyle = '#c2854d';
  roundRectPath(ctx, -65, -11, 130, 22, 8);
  ctx.fill();
  ctx.fillStyle = '#b91c1c';
  roundRectPath(ctx, -90, -6, 26, 12, 5);
  ctx.fill();
  roundRectPath(ctx, 64, -6, 26, 12, 5);
  ctx.fill();
  ctx.restore();
  ctx.restore();

  // Wire cooling rack on right counter (Workstation Zone 3)
  const cr = BAKERY_WORKSTATIONS.coolingRack;
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.14)';
  roundRectPath(ctx, cr.x + 4, cr.y + 12, cr.w - 8, cr.h - 14, 8);
  ctx.fill();
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 3.5;
  ctx.strokeRect(cr.x + 6, cr.y + 8, cr.w - 12, cr.h - 16);
  ctx.lineWidth = 2;
  for (let rx = cr.x + 28; rx < cr.x + cr.w - 12; rx += 22) {
    ctx.beginPath();
    ctx.moveTo(rx, cr.y + 8);
    ctx.lineTo(rx, cr.y + cr.h - 8);
    ctx.stroke();
  }
  ctx.strokeStyle = '#94a3b8';
  ctx.beginPath();
  ctx.moveTo(cr.x + 6, cr.y + cr.h * 0.5);
  ctx.lineTo(cr.x + cr.w - 6, cr.y + cr.h * 0.5);
  ctx.stroke();
  ctx.restore();
}

export function renderLevel7Scene(ctx, elapsed, settings) {
  const W = LOGICAL_WIDTH;
  const H = LOGICAL_HEIGHT;

  if (ASSETS.stableBg instanceof HTMLImageElement) {
    ctx.drawImage(ASSETS.stableBg, 0, 0, W, H);
    return;
  }

  // Starlit Arctic night sky visible through open timber stable arches
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 470);
  skyGrad.addColorStop(0, '#040c1a');
  skyGrad.addColorStop(0.6, '#0e2442');
  skyGrad.addColorStop(1, '#1d4068');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, H);

  if (settings.auroraSky !== false) {
    drawAuroraRibbon(ctx, elapsed, 0.55);
  }

  // Twinkling stars
  for (let i = 0; i < 40; i++) {
    const sx = (i * 113 + 30) % W;
    const sy = (i * 47 + 20) % 250;
    const tw = 0.35 + 0.65 * Math.abs(Math.sin(elapsed * 2 + i));
    ctx.fillStyle = `rgba(255,255,255,${tw})`;
    ctx.beginPath();
    ctx.arc(sx, sy, (i % 2) + 1.1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Distant snowy mountain ridge outside the open stable arches
  ctx.fillStyle = '#142c49';
  ctx.beginPath();
  ctx.moveTo(0, 440);
  ctx.lineTo(190, 310);
  ctx.lineTo(390, 395);
  ctx.lineTo(620, 290);
  ctx.lineTo(860, 390);
  ctx.lineTo(1090, 305);
  ctx.lineTo(W, 415);
  ctx.lineTo(W, 505);
  ctx.lineTo(0, 505);
  ctx.closePath();
  ctx.fill();

  // Timber stable roof, arched stall headers & support beams
  const beamGrad = ctx.createLinearGradient(0, 0, 0, 120);
  beamGrad.addColorStop(0, '#361c10');
  beamGrad.addColorStop(1, '#5b331f');
  ctx.fillStyle = beamGrad;
  ctx.fillRect(0, 0, W, 62);
  [90, 465, 815, 1165].forEach((bx) => {
    ctx.fillStyle = '#4a2614';
    ctx.fillRect(bx, 50, 28, 480);
    ctx.fillStyle = '#d4a353';
    roundRectPath(ctx, bx - 4, 86, 36, 8, 3);
    ctx.fill();
  });

  // Decorative curved timber stall arches
  STABLE_REINDEER_FRAMES.forEach((rf) => {
    ctx.save();
    ctx.strokeStyle = '#5b331f';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(rf.cx - 170, 145);
    ctx.quadraticCurveTo(rf.cx, 54, rf.cx + 170, 145);
    ctx.stroke();
    ctx.restore();
  });

  // Stable straw & wooden plank floor
  const floorGrad = ctx.createLinearGradient(0, 500, 0, H);
  floorGrad.addColorStop(0, '#4f2c1a');
  floorGrad.addColorStop(1, '#26130a');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, 500, W, H - 500);

  // Golden straw tufts along stall floors
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 2;
  for (let i = 0; i < 36; i++) {
    const sx = 125 + ((i * 31) % 1030);
    const sy = 505 + (i % 4) * 5;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx - 10, sy - 7);
    ctx.moveTo(sx + 4, sy);
    ctx.lineTo(sx + 13, sy - 6);
    ctx.stroke();
  }

  // Wooden stall dividers, brass nameplates & high-fidelity reindeer
  STABLE_REINDEER_FRAMES.forEach((rf) => {
    ctx.save();
    ctx.fillStyle = '#6f3e24';
    roundRectPath(ctx, rf.cx - 140, 475, 280, 48, 6);
    ctx.fill();
    ctx.fillStyle = '#d4a353';
    roundRectPath(ctx, rf.cx - 56, 486, 112, 26, 5);
    ctx.fill();
    ctx.fillStyle = '#29170a';
    ctx.font = '700 14px "Fraunces", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(rf.name, rf.cx, 499);

    // Draw detailed layered reindeer anatomy
    drawStableReindeerFrame(ctx, rf.cx, rf.cy, rf.redNose, elapsed);
    ctx.restore();
  });

  // Hanging warm lanterns between stalls
  if (settings.stableLanterns !== false) {
    [295, 640, 985].forEach((lx) => {
      ctx.save();
      ctx.translate(lx, 108);
      drawLanternItem(ctx, 46, 62, elapsed);
      ctx.restore();
    });
  }
}

function drawStableReindeerFrame(ctx, cx, cy, redNose, elapsed) {
  ctx.save();
  ctx.translate(cx, cy);

  // Soft ground stall shadow under hooves
  ctx.fillStyle = 'rgba(0, 0, 0, 0.34)';
  ctx.beginPath();
  ctx.ellipse(-4, 86, 68, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Far-side legs (darker chestnut depth layer)
  const drawLeg = (hipX, hipY, kneeX, kneeY, hoofX, hoofY, dark) => {
    ctx.strokeStyle = dark ? '#4b2912' : '#7a4926';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(hipX, hipY);
    ctx.lineTo(kneeX, kneeY);
    ctx.lineTo(hoofX, hoofY);
    ctx.stroke();

    // Articulated hoof
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.moveTo(hoofX - 6, hoofY - 2);
    ctx.lineTo(hoofX + 8, hoofY - 2);
    ctx.lineTo(hoofX + 10, hoofY + 7);
    ctx.lineTo(hoofX - 7, hoofY + 7);
    ctx.closePath();
    ctx.fill();
  };

  drawLeg(-44, 18, -54, 52, -50, 82, true);
  drawLeg(28, 18, 26, 52, 24, 82, true);

  // Fluffy cream-tipped tail
  ctx.fillStyle = '#6f3e1d';
  ctx.beginPath();
  ctx.ellipse(-74, -10, 12, 7, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f5e6cf';
  ctx.beginPath();
  ctx.arc(-80, -14, 5.5, 0, Math.PI * 2);
  ctx.fill();

  // Muscular layered barrel body with warm rim lighting
  const coatGrad = ctx.createRadialGradient(-16, -12, 10, -4, 4, 82);
  coatGrad.addColorStop(0, '#b5784c');
  coatGrad.addColorStop(0.55, '#8b532b');
  coatGrad.addColorStop(1, '#4f2a10');
  ctx.fillStyle = coatGrad;
  ctx.beginPath();
  ctx.moveTo(-66, -10);
  ctx.bezierCurveTo(-68, -36, 4, -36, 48, -16);
  ctx.bezierCurveTo(66, -6, 66, 28, 38, 34);
  ctx.bezierCurveTo(4, 42, -56, 36, -66, 14);
  ctx.closePath();
  ctx.fill();

  // Cream underbelly shading
  ctx.fillStyle = 'rgba(245, 226, 198, 0.35)';
  ctx.beginPath();
  ctx.ellipse(-8, 28, 42, 10, 0, 0, Math.PI);
  ctx.fill();

  // Near-side front & hind legs
  drawLeg(-28, 20, -34, 54, -26, 84, false);
  drawLeg(44, 20, 48, 52, 54, 84, false);

  // Sculpted arched neck & proud plush chest ruff
  const neckGrad = ctx.createLinearGradient(32, -8, 80, -76);
  neckGrad.addColorStop(0, '#7f4821');
  neckGrad.addColorStop(0.5, '#a3683e');
  neckGrad.addColorStop(1, '#7a4520');
  ctx.fillStyle = neckGrad;
  ctx.beginPath();
  ctx.moveTo(28, -12);
  ctx.quadraticCurveTo(48, -56, 62, -82);
  ctx.lineTo(86, -72);
  ctx.quadraticCurveTo(72, -24, 58, 12);
  ctx.closePath();
  ctx.fill();

  // Cream chest mane / ruff
  ctx.fillStyle = '#f3e3cc';
  ctx.beginPath();
  ctx.moveTo(52, -26);
  ctx.quadraticCurveTo(72, -10, 62, 12);
  ctx.quadraticCurveTo(48, 22, 42, 6);
  ctx.quadraticCurveTo(44, -12, 52, -26);
  ctx.fill();

  // Far ear & sculpted head
  ctx.fillStyle = '#5c3114';
  ctx.beginPath();
  ctx.ellipse(58, -88, 7, 15, -0.55, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#9c6239';
  ctx.beginPath();
  ctx.ellipse(82, -76, 25, 16, 0.22, 0, Math.PI * 2);
  ctx.fill();

  // Soft cream muzzle contour
  ctx.fillStyle = '#dfc3a4';
  ctx.beginPath();
  ctx.ellipse(97, -71, 11, 9, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Near ear with pink inner shell
  ctx.fillStyle = '#8b532b';
  ctx.beginPath();
  ctx.ellipse(65, -88, 7, 15, -0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e7b59e';
  ctx.beginPath();
  ctx.ellipse(65, -88, 3.5, 9, -0.45, 0, Math.PI * 2);
  ctx.fill();

  // Expressive dark eye with white catchlight
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(78, -81, 3.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(79.2, -82.2, 1.3, 0, Math.PI * 2);
  ctx.fill();

  // Nose (Rudolph pulsing radial glow or glossy dark nose)
  if (redNose) {
    const glow = 0.72 + 0.28 * Math.sin(elapsed * 4.2);
    const halo = ctx.createRadialGradient(106, -72, 2, 106, -72, 26);
    halo.addColorStop(0, `rgba(254, 202, 202, ${0.85 * glow})`);
    halo.addColorStop(0.45, `rgba(239, 68, 68, ${0.55 * glow})`);
    halo.addColorStop(1, 'rgba(239, 68, 68, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(106, -72, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ef4444';
  } else {
    ctx.fillStyle = '#29170c';
  }
  ctx.beginPath();
  ctx.arc(106, -72, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.beginPath();
  ctx.arc(104.5, -74, 2, 0, Math.PI * 2);
  ctx.fill();

  // Multi-tined curved ivory/bone antlers (back + front pairs)
  const drawAntler = (ox, oy, tint, scaleX = 1) => {
    ctx.save();
    ctx.translate(ox, oy);
    ctx.scale(scaleX, 1);
    ctx.strokeStyle = tint;
    ctx.lineCap = 'round';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-12, -18, -22, -36, -18, -54);
    ctx.stroke();

    ctx.lineWidth = 3.2;
    ctx.beginPath();
    // Brow tine
    ctx.moveTo(-6, -12);
    ctx.quadraticCurveTo(6, -18, 12, -28);
    // Mid tine
    ctx.moveTo(-14, -26);
    ctx.quadraticCurveTo(2, -34, 8, -46);
    // Crown fork
    ctx.moveTo(-17, -40);
    ctx.lineTo(-30, -48);
    ctx.moveTo(-18, -46);
    ctx.lineTo(-10, -58);
    ctx.stroke();
    ctx.restore();
  };
  drawAntler(66, -90, '#b5a080', 0.92);
  drawAntler(74, -89, '#e7d8be', 1);

  ctx.restore();
}

export function renderLevel8Scene(ctx, elapsed, settings, snowParticles) {
  const W = LOGICAL_WIDTH;
  const H = LOGICAL_HEIGHT;

  if (ASSETS.townSquareBg instanceof HTMLImageElement) {
    ctx.drawImage(ASSETS.townSquareBg, 0, 0, W, H);
    return;
  }

  // Winter evening sky
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 480);
  skyGrad.addColorStop(0, '#091529');
  skyGrad.addColorStop(0.65, '#19355c');
  skyGrad.addColorStop(1, '#2b4d78');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, 480);

  // Snowy Cobblestone Square Ground
  const groundGrad = ctx.createLinearGradient(0, 470, 0, H);
  groundGrad.addColorStop(0, '#9fb6cc');
  groundGrad.addColorStop(0.25, '#64748b');
  groundGrad.addColorStop(1, '#334155');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, 470, W, H - 470);

  // Cobblestone grid texture
  ctx.strokeStyle = 'rgba(226, 232, 240, 0.22)';
  ctx.lineWidth = 1.5;
  for (let y = 505; y < H; y += 28) {
    const off = (Math.floor(y / 28) % 2) * 32;
    for (let x = -off; x < W; x += 64) {
      roundRectPath(ctx, x + 3, y + 3, 58, 22, 8);
      ctx.stroke();
    }
  }

  // Left & Right Victorian Shops with configurable display window interior glow
  const winGlowCol = settings.windowGlowColor || '#fde047';
  const winGlowAmt = (settings.windowGlowIntensity ?? 85) / 100;
  drawTownShop(ctx, 48, 175, 340, 320, '#7f1d1d', winGlowCol, winGlowAmt, 'BAKERY');
  drawTownShop(ctx, 892, 175, 340, 320, '#1e3a5f', winGlowCol, winGlowAmt, 'TOYS');

  // Large Public Town Square Tree in center
  ctx.save();
  ctx.translate(640, 465);
  ctx.fillStyle = '#4a2c1a';
  ctx.fillRect(-24, -40, 48, 70);
  const tiers = [
    { topY: -365, botY: -225, hw: 86 },
    { topY: -275, botY: -120, hw: 130 },
    { topY: -185, botY: -20, hw: 175 }
  ];
  tiers.forEach((t) => {
    const g = ctx.createRadialGradient(-20, t.topY + 45, 10, 0, (t.topY + t.botY) * 0.5, t.hw);
    g.addColorStop(0, '#2d7a53');
    g.addColorStop(1, '#0d3320');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, t.topY);
    ctx.lineTo(t.hw, t.botY);
    ctx.lineTo(-t.hw, t.botY);
    ctx.closePath();
    ctx.fill();
  });
  // Glowing town tree star & lights
  if (settings.townTreeLights !== false) {
    ctx.save();
    ctx.translate(0, -372);
    drawGoldStarTopper(ctx, 24, elapsed);
    ctx.restore();
    const lColors = settings.lightColors || ['#fde047', '#f87171', '#38bdf8', '#4ade80'];
    for (let i = 0; i < 20; i++) {
      const ly = -320 + i * 14.5;
      const spread = (ly + 350) * 0.42;
      const lx = Math.sin(i * 1.9) * spread;
      const col = lColors[i % lColors.length];
      ctx.shadowColor = col;
      ctx.shadowBlur = 12;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(lx, ly, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // Interactive Streetlamps (tap to toggle intensity 0/1/2!)
  const intensities = settings.streetlampIntensities || [2, 2, 2];
  TOWN_STREETLAMP_HITBOXES.forEach((lamp, idx) => {
    drawTownStreetlamp(ctx, lamp.lampX, lamp.lampY, 225, intensities[idx] ?? 2, elapsed);
  });

  if (snowParticles && settings.showSnow !== false) {
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    for (let i = 0; i < snowParticles.length; i++) {
      const p = snowParticles[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawTownShop(ctx, x, y, w, h, wallColor, glowColor, glowAlpha, label) {
  ctx.save();
  const grad = ctx.createLinearGradient(x, y, x + w, y + h);
  grad.addColorStop(0, shadeColor(wallColor, 14));
  grad.addColorStop(1, shadeColor(wallColor, -24));
  ctx.fillStyle = grad;
  roundRectPath(ctx, x, y, w, h, 8);
  ctx.fill();

  // Snow-dusted roof eaves
  ctx.fillStyle = '#e2e8f0';
  roundRectPath(ctx, x - 12, y - 22, w + 24, 28, 10);
  ctx.fill();

  // Display window with configurable interior glow
  const winX = x + 32;
  const winY = y + 115;
  const winW = w - 64;
  const winH = 148;
  ctx.save();
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 32 * glowAlpha;
  const wg = ctx.createRadialGradient(winX + winW * 0.5, winY + winH * 0.5, 10, winX + winW * 0.5, winY + winH * 0.5, winW * 0.65);
  wg.addColorStop(0, '#ffffff');
  wg.addColorStop(0.55, glowColor);
  wg.addColorStop(1, shadeColor(glowColor, -42));
  ctx.globalAlpha = 0.35 + 0.65 * glowAlpha;
  ctx.fillStyle = wg;
  roundRectPath(ctx, winX, winY, winW, winH, 8);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = '#d4a353';
  ctx.lineWidth = 5;
  roundRectPath(ctx, winX, winY, winW, winH, 8);
  ctx.stroke();

  // Shop transom nameplate
  ctx.fillStyle = '#1e293b';
  roundRectPath(ctx, x + 55, y + 36, w - 110, 44, 6);
  ctx.fill();
  ctx.strokeStyle = '#d4a353';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#f5d07a';
  ctx.font = '700 18px "Fraunces", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + w * 0.5, y + 58);
  ctx.restore();
}

function drawTownStreetlamp(ctx, x, y, poleH, intensity, elapsed) {
  ctx.save();
  // Cast iron post
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(x - 5, y + 20, 10, poleH - 20);
  roundRectPath(ctx, x - 14, y + poleH - 18, 28, 20, 4);
  ctx.fill();

  // Lantern housing
  const glowMult = intensity === 2 ? 1.1 : intensity === 1 ? 0.55 : 0;
  if (glowMult > 0) {
    const pulse = 0.92 + 0.08 * Math.sin(elapsed * 4 + x);
    const halo = ctx.createRadialGradient(x, y, 4, x, y, 78 * glowMult * pulse);
    halo.addColorStop(0, `rgba(254, 240, 138, ${0.75 * glowMult})`);
    halo.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(x, y, 78 * glowMult, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = glowMult > 0 ? (intensity === 2 ? '#fef9c3' : '#fbbf24') : '#475569';
  roundRectPath(ctx, x - 14, y - 16, 28, 34, 6);
  ctx.fill();
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Cap
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.moveTo(x - 20, y - 16);
  ctx.lineTo(x, y - 34);
  ctx.lineTo(x + 20, y - 16);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function renderLevel9Scene(ctx, elapsed, settings) {
  const W = LOGICAL_WIDTH;
  const H = LOGICAL_HEIGHT;

  if (ASSETS.launchpadBg instanceof HTMLImageElement) {
    ctx.drawImage(ASSETS.launchpadBg, 0, 0, W, H);
    return;
  }

  // Deep starlit North Pole night sky
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 440);
  skyGrad.addColorStop(0, '#040917');
  skyGrad.addColorStop(0.65, '#0f2142');
  skyGrad.addColorStop(1, '#1e3a5f');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, 440);

  drawAuroraRibbon(ctx, elapsed, settings.stardustBoost ? 0.95 : 0.45);

  for (let i = 0; i < 48; i++) {
    const sx = (i * 137 + 19) % W;
    const sy = (i * 59 + 14) % 320;
    const tw = 0.4 + 0.6 * Math.abs(Math.sin(elapsed * 2.5 + i));
    ctx.fillStyle = `rgba(255,255,255,${tw})`;
    ctx.beginPath();
    ctx.arc(sx, sy, (i % 2) + 1.1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Snowy horizon & icy runway apron
  const snowGrad = ctx.createLinearGradient(0, 420, 0, H);
  snowGrad.addColorStop(0, '#cfe0f2');
  snowGrad.addColorStop(1, '#7999bd');
  ctx.fillStyle = snowGrad;
  ctx.fillRect(0, 420, W, H - 420);

  // Perspective launchpad runway strip
  const runwayGrad = ctx.createLinearGradient(640, 420, 640, H);
  runwayGrad.addColorStop(0, '#334155');
  runwayGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = runwayGrad;
  ctx.beginPath();
  ctx.moveTo(495, 420);
  ctx.lineTo(785, 420);
  ctx.lineTo(1080, H);
  ctx.lineTo(200, H);
  ctx.closePath();
  ctx.fill();

  // Animated runway chase beacon lights
  if (settings.runwayLights !== false) {
    const colors = settings.lightColors || ['#38bdf8', '#fde047', '#f87171', '#4ade80'];
    const steps = 10;
    const activeChase = Math.floor(elapsed * 6) % steps;
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const y = 435 + t * (H - 455);
      const leftX = 485 - t * 265;
      const rightX = 795 + t * 265;
      const bright = i === activeChase ? 1 : 0.45;
      const col = colors[i % colors.length];
      ctx.save();
      ctx.shadowColor = col;
      ctx.shadowBlur = 16 * bright;
      ctx.fillStyle = col;
      ctx.globalAlpha = bright;
      ctx.beginPath();
      ctx.arc(leftX, y, 5 + t * 4, 0, Math.PI * 2);
      ctx.arc(rightX, y, 5 + t * 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Candy-cane Control Tower tucked left to frame the grand sleigh
  ctx.save();
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(48, 195, 36, 235);
  ctx.fillStyle = '#dc2626';
  for (let sy = 210; sy < 420; sy += 34) {
    ctx.fillRect(48, sy, 36, 16);
  }
  ctx.fillStyle = '#1e293b';
  roundRectPath(ctx, 28, 142, 76, 54, 8);
  ctx.fill();
  ctx.fillStyle = '#fde047';
  roundRectPath(ctx, 36, 155, 60, 24, 4);
  ctx.fill();
  ctx.restore();

  // Doubled Grand Luxury Sleigh Centerpiece (~850px wide)
  drawLuxurySleighChassis(ctx, 545, 430, elapsed);

  // Interactive Harness Bells hanging on lead traces (tap to ring!)
  ctx.save();
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(935, 405);
  ctx.quadraticCurveTo(1045, 378, 1185, 425);
  ctx.stroke();
  ctx.strokeStyle = '#d4a353';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(935, 412);
  ctx.quadraticCurveTo(1045, 386, 1185, 432);
  ctx.stroke();

  ctx.translate(LAUNCHPAD_BELL_HITBOX.cx, LAUNCHPAD_BELL_HITBOX.cy);
  drawHarnessBellsItem(ctx, 122, 82, elapsed, settings.bellJingleTimer || 0);
  ctx.restore();
}

function drawLuxurySleighChassis(ctx, cx, cy, elapsed) {
  ctx.save();
  ctx.translate(cx, cy);

  // Soft elliptical snow ground shadow aligned directly beneath the runner footprint
  const shadowGrad = ctx.createRadialGradient(85, 148, 35, 85, 148, 380);
  shadowGrad.addColorStop(0, 'rgba(8, 15, 30, 0.54)');
  shadowGrad.addColorStop(0.7, 'rgba(15, 23, 42, 0.26)');
  shadowGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(85, 148, 375, 30, 0, 0, Math.PI * 2);
  ctx.fill();

  // Subtle far-side front runner curl only (tucked cleanly behind the front bow, never sticking out rear-left)
  ctx.save();
  ctx.strokeStyle = '#7c531b';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(265, 122);
  ctx.bezierCurveTo(368, 122, 410, 44, 374, -8);
  ctx.stroke();
  ctx.restore();

  // Cushioned tufted burgundy-velvet interior backrest & rolled seat bolster
  const velvetGrad = ctx.createLinearGradient(-220, -165, 80, 20);
  velvetGrad.addColorStop(0, '#991b1b');
  velvetGrad.addColorStop(0.55, '#6b1212');
  velvetGrad.addColorStop(1, '#3b0707');
  ctx.fillStyle = velvetGrad;
  ctx.beginPath();
  ctx.moveTo(-288, -142);
  ctx.bezierCurveTo(-212, -168, -138, -104, -102, -32);
  ctx.lineTo(84, -32);
  ctx.lineTo(68, 12);
  ctx.lineTo(-225, 12);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#f5d07a';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Quilted diamond upholstery stitch lines clipped to velvet backrest
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = 'rgba(245, 208, 122, 0.24)';
  ctx.lineWidth = 2;
  for (let i = -300; i <= 100; i += 36) {
    ctx.beginPath();
    ctx.moveTo(i, -160);
    ctx.lineTo(i + 120, 20);
    ctx.moveTo(i + 120, -160);
    ctx.lineTo(i, 20);
    ctx.stroke();
  }
  ctx.restore();

  // Rolled cushioned seat bolster & brass tuft studs
  const bolsterGrad = ctx.createLinearGradient(-150, -34, -150, 8);
  bolsterGrad.addColorStop(0, '#b91c1c');
  bolsterGrad.addColorStop(0.6, '#7f1d1d');
  bolsterGrad.addColorStop(1, '#450a0a');
  ctx.fillStyle = bolsterGrad;
  roundRectPath(ctx, -172, -30, 232, 42, 18);
  ctx.fill();
  ctx.strokeStyle = '#f5d07a';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = '#fef08a';
  [
    [-218, -104],
    [-184, -84],
    [-152, -62],
    [-132, -10],
    [-64, -10],
    [4, -10]
  ].forEach(([tx, ty]) => {
    ctx.beginPath();
    ctx.arc(tx, ty, 3.8, 0, Math.PI * 2);
    ctx.fill();
  });

  // Seamless Curved Golden Runner & Supporting S-Struts (drawn before hull so upper joints tuck cleanly inside)
  // Struts start strictly inside the crimson hull contour and weld directly onto the golden runner
  const struts = [
    { topX: -222, topY: 54, botX: -244, botY: 120, c1x: -242, c1y: 78, c2x: -248, c2y: 102 },
    { topX: -140, topY: 88, botX: -156, botY: 144, c1x: -158, c1y: 106, c2x: -140, c2y: 128 },
    { topX: -42, topY: 106, botX: -46, botY: 144, c1x: -58, c1y: 120, c2x: -32, c2y: 132 },
    { topX: 72, topY: 108, botX: 72, botY: 144, c1x: 56, c1y: 122, c2x: 88, c2y: 132 },
    { topX: 186, topY: 108, botX: 190, botY: 144, c1x: 174, c1y: 122, c2x: 204, c2y: 132 },
    { topX: 298, topY: 96, botX: 336, botY: 134, c1x: 318, c1y: 106, c2x: 326, c2y: 126 }
  ];

  ctx.lineCap = 'round';
  struts.forEach((st) => {
    ctx.strokeStyle = '#784e16';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(st.topX, st.topY);
    ctx.bezierCurveTo(st.c1x, st.c1y, st.c2x, st.c2y, st.botX, st.botY);
    ctx.stroke();

    ctx.strokeStyle = '#d4a353';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(st.topX, st.topY);
    ctx.bezierCurveTo(st.c1x, st.c1y, st.c2x, st.c2y, st.botX, st.botY);
    ctx.stroke();

    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(st.topX, st.topY);
    ctx.bezierCurveTo(st.c1x, st.c1y, st.c2x, st.c2y, st.botX, st.botY);
    ctx.stroke();
  });

  // Main Curved Golden Runner (upturned rear heel curl at (-248, 114) smoothly hugging stern -> front swan-neck prow)
  ctx.strokeStyle = '#784e16';
  ctx.lineWidth = 20;
  ctx.beginPath();
  ctx.moveTo(-248, 114);
  ctx.quadraticCurveTo(-244, 144, -196, 144);
  ctx.lineTo(286, 144);
  ctx.bezierCurveTo(404, 144, 456, 48, 396, -8);
  ctx.bezierCurveTo(372, -26, 344, -10, 360, 18);
  ctx.stroke();

  const runnerGrad = ctx.createLinearGradient(-250, 112, 420, 148);
  runnerGrad.addColorStop(0, '#b4832e');
  runnerGrad.addColorStop(0.32, '#fef08a');
  runnerGrad.addColorStop(0.66, '#d4a353');
  runnerGrad.addColorStop(1, '#fef08a');
  ctx.strokeStyle = runnerGrad;
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(-248, 114);
  ctx.quadraticCurveTo(-244, 144, -196, 144);
  ctx.lineTo(286, 144);
  ctx.bezierCurveTo(404, 144, 456, 48, 396, -8);
  ctx.bezierCurveTo(372, -26, 344, -10, 360, 18);
  ctx.stroke();

  // Specular glint line along runner
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-238, 114);
  ctx.quadraticCurveTo(-234, 139, -194, 139);
  ctx.lineTo(282, 139);
  ctx.stroke();

  // Small brass heel finial cap & runner joint rivets
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(-248, 114, 7, 0, Math.PI * 2);
  ctx.fill();
  struts.forEach((st) => {
    ctx.fillStyle = '#926727';
    ctx.beginPath();
    ctx.arc(st.botX, st.botY, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(st.botX, st.botY, 2.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Grand Ornate Crimson Lacquer Sleigh Hull
  ctx.beginPath();
  ctx.moveTo(-355, -108);
  ctx.bezierCurveTo(-300, 74, -180, 114, 10, 114);
  ctx.lineTo(256, 114);
  ctx.bezierCurveTo(368, 114, 428, 20, 406, -56);
  ctx.bezierCurveTo(336, -88, 256, -54, 218, -6);
  ctx.lineTo(-36, -6);
  ctx.bezierCurveTo(-144, -6, -206, -156, -322, -182);
  ctx.bezierCurveTo(-378, -190, -376, -138, -355, -108);
  ctx.closePath();

  const hullGrad = ctx.createLinearGradient(-340, -175, 360, 120);
  hullGrad.addColorStop(0, '#ef4444');
  hullGrad.addColorStop(0.28, '#b91c1c');
  hullGrad.addColorStop(0.68, '#7f1d1d');
  hullGrad.addColorStop(1, '#3b0707');
  ctx.fillStyle = hullGrad;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Recessed side-panel depth molding & bottom ambient shading inside hull
  ctx.save();
  ctx.clip();
  const bellyShade = ctx.createLinearGradient(0, 20, 0, 120);
  bellyShade.addColorStop(0, 'rgba(0,0,0,0)');
  bellyShade.addColorStop(1, 'rgba(15, 4, 4, 0.52)');
  ctx.fillStyle = bellyShade;
  ctx.fillRect(-400, 15, 840, 115);

  // Sunken ornamental crimson inset panel
  ctx.fillStyle = 'rgba(69, 10, 10, 0.42)';
  ctx.beginPath();
  ctx.moveTo(-292, -32);
  ctx.bezierCurveTo(-238, 60, -148, 84, 16, 84);
  ctx.lineTo(226, 84);
  ctx.bezierCurveTo(308, 84, 344, 28, 326, -12);
  ctx.bezierCurveTo(282, -22, 240, 20, 185, 22);
  ctx.lineTo(-42, 22);
  ctx.bezierCurveTo(-136, 22, -214, -56, -292, -32);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(245, 208, 122, 0.55)';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Glossy specular upper lacquer highlight ribbon
  ctx.strokeStyle = 'rgba(255, 248, 232, 0.24)';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(-308, -162);
  ctx.bezierCurveTo(-194, -140, -140, -20, -34, -18);
  ctx.lineTo(222, -18);
  ctx.stroke();
  ctx.restore();

  // Ornate gilded side filigree & acanthus scroll flourishes
  ctx.strokeStyle = '#f5d07a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-272, 20);
  ctx.bezierCurveTo(-138, 92, 98, 88, 288, 24);
  ctx.moveTo(-192, 48);
  ctx.bezierCurveTo(-138, 10, -88, 12, -62, 46);
  ctx.moveTo(-128, 42);
  ctx.arc(-112, 34, 14, Math.PI, 0);
  ctx.moveTo(118, 52);
  ctx.bezierCurveTo(166, 10, 224, 12, 260, 40);
  ctx.moveTo(174, 36);
  ctx.arc(190, 32, 13, 0, Math.PI);
  ctx.stroke();

  // Golden crest medallion at center flank
  ctx.fillStyle = '#d4a353';
  ctx.beginPath();
  ctx.arc(28, 48, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(28, 48, 7, 0, Math.PI * 2);
  ctx.fill();

  // Heavy outer gilded brass gunwale rail border
  ctx.strokeStyle = '#f5d07a';
  ctx.lineWidth = 7.5;
  ctx.beginPath();
  ctx.moveTo(-355, -108);
  ctx.bezierCurveTo(-300, 74, -180, 114, 10, 114);
  ctx.lineTo(256, 114);
  ctx.bezierCurveTo(368, 114, 428, 20, 406, -56);
  ctx.bezierCurveTo(336, -88, 256, -54, 218, -6);
  ctx.lineTo(-36, -6);
  ctx.bezierCurveTo(-144, -6, -206, -156, -322, -182);
  ctx.bezierCurveTo(-378, -190, -376, -138, -355, -108);
  ctx.closePath();
  ctx.stroke();

  // Front Brass Coach Headlamp with animated warm beam
  const lx = 384;
  const ly = -56;
  const beamPulse = 0.8 + 0.2 * Math.sin(elapsed * 4.5);
  const beam = ctx.createRadialGradient(lx + 18, ly, 6, lx + 82, ly, 125);
  beam.addColorStop(0, `rgba(254, 249, 195, ${0.78 * beamPulse})`);
  beam.addColorStop(0.5, `rgba(253, 224, 71, ${0.26 * beamPulse})`);
  beam.addColorStop(1, 'rgba(254, 249, 195, 0)');
  ctx.fillStyle = beam;
  ctx.beginPath();
  ctx.arc(lx + 42, ly, 115, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#926727';
  roundRectPath(ctx, lx - 18, ly - 16, 30, 32, 6);
  ctx.fill();
  ctx.fillStyle = '#d4a353';
  roundRectPath(ctx, lx - 14, ly - 12, 24, 24, 5);
  ctx.fill();
  ctx.fillStyle = '#fef9c3';
  ctx.beginPath();
  ctx.arc(lx + 12, ly, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function renderLevel10Scene(ctx, elapsed, settings) {
  const W = LOGICAL_WIDTH;
  const H = LOGICAL_HEIGHT;

  if (ASSETS.wrappingBg instanceof HTMLImageElement) {
    ctx.drawImage(ASSETS.wrappingBg, 0, 0, W, H);
    return;
  }

  // Overhead oak planked workbench surface
  const tableGrad = ctx.createRadialGradient(640, 350, 80, 640, 360, 780);
  tableGrad.addColorStop(0, '#85502e');
  tableGrad.addColorStop(0.6, '#5c341d');
  tableGrad.addColorStop(1, '#2b150a');
  ctx.fillStyle = tableGrad;
  ctx.fillRect(0, 0, W, H);

  // Horizontal wooden plank seams + subtle wood grain
  for (let y = 0; y < H; y += 90) {
    ctx.fillStyle = 'rgba(18, 7, 2, 0.34)';
    ctx.fillRect(0, y, W, 3);
    ctx.fillStyle = 'rgba(255, 224, 185, 0.05)';
    ctx.fillRect(0, y + 3, W, 2);
  }
  ctx.strokeStyle = 'rgba(20, 8, 2, 0.22)';
  ctx.lineWidth = 1.8;
  for (let y = 26; y < H; y += 45) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(420, y + 7, 860, y - 7, W, y);
    ctx.stroke();
  }

  // Green Self-Healing Cutting Mat in center with beveled shadow
  const matX = 240;
  const matY = 95;
  const matW = 800;
  const matH = 530;
  ctx.save();
  const matGrad = ctx.createLinearGradient(matX, matY, matX + matW, matY + matH);
  matGrad.addColorStop(0, '#1b5b43');
  matGrad.addColorStop(1, '#0d3425');
  ctx.fillStyle = matGrad;
  ctx.shadowColor = 'rgba(0,0,0,0.52)';
  ctx.shadowBlur = 22;
  ctx.shadowOffsetY = 8;
  roundRectPath(ctx, matX, matY, matW, matH, 14);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Measurement grid, ruler ticks & 45-degree fold guides on cutting mat
  ctx.strokeStyle = 'rgba(246, 239, 226, 0.16)';
  ctx.lineWidth = 1;
  for (let gx = matX + 40; gx < matX + matW; gx += 40) {
    ctx.beginPath();
    ctx.moveTo(gx, matY + 14);
    ctx.lineTo(gx, matY + matH - 14);
    ctx.stroke();
  }
  for (let gy = matY + 40; gy < matY + matH; gy += 40) {
    ctx.beginPath();
    ctx.moveTo(matX + 14, gy);
    ctx.lineTo(matX + matW - 14, gy);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(246, 239, 226, 0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(matX + 14, matY + 14, matW - 28, matH - 28);
  ctx.fillStyle = 'rgba(246, 239, 226, 0.45)';
  ctx.font = '600 10px "JetBrains Mono", monospace';
  ctx.fillText('18 x 12 IN · GIFT CUTTING MAT', matX + 26, matY + 32);
  ctx.restore();

  // Left Craft Margin: Wooden Ribbon Spools
  [
    { x: 112, y: 158, col: '#dc2626' },
    { x: 112, y: 274, col: '#d4a353' },
    { x: 112, y: 390, col: '#15803d' }
  ].forEach((sp) => {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#a16207';
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = sp.col;
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, 29, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3b1d0e';
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Scattered Crafting Tools (Brass Scissors, Baker's Twine & Red Wax Stamp)
  ctx.save();
  ctx.translate(108, 520);
  ctx.rotate(-0.42);
  ctx.shadowColor = 'rgba(0,0,0,0.42)';
  ctx.shadowBlur = 8;
  // Brass shears blades
  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.moveTo(-6, 0);
  ctx.lineTo(54, -8);
  ctx.lineTo(6, 7);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-6, 0);
  ctx.lineTo(52, 12);
  ctx.lineTo(4, -5);
  ctx.closePath();
  ctx.fill();
  // Gold handle loops
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#d4a353';
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.ellipse(-22, -12, 14, 9, 0.1, 0, Math.PI * 2);
  ctx.ellipse(-22, 12, 14, 9, -0.1, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Brass tape dispenser & wax seal stamp at lower-left table
  ctx.save();
  ctx.fillStyle = '#78350f';
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 8;
  roundRectPath(ctx, 48, 580, 62, 34, 8);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#fef3c7';
  ctx.beginPath();
  ctx.arc(72, 594, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#b91c1c';
  ctx.beginPath();
  ctx.arc(154, 598, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#d4a353';
  roundRectPath(ctx, 147, 566, 14, 24, 5);
  ctx.fill();
  ctx.restore();

  // Right Staging Mat: Clear 3D Unboxed / Ready-to-Wrap Gift Parcels (Cube, Cylinder, Plush)
  ctx.save();
  ctx.fillStyle = 'rgba(246, 239, 226, 0.08)';
  ctx.strokeStyle = 'rgba(212, 163, 83, 0.35)';
  ctx.lineWidth = 1.5;
  roundRectPath(ctx, 1068, 118, 174, 485, 14);
  ctx.fill();
  ctx.stroke();

  ctx.save();
  ctx.translate(1155, 200);
  ctx.scale(0.62, 0.62);
  drawWrappedGiftComposite(ctx, { cx: 0, cy: 0, shape: 'square', paperColor: '#d6bfa3', ribbonColor: '#b91c1c' });
  ctx.restore();

  ctx.save();
  ctx.translate(1155, 360);
  ctx.scale(0.6, 0.6);
  drawWrappedGiftComposite(ctx, { cx: 0, cy: 0, shape: 'cylinder', paperColor: '#cbd5e1', ribbonColor: '#15803d' });
  ctx.restore();

  ctx.save();
  ctx.translate(1155, 520);
  ctx.scale(0.6, 0.6);
  drawWrappedGiftComposite(ctx, { cx: 0, cy: 0, shape: 'plush', paperColor: '#e2c9a6', ribbonColor: '#d4a353' });
  ctx.restore();
  ctx.restore();

  // Atmospheric Overhead Brass Down-Lighting & Cozy Vignette Shadows
  if (settings.tableGlow !== false) {
    const pulse = 0.94 + 0.06 * Math.sin(elapsed * 2);
    [430, 850].forEach((lx) => {
      const pool = ctx.createRadialGradient(lx, 290, 20, lx, 330, 340);
      pool.addColorStop(0, `rgba(254, 243, 199, ${0.18 * pulse})`);
      pool.addColorStop(0.6, `rgba(253, 224, 71, ${0.06 * pulse})`);
      pool.addColorStop(1, 'rgba(254, 243, 199, 0)');
      ctx.fillStyle = pool;
      ctx.fillRect(0, 0, W, H);
    });
  }
  const vig = ctx.createRadialGradient(640, 360, 420, 640, 360, 820);
  vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vig.addColorStop(1, 'rgba(10, 5, 2, 0.42)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
}

export function renderLevel11Scene(ctx, elapsed, settings, snowParticles) {
  const W = LOGICAL_WIDTH;
  const H = LOGICAL_HEIGHT;

  if (ASSETS.dioramaBg instanceof HTMLImageElement) {
    ctx.drawImage(ASSETS.dioramaBg, 0, 0, W, H);
    return;
  }

  const weather = settings.weatherMode || 'snow';

  // Arctic horizon sky
  const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
  skyGrad.addColorStop(0, weather === 'aurora' ? '#04121f' : '#08172b');
  skyGrad.addColorStop(0.55, '#132f52');
  skyGrad.addColorStop(1, '#1e4268');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, H);

  if (weather === 'aurora') {
    drawAuroraRibbon(ctx, elapsed, 1.0);
  }

  // Starlight backdrop
  for (let i = 0; i < 40; i++) {
    const sx = (i * 127 + 25) % W;
    const sy = (i * 41 + 14) % 190;
    const tw = 0.35 + 0.65 * Math.abs(Math.sin(elapsed * 2.2 + i));
    ctx.fillStyle = `rgba(255,255,255,${tw})`;
    ctx.beginPath();
    ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Centered 14x14 Isometric Landscape Base Slab
  const right = IsometricGrid.toScreen(IsometricGrid.cols - 1, 0);
  const bottom = IsometricGrid.toScreen(IsometricGrid.cols - 1, IsometricGrid.rows - 1);
  const left = IsometricGrid.toScreen(0, IsometricGrid.rows - 1);

  const hw = IsometricGrid.tileW * 0.5;
  const hh = IsometricGrid.tileH * 0.5;

  // 3D-shaded cliff base slab underneath isometric board
  ctx.save();
  const leftCliff = ctx.createLinearGradient(left.x - hw, left.y, bottom.x, bottom.y + hh + 34);
  leftCliff.addColorStop(0, '#64748b');
  leftCliff.addColorStop(1, '#334155');
  ctx.fillStyle = leftCliff;
  ctx.beginPath();
  ctx.moveTo(left.x - hw, left.y);
  ctx.lineTo(bottom.x, bottom.y + hh);
  ctx.lineTo(bottom.x, bottom.y + hh + 32);
  ctx.lineTo(left.x - hw, left.y + 32);
  ctx.closePath();
  ctx.fill();

  const rightCliff = ctx.createLinearGradient(bottom.x, bottom.y + hh, right.x + hw, right.y + 32);
  rightCliff.addColorStop(0, '#334155');
  rightCliff.addColorStop(1, '#1e293b');
  ctx.fillStyle = rightCliff;
  ctx.beginPath();
  ctx.moveTo(bottom.x, bottom.y + hh);
  ctx.lineTo(right.x + hw, right.y);
  ctx.lineTo(right.x + hw, right.y + 32);
  ctx.lineTo(bottom.x, bottom.y + hh + 32);
  ctx.closePath();
  ctx.fill();

  // Snow crust overhang along front cliff edge
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.moveTo(left.x - hw, left.y);
  ctx.lineTo(bottom.x, bottom.y + hh);
  ctx.lineTo(bottom.x, bottom.y + hh + 7);
  ctx.lineTo(left.x - hw, left.y + 7);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.moveTo(bottom.x, bottom.y + hh);
  ctx.lineTo(right.x + hw, right.y);
  ctx.lineTo(right.x + hw, right.y + 7);
  ctx.lineTo(bottom.x, bottom.y + hh + 7);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 14x14 Isometric Tiles with 3D-shaded directional lighting gradients & beveled edges
  for (let r = 0; r < IsometricGrid.rows; r++) {
    for (let c = 0; c < IsometricGrid.cols; c++) {
      const pt = IsometricGrid.toScreen(c, r);
      const isPond = (c === 9 || c === 10) && (r === 7 || r === 8);
      const isPath = c === 6 || r === 6;

      ctx.beginPath();
      ctx.moveTo(pt.x, pt.y - hh);
      ctx.lineTo(pt.x + hw, pt.y);
      ctx.lineTo(pt.x, pt.y + hh);
      ctx.lineTo(pt.x - hw, pt.y);
      ctx.closePath();

      const tGrad = ctx.createLinearGradient(pt.x - hw * 0.65, pt.y - hh, pt.x + hw * 0.65, pt.y + hh);
      if (isPond) {
        tGrad.addColorStop(0, '#bae6fd');
        tGrad.addColorStop(0.55, '#7dd3fc');
        tGrad.addColorStop(1, '#0284c7');
      } else if (isPath) {
        tGrad.addColorStop(0, '#cbd5e1');
        tGrad.addColorStop(0.6, '#94a3b8');
        tGrad.addColorStop(1, '#64748b');
      } else if ((c + r) % 2 === 0) {
        tGrad.addColorStop(0, '#f8fbff');
        tGrad.addColorStop(0.6, '#e2edf8');
        tGrad.addColorStop(1, '#c3d6ea');
      } else {
        tGrad.addColorStop(0, '#eef5fc');
        tGrad.addColorStop(0.6, '#d6e4f2');
        tGrad.addColorStop(1, '#b6cbe0');
      }
      ctx.fillStyle = tGrad;
      ctx.fill();

      // Subtle 3D top-left rim highlight & bottom-right shadow bevel
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pt.x - hw, pt.y);
      ctx.lineTo(pt.x, pt.y - hh);
      ctx.lineTo(pt.x + hw, pt.y);
      ctx.stroke();

      if (settings.showIsoGrid !== false) {
        ctx.strokeStyle = 'rgba(30, 41, 59, 0.24)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y - hh);
        ctx.lineTo(pt.x + hw, pt.y);
        ctx.lineTo(pt.x, pt.y + hh);
        ctx.lineTo(pt.x - hw, pt.y);
        ctx.closePath();
        ctx.stroke();
      }
    }
  }

  // Animated Weather Snow Overlay
  if (snowParticles && (weather === 'snow' || weather === 'blizzard')) {
    ctx.save();
    ctx.fillStyle = weather === 'blizzard' ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.75)';
    for (let i = 0; i < snowParticles.length; i++) {
      const p = snowParticles[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawAuroraRibbon(ctx, elapsed, intensity = 0.7) {
  ctx.save();
  const shift = Math.sin(elapsed * 0.6) * 45;
  const grad = ctx.createLinearGradient(120, 20, 1120, 220);
  grad.addColorStop(0, `rgba(34, 211, 238, ${0.08 * intensity})`);
  grad.addColorStop(0.35, `rgba(74, 222, 128, ${0.32 * intensity})`);
  grad.addColorStop(0.65, `rgba(168, 85, 247, ${0.28 * intensity})`);
  grad.addColorStop(1, `rgba(34, 211, 238, ${0.06 * intensity})`);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(0, 120);
  ctx.bezierCurveTo(320, 40 + shift, 680, 180 - shift, LOGICAL_WIDTH, 70);
  ctx.lineTo(LOGICAL_WIDTH, 210);
  ctx.bezierCurveTo(720, 280 - shift, 340, 130 + shift, 0, 230);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/* ============================================================================
   LEVEL 5-11 PROCEDURAL INVENTORY ITEM RENDERERS
   ============================================================================ */

function drawWoodenTrainItem(ctx, w, h) {
  ctx.save();
  ctx.fillStyle = '#dc2626';
  roundRectPath(ctx, -w * 0.42, -h * 0.14, w * 0.68, h * 0.4, 6);
  ctx.fill();
  ctx.fillStyle = '#15803d';
  roundRectPath(ctx, -w * 0.36, -h * 0.42, w * 0.28, h * 0.28, 4);
  ctx.fill();
  ctx.fillStyle = '#d4a353';
  ctx.fillRect(w * 0.08, -h * 0.36, w * 0.12, h * 0.22);
  [-w * 0.24, 0, w * 0.22].forEach((wx) => {
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(wx, h * 0.28, w * 0.11, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function drawPlushBearItem(ctx, w, h) {
  ctx.save();
  const col = '#b45309';
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.arc(-w * 0.22, -h * 0.32, w * 0.12, 0, Math.PI * 2);
  ctx.arc(w * 0.22, -h * 0.32, w * 0.12, 0, Math.PI * 2);
  ctx.arc(0, -h * 0.18, w * 0.24, 0, Math.PI * 2);
  ctx.ellipse(0, h * 0.16, w * 0.28, h * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#dc2626';
  roundRectPath(ctx, -w * 0.18, -h * 0.02, w * 0.36, h * 0.09, 4);
  ctx.fill();
  ctx.restore();
}

function drawBrassDrumItem(ctx, w, h) {
  ctx.save();
  const grad = ctx.createLinearGradient(-w * 0.35, 0, w * 0.35, 0);
  grad.addColorStop(0, '#991b1b');
  grad.addColorStop(0.5, '#ef4444');
  grad.addColorStop(1, '#7f1d1d');
  ctx.fillStyle = grad;
  roundRectPath(ctx, -w * 0.34, -h * 0.26, w * 0.68, h * 0.52, 6);
  ctx.fill();
  ctx.fillStyle = '#fef3c7';
  ctx.beginPath();
  ctx.ellipse(0, -h * 0.26, w * 0.34, h * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d4a353';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}

function drawToyRobotItem(ctx, w, h, elapsed) {
  ctx.save();
  ctx.fillStyle = '#38bdf8';
  roundRectPath(ctx, -w * 0.26, -h * 0.12, w * 0.52, h * 0.42, 6);
  ctx.fill();
  ctx.fillStyle = '#94a3b8';
  roundRectPath(ctx, -w * 0.2, -h * 0.38, w * 0.4, h * 0.24, 6);
  ctx.fill();
  ctx.fillStyle = '#ef4444';
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur = 8 * (0.6 + 0.4 * Math.sin(elapsed * 4));
  ctx.beginPath();
  ctx.arc(0, -h * 0.46, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawGiftTagItem(ctx, w, h, text) {
  ctx.save();
  const grad = ctx.createLinearGradient(-w * 0.4, -h * 0.2, w * 0.4, h * 0.2);
  grad.addColorStop(0, '#fef3c7');
  grad.addColorStop(1, '#d4a353');
  ctx.fillStyle = grad;
  roundRectPath(ctx, -w * 0.42, -h * 0.24, w * 0.84, h * 0.48, 6);
  ctx.fill();
  ctx.fillStyle = '#b91c1c';
  ctx.beginPath();
  ctx.arc(-w * 0.28, 0, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#29170a';
  ctx.font = '700 11px "Fraunces", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text || 'Santa', w * 0.06, 0);
  ctx.restore();
}

function drawCookiePlateItem(ctx, w, h) {
  ctx.save();
  const rimGrad = ctx.createRadialGradient(-w * 0.1, -h * 0.1, 6, 0, 0, w * 0.48);
  rimGrad.addColorStop(0, '#ffffff');
  rimGrad.addColorStop(0.75, '#e2e8f0');
  rimGrad.addColorStop(1, '#94a3b8');
  ctx.fillStyle = rimGrad;
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.ellipse(0, 0, w * 0.46, h * 0.34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#b91c1c';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, 0, w * 0.36, h * 0.25, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawPeppermintCandyItem(ctx, w, h) {
  ctx.save();
  const r = Math.min(w, h) * 0.38;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#dc2626';
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, (i * Math.PI) / 3, (i * Math.PI) / 3 + 0.38);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawGumdropClusterItem(ctx, w, h) {
  ctx.save();
  const drops = [
    { x: -w * 0.18, y: h * 0.08, col: '#22c55e' },
    { x: w * 0.18, y: h * 0.08, col: '#ef4444' },
    { x: 0, y: -h * 0.08, col: '#facc15' }
  ];
  drops.forEach((d) => {
    ctx.fillStyle = d.col;
    ctx.beginPath();
    ctx.arc(d.x, d.y, w * 0.16, Math.PI, 0);
    ctx.lineTo(d.x + w * 0.18, d.y + h * 0.16);
    ctx.lineTo(d.x - w * 0.18, d.y + h * 0.16);
    ctx.closePath();
    ctx.fill();
  });
  ctx.restore();
}

function drawCinnamonBundleItem(ctx, w, h) {
  ctx.save();
  ctx.fillStyle = '#78350f';
  roundRectPath(ctx, -w * 0.32, -h * 0.16, w * 0.64, h * 0.14, 4);
  ctx.fill();
  ctx.fillStyle = '#92400e';
  roundRectPath(ctx, -w * 0.3, -h * 0.02, w * 0.6, h * 0.14, 4);
  ctx.fill();
  ctx.fillStyle = '#b91c1c';
  ctx.fillRect(-w * 0.06, -h * 0.2, w * 0.12, h * 0.36);
  ctx.restore();
}

function drawFrostingSwirlItem(ctx, w, h) {
  ctx.save();
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.ellipse(0, h * 0.14, w * 0.34, h * 0.14, 0, 0, Math.PI * 2);
  ctx.ellipse(0, 0, w * 0.25, h * 0.12, 0, 0, Math.PI * 2);
  ctx.ellipse(0, -h * 0.14, w * 0.14, h * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSugarStarItem(ctx, w, h) {
  drawGoldStarTopper(ctx, Math.min(w, h) * 0.42, 0);
}

function drawGoldenHarnessItem(ctx, w, h) {
  ctx.save();
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.ellipse(0, 0, w * 0.38, h * 0.22, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(0, h * 0.22, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawHollyWreathItem(ctx, w, h) {
  ctx.save();
  const r = Math.min(w, h) * 0.36;
  ctx.strokeStyle = '#15803d';
  ctx.lineWidth = r * 0.42;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#dc2626';
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * r, Math.sin(a) * r, 4.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawHayBundleItem(ctx, w, h) {
  ctx.save();
  const grad = ctx.createLinearGradient(-w * 0.4, -h * 0.2, w * 0.4, h * 0.2);
  grad.addColorStop(0, '#eab308');
  grad.addColorStop(1, '#a16207');
  ctx.fillStyle = grad;
  roundRectPath(ctx, -w * 0.4, -h * 0.24, w * 0.8, h * 0.48, 6);
  ctx.fill();
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 3;
  ctx.strokeRect(-w * 0.16, -h * 0.24, w * 0.32, h * 0.48);
  ctx.restore();
}

function drawCarrotBasketItem(ctx, w, h) {
  ctx.save();
  ctx.fillStyle = '#f97316';
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 10 - 6, -h * 0.22);
    ctx.lineTo(i * 10 + 6, -h * 0.22);
    ctx.lineTo(i * 10, h * 0.04);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = '#92400e';
  roundRectPath(ctx, -w * 0.34, -h * 0.04, w * 0.68, h * 0.34, 8);
  ctx.fill();
  ctx.restore();
}

function drawCobbleBenchItem(ctx, w, h) {
  ctx.save();
  ctx.fillStyle = '#78350f';
  roundRectPath(ctx, -w * 0.42, -h * 0.18, w * 0.84, h * 0.24, 4);
  ctx.fill();
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-w * 0.36, h * 0.06, 8, h * 0.26);
  ctx.fillRect(w * 0.28, h * 0.06, 8, h * 0.26);
  ctx.restore();
}

function drawCandyPillarItem(ctx, w, h) {
  ctx.save();
  ctx.fillStyle = '#f8fafc';
  roundRectPath(ctx, -w * 0.2, -h * 0.4, w * 0.4, h * 0.8, 6);
  ctx.fill();
  ctx.fillStyle = '#dc2626';
  for (let y = -h * 0.34; y < h * 0.34; y += h * 0.22) {
    ctx.fillRect(-w * 0.2, y, w * 0.4, h * 0.1);
  }
  ctx.restore();
}

function drawFestiveBannerItem(ctx, w, h) {
  ctx.save();
  ctx.fillStyle = '#b91c1c';
  ctx.beginPath();
  ctx.moveTo(-w * 0.44, -h * 0.25);
  ctx.lineTo(w * 0.44, -h * 0.25);
  ctx.lineTo(w * 0.44, h * 0.2);
  ctx.lineTo(0, h * 0.02);
  ctx.lineTo(-w * 0.44, h * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#d4a353';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}

function drawStreetlampPropItem(ctx, w, h, elapsed, intensity = 2) {
  drawTownStreetlamp(ctx, 0, -h * 0.26, h * 0.72, intensity ?? 2, elapsed);
}

function drawHarnessBellsItem(ctx, w, h, elapsed, jingleTimer = 0) {
  ctx.save();
  const sway = jingleTimer > 0 ? Math.sin(jingleTimer * 28) * 0.18 : Math.sin(elapsed * 2) * 0.03;
  ctx.rotate(sway);
  ctx.fillStyle = '#78350f';
  roundRectPath(ctx, -w * 0.42, -h * 0.22, w * 0.84, h * 0.18, 6);
  ctx.fill();
  [-w * 0.26, 0, w * 0.26].forEach((bx) => {
    ctx.save();
    ctx.translate(bx, h * 0.08);
    const bg = ctx.createRadialGradient(-3, -3, 2, 0, 0, 14);
    bg.addColorStop(0, '#fef9c3');
    bg.addColorStop(0.5, '#f59e0b');
    bg.addColorStop(1, '#78350f');
    ctx.fillStyle = bg;
    if (jingleTimer > 0) {
      ctx.shadowColor = '#fde047';
      ctx.shadowBlur = 16;
    }
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
  ctx.restore();
}

function drawBeaconTorchItem(ctx, w, h, elapsed) {
  ctx.save();
  ctx.fillStyle = '#334155';
  ctx.fillRect(-5, -h * 0.1, 10, h * 0.5);
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 18 * (0.7 + 0.3 * Math.sin(elapsed * 5));
  ctx.fillStyle = '#bae6fd';
  ctx.beginPath();
  ctx.arc(0, -h * 0.18, w * 0.24, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCargoSackItem(ctx, w, h) {
  ctx.save();
  ctx.fillStyle = '#991b1b';
  ctx.beginPath();
  ctx.ellipse(0, h * 0.1, w * 0.36, h * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f5d07a';
  ctx.fillRect(-w * 0.22, -h * 0.22, w * 0.44, h * 0.1);
  ctx.restore();
}

function drawStardustTrailItem(ctx, w, h, elapsed) {
  ctx.save();
  for (let i = 0; i < 8; i++) {
    const px = -w * 0.38 + (i / 7) * w * 0.76;
    const py = Math.sin(i * 1.1 + elapsed * 3) * h * 0.16;
    ctx.shadowColor = '#fde047';
    ctx.shadowBlur = 10;
    ctx.fillStyle = i % 2 === 0 ? '#fef9c3' : '#38bdf8';
    ctx.beginPath();
    ctx.arc(px, py, 5 - (i % 3), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawRunwayMarkerItem(ctx, w, h, elapsed) {
  drawPathwayMarker(ctx, w, h, elapsed);
}

function drawBrassHornItem(ctx, w, h) {
  ctx.save();
  ctx.strokeStyle = '#d4a353';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(0, 0, w * 0.26, 0, Math.PI * 1.5);
  ctx.stroke();
  ctx.fillStyle = '#f5d07a';
  ctx.beginPath();
  ctx.moveTo(0, -h * 0.32);
  ctx.lineTo(w * 0.32, -h * 0.42);
  ctx.lineTo(w * 0.32, -h * 0.18);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawWaxSealItem(ctx, w, h) {
  ctx.save();
  const r = Math.min(w, h) * 0.36;
  ctx.fillStyle = '#b91c1c';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#7f1d1d';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawPineSprigItem(ctx, w, h) {
  drawGarland(ctx, w, h);
}

function drawGoldCordItem(ctx, w, h) {
  ctx.save();
  ctx.strokeStyle = '#f5d07a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-w * 0.4, 0);
  ctx.bezierCurveTo(-w * 0.15, -h * 0.25, w * 0.15, h * 0.25, w * 0.4, 0);
  ctx.stroke();
  ctx.restore();
}

/* --- LEVEL 6 NEW COOKIE & SERVING ITEMS --- */
function drawWoodenServingTrayItem(ctx, w, h) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.38)';
  ctx.shadowBlur = 10;
  const wood = ctx.createLinearGradient(-w * 0.46, -h * 0.28, w * 0.46, h * 0.28);
  wood.addColorStop(0, '#b4773e');
  wood.addColorStop(0.5, '#925727');
  wood.addColorStop(1, '#5e3413');
  ctx.fillStyle = wood;
  roundRectPath(ctx, -w * 0.46, -h * 0.28, w * 0.92, h * 0.56, 12);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = '#d4a353';
  ctx.lineWidth = 2.5;
  roundRectPath(ctx, -w * 0.4, -h * 0.21, w * 0.8, h * 0.42, 8);
  ctx.stroke();

  // Brass side handles
  ctx.strokeStyle = '#f5d07a';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(-w * 0.46, 0, h * 0.11, Math.PI * 0.5, Math.PI * 1.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(w * 0.46, 0, h * 0.11, -Math.PI * 0.5, Math.PI * 0.5);
  ctx.stroke();
  ctx.restore();
}

function drawTieredCakeStandItem(ctx, w, h) {
  ctx.save();
  // Pedestal base
  ctx.fillStyle = '#94a3b8';
  roundRectPath(ctx, -w * 0.22, h * 0.24, w * 0.44, h * 0.12, 5);
  ctx.fill();
  ctx.fillRect(-w * 0.04, -h * 0.28, w * 0.08, h * 0.54);
  // Brass ring handle at top
  ctx.strokeStyle = '#d4a353';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, -h * 0.34, w * 0.07, 0, Math.PI * 2);
  ctx.stroke();

  // Lower & Upper porcelain tiers
  [
    { y: h * 0.14, rx: w * 0.44, ry: h * 0.13 },
    { y: -h * 0.14, rx: w * 0.32, ry: h * 0.1 }
  ].forEach((tier) => {
    const g = ctx.createLinearGradient(-tier.rx, tier.y, tier.rx, tier.y);
    g.addColorStop(0, '#cbd5e1');
    g.addColorStop(0.5, '#ffffff');
    g.addColorStop(1, '#94a3b8');
    ctx.fillStyle = g;
    ctx.shadowColor = 'rgba(0,0,0,0.32)';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.ellipse(0, tier.y, tier.rx, tier.ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#d4a353';
    ctx.lineWidth = 2;
    ctx.stroke();
  });
  ctx.restore();
}

function drawPredecoratedCookieItem(ctx, w, h, shape) {
  ctx.save();
  const r = Math.min(w, h) * 0.4;
  traceCookieShape(ctx, shape, 0, 0, r);
  const grad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, 4, 0, 0, r * 1.15);
  grad.addColorStop(0, shape === 'star_cookie' ? '#f3ca7a' : '#c77a3c');
  grad.addColorStop(1, shape === 'star_cookie' ? '#b88332' : '#7c4116');
  ctx.fillStyle = grad;
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 6;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#5c2d0c';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Royal icing highlights
  if (shape === 'star_cookie') {
    ctx.strokeStyle = '#fef9c3';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.16, 0, Math.PI * 2);
    ctx.fill();
  } else if (shape === 'tree_cookie') {
    ctx.fillStyle = '#15803d';
    ctx.globalAlpha = 0.85;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fde047';
    [[-r * 0.22, r * 0.3], [r * 0.22, r * 0.3], [0, -r * 0.15], [0, -r * 0.72]].forEach(([dx, dy]) => {
      ctx.beginPath();
      ctx.arc(dx, dy, 3.2, 0, Math.PI * 2);
      ctx.fill();
    });
  } else {
    // Classic piped gingerbread face & gumdrop buttons
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-r * 0.12, -r * 0.62, 2.4, 0, Math.PI * 2);
    ctx.arc(r * 0.12, -r * 0.62, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(0, -r * 0.54, r * 0.14, 0.2, Math.PI - 0.2);
    ctx.moveTo(-r * 0.6, -r * 0.16);
    ctx.lineTo(-r * 0.6, -r * 0.04);
    ctx.moveTo(r * 0.6, -r * 0.16);
    ctx.lineTo(r * 0.6, -r * 0.04);
    ctx.stroke();
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(0, -r * 0.12, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(0, r * 0.12, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawSprinkleMixItem(ctx, w, h) {
  ctx.save();
  const cols = ['#ef4444', '#22c55e', '#facc15', '#ffffff', '#38bdf8'];
  for (let i = 0; i < 14; i++) {
    const a = i * 1.7;
    const rad = ((i * 19) % 34) * 0.01 * Math.min(w, h);
    const sx = Math.cos(a) * rad;
    const sy = Math.sin(a) * rad * 0.7;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(a);
    ctx.fillStyle = cols[i % cols.length];
    roundRectPath(ctx, -4, -1.6, 8, 3.2, 1.5);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

/* --- LEVEL 7 STABLE DECORATION ITEMS --- */
function drawHangingLanternItem(ctx, w, h, elapsed) {
  ctx.save();
  ctx.strokeStyle = '#926727';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, -h * 0.48);
  ctx.lineTo(0, -h * 0.28);
  ctx.stroke();
  ctx.translate(0, h * 0.08);
  drawLanternItem(ctx, w * 0.85, h * 0.82, elapsed);
  ctx.restore();
}

function drawGlossyBellItem(ctx, w, h) {
  ctx.save();
  const r = Math.min(w, h) * 0.34;
  const bellGrad = ctx.createLinearGradient(-r, -r, r, r);
  bellGrad.addColorStop(0, '#fef08a');
  bellGrad.addColorStop(0.45, '#f59e0b');
  bellGrad.addColorStop(1, '#92400e');
  ctx.fillStyle = bellGrad;
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.9);
  ctx.bezierCurveTo(r * 0.72, -r * 0.82, r * 0.78, r * 0.25, r, r * 0.62);
  ctx.lineTo(-r, r * 0.62);
  ctx.bezierCurveTo(-r * 0.78, r * 0.25, -r * 0.72, -r * 0.82, 0, -r * 0.9);
  ctx.closePath();
  ctx.fill();
  // Specular streak
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.28, -r * 0.1, r * 0.14, r * 0.42, 0.22, 0, Math.PI * 2);
  ctx.fill();
  // Clapper & crimson bow at top
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.arc(0, r * 0.72, r * 0.22, 0, Math.PI * 2);
  ctx.fill();
  drawRibbonBowOnTop(ctx, 0, -r * 0.84, '#dc2626');
  ctx.restore();
}

function drawMistletoeSprigItem(ctx, w, h) {
  ctx.save();
  ctx.strokeStyle = '#14532d';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -h * 0.4);
  ctx.lineTo(0, h * 0.05);
  ctx.stroke();
  [
    { ang: -0.65, x: -w * 0.18, y: h * 0.05 },
    { ang: 0.65, x: w * 0.18, y: h * 0.05 },
    { ang: -0.25, x: -w * 0.08, y: h * 0.22 },
    { ang: 0.25, x: w * 0.08, y: h * 0.22 }
  ].forEach((lf) => {
    ctx.save();
    ctx.translate(lf.x, lf.y);
    ctx.rotate(lf.ang);
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.18, h * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
  ctx.fillStyle = '#f8fafc';
  [[-4, 4], [5, 3], [0, 10]].forEach(([bx, by]) => {
    ctx.beginPath();
    ctx.arc(bx, by, 4.5, 0, Math.PI * 2);
    ctx.fill();
  });
  drawRibbonBowOnTop(ctx, 0, -h * 0.24, '#dc2626');
  ctx.restore();
}

function drawStableGarlandItem(ctx, w, h) {
  drawGarland(ctx, w, h);
  ctx.save();
  ctx.fillStyle = '#dc2626';
  [-w * 0.26, 0, w * 0.26].forEach((bx) => {
    ctx.beginPath();
    ctx.arc(bx, h * 0.04, 4.5, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

/* --- LEVEL 9 SLEIGH ATTACHMENT ITEMS --- */
function drawToyStackItem(ctx, w, h) {
  ctx.save();
  // Bottom wrapped box
  ctx.fillStyle = '#dc2626';
  roundRectPath(ctx, -w * 0.4, 0, w * 0.8, h * 0.38, 5);
  ctx.fill();
  ctx.fillStyle = '#facc15';
  ctx.fillRect(-w * 0.08, 0, w * 0.16, h * 0.38);
  // Middle green box
  ctx.fillStyle = '#15803d';
  roundRectPath(ctx, -w * 0.3, -h * 0.24, w * 0.6, h * 0.25, 5);
  ctx.fill();
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(-w * 0.06, -h * 0.24, w * 0.12, h * 0.25);
  // Mini plush peeking out on top
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.arc(-w * 0.1, -h * 0.38, w * 0.06, 0, Math.PI * 2);
  ctx.arc(w * 0.1, -h * 0.38, w * 0.06, 0, Math.PI * 2);
  ctx.arc(0, -h * 0.32, w * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawMagicLanternPoleItem(ctx, w, h, elapsed) {
  ctx.save();
  ctx.fillStyle = '#78350f';
  roundRectPath(ctx, -4, -h * 0.32, 8, h * 0.78, 3);
  ctx.fill();
  ctx.strokeStyle = '#d4a353';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -h * 0.28);
  ctx.quadraticCurveTo(w * 0.24, -h * 0.44, w * 0.24, -h * 0.22);
  ctx.stroke();
  ctx.save();
  ctx.translate(w * 0.22, -h * 0.1);
  drawLanternItem(ctx, w * 0.46, h * 0.42, elapsed);
  ctx.restore();
  ctx.restore();
}

function drawFestiveRibbonItem(ctx, w, h) {
  ctx.save();
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-w * 0.44, -h * 0.08);
  ctx.quadraticCurveTo(0, h * 0.24, w * 0.44, -h * 0.08);
  ctx.stroke();
  ctx.strokeStyle = '#f5d07a';
  ctx.lineWidth = 2;
  ctx.stroke();
  drawVelvetBowItem(ctx, w * 0.46, h * 0.46);
  ctx.restore();
}

/* --- LEVEL 10 WRAPPING BOX ITEMS --- */
function drawGiftCylinderItem(ctx, w, h, boxColor, ribbonColor) {
  ctx.save();
  ctx.scale(Math.min(w, h) / 170, Math.min(w, h) / 170);
  drawWrappedGiftComposite(ctx, { cx: 0, cy: 12, shape: 'cylinder', paperColor: boxColor, ribbonColor });
  ctx.restore();
}

function drawGiftPlushItem(ctx, w, h, boxColor, ribbonColor) {
  ctx.save();
  ctx.scale(Math.min(w, h) / 170, Math.min(w, h) / 170);
  drawWrappedGiftComposite(ctx, { cx: 0, cy: 10, shape: 'plush', paperColor: boxColor, ribbonColor });
  ctx.restore();
}

/* --- LEVEL 11 FLUSH-GROUNDED ISOMETRIC MINI-BUILDINGS & VILLAGE ASSETS --- */
function drawIsoContactShadow(ctx, rx, ry, centerY) {
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.34)';
  ctx.beginPath();
  ctx.ellipse(0, centerY, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawIsoGlowingWindow(ctx, x, y, ww, wh, dir = -1) {
  // Skewed 2:1 isometric window with dark wooden frame, soft drop shadow & yellow glow
  const dy = dir * ww * 0.5;
  ctx.save();
  // Soft drop shadow beneath sill
  ctx.fillStyle = 'rgba(15, 23, 42, 0.32)';
  ctx.beginPath();
  ctx.moveTo(x - 1, y + wh + 1);
  ctx.lineTo(x + ww + 1, y + dy + wh + 3.5);
  ctx.lineTo(x + ww + 1, y + dy + wh + 6);
  ctx.lineTo(x - 1, y + wh + 3.5);
  ctx.closePath();
  ctx.fill();

  // Dark wood frame
  ctx.fillStyle = '#3e2723';
  ctx.beginPath();
  ctx.moveTo(x - 2, y - 2);
  ctx.lineTo(x + ww + 2, y + dy - 2);
  ctx.lineTo(x + ww + 2, y + dy + wh + 2);
  ctx.lineTo(x - 2, y + wh + 2);
  ctx.closePath();
  ctx.fill();

  // Glowing golden-yellow pane
  ctx.shadowColor = 'rgba(253, 224, 71, 0.9)';
  ctx.shadowBlur = 9;
  const g = ctx.createLinearGradient(x, y, x + ww, y + wh);
  g.addColorStop(0, '#fef9c3');
  g.addColorStop(0.55, '#fde047');
  g.addColorStop(1, '#f59e0b');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + ww, y + dy);
  ctx.lineTo(x + ww, y + dy + wh);
  ctx.lineTo(x, y + wh);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Crossbar muntins
  ctx.strokeStyle = '#3e2723';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x + ww * 0.5, y + dy * 0.5);
  ctx.lineTo(x + ww * 0.5, y + dy * 0.5 + wh);
  ctx.moveTo(x, y + wh * 0.5);
  ctx.lineTo(x + ww, y + dy + wh * 0.5);
  ctx.stroke();
  ctx.restore();
}

function drawIsoBrickChimney(ctx, x, y, cw, ch, elapsed) {
  ctx.save();
  // Sunlit left face of brick chimney
  ctx.fillStyle = '#9a3412';
  ctx.beginPath();
  ctx.moveTo(x - cw, y);
  ctx.lineTo(x, y + cw * 0.5);
  ctx.lineTo(x, y + cw * 0.5 - ch);
  ctx.lineTo(x - cw, y - ch);
  ctx.closePath();
  ctx.fill();

  // Shaded right face of brick chimney
  ctx.fillStyle = '#7c2d12';
  ctx.beginPath();
  ctx.moveTo(x, y + cw * 0.5);
  ctx.lineTo(x + cw, y);
  ctx.lineTo(x + cw, y - ch);
  ctx.lineTo(x, y + cw * 0.5 - ch);
  ctx.closePath();
  ctx.fill();

  // Mortar brick courses
  ctx.strokeStyle = 'rgba(254, 243, 199, 0.36)';
  ctx.lineWidth = 0.9;
  for (let b = 1; b <= 3; b++) {
    const by = y - ch * (b / 4);
    ctx.beginPath();
    ctx.moveTo(x - cw, by);
    ctx.lineTo(x, by + cw * 0.5);
    ctx.lineTo(x + cw, by);
    ctx.stroke();
  }

  // Snow-rimmed stone chimney crown
  ctx.fillStyle = '#f1f5f9';
  ctx.beginPath();
  ctx.moveTo(x, y - ch - cw * 0.55);
  ctx.lineTo(x - cw * 1.18, y - ch);
  ctx.lineTo(x, y + cw * 0.62 - ch);
  ctx.lineTo(x + cw * 1.18, y - ch);
  ctx.closePath();
  ctx.fill();

  // Puffing animated smoke particles
  for (let i = 0; i < 3; i++) {
    const t = (elapsed * 0.65 + i * 0.33) % 1;
    const sx = x + Math.sin(t * 4.5 + i) * 4;
    const sy = y - ch - 6 - t * 22;
    ctx.fillStyle = `rgba(248, 250, 252, ${0.68 * (1 - t)})`;
    ctx.beginPath();
    ctx.arc(sx, sy, 3 + t * 4.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawIsoCandyCanePorch(ctx, cx, groundY, pw, ph, dir = 1) {
  // Front doorway on left or right wall face with candy-cane porch pillars & snow hood
  ctx.save();
  const dx = dir * pw * 0.5;
  const dy = pw * 0.25;

  // Recessed warm doorway
  ctx.fillStyle = '#451a03';
  ctx.beginPath();
  ctx.moveTo(cx - dx, groundY - dy);
  ctx.lineTo(cx + dx, groundY + dy);
  ctx.lineTo(cx + dx, groundY + dy - ph);
  ctx.lineTo(cx - dx, groundY - dy - ph);
  ctx.closePath();
  ctx.fill();

  // Door window glow
  ctx.fillStyle = '#fde047';
  ctx.beginPath();
  ctx.arc(cx, groundY - ph * 0.62, pw * 0.16, 0, Math.PI * 2);
  ctx.fill();

  // Twin candy-cane porch pillars flanking the door
  [-dx * 1.15, dx * 1.15].forEach((pxOff) => {
    const px = cx + pxOff;
    const py = groundY + (pxOff / dx) * dy;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(px - 2, py - ph * 1.05, 4, ph * 1.05);
    ctx.fillStyle = '#dc2626';
    for (let s = 0.15; s < 0.95; s += 0.28) {
      ctx.fillRect(px - 2, py - ph * s - 2, 4, 2.5);
    }
  });

  // Snow-dusted porch awning hood
  ctx.fillStyle = '#3e2723';
  ctx.beginPath();
  ctx.moveTo(cx - dx * 1.45, groundY - dy * 1.45 - ph);
  ctx.lineTo(cx + dx * 1.45, groundY + dy * 1.45 - ph);
  ctx.lineTo(cx + dx * 1.15, groundY + dy * 1.15 - ph - 5);
  ctx.lineTo(cx - dx * 1.15, groundY - dy * 1.15 - ph - 5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(cx - pw * 0.58, groundY - ph - 6, pw * 1.16, 3.2);
  ctx.restore();
}

function drawIsoPitchedRoofWithShingles(ctx, baseCenterY, bw, bh, wallH, roofRise, snowTrimColor = '#f8fafc') {
  const eaveY = baseCenterY - wallH;
  const peakY = eaveY - bh - roofRise;
  const ov = 1.1; // overhang multiplier

  // Left sunlit dark wooden shingle roof slope
  const leftRoof = ctx.createLinearGradient(-bw * ov, eaveY, 0, peakY);
  leftRoof.addColorStop(0, '#4e342e');
  leftRoof.addColorStop(1, '#2b1b17');
  ctx.fillStyle = leftRoof;
  ctx.beginPath();
  ctx.moveTo(0, peakY);
  ctx.lineTo(-bw * ov, eaveY);
  ctx.lineTo(0, eaveY + bh * ov);
  ctx.closePath();
  ctx.fill();

  // Right shaded dark wooden shingle roof slope
  const rightRoof = ctx.createLinearGradient(0, peakY, bw * ov, eaveY);
  rightRoof.addColorStop(0, '#3e2723');
  rightRoof.addColorStop(1, '#1e120f');
  ctx.fillStyle = rightRoof;
  ctx.beginPath();
  ctx.moveTo(0, peakY);
  ctx.lineTo(bw * ov, eaveY);
  ctx.lineTo(0, eaveY + bh * ov);
  ctx.closePath();
  ctx.fill();

  // Back slope peak edges
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.42)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Visible dark wooden roof shingle tile courses on both slopes
  ctx.strokeStyle = 'rgba(20, 10, 6, 0.55)';
  ctx.lineWidth = 1;
  for (let t = 0.28; t <= 0.85; t += 0.22) {
    const lx = -bw * ov * t;
    const rx = bw * ov * t;
    const ly = peakY + (eaveY - peakY) * t;
    const midY = peakY + (eaveY + bh * ov - peakY) * t;
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(0, midY);
    ctx.lineTo(rx, ly);
    ctx.stroke();
  }

  // Snow-dusted roof eave trim & ridge highlight
  ctx.strokeStyle = snowTrimColor;
  ctx.lineWidth = 2.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-bw * ov, eaveY);
  ctx.lineTo(0, eaveY + bh * ov);
  ctx.lineTo(bw * ov, eaveY);
  ctx.stroke();
}

function drawIsoBuildingBase(ctx, w, h, wallColor, snowTrimColor, glowWin, elapsed = 0, opts = {}) {
  // Base footprint center sits strictly at localY = h * 0.26 matching getIsoGroundOffsetRatio() = 0.26
  const baseCenterY = h * 0.26;
  const bw = w * 0.36;
  const bh = bw * 0.5; // Exact 2:1 isometric tile slope
  const wallH = h * (opts.wallRatio || 0.33);
  const roofRise = h * (opts.roofRatio || 0.2);

  ctx.save();
  drawIsoContactShadow(ctx, bw * 1.18, bh * 1.18, baseCenterY);

  // Left sunlit wall
  ctx.fillStyle = shadeColor(wallColor, 12);
  ctx.beginPath();
  ctx.moveTo(-bw, baseCenterY);
  ctx.lineTo(0, baseCenterY + bh);
  ctx.lineTo(0, baseCenterY + bh - wallH);
  ctx.lineTo(-bw, baseCenterY - wallH);
  ctx.closePath();
  ctx.fill();

  // Right shaded wall
  ctx.fillStyle = shadeColor(wallColor, -18);
  ctx.beginPath();
  ctx.moveTo(bw, baseCenterY);
  ctx.lineTo(0, baseCenterY + bh);
  ctx.lineTo(0, baseCenterY + bh - wallH);
  ctx.lineTo(bw, baseCenterY - wallH);
  ctx.closePath();
  ctx.fill();

  // Stone foundation plinth anchored flat on the isometric tile
  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.moveTo(-bw, baseCenterY);
  ctx.lineTo(0, baseCenterY + bh);
  ctx.lineTo(0, baseCenterY + bh - 4.5);
  ctx.lineTo(-bw, baseCenterY - 4.5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.moveTo(bw, baseCenterY);
  ctx.lineTo(0, baseCenterY + bh);
  ctx.lineTo(0, baseCenterY + bh - 4.5);
  ctx.lineTo(bw, baseCenterY - 4.5);
  ctx.closePath();
  ctx.fill();

  // Dark wooden roof with visible shingled tiles & snow trim
  drawIsoPitchedRoofWithShingles(ctx, baseCenterY, bw, bh, wallH, roofRise, snowTrimColor);

  // Glowing yellow framed windows with soft drop shadows
  if (glowWin) {
    drawIsoGlowingWindow(ctx, -bw * 0.72, baseCenterY - wallH * 0.56, bw * 0.28, wallH * 0.34, 1);
    drawIsoGlowingWindow(ctx, bw * 0.42, baseCenterY - wallH * 0.42, bw * 0.28, wallH * 0.34, -1);
  }

  // Candy-cane pillared front porch on sunlit left face
  drawIsoCandyCanePorch(ctx, -bw * 0.32, baseCenterY + bh * 0.68, bw * 0.26, wallH * 0.54, 1);

  if (opts.chimney !== false) {
    drawIsoBrickChimney(ctx, bw * 0.35, baseCenterY - wallH - bh * 0.25, bw * 0.16, h * 0.16, elapsed);
  }
  ctx.restore();
}

function drawIsoSantasHouse(ctx, w, h, elapsed = 0) {
  drawIsoBuildingBase(ctx, w, h, '#b91c1c', '#f8fafc', true, elapsed);
}

function drawIsoElfBarracks(ctx, w, h, elapsed = 0) {
  drawIsoBuildingBase(ctx, w, h, '#15803d', '#e2e8f0', true, elapsed);
}

function drawIsoCocoaShop(ctx, w, h, elapsed = 0) {
  drawIsoBuildingBase(ctx, w, h, '#92400e', '#fef3c7', true, elapsed);
  ctx.save();
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.arc(0, h * 0.26 - h * 0.52, w * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawIsoToyTower(ctx, w, h, elapsed = 0) {
  drawIsoBuildingBase(ctx, w, h, '#1d4ed8', '#f8fafc', true, elapsed, { wallRatio: 0.38, roofRatio: 0.26 });
  ctx.save();
  ctx.fillStyle = '#f5d07a';
  ctx.beginPath();
  ctx.arc(0, h * 0.26 - h * 0.72, w * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawIsoToyFactory(ctx, w, h, elapsed) {
  const baseCenterY = h * 0.26;
  const bw = w * 0.4;
  const bh = bw * 0.5;
  const wallH = h * 0.34;
  const roofRise = h * 0.2;

  ctx.save();
  drawIsoContactShadow(ctx, bw * 1.18, bh * 1.18, baseCenterY);

  // Red brick factory walls
  ctx.fillStyle = '#991b1b';
  ctx.beginPath();
  ctx.moveTo(-bw, baseCenterY);
  ctx.lineTo(0, baseCenterY + bh);
  ctx.lineTo(0, baseCenterY + bh - wallH);
  ctx.lineTo(-bw, baseCenterY - wallH);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#7f1d1d';
  ctx.beginPath();
  ctx.moveTo(bw, baseCenterY);
  ctx.lineTo(0, baseCenterY + bh);
  ctx.lineTo(0, baseCenterY + bh - wallH);
  ctx.lineTo(bw, baseCenterY - wallH);
  ctx.closePath();
  ctx.fill();

  // Dark slate/stone plinth
  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.moveTo(-bw, baseCenterY);
  ctx.lineTo(0, baseCenterY + bh);
  ctx.lineTo(bw, baseCenterY);
  ctx.lineTo(bw, baseCenterY - 5);
  ctx.lineTo(0, baseCenterY + bh - 5);
  ctx.lineTo(-bw, baseCenterY - 5);
  ctx.closePath();
  ctx.fill();

  // Dark shingled roof + snow trim
  drawIsoPitchedRoofWithShingles(ctx, baseCenterY, bw, bh, wallH, roofRise, '#e2e8f0');

  // Multiple glowing yellow workshop windows with drop shadows
  drawIsoGlowingWindow(ctx, -bw * 0.82, baseCenterY - wallH * 0.58, bw * 0.26, wallH * 0.35, 1);
  drawIsoGlowingWindow(ctx, bw * 0.16, baseCenterY - wallH * 0.32, bw * 0.25, wallH * 0.35, -1);
  drawIsoGlowingWindow(ctx, bw * 0.54, baseCenterY - wallH * 0.5, bw * 0.25, wallH * 0.35, -1);

  // Candy-cane pillared workshop entrance
  drawIsoCandyCanePorch(ctx, -bw * 0.34, baseCenterY + bh * 0.66, bw * 0.28, wallH * 0.56, 1);

  // Distinct tall brick factory chimney with puffing smoke particles
  drawIsoBrickChimney(ctx, bw * 0.42, baseCenterY - wallH - bh * 0.32, bw * 0.18, h * 0.24, elapsed);
  drawIsoBrickChimney(ctx, -bw * 0.25, baseCenterY - wallH - bh * 0.48, bw * 0.13, h * 0.16, elapsed + 0.5);

  // Rotating golden cog emblem on front ridge
  ctx.save();
  ctx.translate(0, baseCenterY - wallH - bh * 0.15);
  ctx.rotate(elapsed * 0.9);
  ctx.fillStyle = '#f5d07a';
  ctx.beginPath();
  ctx.arc(0, 0, w * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

function drawIsoGingerbreadBakery(ctx, w, h, elapsed) {
  const baseCenterY = h * 0.26;
  const bw = w * 0.38;
  const bh = bw * 0.5;
  const wallH = h * 0.34;
  const roofRise = h * 0.21;

  ctx.save();
  drawIsoContactShadow(ctx, bw * 1.18, bh * 1.18, baseCenterY);

  // Warm gingerbread clapboard walls
  ctx.fillStyle = '#c26d27';
  ctx.beginPath();
  ctx.moveTo(-bw, baseCenterY);
  ctx.lineTo(0, baseCenterY + bh);
  ctx.lineTo(0, baseCenterY + bh - wallH);
  ctx.lineTo(-bw, baseCenterY - wallH);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#924b13';
  ctx.beginPath();
  ctx.moveTo(bw, baseCenterY);
  ctx.lineTo(0, baseCenterY + bh);
  ctx.lineTo(0, baseCenterY + bh - wallH);
  ctx.lineTo(bw, baseCenterY - wallH);
  ctx.closePath();
  ctx.fill();

  // Dark wooden roof tiles with white frosting trim
  drawIsoPitchedRoofWithShingles(ctx, baseCenterY, bw, bh, wallH, roofRise, '#ffffff');

  // Scalloped royal-icing eave drops + colorful gumdrops
  for (let i = 0; i <= 4; i++) {
    const lx = -bw * 0.9 + i * bw * 0.22;
    const ly = baseCenterY - wallH + i * bh * 0.24;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(lx, ly + 2, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = i % 2 === 0 ? '#ef4444' : '#22c55e';
    ctx.beginPath();
    ctx.arc(lx, ly - 1, 1.9, 0, Math.PI * 2);
    ctx.fill();
  }

  // Glowing bakery display windows with drop shadows
  drawIsoGlowingWindow(ctx, -bw * 0.78, baseCenterY - wallH * 0.56, bw * 0.28, wallH * 0.36, 1);
  drawIsoGlowingWindow(ctx, bw * 0.36, baseCenterY - wallH * 0.44, bw * 0.32, wallH * 0.36, -1);

  // Candy-cane pillared bakery porch
  drawIsoCandyCanePorch(ctx, -bw * 0.32, baseCenterY + bh * 0.68, bw * 0.28, wallH * 0.55, 1);

  // Distinct brick baker's oven chimney with puffing smoke particles
  drawIsoBrickChimney(ctx, bw * 0.32, baseCenterY - wallH - bh * 0.3, bw * 0.17, h * 0.18, elapsed);

  // Peppermint swirl crest above doorway
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.arc(0, baseCenterY - wallH - bh * 0.08, w * 0.065, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, baseCenterY - wallH - bh * 0.08, w * 0.032, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawIsoElfCottage(ctx, w, h, elapsed = 0) {
  const baseCenterY = h * 0.26;
  const bw = w * 0.35;
  const bh = bw * 0.5;
  const wallH = h * 0.32;
  const roofRise = h * 0.22;

  ctx.save();
  drawIsoContactShadow(ctx, bw * 1.16, bh * 1.16, baseCenterY);

  // Cozy timber & pine-green cottage walls
  ctx.fillStyle = '#1f7a44';
  ctx.beginPath();
  ctx.moveTo(-bw, baseCenterY);
  ctx.lineTo(0, baseCenterY + bh);
  ctx.lineTo(0, baseCenterY + bh - wallH);
  ctx.lineTo(-bw, baseCenterY - wallH);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#14532d';
  ctx.beginPath();
  ctx.moveTo(bw, baseCenterY);
  ctx.lineTo(0, baseCenterY + bh);
  ctx.lineTo(0, baseCenterY + bh - wallH);
  ctx.lineTo(bw, baseCenterY - wallH);
  ctx.closePath();
  ctx.fill();

  // Stone base plinth
  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.moveTo(-bw, baseCenterY);
  ctx.lineTo(0, baseCenterY + bh);
  ctx.lineTo(bw, baseCenterY);
  ctx.lineTo(bw, baseCenterY - 4);
  ctx.lineTo(0, baseCenterY + bh - 4);
  ctx.lineTo(-bw, baseCenterY - 4);
  ctx.closePath();
  ctx.fill();

  // Steep dark wooden shingled roof with snowy trim
  drawIsoPitchedRoofWithShingles(ctx, baseCenterY, bw, bh, wallH, roofRise, '#f8fafc');

  // Glowing yellow framed windows with drop shadows
  drawIsoGlowingWindow(ctx, -bw * 0.78, baseCenterY - wallH * 0.54, bw * 0.26, wallH * 0.35, 1);
  drawIsoGlowingWindow(ctx, bw * 0.38, baseCenterY - wallH * 0.44, bw * 0.28, wallH * 0.35, -1);

  // Candy-cane pillared cottage porch
  drawIsoCandyCanePorch(ctx, -bw * 0.32, baseCenterY + bh * 0.68, bw * 0.26, wallH * 0.54, 1);

  // Brick chimney puffing cozy hearth smoke
  drawIsoBrickChimney(ctx, bw * 0.32, baseCenterY - wallH - bh * 0.25, bw * 0.16, h * 0.17, elapsed);
  ctx.restore();
}

function drawIsoClocktower(ctx, w, h, elapsed) {
  // Base center sits strictly at localY = h * 0.32 matching getIsoGroundOffsetRatio('village_clocktower') = 0.32
  const baseCenterY = h * 0.32;
  const bw = w * 0.28;
  const bh = bw * 0.5;
  const wallH = h * 0.52;
  const roofRise = h * 0.22;

  ctx.save();
  drawIsoContactShadow(ctx, bw * 1.25, bh * 1.25, baseCenterY);

  // Tall isometric stone & timber clocktower walls
  ctx.fillStyle = '#a16227';
  ctx.beginPath();
  ctx.moveTo(-bw, baseCenterY);
  ctx.lineTo(0, baseCenterY + bh);
  ctx.lineTo(0, baseCenterY + bh - wallH);
  ctx.lineTo(-bw, baseCenterY - wallH);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.moveTo(bw, baseCenterY);
  ctx.lineTo(0, baseCenterY + bh);
  ctx.lineTo(0, baseCenterY + bh - wallH);
  ctx.lineTo(bw, baseCenterY - wallH);
  ctx.closePath();
  ctx.fill();

  // Stone masonry base plinth
  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.moveTo(-bw, baseCenterY);
  ctx.lineTo(0, baseCenterY + bh);
  ctx.lineTo(bw, baseCenterY);
  ctx.lineTo(bw, baseCenterY - 6);
  ctx.lineTo(0, baseCenterY + bh - 6);
  ctx.lineTo(-bw, baseCenterY - 6);
  ctx.closePath();
  ctx.fill();

  // Dark wooden shingled spire roof with snow trim
  drawIsoPitchedRoofWithShingles(ctx, baseCenterY, bw, bh, wallH, roofRise, '#f8fafc');

  // Candy-cane pillared front entryway at base
  drawIsoCandyCanePorch(ctx, -bw * 0.45, baseCenterY + bh * 0.55, bw * 0.38, h * 0.16, 1);

  // Glowing lancet windows on middle tier with drop shadows
  drawIsoGlowingWindow(ctx, -bw * 0.65, baseCenterY - wallH * 0.48, bw * 0.3, h * 0.11, 1);
  drawIsoGlowingWindow(ctx, bw * 0.32, baseCenterY - wallH * 0.48, bw * 0.3, h * 0.11, -1);

  // Brick side flue chimney with puffing smoke
  drawIsoBrickChimney(ctx, bw * 0.44, baseCenterY - wallH - bh * 0.15, bw * 0.18, h * 0.12, elapsed);

  // Illuminated brass clockfaces on BOTH visible walls with live animated hands
  [
    { cx: -bw * 0.5, cy: baseCenterY - wallH * 0.74 },
    { cx: bw * 0.5, cy: baseCenterY - wallH * 0.74 }
  ].forEach(({ cx, cy }) => {
    ctx.save();
    ctx.shadowColor = 'rgba(253, 224, 71, 0.75)';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#fef9c3';
    ctx.strokeStyle = '#f5d07a';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(cx, cy, w * 0.085, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.stroke();

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    const minA = elapsed * 0.8;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(minA) * w * 0.055, cy + Math.sin(minA) * w * 0.055);
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(minA * 0.15) * w * 0.036, cy + Math.sin(minA * 0.15) * w * 0.036);
    ctx.stroke();
    ctx.restore();
  });

  // Golden finial star atop spire
  ctx.fillStyle = '#fde047';
  ctx.beginPath();
  ctx.arc(0, baseCenterY - wallH - bh - roofRise - 3, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawIsoTrainCar(ctx, w, h, elapsed) {
  // Ground center strictly at localY = h * 0.22 matching getIsoGroundOffsetRatio('mini_train_car') = 0.22
  const baseY = h * 0.22;
  ctx.save();
  drawIsoContactShadow(ctx, w * 0.36, h * 0.14, baseY);
  // Isometric 2:1 track rails & wooden sleepers
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 3;
  for (let i = -2; i <= 2; i++) {
    const rx = i * w * 0.12;
    const ry = baseY + i * w * 0.06;
    ctx.beginPath();
    ctx.moveTo(rx - 8, ry + 4);
    ctx.lineTo(rx + 8, ry - 4);
    ctx.stroke();
  }
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-w * 0.36, baseY - w * 0.18 - 4);
  ctx.lineTo(w * 0.36, baseY + w * 0.18 - 4);
  ctx.moveTo(-w * 0.36, baseY - w * 0.18 + 4);
  ctx.lineTo(w * 0.36, baseY + w * 0.18 + 4);
  ctx.stroke();

  // Locomotive boiler & cab resting flush on rails
  ctx.fillStyle = '#dc2626';
  roundRectPath(ctx, -w * 0.26, baseY - h * 0.32, w * 0.52, h * 0.22, 6);
  ctx.fill();
  ctx.fillStyle = '#15803d';
  roundRectPath(ctx, -w * 0.22, baseY - h * 0.44, w * 0.22, h * 0.14, 4);
  ctx.fill();
  ctx.fillStyle = '#fde047';
  ctx.fillRect(-w * 0.17, baseY - h * 0.4, w * 0.11, h * 0.07);
  ctx.fillStyle = '#f5d07a';
  ctx.fillRect(w * 0.1, baseY - h * 0.44, w * 0.08, h * 0.13);

  [-w * 0.15, 0, w * 0.15].forEach((wx) => {
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(wx, baseY - h * 0.07, w * 0.055, 0, Math.PI * 2);
    ctx.fill();
  });
  const t = (elapsed * 1.1) % 1;
  ctx.fillStyle = `rgba(255, 255, 255, ${0.75 * (1 - t)})`;
  ctx.beginPath();
  ctx.arc(w * 0.14 - t * 10, baseY - h * 0.48 - t * h * 0.2, 4 + t * 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawIsoCandyPath(ctx, w, h) {
  // Flush 2:1 tile diamond centered at y = 0 matching getIsoGroundOffsetRatio('candy_cane_path') = 0
  const hw = w * 0.46;
  const hh = hw * 0.5;
  ctx.save();
  const pathGrad = ctx.createLinearGradient(-hw, -hh, hw, hh);
  pathGrad.addColorStop(0, '#cbd5e1');
  pathGrad.addColorStop(1, '#94a3b8');
  ctx.fillStyle = pathGrad;
  ctx.beginPath();
  ctx.moveTo(0, -hh);
  ctx.lineTo(hw, 0);
  ctx.lineTo(0, hh);
  ctx.lineTo(-hw, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // Snow-dusted candy cane corner posts
  [[-hw * 0.54, 0], [hw * 0.54, 0]].forEach(([px, py]) => {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px, py - h * 0.22);
    ctx.arc(px + 2.5, py - h * 0.22, 2.5, Math.PI, 0, false);
    ctx.stroke();
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(px, py - h * 0.04);
    ctx.lineTo(px, py - h * 0.16);
    ctx.stroke();
  });
  ctx.restore();
}

function drawIsoPineCluster(ctx, w, h) {
  // Base anchored strictly at localY = h * 0.26 matching getIsoGroundOffsetRatio('pine_cluster') = 0.26
  const baseCenterY = h * 0.26;
  ctx.save();
  drawIsoContactShadow(ctx, w * 0.36, h * 0.16, baseCenterY);
  [
    [-w * 0.16, baseCenterY - 2],
    [w * 0.16, baseCenterY - 2],
    [0, baseCenterY + 5]
  ].forEach(([px, py]) => {
    ctx.fillStyle = '#451a03';
    ctx.fillRect(px - 2.5, py - 5, 5, 6);
    ctx.fillStyle = '#14532d';
    ctx.beginPath();
    ctx.moveTo(px, py - h * 0.48);
    ctx.lineTo(px + w * 0.17, py - 3);
    ctx.lineTo(px - w * 0.17, py - 3);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(px, py - h * 0.48);
    ctx.lineTo(px + w * 0.075, py - h * 0.28);
    ctx.lineTo(px - w * 0.075, py - h * 0.28);
    ctx.closePath();
    ctx.fill();
  });
  ctx.restore();
}

function drawIsoFrozenFountain(ctx, w, h, elapsed) {
  // Base anchored strictly at localY = h * 0.24 matching getIsoGroundOffsetRatio('frozen_fountain') = 0.24
  const baseY = h * 0.24;
  ctx.save();
  drawIsoContactShadow(ctx, w * 0.4, h * 0.17, baseY + 2);
  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.ellipse(0, baseY, w * 0.36, h * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7dd3fc';
  ctx.beginPath();
  ctx.ellipse(0, baseY - h * 0.03, w * 0.28, h * 0.11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e0f2fe';
  ctx.fillRect(-w * 0.05, baseY - h * 0.34, w * 0.1, h * 0.32);
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 10 * (0.6 + 0.4 * Math.sin(elapsed * 4));
  ctx.beginPath();
  ctx.arc(0, baseY - h * 0.36, w * 0.09, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}


