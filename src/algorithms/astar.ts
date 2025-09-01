import type { Frame, RunResult, Cell } from '../types';
import { keyOf, neighbors } from '../lib/grid';
import { MinHeap } from '../lib/heap';


export function runAStar(grid: Cell[][], start:{r:number;c:number}, goal:{r:number;c:number}): RunResult{
  const rows=grid.length, cols=grid[0].length;
  const heap = new MinHeap<[number,number]>();
  const g = new Map<string,number>(); const f = new Map<string,number>();
  const cameFrom = new Map<string,string|null>(); const frames: Frame[]=[];
  const sKey=keyOf(start.r,start.c);
  g.set(sKey,0); f.set(sKey, manhattan(start, goal)); cameFrom.set(sKey,null); heap.push(f.get(sKey)!, [start.r,start.c]);
  const closed=new Set<string>(); let found=false;

  while(heap.size()){
    const [r,c]=heap.pop()!;
    const k=keyOf(r,c); if (closed.has(k)) continue; closed.add(k);
    const visitBatch:[[number,number]]=[[r,c]] as any; const newFront:[number,number][]= [];
    if (r===goal.r && c===goal.c){ found=true; frames.push({visit:visitBatch}); break; }
    for (const [nr,nc] of neighbors(r,c,rows,cols)){
      const cell=grid[nr][nc]; if (cell.wall) continue;
      const nk=keyOf(nr,nc); const tentativeG=(g.get(k) ?? Infinity) + cell.weight;
      if (tentativeG < (g.get(nk) ?? Infinity)){
        g.set(nk, tentativeG);
        const ff = tentativeG + manhattan({r:nr,c:nc}, goal);
        f.set(nk, ff); cameFrom.set(nk,k); heap.push(ff,[nr,nc]); newFront.push([nr,nc]);
      }
    }
    frames.push({ visit: visitBatch, frontier: newFront, stats:{ explored: closed.size, frontierSize: heap.size() } });
  }

  if (found){
    const path:[number,number][]= []; let cur:string|null=keyOf(goal.r,goal.c);
    while(cur){ const [rr,cc]=cur.split(',').map(Number); path.push([rr,cc]); cur=cameFrom.get(cur) ?? null; }
    path.reverse(); frames.push({ path });
  }
  return { frames, found };
}
