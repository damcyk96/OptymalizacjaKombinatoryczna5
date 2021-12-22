"use strict";

require("console.table");
function isString(a) {
  return typeof a === "string";
}

function isNumber(a) {
  return typeof a === "number";
}

function isArray(a) {
  return a.constructor === Array;
}

module.exports = {
  solverConstructor: function () {
    let data = null;
    let pieceMap = new Map();
    let possibilityMap = new Map();
    let Possibilitieset = new Set();

    let unplacedPossibilities = new Set();
    let placedPieces = new Map();
    let positionMap = new Map();

    // Pretty print functions.
    function printPossibilities() {
      let rows = Array.from(Possibilitieset).map((p) => {
        let obj = {};
        for (let key in data) {
          if (!data.hasOwnProperty(key)) continue;
          if (p.pieceMap.has(key)) obj[key] = p.pieceMap.get(key).value;
          else obj[key] = undefined;
        }
        return obj;
      });
      console.table(rows);
    }

    function printPositionMap() {
      let rows = [];
      for (let i = 1; i <= data.positions; i++) {
        let obj = {};
        let posObj = positionMap.get(i);
        for (let key in data) {
          if (!data.hasOwnProperty(key)) continue;
          obj[key] = undefined;
          if (posObj[key] != null) obj[key] = posObj[key].value;
        }
        rows.push(obj);
      }
      console.table(rows);
    }

    function analyze(dataParam) {
      data = dataParam;
      for (let key in data) {
        if (!data.hasOwnProperty(key)) continue;
        if (key === "positions") {
          for (let i = 1; i <= data.positions; i++) {
            pieceMap.set(i, {
              type: "positions",
              value: i,
            });
            same(i);
          }
        } else {
          for (let item of data[key]) {
            pieceMap.set(item, {
              type: key,
              value: item,
            });
            same(item);
          }
        }
      }
    }

    function same(...args) {
      let pvals = [];
      for (let a of args) {
        if (isArray(a)) pvals.push.apply(pvals, a);
        else pvals.push(a);
      }

      let possibility = {
        pieces: [],
        pieceMap: new Map(),
        pre: new Set(),
        after: new Set(),
        neighbours: new Set(),
      };
      Possibilitieset.add(possibility);

      possibility.pieces = pvals.map((p) => {
        if (!pieceMap.has(p)) throw new Error('Piece "' + p + '" not found.');
        let piece = pieceMap.get(p);
        possibility.pieceMap.set(piece.type, piece);
        return piece;
      });

      let Possibilities = new Set();
      for (let piece of possibility.pieces) {
        if (!possibilityMap.has(piece.value)) continue;
        Possibilities.add(possibilityMap.get(piece.value));
      }
      for (let otherpossibility of Possibilities)
        possibility = joinPossibilities(possibility, otherpossibility);

      for (let piece of possibility.pieces) possibilityMap.set(piece.value, possibility);

      return possibility;
    }

    function pre(a, b) {
      if (!isArray(a)) a = [a];
      if (!isArray(b)) b = [b];
      let possibilityA = same(a);
      let possibilityB = same(b);

      for (let piece of possibilityA.pieces) possibilityB.pre.add(piece.value);
      for (let piece of possibilityB.pieces) possibilityA.after.add(piece.value);
    }

    function neighbours(a, b, preFlag = false) {
      if (!isArray(a)) a = [a];
      if (!isArray(b)) b = [b];
      let possibilityA = same(a);
      let possibilityB = same(b);

      for (let piece of possibilityA.pieces) possibilityB.neighbours.add(piece.value);
      for (let piece of possibilityB.pieces) possibilityA.neighbours.add(piece.value);

      if (preFlag) pre(a, b);
    }

    function joinPossibilities(a, b) {
      for (let piece of b.pieces) {
        if (a.pieceMap.has(piece.type)) {
          if (a.pieceMap.get(piece.type) !== piece)
            throw new Error("Overlapped pieces do not match.");
          continue;
        }
        a.pieces.push(piece);
        a.pieceMap.set(piece.type, piece);
      }

      for (let pval of b.pre) {
        if (a.after.has(pval))
          throw new Error("Pre/after conflict when joining two Possibilities.");
        a.pre.add(pval);
      }

      for (let pval of b.after) {
        if (a.pre.has(pval))
          throw new Error("Pre/after conflict when joining two Possibilities.");
        a.after.add(pval);
      }

      for (let pval of b.neighbours) a.neighbours.add(pval);

      Possibilitieset.delete(b);
      return a;
    }

    function canBePlaced(possibility, pos) {
      let posObj = positionMap.get(pos);
      for (let piece of possibility.pieces) {
        if (posObj[piece.type] == null) continue;
        if (posObj[piece.type] !== piece) return false;
      }
      for (let pval of possibility.pre) {
        if (!placedPieces.has(pval)) continue;
        if (placedPieces.get(pval) >= pos) return false;
      }
      for (let pval of possibility.after) {
        if (!placedPieces.has(pval)) continue;
        if (placedPieces.get(pval) <= pos) return false;
      }
      for (let pval of possibility.neighbours) {
        if (!placedPieces.has(pval)) continue;
        if (Math.abs(placedPieces.get(pval) - pos) !== 1) return false;
      }
      return true;
    }

    function place(possibility, pos) {
      let posObj = positionMap.get(pos);
      unplacedPossibilities.delete(possibility);
      let piecesToUnset = [];
      for (let piece of possibility.pieces) {
        if (posObj[piece.type] != null) continue;
        piecesToUnset.push(piece);
        posObj[piece.type] = piece;
        placedPieces.set(piece.value, pos);
      }
      possibility.piecesToUnset = piecesToUnset;
      possibility.pos = pos;
    }

    function unplace(possibility) {
      let piecesToUnset = possibility.piecesToUnset;
      let posObj = positionMap.get(possibility.pos);

      for (let piece of piecesToUnset) {
        posObj[piece.type] = null;
        placedPieces.delete(piece.value);
      }

      delete possibility.piecesToUnset;
      delete possibility.pos;

      unplacedPossibilities.add(possibility);
    }

    function trySet(possibility, pos, depth, permanent = false) {
    
      if (!canBePlaced(possibility, pos)) {
        return false;
      }
      if (!permanent && depth <= 0) return true;

      place(possibility, pos);
      let result = true;
      if (depth > 0) {
        result = tryPlaceNextpossibility(depth);
      
      }

  
      if (!permanent || !result) unplace(possibility);

      return result;
    }

    function tryPlaceNextpossibility(depthMax, permanent = false) {
      if (unplacedPossibilities.size <= 0) return true;
      let placedPossibilities = [];
      let Possibilities = Array.from(unplacedPossibilities);
      let posesCache = new Map();

      for (let depth = 0; depth < depthMax; depth++) {
        for (let possibility of Possibilities) {
          let poses = Array.from(possibility.poses);
          let trueCount = 0;
          let tpos = null;
          for (let pos of poses) {
            let result = trySet(possibility, pos, depth);
            if (result) {
              trueCount++;
              tpos = pos;
              if (trueCount > 1) break;
            }
            else {
              if (!posesCache.has(possibility))
                posesCache.set(possibility, new Set(possibility.poses));
              possibility.poses.delete(pos);
            }
            if (trueCount > 1) continue;
          }
          if (trueCount < 1) {
            for (let possibility of placedPossibilities) unplace(possibility);
            for (let [possibility, poses] of posesCache) possibility.poses = poses;
            return false;
          } else if (trueCount === 1) {
            let sanityResult = trySet(possibility, tpos, 0, true);
            if (!sanityResult) throw new Error("Something is bad?.");
            placedPossibilities.push(possibility);
          }
        }
      }

      if (!permanent) {
        for (let possibility of placedPossibilities) unplace(possibility);
        for (let [possibility, poses] of posesCache) possibility.poses = poses;
      }
      return true;
    }

    function solve() {
      unplacedPossibilities = new Set(Possibilitieset);
      let posarray = [];
      for (let i = 1; i <= data.positions; i++) {
        posarray.push(i);
        let obj = {};
        for (let key in data) {
          if (!data.hasOwnProperty(key)) continue;
          obj[key] = null;
        }
        positionMap.set(i, obj);
        let possibility = possibilityMap.get(i);
        trySet(possibility, i, 0, true);
      }
      let Possibilities = Array.from(unplacedPossibilities);
      for (let possibility of Possibilities) {
        possibility.poses = new Set(posarray);
      }

      let depth = 1;
      let lastUnplacedPossibilitiesSize = unplacedPossibilities.size;
      while (unplacedPossibilities.size > 0) {
        let result = tryPlaceNextpossibility(depth, true);
        if (result !== true) {
          console.log("Could not be solved.");
          return;
        }
        if (unplacedPossibilities.size < lastUnplacedPossibilitiesSize) {
          depth = 1;
          lastUnplacedPossibilitiesSize = unplacedPossibilities.size;
        } else depth++;
      }

      console.log("----------------------- Solution ------------------------");
      console.log("");
      printPositionMap();
    }
    this.printPossibilities = printPossibilities;
    this.printPositionMap = printPositionMap;

    this.analyze = analyze;
    this.same = same;
    this.pre = pre;
    this.neighbours = neighbours;

    this.solve = solve;

    return this;
  },
};
