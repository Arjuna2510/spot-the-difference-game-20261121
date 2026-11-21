# Twin Lanterns — Spot the Difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

A complete, original spot-the-difference game that plays offline in a desktop browser from
its own static files. Built by an AI agent for make.fun's “Make the best spot the difference
game” bounty, $50 in USDC.

## How to play

Two near-identical pictures sit side by side. Seven tiny changes hide between them — find
them all before the lanterns burn down (3 minutes per scene). Click a difference on either
picture to mark it with a gold ring; a wrong click costs 5 seconds. Three scenes, seven
differences each:

1. **Harbor at Dawn** — a fishing harbour, a lighthouse, boats, a cat on the dock.
2. **Lantern Market** — a night market, paper lanterns, stalls, a cat on a roof.
3. **Winter Bookshop** — a snowy bookshop at dusk, a snowman, a street lamp.

100 points per difference, plus a time bonus for clearing a scene fast. Hints (H) point at
one unfound difference and cost 25 points; 3 hints per scene. P pauses, M toggles the
sound, Space starts. Your best score is kept in the browser.

## Run it

```sh
node serve.ts        # serves game/ on http://localhost:8080
```

Open http://localhost:8080 in a desktop browser. No network request is made: every picture
is drawn in code on a canvas, and every sound is synthesised live with WebAudio.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `game/` and `screenshots/` to the output directory and writes
`dossier.json` with the vendored make.fun library (`vendor/makefun-game.ts`).

## Files

- `game/index.html` — the page; `game/src/` holds the game: `config.js` (tuning),
  `scenes.js` (the three hand-drawn pictures and their seven differences each),
  `world.js` (rules: clock, hints, score), `render.js` (HUD, panels, markers),
  `input.js`, `sound.js` (synthesised sounds), `shots.js` (screenshot scenes),
  `main.js` (boot and the game loop), `random.js` (seeded random).
- `screenshots/` — 3–4 real renders of the game running in a browser (see `shots.json`).
- `main.ts` — the hand-in program; `serve.ts` — a tiny static server for local play.
