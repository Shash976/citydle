import React from "react";
import { cityLabel } from "../utils/cities";

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
        role="combobox"
        aria-expanded={showSuggestions}
        aria-autocomplete="list"
      />
      {showSuggestions && (
        <ul className="autocomplete-list" role="listbox">
          {suggestions.map((city, idx) => (
            <li
              key={cityLabel(city)}
              role="option"
              aria-selected={idx === highlightedIdx}
              className={
                "autocomplete-item" +
                (idx === highlightedIdx ? " highlighted" : "")
              }
              onMouseDown={() => onSuggestionClick(city)}
            >
              {city.name}
              <span className="autocomplete-country">{city.country}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AutocompleteInput;
