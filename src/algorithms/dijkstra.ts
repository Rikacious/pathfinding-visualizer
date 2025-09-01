import type { Frame, RunResult, Cell } from '../types';
import { keyOf, neighbors } from '../lib/grid';
import { MinHeap } from '../lib/heap';


export function runDijkstra(grid: Cell[][], start:{r:number;c:number}, goal:{r:number;c:number}): RunResult{
  const rows=grid.length, cols=grid[0].length;
  const heap = new MinHeap<[number,number]>();
  const dist = new Map<string,number>();
  const cameFrom = new Map<string,string|null>();
  const frames: Frame[] = [];
  const sKey = keyOf(start.r,start.c);
  heap.push(0,[start.r,start.c]); dist.set(sKey,0); cameFrom.set(sKey,null);
  const visited = new Set<string>(); let found=false;

  while(heap.size()){
    const [r,c]=heap.pop()!;
    const k=keyOf(r,c); if (visited.has(k)) continue; visited.add(k);
    const visitBatch:[[number,number]]=[[r,c]] as any; const newFront:[number,number][]= [];
    if (r===goal.r && c===goal.c){ found=true; frames.push({visit:visitBatch}); break; }
    for (const [nr,nc] of neighbors(r,c,rows,cols)){
      const cell=grid[nr][nc]; if (cell.wall) continue;
      const nk=keyOf(nr,nc);
      const alt=(dist.get(k) ?? Infinity) + cell.weight;
      if (alt < (dist.get(nk) ?? Infinity)){
        dist.set(nk, alt); cameFrom.set(nk,k); heap.push(alt,[nr,nc]); newFront.push([nr,nc]);
      }
    }
    frames.push({ visit: visitBatch, frontier: newFront, stats:{ explored: visited.size, frontierSize: heap.size() } });
  }

  if (found){
    const path:[number,number][]= []; let cur:string|null=keyOf(goal.r,goal.c);
    while(cur){ const [rr,cc]=cur.split(',').map(Number); path.push([rr,cc]); cur=cameFrom.get(cur) ?? null; }
    path.reverse(); frames.push({ path });
  }
  return { frames, found };
}
