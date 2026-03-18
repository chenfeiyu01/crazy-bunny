# Level System Design

**Goal:** Add a simple data-driven multi-level progression system so the game can load different hand-authored stages, restart the current stage, and move to the next stage when all carrots are collected.

**Approach:** Keep physics and core jump feel unchanged. Move stage geometry and collectibles into level definitions, let `Game` load/unload a level from data, and add a minimal progression layer that decides whether to advance or finish the game when a level is cleared.

**Why this first:** It is the fastest path to a real game loop: play a stage, clear it, go next, restart if you fall, and keep tuning movement on top of stable stage data.
