import { describe, expect, it } from 'vitest';
import {
  createGamePhase,
  transitionGamePhase,
  type GamePhase,
  type GamePhaseEvent,
} from '../gameState';

describe('gameState helpers', () => {
  it('starts in playing phase', () => {
    expect(createGamePhase()).toBe('playing');
  });

  it('moves from playing to cleared or failed for end-of-run events', () => {
    expect(transitionGamePhase('playing', 'clear')).toBe('cleared');
    expect(transitionGamePhase('playing', 'fail')).toBe('failed');
  });

  it('returns to playing when a level loads after restart or progression', () => {
    expect(transitionGamePhase('failed', 'load-level')).toBe('playing');
    expect(transitionGamePhase('respawning', 'load-level')).toBe('playing');
    expect(transitionGamePhase('cleared', 'load-level')).toBe('playing');
  });

  it('uses a respawning intermediary before the current level reloads', () => {
    expect(transitionGamePhase('failed', 'begin-respawn')).toBe('respawning');
  });

  it('ignores invalid transitions instead of producing impossible phases', () => {
    const invalidCases: Array<{ phase: GamePhase; event: GamePhaseEvent }> = [
      { phase: 'cleared', event: 'fail' },
      { phase: 'failed', event: 'clear' },
      { phase: 'playing', event: 'begin-respawn' },
    ];

    invalidCases.forEach(({ phase, event }) => {
      expect(transitionGamePhase(phase, event)).toBe(phase);
    });
  });
});
