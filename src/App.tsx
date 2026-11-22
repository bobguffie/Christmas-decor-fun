/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import '../style.css';
import { initYuletideGame } from '../game.js';

export default function App() {
  useEffect(() => {
    const game = initYuletideGame();
    return () => {
      if (game && typeof game.destroy === 'function') {
        game.destroy();
      }
    };
  }, []);

  return (
    <>
      <div id="appShell" className="app-shell">
        <header id="topHud" className="top-hud">
          <div className="hud-left">
            <button type="button" id="btnMenu" className="hud-btn hud-btn-ghost" aria-label="Main Menu">
              Menu
            </button>
            <button type="button" id="btnLevels" className="hud-btn hud-btn-ghost" aria-label="Select Level">
              Levels
            </button>
          </div>

          <div className="hud-center">
            <h1 id="hudTitle" className="hud-title">Christmas Decorating Fun</h1>
            <span id="hudMeta" className="hud-meta">4 Festive Scenes</span>
          </div>

          <div className="hud-right">
            <button type="button" id="btnAudio" className="hud-btn hud-btn-ghost" aria-pressed="true">
              Sound On
            </button>
            <button type="button" id="btnUndo" className="hud-btn hud-btn-ghost hidden">
              Undo
            </button>
            <button type="button" id="btnClearLevel" className="hud-btn hud-btn-ghost hidden">
              Reset
            </button>
            <button type="button" id="btnTakePhoto" className="hud-btn hud-btn-ghost hidden">
              Take Photo
            </button>
            <button type="button" id="btnOpenStudio" className="hud-btn hud-btn-primary hidden">
              Open Studio
            </button>
          </div>
        </header>

        <main className="stage-area">
          <div id="canvasWrapper" className="canvas-wrapper">
            <canvas id="gameCanvas" width={1280} height={720} />

            <div
              id="selectionControls"
              className="selection-controls hidden"
              role="toolbar"
              aria-label="Selected item controls"
            >
              <span id="selectedItemName" className="selected-item-name">Ornament</span>
              <button type="button" id="btnCycleColor" className="sel-btn hidden" title="Change Color">
                Color
              </button>
              <button type="button" id="btnScaleDown" className="sel-btn" title="Smaller">-</button>
              <button type="button" id="btnScaleUp" className="sel-btn" title="Larger">+</button>
              <button type="button" id="btnRotate" className="sel-btn" title="Rotate">Rotate</button>
              <button type="button" id="btnDuplicateItem" className="sel-btn" title="Duplicate">
                Duplicate
              </button>
              <button type="button" id="btnDeleteItem" className="sel-btn sel-btn-danger" title="Remove">
                Remove
              </button>
            </div>
          </div>
        </main>

        <section id="bottomDock" className="bottom-dock hidden" aria-label="Decoration tools and inventory">
          <div id="levelQuickControls" className="quick-controls" />
          <div id="inventoryTray" className="inventory-tray" role="list" />
        </section>
      </div>

      <div id="dragGhost" className="drag-ghost hidden" aria-hidden="true" />

      <div
        id="designerOverlay"
        className="modal-overlay hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="designerModalTitle"
      >
        <div className="modal-card">
          <div className="modal-header">
            <div>
              <h2 id="designerModalTitle" className="modal-title">Custom Studio</h2>
              <p id="designerModalSubtitle" className="modal-subtitle">
                Paint your decoration and save it to your tray
              </p>
            </div>
            <button type="button" id="btnCloseModal" className="hud-btn hud-btn-ghost">Cancel</button>
          </div>

          <div id="baubleStudio" className="studio-panel hidden">
            <div className="studio-toolbar">
              <div className="tool-group">
                <span className="tool-label">Profile</span>
                <div className="segmented-group" id="baubleShapeGroup">
                  <button type="button" className="seg-btn active" data-shape="ball">Ball</button>
                  <button type="button" className="seg-btn" data-shape="star">Star</button>
                  <button type="button" className="seg-btn" data-shape="teardrop">Teardrop</button>
                </div>
              </div>
              <div className="tool-group">
                <span className="tool-label">Base Tint</span>
                <div className="swatch-row" id="baubleBaseSwatches" />
              </div>
            </div>

            <div className="studio-workspace">
              <div className="canvas-frame">
                <canvas id="baubleCanvas" width={320} height={320} />
              </div>
              <div className="brush-sidebar">
                <div className="tool-group">
                  <span className="tool-label">Paint Color</span>
                  <div className="swatch-grid" id="baubleColorSwatches" />
                </div>
                <div className="tool-group">
                  <span className="tool-label">Brush Size</span>
                  <div className="segmented-group" id="baubleSizeGroup">
                    <button type="button" className="seg-btn" data-size="4">Fine</button>
                    <button type="button" className="seg-btn active" data-size="9">Med</button>
                    <button type="button" className="seg-btn" data-size="16">Bold</button>
                    <button type="button" className="seg-btn" data-eraser="true">Erase</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" id="btnClearBauble" className="hud-btn hud-btn-ghost">Clear Canvas</button>
              <button type="button" id="btnSaveBauble" className="hud-btn hud-btn-primary">
                Save to Inventory
              </button>
            </div>
          </div>

          <div id="stockingStudio" className="studio-panel hidden">
            <div className="studio-toolbar">
              <div className="tool-group tool-group-grow">
                <label htmlFor="stockingNameInput" className="tool-label">Family Name on Cuff</label>
                <input
                  type="text"
                  id="stockingNameInput"
                  className="text-input"
                  maxLength={12}
                  defaultValue="Clara"
                  placeholder="Enter name..."
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="studio-workspace">
              <div className="canvas-frame">
                <canvas id="stockingCanvas" width={320} height={360} />
              </div>
              <div className="brush-sidebar">
                <div className="tool-group">
                  <span className="tool-label">Body Fabric</span>
                  <div className="swatch-grid" id="stockingBodySwatches" />
                </div>
                <div className="tool-group">
                  <span className="tool-label">Cuff Color</span>
                  <div className="swatch-grid" id="stockingCuffSwatches" />
                </div>
                <div className="tool-group">
                  <span className="tool-label">Draw Accent</span>
                  <div className="swatch-grid" id="stockingAccentSwatches" />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" id="btnClearStocking" className="hud-btn hud-btn-ghost">Clear Drawing</button>
              <button type="button" id="btnSaveStocking" className="hud-btn hud-btn-primary">
                Hang on Mantle
              </button>
            </div>
          </div>

          <div id="stickerStudio" className="studio-panel hidden">
            <div className="studio-toolbar">
              <div className="tool-group">
                <span className="tool-label">Geometry Mode</span>
                <div className="segmented-group" id="stickerModeGroup">
                  <button type="button" className="seg-btn active" data-mode="symmetry">
                    6-Fold Snowflake
                  </button>
                  <button type="button" className="seg-btn" data-mode="freehand">
                    Freehand Sticker
                  </button>
                </div>
              </div>
            </div>

            <div className="studio-workspace">
              <div className="canvas-frame canvas-frame-dark">
                <canvas id="stickerCanvas" width={320} height={320} />
              </div>
              <div className="brush-sidebar">
                <div className="tool-group">
                  <span className="tool-label">Frost &amp; Holiday Ink</span>
                  <div className="swatch-grid" id="stickerColorSwatches" />
                </div>
                <div className="tool-group">
                  <span className="tool-label">Stroke Width</span>
                  <div className="segmented-group" id="stickerSizeGroup">
                    <button type="button" className="seg-btn active" data-size="4">Fine</button>
                    <button type="button" className="seg-btn" data-size="8">Med</button>
                    <button type="button" className="seg-btn" data-size="14">Bold</button>
                    <button type="button" className="seg-btn" data-eraser="true">Erase</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" id="btnClearSticker" className="hud-btn hud-btn-ghost">Clear Canvas</button>
              <button type="button" id="btnSaveSticker" className="hud-btn hud-btn-primary">Save Sticker</button>
            </div>
          </div>

          <div id="sleighStudio" className="studio-panel hidden">
            <div className="studio-toolbar">
              <div className="tool-group">
                <span className="tool-label">Creation Mode</span>
                <div className="segmented-group" id="sleighModeGroup">
                  <button type="button" className="seg-btn active" data-mode="sleigh">
                    Painted Sleigh
                  </button>
                  <button type="button" className="seg-btn" data-mode="freeform">
                    Freeform Garden Item
                  </button>
                </div>
              </div>
              <div className="tool-group" id="sleighTrimGroup">
                <span className="tool-label">Sleigh Runners &amp; Trim</span>
                <div className="swatch-row" id="sleighTrimSwatches" />
              </div>
              <div className="tool-group tool-group-grow">
                <label htmlFor="gardenItemNameInput" className="tool-label">Item Label</label>
                <input
                  type="text"
                  id="gardenItemNameInput"
                  className="text-input"
                  maxLength={16}
                  placeholder="Custom Sleigh / Garden Prop"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="studio-workspace">
              <div className="canvas-frame canvas-frame-wide canvas-frame-dark">
                <canvas id="sleighCanvas" width={420} height={260} />
              </div>
              <div className="brush-sidebar">
                <div className="tool-group">
                  <span className="tool-label">Paint Color</span>
                  <div className="swatch-grid" id="sleighColorSwatches" />
                </div>
                <div className="tool-group">
                  <span className="tool-label">Brush Size</span>
                  <div className="segmented-group" id="sleighSizeGroup">
                    <button type="button" className="seg-btn" data-size="5">Fine</button>
                    <button type="button" className="seg-btn active" data-size="10">Med</button>
                    <button type="button" className="seg-btn" data-size="18">Bold</button>
                    <button type="button" className="seg-btn" data-eraser="true">Erase</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" id="btnClearSleigh" className="hud-btn hud-btn-ghost">Clear Paint</button>
              <button type="button" id="btnSaveSleigh" className="hud-btn hud-btn-primary">Save to Garden</button>
            </div>
          </div>
        </div>
      </div>

      <div
        id="photoOverlay"
        className="modal-overlay hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="photoModalTitle"
      >
        <div className="modal-card">
          <div className="modal-header">
            <div>
              <h2 id="photoModalTitle" className="modal-title">Holiday Snapshot</h2>
              <p className="modal-subtitle">
                Saved as a flat JPEG image. Tap Download, Share, or press &amp; hold the photo on mobile to save to your library.
              </p>
            </div>
            <button type="button" id="btnClosePhoto" className="hud-btn hud-btn-ghost">Close</button>
          </div>

          <div className="photo-preview-frame">
            <img id="photoPreviewImg" className="photo-preview-img" alt="Decorated holiday scene snapshot" />
          </div>

          <div className="modal-footer">
            <button type="button" id="btnSharePhoto" className="hud-btn hud-btn-ghost hidden">
              Share / Save to Photos
            </button>
            <a id="btnDownloadPhoto" className="hud-btn hud-btn-primary" download="christmas-decorating-fun.jpg" href="#photo">
              Download JPEG
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
