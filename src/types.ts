export type Algo = 'BFS' | 'Dijkstra' | 'A*';

export type Cell = {
  r: number; c: number;
  wall: boolean;
  weight: number;
  visited: boolean;
  inPath: boolean;
  inFrontier: boolean;
  start?: boolean;
  goal?: boolean;
};

export type Frame = {
  visit?: [number, number][];
  frontier?: [number, number][];
  path?: [number, number][];
  stats?: { explored: number; frontierSize: number };
};

export type RunResult = {
  frames: Frame[];
  found: boolean;
};

