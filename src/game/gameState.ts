export type GamePhase = 'playing' | 'cleared' | 'failed' | 'respawning';

export type GamePhaseEvent = 'load-level' | 'clear' | 'fail' | 'begin-respawn';

const TRANSITIONS: Record<GamePhase, Partial<Record<GamePhaseEvent, GamePhase>>> = {
  playing: {
    clear: 'cleared',
    fail: 'failed',
    'load-level': 'playing',
  },
  cleared: {
    'load-level': 'playing',
  },
  failed: {
    'load-level': 'playing',
    'begin-respawn': 'respawning',
  },
  respawning: {
    'load-level': 'playing',
  },
};

export function createGamePhase(): GamePhase {
  return 'playing';
}

export function transitionGamePhase(current: GamePhase, event: GamePhaseEvent): GamePhase {
  return TRANSITIONS[current][event] ?? current;
}
