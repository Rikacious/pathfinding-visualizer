// src/algorithms/dijkstra.ts
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

export function runDijkstra(
  grid: Cell[][],
  start: { r: number; c: number },
  goal:  { r: number; c: number }
): RunResult {
  const rows = grid.length;
  const cols = grid[0].length;

  // Min-heap via array + sort (simple for our grid sizes)
  const pq: [number, number, number][] = []; // [dist, r, c]
  const dist = new Map<string, number>();
  const prev = new Map<string, string | null>();
  const seen = new Set<string>();
  const frames: Frame[] = [];

  const sKey = key(start.r, start.c);
  dist.set(sKey, 0);
  prev.set(sKey, null);
  pq.push([0, start.r, start.c]);

  let found = false;

  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, r, c] = pq.shift()!;
    const k = key(r, c);
    if (seen.has(k)) continue;
    seen.add(k);

    const visitBatch: [number, number][] = [[r, c]];
    const newFront: [number, number][] = [];

    if (r === goal.r && c === goal.c) { found = true; break; }

    for (const [nr, nc] of neighbors(r, c, rows, cols)) {
      if (grid[nr][nc].wall) continue;
      const nk = key(nr, nc);
      const nd = d + grid[nr][nc].weight;
      if (!dist.has(nk) || nd < dist.get(nk)!) {
        dist.set(nk, nd);
        prev.set(nk, k);
        pq.push([nd, nr, nc]);
        newFront.push([nr, nc]);
      }
    }

    frames.push({ visit: visitBatch, frontier: newFront });
  }

  if (found) {
    const path: [number, number][] = [];
    let cur: string | null = key(goal.r, goal.c);
    while (cur) {
      const [rr, cc] = cur.split(",").map(Number);
      path.push([rr, cc]);
      cur = prev.get(cur) ?? null;
    }
    path.reverse();
    frames.push({ path });
  }

  return { frames, found, visitedCount: seen.size };
}
