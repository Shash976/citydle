import React, { useEffect, useRef, useState } from "react";
import Globe from "globe.gl";
import earthImg from "../assets/earth-day.jpg";
import { circlePoints, formatDistance } from "../utils/distance";

const COLORS = {
  green: "#22c55e",
  yellow: "#facc15",
  orange: "#fb923c",
  none: "#f87171",
  estimate: "#38bdf8",
  target: "#ffffff",
};

const colorOf = (matchClass) => COLORS[matchClass] || COLORS.none;

export default function GuessGlobe({
  guesses,
  target,
  estimate,
  onEstimate,
  useMiles,
}) {
  const boxRef = useRef(null);
  const globeRef = useRef(null);
  const onEstimateRef = useRef(onEstimate);
  const [failed, setFailed] = useState(false);

  onEstimateRef.current = onEstimate;

  useEffect(() => {
    const el = boxRef.current;
    const placeFromObject = (_obj, _event, coords) => {
      if (coords) onEstimateRef.current(coords.lat, coords.lng);
    };
    let globe;
    try {
      globe = Globe()(el)
        .globeImageUrl(earthImg)
        .backgroundColor("rgba(0,0,0,0)")
        .atmosphereColor("#7fb7ff")
        .width(el.clientWidth)
        .height(el.clientHeight)
        .pointOfView({ lat: 25, lng: 10, altitude: 2 })
        // markers
        .pointLat("lat")
        .pointLng("lng")
        .pointColor("color")
        .pointAltitude("alt")
        .pointRadius("radius")
        .pointLabel("label")
        .labelLat("lat")
        .labelLng("lng")
        .labelText("text")
        .labelColor("color")
        .labelSize(0.8)
        .labelDotRadius(0.35)
        .labelAltitude(0.012)
        .labelResolution(2)
        .labelLabel("tip")
        // distance rings
        .pathPoints("path")
        .pathPointLat((p) => p[0])
        .pathPointLng((p) => p[1])
        .pathPointAlt(0.004)
        .pathColor((d) => d.color)
        .pathStroke((d) => d.stroke)
        .pathLabel((d) => d.tip)
        .pathTransitionDuration(0)
        .onGlobeClick(({ lat, lng }) => onEstimateRef.current(lat, lng))
        // Rings and labels sit on top of the globe and would swallow the
        // click, so they place the pin too. Their handlers get the spot on the
        // globe under the cursor as the third argument.
        .onPathClick(placeFromObject)
        .onLabelClick(placeFromObject)
        .onPointClick(placeFromObject);
    } catch (e) {
      // no WebGL (old browser, blocked GPU)
      console.warn("Globe could not start:", e);
      setFailed(true);
      return;
    }
    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.5;
    globe.controls().minDistance = 150;
    globeRef.current = globe;

    const resize = () => {
      if (!el.clientWidth) return;
      globe.width(el.clientWidth).height(el.clientHeight);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    return () => {
      ro.disconnect();
      globeRef.current = null;
      globe.pauseAnimation();
      globe.renderer().dispose();
      globe._destructor && globe._destructor();
      el.innerHTML = "";
    };
  }, []);

  // Guesses, rings, the player's pin and (once the game is over) the answer.
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;

    const labels = guesses.map((g) => ({
      lat: g.city.lat,
      lng: g.city.lon,
      text: g.city.name,
      color: colorOf(g.matchClass),
      tip: `<b>${g.city.name}</b>, ${g.city.country}${
        g.isCorrect ? "" : `<br/>${formatDistance(g.distanceKm, useMiles)} from the target`
      }`,
    }));

    const last = guesses.length - 1;
    const rings = guesses
      .map((g, i) => ({ g, i }))
      .filter(({ g }) => !g.isCorrect && g.distanceKm > 0)
      .map(({ g, i }) => ({
        color: colorOf(g.matchClass),
        stroke: i === last ? 1 : 0.6,
        tip: `Target is ${formatDistance(g.distanceKm, useMiles)} from ${g.city.name}`,
        path: circlePoints(g.city.lat, g.city.lon, g.distanceKm),
      }));

    const points = [];
    if (estimate) {
      points.push({
        lat: estimate.lat,
        lng: estimate.lon,
        color: COLORS.estimate,
        alt: 0.06,
        radius: 0.35,
        label: "Your estimate",
      });
    }
    if (target) {
      points.push({
        lat: target.lat,
        lng: target.lon,
        color: COLORS.target,
        alt: 0.12,
        radius: 0.5,
        label: `<b>${target.name}</b>, ${target.country}`,
      });
      labels.push({
        lat: target.lat,
        lng: target.lon,
        text: target.name,
        color: COLORS.target,
        tip: `<b>${target.name}</b>, ${target.country}`,
      });
    }

    globe.labelsData(labels).pathsData(rings).pointsData(points);
  }, [guesses, target, estimate, useMiles]);

  // Turn to the newest guess; show the answer when the game ends.
  const newest = guesses[guesses.length - 1];
  const focus = target || (newest && newest.city);
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    globe.controls().autoRotate = !focus;
    if (focus) {
      globe.pointOfView({ lat: focus.lat, lng: focus.lon, altitude: target ? 1.5 : 1.8 }, 900);
    }
  }, [focus && focus.name, focus && focus.country]);

  if (failed) {
    return (
      <div className="globe-fallback">
        The globe needs WebGL, which this browser isn't providing. The game
        still works without it.
      </div>
    );
  }
  return <div className="globe-canvas" ref={boxRef} />;
}
