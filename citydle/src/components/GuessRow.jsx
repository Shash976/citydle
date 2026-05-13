import React from "react";

function GuessRow({ guessObj, getLetterColor }) {
  return (
    <div className="guess-row">
      {guessObj.city.name.split("").map((letter, i) => (
        <div
          className={`guess-letter ${getLetterColor(guessObj.city, i)}`}
          key={i}
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          {letter.toUpperCase()}
        </div>
      ))}
      {!guessObj.isCorrect && (
        <span className="distance-direction">
          {guessObj.distance} {guessObj.direction}
        </span>
      )}
    </div>
  );
}

export default GuessRow;
