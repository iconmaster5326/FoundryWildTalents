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

  get asJSON() {
    return { face: this.face, type: this.type };
  }

  static fromJSON(json) {
    return new OREDie(json.face, json.type);
  }

  static jqInfo(jq) {
    return {
      loose: jq.find(".die-data-is-loose").text() === "true",
      index1: Number(jq.find(".die-data-index1").text()),
      index2: Number(jq.find(".die-data-index2").text()),
    };
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
    for (const die of this) {
      if (die.face != "*") {
        return die.face;
      }
    }
    return "*";
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

  get asRollFlavor() {
    const roll = new Roll("0");
    roll.terms[0] = new NumericTerm({
      number: 0,
      options: { flavor: JSON.stringify(this.asJSON) },
    });
    return roll;
  }

  async renderChatMessageContent(options = {}) {
    return renderTemplate(
      "systems/wildtalents/templates/ore-roll-chat-message.hbs",
      { ...options, oreRoll: this, ORE_DIE_TYPES: ORE_DIE_TYPES }
    );
  }

  async showChatMessage(options = {}) {
    return ChatMessage.create({
      ...options,
      content: await this.renderChatMessageContent(options),
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      roll: await this.asRollFlavor.evaluate(),
      flags: {
        ...(options.flags ?? {}),
        core: { ...(options?.flags?.core ?? {}), canPopout: true },
      },
    });
  }

  async rerenderChatMessage(chatMessage, options = {}) {
    chatMessage.update({
      content: await this.renderChatMessageContent(options),
      roll: await this.asRollFlavor.evaluate(),
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

  get asJSON() {
    return {
      sets: this.sets.map((s) => s.map((d) => d.asJSON)),
      looseDice: this.looseDice.map((d) => d.asJSON),
      gobbled: this.gobbled,
    };
  }

  static fromJSON(json) {
    return new ORERoll(
      json.sets.map((s) => s.map((d) => OREDie.fromJSON(d))),
      json.looseDice.map((d) => OREDie.fromJSON(d)),
      {
        gobbled: json.gobbled,
      }
    );
  }

  static fromRollFlavor(roll) {
    return ORERoll.fromJSON(JSON.parse(roll.terms[0].flavor));
  }

  getDieFromJQ(jq) {
    const info = OREDie.jqInfo(jq);
    if (info.loose) {
      return this.looseDice[info.index1];
    } else {
      return this.sets[info.index1][info.index2];
    }
  }

  popDieFromJQ(jq) {
    const info = OREDie.jqInfo(jq);
    if (info.loose) {
      return this.looseDice.splice(info.index1, 1)[0];
    } else {
      const result = this.sets[info.index1].splice(info.index2, 1)[0];
      if (this.sets[info.index1].length == 0) {
        this.sets.splice(info.index1, 1);
      }
      return result;
    }
  }

  isGobbled(die) {
    var toGobble = this.gobbled;
    if (toGobble <= 0) {
      return false;
    }
    for (var face = 10; face >= 1; face--) {
      for (const set of this.sets) {
        if (set.height == face) {
          const i = set.indexOf(die);
          if (i != -1 && i >= set.width - toGobble) {
            return true;
          } else {
            toGobble -= Math.min(set.width, toGobble);
            if (toGobble <= 0) {
              return false;
            }
          }
        }
      }
    }
    return false;
  }
}
