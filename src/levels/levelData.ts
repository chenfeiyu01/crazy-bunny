import { LevelDefinition } from './types';

export const LEVELS: LevelDefinition[] = [
  {
    id: 'training-roll-1',
    name: '训练 1-1 · 翻滚热身',
    fallLimit: -12,
    spawn: { x: -11.2, y: 2.2 },
    exit: { x: 15.9, y: -0.5, z: 0 },
    platforms: [
      { x: -8.8, y: -3.1, z: 0, width: 10.8, height: 2.4, depth: 3, color: 0x5c8d2e },
      { x: -1.2, y: -2.0, z: 0, width: 6.4, height: 1.5, depth: 3, color: 0x6b9f36, rotationZ: 0.12 },
      { x: 4.0, y: -1.0, z: 0, width: 4.0, height: 1.2, depth: 3, color: 0x7ab441 },
      { x: 8.5, y: -1.8, z: 0, width: 4.2, height: 1.2, depth: 3, color: 0x679b33, rotationZ: -0.1 },
      { x: 13.6, y: -2.15, z: 0, width: 5.4, height: 1.6, depth: 3, color: 0x5c8d2e },
    ],
    carrots: [
      { x: 4.1, y: 1.1, z: 0 },
    ],
  },
  {
    id: 'training-recover-2',
    name: '训练 1-2 · 失衡恢复',
    fallLimit: -13,
    spawn: { x: -11.8, y: 2.3 },
    exit: { x: 18.9, y: 0.95, z: 0 },
    platforms: [
      { x: -9.1, y: -3.0, z: 0, width: 10.2, height: 2.4, depth: 3, color: 0x557d24 },
      { x: -2.3, y: -2.35, z: 0, width: 5.1, height: 1.5, depth: 3, color: 0x648f30, rotationZ: -0.16 },
      { x: 2.7, y: -4.35, z: 0, width: 4.2, height: 1.9, depth: 3, color: 0x4d7322 },
      { x: 7.6, y: -2.45, z: 0, width: 6.0, height: 1.6, depth: 3, color: 0x6c9f38, rotationZ: 0.26 },
      { x: 13.6, y: -0.75, z: 0, width: 4.1, height: 1.2, depth: 3, color: 0x83b84b },
      { x: 18.3, y: -0.2, z: 0, width: 4.9, height: 1.3, depth: 3, color: 0x649131, rotationZ: 0.08 },
    ],
    carrots: [
      { x: 3.0, y: -2.15, z: 0 },
    ],
  },
  {
    id: 'training-rhythm-3',
    name: '训练 1-3 · 节奏连滚',
    fallLimit: -14,
    spawn: { x: -12.8, y: 2.6 },
    exit: { x: 24.7, y: 0.95, z: 0 },
    platforms: [
      { x: -10.4, y: -3.05, z: 0, width: 11.0, height: 2.5, depth: 3, color: 0x557d24 },
      { x: -2.9, y: -2.0, z: 0, width: 5.8, height: 1.5, depth: 3, color: 0x699734, rotationZ: 0.14 },
      { x: 2.2, y: -1.1, z: 0, width: 3.7, height: 1.2, depth: 3, color: 0x7ab441 },
      { x: 6.7, y: -2.55, z: 0, width: 5.3, height: 1.5, depth: 3, color: 0x648f30, rotationZ: -0.22 },
      { x: 11.8, y: -1.0, z: 0, width: 4.0, height: 1.2, depth: 3, color: 0x7ab441, rotationZ: 0.16 },
      { x: 16.5, y: -2.0, z: 0, width: 4.5, height: 1.3, depth: 3, color: 0x648f30, rotationZ: -0.18 },
      { x: 20.4, y: 0.15, z: 0, width: 5.1, height: 1.25, depth: 3, color: 0x89bb4e, rotationZ: 0.12 },
      { x: 25.0, y: -0.2, z: 0, width: 5.2, height: 1.35, depth: 3, color: 0x6b9a36, rotationZ: -0.08 },
    ],
    carrots: [
      { x: 11.8, y: 1.5, z: 0 },
      { x: 20.6, y: 2.15, z: 0 },
    ],
  },
];
