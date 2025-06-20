# Google Sheets Procedural Map Generator

A Google Apps Script that generates a procedural map directly inside a Google Sheets document using fractal noise. Customize map dimensions, seed values, and biome thresholds for endless varied maps.

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
  - [Map Dimensions](#map-dimensions)
  - [Noise Parameters](#noise-parameters)
  - [Biome Thresholds & Colors](#biome-thresholds--colors)
- [Advanced Customization](#advanced-customization)

---

## Features

- **Procedural Terrain**: Generates elevation values via fractal (value) noise across multiple octaves.
- **Custom Menu**: Adds a "Map" menu in Sheets for easy generation.
- **Configurable**: Change seed, map size, noise parameters, and biomes at the top of the script.
- **Reusable**: Runs entirely in Google Apps Script—no external libraries.

## Installation

1. Open your Google Sheets document.
2. Navigate to **Extensions → Apps Script**.
3. In the Apps Script editor, delete any default code in `Code.gs` and paste the contents of the provided script.
4. Adjust any constants if desired (see [Configuration](#configuration)).
5. Save the project (e.g. name it `MapGenerator`).
6. Return to the spreadsheet and reload the page.

## Usage

1. In the spreadsheet menu bar, click **Map → Generate Map**.
2. **Seed Prompt**: Enter any integer. Same seeds yield identical maps.
3. **Size Prompt**: Enter dimensions in `columns×rows` format (e.g. `160x100`).
4. The script will:
   - Resize the sheet to match the specified grid.
   - Clear existing content and set cell sizes to 8×8 pixels.
   - Compute elevation values per cell.
   - Map elevations to colors based on biome thresholds.
5. Enjoy your generated map!

## Configuration

All key parameters are defined at the top of the script (`Code.gs`).

### Map Dimensions

- `DEFAULT_WIDTH` — Default number of columns (e.g. `160`).
- `DEFAULT_HEIGHT` — Default number of rows (e.g. `100`).

### Noise Parameters

- `SCALE` — Zoom level: lower values yield larger features.
- `OCTAVES` — Number of noise layers (higher = more detail).
- `PERSISTENCE` — Amplitude fall-off per octave (lower = smoother variation).

### Biome Thresholds & Colors

```js
const BIOMES = [
  { max: 0.38, color: '#1565c0' }, // deep ocean
  { max: 0.43, color: '#42a5f5' }, // coast
  { max: 0.51, color: '#81c784' }, // grassland
  { max: 0.59, color: '#388e3c' }, // forest
  { max: 1.00, color: '#795548' }  // mountain
];
```

- Each entry maps elevation ≤ `max` to the given hex color.
- Add, remove, or reorder entries to create custom biomes.

## Advanced Customization

- **Cell Size**: Adjust `sheet.setColumnWidths` and `sheet.setRowHeights` arguments to change pixel size of each cell tile.
- **Elevation Curve**: Modify the exponent in `Math.pow(e, 0.65)` to bias terrain differently.
- **Global Variation**: Change the `valueNoise` scale and weight (`0.02` and `0.3`) for large-scale variation.
- **Menu Items**: Extend `onOpen()` to add more map-related utilities (e.g. save, export).

