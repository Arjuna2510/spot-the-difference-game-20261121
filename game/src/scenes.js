// The three pictures, drawn entirely in code — no image files, nothing borrowed. Each scene is
// one function that paints a 580x430 panel; called with altered=false it paints Picture A, with
// altered=true it paints Picture B, changing exactly the seven differences listed for the scene.
// A difference is a named spot (x, y in panel pixels) the player can click on either picture.
//
// Scene 1 — Harbor at Dawn: a fishing harbour, lighthouse, boats, a cat on the dock.
// Scene 2 — Lantern Market: a night market, paper lanterns, stalls, a cat on a roof.
// Scene 3 — Winter Bookshop: a snowy bookshop at dusk, a snowman, a street lamp.

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
}

function poly(ctx, points) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
}

function line(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
}

function gull(ctx, x, y, s, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - s, y);
  ctx.quadraticCurveTo(x - s / 2, y - s * 0.7, x, y);
  ctx.quadraticCurveTo(x + s / 2, y - s * 0.7, x + s, y);
  ctx.stroke();
}

function star4(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
}

/* ------------------------------------------------------------------ */
/* Scene 1 — Harbor at Dawn                                            */
/* ------------------------------------------------------------------ */

const HARBOR_DIFFS = [
  { id: 'lamp', name: 'Lighthouse lamp', x: 78, y: 128, r: 30 },
  { id: 'gull', name: 'Middle gull', x: 262, y: 72, r: 26 },
  { id: 'flag', name: 'Boat flag', x: 318, y: 218, r: 26 },
  { id: 'fish', name: 'Fish in the bucket', x: 148, y: 392, r: 28 },
  { id: 'tail', name: "Cat's tail", x: 268, y: 398, r: 28 },
  { id: 'crate', name: 'Top crate', x: 516, y: 356, r: 28 },
  { id: 'buoy', name: 'Buoy', x: 448, y: 300, r: 28 },
];

function drawHarbor(ctx, altered, W, H) {
  // Dawn sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 250);
  sky.addColorStop(0, '#f7a86b');
  sky.addColorStop(0.55, '#ffc98f');
  sky.addColorStop(1, '#ffe9c4');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, 250);

  // Sun with a soft glow, low over the water.
  const glow = ctx.createRadialGradient(472, 96, 8, 472, 96, 90);
  glow.addColorStop(0, 'rgba(255, 214, 110, 0.9)');
  glow.addColorStop(1, 'rgba(255, 214, 110, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(372, 0, 200, 200);
  ctx.fillStyle = '#ffd166';
  circle(ctx, 472, 96, 32);
  ctx.fill();
  ctx.fillStyle = '#fff3c4';
  circle(ctx, 472, 96, 24);
  ctx.fill();

  // Soft clouds.
  ctx.fillStyle = 'rgba(255, 244, 224, 0.9)';
  ellipse(ctx, 150, 62, 52, 14);
  ctx.fill();
  ellipse(ctx, 186, 54, 40, 12);
  ctx.fill();
  ellipse(ctx, 350, 44, 46, 12);
  ctx.fill();

  // Gulls — the middle one is missing in Picture B.
  gull(ctx, 196, 92, 13, '#5a4632');
  if (!altered) gull(ctx, 262, 72, 13, '#5a4632');
  gull(ctx, 330, 96, 13, '#5a4632');

  // Distant headland.
  ctx.fillStyle = '#8fae9d';
  poly(ctx, [[0, 250], [90, 196], [190, 224], [250, 250]]);
  ctx.fill();
  ctx.fillStyle = '#7d9c8b';
  poly(ctx, [[430, 250], [520, 210], [580, 232], [580, 250]]);
  ctx.fill();

  // Sea.
  const sea = ctx.createLinearGradient(0, 250, 0, H);
  sea.addColorStop(0, '#3d8b96');
  sea.addColorStop(1, '#175e6b');
  ctx.fillStyle = sea;
  ctx.fillRect(0, 250, W, H - 250);
  // Sun glitter on the water.
  ctx.fillStyle = 'rgba(255, 214, 110, 0.55)';
  for (let i = 0; i < 7; i += 1) {
    const y = 262 + i * 20;
    ctx.fillRect(446 - i * 3, y, 52 + i * 6, 3);
  }
  // Wave strokes.
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
  ctx.lineWidth = 2;
  for (const [x, y, w] of [[120, 292, 60], [300, 316, 70], [60, 340, 46], [500, 336, 56], [210, 372, 64]]) {
    line(ctx, x, y, x + w, y);
    ctx.stroke();
  }

  // Buoy — orange in A, green in B.
  ctx.fillStyle = altered ? '#3fae6a' : '#e8632c';
  ctx.beginPath();
  ctx.arc(448, 300, 13, 0, Math.PI, true);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fff3e0';
  ctx.fillRect(437, 296, 22, 6);
  ctx.fillStyle = '#3a2a1e';
  ctx.fillRect(446, 282, 4, 8);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  line(ctx, 430, 312, 466, 312);
  ctx.stroke();

  // Lighthouse on the rocky point, left.
  ctx.fillStyle = '#6b5a48';
  poly(ctx, [[18, 330], [46, 252], [112, 252], [140, 330]]);
  ctx.fill();
  ctx.fillStyle = '#5a4a3a';
  ellipse(ctx, 79, 330, 62, 10);
  ctx.fill();
  // Tower: white with two red bands.
  ctx.fillStyle = '#fdf6e9';
  poly(ctx, [[62, 252], [70, 150], [88, 150], [96, 252]]);
  ctx.fill();
  ctx.fillStyle = '#d64541';
  poly(ctx, [[66, 214], [92, 214], [94, 196], [64, 196]]);
  ctx.fill();
  poly(ctx, [[68, 176], [90, 176], [91, 160], [67, 160]]);
  ctx.fill();
  // Gallery and lamp room. The lamp shines in A and is dark in B.
  ctx.fillStyle = '#2f2a26';
  ctx.fillRect(64, 144, 30, 8);
  ctx.fillStyle = altered ? '#3a3f4a' : '#ffe9a8';
  ctx.fillRect(70, 122, 18, 22);
  ctx.fillStyle = '#2f2a26';
  ctx.beginPath();
  ctx.moveTo(66, 122);
  ctx.lineTo(92, 122);
  ctx.lineTo(79, 110);
  ctx.closePath();
  ctx.fill();
  if (!altered) {
    const beam = ctx.createLinearGradient(88, 133, 300, 133);
    beam.addColorStop(0, 'rgba(255, 233, 168, 0.55)');
    beam.addColorStop(1, 'rgba(255, 233, 168, 0)');
    ctx.fillStyle = beam;
    poly(ctx, [[88, 124], [300, 108], [300, 158], [88, 142]]);
    ctx.fill();
  }

  // Fishing boat, centre: hull, mast, sail, flag — the flag is red in A, teal in B.
  ctx.fillStyle = '#8d5a3b';
  poly(ctx, [[262, 300], [352, 300], [338, 322], [276, 322]]);
  ctx.fill();
  ctx.fillStyle = '#6e452c';
  ctx.fillRect(262, 300, 90, 5);
  ctx.fillStyle = '#5a3a26';
  ctx.fillRect(304, 216, 5, 86);
  ctx.fillStyle = '#fdf6e9';
  poly(ctx, [[309, 220], [309, 292], [352, 292]]);
  ctx.fill();
  ctx.fillStyle = '#e8b4a0';
  poly(ctx, [[309, 220], [309, 292], [282, 292]]);
  ctx.fill();
  ctx.fillStyle = altered ? '#2a9d8f' : '#d64541';
  poly(ctx, [[309, 218], [334, 224], [309, 232]]);
  ctx.fill();
  // Second, smaller boat on the right.
  ctx.fillStyle = '#5b7d6a';
  poly(ctx, [[452, 330], [522, 330], [512, 346], [462, 346]]);
  ctx.fill();
  ctx.fillStyle = '#46604f';
  ctx.fillRect(484, 268, 4, 62);
  ctx.fillStyle = '#f3e6c8';
  poly(ctx, [[488, 272], [488, 326], [520, 326]]);
  ctx.fill();

  // Wooden dock across the foreground.
  ctx.fillStyle = '#a9805a';
  ctx.fillRect(0, 362, W, 68);
  ctx.fillStyle = '#96704a';
  for (let x = 0; x < W; x += 58) ctx.fillRect(x, 362, 3, 68);
  ctx.fillStyle = '#7d5c3c';
  ctx.fillRect(0, 362, W, 6);
  ctx.fillStyle = '#6e4f30';
  ctx.fillRect(30, 400, 10, 30);
  ctx.fillRect(540, 400, 10, 30);

  // Crates, right — three in A, the top one missing in B.
  ctx.fillStyle = '#c98f4e';
  ctx.fillRect(486, 372, 34, 34);
  ctx.fillRect(524, 372, 34, 34);
  ctx.strokeStyle = '#8a5f2e';
  ctx.lineWidth = 2;
  ctx.strokeRect(486, 372, 34, 34);
  ctx.strokeRect(524, 372, 34, 34);
  line(ctx, 486, 372, 520, 406);
  ctx.stroke();
  line(ctx, 524, 372, 558, 406);
  ctx.stroke();
  if (!altered) {
    ctx.fillStyle = '#d9a35e';
    ctx.fillRect(505, 340, 34, 32);
    ctx.strokeRect(505, 340, 34, 32);
    line(ctx, 505, 340, 539, 372);
    ctx.stroke();
  }

  // Bucket with fish — three fish in A, a fourth tail sticking out in B.
  ctx.fillStyle = '#4a6b8a';
  poly(ctx, [[128, 384], [168, 384], [162, 414], [134, 414]]);
  ctx.fill();
  ctx.fillStyle = '#3a5670';
  ellipse(ctx, 148, 384, 20, 5);
  ctx.fill();
  ctx.fillStyle = '#c9d6de';
  ellipse(ctx, 140, 380, 9, 4);
  ctx.fill();
  ellipse(ctx, 156, 380, 9, 4);
  ctx.fill();
  if (altered) {
    ctx.fillStyle = '#e8a34c';
    poly(ctx, [[148, 372], [162, 366], [158, 378]]);
    ctx.fill();
  }

  // Cat sitting on the dock — tail curled up in A, lying flat in B.
  ctx.fillStyle = '#3d3d4d';
  ellipse(ctx, 250, 398, 20, 14);
  ctx.fill();
  circle(ctx, 238, 380, 11);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(230, 372);
  ctx.lineTo(234, 362);
  ctx.lineTo(238, 372);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(242, 372);
  ctx.lineTo(246, 362);
  ctx.lineTo(250, 372);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#3d3d4d';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (altered) {
    ctx.moveTo(268, 404);
    ctx.quadraticCurveTo(286, 406, 296, 398);
  } else {
    ctx.moveTo(268, 404);
    ctx.quadraticCurveTo(284, 396, 280, 378);
  }
  ctx.stroke();
  ctx.fillStyle = '#ffd166';
  circle(ctx, 234, 379, 1.8);
  ctx.fill();
  circle(ctx, 241, 379, 1.8);
  ctx.fill();
}

/* ------------------------------------------------------------------ */
/* Scene 2 — Lantern Market                                            */
/* ------------------------------------------------------------------ */

const MARKET_DIFFS = [
  { id: 'moon', name: 'Moon', x: 478, y: 66, r: 30 },
  { id: 'lantern', name: 'Middle lantern', x: 290, y: 138, r: 30 },
  { id: 'star', name: 'Bright star', x: 150, y: 56, r: 24 },
  { id: 'hat', name: "Vendor's hat", x: 148, y: 196, r: 30 },
  { id: 'bowls', name: 'Bowls on the counter', x: 206, y: 316, r: 28 },
  { id: 'cat', name: 'Cat on the roof', x: 480, y: 176, r: 28 },
  { id: 'bulb', name: 'Dark bulb', x: 402, y: 92, r: 24 },
];

function drawMarket(ctx, altered, W, H) {
  // Night sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 260);
  sky.addColorStop(0, '#141a38');
  sky.addColorStop(1, '#2c3a6b');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, 260);

  // Stars — one bright star is missing in Picture B.
  ctx.fillStyle = '#fff8d6';
  for (const [x, y, r] of [[60, 40, 2], [100, 90, 1.6], [210, 36, 2], [330, 60, 1.6], [380, 30, 2], [520, 120, 1.6], [44, 130, 1.6], [260, 110, 1.6]]) {
    circle(ctx, x, y, r);
    ctx.fill();
  }
  if (!altered) star4(ctx, 150, 56, 9, '#fff3b0');

  // Moon — full in A, crescent in B.
  ctx.fillStyle = '#ffe9a8';
  circle(ctx, 478, 66, 26);
  ctx.fill();
  ctx.fillStyle = '#f2d488';
  circle(ctx, 470, 60, 5);
  ctx.fill();
  circle(ctx, 488, 74, 4);
  ctx.fill();
  if (altered) {
    ctx.fillStyle = '#232c52';
    circle(ctx, 490, 58, 23);
    ctx.fill();
  }

  // Rooftops behind the stalls.
  ctx.fillStyle = '#1a2142';
  poly(ctx, [[0, 260], [0, 190], [70, 150], [140, 190], [140, 260]]);
  ctx.fill();
  poly(ctx, [[380, 260], [380, 180], [470, 138], [560, 180], [580, 172], [580, 260]]);
  ctx.fill();
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(96, 206, 14, 18);
  ctx.fillRect(500, 196, 14, 18);

  // Cat on the right roof — gone in Picture B.
  if (!altered) {
    ctx.fillStyle = '#0e1226';
    ellipse(ctx, 480, 168, 18, 11);
    ctx.fill();
    circle(ctx, 468, 156, 9);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(461, 150);
    ctx.lineTo(464, 141);
    ctx.lineTo(467, 150);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0e1226';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(496, 170);
    ctx.quadraticCurveTo(508, 166, 506, 152);
    ctx.stroke();
  }

  // String lights across the top — one bulb is dark in Picture B.
  ctx.strokeStyle = '#0e1226';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 78);
  ctx.quadraticCurveTo(290, 118, 580, 74);
  ctx.stroke();
  const bulbs = [42, 122, 202, 282, 362, 442, 522];
  bulbs.forEach((x, i) => {
    const y = 78 + Math.sin((x / 580) * Math.PI) * 34;
    const dark = altered && i === 5;
    ctx.strokeStyle = '#0e1226';
    line(ctx, x, y - 8, x, y - 2);
    ctx.stroke();
    ctx.fillStyle = dark ? '#3a4060' : '#ffd166';
    circle(ctx, x, y + 4, 6);
    ctx.fill();
    if (!dark) {
      ctx.fillStyle = 'rgba(255, 209, 102, 0.25)';
      circle(ctx, x, y + 4, 12);
      ctx.fill();
    }
  });

  // Paper lanterns hanging in a row — the middle one is red in A, gold in B.
  const lanterns = [110, 200, 290, 380, 470];
  lanterns.forEach((x, i) => {
    const middle = i === 2;
    ctx.strokeStyle = '#0e1226';
    line(ctx, x, 108, x, 118);
    ctx.stroke();
    const glow = ctx.createRadialGradient(x, 140, 4, x, 140, 44);
    glow.addColorStop(0, middle && altered ? 'rgba(255, 209, 102, 0.5)' : 'rgba(255, 90, 80, 0.45)');
    glow.addColorStop(1, 'rgba(255, 90, 80, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x - 44, 96, 88, 88);
    ctx.fillStyle = middle && altered ? '#f2b234' : '#e84a3f';
    ellipse(ctx, x, 140, 24, 28);
    ctx.fill();
    ctx.fillStyle = middle && altered ? '#d18a1d' : '#c23a30';
    ellipse(ctx, x, 140, 24, 28);
    ctx.stroke();
    ctx.strokeStyle = middle && altered ? '#b57a14' : '#a82e26';
    ctx.lineWidth = 1.5;
    for (const dy of [-16, -6, 4, 14]) {
      ctx.beginPath();
      ctx.ellipse(x, 140 + dy, 22 - Math.abs(dy) * 0.35, 3, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(x - 8, 166, 16, 5);
  });

  // Cobblestone ground.
  ctx.fillStyle = '#3a3350';
  ctx.fillRect(0, 330, W, H - 330);
  ctx.fillStyle = '#453d5e';
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 10; col += 1) {
      ellipse(ctx, 30 + col * 60 + (row % 2) * 30, 348 + row * 20, 26, 8);
      ctx.fill();
    }
  }
  // Puddle catching the lantern light.
  ctx.fillStyle = 'rgba(255, 180, 90, 0.18)';
  ellipse(ctx, 430, 398, 70, 12);
  ctx.fill();

  // Left stall — dumpling stall with a striped awning.
  ctx.fillStyle = '#7a3b2e';
  ctx.fillRect(56, 250, 12, 110);
  ctx.fillRect(248, 250, 12, 110);
  ctx.fillStyle = '#c23a30';
  poly(ctx, [[48, 250], [268, 250], [252, 212], [64, 212]]);
  ctx.fill();
  ctx.fillStyle = '#fdf3d8';
  for (let i = 0; i < 4; i += 1) poly(ctx, [[64 + i * 51, 212], [90 + i * 51, 212], [82 + i * 51, 250], [72 + i * 51, 250]]), ctx.fill();
  // Vendor behind the counter — conical hat in A, bare head in B.
  ctx.fillStyle = '#e8b48c';
  circle(ctx, 148, 216, 16);
  ctx.fill();
  if (!altered) {
    ctx.fillStyle = '#d9a441';
    poly(ctx, [[122, 206], [174, 206], [148, 178]]);
    ctx.fill();
    ctx.fillStyle = '#b57a14';
    circle(ctx, 148, 180, 3);
    ctx.fill();
  } else {
    ctx.fillStyle = '#3a2a1e';
    ctx.beginPath();
    ctx.arc(148, 210, 16, Math.PI, 0);
    ctx.fill();
  }
  ctx.fillStyle = '#4a7d8c';
  rr(ctx, 122, 232, 52, 44, 10);
  ctx.fill();
  ctx.fillStyle = '#fdf3d8';
  ctx.fillRect(140, 232, 16, 44);
  // Counter with steamer baskets.
  ctx.fillStyle = '#8a5a34';
  ctx.fillRect(52, 306, 212, 14);
  ctx.fillRect(58, 320, 200, 40);
  ctx.fillStyle = '#a9805a';
  ellipse(ctx, 96, 306, 26, 8);
  ctx.fill();
  ellipse(ctx, 150, 306, 26, 8);
  ctx.fill();
  // Bowls on the counter — two in A, three in B.
  ctx.fillStyle = '#e8e0c8';
  ellipse(ctx, 196, 302, 12, 6);
  ctx.fill();
  ctx.fillRect(184, 302, 24, 4);
  ellipse(ctx, 224, 302, 12, 6);
  ctx.fill();
  ctx.fillRect(212, 302, 24, 4);
  if (altered) {
    ellipse(ctx, 168, 302, 12, 6);
    ctx.fill();
    ctx.fillRect(156, 302, 24, 4);
  }
  ctx.fillStyle = '#7ddb8a';
  circle(ctx, 196, 300, 3);
  ctx.fill();
  circle(ctx, 224, 300, 3);
  ctx.fill();

  // Right stall — lantern and fruit stall, teal awning.
  ctx.fillStyle = '#2e5a52';
  ctx.fillRect(330, 250, 12, 110);
  ctx.fillRect(516, 250, 12, 110);
  ctx.fillStyle = '#2a9d8f';
  poly(ctx, [[322, 250], [536, 250], [520, 212], [338, 212]]);
  ctx.fill();
  ctx.fillStyle = '#e9f5ec';
  for (let i = 0; i < 4; i += 1) poly(ctx, [[338 + i * 51, 212], [364 + i * 51, 212], [356 + i * 51, 250], [346 + i * 51, 250]]), ctx.fill();
  ctx.fillStyle = '#8a5a34';
  ctx.fillRect(326, 306, 212, 14);
  ctx.fillRect(332, 320, 200, 40);
  // Fruit pile.
  ctx.fillStyle = '#e8632c';
  for (const [x, y] of [[360, 298], [380, 298], [400, 298], [370, 284], [390, 284], [380, 270]]) {
    circle(ctx, x, y, 9);
    ctx.fill();
  }
  ctx.fillStyle = '#7ddb8a';
  for (const [x, y] of [[440, 298], [460, 298], [480, 298], [450, 284], [470, 284]]) {
    circle(ctx, x, y, 9);
    ctx.fill();
  }
  // Hanging sign with a painted plum blossom.
  ctx.strokeStyle = '#0e1226';
  line(ctx, 500, 250, 500, 262);
  ctx.stroke();
  ctx.fillStyle = '#fdf3d8';
  rr(ctx, 482, 262, 36, 44, 6);
  ctx.fill();
  ctx.fillStyle = '#e84a3f';
  for (let a = 0; a < 5; a += 1) {
    const ang = (a / 5) * Math.PI * 2;
    circle(ctx, 500 + Math.cos(ang) * 7, 284 + Math.sin(ang) * 7, 4);
    ctx.fill();
  }
  ctx.fillStyle = '#ffd166';
  circle(ctx, 500, 284, 3);
  ctx.fill();

  // Bunting flags between the stalls.
  ctx.strokeStyle = '#0e1226';
  ctx.beginPath();
  ctx.moveTo(260, 216);
  ctx.quadraticCurveTo(296, 236, 330, 216);
  ctx.stroke();
  const flagColors = ['#e84a3f', '#ffd166', '#2a9d8f', '#e84a3f', '#ffd166'];
  flagColors.forEach((color, i) => {
    const x = 268 + i * 14;
    const y = 218 + Math.sin((i / 4) * Math.PI) * 10;
    ctx.fillStyle = color;
    poly(ctx, [[x, y], [x + 11, y], [x + 5.5, y + 12]]);
    ctx.fill();
  });
}

/* ------------------------------------------------------------------ */
/* Scene 3 — Winter Bookshop                                           */
/* ------------------------------------------------------------------ */

const BOOKSHOP_DIFFS = [
  { id: 'scarf', name: "Snowman's scarf", x: 92, y: 330, r: 28 },
  { id: 'books', name: 'Books in the window', x: 252, y: 286, r: 28 },
  { id: 'lamp', name: 'Street lamp', x: 508, y: 196, r: 30 },
  { id: 'bird', name: 'Bird on the sign', x: 290, y: 116, r: 26 },
  { id: 'wreath', name: 'Wreath on the door', x: 392, y: 262, r: 28 },
  { id: 'cat', name: 'Cat in the window', x: 306, y: 316, r: 28 },
  { id: 'buttons', name: "Snowman's buttons", x: 92, y: 362, r: 26 },
];

function drawBookshop(ctx, altered, W, H) {
  // Dusk sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 280);
  sky.addColorStop(0, '#8d7bb8');
  sky.addColorStop(0.6, '#c9a8c9');
  sky.addColorStop(1, '#eec9c0');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, 280);

  // Moon and falling snow.
  ctx.fillStyle = '#fff3c4';
  circle(ctx, 500, 64, 22);
  ctx.fill();
  ctx.fillStyle = '#e8dcb0';
  circle(ctx, 494, 58, 4);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  for (const [x, y, r] of [[40, 60, 2.5], [120, 110, 2], [200, 50, 2.5], [280, 140, 2], [360, 70, 2.5], [440, 120, 2], [540, 150, 2.5], [80, 190, 2], [170, 220, 2.5], [420, 200, 2], [520, 240, 2.5], [250, 200, 2]]) {
    circle(ctx, x, y, r);
    ctx.fill();
  }

  // Snowy ground.
  ctx.fillStyle = '#eef2fa';
  ctx.fillRect(0, 330, W, H - 330);
  ctx.fillStyle = '#dde4f2';
  ellipse(ctx, 120, 380, 90, 14);
  ctx.fill();
  ellipse(ctx, 460, 400, 100, 14);
  ctx.fill();
  // Footprints.
  ctx.fillStyle = '#c9d2e8';
  for (const [x, y] of [[300, 372], [322, 384], [344, 372], [366, 384], [388, 372]]) {
    ellipse(ctx, x, y, 7, 4);
    ctx.fill();
  }

  // Pine tree, right, dusted with snow.
  ctx.fillStyle = '#2e5a44';
  poly(ctx, [[470, 330], [500, 250], [530, 330]]);
  ctx.fill();
  poly(ctx, [[478, 290], [500, 224], [522, 290]]);
  ctx.fill();
  poly(ctx, [[486, 252], [500, 196], [514, 252]]);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  poly(ctx, [[486, 252], [500, 196], [514, 252]]);
  ctx.fill();
  ctx.fillStyle = '#2e5a44';
  poly(ctx, [[490, 232], [500, 204], [510, 232]]);
  ctx.fill();
  ctx.fillStyle = '#6e4f30';
  ctx.fillRect(496, 330, 8, 18);

  // Bookshop building.
  ctx.fillStyle = '#a85a48';
  ctx.fillRect(130, 150, 320, 200);
  ctx.fillStyle = '#8a4636';
  for (let y = 168; y < 340; y += 22) ctx.fillRect(130, y, 320, 2);
  // Snowy roof.
  ctx.fillStyle = '#7a3b2e';
  poly(ctx, [[110, 150], [470, 150], [450, 108], [130, 108]]);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  poly(ctx, [[110, 150], [470, 150], [462, 128], [118, 128]]);
  ctx.fill();
  // Shop sign — a bird perches on it in A, and is gone in B.
  ctx.fillStyle = '#3a2a1e';
  rr(ctx, 210, 116, 160, 34, 8);
  ctx.fill();
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('B O O K S', 290, 134);
  if (!altered) {
    ctx.fillStyle = '#2f2a26';
    ellipse(ctx, 290, 108, 9, 6);
    ctx.fill();
    circle(ctx, 284, 102, 5);
    ctx.fill();
    poly(ctx, [[288, 100], [291, 94], [293, 101]]);
    ctx.fill();
    ctx.fillStyle = '#e8632c';
    poly(ctx, [[279, 102], [274, 104], [279, 105]]);
    ctx.fill();
  }

  // Big window, warm inside: books on the sill — five in A, four in B.
  ctx.fillStyle = '#2f2a26';
  ctx.fillRect(160, 200, 150, 130);
  const winGlow = ctx.createLinearGradient(0, 206, 0, 324);
  winGlow.addColorStop(0, '#ffe9a8');
  winGlow.addColorStop(1, '#f2b25c');
  ctx.fillStyle = winGlow;
  ctx.fillRect(166, 206, 138, 118);
  ctx.fillStyle = '#8a5a34';
  ctx.fillRect(166, 300, 138, 8);
  const bookColors = ['#c23a30', '#2a7d8c', '#3f7d3a', '#d9a441', '#7a4a8c'];
  const bookCount = altered ? 4 : 5;
  bookColors.slice(0, bookCount).forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.fillRect(176 + i * 24, 262, 20, 38);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(176 + i * 24, 262, 20, 4);
  });
  // Cat in the window — curled up in A, gone in B.
  if (!altered) {
    ctx.fillStyle = '#e8a34c';
    ellipse(ctx, 306, 318, 16, 10);
    ctx.fill();
    circle(ctx, 296, 310, 8);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(290, 304);
    ctx.lineTo(293, 296);
    ctx.lineTo(296, 304);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#e8a34c';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(320, 320);
    ctx.quadraticCurveTo(330, 316, 326, 306);
    ctx.stroke();
  }

  // Door with a wreath — the wreath is missing in Picture B.
  ctx.fillStyle = '#2f2a26';
  ctx.fillRect(360, 216, 70, 134);
  ctx.fillStyle = '#5a3a26';
  ctx.fillRect(366, 222, 58, 128);
  ctx.fillStyle = '#7a4a2e';
  ctx.fillRect(366, 222, 4, 128);
  ctx.fillStyle = '#ffd166';
  circle(ctx, 414, 290, 4);
  ctx.fill();
  if (!altered) {
    ctx.strokeStyle = '#3f7d3a';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.arc(392, 262, 16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#c23a30';
    circle(ctx, 392, 246, 4);
    ctx.fill();
    circle(ctx, 378, 268, 4);
    ctx.fill();
    circle(ctx, 406, 268, 4);
    ctx.fill();
  }

  // Street lamp, right — glowing in A, dark in B.
  ctx.fillStyle = '#2f2a26';
  ctx.fillRect(504, 200, 7, 140);
  ctx.fillStyle = '#2f2a26';
  poly(ctx, [[496, 200], [519, 200], [512, 178], [503, 178]]);
  ctx.fill();
  if (!altered) {
    const glow = ctx.createRadialGradient(508, 192, 4, 508, 192, 60);
    glow.addColorStop(0, 'rgba(255, 220, 130, 0.55)');
    glow.addColorStop(1, 'rgba(255, 220, 130, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(448, 132, 120, 120);
  }
  ctx.fillStyle = altered ? '#4a4a55' : '#ffe9a8';
  ellipse(ctx, 508, 192, 8, 10);
  ctx.fill();

  // Snowman, left — scarf in A, no scarf in B; three buttons in A, two in B.
  ctx.fillStyle = '#ffffff';
  circle(ctx, 92, 388, 30);
  ctx.fill();
  circle(ctx, 92, 342, 23);
  ctx.fill();
  circle(ctx, 92, 308, 17);
  ctx.fill();
  ctx.fillStyle = '#2f2a26';
  circle(ctx, 86, 304, 2.5);
  ctx.fill();
  circle(ctx, 98, 304, 2.5);
  ctx.fill();
  ctx.fillStyle = '#e8632c';
  poly(ctx, [[92, 310], [112, 314], [92, 318]]);
  ctx.fill();
  ctx.strokeStyle = '#6e4f30';
  ctx.lineWidth = 3;
  line(ctx, 70, 340, 48, 322);
  ctx.stroke();
  line(ctx, 114, 340, 136, 324);
  ctx.stroke();
  // Buttons: three in A, two in B.
  ctx.fillStyle = '#2f2a26';
  circle(ctx, 92, 336, 3);
  ctx.fill();
  circle(ctx, 92, 350, 3);
  ctx.fill();
  if (!altered) {
    circle(ctx, 92, 364, 3);
    ctx.fill();
  }
  // Scarf: red in A, absent in B.
  if (!altered) {
    ctx.fillStyle = '#c23a30';
    ctx.fillRect(76, 322, 32, 9);
    poly(ctx, [[100, 326], [112, 326], [108, 352], [98, 350]]);
    ctx.fill();
  }
  // Little hat.
  ctx.fillStyle = '#2f2a26';
  ctx.fillRect(80, 290, 24, 6);
  ctx.fillRect(84, 276, 16, 14);
}

/* ------------------------------------------------------------------ */
/* Scene table and the offscreen cache                                 */
/* ------------------------------------------------------------------ */

export const SCENES = [
  { id: 'harbor', name: 'Harbor at Dawn', subtitle: 'Seven changes hide in the harbour light', differences: HARBOR_DIFFS, draw: drawHarbor },
  { id: 'market', name: 'Lantern Market', subtitle: 'Seven changes hide among the lanterns', differences: MARKET_DIFFS, draw: drawMarket },
  { id: 'bookshop', name: 'Winter Bookshop', subtitle: 'Seven changes hide in the falling snow', differences: BOOKSHOP_DIFFS, draw: drawBookshop },
];

const cache = new Map();

/** The painted panel for a scene, cached so the game blits instead of repainting. */
export function sceneCanvas(sceneIndex, altered) {
  const key = `${sceneIndex}:${altered ? 1 : 0}`;
  let canvas = cache.get(key);
  if (canvas) return canvas;
  canvas = document.createElement('canvas');
  canvas.width = 580;
  canvas.height = 430;
  const ctx = canvas.getContext('2d');
  SCENES[sceneIndex].draw(ctx, altered, 580, 430);
  cache.set(key, canvas);
  return canvas;
}
