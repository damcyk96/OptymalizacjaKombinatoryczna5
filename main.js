"use strict";

const EinLib = require("./ein-lib");

let data = {
  positions: 5,
  cigarettes: ["Pall Mall", "Dunhill", "Blends", "Prince", "BlueMaster"],
  nations: ["Brit", "Swede", "Dane", "Norwegian", "German"],
  colors: ["red", "green", "white", "yellow", "blue"],
  pets: ["dogs", "birds", "cats", "horses", "fish"],
  drinks: ["tea", "coffee", "milk", "beer", "water"],
};

let ein = new EinLib.einConstructor();
ein.analyze(data);
// the Norwegian lives in the first house
ein.same(1, "Norwegian");
// the Brit lives in the red house
ein.same("Brit", "red");
// the green house is on the left of the white house
ein.neighbours("green", "white", true);
// the Dane drinks tea
ein.same("Dane", "tea");
// the man who smokes Blends lives next to the one who keeps cats
ein.neighbours("Blends", "cats");
// the owner of the yellow house smokes Dunhill
ein.same("yellow", "Dunhill");
// the German smokes Prince
ein.same("German", "Prince");
// the man living in the center house drinks milk
ein.same(3, "milk");
// the man who smokes Blends has a neighbour who drinks water
ein.neighbours("Blends", "water");
// the person who smokes Pall Mall rears birds
ein.same("Pall Mall", "birds");
// the Swede keeps dogs as pets
ein.same("Swede", "dogs");
// the Norwegian lives next to the blue house
ein.neighbours("Norwegian", "blue");
// the man who keeps horses lives next to the man who smokes Dunhill
ein.neighbours("horses", "yellow");
// the owner who smokes BlueMaster drinks beer
ein.same("BlueMaster", "beer");
// the green house's owner drinks coffee
ein.same("green", "coffee");

console.time("Time");
ein.solve();
console.timeEnd("Time");
