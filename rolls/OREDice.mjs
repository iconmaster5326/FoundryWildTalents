import {
  OREDie,
  ORERoll,
  ORE_DIE_TYPES,
  ORE_DIE_TYPE_EXPERT,
  ORE_DIE_TYPE_FIXED,
  ORE_DIE_TYPE_HARD,
  ORE_DIE_TYPE_NORMAL,
  ORE_DIE_TYPE_WIGGLE,
} from "./ORERoll.mjs";

export const ROLL_ORDERS = [
  { name: "WT.RollOrder.HardNormalWiggle" }, // penalty order in Wild Talents
  { name: "WT.RollOrder.NormalHardWiggle" }, // default drop order when constraining
  { name: "WT.RollOrder.WiggleHardNormal" }, // penalty order in Reign
  { name: "WT.RollOrder.WiggleNormalHard" },
  { name: "WT.RollOrder.NormalWiggleHard" },
  { name: "WT.RollOrder.HardWiggleNormal" },
];
export const ROLL_ORDER_HNW = 0;
export const ROLL_ORDER_NHW = 1;
export const ROLL_ORDER_WHN = 2;
export const ROLL_ORDER_WNH = 3;
export const ROLL_ORDER_NWH = 4;
export const ROLL_ORDER_HWN = 5;

export class OREDice {
  constructor(options = {}) {
    this.dice = options.dice ?? 0;
    this.hardDice = options.hardDice ?? 0;
    this.wiggleDice = options.wiggleDice ?? 0;
    this.expertDice = options.expertDice ?? 0;
    this.fixedDice = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    const fixed = options.fixedDice ?? {};
    for (const key in fixed) {
      this.fixedDice[Number(key) - 1] = fixed[key];
    }
  }

  copy() {
    return new OREDice({
      dice: this.dice,
      hardDice: this.hardDice,
      wiggleDice: this.wiggleDice,
      expertDice: this.expertDice,
      fixedDice: {
        [1]: this.fixedDice[0],
        [2]: this.fixedDice[1],
        [3]: this.fixedDice[2],
        [4]: this.fixedDice[3],
        [5]: this.fixedDice[4],
        [6]: this.fixedDice[5],
        [7]: this.fixedDice[6],
        [8]: this.fixedDice[7],
        [9]: this.fixedDice[8],
        [10]: this.fixedDice[9],
      },
    });
  }

  static fromString(diceString, options = {}) {
    const result = new OREDice();
    var nDice = "";
    var dicePrefix = "";
    var fixedMode = false;
    var nFixedDie = "";

    for (const c of diceString) {
      if (fixedMode) {
        if (/\d/.test(c)) {
          nFixedDie += c;
        } else if (/[dD]/.test(c)) {
          if (nDice == "") {
            throw new SyntaxError(
              "No dice amount given (format is XfNd; X is the number of dice, N is the face)"
            );
          }
          if (nFixedDie == "") {
            throw new SyntaxError(
              "No face given to fixed die (format is XfNd; X is the number of dice, N is the face)"
            );
          }
          if (Number(nFixedDie) < 1 || Number(nFixedDie) > 10) {
            throw new SyntaxError(
              nFixedDie + " is not a valid die face (expected a number 1-10)"
            );
          }

          result.fixedDice[Number(nFixedDie) - 1] += Number(nDice);

          nDice = "";
          fixedMode = false;
          nFixedDie = "";
        } else if (/[A-Za-z]/.test(c)) {
          throw new SyntaxError(
            "Invalid format for fixed dice (format is XfNd; X is the number of dice, N is the face)"
          );
        }
      } else if (/\d/.test(c)) {
        nDice += c;
      } else if (/[dD]/.test(c)) {
        if (!/^[hwe]?$/.test(dicePrefix)) {
          throw new SyntaxError(
            "Unknown dice type '" +
              dicePrefix +
              "d'; available types are d, hd, wd, ed, and f1d-f10d"
          );
        }
        if (nDice == "") {
          throw new SyntaxError(
            "No dice amount given (format is X" +
              dicePrefix +
              "d; X is the number of dice)"
          );
        }

        if (dicePrefix == "") {
          result.dice += Number(nDice);
        } else if (dicePrefix == "h") {
          result.hardDice += Number(nDice);
        } else if (dicePrefix == "w") {
          result.wiggleDice += Number(nDice);
        } else if (dicePrefix == "e") {
          result.expertDice += Number(nDice);
        }

        nDice = "";
        dicePrefix = "";
      } else if (/[hHwWeE]/.test(c)) {
        dicePrefix += c.toLowerCase();
      } else if (/[fF]/.test(c)) {
        if (dicePrefix != "") {
          throw new SyntaxError(
            "Unknown dice type '" +
              dicePrefix +
              "f'; available types are d, hd, wd, ed, and f1d-f10d"
          );
        }
        fixedMode = true;
      } else if (/[A-Za-z]/.test(c)) {
        throw new SyntaxError(
          "Unknown dice type '" +
            dicePrefix +
            c.toLowerCase() +
            "d'; available types are d, hd, wd, ed, and f1d-f10d"
        );
      }
    }

    return result;
  }

  get size() {
    return (
      this.dice +
      this.hardDice +
      this.wiggleDice +
      this.expertDice +
      this.fixedDice.reduce((a, v) => a + v, 0)
    );
  }

  get hardDiceSize() {
    return (
      this.hardDice +
      this.expertDice +
      this.fixedDice.reduce((a, v) => a + v, 0)
    );
  }

  _removeD() {
    if (this.dice <= 0) {
      return false;
    }
    this.dice--;
    return true;
  }
  _removeHD() {
    if (this.hardDice <= 0) {
      for (var face = 0; face < 10; face++) {
        if (this.fixedDice[face] > 0) {
          this.fixedDice[face]--;
          return true;
        }
      }
      if (this.expertDice <= 0) {
        return false;
      }
      this.expertDice--;
      return true;
    }
    this.hardDice--;
    return true;
  }
  _removeWD() {
    if (this.wiggleDice <= 0) {
      return false;
    }
    this.wiggleDice--;
    return true;
  }
  _removeAllHD() {
    if (this.hardDiceSize <= 0) {
      return false;
    }
    this.hardDice = 0;
    this.expertDice = 0;
    this.fixedDice = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    return true;
  }

  constrain(options = {}) {
    const poolSize = options.poolSize ?? 10;
    const constrainOrder = options.constrainOrder ?? ROLL_ORDER_NHW;

    const result = this.copy();
    var excess = result.size - poolSize;

    while (excess > 0) {
      var removedADie = false;
      switch (constrainOrder) {
        case ROLL_ORDER_HNW:
          removedADie =
            result._removeAllHD() || result._removeD() || result._removeWD();
          break;
        case ROLL_ORDER_NHW:
          removedADie =
            result._removeD() || result._removeAllHD() || result._removeWD();
          break;
        case ROLL_ORDER_WHN:
          removedADie =
            result._removeWD() || result._removeAllHD() || result._removeD();
          break;
        case ROLL_ORDER_WNH:
          removedADie =
            result._removeWD() || result._removeD() || result._removeAllHD();
          break;
        case ROLL_ORDER_NWH:
          removedADie =
            result._removeD() || result._removeWD() || result._removeAllHD();
          break;
        case ROLL_ORDER_HWN:
          removedADie =
            result._removeAllHD() || result._removeWD() || result._removeD();
          break;
      }
      if (!removedADie) {
        throw RangeError("Cannot constrain pool to requested size!");
      }
      excess = result.size - poolSize;
    }

    return result;
  }

  penalize(amount, options = {}) {
    const penaltyOrder = options.penaltyOrder ?? ROLL_ORDER_HNW;

    const result = this.copy();

    for (var i = 0; i < amount; i++) {
      var removedADie = false;
      switch (penaltyOrder) {
        case ROLL_ORDER_HNW:
          removedADie =
            result._removeHD() || result._removeD() || result._removeWD();
          break;
        case ROLL_ORDER_NHW:
          removedADie =
            result._removeD() || result._removeHD() || result._removeWD();
          break;
        case ROLL_ORDER_WHN:
          removedADie =
            result._removeWD() || result._removeHD() || result._removeD();
          break;
        case ROLL_ORDER_WNH:
          removedADie =
            result._removeWD() || result._removeD() || result._removeHD();
          break;
        case ROLL_ORDER_NWH:
          removedADie =
            result._removeD() || result._removeWD() || result._removeHD();
          break;
        case ROLL_ORDER_HWN:
          removedADie =
            result._removeHD() || result._removeWD() || result._removeD();
          break;
      }
      if (!removedADie) {
        break;
      }
    }

    return result;
  }

  get asString() {
    var result = "";
    if (this.dice > 0) {
      result += this.dice + "d";
    }
    if (this.hardDice > 0) {
      result += this.hardDice + "hd";
    }
    if (this.expertDice > 0) {
      result += this.expertDice + "ed";
    }
    for (var i = 0; i < 10; i++) {
      if (this.fixedDice[i] > 0) {
        result += this.fixedDice[i] + "f" + (i + 1) + "d";
      }
    }
    if (this.wiggleDice > 0) {
      result += this.wiggleDice + "wd";
    }
    return result;
  }

  async roll(options = {}) {
    const result = [];

    if (this.dice > 0) {
      const roll = new Roll(this.dice + "d10");
      const rollResult = await roll.evaluate();
      for (const dieData of rollResult.dice[0].results) {
        result.push(new OREDie(dieData.result, ORE_DIE_TYPE_NORMAL));
      }
    }

    for (var i = 0; i < this.hardDice; i++) {
      result.push(new OREDie(10, ORE_DIE_TYPE_HARD));
    }
    for (var i = 0; i < this.expertDice; i++) {
      result.push(
        new OREDie(
          options.expertDiceFaces ? options.expertDiceFaces[i] : "*",
          ORE_DIE_TYPE_EXPERT
        )
      );
    }
    for (var i = 0; i < 10; i++) {
      for (var j = 0; j < this.fixedDice[i]; j++) {
        result.push(new OREDie(i + 1, ORE_DIE_TYPE_FIXED));
      }
    }
    for (var i = 0; i < this.wiggleDice; i++) {
      result.push(new OREDie("*", ORE_DIE_TYPE_WIGGLE));
    }
    return ORERoll.fromDice(result, options);
  }

  get pointCost() {
    return (
      this.dice * ORE_DIE_TYPES[ORE_DIE_TYPE_NORMAL].points +
      this.hardDice * ORE_DIE_TYPES[ORE_DIE_TYPE_HARD].points +
      this.wiggleDice * ORE_DIE_TYPES[ORE_DIE_TYPE_WIGGLE].points +
      this.expertDice * ORE_DIE_TYPES[ORE_DIE_TYPE_EXPERT].points +
      this.fixedDice.reduce((a, v) => a + v, 0) *
        ORE_DIE_TYPES[ORE_DIE_TYPE_FIXED].points
    );
  }
}
