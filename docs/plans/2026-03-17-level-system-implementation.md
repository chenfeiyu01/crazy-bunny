# Level System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a data-driven multi-level stage system with restart and next-level flow.

**Architecture:** Introduce level definition data plus a tiny pure progression helper for level-clear outcomes. Update `Game` to load and unload stage content from data, reset the player to each level's spawn, and switch between lose, next-level, and final-win overlays without reloading the page.

**Tech Stack:** TypeScript, Three.js, cannon-es, Vitest, Vite

---

### Task 1: Lock level progression rules with tests

**Files:**
- Create: `src/levels/levelProgression.ts`
- Create: `src/levels/__tests__/levelProgression.test.ts`

**Step 1: Write the failing test**
- Cover advancing from a non-final level, finishing on the last level, and clamping invalid indices.

**Step 2: Run test to verify it fails**
- Run: `npm test -- --run src/levels/__tests__/levelProgression.test.ts`

**Step 3: Write minimal implementation**
- Add pure helpers for clear outcome and safe level index normalization.

**Step 4: Run test to verify it passes**
- Run: `npm test -- --run src/levels/__tests__/levelProgression.test.ts`

### Task 2: Move stages into level definitions

**Files:**
- Create: `src/levels/levelData.ts`
- Create: `src/levels/types.ts`
- Modify: `src/Game.ts`

**Step 1: Define typed level content**
- Add spawn point, fall limit, platforms, carrots, and optional theme text.

**Step 2: Port the current handcrafted stage into multiple level entries**
- Split the current course into at least 3 short levels.

**Step 3: Load stage data through `Game`**
- Replace hardcoded `createLevel()` contents with config-driven spawning.

### Task 3: Add runtime level transitions and restart

**Files:**
- Modify: `src/Game.ts`
- Modify: `src/entities/Player.ts`
- Modify: `src/entities/Ground.ts`
- Modify: `src/entities/Carrot.ts`
- Modify: `index.html`

**Step 1: Add cleanup/reset hooks**
- Let the game unload old platforms/carrots and reposition the player without reloading the page.

**Step 2: Add current-level restart**
- Make `R` restart only the current level.

**Step 3: Add next-level flow**
- When all carrots are collected, move to the next level if one exists; otherwise show final win.

**Step 4: Update HUD and overlays**
- Show current level index and distinguish next-level clear from final game clear.

### Task 4: Verify the integrated game loop

**Files:**
- Verify only

**Step 1: Targeted tests**
- `npm test -- --run src/levels/__tests__/levelProgression.test.ts`

**Step 2: Full test suite**
- `npm test -- --run`

**Step 3: Build**
- `npm run build`

**Step 4: Local playtest**
- Play through level clear, next level load, current-level restart, and final win.
