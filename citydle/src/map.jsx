// src/CesiumGlobe.jsx
import React, { useEffect, useRef } from "react";
import {
  Viewer,
  createWorldTerrain,
  Cartesian3,
  Ion,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Color
} from "@cesium/engine";
import "@cesium/widgets/widgets.css";

Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwODkxODVlYi1mMjRkLTQ2OWItYmU3OS01NWIzZDdmYzNhY2MiLCJpZCI6MzIxNTU0LCJpYXQiOjE3NTI1NTMzNjN9.z0UsFb1lpYk-9tBFQsaqszqgXaqaVgOjKuBdNuguYpA";

export default function CesiumGlobe({ guesses, flyToCoords }) {
  const viewerRef = useRef(null);
  const cesiumRef = useRef(null);

  useEffect(() => {
    if (!viewerRef.current) return;

    cesiumRef.current = new Viewer(viewerRef.current, {
      terrainProvider: createWorldTerrain(),
      shouldAnimate: true,
      timeline: false,
      animation: false,
    });

    return () => {
      cesiumRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (!cesiumRef.current) return;

    // Clear all entities
    cesiumRef.current.entities.removeAll();

    // Add markers
    guesses.forEach(city => {
      cesiumRef.current.entities.add({
        name: city.name,
        position: Cartesian3.fromDegrees(city.lon, city.lat),
        point: {
          pixelSize: 12,
          color: Color.ORANGE,
        },
        description: city.name,
      });
    });

    // Fly to latest guess
    if (flyToCoords) {
      cesiumRef.current.camera.flyTo({
        destination: Cartesian3.fromDegrees(flyToCoords.lon, flyToCoords.lat, 2000000),
      });
    }
  }, [guesses, flyToCoords]);

  return (
    <div
      ref={viewerRef}
      style={{ width: "100%", height: "600px", borderRadius: "10px" }}
    />
  );
}
