import React, { useState, useEffect, useRef } from "react";
import cities from "./cities";
import "./App.css";
import AutocompleteInput from "./components/AutocompleteInput";
import GuessList from "./components/GuessList";
import { calculateDistance } from "./utils/distance";
import { getDirectionEmoji } from "./utils/direction";
import { filterCities } from "./utils/filterCities";


const MAX_GUESSES = 15;

function toMiles(km) {
  return Math.round(km * 0.621371);
}


function App() {
  const [targetCity, setTargetCity] = useState(null);
  const [guess, setGuess] = useState("");
  const [guesses, setGuesses] = useState([]);
  const [guessCount, setGuessCount] = useState(0);
  const [distance, setDistance] = useState("");
  const [result, setResult] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [useMiles, setUseMiles] = useState(false);
  const inputRef = useRef(null);

  // Autocomplete state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [highlightedIdx, setHighlightedIdx] = useState(-1);

  useEffect(() => {
    startNewGame();
  }, []);

  function startNewGame() {
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    setTargetCity(randomCity);
    setGuesses([]);
    setGuess("");
    setGuessCount(0);
    setDistance("");
    setResult("");
    setGameOver(false);
    setTimeout(() => inputRef.current && inputRef.current.focus(), 100);
    setShowSuggestions(false);
    setSuggestions([]);
    setHighlightedIdx(-1);
  }

  function handleGuessSubmit(e) {
    e.preventDefault();
    if (gameOver) return;
    const trimmedGuess = guess.trim().toLowerCase();
    if (!trimmedGuess) return;

    const guessedCity = cities.find(
      (city) => city.name.toLowerCase() === trimmedGuess
    );

    if (!guessedCity) {
      setResult("City not found in the list. Please try again.");
      return;
    }

    const newGuessCount = guessCount + 1;
    setGuessCount(newGuessCount);

    const isCorrect = guessedCity.name === targetCity.name;
    const distKm = calculateDistance(
      guessedCity.lat,
      guessedCity.lon,
      targetCity.lat,
      targetCity.lon
    );
    const guessObj = {
      city: guessedCity,
      isCorrect,
      direction:
        !isCorrect &&
        getDirectionEmoji(
          guessedCity.lat,
          guessedCity.lon,
          targetCity.lat,
          targetCity.lon
        ),
      distance: !isCorrect && distKm
    };

    setGuesses([...guesses, guessObj]);

    if (isCorrect) {
      setResult("🎉 Congratulations! You guessed the city!");
      setGameOver(true);
      setDistance("");
    } else if (newGuessCount >= MAX_GUESSES) {
      setResult(`Game over! The city was ${targetCity.name}.`);
      setGameOver(true);
      setDistance("");
    } else {
      setDistance(distKm);
      setResult("");
    }

    setGuess("");
    setShowSuggestions(false);
    setSuggestions([]);
    setHighlightedIdx(-1);
    setTimeout(() => inputRef.current && inputRef.current.focus(), 100);
  }

  function getLetterColor(guessedCity, i) {
    if (guessedCity.name === targetCity.name) return "green";
    if (guessedCity.country === targetCity.country) return "yellow";
    if (guessedCity.continent === targetCity.continent) return "orange";
    return "";
  }

  // Autocomplete handlers
  function handleInputChange(e) {
    const value = e.target.value;
    setGuess(value);
    if (value.length >= 2) {
      const filtered = filterCities(cities, value);
      setSuggestions(filtered.slice(0, 8)); // limit to 8 suggestions
      setShowSuggestions(filtered.length > 0);
      setHighlightedIdx(-1);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
      setHighlightedIdx(-1);
    }
  }

  function handleSuggestionClick(city) {
    setGuess(city.name);
    setShowSuggestions(false);
    setSuggestions([]);
    setHighlightedIdx(-1);
    setTimeout(() => inputRef.current && inputRef.current.focus(), 100);
  }

  function handleInputKeyDown(e) {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIdx(idx => (idx + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIdx(idx => (idx - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      if (highlightedIdx >= 0 && highlightedIdx < suggestions.length) {
        e.preventDefault();
        handleSuggestionClick(suggestions[highlightedIdx]);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSuggestions([]);
      setHighlightedIdx(-1);
    }
  }

  return (
    <div className="app-container">
      <div className="top-bar">
        <div className="top-bar-center">
          <h1>Citydle</h1>
        </div>
        <div className="top-bar-right">
          <label className="switch">
            <span className="unit-label">km</span>
            <input
              type="checkbox"
              checked={useMiles}
              onChange={() => setUseMiles((prev) => !prev)}
              aria-label="Toggle distance unit"
            />
            <span className="slider"></span>
            <span className="unit-label">mi</span>
          </label>
        </div>
      </div>
      <form className="guess-form" onSubmit={handleGuessSubmit} autoComplete="off">
        <AutocompleteInput
          guess={guess}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          suggestions={suggestions}
          showSuggestions={showSuggestions}
          highlightedIdx={highlightedIdx}
          onSuggestionClick={handleSuggestionClick}
          disabled={gameOver}
          inputRef={inputRef}
        />
        <button className="guess-button" type="submit" disabled={gameOver}>
          Guess
        </button>
        <button
          className="restart-button"
          type="button"
          onClick={startNewGame}
        >
          Restart
        </button>
      </form>
      <GuessList
        guesses={guesses.map(g =>
          g.isCorrect
            ? g
            : {
                ...g,
                distance: g.distance
                  ? useMiles
                    ? `${toMiles(g.distance)} mi`
                    : `${g.distance} km`
                  : ""
              }
        )}
        getLetterColor={getLetterColor}
      />
      {distance !== "" && (
        <div className="distance">
          Distance: {useMiles ? `${toMiles(distance)} mi` : `${distance} km`}
        </div>
      )}
      {result && <div className="result">{result}</div>}
      <div className="guess-count">
        Guesses: {guessCount} / {MAX_GUESSES}
      </div>
    </div>
  );
}

export default App;