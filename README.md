# Citydle

An attempt at a Citydle-style game, which is itself inspired by Wordle. All credit to the original developers.

You get 15 guesses to find a mystery city. Each guess shows how far off you were and which way to head, and the tiles colour in if you got the right country (yellow) or continent (orange).

## The globe

Next to the board there's a 3D globe. Every guess is plotted on it, and each one draws a ring around itself whose radius is that guess's distance from the target. The target sits on all of the rings at once, so after a few guesses the spot where they cross is a pretty good hint. Click anywhere on the globe to drop a pin where you think the city is; when the game ends the target is revealed and you're told how far your pin was.

## Running it

```
cd citydle
npm install
npm run dev
```

`npm run build` makes a production build in `citydle/dist`.

`server/` is a bare Express stub that nothing uses yet (`cd server && npm install && npm test`).

## The city list

`citydle/src/data/cities.json` has about 3,000 cities in 240+ countries. Any of them is a valid guess. The mystery city is only picked from the ones flagged `common` (national capitals plus the cities from the original hand-written list), so you won't get stuck on some 150,000-person town you've never heard of.

The file is generated, not hand-edited:

```
cd citydle
npm run build:cities
```

The settings are at the top of `citydle/scripts/build-cities.mjs`: the population cutoff, spelling fixes, nicknames people might type ("Bombay" finds Mumbai), and places to leave out. To make a specific city eligible as an answer, add its GeoNames id to `scripts/seed-cities.json`.

City data comes from [GeoNames](https://www.geonames.org) (CC BY 4.0) via the `all-the-cities` package. The globe texture is from the `three-globe` examples.
