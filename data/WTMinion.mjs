import { OREDice } from "../rolls/OREDice.mjs";
import { DAMAGE_TYPES, MINION_RATINGS } from "../util.mjs";

export class WTMinionData extends foundry.abstract.DataModel {
  /** @override */
  static defineSchema() {
    const fields = foundry.data.fields;

    const mrChoices = {};
    for (var i = 0; i < MINION_RATINGS.length; i++) {
      const mr = MINION_RATINGS[i];
      mrChoices[i] = mr.name;
    }
    const dtChoices = {};
    for (var i = 0; i < DAMAGE_TYPES.length; i++) {
      const dt = DAMAGE_TYPES[i];
      dtChoices[i] = dt.name;
    }

    return {
      appearence: new fields.HTMLField(),
      notes: new fields.HTMLField(),
      groupSize: new fields.NumberField({
        required: true,
        initial: 1,
        min: 0,
      }),
      minionRating: new fields.NumberField({
        required: true,
        initial: 0, // rabble
        choices: mrChoices,
      }),
      command: new fields.NumberField({
        required: false,
        initial: undefined,
        min: 1,
        max: 10,
      }),
      skill: new fields.NumberField({
        required: false,
        initial: undefined,
        min: 1,
        max: 10,
      }),
      demoralization: new fields.NumberField({
        required: false,
        initial: undefined,
        min: 1,
        max: 10,
      }),
      damageType: new fields.NumberField({
        required: true,
        initial: 0, // shock
        choices: dtChoices,
      }),
      lar: new fields.NumberField({
        required: true,
        initial: 0,
        min: 0,
      }),
      har: new fields.NumberField({
        required: true,
        initial: 0,
        min: 0,
      }),
      masteries: new fields.ArrayField(
        new fields.SchemaField({
          id: new fields.StringField(), // ID of skill
          specialty: new fields.StringField(),
        })
      ),
    };
  }

  get initiative() {
    return 100 - this.groupSize;
  }

  get effectiveCommand() {
    return this.command || MINION_RATINGS[this.minionRating].command;
  }

  get effectiveSkill() {
    return this.skill || MINION_RATINGS[this.minionRating].skill;
  }

  get effectiveDemoralization() {
    return (
      this.demoralization || MINION_RATINGS[this.minionRating].demoralization
    );
  }
}
