import { useRef, useState } from "react";

type Cell = { r:number; c:number; wall:boolean; weight:number; start?:boolean; goal?:boolean; visited?:boolean; inFrontier?:boolean; inPath?:boolean };

const ROWS = 20;
const COLS = 36;
const START = { r: 10, c: 5 };
const GOAL  = { r: 10, c: 28 };

// ---------- helpers ----------
function createGrid(): Cell[][] {
  const g: Cell[][] = [];
  for (let r = 0; r < ROWS; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < COLS; c++) row.push({ r, c, wall: false, weight: 1 });
    g.push(row);
  }
  g[START.r][START.c].start = true;
  g[GOAL.r][GOAL.c].goal = true;
  return g;
}
function clone(g: Cell[][]) { return g.map(row => row.map(c => ({ ...c }))); }
const key = (r:number,c:number)=>`${r},${c}`;
function neighbors(r:number,c:number){
  const out:[number,number][]= [];
  if (r+1<ROWS) out.push([r+1,c]);
  if (r-1>=0)   out.push([r-1,c]);
  if (c+1<COLS) out.push([r,c+1]);
  if (c-1>=0)   out.push([r,c-1]);
  return out;
}

// ---------- animation frame type ----------
type Frame = {
  visit?: [number,number][];
  frontier?: [number,number][];
  path?: [number,number][];
  stats?: { explored:number; frontierSize:number };
};

// ---------- BFS (unweighted) ----------
function runBFS(grid: Cell[][], start:{r:number;c:number}, goal:{r:number;c:number}) {
  const q: [number,number][]= [[start.r,start.c]];
  const seen = new Set<string>([key(start.r,start.c)]);
  const came = new Map<string,string|null>([[key(start.r,start.c), null]]);
  const frames: Frame[] = [];
  let found=false;

  while(q.length){
    const layer=q.length;
    const visitBatch: [number,number][]= [];
    const newFront: [number,number][]= [];
    for(let i=0;i<layer;i++){
      const [r,c]=q.shift()!;
      visitBatch.push([r,c]);
      if (r===goal.r && c===goal.c){ found=true; break; }
      for (const [nr,nc] of neighbors(r,c)){
        const cell = grid[nr][nc];
        if (cell.wall) continue;
        const k = key(nr,nc);
        if (!seen.has(k)){
          seen.add(k);
          came.set(k, key(r,c));
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
    let cur:string|null=key(goal.r,goal.c);
    while(cur){
      const [rr,cc]=cur.split(',').map(Number);
      path.push([rr,cc]);
      cur = came.get(cur) ?? null;
    }
    path.reverse();
    frames.push({ path });
  }

  return { frames, found };
}

const SPEEDS = { Slow: 60, Medium: 25, Fast: 8 } as const;
type SpeedKey = keyof typeof SPEEDS;

export default function PathfindingVisualizer() {
  const [grid, setGrid] = useState<Cell[][]>(() => createGrid());
  const [paint, setPaint] = useState<"wall" | "erase" | "weight">("wall");
  const [mouseDown, setMouseDown] = useState(false);

  // animation state
  const [speed, setSpeed] = useState<SpeedKey>("Medium");
  const framesRef = useRef<Frame[]>([]);
  const [frameIdx, setFrameIdx] = useState(0);
  const timerRef = useRef<number | null>(null);
  const [message, setMessage] = useState("");

  function paintCell(r: number, c: number) {
    setGrid(g => {
      const ng = clone(g);
      const cell = ng[r][c];
      if (cell.start || cell.goal) return ng;
      if (paint === "wall")   { cell.wall = true;  cell.weight = 1; }
      if (paint === "erase")  { cell.wall = false; cell.weight = 1; }
      if (paint === "weight") { cell.wall = false; cell.weight = 5; }
      return ng;
    });
  }

  function resetVisuals(full=false){
    setGrid(g=>{
      const ng=clone(g);
      for (const row of ng) for (const cell of row){
        cell.visited=false; cell.inFrontier=false; cell.inPath=false;
        if (full){ cell.wall=false; cell.weight=1; }
      }
      ng[START.r][START.c].start = true;
      ng[GOAL.r][GOAL.c].goal   = true;
      return ng;
    });
    framesRef.current = [];
    setFrameIdx(0);
    setMessage("");
    if (timerRef.current) window.clearInterval(timerRef.current);
  }

  function computeFrames(){
    const base = clone(grid);
    const res = runBFS(base, START, GOAL);
    setMessage(res.found ? "Path found" : "No path");
    return res.frames;
  }

  function applyFrame(f: Frame){
    setGrid(g=>{
      const ng=clone(g);
      f.visit?.forEach(([r,c])=>{ if (!ng[r][c].start && !ng[r][c].goal) ng[r][c].visited = true; });
      f.frontier?.forEach(([r,c])=>{ if (!ng[r][c].start && !ng[r][c].goal) ng[r][c].inFrontier = true; });
      f.path?.forEach(([r,c])=>{ if (!ng[r][c].start && !ng[r][c].goal) ng[r][c].inPath = true; });
      return ng;
    });
  }

  function onRun(){
    const frames = computeFrames();
    resetVisuals(false);
    framesRef.current = frames;
    let i = 0;
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(()=>{
      applyFrame(frames[i]); i++;
      setFrameIdx(i);
      if (i >= frames.length && timerRef.current){ window.clearInterval(timerRef.current); }
    }, SPEEDS[speed]);
  }

  function onStep(){
    if (!framesRef.current.length) framesRef.current = computeFrames();
    const i = frameIdx;
    if (i < framesRef.current.length){
      applyFrame(framesRef.current[i]);
      setFrameIdx(i+1);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold">Pathfinding Visualizer — BFS</h2>

        <label className="text-sm ml-2">Speed</label>
        <select value={speed} onChange={e=>setSpeed(e.target.value as SpeedKey)} className="px-2 py-1 rounded border">
          {Object.keys(SPEEDS).map(k => <option key={k}>{k}</option>)}
        </select>

        <div className="ml-2 flex gap-2">
          <button onClick={onRun} className="px-3 py-1 rounded bg-black text-white shadow">Run (BFS)</button>
          <button onClick={onStep} className="px-3 py-1 rounded border">Step</button>
          <button onClick={()=>resetVisuals(false)} className="px-3 py-1 rounded border">Reset Visuals</button>
          <button onClick={()=>resetVisuals(true)} className="px-3 py-1 rounded border">Clear Board</button>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <span className="text-sm">Paint:</span>
          <button onClick={()=>setPaint("wall")}   className={`px-2 py-1 rounded border ${paint==="wall"?"bg-gray-200":""}`}>Wall</button>
          <button onClick={()=>setPaint("weight")} className={`px-2 py-1 rounded border ${paint==="weight"?"bg-gray-200":""}`}>Weight</button>
          <button onClick={()=>setPaint("erase")}  className={`px-2 py-1 rounded border ${paint==="erase"?"bg-gray-200":""}`}>Erase</button>
        </div>
      </div>

      <div
        className="inline-block rounded-2xl border p-2 bg-white shadow-inner select-none"
        onMouseLeave={()=>setMouseDown(false)}
      >
        {grid.map((row, ri) => (
          <div key={ri} className="flex">
            {row.map((cell, ci) => (
              <div
                key={ci}
                onMouseDown={()=>{ setMouseDown(true); paintCell(ri, ci); }}
                onMouseUp={()=>setMouseDown(false)}
                onMouseEnter={()=>{ if (mouseDown) paintCell(ri, ci); }}
                className={
                  "w-6 h-6 border border-gray-200 box-border " +
                  (cell.start ? "bg-green-500 " :
                   cell.goal  ? "bg-red-500 "   :
                   cell.inPath ? "bg-yellow-400 " :
                   cell.visited ? "bg-blue-300 " :
                   cell.inFrontier ? "bg-teal-300 " :
                   cell.wall  ? "bg-gray-800 "  :
                   cell.weight>1 ? "bg-amber-100 " : "bg-white ")
                }
                title={`(${ri},${ci}) w=${cell.weight}`}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="text-sm flex items-center gap-4">
        <span><b>Legend:</b>
          <span className="inline-block w-3 h-3 bg-green-500 mx-1 rounded-sm"/>Start
          <span className="inline-block w-3 h-3 bg-red-500 mx-1 rounded-sm"/>Goal
          <span className="inline-block w-3 h-3 bg-gray-800 mx-1 rounded-sm"/>Wall
          <span className="inline-block w-3 h-3 bg-amber-100 mx-1 rounded-sm border"/>Weight(5)
          <span className="inline-block w-3 h-3 bg-teal-300 mx-1 rounded-sm"/>Frontier
          <span className="inline-block w-3 h-3 bg-blue-300 mx-1 rounded-sm"/>Visited
          <span className="inline-block w-3 h-3 bg-yellow-400 mx-1 rounded-sm"/>Path
        </span>
        <span className="ml-auto font-medium">{message}</span>
      </div>
    </div>
  );
}
