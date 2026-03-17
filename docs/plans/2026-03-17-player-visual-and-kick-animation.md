# Player Visual And Kick Animation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current sphere-like rabbit with a more readable rabbit-man silhouette and add a clear kick animation with windup, strike, and recovery.

**Architecture:** Keep the existing physics body unchanged so jump feel stays stable. Upgrade only the visual layer by building a multi-part character rig in `Player`, and drive that rig with a pure animation helper that can be tested independently. Add an optional OpenAI image-generation script and prompt so the art pipeline can later produce transparent character assets without changing gameplay code.

**Tech Stack:** TypeScript, Three.js, Vitest, Vite static assets, Node built-in `fetch`

---

### Task 1: Lock kick animation timing with tests

**Files:**
- Create: `src/entities/playerAnimation.ts`
- Create: `src/entities/__tests__/playerAnimation.test.ts`

**Step 1: Write the failing test**
- Assert the animation helper returns a tucked kick leg during windup, strongest extension during strike, and near-neutral pose during recovery.

**Step 2: Run test to verify it fails**
- Run: `npm test -- --run src/entities/__tests__/playerAnimation.test.ts`

**Step 3: Write minimal implementation**
- Add a small pure helper that maps kick animation time to pose data for legs, torso squash, and ear drag.

**Step 4: Run test to verify it passes**
- Run: `npm test -- --run src/entities/__tests__/playerAnimation.test.ts`

### Task 2: Replace the sphere-only look with a readable rabbit-man rig

**Files:**
- Modify: `src/entities/Player.ts`
- Optionally create: `public/generated/`

**Step 1: Keep physics unchanged**
- Leave Cannon body size and kick math as-is.

**Step 2: Rebuild visuals**
- Replace the current single-sphere silhouette with grouped torso, head, belly, ears, support leg, and kick leg meshes.

**Step 3: Attach the tested pose helper**
- Apply the pose helper each frame so the kick leg visibly winds up, snaps outward, and recovers.

**Step 4: Preserve current movement behavior**
- Avoid touching jump constants unless visual timing requires it.

### Task 3: Add an optional AI asset pipeline

**Files:**
- Create: `scripts/generate-player-art.mjs`
- Create: `docs/ai-assets/openai-player-art.md`

**Step 1: Add the script**
- Use the OpenAI Images API with `OPENAI_API_KEY` to generate a transparent-background side-view rabbit-man PNG.

**Step 2: Add prompt docs**
- Store the exact art direction prompt and usage command.

**Step 3: Make the script safe**
- Fail with a clear message if the API key is missing.

### Task 4: Verify end to end

**Files:**
- Verify only

**Step 1: Run targeted tests**
- `npm test -- --run src/entities/__tests__/playerAnimation.test.ts`

**Step 2: Run full tests**
- `npm test -- --run`

**Step 3: Run build**
- `npm run build`

**Step 4: Playtest locally**
- Start Vite, inspect the new silhouette, and verify the kick animation reads clearly during gameplay.
