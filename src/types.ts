// Represents a single animation frame
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

// Minimal structure for a grid cell
export interface Cell {
  wall: boolean;   // is this a wall?
  weight: number;  // traversal cost (1 for normal, >1 for weighted cells)
}

