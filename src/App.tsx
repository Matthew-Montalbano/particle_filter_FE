import React, { useState, useEffect } from "react";
import logo from "./logo.svg";

import { ParticleFilterSettings, Scenario, Particle } from "./interfaces";
import {
  getAllScenarios,
  createParticleFilter,
  createScenario,
} from "./API/API";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Button from "./components/Button/Button";
import Tab from "./components/Tab/Tab";
import ErrorMessage from "./components/ErrorMessage/ErrorMessage";
import FieldInput from "./components/FieldInput/FieldInput";

import "./App.css";
import "bootstrap/dist/css/bootstrap.css";

enum ParticleFilterStatus {
  Running,
  Paused,
  Stopped,
  NotCreated,
}

enum TabType {
  ParticleFilter,
  CreateScenario,
}

function App() {
  const [particleFilterSettings, setParticleFilterSettings] =
    useState<ParticleFilterSettings>({
      numParticles: 100,
      maxSpeed: 5,
      meanManeverTime: 10,
    });
  const [particleFilterStatus, setParticleFilterStatus] =
    useState<ParticleFilterStatus>(ParticleFilterStatus.NotCreated);
  const [scenarioSettings, setScenarioSettings] = useState<Scenario>();
  const [createScenarioSettings, setCreateScenarioSettings] =
    useState<Scenario>({
      id: "New Scenario",
      standardDeviation: 2,
      seed: 100,
      trueTargetStates: [],
    });
  const [createScenarioDropdownTitle, setCreateScenarioDropdownTitle] =
    useState<string>("Pick Scenario");
  const [scenarios, setScenarios] = useState<Map<string, Scenario>>();
  const [currentTab, setCurrentTab] = useState<TabType>(TabType.ParticleFilter);
  const [particleFilterInputErrors, setParticleFilterInputErrors] = useState({
    numParticles: "",
    meanManeuverTime: "",
    maxSpeed: "",
  });

  const [createScenarioInputErrors, setCreateScenarioInputErrors] = useState({
    scenarioName: "",
    standardDeviation: "",
    seed: "",
    trueTargetState: "",
  });

  useEffect(() => {
    getAllScenarios().then((scenarios) => {
      setScenarios(scenarios);
      setScenarioSettings(scenarios.get("default"));
    });
  }, []);

  const renderCurrentTab = (): React.ReactNode => {
    switch (currentTab) {
      case TabType.ParticleFilter:
        return renderParticleFilterSettingsTab();
      case TabType.CreateScenario:
        return renderCreateScenarioTab();
    }
  };

  const renderParticleFilterSettingsTab = (): React.ReactNode => {
    return (
      <div id="particle-filter-settings">
        <div className="settings-container">
          <h2 className="setting-title">SCENARIO</h2>
          <DropdownButton id="dropdown-basic" title={scenarioSettings?.id}>
            {createDropdownItemsForScenario()}
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
        </div>
        <div className="settings-container">
          <h2 className="setting-title">PARTICLE FILTER</h2>
          <div className="settings-layout">
            <FieldInput
              label="Number of Particles"
              onChange={(event) => {
                setParticleFilterSettings({
                  ...particleFilterSettings,
                  numParticles: parseInt(event.target.value),
                });
              }}
              errorMessage={particleFilterInputErrors.numParticles}
              defaultValue={particleFilterSettings.numParticles}
            />
            <FieldInput
              label="Mean Particle Maneuever Time"
              onChange={(event) => {
                setParticleFilterSettings({
                  ...particleFilterSettings,
                  meanManeverTime: parseFloat(event.target.value),
                });
              }}
              errorMessage={particleFilterInputErrors.meanManeuverTime}
              defaultValue={particleFilterSettings.meanManeverTime}
            />
            <FieldInput
              label="Max Particle Speed"
              onChange={(event) => {
                setParticleFilterSettings({
                  ...particleFilterSettings,
                  maxSpeed: parseFloat(event.target.value),
                });
              }}
              errorMessage={particleFilterInputErrors.maxSpeed}
              defaultValue={particleFilterSettings.maxSpeed}
            />
          </div>
          <Button buttonStyle="btn--blue" onClick={createParticleFilterHandler}>
            Start Particle Filter
          </Button>
        </div>
      </div>
    );
  };

  const createDropdownItemsForScenario = (): React.ReactNode[] => {
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

  const createParticleFilterHandler = () => {
    if (scenarioSettings == undefined) {
      return;
    }
    const errors = {
      numParticles: "",
      meanManeuverTime: "",
      maxSpeed: "",
    };
    const settings = particleFilterSettings;
    let isError = false;
    if (
      isNaN(settings.numParticles) ||
      settings.numParticles < 0 ||
      settings.numParticles > 1000
    ) {
      errors.numParticles = "Number of Particles must be between 0 and 1000";
      isError = true;
    }
    if (isNaN(settings.meanManeverTime) || settings.meanManeverTime < 0) {
      errors.meanManeuverTime = "Mean maneuver time must be 0 or more";
      isError = true;
    }
    if (isNaN(settings.maxSpeed) || settings.maxSpeed < 0) {
      errors.maxSpeed = "Max speed must be 0 or more";
      isError = true;
    }
    setParticleFilterInputErrors(errors);
    if (!isError) {
      createParticleFilter(scenarioSettings.id, particleFilterSettings).then(
        (particles) => {
          setParticleFilterStatus(ParticleFilterStatus.Paused);
          // TODO: Save particles and plot them on graph
        }
      );
    }
  };

  const renderCreateScenarioTab = (): React.ReactNode => {
    return (
      <div id="create-scenario-tab">
        <div className="settings-container">
          <h2 className="setting-title">CREATE SCENARIO</h2>
          <div className="settings-layout">
            <FieldInput
              label="Scenario Name"
              onChange={(event) => {
                setCreateScenarioSettings({
                  ...createScenarioSettings,
                  id: event.target.value,
                });
              }}
              errorMessage={createScenarioInputErrors.scenarioName}
              defaultValue={createScenarioSettings.id}
            />
            <FieldInput
              label="Standard Deviation"
              onChange={(event) => {
                setCreateScenarioSettings({
                  ...createScenarioSettings,
                  standardDeviation: parseFloat(event.target.value),
                });
              }}
              errorMessage={createScenarioInputErrors.standardDeviation}
              defaultValue={createScenarioSettings.standardDeviation}
            />
            <FieldInput
              label="Seed"
              onChange={(event) => {
                setCreateScenarioSettings({
                  ...createScenarioSettings,
                  seed: parseInt(event.target.value),
                });
              }}
              errorMessage={createScenarioInputErrors.seed}
              defaultValue={createScenarioSettings.seed}
            />
            <div className="field-input-container">
              <label className="field-label">True Target State</label>
              <div className="vertical-spacer" />
              <DropdownButton
                id="dropdown-basic"
                title={createScenarioDropdownTitle}
              >
                {createDropdownItemsForCreateScenario()}
              </DropdownButton>
              <ErrorMessage
                visible={createScenarioInputErrors.trueTargetState !== ""}
              >
                {createScenarioInputErrors.trueTargetState}
              </ErrorMessage>
            </div>
          </div>
          <Button buttonStyle="btn--blue" onClick={createScenarioHandler}>
            Create New Scenario
          </Button>
        </div>
      </div>
    );
  };

  const createDropdownItemsForCreateScenario = (): React.ReactNode[] => {
    if (scenarios == undefined) {
      return [];
    }
    return Array.from(scenarios.keys()).map((scenarioId) => (
      <Dropdown.Item
        onClick={() => {
          setCreateScenarioSettings({
            ...createScenarioSettings,
            trueTargetStates: scenarios.get(scenarioId)?.trueTargetStates || [],
          });
          setCreateScenarioDropdownTitle(scenarioId);
        }}
      >
        {scenarioId}
      </Dropdown.Item>
    ));
  };

  const createScenarioHandler = () => {
    let isError: boolean = false;
    const scenario: Scenario = createScenarioSettings;
    const errors = {
      scenarioName: "",
      standardDeviation: "",
      seed: "",
      trueTargetState: "",
    };
    if (scenario.id === "") {
      errors.scenarioName = "Scenario name is required";
      isError = true;
    }
    if (scenario.trueTargetStates.length == 0) {
      errors.trueTargetState = "Must pick a scenario";
      isError = true;
    }
    if (
      isNaN(scenario.standardDeviation) ||
      scenario.standardDeviation < 0 ||
      scenario.standardDeviation > 1000
    ) {
      errors.standardDeviation =
        "Standard Deviation must be between 0 and 1000";
      isError = true;
    }
    if (isNaN(scenario.seed)) {
      errors.seed = "Seed must be a number";
      isError = true;
    }
    setCreateScenarioInputErrors(errors);
    if (!isError) {
      createScenario(createScenarioSettings).then(() => {
        getAllScenarios().then((scenarios) => {
          setScenarios(scenarios);
        });
      });
    }
  };

  return (
    <div className="App">
      <div id="configuration-panel">
        <div id="tabs">
          <Tab
            onClick={() => setCurrentTab(TabType.ParticleFilter)}
            active={currentTab === TabType.ParticleFilter}
          >
            Particle Filter
          </Tab>
          <Tab
            onClick={() => setCurrentTab(TabType.CreateScenario)}
            active={currentTab === TabType.CreateScenario}
          >
            Create Scenario
          </Tab>
        </div>
        <div className="configuration-contents">{renderCurrentTab()}</div>
      </div>
      <div className="visualization">
        <div className="plot"></div>
        <div className="playback"></div>
      </div>
    </div>
  );
}

export default App;
