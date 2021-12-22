"use strict";

const Algorithm = require("./algorithm");

let data = {
  positions: 5,
  cigarettes: ["WithoutFilter", "Cigar", "Light", "Pipe", "Menthol"],
  nations: ["Brit", "Swede", "Dane", "Norwegian", "German"],
  colors: ["red", "green", "white", "yellow", "blue"],
  pets: ["dogs", "birds", "cats", "horses", "fish"],
  drinks: ["tea", "coffee", "milk", "beer", "water"],
};

let solve = new Algorithm.solverConstructor();
solve.analyze(data);
// Norwegian lives in the first house
solve.same(1, "Norwegian");
// Brit lives in the red house
solve.same("Brit", "red");
// green house is on the left of the white house
solve.neighbours("green", "white", true);
// Dane drinks tea
solve.same("Dane", "tea");
// man who smokes Light lives next to the one who keeps cats
solve.neighbours("Light", "cats");
// owner of the yellow house smokes Cigar
solve.same("yellow", "Cigar");
// German smokes Pipe
solve.same("German", "Pipe");
// man living in the center house drinks milk
solve.same(3, "milk");
// man who smokes Light has a neighbour who drinks water
solve.neighbours("Light", "water");
// person who smokes WithoutFilter rears birds
solve.same("WithoutFilter", "birds");
// Swede keeps dogs as pets
solve.same("Swede", "dogs");
// Norwegian lives next to the blue house
solve.neighbours("Norwegian", "blue");
// man who keeps horses lives next to the man who smokes Cigar
solve.neighbours("horses", "yellow");
// owner who smokes Menthol drinks beer
solve.same("Menthol", "beer");
// green house's owner drinks coffee
solve.same("green", "coffee");

console.time("Time");
solve.solve();
console.timeEnd("Time");
