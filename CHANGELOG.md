# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Planned
- Pause/Resume animation controls
- Accurate *cost of path* readout (sum of weights)
- Maze generation (random / recursive division)
- Drag-to-move with keyboard modifiers (Ctrl = erase, Alt = weight)
- Deploy to Vercel/Netlify + README badges

---

## [0.4.0] - 2025-09-02
### Added
- **Exact explored count**: BFS, Dijkstra, and A* now return `visitedCount` (unique visited nodes).
- **Stats panel** below the grid showing **Path length**, **Explored**, and **Runtime (ms)**.
- **Type safety**: algorithms explicitly return `RunResult`; `types.ts` defines `Frame`, `RunResult`, `Cell`.
- **Visualizer** now imports `RunResult` explicitly and enforces it at the call site.

### Changed
- Algorithms are self-contained (local `key`, `neighbors`, `manhattan` helpers).

---

## [0.3.0] - 2025-09-01
### Added
- **A\*** algorithm with Manhattan heuristic (4-direction grid).
- **Algorithm selector** (BFS / Dijkstra / A*) in the UI.

### Changed
- Visuals reset before computing frames to preserve stats across runs.

---

## [0.2.0] - 2025-08-31
### Added
- **Dijkstra’s Algorithm** with weighted cells (amber = weight 5).
- **Controls**: speed selector (Slow/Medium/Fast), Run, Step, Reset Visuals, Clear Board.

### Changed
- Refactored BFS into its own file under `src/algorithms/`.

---

## [0.1.0] - 2025-08-19
### Added
- Project scaffolded with **Vite + React + TypeScript**.
- **Tailwind CSS** configured.
- **Grid editor** (paint Walls / Weights / Erase).
- **BFS visualizer** with animated frontier/visited/path.
- Initial layout and styles.

---

[Unreleased]: https://github.com/<your-username>/<your-repo>/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/<your-username>/<your-repo>/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/<your-username>/<your-repo>/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/<your-username>/<your-repo>/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/<your-username>/<your-repo>/releases/tag/v0.1.0
