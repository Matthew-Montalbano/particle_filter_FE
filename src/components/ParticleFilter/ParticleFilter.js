import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";

import { ParticleFilterStatus } from "../../interfaces";
import { processNextObservation } from "../../API/API";
import Button from "../Button/Button";

import "./styles.css";

const ParticleFilterElement = ({ particleFilterProp }) => {
  const [particleFilter, setParticleFilter] = useState(particleFilterProp);
  const [runningStatus, setRunningStatus] = useState(
    ParticleFilterStatus.Paused
  );
  const [plotPoints, setPlotPoints] = useState({ xData: [], yData: [] });

  useEffect(() => {
    if (particleFilterProp !== undefined) {
      setParticleFilter(particleFilterProp);
      setPlotData(particleFilterProp.particles);
    }
  }, [particleFilterProp]);

  useEffect(() => {
    console.log("Running status changed");
    if (runningStatus == ParticleFilterStatus.Running) {
      console.log("starting particle filter");
      runParticleFilter();
    }
  }, [runningStatus]);

  const toggleParticleFilterPlayback = () => {
    switch (runningStatus) {
      case ParticleFilterStatus.Running:
        console.log("pausing particle filter");
        setRunningStatus(ParticleFilterStatus.Paused);
        return;
      case ParticleFilterStatus.Paused:
        setRunningStatus(ParticleFilterStatus.Running);
        return;
    }
  };

  const runParticleFilter = async () => {
    while (runningStatus == ParticleFilterStatus.Running) {
      await new Promise((r) => setTimeout(r, 3000));
      console.log(runningStatus);
      let data = await processNextObservation(particleFilter.id);
      console.log("time " + data.time);
      console.log(particleFilter);
      console.log("Particle filter time " + particleFilter.time);
      if (data.time == particleFilter.time) {
        console.log("returning...");
        setRunningStatus(ParticleFilterStatus.Stopped);
        return;
      }
      setPlotData(data.particles);
      setParticleFilter({ ...particleFilter, time: data.time });
    }
  };

  const setPlotData = (particles) => {
    console.log("setting plot data");
    const xCoords = plotPoints.xData;
    const yCoords = plotPoints.yData;
    particles.forEach((particle) => {
      xCoords.push(particle.x);
      yCoords.push(particle.y);
    });
    setPlotPoints({ xData: xCoords, yData: yCoords });
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
            },
          ]}
          layout={{ width: 1300, height: 900, title: "Particle Plot" }}
        />
      </div>
      <Button buttonStyle="btn--green" onClick={toggleParticleFilterPlayback}>
        Play
      </Button>
    </div>
  );
};

export default ParticleFilterElement;
