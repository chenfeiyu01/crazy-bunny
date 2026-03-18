# Super Bunny Man Single-Player Replica Design

**Objective:** Evolve the current browser prototype into a single-player experience that feels substantially closer to the desktop version of Super Bunny Man before expanding into co-op or larger content systems.

## Current State

The repository already contains a playable Three.js + cannon-es prototype:

- a rolling rabbit body with kick-based locomotion
- three short data-driven levels
- carrot collection, exit portal clear, fail-and-restart loop
- a basic HUD and clear/fail overlays
- unit tests around input, movement tuning, and level helpers

This is enough to support iteration, but it still behaves like an inspired prototype rather than a faithful replica. The main gaps are in movement feel, camera behavior, goal structure, level rhythm, and moment-to-moment feedback.

## Product Direction

The first delivery target is **single-player core replication**.

That means:

- preserve the current 2.5D side-on presentation
- prioritize the physical comedy and instability of movement
- make progression feel like a chain of short training challenges
- treat collectibles as optional or secondary, not the primary win condition
- defer co-op, grab mechanics, network play, and release packaging

This direction is intentionally narrow. It gives the project the fastest path to "this feels like Super Bunny Man" without spreading effort across systems that depend on a solid movement baseline.

## Design Principles

1. **Feel first.** Movement quality matters more than raw feature count.
2. **Readable chaos.** The rabbit should feel awkward and funny, but never random.
3. **Short iteration loops.** Physics tuning must be easy to change and verify.
4. **Data-driven content.** Level difficulty should come from authored geometry, not hardcoded logic.
5. **Future-safe structure.** Single-player work should not block later co-op work.

## Scope

### In scope for the next milestone

- retune player locomotion to better match rolling, kicking, tumbling, and recovery
- introduce a dedicated camera controller with look-ahead and fall handling
- shift level completion toward "reach the end" with optional carrots
- upgrade level layouts into more deliberate training-style obstacle sequences
- improve feedback for kick, landing, collection, clear, and fail states
- formalize game state transitions so respawn and clear flow are predictable

### Out of scope for this milestone

- two-player local or online co-op
- grab/carry mechanics
- full world map or chapter-select flow
- advanced hazards such as vehicles or complex machinery
- production audio pipeline or final art pass

## System Design

### Player Controller

`Player` should move from a single large class toward three concerns:

- **input interpretation**: translate keyboard events into intents such as roll left, roll right, and kick
- **physics tuning**: own constants and logic for ground torque, air control, kick impulse, landing damping, and coyote/buffer style timing if needed
- **visual presentation**: keep squash, leg extension, and pose sync isolated from physics rules

The goal is not a full rewrite, but a clearer seam for tuning. The most important outcome is that movement parameters become easier to reason about and compare between playtests.

### Camera Controller

Camera logic should move out of `Game` into a dedicated controller that can:

- follow the player with smoothing
- look ahead in the direction of travel
- clamp vertical snaps to avoid nausea
- give extra room below the player during falls
- reset cleanly on respawn and level load

This makes the camera tunable without mixing rendering concerns into game-state orchestration.

### Game Flow State

`Game` should own a small explicit state model:

- `playing`
- `cleared`
- `failed`
- `respawning`

This keeps input handling, HUD updates, and overlay behavior deterministic and prepares the project for later additions such as checkpoints or co-op revive logic.

### Level Model

Levels should remain data-driven, but the design target changes from "a few floating boxes" to a reusable obstacle grammar:

- gentle slopes for roll practice
- short drops that teach recovery
- narrow platforms that punish over-rotation
- chained ramps that reward rhythm
- optional carrot placements for risk/reward detours

The exit remains the primary completion rule. Carrots become score/exploration flavor rather than a hard gate.

### Feedback Layer

The current HUD and overlays are serviceable but too flat. The next milestone should add lightweight feedback hooks for:

- kick burst
- hard landing
- carrot pickup
- level clear
- fail state

This can begin with animation, UI response, and placeholder particles/shake rather than final audio assets.

## Testing Strategy

The project already has useful unit coverage. The next milestone should extend tests around deterministic helpers and keep physics-heavy assertions focused on stable behaviors:

- pure state helpers for game-flow transitions
- camera target calculations where possible
- player-tuning invariants that do not depend on fragile frame-perfect outcomes
- level-goal logic after carrots become optional

Runtime validation still matters. Each milestone should include manual playtesting across all authored levels because movement feel cannot be fully proven by unit tests.

## Success Criteria

The milestone is successful when:

- the rabbit feels clumsy but learnable within seconds
- progress comes from mastering rolling and kick timing, not from fighting unclear controls
- the camera helps the player read terrain instead of merely following position
- the three-level sequence feels like an intentional training world
- the code structure clearly supports later work on co-op and grab systems

## Milestones

### M1: Feel Baseline

- retune movement
- add camera controller
- formalize game state
- make carrots optional to progression

### M2: Level Grammar

- rebuild the current world into better training stages
- add more authored obstacle patterns
- tune fail/respawn cadence

### M3: Feedback Polish

- improve overlays, HUD emphasis, particles, and screen feedback
- add placeholder audiovisual hooks for future content polish

### M4: Co-op Ready Architecture

- prepare interfaces and state boundaries needed for later two-player work
- do not implement co-op yet

## Risks

- Physics feel can regress while refactoring `Player`.
- Camera tuning can improve readability for one level and hurt another.
- Overfitting to a single playtester can produce unstable parameters.
- Trying to imitate every desktop feature too early will slow momentum.

## Decision

Proceed with **M1: Feel Baseline** as the next implementation milestone. That is the highest-leverage step toward a convincing single-player replica.
