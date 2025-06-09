const DEFAULT_WIDTH  = 100;   // x (columns)
const DEFAULT_HEIGHT = 120;   // y (rows)
const SCALE          = 0.08;  // how zoomed‑in the noise feels (reduced to create larger features)
const OCTAVES        = 4;     // layers of noise
const PERSISTENCE    = 0.5;   // increased amplitude fall-off for more variation

// Biome thresholds (ascending) and colors
const BIOMES = [
  { max: 0.35, color: '#1565c0' }, // deep ocean (35%)
  { max: 0.42, color: '#42a5f5' }, // coast      (7%)
  { max: 0.51, color: '#81c784' }, // grassland  (9%)
  { max: 0.60, color: '#388e3c' }, // forest     (9%)
  { max: 1.00, color: '#795548' }  // mountain   (40%)
];


// MENU --------------------------------------------------
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Map')
    .addItem('Generate Map', 'showPrompt')
    .addToUi();
}


function showPrompt() {
  const ui   = SpreadsheetApp.getUi();
  const seed = parseInt(ui.prompt('Seed (any integer)', 'ex. 12345', ui.ButtonSet.OK).getResponseText(), 10);
    
  const size = ui.prompt('Map size (cols x rows)', `ex. ${DEFAULT_WIDTH}x${DEFAULT_HEIGHT}`, ui.ButtonSet.OK).getResponseText();

  const [w, h] = size.toLowerCase().split(/x|×/).map(n => parseInt(n, 10));
  generateMap(seed || 1, w || DEFAULT_WIDTH, h || DEFAULT_HEIGHT);
}


// CORE --------------------------------------------------
function generateMap(seed, width, height) {
  const sheet = SpreadsheetApp.getActiveSheet();
  resizeSheet(sheet, width, height);
  sheet.clear();
  sheet.setColumnWidths(1, width, 15);
  sheet.setRowHeights(1, height, 15);

  // 1. Generate elevation grid with fractal noise
  const prng = mulberry32(seed);
  const grid = Array.from({ length: height }, () => new Array(width));
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // --- compute raw noise value across OCTAVES ---
      let amp = 1, freq = 1, value = 0, norm = 0;
      for (let o = 0; o < OCTAVES; o++) {
        value += amp * valueNoise((x * SCALE) * freq,
                                  (y * SCALE) * freq,
                                  prng);
        norm  += amp;
        amp   *= PERSISTENCE;
        freq  *= 2;
      }
      let e = value / norm;            // normalised elevation in [0,1]

      // Apply elevation curve biasing
      e = Math.pow(e, 0.65);          // boost mid-high values
      e = e * (1 + (valueNoise(x * 0.02, y * 0.02, prng) * 0.3)); // add large-scale variation

      // clamp just in case
      e = Math.max(0, Math.min(1, e));
      grid[y][x] = e;
    }
  }
  
  // 2. Map elevations into colors and paint the sheet
  const colors = grid.map(row => row.map(elev => pickColor(elev)));
  sheet.getRange(1, 1, height, width).setBackgrounds(colors);
}


// HELPERS --------------------------------------------------
function pickColor(val) {
  for (let i = 0; i < BIOMES.length; i++) {
    if (val <= BIOMES[i].max) return BIOMES[i].color;
  }
  return '#000000';
}


// Deterministic value noise based on integer lattice hashing
function valueNoise(x, y, prng) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi,       yf = y - yi;

  // Corner values
  const v00 = hash2D(xi,   yi,   prng);
  const v10 = hash2D(xi+1, yi,   prng);
  const v01 = hash2D(xi,   yi+1, prng);
  const v11 = hash2D(xi+1, yi+1, prng);

  // Bilinear interpolation
  const i1 = lerp(v00, v10, fade(xf));
  const i2 = lerp(v01, v11, fade(xf));
  return lerp(i1, i2, fade(yf));
}


function fade(t){ return t*t*t*(t*(t*6-15)+10); }
function lerp(a,b,t){ return a + (b - a)*t; }


// Fast integer hash → [0,1)
function hash2D(x, y, prng) {
  let n = x * 374761393 + y * 668265263 + prng;
  n = (n ^ (n >> 13)) * 1274126177;
  return ((n ^ (n >> 16)) >>> 0) / 4294967296;
}


// Tiny, seedable PRNG (32‑bit)
function mulberry32(a) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}


function resizeSheet(sheet, width, height) {
  // resize columns exactly to width
  const currentCols = sheet.getMaxColumns();
  if (currentCols < width) {
    sheet.insertColumnsAfter(currentCols, width - currentCols);
  } else if (currentCols > width) {
    sheet.deleteColumns(width + 1, currentCols - width);
  }
  
  // resize rows exactly to height
  const currentRows = sheet.getMaxRows();
  if (currentRows < height) {
    sheet.insertRowsAfter(currentRows, height - currentRows);
  } else if (currentRows > height) {
    sheet.deleteRows(height + 1, currentRows - height);
  }
}
