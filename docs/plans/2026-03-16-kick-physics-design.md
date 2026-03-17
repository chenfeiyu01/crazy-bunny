# Kick Physics Fix Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prevent midair self-triggered kicks and make kick impulse follow the rabbit's leg/body orientation.

**Architecture:** Keep the gameplay model unchanged: the rabbit may kick only when a nearby external surface is detected. Extract small pure helper logic for validating raycast hits, building kick probes that start outside the player body, and converting body rotation into the kick impulse direction, then wire that logic back into `Player`.

**Tech Stack:** TypeScript, Three.js, cannon-es, Vitest

---

### Task 1: Add regression tests for kick hit validation and impulse direction

**Files:**
- Create: `src/entities/__tests__/kickPhysics.test.ts`
- Create: `src/entities/kickPhysics.ts`
- Modify: `package.json`

**Step 1: Write the failing test**
- Cover invalid self-hit, valid external hit, upright kick direction, right-leaning kick direction, and probe start placement.

**Step 2: Run test to verify it fails**
- Run: `npm test -- --run`
- Expected: FAIL because helper module/functions do not exist yet.

**Step 3: Write minimal implementation**
- Add helper functions to validate external contacts, derive kick direction from body rotation, and build a probe that starts just outside the player body.

**Step 4: Run test to verify it passes**
- Run: `npm test -- --run`
- Expected: PASS.

### Task 2: Apply helper logic in player kick behavior

**Files:**
- Modify: `src/entities/Player.ts`

**Step 1: Update contact detection**
- Ignore raycast hits whose body is the player body.

**Step 2: Update kick impulse direction**
- Use body rotation to determine the impulse direction, so leaning right kicks up-right and leaning left kicks up-left.

**Step 3: Keep current cooldown/animation behavior**
- No gameplay expansion, only bug fix.

### Task 3: Verify regression coverage and production build

**Files:**
- None

**Step 1: Run targeted tests**
- Run: `npm test -- --run`

**Step 2: Run production build**
- Run: `npm run build`

**Step 3: Review results**
- Confirm test exit code 0 and build exit code 0 before claiming success.
