import React, { useState, useEffect } from "react";
import logo from "./logo.svg";

import { ParticleFilterSettings, Scenario, Particle } from "./interfaces";
import { getAllScenarios, createParticleFilter } from "./API/API";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Button from "./components/Button/Button";

import "./App.css";
import "bootstrap/dist/css/bootstrap.css";
import { isMethodSignature } from "typescript";

enum ParticleFilterStatus {
  Running,
  Paused,
  Stopped,
  NotCreated,
}

function App() {
  const [particleFilterSettings, setParticleFilterSettings] =
    useState<ParticleFilterSettings>({
      numParticles: 100,
      maxSpeed: 10.0,
      meanManeverTime: 3.0,
    });
  const [particleFilterStatus, setParticleFilterStatus] =
    useState<ParticleFilterStatus>(ParticleFilterStatus.NotCreated);
  const [scenarioSettings, setScenarioSettings] = useState<Scenario>();
  const [scenarios, setScenarios] = useState<Map<string, Scenario>>();

  useEffect(() => {
    getAllScenarios().then((scenarios) => {
      setScenarios(scenarios);
      setScenarioSettings(scenarios.get("default"));
    });
  }, []);

  const createParticleFilterHandler = () => {
    if (scenarioSettings == undefined) {
      return;
    }
    createParticleFilter(scenarioSettings.id, particleFilterSettings).then(
      (particles) => {
        setParticleFilterStatus(ParticleFilterStatus.Paused);
        // TODO: Save particles and plot them on graph
      }
    );
  };

  const createDropdownItems = () => {
    if (scenarios == undefined) {
      return [];
    }
    return Array.from(scenarios.keys()).map((scenarioId) => (
      <Dropdown.Item
        onClick={() => {
          setScenarioSettings(scenarios.get(scenarioId));
        }}
      >
        {scenarioId}
      </Dropdown.Item>
    ));
  };

  return (
    <div className="App">
      <div className="settings">
        <div className="settings-container">
          <h2 className="setting-title">SCENARIOS</h2>
          <DropdownButton id="dropdown-basic" title={scenarioSettings?.id}>
            {createDropdownItems()}
          </DropdownButton>
          <div className="settings-layout">
            <div className="setting-listing">
              <div className="setting-label">Standard Deviation</div>
              <div className="setting-label listing-value">
                {scenarioSettings?.standardDeviation}
              </div>
            </div>
            <div className="setting-listing">
              <div className="setting-label">Seed</div>
              <div className="setting-label listing-value">
                {scenarioSettings?.seed}
              </div>
            </div>
          </div>
          <Button buttonStyle="btn--blue" onClick={() => {}}>
            Create New Scenario
          </Button>
        </div>
        <div className="settings-container">
          <h2 className="setting-title">PARTICLE FILTER</h2>
          <div className="settings-layout">
            <div className="setting-input-container">
              <label className="setting-label">Number of Particles</label>
              <div className="setting-input-div">
                <input
                  className="setting-input"
                  onChange={(event) => {
                    setParticleFilterSettings({
                      ...particleFilterSettings,
                      numParticles: parseInt(event.target.value),
                    });
                  }}
                />
              </div>
            </div>
            <div className="setting-input-container">
              <label className="setting-label">
                Mean Particle Maneuver Time
              </label>
              <div className="setting-input-div">
                <input
                  className="setting-input"
                  onChange={(event) => {
                    setParticleFilterSettings({
                      ...particleFilterSettings,
                      meanManeverTime: parseFloat(event.target.value),
                    });
                  }}
                />
              </div>
            </div>
            <div className="setting-input-container">
              <label className="setting-label">Max Particle Speed</label>
              <div className="setting-input-div">
                <input
                  className="setting-input"
                  onChange={(event) => {
                    setParticleFilterSettings({
                      ...particleFilterSettings,
                      maxSpeed: parseFloat(event.target.value),
                    });
                  }}
                />
              </div>
            </div>
          </div>
          <Button buttonStyle="btn--blue" onClick={() => {}}>
            Start Particle Filter
          </Button>
        </div>
      </div>
      <div className="visualization">
        <div className="plot"></div>
        <div className="playback"></div>
      </div>
    </div>
  );
}

export default App;
