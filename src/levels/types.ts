export interface LevelPlatformDefinition {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  color: number;
  rotationZ?: number;
}

export interface LevelCarrotDefinition {
  x: number;
  y: number;
  z: number;
}

export interface LevelSpawnDefinition {
  x: number;
  y: number;
}

export interface LevelDefinition {
  id: string;
  name: string;
  fallLimit: number;
  spawn: LevelSpawnDefinition;
  exit: LevelCarrotDefinition;
  platforms: LevelPlatformDefinition[];
  carrots: LevelCarrotDefinition[];
}
