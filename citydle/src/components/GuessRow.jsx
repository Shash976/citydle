import React from "react";
import { formatDistance } from "../utils/distance";

function GuessRow({ guessObj, useMiles }) {
  const { city, matchClass, isCorrect, distanceKm, direction } = guessObj;
  return (
    <div className="guess-row">
      <div className="guess-word">
        {city.name.split("").map((letter, i) =>
          letter === " " ? (
            <div className="guess-space" key={i} />
          ) : (
            <div
              className={`guess-letter ${matchClass}`}
              key={i}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {letter.toUpperCase()}
            </div>
          )
        )}
      </div>
      <span className="guess-country">{city.country}</span>
      {!isCorrect && (
        <span className="distance-direction">
          {formatDistance(distanceKm, useMiles)} {direction}
        </span>
      )}
    </div>
  );
}

export default GuessRow;
