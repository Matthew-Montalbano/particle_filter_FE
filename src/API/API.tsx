import axios from "axios";
import {
  Scenario,
  Particle,
  TimeStateObject,
  ParticleFilterSettings,
  ParticleFilterProcessingResponse,
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

export const createScenario = async (scenario: Scenario) => {
  await axios.post(`${ENDPOINT}/scenarios`, scenario);
};

/* Particle Filter Routing */

export const createParticleFilter = async (
  scenarioId: string,
  particleFilterSettings: ParticleFilterSettings
): Promise<ParticleFilterProcessingResponse> => {
  const response = await axios.post(`${ENDPOINT}/particleFilter`, {
    scenarioId: scenarioId,
    numParticles: particleFilterSettings.numParticles,
    maxSpeed: particleFilterSettings.maxSpeed,
    meanManeuverTime: particleFilterSettings.meanManeverTime,
  });
  return response.data;
};

export const processNextObservation = async (
  particleFilterId: String
): Promise<ParticleFilterProcessingResponse> => {
  const response = await axios.post(
    `${ENDPOINT}/particleFilter/processNextObservation`,
    { id: particleFilterId }
  );
  return response.data;
};

export const updateParticleFilterTime = async (
  time: number
): Promise<ParticleFilterProcessingResponse> => {
  const response = await axios.post(`${ENDPOINT}/particleFilter/updateTime`, {
    time: time,
  });
  return response.data;
};
