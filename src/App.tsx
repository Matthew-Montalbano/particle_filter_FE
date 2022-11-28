import React, { useState, useEffect } from "react";

import {
  ParticleFilterSettings,
  Scenario,
  ParticleFilter,
  ParticleFilterProcessingResponse,
} from "./interfaces";
import {
  getAllScenarios,
  createParticleFilter,
  createScenario,
} from "./API/API";
import Dropdown from "react-bootstrap/Dropdown";
import Button from "./components/Button/Button";
import Tab from "./components/Tab/Tab";
import ToggleMessage from "./components/ToggleMessage/ToggleMessage";
import FieldInput from "./components/FieldInput/FieldInput";
import ParticleFilterElement from "./components/ParticleFilter/ParticleFilter";

import "./App.css";
import "bootstrap/dist/css/bootstrap.css";

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
  const [particleFilter, setParticleFilter] = useState<ParticleFilter>();
  const [createScenarioSuccessVisibility, setCreateScenarioSuccessVisibility] =
    useState<boolean>(false);

  useEffect(() => {
    getAllScenarios().then((scenarios) => {
      setScenarios(scenarios);
      setScenarioSettings(scenarios.get("default"));
    });
  }, []);

  useEffect(() => {
    setCreateScenarioSuccessVisibility(false);
  }, [currentTab]);

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
          <div id="scenario-setter" className="d-flex setting-title">
            <div>SCENARIO</div>
            <Dropdown>
              <Dropdown.Toggle className="custom-dropdown">
                {scenarioSettings?.id}
              </Dropdown.Toggle>
              <Dropdown.Menu>{createDropdownItemsForScenario()}</Dropdown.Menu>
            </Dropdown>
          </div>
          <div className="settings-layout">
            <div className="setting-listing">
              <div className="setting-label">
                Observation Uncertainty (meters)
              </div>
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
                setParticleFilterSettings((prevState) => ({
                  ...prevState,
                  numParticles: parseInt(event.target.value),
                }));
              }}
              errorMessage={particleFilterInputErrors.numParticles}
              defaultValue={particleFilterSettings.numParticles}
            />
            <FieldInput
              label="Mean Particle Maneuever Time (seconds)"
              onChange={(event) => {
                setParticleFilterSettings((prevState) => ({
                  ...prevState,
                  meanManeverTime: parseFloat(event.target.value),
                }));
              }}
              errorMessage={particleFilterInputErrors.meanManeuverTime}
              defaultValue={particleFilterSettings.meanManeverTime}
            />
            <FieldInput
              label="Max Particle Speed (m/s)"
              onChange={(event) => {
                setParticleFilterSettings((prevState) => ({
                  ...prevState,
                  maxSpeed: parseFloat(event.target.value),
                }));
              }}
              errorMessage={particleFilterInputErrors.maxSpeed}
              defaultValue={particleFilterSettings.maxSpeed}
            />
          </div>
          <div className="vertical-spacer" />
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
    if (scenarioSettings == undefined || scenarios == undefined) {
      return;
    }
    const scenarioId = scenarioSettings.id;
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
      settings.numParticles > 3000
    ) {
      errors.numParticles = "Number of Particles must be between 0 and 3000";
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
      createParticleFilter(scenarioId, particleFilterSettings).then(
        (processingResponse: ParticleFilterProcessingResponse) => {
          const particleFilter: ParticleFilter = {
            id: processingResponse.id,
            scenario: scenarios.get(scenarioId)!,
            particles: processingResponse.particles,
            time: processingResponse.time,
          };
          setParticleFilter(particleFilter);
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
                setCreateScenarioSettings((prevState) => ({
                  ...prevState,
                  id: event.target.value,
                }));
              }}
              errorMessage={createScenarioInputErrors.scenarioName}
              defaultValue={createScenarioSettings.id}
            />
            <FieldInput
              label="Observation Uncertainty (meters)"
              onChange={(event) => {
                setCreateScenarioSettings((prevState) => ({
                  ...prevState,
                  standardDeviation: parseFloat(event.target.value),
                }));
              }}
              errorMessage={createScenarioInputErrors.standardDeviation}
              defaultValue={createScenarioSettings.standardDeviation}
            />
            <FieldInput
              label="Seed"
              onChange={(event) => {
                setCreateScenarioSettings((prevState) => ({
                  ...prevState,
                  seed: parseInt(event.target.value),
                }));
              }}
              errorMessage={createScenarioInputErrors.seed}
              defaultValue={createScenarioSettings.seed}
            />
            <div className="field-input-container">
              <label className="field-label">True Target State</label>
              <div className="vertical-spacer" />
              <Dropdown>
                <Dropdown.Toggle className="custom-dropdown">
                  {createScenarioDropdownTitle}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {createDropdownItemsForCreateScenario()}
                </Dropdown.Menu>
              </Dropdown>
              <ToggleMessage
                visible={createScenarioInputErrors.trueTargetState !== ""}
                style="error"
              >
                {createScenarioInputErrors.trueTargetState}
              </ToggleMessage>
            </div>
            <ToggleMessage
              visible={createScenarioSuccessVisibility}
              style="success"
            >
              Scenario Created Successfully
            </ToggleMessage>
          </div>
          <div className="vertical-spacer" />
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
          setCreateScenarioSettings((prevState) => ({
            ...prevState,
            trueTargetStates: scenarios.get(scenarioId)?.trueTargetStates || [],
          }));
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
    setCreateScenarioSuccessVisibility(false);
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
          setCreateScenarioSuccessVisibility(true);
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
      <div id="visualization">
        <ParticleFilterElement particleFilterProp={particleFilter} />
      </div>
    </div>
  );
}

export default App;
