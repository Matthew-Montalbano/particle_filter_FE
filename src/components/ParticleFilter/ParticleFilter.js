import React, { useEffect } from "react";
import useState from "react-usestateref";
import Plot from "react-plotly.js";

import { ParticleFilterStatus } from "../../interfaces";
import { processNextObservation } from "../../API/API";
import Button from "../Button/Button";

import "./styles.css";

const ParticleFilterElement = ({ particleFilterProp }) => {
  const [particleFilter, setParticleFilter] = useState(particleFilterProp);
  const [runningStatus, setRunningStatus, runningStatusRef] = useState(
    ParticleFilterStatus.Paused
  );
  const [plotPoints, setPlotPoints] = useState({
    xData: [],
    yData: [],
  });
  const [averageParticlePoints, setAverageParticlePoints] = useState({
    xData: [],
    yData: [],
  });
  const [trueTargetPoints, setTrueTargetPoints] = useState({
    xData: [],
    yData: [],
  });

  useEffect(() => {
    if (particleFilterProp !== undefined) {
      console.log(particleFilterProp);
      setParticleFilter(particleFilterProp);
      setStartingPlotData(particleFilterProp.particles);
      setStartingAveragePlotData(particleFilterProp.particles);
      setStartingTrueTargetPlotData(
        particleFilterProp.scenario.trueTargetStates[0]
      );
      setRunningStatus(ParticleFilterStatus.Paused);
    }
  }, [particleFilterProp]);

  useEffect(() => {
    console.log("Current running status " + runningStatus);
    if (runningStatus == ParticleFilterStatus.Running) {
      console.log("starting particle filter");
      runParticleFilter();
    }
  }, [runningStatus, particleFilter]);

  const toggleParticleFilterPlayback = () => {
    switch (runningStatus) {
      case ParticleFilterStatus.Running:
        setRunningStatus(ParticleFilterStatus.Paused);
        return;
      case ParticleFilterStatus.Paused:
        setRunningStatus(ParticleFilterStatus.Running);
        return;
    }
  };

  const runParticleFilter = async () => {
    await new Promise((r) => setTimeout(r, 3000));
    if (runningStatusRef.current != ParticleFilterStatus.Running) {
      return;
    }
    let data = await processNextObservation(particleFilter.id);
    if (data.time == particleFilter.time) {
      setRunningStatus(ParticleFilterStatus.Stopped);
      return;
    }
    console.log(particleFilter);
    addPlotData(data.particles);
    addAveragePlotData(data.particles);
    addTrueTargetPlotData(getCurrentTargetState(data.time));
    setParticleFilter((prevState) => ({ ...prevState, time: data.time }));
  };

  const setStartingPlotData = (particles) => {
    const [xCoords, yCoords] = getXandYCoords(particles);
    setPlotPoints({
      xData: xCoords,
      yData: yCoords,
    });
  };

  const addPlotData = (particles) => {
    const [xCoords, yCoords] = getXandYCoords(particles);
    setPlotPoints((prevState) => ({
      xData: xCoords,
      yData: yCoords,
    }));
  };

  const getXandYCoords = (particles) => {
    const xCoords = [];
    const yCoords = [];
    particles.forEach((particle) => {
      xCoords.push(particle.x);
      yCoords.push(particle.y);
    });
    return [xCoords, yCoords];
  };

  const setStartingAveragePlotData = (particles) => {
    const [xPoint, yPoint] = getAveragePoint(particles);
    setAverageParticlePoints({
      xData: [xPoint],
      yData: [yPoint],
    });
  };

  const addAveragePlotData = (particles) => {
    const [xPoint, yPoint] = getAveragePoint(particles);
    setAverageParticlePoints((prevState) => ({
      xData: prevState.xData.concat([xPoint]),
      yData: prevState.yData.concat([yPoint]),
    }));
  };

  const getAveragePoint = (particles) => {
    let xSum = 0;
    let ySum = 0;
    particles.forEach((particle) => {
      xSum += particle.x;
      ySum += particle.y;
    });
    const xPoint = xSum / particles.length;
    const yPoint = ySum / particles.length;
    return [xPoint, yPoint];
  };

  const setStartingTrueTargetPlotData = (startingPoint) => {
    setTrueTargetPoints({ xData: [startingPoint.x], yData: [startingPoint.y] });
  };

  const addTrueTargetPlotData = (targetPoint) => {
    setTrueTargetPoints((prevState) => ({
      xData: prevState.xData.concat([targetPoint.x]),
      yData: prevState.yData.concat([targetPoint.y]),
    }));
  };

  const getCurrentTargetState = (time) => {
    return particleFilter.scenario.trueTargetStates.filter(
      (state) => state.time === time
    )[0];
  };

  const renderPlaybackButton = () => {
    switch (runningStatus) {
      case ParticleFilterStatus.Paused:
        return (
          <Button
            buttonStyle="btn--green"
            onClick={toggleParticleFilterPlayback}
          >
            Play
          </Button>
        );
      case ParticleFilterStatus.Running:
        return (
          <Button
            buttonStyle="btn--pink"
            onClick={toggleParticleFilterPlayback}
          >
            Pause
          </Button>
        );
      case ParticleFilterStatus.Stopped:
        return (
          <Button buttonStyle="btn--blue" onClick={() => {}}>
            Stopped
          </Button>
        );
    }
  };

  return (
    <div id="particle-filter-container">
      <div id="plot-container">
        <Plot
          data={[
            {
              x: plotPoints.xData,
              y: plotPoints.yData,
              type: "scatter",
              mode: "markers",
              name: "Particle Points",
            },
            {
              x: averageParticlePoints.xData,
              y: averageParticlePoints.yData,
              type: "scatter",
              mode: "lines+markers",
              marker: { color: "orange", size: 12 },
              line: { color: "orange" },
              name: "Average Particle Location",
            },
            {
              x: trueTargetPoints.xData,
              y: trueTargetPoints.yData,
              type: "scatter",
              mode: "lines+markers",
              marker: { color: "red", size: 12 },
              line: { color: "red" },
              name: "True Target Location",
            },
          ]}
          layout={{ width: 1300, height: 900, title: "Particle Plot" }}
        />
      </div>
      <div className="vertical-spacer" />
      {particleFilter != undefined ? (
        <div>
          {renderPlaybackButton()}
          <div className="setting-label mt-4">
            Current Time (seconds): {particleFilter.time}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ParticleFilterElement;
