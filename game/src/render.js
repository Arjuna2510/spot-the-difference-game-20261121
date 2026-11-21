// Drawing only: the world's state and the current screen in, pixels out. The 1280x720
// playfield is scaled to fit the window and centred, the margin filled with the backdrop
// colour. The two pictures are painted once per level into offscreen canvases (see scenes.js)
// and blitted here; markers, the HUD and the panels are drawn every frame. Text that holds a
// number is rebuilt only when the number changes, so a frame allocates nothing.

import { BAR, FIELD, FONT, FONT_UI, HUD, PALETTE, PANEL } from './config.js';
import { SCENES, sceneCanvas } from './scenes.js';
import { SCREEN_LEVEL_DONE, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TIMEOUT, SCREEN_TITLE, SCREEN_WIN } from './world.js';

const PANEL_LABELS = ['PICTURE A', 'PICTURE B'];
const HINT_BUTTON = { x: 40, y: BAR.y + 10, w: 190, h: 44 };
const MUTE_BUTTON = { x: FIELD.width - 230, y: BAR.y + 10, w: 190, h: 44 };

export function hintButtonRect() {
  return HINT_BUTTON;
}

export function muteButtonRect() {
  return MUTE_BUTTON;
}

function cachedLabel(prefix) {
  let value = -1;
  let text = '';
  return function label(next) {
    if (next !== value) {
      value = next;
      text = prefix + next;
    }
    return text;
  };
}

export function createRenderer(canvas) {
  const context = canvas.getContext('2d');
  const view = { scale: 1, x: 0, y: 0 };
  const foundLabel = cachedLabel('Found ');
  const timeLabel = cachedLabel('');
  const scoreLabel = cachedLabel('Score ');
  const bestLabel = cachedLabel('Best ');
  const levelLabel = cachedLabel('Level ');

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    const width = Math.round(window.innerWidth * ratio);
    const height = Math.round(window.innerHeight * ratio);
    canvas.width = width;
    canvas.height = height;
    view.scale = Math.min(width / FIELD.width, height / FIELD.height);
    view.x = (width - FIELD.width * view.scale) / 2;
    view.y = (height - FIELD.height * view.scale) / 2;
  }

  const fonts = new Map();
  function text(value, x, y, size, color, align, font) {
    const key = `${size}|${font || FONT_UI}`;
    if (!fonts.has(key)) fonts.set(key, `${size}px ${font || FONT_UI}`);
    context.font = fonts.get(key);
    context.fillStyle = color;
    context.textAlign = align;
    context.fillText(value, x, y);
  }

  function roundRect(x, y, w, h, r) {
    context.beginPath();
    context.moveTo(x + r, y);
    context.arcTo(x + w, y, x + w, y + h, r);
    context.arcTo(x + w, y + h, x, y + h, r);
    context.arcTo(x, y + h, x, y, r);
    context.arcTo(x, y, x + w, y, r);
    context.closePath();
  }

  function drawMarker(x, y, time, found) {
    // A gold ring with a soft pulse; found markers sit on the pictures themselves.
    const pulse = 1 + 0.08 * Math.sin(time * 4);
    context.lineWidth = 4;
    context.strokeStyle = '#ffd166';
    context.beginPath();
    context.arc(x, y, 24 * pulse, 0, Math.PI * 2);
    context.stroke();
    context.lineWidth = 1.5;
    context.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    context.beginPath();
    context.arc(x, y, 29 * pulse, 0, Math.PI * 2);
    context.stroke();
    if (found) {
      context.strokeStyle = '#ffd166';
      context.lineWidth = 4;
      context.lineCap = 'round';
      context.beginPath();
      context.moveTo(x - 9, y);
      context.lineTo(x - 2, y + 8);
      context.lineTo(x + 10, y - 8);
      context.stroke();
    }
  }

  function drawPanels(world) {
    const state = world.state;
    const scene = SCENES[state.level];
    const xs = [PANEL.leftX, PANEL.rightX];
    for (let p = 0; p < 2; p += 1) {
      context.drawImage(sceneCanvas(state.level, p === 1), xs[p], PANEL.y, PANEL.width, PANEL.height);
      context.strokeStyle = PALETTE.frameEdge;
      context.lineWidth = 3;
      context.strokeRect(xs[p], PANEL.y, PANEL.width, PANEL.height);
      // Picture label above each panel.
      text(PANEL_LABELS[p], xs[p] + PANEL.width / 2, PANEL.y - 12, 15, PALETTE.panelLabel, 'center', FONT_UI);
    }
    // Found markers on both pictures.
    for (const diff of scene.differences) {
      if (!world.isFound(diff.id)) continue;
      drawMarker(PANEL.leftX + diff.x, PANEL.y + diff.y, state.elapsed, true);
      drawMarker(PANEL.rightX + diff.x, PANEL.y + diff.y, state.elapsed, true);
    }
    // Hint pulse: a breathing ring on the one difference the hint points at.
    if (state.hintPulse) {
      const pulse = 1 + 0.18 * Math.sin(state.elapsed * 6);
      context.lineWidth = 4;
      context.strokeStyle = '#7ddb8a';
      context.beginPath();
      context.arc(PANEL.rightX + state.hintPulse.x, PANEL.y + state.hintPulse.y, 30 * pulse, 0, Math.PI * 2);
      context.stroke();
      context.beginPath();
      context.arc(PANEL.leftX + state.hintPulse.x, PANEL.y + state.hintPulse.y, 30 * pulse, 0, Math.PI * 2);
      context.stroke();
    }
    // Wrong-click crosses, fading with their remaining life.
    for (const mark of state.wrongMarks) {
      const alpha = Math.max(0, (mark.until - state.elapsed) / 1.4);
      context.globalAlpha = alpha;
      context.strokeStyle = '#ff6b6b';
      context.lineWidth = 4;
      context.lineCap = 'round';
      context.beginPath();
      context.moveTo(mark.x - 10, mark.y - 10);
      context.lineTo(mark.x + 10, mark.y + 10);
      context.moveTo(mark.x + 10, mark.y - 10);
      context.lineTo(mark.x - 10, mark.y + 10);
      context.stroke();
      context.globalAlpha = 1;
    }
    // Score popups.
    context.textBaseline = 'alphabetic';
    for (const pop of state.pops) {
      const alpha = Math.max(0, (pop.until - state.elapsed) / 1.1);
      context.globalAlpha = alpha;
      text(pop.text, pop.x, pop.y - 30, 22, '#ffd166', 'center', FONT_UI);
      context.globalAlpha = 1;
    }
  }

  function drawHud(world) {
    const state = world.state;
    const scene = SCENES[state.level];
    context.fillStyle = PALETTE.frame;
    context.fillRect(0, 0, FIELD.width, HUD.height);
    context.fillStyle = PALETTE.frameEdge;
    context.fillRect(0, HUD.height - 2, FIELD.width, 2);
    context.textBaseline = 'alphabetic';
    text('TWIN LANTERNS', 40, 30, 24, PALETTE.hudText, 'left', FONT);
    text(`${scene.name}  ·  ${scene.subtitle}`, 40, 56, 14, PALETTE.hudMuted, 'left', FONT_UI);
    // The counter: how many differences are found, and how many remain.
    const remaining = 7 - world.foundCount();
    context.fillStyle = PALETTE.button;
    roundRect(500, 12, 280, 48, 12);
    context.fill();
    context.strokeStyle = PALETTE.buttonEdge;
    context.lineWidth = 2;
    context.stroke();
    text(foundLabel(world.foundCount()) + ` of 7  ·  ${remaining} left`, 640, 44, 24, PALETTE.accent, 'center', FONT_UI);
    // Timer and score, right.
    const seconds = Math.max(0, Math.ceil(state.timeLeft));
    const mm = Math.floor(seconds / 60);
    const ss = String(seconds % 60).padStart(2, '0');
    const timeColor = seconds <= 30 ? PALETTE.bad : PALETTE.hudText;
    text(timeLabel(`${mm}:${ss}`), 900, 44, 28, timeColor, 'center', FONT_UI);
    text(scoreLabel(state.score), 1060, 44, 24, PALETTE.hudText, 'center', FONT_UI);
    text(levelLabel(state.level + 1) + ' / 3', 1200, 44, 18, PALETTE.hudMuted, 'center', FONT_UI);
    // Message line under the HUD.
    if (state.message && state.elapsed < state.messageUntil) {
      text(state.message, FIELD.width / 2, HUD.height + 26, 16, PALETTE.good, 'center', FONT_UI);
    }
  }

  function drawBottomBar(world, muted) {
    const state = world.state;
    context.textBaseline = 'alphabetic';
    // Hint button.
    context.fillStyle = state.hintsLeft > 0 ? PALETTE.button : '#2a2138';
    roundRect(HINT_BUTTON.x, HINT_BUTTON.y, HINT_BUTTON.w, HINT_BUTTON.h, 10);
    context.fill();
    context.strokeStyle = PALETTE.buttonEdge;
    context.lineWidth = 2;
    context.stroke();
    text(`Hint  (${state.hintsLeft} left)`, HINT_BUTTON.x + HINT_BUTTON.w / 2, HINT_BUTTON.y + 29, 17, state.hintsLeft > 0 ? PALETTE.hudText : PALETTE.hudMuted, 'center', FONT_UI);
    // Level dots, left of the centred help line so nothing overlaps.
    for (let i = 0; i < SCENES.length; i += 1) {
      context.fillStyle = i < state.level ? PALETTE.good : i === state.level ? PALETTE.accent : '#4a3f66';
      context.beginPath();
      context.arc(280 + i * 30, BAR.y + 32, 8, 0, Math.PI * 2);
      context.fill();
    }
    text('Click a difference on either picture  ·  H hint  ·  P pause  ·  M sound', 640, BAR.y + 38, 14, PALETTE.hudMuted, 'center', FONT_UI);
    // Sound button.
    context.fillStyle = PALETTE.button;
    roundRect(MUTE_BUTTON.x, MUTE_BUTTON.y, MUTE_BUTTON.w, MUTE_BUTTON.h, 10);
    context.fill();
    context.strokeStyle = PALETTE.buttonEdge;
    context.lineWidth = 2;
    context.stroke();
    text(muted ? 'Sound: off  (M)' : 'Sound: on  (M)', MUTE_BUTTON.x + MUTE_BUTTON.w / 2, MUTE_BUTTON.y + 29, 17, PALETTE.hudText, 'center', FONT_UI);
  }

  function drawPanel(title, lines, prompt, accent) {
    const width = 640;
    const height = 150 + lines.length * 36;
    const x = (FIELD.width - width) / 2;
    const y = (FIELD.height - height) / 2;
    context.fillStyle = 'rgba(18, 13, 32, 0.5)';
    context.fillRect(0, 0, FIELD.width, FIELD.height);
    context.fillStyle = PALETTE.frame;
    roundRect(x, y, width, height, 16);
    context.fill();
    context.strokeStyle = PALETTE.frameEdge;
    context.lineWidth = 2;
    context.stroke();
    context.textBaseline = 'alphabetic';
    text(title, FIELD.width / 2, y + 66, 42, accent || PALETTE.hudText, 'center', FONT);
    for (let i = 0; i < lines.length; i += 1) {
      text(lines[i], FIELD.width / 2, y + 112 + i * 36, 20, PALETTE.muted, 'center', FONT_UI);
    }
    text(prompt, FIELD.width / 2, y + height - 30, 20, PALETTE.accent, 'center', FONT_UI);
  }

  function draw(state, world, best, muted) {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillStyle = PALETTE.backdrop;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.setTransform(view.scale, 0, 0, view.scale, view.x, view.y);
    context.textBaseline = 'alphabetic';
    if (state.screen === SCREEN_TITLE) {
      drawPanels(world);
      drawHud(world);
      drawBottomBar(world, muted);
      drawPanel(
        'Twin Lanterns',
        [
          'Two pictures, seven tiny changes. Find them all before the lanterns burn down.',
          'Click a difference on either picture. A wrong click costs 5 seconds.',
          'Three scenes: a harbour at dawn, a night market, a bookshop in the snow.',
          best > 0 ? bestLabel(best) + ' is the score to beat.' : 'No best score yet — set one.',
        ],
        'Press Space or click to start',
      );
      return;
    }
    drawPanels(world);
    drawHud(world);
    drawBottomBar(world, muted);
    if (state.screen === SCREEN_PAUSED) {
      drawPanel('Paused', ['The lanterns wait for you.'], 'Press P to keep playing');
    } else if (state.screen === SCREEN_LEVEL_DONE) {
      const scene = SCENES[state.level];
      drawPanel(
        `${scene.name} — cleared!`,
        [
          `All 7 differences found. Level bonus: ${state.levelScore} points.`,
          `Total score: ${state.score}. ${state.level + 1 < SCENES.length ? `Next: ${SCENES[state.level + 1].name}.` : ''}`,
        ],
        'Press Space or click for the next scene',
      );
    } else if (state.screen === SCREEN_WIN) {
      const stars = '★'.repeat(state.stars) + '☆'.repeat(3 - state.stars);
      drawPanel(
        'Every difference found!',
        [
          stars,
          `You cleared all three scenes — ${state.score} points in all.`,
          state.score >= best ? 'A new best score!' : bestLabel(best) + ' is still the best.',
        ],
        'Press Space or click to play again',
        PALETTE.accent,
      );
    } else if (state.screen === SCREEN_TIMEOUT) {
      drawPanel(
        'The lanterns burned down…',
        [
          `You found ${world.foundCount()} of 7 differences in ${SCENES[state.level].name}.`,
          'The seven changes are still hiding there. Try the scene again?',
        ],
        'Press Space or click to retry this scene',
        PALETTE.bad,
      );
    }
  }

  /** Convert a client (mouse) point to logical field coordinates. The canvas fills the window,
   *  so the client point scales by the window-to-field ratio; the view's letterbox offset and
   *  device-pixel scale invert the draw transform exactly. */
  function toField(clientX, clientY) {
    const ratio = window.devicePixelRatio || 1;
    return {
      x: (clientX * ratio - view.x) / view.scale,
      y: (clientY * ratio - view.y) / view.scale,
    };
  }

  resize();
  window.addEventListener('resize', resize);
  return { draw, toField };
}
