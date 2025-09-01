import type { Frame, RunResult, Cell } from '../types';
import { keyOf, neighbors } from '../lib/grid';
import { MinHeap } from '../lib/heap';


export function runBFS(grid: Cell[][], start:{r:number;c:number}, goal:{r:number;c:number}): RunResult {
  const rows=grid.length, cols=grid[0].length;
  const q: [number,number][]= [[start.r,start.c]];
  const seen = new Set<string>([keyOf(start.r,start.c)]);
  const cameFrom = new Map<string,string|null>([[keyOf(start.r,start.c), null]]);
  const frames: Frame[] = [];
  let found=false;

  while(q.length){
    const layer=q.length;
    const visitBatch: [number,number][]= [];
    const newFront: [number,number][]= [];
    for (let i=0;i<layer;i++){
      const [r,c]=q.shift()!;
      visitBatch.push([r,c]);
      if (r===goal.r && c===goal.c){ found=true; break; }
      for (const [nr,nc] of neighbors(r,c,rows,cols)){
        const cell=grid[nr][nc]; if (cell.wall) continue;
        const k=keyOf(nr,nc);
        if (!seen.has(k)){
          seen.add(k);
          cameFrom.set(k, keyOf(r,c));
          q.push([nr,nc]);
          newFront.push([nr,nc]);
        }
      }
    }
    frames.push({ visit: visitBatch, frontier: newFront, stats:{ explored: seen.size, frontierSize: q.length } });
    if (found) break;
  }

  if (found){
    const path:[number,number][]= [];
    let cur:string|null=keyOf(goal.r,goal.c);
    while(cur){
      const [rr,cc]=cur.split(',').map(Number);
      path.push([rr,cc]); cur = cameFrom.get(cur) ?? null;
    }
    path.reverse(); frames.push({ path });
  }

  return { frames, found };
}
