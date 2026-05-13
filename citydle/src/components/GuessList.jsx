import React from "react";
import GuessRow from "./GuessRow";

function GuessList({ guesses, getLetterColor }) {
  return (
    <div className="guesses">
      {guesses.map((g, idx) => (
        <GuessRow guessObj={g} getLetterColor={getLetterColor} key={idx} />
      ))}
    </div>
  );
}

export default GuessList;
