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
  sleighBaseSprite: null
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

export function roundRectPath(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w * 0.5, h * 0.5);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
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
