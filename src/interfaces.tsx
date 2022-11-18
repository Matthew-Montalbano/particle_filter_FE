export interface Scenario {
  id: string;
  trueTargetStates: TimeStateObject[];
  standardDeviation: number;
  seed: number;
}

export interface State {
  x: number;
  y: number;
  xvelocity: number;
  yvelocity: number;
}

export interface TimeStateObject {
  x: number;
  y: number;
  xvelocity: number;
  yvelocity: number;
  time: number;
}

export interface ParticleFilterProcessingResponse {
  id: string;
  time: number;
  particles: Particle[];
}

export interface Particle {
  x: number;
  y: number;
  xvelocity: number;
  yvelocity: number;
  time: number;
  weight: number;
  wasSampled: boolean;
  history: Map<string, State>;
}

export interface ParticleFilterSettings {
  numParticles: number;
  maxSpeed: number;
  meanManeverTime: number;
}

export interface ParticleFilter {
  id: String;
  scenario: Scenario;
  particles: Particle[];
  time: number;
}

export enum ParticleFilterStatus {
  Running,
  Paused,
  Stopped,
  NotCreated,
}
