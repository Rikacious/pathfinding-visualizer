// Represents a single animation frame
// Represents a single animation frame during algorithm visualization
// Represents a single animation frame during algorithm visualization
export interface Frame {
  visit?: [number, number][];     // cells visited in this frame
  frontier?: [number, number][];  // cells currently in the frontier
  path?: [number, number][];      // final reconstructed path
}

// Represents the result returned by each pathfinding algorithm
export interface RunResult {
  frames: Frame[];
  found: boolean;        // whether a path was found
  visitedCount: number;  // exact number of unique visited nodes
}

// Grid cell structure (unified with what grid.ts and the visualizer use)
export interface Cell {
  r: number;            // row index
  c: number;            // col index
  wall: boolean;        // is this a wall?
  weight: number;       // traversal cost (1 normal, >1 weighted)
  start?: boolean;      // marker flags used by the UI
  goal?: boolean;
  visited?: boolean;    // UI visualization flags
  inFrontier?: boolean;
  inPath?: boolean;
}
