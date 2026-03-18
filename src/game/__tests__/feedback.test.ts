import { describe, expect, it } from 'vitest';
import { formatCarrotSummary, getClearPresentation, getFailMessage } from '../feedback';

describe('feedback helpers', () => {
  it('formats carrot progress as an optional collectible summary', () => {
    expect(formatCarrotSummary(1, 3)).toBe('可选胡萝卜 1 / 3');
  });

  it('selects the next-level presentation for non-final stages', () => {
    expect(getClearPresentation(false, 2, 5)).toEqual({
      title: '🌀 过关，继续往前滚!',
      message: '可选胡萝卜 2 / 5 · 按 Enter 或点击进入下一关',
      actionLabel: '下一关',
    });
  });

  it('selects the world-clear presentation for the last stage', () => {
    expect(getClearPresentation(true, 2, 3)).toEqual({
      title: '🏆 训练世界完成!',
      message: '可选胡萝卜 2 / 3 · 继续打磨手感后再进阶完整复刻',
      actionLabel: '重新开始',
    });
  });

  it('formats a fail message with the current stage number', () => {
    expect(getFailMessage(2)).toContain('第 3 关');
  });
});
