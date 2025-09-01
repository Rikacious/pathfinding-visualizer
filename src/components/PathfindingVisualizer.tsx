import { useRef, useState } from "react";
import { runBFS } from "../algorithms/bfs";
import { runDijkstra } from "../algorithms/dijkstra";
import { runAStar } from "../algorithms/astar";
import type { Frame, RunResult } from "../types";

type Algo = "BFS" | "Dijkstra" | "A*";

type Cell = {
  r: number;
  c: number;
  wall: boolean;
  weight: number;
  start?: boolean;
  goal?: boolean;
  visited?: boolean;
  inFrontier?: boolean;
  inPath?: boolean;
};

const ROWS = 20;
const COLS = 36;
const START0 = { r: 10, c: 5 };
const GOAL0 = { r: 10, c: 28 };

// ---------- grid helpers ----------
function createGrid(): Cell[][] {
  const g: Cell[][] = [];
  for (let r = 0; r < ROWS; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < COLS; c++) row.push({ r, c, wall: false, weight: 1 });
    g.push(row);
  }
  return g;
}
function clone(g: Cell[][]) {
  return g.map((row) => row.map((c) => ({ ...c })));
}

const SPEEDS = { Slow: 60, Medium: 25, Fast: 8 } as const;
type SpeedKey = keyof typeof SPEEDS;

export default function PathfindingVisualizer() {
  // dynamic start/goal
  const [start, setStart] = useState(START0);
  const [goal, setGoal] = useState(GOAL0);

  // grid state (with markers applied)
  const [grid, setGrid] = useState<Cell[][]>(() => {
    const g = createGrid();
    g[start.r][start.c].start = true;
    g[goal.r][goal.c].goal = true;
    return g;
  });

  const [paint, setPaint] = useState<"wall" | "erase" | "weight">("wall");
  const [mouseDown, setMouseDown] = useState(false);
  const [drag, setDrag] = useState<"none" | "start" | "goal">("none");

  // controls
  const [algo, setAlgo] = useState<Algo>("BFS");
  const [speed, setSpeed] = useState<SpeedKey>("Medium");

  // animation state
  const framesRef = useRef<Frame[]>([]);
  const [frameIdx, setFrameIdx] = useState(0);
  const timerRef = useRef<number | null>(null);

  // stats
  const [pathLength, setPathLength] = useState<number | null>(null);
  const [explored, setExplored] = useState<number | null>(null);
  const [runtime, setRuntime] = useState<number | null>(null);

  function paintCell(r: number, c: number) {
    setGrid((g) => {
      const ng = clone(g);
      const cell = ng[r][c];
      if (cell.start || cell.goal) return ng; // don’t paint over markers
      if (paint === "wall") {
        cell.wall = true;
        cell.weight = 1;
      }
      if (paint === "erase") {
        cell.wall = false;
        cell.weight = 1;
      }
      if (paint === "weight") {
        cell.wall = false;
        cell.weight = 5;
      }
      return ng;
    });
  }

  function moveStart(toR: number, toC: number) {
    if (grid[toR][toC].goal) return; // don’t overlap goal
    setGrid((g) => {
      const ng = clone(g);
      ng[start.r][start.c].start = false;
      const tgt = ng[toR][toC];
      tgt.wall = false;
      tgt.weight = 1;
      tgt.start = true;
      setStart({ r: toR, c: toC });
      return ng;
    });
  }

  function moveGoal(toR: number, toC: number) {
    if (grid[toR][toC].start) return; // don’t overlap start
    setGrid((g) => {
      const ng = clone(g);
      ng[goal.r][goal.c].goal = false;
      const tgt = ng[toR][toC];
      tgt.wall = false;
      tgt.weight = 1;
      tgt.goal = true;
      setGoal({ r: toR, c: toC });
      return ng;
    });
  }

  function resetVisuals(full = false) {
    setGrid((g) => {
      const ng = clone(g);
      for (const row of ng)
        for (const cell of row) {
          cell.visited = false;
          cell.inFrontier = false;
          cell.inPath = false;
          if (full && !cell.start && !cell.goal) {
            cell.wall = false;
            cell.weight = 1;
          }
        }
      // ensure markers for current start/goal
      ng[start.r][start.c].start = true;
      ng[goal.r][goal.c].goal = true;
      return ng;
    });
    framesRef.current = [];
    setFrameIdx(0);
    setPathLength(null);
    setExplored(null);
    setRuntime(null);
    if (timerRef.current) window.clearInterval(timerRef.current);
  }

  function computeFrames(): Frame[] {
    const base = clone(grid);
    const t0 = performance.now();

    let res: RunResult;
    if (algo === "BFS") {
      res = runBFS(base, start, goal);
    } else if (algo === "Dijkstra") {
      res = runDijkstra(base, start, goal);
    } else {
      res = runAStar(base, start, goal);
    }

    const t1 = performance.now();
    const runtimeVal = +(t1 - t0).toFixed(1);

    let pathLen = 0;
    if (res.found) {
      const lastFrame = res.frames[res.frames.length - 1];
      if (lastFrame.path) pathLen = lastFrame.path.length;
    }

    setPathLength(res.found ? pathLen : null);
    setExplored(res.visitedCount ?? null); // 👈 exact visited nodes
    setRuntime(runtimeVal);

    return res.frames;
  }

  function applyFrame(f: Frame) {
    setGrid((g) => {
      const ng = clone(g);
      f.visit?.forEach(([r, c]) => {
        if (!ng[r][c].start && !ng[r][c].goal) ng[r][c].visited = true;
      });
      f.frontier?.forEach(([r, c]) => {
        if (!ng[r][c].start && !ng[r][c].goal) ng[r][c].inFrontier = true;
      });
      f.path?.forEach(([r, c]) => {
        if (!ng[r][c].start && !ng[r][c].goal) ng[r][c].inPath = true;
      });
      return ng;
    });
  }

  function onRun() {
    resetVisuals(false); // reset first
    const frames = computeFrames(); // compute also sets stats
    framesRef.current = frames;
    let i = 0;
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      applyFrame(frames[i]);
      i++;
      setFrameIdx(i);
      if (i >= frames.length && timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }, SPEEDS[speed]);
  }

  function onStep() {
    if (!framesRef.current.length) {
      resetVisuals(false);
      framesRef.current = computeFrames();
    }
    const i = frameIdx;
    if (i < framesRef.current.length) {
      applyFrame(framesRef.current[i]);
      setFrameIdx(i + 1);
    }
  }

  return (
    <div className="space-y-3">
      {/* controls */}
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold">
          Pathfinding Visualizer — {algo}
        </h2>

        <label className="text-sm ml-2">Algo</label>
        <select
          value={algo}
          onChange={(e) => setAlgo(e.target.value as Algo)}
          className="px-2 py-1 rounded border"
        >
          <option value="BFS">BFS</option>
          <option value="Dijkstra">Dijkstra</option>
          <option value="A*">A*</option>
        </select>

        <label className="text-sm ml-2">Speed</label>
        <select
          value={speed}
          onChange={(e) => setSpeed(e.target.value as SpeedKey)}
          className="px-2 py-1 rounded border"
        >
          {Object.keys(SPEEDS).map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>

        <div className="ml-2 flex gap-2">
          <button
            onClick={onRun}
            className="px-3 py-1 rounded bg-black text-white shadow"
          >
            Run
          </button>
          <button
            onClick={onStep}
            className="px-3 py-1 rounded border"
          >
            Step
          </button>
          <button
            onClick={() => resetVisuals(false)}
            className="px-3 py-1 rounded border"
          >
            Reset Visuals
          </button>
          <button
            onClick={() => resetVisuals(true)}
            className="px-3 py-1 rounded border"
          >
            Clear Board
          </button>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <span className="text-sm">Paint:</span>
          <button
            onClick={() => setPaint("wall")}
            className={`px-2 py-1 rounded border ${
              paint === "wall" ? "bg-gray-200" : ""
            }`}
          >
            Wall
          </button>
          <button
            onClick={() => setPaint("weight")}
            className={`px-2 py-1 rounded border ${
              paint === "weight" ? "bg-gray-200" : ""
            }`}
          >
            Weight
          </button>
          <button
            onClick={() => setPaint("erase")}
            className={`px-2 py-1 rounded border ${
              paint === "erase" ? "bg-gray-200" : ""
            }`}
          >
            Erase
          </button>
        </div>
      </div>

      {/* grid */}
      <div
        className="inline-block rounded-2xl border p-2 bg-white shadow-inner select-none"
        onMouseLeave={() => {
          setMouseDown(false);
          setDrag("none");
        }}
      >
        {grid.map((row, ri) => (
          <div key={ri} className="flex">
            {row.map((cell, ci) => (
              <div
                key={ci}
                onMouseDown={() => {
                  if (cell.start) setDrag("start");
                  else if (cell.goal) setDrag("goal");
                  else {
                    setMouseDown(true);
                    paintCell(ri, ci);
                  }
                }}
                onMouseUp={() => {
                  setMouseDown(false);
                  setDrag("none");
                }}
                onMouseEnter={() => {
                  if (drag === "start") moveStart(ri, ci);
                  else if (drag === "goal") moveGoal(ri, ci);
                  else if (mouseDown) paintCell(ri, ci);
                }}
                className={
                  "w-6 h-6 border border-gray-200 box-border cursor-pointer " +
                  (cell.start
                    ? "bg-green-500 "
                    : cell.goal
                    ? "bg-red-500 "
                    : cell.inPath
                    ? "bg-yellow-400 "
                    : cell.visited
                    ? "bg-blue-300 "
                    : cell.inFrontier
                    ? "bg-teal-300 "
                    : cell.wall
                    ? "bg-gray-800 "
                    : cell.weight > 1
                    ? "bg-amber-100 "
                    : "bg-white ")
                }
                title={`(${ri},${ci}) w=${cell.weight}`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* legend + stats panel */}
      <div className="text-sm flex flex-col gap-2">
        <div>
          <b>Legend:</b>
          <span className="inline-block w-3 h-3 bg-green-500 mx-1 rounded-sm" />
          Start
          <span className="inline-block w-3 h-3 bg-red-500 mx-1 rounded-sm" />
          Goal
          <span className="inline-block w-3 h-3 bg-gray-800 mx-1 rounded-sm" />
          Wall
          <span className="inline-block w-3 h-3 bg-amber-100 mx-1 rounded-sm border" />
          Weight(5)
          <span className="inline-block w-3 h-3 bg-teal-300 mx-1 rounded-sm" />
          Frontier
          <span className="inline-block w-3 h-3 bg-blue-300 mx-1 rounded-sm" />
          Visited
          <span className="inline-block w-3 h-3 bg-yellow-400 mx-1 rounded-sm" />
          Path
        </div>

        <div className="flex gap-6 font-medium">
          <span>Path length: {pathLength ?? "—"}</span>
          <span>Explored: {explored ?? "—"}</span>
          <span>Runtime: {runtime != null ? `${runtime} ms` : "—"}</span>
        </div>
      </div>
    </div>
  );
}
