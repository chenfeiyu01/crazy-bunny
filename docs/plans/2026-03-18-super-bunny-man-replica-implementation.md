# Super Bunny Man Single-Player Replica Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade the current prototype into a stronger single-player "feel baseline" by improving player tuning, camera behavior, game-state flow, and level goals.

**Architecture:** Keep the existing Three.js + cannon-es runtime, but split major responsibilities more clearly. Add small deterministic helpers for state and camera logic, move camera behavior into its own controller, retune the player controller behind tests, and shift progression so level completion depends on reaching the exit while carrots remain optional rewards.

**Tech Stack:** TypeScript, Three.js, cannon-es, Vitest, Vite

---

### Task 1: Lock the new level-clear rules with tests

**Files:**
- Modify: `src/levels/levelGoals.ts`
- Modify: `src/levels/__tests__/levelGoals.test.ts`

**Step 1: Write the failing test**

Add tests that prove:

- reaching the exit is enough to clear a level
- carrot count no longer blocks level clear
- the helper still returns `false` when the player is outside the exit radius

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/levels/__tests__/levelGoals.test.ts`

Expected: FAIL because the current helper set does not model the new clear rule explicitly enough for the updated tests.

**Step 3: Write minimal implementation**

Update `src/levels/levelGoals.ts` so the exported helpers express the new rule directly and remain pure.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/levels/__tests__/levelGoals.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add src/levels/levelGoals.ts src/levels/__tests__/levelGoals.test.ts
git commit -m "test: lock exit-first level clear rules"
```

### Task 2: Introduce a game-state helper for clear/fail flow

**Files:**
- Create: `src/game/gameState.ts`
- Create: `src/game/__tests__/gameState.test.ts`
- Modify: `src/Game.ts`

**Step 1: Write the failing test**

Create pure tests for:

- initial state is `playing`
- a clear transition moves to `cleared`
- a fail transition moves to `failed`
- loading or restarting a level returns to `playing`
- invalid transitions are ignored or normalized by helper rules

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/game/__tests__/gameState.test.ts`

Expected: FAIL because `src/game/gameState.ts` does not exist yet.

**Step 3: Write minimal implementation**

Create `src/game/gameState.ts` with:

- a `GamePhase` type
- pure helpers for level load, clear, fail, and restart transitions

Keep the helpers free of Three.js and DOM dependencies.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/game/__tests__/gameState.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add src/game/gameState.ts src/game/__tests__/gameState.test.ts src/Game.ts
git commit -m "feat: add explicit game phase helpers"
```

### Task 3: Add a dedicated camera controller behind deterministic tests

**Files:**
- Create: `src/camera/CameraController.ts`
- Create: `src/camera/__tests__/CameraController.test.ts`
- Modify: `src/Game.ts`

**Step 1: Write the failing test**

Add tests around deterministic camera target calculation such as:

- looks ahead of the player when moving right
- looks behind less aggressively when nearly stationary
- gives more vertical room while falling
- reset snaps camera state to the spawn anchor

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/camera/__tests__/CameraController.test.ts`

Expected: FAIL because the controller does not exist yet.

**Step 3: Write minimal implementation**

Create `src/camera/CameraController.ts` with:

- constructor that accepts the `THREE.OrthographicCamera`
- `reset(x, y)` method
- `update(playerPosition, playerVelocity, delta)` method
- small internal helpers for target position and smoothing

Keep the tunable numbers near the top of the file for easy playtest iteration.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/camera/__tests__/CameraController.test.ts`

Expected: PASS

**Step 5: Integrate into `Game`**

Replace `resetCamera()` and `updateCamera()` usage inside `src/Game.ts` with the controller methods.

**Step 6: Run focused tests again**

Run: `npm test -- --run src/camera/__tests__/CameraController.test.ts src/game/__tests__/gameState.test.ts`

Expected: PASS

**Step 7: Commit**

```bash
git add src/camera/CameraController.ts src/camera/__tests__/CameraController.test.ts src/Game.ts
git commit -m "feat: add predictive side-scroll camera controller"
```

### Task 4: Make player tuning easier to iterate without rewriting the whole class

**Files:**
- Create: `src/entities/playerTuning.ts`
- Create: `src/entities/__tests__/playerTuning.test.ts`
- Modify: `src/entities/Player.ts`
- Modify: `src/entities/__tests__/PlayerMovement.test.ts`

**Step 1: Write the failing test**

Add unit tests that prove exported tuning helpers:

- clamp angular speed to separate air and ground caps
- expose named movement constants instead of buried magic numbers
- preserve current safety invariants such as non-negative timers and bounded angular speed

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/entities/__tests__/playerTuning.test.ts`

Expected: FAIL because `src/entities/playerTuning.ts` does not exist yet.

**Step 3: Write minimal implementation**

Create `src/entities/playerTuning.ts` exporting:

- grouped tuning constants
- tiny helper functions needed by `Player`

Move matching constants out of `src/entities/Player.ts` and update the class to import them.

**Step 4: Update existing movement tests**

Extend `src/entities/__tests__/PlayerMovement.test.ts` to assert the tuned behavior still supports:

- torque-driven rolling on the ground
- weaker air control than ground control
- kick buffering/cooldown expectations that stay intentionally bounded

**Step 5: Run focused tests**

Run: `npm test -- --run src/entities/__tests__/playerTuning.test.ts src/entities/__tests__/PlayerMovement.test.ts`

Expected: PASS

**Step 6: Commit**

```bash
git add src/entities/playerTuning.ts src/entities/__tests__/playerTuning.test.ts src/entities/Player.ts src/entities/__tests__/PlayerMovement.test.ts
git commit -m "refactor: extract player tuning controls"
```

### Task 5: Add one controlled movement improvement at a time

**Files:**
- Modify: `src/entities/Player.ts`
- Modify: `src/entities/playerTuning.ts`
- Modify: `src/entities/__tests__/PlayerMovement.test.ts`
- Modify: `src/entities/__tests__/kickPhysics.test.ts`

**Step 1: Write the failing test for the first improvement**

Start with exactly one feel improvement, recommended order:

1. landing recovery damping
2. stronger forward commitment during kick impulse
3. short forgiveness window for kick timing after ground contact

Pick the first item only for this task and write the failing test before implementation.

**Step 2: Run the focused test**

Run: `npm test -- --run src/entities/__tests__/PlayerMovement.test.ts src/entities/__tests__/kickPhysics.test.ts`

Expected: FAIL on the new assertion only.

**Step 3: Implement the minimal code**

Adjust `src/entities/Player.ts` and, if needed, `src/entities/playerTuning.ts` to satisfy only the tested improvement.

**Step 4: Re-run focused tests**

Run: `npm test -- --run src/entities/__tests__/PlayerMovement.test.ts src/entities/__tests__/kickPhysics.test.ts`

Expected: PASS

**Step 5: Repeat for the second and third improvement**

Add one failing test, make it pass, and re-run the same focused suite after each change.

**Step 6: Commit**

```bash
git add src/entities/Player.ts src/entities/playerTuning.ts src/entities/__tests__/PlayerMovement.test.ts src/entities/__tests__/kickPhysics.test.ts
git commit -m "feat: improve rabbit movement feel baseline"
```

### Task 6: Shift carrots from gate to optional pickup in runtime flow

**Files:**
- Modify: `src/Game.ts`
- Modify: `index.html`

**Step 1: Write the failing test or helper test**

If the new behavior can be expressed through a pure helper, add a test for:

- clear screen appears when the player reaches the exit even with zero carrots
- carrot count still updates the HUD as an optional collectible stat

If a pure helper is not practical, add a small helper function in `src/game/gameState.ts` first and test that.

**Step 2: Run the targeted test**

Run: `npm test -- --run src/game/__tests__/gameState.test.ts src/levels/__tests__/levelGoals.test.ts`

Expected: FAIL on the newly added expectation.

**Step 3: Implement the minimal runtime change**

Update `src/Game.ts` so:

- exit collision clears the level without checking carrot completion
- HUD wording reflects carrots as optional collection
- win copy references stage completion first and carrot stats second

Update `index.html` copy to match the new goal description.

**Step 4: Run targeted tests**

Run: `npm test -- --run src/game/__tests__/gameState.test.ts src/levels/__tests__/levelGoals.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add src/Game.ts src/game/gameState.ts src/game/__tests__/gameState.test.ts src/levels/levelGoals.ts src/levels/__tests__/levelGoals.test.ts index.html
git commit -m "feat: make carrots optional stage pickups"
```

### Task 7: Rebuild the current three stages into a training-world sequence

**Files:**
- Modify: `src/levels/types.ts`
- Modify: `src/levels/levelData.ts`

**Step 1: Update the level schema only if needed**

If current fields are enough, do not expand the schema. If a new field is necessary, add the smallest possible field with a test if a pure helper depends on it.

**Step 2: Rewrite level layouts**

Author three short stages with deliberate roles:

- Level 1 teaches rolling and one safe kick
- Level 2 teaches recovery from awkward landings
- Level 3 chains ramps, gaps, and optional carrot detours

Keep the geometry simple. Prefer better spacing over more props.

**Step 3: Run the game manually**

Run: `npm run dev`

Verify:

- each stage can be cleared consistently
- each stage teaches something distinct
- carrots are optional risk/reward pickups

**Step 4: Commit**

```bash
git add src/levels/types.ts src/levels/levelData.ts
git commit -m "feat: author single-player training world levels"
```

### Task 8: Add lightweight feedback polish for clear and fail states

**Files:**
- Modify: `src/Game.ts`
- Modify: `index.html`
- Modify: `src/entities/Carrot.ts`
- Create: `src/game/feedback.ts`
- Create: `src/game/__tests__/feedback.test.ts`

**Step 1: Write the failing test**

Test pure feedback helpers for:

- selecting the correct message variant for clear vs final clear
- formatting carrot summary text
- formatting fail copy with current level index

**Step 2: Run the focused test**

Run: `npm test -- --run src/game/__tests__/feedback.test.ts`

Expected: FAIL because the helper does not exist yet.

**Step 3: Write minimal implementation**

Create `src/game/feedback.ts` with pure formatting helpers, then wire them into `src/Game.ts`.

**Step 4: Add light visual polish**

Update runtime/UI behavior with minimal scope:

- stronger clear/fail copy
- more readable objective text
- a slightly more celebratory carrot collect response in `src/entities/Carrot.ts`

Do not add final asset pipelines in this task.

**Step 5: Run the focused test**

Run: `npm test -- --run src/game/__tests__/feedback.test.ts`

Expected: PASS

**Step 6: Commit**

```bash
git add src/game/feedback.ts src/game/__tests__/feedback.test.ts src/Game.ts src/entities/Carrot.ts index.html
git commit -m "feat: improve stage feedback and presentation"
```

### Task 9: Verify the milestone end-to-end

**Files:**
- Verify only

**Step 1: Run the full test suite**

Run: `npm test -- --run`

Expected: PASS

**Step 2: Build the production bundle**

Run: `npm run build`

Expected: PASS with no TypeScript errors

**Step 3: Manual playtest**

Run: `npm run dev`

Verify:

- controls feel more readable than the previous baseline
- the camera helps with terrain anticipation
- the player can clear all three stages without collecting carrots
- clear/fail flow always resets correctly

**Step 4: Commit verification-safe follow-up if needed**

If manual playtest reveals a tiny issue, fix it in a separate small commit before closing the milestone.

**Step 5: Record milestone notes**

Append short notes to the design doc or a new milestone note with:

- what improved
- what still feels off
- what should be tackled in M2
