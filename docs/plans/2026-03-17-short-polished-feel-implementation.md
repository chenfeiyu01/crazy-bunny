# Short Polished Feel Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Tune the bunny controller and rebuild the level into a short polished course where kick/jump feel is the core playable experience.

**Architecture:** Keep the single-rigidbody bunny, but introduce hidden feel systems around it: buffered kick input, grounded/landing stabilization, capped air spin, upward-biased kick direction, and real Cannon contact materials. Then rebuild `Game.createLevel()` into a shorter curated sequence that teaches and tests those tuned behaviors.

**Tech Stack:** TypeScript, Three.js, cannon-es, Vitest, Playwright

---

### Task 1: Add failing tests for feel-tuning helpers and movement constraints

**Files:**
- Modify: `src/entities/__tests__/kickPhysics.test.ts`
- Modify: `src/entities/__tests__/PlayerMovement.test.ts`
- Create or Modify: `src/entities/kickPhysics.ts`

**Step 1: Write the failing test**
- Add tests for upward-biased kick direction and air spin clamping helpers.
- Add tests for grounded vs airborne movement force/torque expectations if needed.

**Step 2: Run test to verify it fails**
Run: `npm test -- --run`
Expected: FAIL because the new helpers or tuned expectations are not implemented yet.

**Step 3: Write minimal implementation**
- Implement the helper math needed to support the new feel model.

**Step 4: Run test to verify it passes**
Run: `npm test -- --run`
Expected: PASS.

### Task 2: Rework player feel systems

**Files:**
- Modify: `src/entities/Player.ts`
- Modify: `src/controls/InputController.ts` only if strictly needed

**Step 1: Add buffered kick input**
- Keep a short kick request window so slightly early presses can still fire on contact.

**Step 2: Improve kick launch tuning**
- Bias kick vectors upward.
- Prevent extreme air spin accumulation.
- Add landing recovery so chained jumps stay controllable.

**Step 3: Separate grounded and airborne control**
- Strong rolling torque only on ground.
- Smaller air correction only while airborne.

### Task 3: Wire Cannon materials so friction tuning actually applies

**Files:**
- Modify: `src/physics/PhysicsWorld.ts`
- Modify: `src/entities/Player.ts`
- Modify: `src/entities/Ground.ts`

**Step 1: Expose player and ground materials from the physics world**
**Step 2: Assign them to bodies**
**Step 3: Tune friction and restitution for more controllable landings**

### Task 4: Rebuild the level into a short polished course

**Files:**
- Modify: `src/Game.ts`
- Modify: `index.html` if HUD/instructions need small updates

**Step 1: Replace the current rough platform chain**
- Build a short sequence with tutorial, combo, and finish sections.

**Step 2: Reposition carrots to teach movement**
- Use carrot placement to guide ideal jump arcs.

**Step 3: Update counters/objective values**
- Keep HUD consistent with the new level.

### Task 5: Verify with tests, build, and live playtesting

**Files:**
- None required

**Step 1: Run tests**
Run: `npm test -- --run`

**Step 2: Run build**
Run: `npm run build`

**Step 3: Run local browser playtests**
- Verify first jump, second jump, edge recovery, and a full clear of the short level.
