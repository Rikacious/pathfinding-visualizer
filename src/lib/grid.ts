import type { Cell } from '../types';

export const DEFAULT_ROWS = 20;
export const DEFAULT_COLS = 36;
export const START_POS = { r: 10, c: 5 };
export const GOAL_POS  = { r: 10, c: 28 };

export function createGrid(r: number, c: number): Cell[][] {
  const g: Cell[][] = [];
  for (let i = 0; i < r; i++) {
    const row: Cell[] = [];
    for (let j = 0; j < c; j++) {
      row.push({ r: i, c: j, wall: false, weight: 1, visited: false, inPath: false, inFrontier: false });
    }
    g.push(row);
  }
  if (START_POS.r < r && START_POS.c < c) g[START_POS.r][START_POS.c].start = true;
  if (GOAL_POS.r  < r && GOAL_POS.c  < c) g[GOAL_POS.r][GOAL_POS.c].goal = true;
  return g;
}

export function cloneGrid(g: Cell[][]): Cell[][] {
  return g.map(row => row.map(cell => ({ ...cell })));
}

export function keyOf(r: number, c: number) { return `${r},${c}`; }

export function neighbors(r: number, c: number, rows: number, cols: number) {
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  const out: [number, number][] = [];
  for (const [dr, dc] of dirs) {
    const nr = r + dr, nc = c + dc;
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) out.push([nr, nc]);
  }
  return out;
}

export function manhattan(a:{r:number;c:number}, b:{r:number;c:number}) {
  return Math.abs(a.r - b.r) + Math.abs(a.c - b.c);
}
