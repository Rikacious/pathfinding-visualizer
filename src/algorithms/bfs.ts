// src/algorithms/bfs.ts
import type { Frame, RunResult, Cell } from "../types";

const key = (r: number, c: number) => `${r},${c}`;
const neighbors = (r: number, c: number, rows: number, cols: number) => {
  const out: [number, number][] = [];
  if (r + 1 < rows) out.push([r + 1, c]);
  if (r - 1 >= 0)   out.push([r - 1, c]);
  if (c + 1 < cols) out.push([r, c + 1]);
  if (c - 1 >= 0)   out.push([r, c - 1]);
  return out;
};

export function runBFS(
  grid: Cell[][],
  start: { r: number; c: number },
  goal:  { r: number; c: number }
): RunResult {
  const rows = grid.length;
  const cols = grid[0].length;

  const q: [number, number][] = [[start.r, start.c]];
  const seen = new Set<string>([key(start.r, start.c)]);
  const cameFrom = new Map<string, string | null>([[key(start.r, start.c), null]]);

  const frames: Frame[] = [];
  let found = false;

  while (q.length) {
    const [r, c] = q.shift()!;
    const visitBatch: [number, number][] = [[r, c]];
    const newFront: [number, number][] = [];

    if (r === goal.r && c === goal.c) { found = true; break; }

    for (const [nr, nc] of neighbors(r, c, rows, cols)) {
      const k = key(nr, nc);
      if (seen.has(k) || grid[nr][nc].wall) continue;
      seen.add(k);
      cameFrom.set(k, key(r, c));
      q.push([nr, nc]);
      newFront.push([nr, nc]);
    }

    frames.push({ visit: visitBatch, frontier: newFront });
  }

  if (found) {
    const path: [number, number][] = [];
    let cur: string | null = key(goal.r, goal.c);
    while (cur) {
      const [rr, cc] = cur.split(",").map(Number);
      path.push([rr, cc]);
      cur = cameFrom.get(cur) ?? null;
    }
    path.reverse();
    frames.push({ path });
  }

  return { frames, found, visitedCount: seen.size };
}
