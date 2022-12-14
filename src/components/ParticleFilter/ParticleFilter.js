import React, { useEffect } from "react";
import useState from "react-usestateref";
import Plot from "react-plotly.js";

import { ParticleFilterStatus } from "../../interfaces";
import { processNextObservation } from "../../API/API";
import Button from "../Button/Button";
import CheckBox from "../Checkbox/Checkbox";

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
  const [averageParticleHistoryPoints, setAverageParticleHistoryPoints] =
    useState({
      xData: [],
      yData: [],
    });
  const [showLines, setShowLines] = useState({
    averageParticle: false,
    averageParticleHistory: true,
    individualParticleHistory: false,
    trueTarget: true,
  });
  const [particleHistoryPoints, setParticleHistoryPoints] = useState([]);
  const [windowSize, setWindowSize] = useState(getWindowSize());

  useEffect(() => {
    if (particleFilterProp !== undefined) {
      console.log(particleFilterProp);
      setParticleFilter(particleFilterProp);
      setStartingPlotData(particleFilterProp.particles);
      setStartingAveragePlotData(particleFilterProp.particles);
      setStartingTrueTargetPlotData(
        particleFilterProp.scenario.trueTargetStates[0]
      );
      setAverageParticleHistoryData(particleFilterProp.particles);
      setParticleHistoryData(particleFilterProp.particles);
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

  useEffect(() => {
    function handleWindowResize() {
      setWindowSize(getWindowSize());
    }

    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

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
    setAverageParticleHistoryData(data.particles);
    setParticleHistoryData(data.particles);
    addTrueTargetPlotData(getCurrentTargetState(data.time));
    setParticleFilter((prevState) => ({
      ...prevState,
      particles: data.particles,
      time: data.time,
    }));
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

  const setAverageParticleHistoryData = (particles) => {
    const [xData, yData] = calculateAverageParticleHistoryData(particles);
    setAverageParticleHistoryPoints({ xData, yData });
  };

  const calculateAverageParticleHistoryData = (particles) => {
    const xCoords = [];
    const yCoords = [];
    let observationTimes = Object.keys(particles[0].history)
      .map((key) => parseInt(key))
      .sort((a, b) => a - b);
    for (let i = 0; i < observationTimes.length; i++) {
      let time = observationTimes[i];
      let currParticles = [];
      particles.forEach((particle) => {
        let currParticle = particle.history[time];
        currParticles.push({ x: currParticle.x, y: currParticle.y });
      });
      let [averageXCoord, averageYCoord] = getAveragePoint(currParticles);
      xCoords.push(averageXCoord);
      yCoords.push(averageYCoord);
    }
    return [xCoords, yCoords];
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

  const setParticleHistoryData = (particles) => {
    const data = [];
    let observationTimes = Object.keys(particles[0].history)
      .map((key) => parseInt(key))
      .sort((a, b) => a - b);
    particles.forEach((particle) => {
      let xData = [];
      let yData = [];
      observationTimes.forEach((time) => {
        xData.push(particle.history[time].x);
        yData.push(particle.history[time].y);
      });
      data.push({
        x: xData,
        y: yData,
        type: "scatter",
        mode: "lines",
        line: { color: "#98d4bb" },
        opacity: 0.2,
        showlegend: false,
      });
    });
    setParticleHistoryPoints(data);
  };

  const toggleShowLine = (line) => {
    setShowLines((prevState) => ({
      ...prevState,
      [line]: !prevState[line],
    }));
  };

  return (
    <div id="particle-filter-container">
      <div id="plot-container">
        <Plot
          data={[
            ...(showLines.individualParticleHistory
              ? particleHistoryPoints
              : []),
            {
              x: plotPoints.xData,
              y: plotPoints.yData,
              type: "scatter",
              mode: "markers",
              name: "Particle Points",
              marker: { color: "#9AD9DB" },
            },
            {
              x: averageParticlePoints.xData,
              y: averageParticlePoints.yData,
              type: "scatter",
              mode: "lines+markers",
              marker: { color: "#8C7386", size: 12 },
              line: { color: "#8C7386" },
              name: "Average Particle Location",
              visible: showLines.averageParticle,
            },
            {
              x: trueTargetPoints.xData,
              y: trueTargetPoints.yData,
              type: "scatter",
              mode: "lines+markers",
              marker: { color: "#eb96aa", size: 12 },
              line: { color: "#eb96aa" },
              name: "True Target Location",
              visible: showLines.trueTarget,
            },
            {
              x: averageParticleHistoryPoints.xData,
              y: averageParticleHistoryPoints.yData,
              type: "scatter",
              mode: "lines+markers",
              marker: { color: "#218B82", size: 12 },
              line: { color: "#218B82" },
              name: "Average Particle History",
              visible: showLines.averageParticleHistory,
            },
          ]}
          layout={{
            width: windowSize.innerWidth * 0.63,
            height: windowSize.innerHeight * 0.8,
            title: {
              text: "Particle Filter Plot",
              font: { size: windowSize.innerWidth * 0.013, family: "Nunito" },
            },
            showlegend: true,
            legend: {
              x: 0.95,
              xanchor: "right",
              y: 0.05,
              font: { size: windowSize.innerWidth * 0.006, family: "Nunito" },
              itemclick: false,
              itemdoubleclick: false,
            },
            xaxis: {
              title: {
                text: "Position (meters)",
                font: { size: windowSize.innerWidth * 0.008, family: "Nunito" },
              },
            },
            yaxis: {
              title: {
                text: "Position (meters)",
                font: { size: windowSize.innerWidth * 0.008, family: "Nunito" },
              },
            },
          }}
        />
      </div>
      <div className="vertical-spacer" />
      {particleFilter != undefined ? (
        <div>
          <div id="plot-controls">
            {renderPlaybackButton()}
            <div id="line-toggle-container">
              <CheckBox
                title="True Target"
                onClick={() => toggleShowLine("trueTarget")}
                active={showLines.trueTarget}
              />
              <CheckBox
                title="Average Particle History"
                onClick={() => toggleShowLine("averageParticleHistory")}
                active={showLines.averageParticleHistory}
              />
              <CheckBox
                title="Individual Particle History"
                onClick={() => toggleShowLine("individualParticleHistory")}
                active={showLines.individualParticleHistory}
              />
              <CheckBox
                title="Average Particle Location"
                onClick={() => toggleShowLine("averageParticle")}
                active={showLines.averageParticle}
              />
            </div>
          </div>
          <div className="setting-label mt-2">
            Current Time (seconds): {particleFilter.time}
          </div>
        </div>
      ) : null}
    </div>
  );
};

const getWindowSize = () => {
  const { innerWidth, innerHeight } = window;
  return { innerWidth, innerHeight };
};

export default ParticleFilterElement;
