import { OREDice } from "./OREDice.mjs";

export const ORE_DIE_TYPES = [
  { name: "WT.OREDieType.Normal", category: "normal", points: 1 },
  { name: "WT.OREDieType.Hard", category: "hard", points: 2 },
  { name: "WT.OREDieType.Wiggle", category: "wiggle", points: 4 },
  { name: "WT.OREDieType.Expert", category: "hard", points: 2 },
  { name: "WT.OREDieType.Fixed", category: "hard", points: 2 },
];
export const ORE_DIE_TYPE_NORMAL = 0;
export const ORE_DIE_TYPE_HARD = 1;
export const ORE_DIE_TYPE_WIGGLE = 2;
export const ORE_DIE_TYPE_EXPERT = 3;
export const ORE_DIE_TYPE_FIXED = 4;

export class OREDie {
  constructor(face, type = ORE_DIE_TYPE_NORMAL) {
    this.face = face;
    this.type = type;
  }
}

function remove(array, die) {
  var index = array.indexOf(die);
  if (index !== -1) {
    array.splice(index, 1);
  }
}

export class OREDieSet extends Array {
  constructor(...dice) {
    super(...dice);
  }
  get width() {
    return this.length;
  }
  get height() {
    if (!this.length) {
      return 0;
    }
    return this[0].face;
  }
  remove(die) {
    return remove(this, die);
  }
}

export class ORERoll {
  constructor(sets = [], looseDice = [], options = {}) {
    this.sets = new Array(...sets.map((s) => new OREDieSet(...s)));
    this.looseDice = new Array(...looseDice);
    this.gobbled = options.gobbled ?? 0;
  }

  static fromDice(dice, options = {}) {
    const result = new ORERoll([], [], options);
    outerLoop: for (const die of dice) {
      for (const set of result.sets) {
        if (set.height == die.face) {
          set.push(die);
          continue outerLoop;
        }
      }
      for (const looseDie of result.looseDice) {
        if (looseDie.face == die.face) {
          remove(result.looseDice, looseDie);
          result.sets.push(new OREDieSet(looseDie, die));
          continue outerLoop;
        }
      }
      result.looseDice.push(die);
    }
    return result;
  }

  gobble(amount, options = {}) {
    this.gobbled += amount;
  }

  async showChatMessage(options = {}) {
    return ChatMessage.create({
      ...options,
      content: await renderTemplate(
        "systems/wildtalents/templates/ore-roll-chat-message.hbs",
        { ...options, oreRoll: this, ORE_DIE_TYPES: ORE_DIE_TYPES }
      ),
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      roll: await new Roll("0").evaluate(),
      flags: {
        ...(options.flags ?? {}),
        core: { ...(options?.flags?.core ?? {}), canPopout: true },
      },
    });
  }

  get dice() {
    return this.sets.flatMap((x) => x).concat(this.looseDice);
  }

  get asOREDice() {
    const dice = this.dice;
    return new OREDice({
      dice: dice.filter((die) => die.type == ORE_DIE_TYPE_NORMAL).length,
      hardDice: dice.filter((die) => die.type == ORE_DIE_TYPE_HARD).length,
      wiggleDice: dice.filter((die) => die.type == ORE_DIE_TYPE_WIGGLE).length,
      expertDice: dice.filter((die) => die.type == ORE_DIE_TYPE_EXPERT).length,
      fixedDice: {
        [1]: dice.filter(
          (die) => die.type == ORE_DIE_TYPE_FIXED && die.face == 1
        ).length,
        [2]: dice.filter(
          (die) => die.type == ORE_DIE_TYPE_FIXED && die.face == 2
        ).length,
        [3]: dice.filter(
          (die) => die.type == ORE_DIE_TYPE_FIXED && die.face == 3
        ).length,
        [4]: dice.filter(
          (die) => die.type == ORE_DIE_TYPE_FIXED && die.face == 4
        ).length,
        [5]: dice.filter(
          (die) => die.type == ORE_DIE_TYPE_FIXED && die.face == 5
        ).length,
        [6]: dice.filter(
          (die) => die.type == ORE_DIE_TYPE_FIXED && die.face == 6
        ).length,
        [7]: dice.filter(
          (die) => die.type == ORE_DIE_TYPE_FIXED && die.face == 7
        ).length,
        [8]: dice.filter(
          (die) => die.type == ORE_DIE_TYPE_FIXED && die.face == 8
        ).length,
        [9]: dice.filter(
          (die) => die.type == ORE_DIE_TYPE_FIXED && die.face == 9
        ).length,
        [10]: dice.filter(
          (die) => die.type == ORE_DIE_TYPE_FIXED && die.face == 10
        ).length,
      },
    });
  }
}
