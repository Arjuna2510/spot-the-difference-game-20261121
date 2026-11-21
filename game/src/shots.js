// The screenshot scenes behind ?shot=start|play|play2|end. Each one sets the world to a real
// game state — the same state a player reaches by playing — so the frame is what the game
// really looks like, and the same seed always gives the same frame. The renderer paints twice
// and sets window.__shotReady for the screenshot tool.
//
// start — title screen over the harbour, nothing found yet.
// play  — mid-game on the harbour: 3 of 7 found, markers on both pictures, 4 left to find.
// play2 — mid-game at the lantern market: 2 of 7 found, 5 left to find.
// end   — the win screen: all three scenes cleared, three stars, a new best score.

import { SCREEN_LEVEL_DONE, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './world.js';
import { SCENES } from './scenes.js';

export function stageShot(name, world) {
  const state = world.state;
  if (name === 'play') {
    world.startGame();
    const diffs = SCENES[0].differences;
    state.found = diffs.slice(0, 3).map((diff) => diff.id);
    state.score = 300;
    state.levelScore = 300;
    state.timeLeft = 143;
    state.screen = SCREEN_PLAY;
    return { screen: SCREEN_PLAY, best: 0 };
  }
  if (name === 'play2') {
    world.startGame();
    world.resetLevel(1);
    const diffs = SCENES[1].differences;
    state.found = diffs.slice(0, 2).map((diff) => diff.id);
    state.score = 200;
    state.levelScore = 200;
    state.timeLeft = 158;
    state.hintsLeft = 2;
    state.screen = SCREEN_PLAY;
    return { screen: SCREEN_PLAY, best: 300 };
  }
  if (name === 'end') {
    world.startGame();
    state.level = 2;
    state.found = SCENES[2].differences.map((diff) => diff.id);
    state.score = 2450;
    state.levelScore = 750;
    state.stars = 3;
    state.screen = SCREEN_WIN;
    return { screen: SCREEN_WIN, best: 2450 };
  }
  if (name === 'leveldone') {
    world.startGame();
    state.found = SCENES[0].differences.map((diff) => diff.id);
    state.score = 850;
    state.levelScore = 850;
    state.screen = SCREEN_LEVEL_DONE;
    return { screen: SCREEN_LEVEL_DONE, best: 0 };
  }
  world.startGame();
  world.resetLevel(0);
  state.screen = SCREEN_TITLE;
  return { screen: SCREEN_TITLE, best: 0 };
}
