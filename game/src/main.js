// Boot and the one loop: input is read every frame, the world advances in fixed 1/60 s steps
// (several in a slow frame, none in a fast one), and the renderer paints what is there. The game
// moves between six screens: title, play, paused, level done, win and timeout.
//
// ?seed=N fixes the scene order's randomness. ?shot=start|play|play2|end (with &seed=N) stages
// that scene instead of running the loop, paints it twice and sets window.__shotReady for a
// screenshot.
import { BEST_KEY, STEP } from './config.js';
import { createRandom } from './random.js';
import { createWorld, EVENT_FOUND, EVENT_LEVEL_DONE, EVENT_TICK, EVENT_TIMEOUT, EVENT_WRONG, SCREEN_LEVEL_DONE, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TIMEOUT, SCREEN_TITLE, SCREEN_WIN } from './world.js';
import { ACTION_CONFIRM, ACTION_HINT, ACTION_MUTE, ACTION_NEXT, ACTION_PAUSE, createInput } from './input.js';
import { createRenderer, hintButtonRect, muteButtonRect } from './render.js';
import { createSound } from './sound.js';
import { stageShot } from './shots.js';

/** The longest frame the loop catches up on; a longer stall (a hidden tab) is dropped, not replayed. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);
const sound = createSound();

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function runShot(name) {
  const scene = stageShot(name, world);
  // Paint synchronously, twice, and flag readiness right away: a headless browser may only
  // produce frames on demand, so the shot must not depend on animation frames arriving.
  renderer.draw(world.state, world, scene.best, sound.isMuted());
  renderer.draw(world.state, world, scene.best, sound.isMuted());
  window.__shotReady = true;
}

function runGame() {
  const input = createInput(canvas, renderer.toField);
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();
  let muted = false;

  // Screen readers (and anyone watching the page's text) hear the screen changes and each hit.
  function announce(message) {
    status.textContent = message;
  }

  function finishRun() {
    if (world.state.score > best) {
      best = world.state.score;
      saveBest(best);
    }
  }

  function handleClick(point) {
    if (!point) return;
    const state = world.state;
    if (state.screen === SCREEN_TITLE) {
      sound.unlock();
      world.startGame();
      announce('Playing. Find 7 differences.');
      return;
    }
    if (state.screen === SCREEN_LEVEL_DONE) {
      world.nextLevel();
      announce('Playing. Find 7 differences.');
      return;
    }
    if (state.screen === SCREEN_WIN || state.screen === SCREEN_TIMEOUT) {
      if (state.screen === SCREEN_WIN) finishRun();
      if (state.screen === SCREEN_TIMEOUT) world.resetLevel(state.level);
      else world.startGame();
      if (state.screen === SCREEN_TIMEOUT) world.state.screen = SCREEN_PLAY;
      announce('Playing. Find 7 differences.');
      return;
    }
    if (state.screen !== SCREEN_PLAY) return;
    const hint = hintButtonRect();
    if (point.x >= hint.x && point.x <= hint.x + hint.w && point.y >= hint.y && point.y <= hint.y + hint.h) {
      const found = world.useHint();
      if (found) {
        sound.hint();
        announce(`Hint: look near ${found.name}.`);
      }
      return;
    }
    const mute = muteButtonRect();
    if (point.x >= mute.x && point.x <= mute.x + mute.w && point.y >= mute.y && point.y <= mute.y + mute.h) {
      muted = sound.toggleMute();
      return;
    }
    const events = world.click(point.x, point.y);
    if (events & EVENT_FOUND) {
      sound.found();
      announce(world.state.message);
      if (events & EVENT_LEVEL_DONE) {
        if (world.state.screen === SCREEN_WIN) {
          sound.win();
          finishRun();
          announce(`You found every difference! Score ${world.state.score}.`);
        } else {
          sound.levelClear();
          announce(`${world.scene().name} cleared. Score ${world.state.score}.`);
        }
      }
    } else if (events & EVENT_WRONG) {
      sound.wrong();
      announce(world.state.message);
    }
  }

  function handleActions() {
    const actions = input.takeActions();
    const state = world.state;
    if (actions & ACTION_MUTE) muted = sound.toggleMute();
    if (actions & ACTION_HINT && state.screen === SCREEN_PLAY) {
      const found = world.useHint();
      if (found) {
        sound.hint();
        announce(`Hint: look near ${found.name}.`);
      }
    }
    if (actions & ACTION_PAUSE && (state.screen === SCREEN_PLAY || state.screen === SCREEN_PAUSED)) {
      world.togglePause();
      announce(state.screen === SCREEN_PAUSED ? 'Paused.' : 'Playing.');
    }
    if (actions & ACTION_CONFIRM) {
      sound.unlock();
      if (state.screen === SCREEN_TITLE) {
        world.startGame();
        announce('Playing. Find 7 differences.');
      } else if (state.screen === SCREEN_LEVEL_DONE) {
        world.nextLevel();
        announce('Playing. Find 7 differences.');
      } else if (state.screen === SCREEN_WIN) {
        finishRun();
        world.startGame();
        announce('Playing. Find 7 differences.');
      } else if (state.screen === SCREEN_TIMEOUT) {
        world.resetLevel(state.level);
        world.state.screen = SCREEN_PLAY;
        announce('Playing. Find 7 differences.');
      }
    }
    if (actions & ACTION_NEXT && state.screen === SCREEN_LEVEL_DONE) {
      world.nextLevel();
      announce('Playing. Find 7 differences.');
    }
  }

  function step() {
    const events = world.step(STEP);
    if (events & EVENT_TIMEOUT) {
      announce('Time ran out. The lanterns burned down.');
    } else if (events & EVENT_TICK) {
      sound.tick();
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleActions();
    handleClick(input.takeClick());
    if (world.state.screen === SCREEN_PLAY) {
      while (accumulator >= STEP && world.state.screen === SCREEN_PLAY) {
        step();
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
      // The world still ages its markers and popups off the play screen.
      world.step(STEP);
    }
    renderer.draw(world.state, world, best, muted);
  }

  // Leaving the tab pauses a running game rather than letting the clock run unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && world.state.screen === SCREEN_PLAY) {
      world.togglePause();
      announce('Paused.');
    }
  });

  announce('Twin Lanterns. Press Space or click to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
