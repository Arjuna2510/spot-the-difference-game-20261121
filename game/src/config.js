// Twin Lanterns — Spot the Difference. Every tuning number and colour in one place.
// The playfield is a fixed 1280x720 logical area; the renderer scales it to the window, so no
// rule below depends on the screen size. Two picture panels sit side by side under the HUD.

export const FIELD = { width: 1280, height: 720 };

/** One picture panel: the two near-identical pictures the player compares. */
export const PANEL = { width: 580, height: 430, y: 104, leftX: 40, rightX: 660 };

export const HUD = { height: 72 };
export const BAR = { y: 556, height: 64 };

export const STEP = 1 / 60;

/** Seconds on the clock for each level; finding every difference beats the clock. */
export const LEVEL_SECONDS = 180;

/** Differences in every level; hints per level; points per difference found. */
export const DIFFERENCES_PER_LEVEL = 7;
export const HINTS_PER_LEVEL = 3;
export const POINTS_PER_FIND = 100;
export const TIME_BONUS_PER_SECOND = 2;
export const WRONG_CLICK_PENALTY_SECONDS = 5;
export const HINT_SCORE_COST = 25;

/** How far, in panel pixels, a click may land from a difference and still count. */
export const HIT_RADIUS = 34;

export const PALETTE = {
  backdrop: '#171226',
  frame: '#241c3d',
  frameEdge: '#3a2d5e',
  panelLabel: '#efe7d6',
  hudText: '#f5efe0',
  hudMuted: '#b9aec9',
  accent: '#ffc53d',
  accentDeep: '#e89b0c',
  good: '#7ddb8a',
  bad: '#ff6b6b',
  panel: '#221a35',
  text: '#f5efe0',
  muted: '#b9aec9',
  button: '#3a2d5e',
  buttonEdge: '#5a4a86',
  star: '#ffd166',
};

export const FONT = 'Georgia, "Times New Roman", serif';
export const FONT_UI = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'twin-lanterns.best';
