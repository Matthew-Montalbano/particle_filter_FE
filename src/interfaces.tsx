export interface Scenario {
  id: string;
  trueTargetStates: TimeStateObject[];
  standardDeviation: number;
  seed: number;
}

export interface TimeStateObject {
  x: number;
  y: number;
  xvelocity: number;
  yvelocity: number;
  time: number;
}

export interface Particle {
  x: number;
  y: number;
  xvelocity: number;
  yvelocity: number;
  time: number;
  weight: number;
  wasSampled: boolean;
}

export interface ParticleFilterSettings {
  numParticles: number;
  maxSpeed: number;
  meanManeverTime: number;
}
