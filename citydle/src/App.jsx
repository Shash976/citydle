import React, { useState, useEffect, useRef, Suspense } from "react";
import "./App.css";
import AutocompleteInput from "./components/AutocompleteInput";
import GuessList from "./components/GuessList";
import { cityLabel, pickTarget, resolveCity, searchCities } from "./utils/cities";
import { calculateDistance, formatDistance } from "./utils/distance";
import { getDirectionEmoji } from "./utils/direction";

// The globe pulls in three.js, which is most of the bundle. Load it after the
// board is already on screen.
const GuessGlobe = React.lazy(() => import("./components/GuessGlobe"));

const MAX_GUESSES = 15;

function matchClassFor(guessed, target) {
  if (guessed === target) return "green";
  if (guessed.country === target.country) return "yellow";
  if (guessed.continent === target.continent) return "orange";
  return "";
}

function App() {
  const [targetCity, setTargetCity] = useState(null);
  const [guess, setGuess] = useState("");
  const [guesses, setGuesses] = useState([]);
  const [result, setResult] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [useMiles, setUseMiles] = useState(false);
  const [estimate, setEstimate] = useState(null);
  const inputRef = useRef(null);

  // Autocomplete state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [highlightedIdx, setHighlightedIdx] = useState(-1);

  useEffect(() => {
    startNewGame();
  }, []);

  function focusInput() {
    setTimeout(() => inputRef.current && inputRef.current.focus(), 100);
  }

  function closeSuggestions() {
    setShowSuggestions(false);
    setSuggestions([]);
    setHighlightedIdx(-1);
  }

  function startNewGame() {
    setTargetCity((prev) => pickTarget(prev));
    setGuesses([]);
    setGuess("");
    setResult("");
    setGameOver(false);
    setEstimate(null);
    closeSuggestions();
    focusInput();
  }

  function handleGuessSubmit(e) {
    e.preventDefault();
    if (gameOver) return;
    if (!guess.trim()) return;

    const { city: guessedCity, ambiguous } = resolveCity(guess);

    if (ambiguous) {
      setResult(
        `More than one city is called that. Pick one: ${ambiguous
          .map(cityLabel)
          .join(" / ")}`
      );
      return;
    }
    if (!guessedCity) {
      setResult("City not found in the list. Try picking one from the suggestions.");
      return;
    }
    if (guesses.some((g) => g.city === guessedCity)) {
      setResult(`You already guessed ${cityLabel(guessedCity)}.`);
      return;
    }

    const isCorrect = guessedCity === targetCity;
    const distanceKm = calculateDistance(
      guessedCity.lat,
      guessedCity.lon,
      targetCity.lat,
      targetCity.lon
    );
    const guessObj = {
      city: guessedCity,
      isCorrect,
      matchClass: matchClassFor(guessedCity, targetCity),
      distanceKm,
      direction: isCorrect
        ? ""
        : getDirectionEmoji(
            guessedCity.lat,
            guessedCity.lon,
            targetCity.lat,
            targetCity.lon
          ),
    };
    const nextGuesses = [...guesses, guessObj];
    setGuesses(nextGuesses);

    if (isCorrect) {
      setResult(
        `🎉 Congratulations! You guessed ${cityLabel(targetCity)} in ${nextGuesses.length} ${
          nextGuesses.length === 1 ? "guess" : "guesses"
        }.`
      );
      setGameOver(true);
    } else if (nextGuesses.length >= MAX_GUESSES) {
      setResult(`Game over! The city was ${cityLabel(targetCity)}.`);
      setGameOver(true);
    } else {
      setResult("");
    }

    setGuess("");
    closeSuggestions();
    focusInput();
  }

  // Autocomplete handlers
  function handleInputChange(e) {
    const value = e.target.value;
    setGuess(value);
    setResult("");
    const found = searchCities(value, 8);
    setSuggestions(found);
    setShowSuggestions(found.length > 0);
    setHighlightedIdx(-1);
  }

  function handleSuggestionClick(city) {
    setGuess(cityLabel(city));
    closeSuggestions();
    focusInput();
  }

  function handleInputKeyDown(e) {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIdx((idx) => (idx + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIdx((idx) => (idx - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      if (highlightedIdx >= 0 && highlightedIdx < suggestions.length) {
        e.preventDefault();
        handleSuggestionClick(suggestions[highlightedIdx]);
      }
    } else if (e.key === "Escape") {
      closeSuggestions();
    }
  }

  function handleEstimate(lat, lon) {
    if (gameOver) return;
    setEstimate({ lat, lon });
  }

  const lastGuess = guesses[guesses.length - 1];
  const estimateErrorKm =
    gameOver && estimate && targetCity
      ? calculateDistance(estimate.lat, estimate.lon, targetCity.lat, targetCity.lon)
      : null;

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

      <div className="game-layout">
        <div className="game-panel">
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
            <button className="restart-button" type="button" onClick={startNewGame}>
              Restart
            </button>
          </form>

          <div className="legend">
            <span><i className="swatch green" /> correct</span>
            <span><i className="swatch yellow" /> same country</span>
            <span><i className="swatch orange" /> same continent</span>
          </div>

          <GuessList guesses={guesses} useMiles={useMiles} />

          {lastGuess && !lastGuess.isCorrect && !gameOver && (
            <div className="distance">
              Distance: {formatDistance(lastGuess.distanceKm, useMiles)}
            </div>
          )}
          {result && <div className="result">{result}</div>}
          {estimateErrorKm !== null && (
            <div className="result">
              Your pin was {formatDistance(estimateErrorKm, useMiles)} from {targetCity.name}.
            </div>
          )}
          <div className="guess-count">
            Guesses: {guesses.length} / {MAX_GUESSES}
          </div>
        </div>

        <div className="globe-panel">
          <div className="globe-frame">
            <Suspense fallback={<div className="globe-fallback">Loading globe…</div>}>
              <GuessGlobe
                guesses={guesses}
                target={gameOver ? targetCity : null}
                estimate={estimate}
                onEstimate={handleEstimate}
                useMiles={useMiles}
              />
            </Suspense>
          </div>
          <p className="globe-help">
            Every ring is a clue: the target is somewhere on the ring around each
            guess. Click the globe to drop a pin where you think it is.
            {estimate && !gameOver && (
              <>
                {" "}
                <button type="button" className="link-button" onClick={() => setEstimate(null)}>
                  Clear pin
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
