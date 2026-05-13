import React, { useRef } from "react";

function AutocompleteInput({
  guess,
  onChange,
  onKeyDown,
  suggestions,
  showSuggestions,
  highlightedIdx,
  onSuggestionClick,
  disabled,
  inputRef
}) {
  return (
    <div className="autocomplete-wrapper">
      <input
        ref={inputRef}
        type="text"
        className="guess-input"
        placeholder="Enter a city name"
        value={guess}
        onChange={onChange}
        onKeyDown={onKeyDown}
        disabled={disabled}
        autoFocus
        autoComplete="off"
      />
      {showSuggestions && (
        <ul className="autocomplete-list">
          {suggestions.map((city, idx) => (
            <li
              key={city.name}
              className={
                "autocomplete-item" +
                (idx === highlightedIdx ? " highlighted" : "")
              }
              onMouseDown={() => onSuggestionClick(city)}
            >
              {city.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AutocompleteInput;
