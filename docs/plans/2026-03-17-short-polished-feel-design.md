# Short Polished Feel Design

**Goal:** Build a short, polished web level where the kick/jump feel is the primary focus, with gameplay centered on readable, satisfying Super Bunny Man style launches.

**Design Direction:** Keep the current rolling rigidbody base, but stop treating the experience as pure physics. The game should remain chaotic and funny, yet the controls need hidden forgiveness: buffered kick input, more stable second jumps, less midair spin explosion, stronger landing recovery, and a level layout that teaches and rewards those behaviors in under a few minutes.

**Movement Priorities:**
- Kicks must feel responsive even with slightly early button presses.
- Right lean should clearly launch right-up, left lean left-up, upright nearly straight up.
- Second and third jumps should stay playful, not degenerate into uncontrollable 360-degree spinning.
- Air control should be limited but useful.
- Landing should restore control quickly enough to chain kicks.

**Implementation Shape:**
- Add buffered kick input and more forgiving kick contact checks.
- Tune kick direction to bias upward and clamp extreme spin.
- Gate strong rolling torque to grounded states and add landing stabilization.
- Actually wire player/ground materials into Cannon contact materials so friction settings affect gameplay.
- Replace the current rough layout with a short, curated level that teaches one mechanic at a time and ends with a small combo section.

**Level Shape:**
- Opening: safe runway + first easy carrot to teach rolling and first kick.
- Middle: two compact platform chains that require consecutive kicks and recovery after landing.
- Ending: one short climax sequence with a final reward and clear finish.
