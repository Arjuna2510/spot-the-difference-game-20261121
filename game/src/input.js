// Keyboard and pointer input. One-shot presses (start, pause, hint, mute) are queued as bit
// flags and taken once by the loop, so a press between two frames is never lost and never
// counted twice. Pointer clicks are delivered with their logical field coordinates.

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_HINT = 4;
export const ACTION_MUTE = 8;
export const ACTION_NEXT = 16;

const CONFIRM = new Set(['Space', 'Enter']);
const PAUSE = new Set(['KeyP', 'Escape']);
const HINT = new Set(['KeyH']);
const MUTE = new Set(['KeyM']);
const NEXT = new Set(['KeyN']);

export function createInput(canvas, toField) {
  let actions = 0;
  let clickPoint = null;

  window.addEventListener('keydown', (event) => {
    if (CONFIRM.has(event.code)) {
      if (!event.repeat) actions |= ACTION_CONFIRM;
    } else if (PAUSE.has(event.code)) {
      if (!event.repeat) actions |= ACTION_PAUSE;
    } else if (HINT.has(event.code)) {
      if (!event.repeat) actions |= ACTION_HINT;
    } else if (MUTE.has(event.code)) {
      if (!event.repeat) actions |= ACTION_MUTE;
    } else if (NEXT.has(event.code)) {
      if (!event.repeat) actions |= ACTION_NEXT;
    } else return;
    event.preventDefault();
  });
  canvas.addEventListener('pointerdown', (event) => {
    clickPoint = toField(event.clientX, event.clientY);
  });

  return {
    /** The one-shot presses since the last call, as ACTION_* flags. */
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
    /** The last pointer click in logical field coordinates, or null. */
    takeClick() {
      const point = clickPoint;
      clickPoint = null;
      return point;
    },
  };
}
