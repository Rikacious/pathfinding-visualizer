// src/algorithms/dijkstra.ts
import type { Frame } from "./bfs"; // reuse Frame type

type Cell = { wall: boolean; weight: number };

const key = (r: number, c: number) => `${r},${c}`;

function neighbors(r: number, c: number, rows: number, cols: number) {
  const out: [number, number][] = [];
  if (r + 1 < rows) out.push([r + 1, c]);
  if (r - 1 >= 0)   out.push([r - 1, c]);
  if (c + 1 < cols) out.push([r, c + 1]);
  if (c - 1 >= 0)   out.push([r, c - 1]);
  return out;
}

export function runDijkstra(
  grid: Cell[][],
  start: { r: number; c: number },
  goal:  { r: number; c: number }
) {
  const rows = grid.length;
  const cols = grid[0].length;

  const dist = new Map<string, number>();
  const prev = new Map<string, string | null>();
  const frames: Frame[] = [];

  const pq: [number, number, number][] = []; // [dist, r, c]

  const startKey = key(start.r, start.c);
  dist.set(startKey, 0);
  prev.set(startKey, null);
  pq.push([0, start.r, start.c]);

  const visited = new Set<string>();
  let found = false;

  while (pq.length) {
    // pop node with smallest distance
    pq.sort((a, b) => a[0] - b[0]);
    const [d, r, c] = pq.shift()!;
    const k = key(r, c);

    if (visited.has(k)) continue;
    visited.add(k);

    if (r === goal.r && c === goal.c) {
      found = true;
      break;
    }

    const visitBatch: [number, number][] = [[r, c]];
    const newFront: [number, number][] = [];

    for (const [nr, nc] of neighbors(r, c, rows, cols)) {
      const nk = key(nr, nc);
      const cell = grid[nr][nc];
      if (cell.wall) continue;
      const newDist = d + cell.weight;

      if (!dist.has(nk) || newDist < dist.get(nk)!) {
        dist.set(nk, newDist);
        prev.set(nk, k);
        pq.push([newDist, nr, nc]);
        newFront.push([nr, nc]);
      }
    }

    frames.push({
      visit: visitBatch,
      frontier: newFront,
      stats: { explored: visited.size, frontierSize: pq.length },
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
