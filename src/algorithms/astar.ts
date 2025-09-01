// src/algorithms/astar.ts
import type { Frame } from "./bfs"; // reuse the Frame type

type Cell = { wall: boolean; weight: number };

const key = (r: number, c: number) => `${r},${c}`;
const manhattan = (a:{r:number;c:number}, b:{r:number;c:number}) =>
  Math.abs(a.r - b.r) + Math.abs(a.c - b.c);

function neighbors(r: number, c: number, rows: number, cols: number) {
  const out: [number, number][] = [];
  if (r + 1 < rows) out.push([r + 1, c]);
  if (r - 1 >= 0)   out.push([r - 1, c]);
  if (c + 1 < cols) out.push([r, c + 1]);
  if (c - 1 >= 0)   out.push([r, c - 1]);
  return out;
}

export function runAStar(
  grid: Cell[][],
  start: { r: number; c: number },
  goal:  { r: number; c: number }
) {
  const rows = grid.length, cols = grid[0].length;
  const frames: Frame[] = [];

  const g = new Map<string, number>();         // cost so far
  const f = new Map<string, number>();         // g + heuristic
  const prev = new Map<string, string | null>();
  const closed = new Set<string>();

  const pq: [number, number, number][] = [];   // [fScore, r, c]

  const sKey = key(start.r, start.c);
  g.set(sKey, 0);
  f.set(sKey, manhattan(start, goal));
  prev.set(sKey, null);
  pq.push([f.get(sKey)!, start.r, start.c]);

  let found = false;

  while (pq.length) {
    // pop node with smallest f
    pq.sort((a, b) => a[0] - b[0]);
    const [, r, c] = pq.shift()!;
    const k = key(r, c);
    if (closed.has(k)) continue;
    closed.add(k);

    if (r === goal.r && c === goal.c) { found = true; break; }

    const visitBatch: [number, number][] = [[r, c]];
    const newFront: [number, number][] = [];

    for (const [nr, nc] of neighbors(r, c, rows, cols)) {
      const nk = key(nr, nc);
      const cell = grid[nr][nc];
      if (cell.wall) continue;

      const tentativeG = (g.get(k) ?? Infinity) + cell.weight;
      if (tentativeG < (g.get(nk) ?? Infinity)) {
        g.set(nk, tentativeG);
        const score = tentativeG + manhattan({ r: nr, c: nc }, goal);
        f.set(nk, score);
        prev.set(nk, k);
        pq.push([score, nr, nc]);
        newFront.push([nr, nc]);
      }
    }

    frames.push({
      visit: visitBatch,
      frontier: newFront,
      stats: { explored: closed.size, frontierSize: pq.length },
    });
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

  return { frames, found };
}
