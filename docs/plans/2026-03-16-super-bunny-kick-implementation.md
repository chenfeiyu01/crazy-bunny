# Super Bunny Kick Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rework the rabbit kick so it behaves like Super Bunny Man: kicks only when the leg/foot actually reaches a surface, and the launch direction follows the rabbit's current body/leg pose rather than generic collision normals.

**Architecture:** Keep the current Three.js + Cannon scene, but replace the boolean body-contact kick check with a leg-driven kick model. Add a small pure helper module that computes leg direction, foot probe rays, valid leg contact hits, and the impulse application point, then update `Player` to apply the kick impulse at the foot-side of the body so rotation and launch feel closer to Super Bunny Man.

**Tech Stack:** TypeScript, Three.js, cannon-es, Vitest, Playwright

---

### Task 1: Add regression tests for Super Bunny style leg kick helpers

**Files:**
- Modify: `src/entities/__tests__/kickPhysics.test.ts`
- Modify: `src/entities/kickPhysics.ts`
- Modify: `package.json`

**Step 1: Write the failing test**
- Add tests for upright leg direction, right-lean kick direction, foot probe start/end placement, self-hit rejection, and impulse application point placement on the foot side of the rabbit.

**Step 2: Run test to verify it fails**
Run: `npm test -- --run`
Expected: FAIL because the new helper APIs or expected outputs are not implemented yet.

**Step 3: Write minimal implementation**
- Implement pure helpers for leg direction, kick direction, kick probe construction, valid external hit detection, and kick impulse point calculation.

**Step 4: Run test to verify it passes**
Run: `npm test -- --run`
Expected: PASS.

### Task 2: Rework `Player` kick logic to use leg-driven contact and off-center impulse

**Files:**
- Modify: `src/entities/Player.ts`

**Step 1: Replace broad body contact probing**
- Probe from the lower leg/foot direction only, with a tight fan around the leg, not around the whole body.

**Step 2: Require actual leg contact**
- Ignore self hits and midair misses.
- Return the best external hit plus the kick direction and impulse point data needed for the kick.

**Step 3: Apply impulse at the foot side of the body**
- Use `body.applyImpulse(impulse, worldPoint)` with an off-center point near the active leg instead of applying at the body center.
- Preserve cooldown and leg animation.

**Step 4: Keep movement scope narrow**
- Do not redesign the whole controller; only change kick/contact behavior needed for Super Bunny Man style launch.

### Task 3: Browser playtest and verification

**Files:**
- Create: `tmp/playtest_*.mjs` if needed for debugging only

**Step 1: Run automated tests**
Run: `npm test -- --run`
Expected: PASS.

**Step 2: Run production build**
Run: `npm run build`
Expected: PASS.

**Step 3: Playtest in browser**
- Start local dev server.
- Verify: upright kick launches upward, right lean launches right-up, left lean launches left-up, holding space in air does not add extra kick, edge kicks feel consistent.

**Step 4: Remove temporary debugging scripts if no longer needed**
- Keep repo clean except for intentional tests/docs.
