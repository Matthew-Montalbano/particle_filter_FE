import axios from "axios";
import {
  Scenario,
  Particle,
  TimeStateObject,
  ParticleFilterSettings,
} from "../interfaces";

const ENDPOINT = "http://localhost:8080";

/* Scenario Routing */

export const getAllScenarios = async (): Promise<Map<string, Scenario>> => {
  const response = await axios.get("http://localhost:8080/scenarios");
  return new Map(Object.entries(response.data));
};

export const getScenarioById = async (id: string): Promise<Scenario> => {
  const response = await axios.get(`${ENDPOINT}/scenarios/${id}`);
  return response.data;
};

export const createScenario = async (
  id: string,
  trueTargetStates: TimeStateObject[],
  standardDeviation: number,
  seed: number
) => {
  await axios.post(`${ENDPOINT}/scenarios`, {
    id: id,
    trueTargetStates: trueTargetStates,
    standardDeviation: standardDeviation,
    seed: seed,
  });
};

/* Particle Filter Routing */

export const createParticleFilter = async (
  scenarioId: string,
  particleFilterSettings: ParticleFilterSettings
) => {
  await axios.post(`${ENDPOINT}/particleFilter`, {
    scenarioId: scenarioId,
    numParticles: particleFilterSettings.numParticles,
    maxSpeed: particleFilterSettings.maxSpeed,
    meanManeuverTime: particleFilterSettings.meanManeverTime,
  });
};

export const processNextObservation = async (): Promise<Particle[]> => {
  const response = await axios.post(
    `${ENDPOINT}/particleFilter/processSNextObservation`
  );
  return response.data;
};

export const updateParticleFilterTime = async (
  time: number
): Promise<Particle[]> => {
  const response = await axios.post(`${ENDPOINT}/particleFilter/updateTime`, {
    time: time,
  });
  return response.data;
};
