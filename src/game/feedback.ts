export interface ClearPresentation {
  title: string;
  message: string;
  actionLabel: string;
}

export function formatCarrotSummary(carrotCount: number, totalCarrots: number): string {
  return `可选胡萝卜 ${carrotCount} / ${totalCarrots}`;
}

export function getClearPresentation(
  isFinalLevel: boolean,
  carrotCount: number,
  totalCarrots: number
): ClearPresentation {
  const carrotSummary = formatCarrotSummary(carrotCount, totalCarrots);

  if (isFinalLevel) {
    return {
      title: '🏆 训练世界完成!',
      message: `${carrotSummary} · 继续打磨手感后再进阶完整复刻`,
      actionLabel: '重新开始',
    };
  }

  return {
    title: '🌀 过关，继续往前滚!',
    message: `${carrotSummary} · 按 Enter 或点击进入下一关`,
    actionLabel: '下一关',
  };
}

export function getFailMessage(levelIndex: number): string {
  return `你滚出了训练路线，按 R 或点击按钮重开第 ${levelIndex + 1} 关`;
}
