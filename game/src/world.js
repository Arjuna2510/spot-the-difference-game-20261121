// The game's rules and state, with no drawing and no browser in it: levels, the differences
// found, the clock, hints, score and the screens the game moves between. step() advances one
// fixed step and returns what happened as bit flags, so the caller can react (sounds, messages)
// without the world knowing about screens or audio. Nothing here allocates after createWorld
// returns, except the small found/popup lists the game itself owns.

import {
  DIFFERENCES_PER_LEVEL,
  HINTS_PER_LEVEL,
  HINT_SCORE_COST,
  HIT_RADIUS,
  LEVEL_SECONDS,
  PANEL,
  POINTS_PER_FIND,
  TIME_BONUS_PER_SECOND,
} from './config.js';
import { SCENES } from './scenes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_LEVEL_DONE = 'leveldone';
export const SCREEN_WIN = 'win';
export const SCREEN_TIMEOUT = 'timeout';

export const EVENT_FOUND = 1;
export const EVENT_WRONG = 2;
export const EVENT_LEVEL_DONE = 4;
export const EVENT_TIMEOUT = 8;
export const EVENT_TICK = 16;

export function createWorld(random) {
  const state = {
    screen: SCREEN_TITLE,
    level: 0,
    found: [],
    wrongMarks: [],
    pops: [],
    hintsLeft: HINTS_PER_LEVEL,
    hintPulse: null,
    score: 0,
    levelScore: 0,
    timeLeft: LEVEL_SECONDS,
    best: 0,
    message: '',
    messageUntil: 0,
    elapsed: 0,
    lastTickSecond: -1,
    stars: 0,
    levelTimes: [],
  };

  function resetLevel(level) {
    state.level = level;
    state.found = [];
    state.wrongMarks = [];
    state.pops = [];
    state.hintsLeft = HINTS_PER_LEVEL;
    state.hintPulse = null;
    state.levelScore = 0;
    state.timeLeft = LEVEL_SECONDS;
    state.lastTickSecond = -1;
    state.message = '';
  }

  function startGame() {
    state.score = 0;
    state.stars = 0;
    state.levelTimes = [];
    resetLevel(0);
    state.screen = SCREEN_PLAY;
  }

  function scene() {
    return SCENES[state.level];
  }

  function foundCount() {
    return state.found.length;
  }

  function remaining() {
    return DIFFERENCES_PER_LEVEL - state.found.length;
  }

  function isFound(id) {
    return state.found.includes(id);
  }

  function nextUnfound() {
    const diffs = scene().differences;
    for (const diff of diffs) if (!isFound(diff.id)) return diff;
    return null;
  }

  function useHint() {
    if (state.screen !== SCREEN_PLAY || state.hintsLeft <= 0) return null;
    const diff = nextUnfound();
    if (!diff) return null;
    state.hintsLeft -= 1;
    state.score = Math.max(0, state.score - HINT_SCORE_COST);
    state.hintPulse = { id: diff.id, x: diff.x, y: diff.y, until: state.elapsed + 2.2 };
    return diff;
  }

  /**
   * A click in logical field coordinates. Returns an event flag. Clicking a difference on
   * either picture counts; a click anywhere else on a picture is a wrong click and costs
   * five seconds. Clicks on the HUD or the bottom bar are not game clicks.
   */
  function click(x, y) {
    if (state.screen !== SCREEN_PLAY) return 0;
    const panels = [
      { px: PANEL.leftX, py: PANEL.y },
      { px: PANEL.rightX, py: PANEL.y },
    ];
    for (const panel of panels) {
      const lx = x - panel.px;
      const ly = y - panel.py;
      if (lx < 0 || lx > PANEL.width || ly < 0 || ly > PANEL.height) continue;
      for (const diff of scene().differences) {
        if (isFound(diff.id)) continue;
        const dx = lx - diff.x;
        const dy = ly - diff.y;
        if (dx * dx + dy * dy <= HIT_RADIUS * HIT_RADIUS) {
          state.found.push(diff.id);
          state.score += POINTS_PER_FIND;
          state.levelScore += POINTS_PER_FIND;
          state.pops.push({ text: `+${POINTS_PER_FIND}`, x, y, until: state.elapsed + 1.1 });
          state.message = `Found: ${diff.name}!`;
          state.messageUntil = state.elapsed + 2.2;
          if (state.found.length >= DIFFERENCES_PER_LEVEL) {
            const bonus = Math.round(state.timeLeft) * TIME_BONUS_PER_SECOND;
            state.score += bonus;
            state.levelScore += bonus;
            state.levelTimes.push(Math.round(state.timeLeft));
            state.screen = state.level >= SCENES.length - 1 ? SCREEN_WIN : SCREEN_LEVEL_DONE;
            if (state.screen === SCREEN_WIN) {
              state.stars = state.score >= 2400 ? 3 : state.score >= 1900 ? 2 : 1;
            }
            return EVENT_FOUND | EVENT_LEVEL_DONE;
          }
          return EVENT_FOUND;
        }
      }
      // On a picture but on no difference: a wrong click.
      state.wrongMarks.push({ x, y, until: state.elapsed + 1.4 });
      state.timeLeft = Math.max(0, state.timeLeft - 5);
      state.message = 'Not there — minus 5 seconds!';
      state.messageUntil = state.elapsed + 2.2;
      return EVENT_WRONG;
    }
    return 0;
  }

  function nextLevel() {
    if (state.screen !== SCREEN_LEVEL_DONE) return;
    resetLevel(state.level + 1);
    state.screen = SCREEN_PLAY;
  }

  function togglePause() {
    if (state.screen === SCREEN_PLAY) state.screen = SCREEN_PAUSED;
    else if (state.screen === SCREEN_PAUSED) state.screen = SCREEN_PLAY;
  }

  function step(dt) {
    let events = 0;
    state.elapsed += dt;
    if (state.screen === SCREEN_PLAY) {
      state.timeLeft -= dt;
      const whole = Math.ceil(state.timeLeft);
      if (whole !== state.lastTickSecond) {
        state.lastTickSecond = whole;
        if (whole <= 10 && whole > 0) events |= EVENT_TICK;
      }
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        state.screen = SCREEN_TIMEOUT;
        events |= EVENT_TIMEOUT;
      }
    }
    if (state.hintPulse && state.elapsed > state.hintPulse.until) state.hintPulse = null;
    state.wrongMarks = state.wrongMarks.filter((mark) => state.elapsed < mark.until);
    state.pops = state.pops.filter((pop) => state.elapsed < pop.until);
    return events;
  }

  return {
    state,
    scene,
    foundCount,
    remaining,
    isFound,
    nextUnfound,
    useHint,
    click,
    startGame,
    resetLevel,
    nextLevel,
    togglePause,
    step,
  };
}
