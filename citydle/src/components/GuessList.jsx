import React from "react";
import GuessRow from "./GuessRow";

function GuessList({ guesses, useMiles }) {
  return (
    <div className="guesses">
      {guesses.map((g) => (
        <GuessRow guessObj={g} useMiles={useMiles} key={g.city.name + g.city.country} />
      ))}
    </div>
  );
}

export default GuessList;
