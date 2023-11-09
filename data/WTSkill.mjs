import { STATS } from "../util.mjs";

export class WTSkillData extends foundry.abstract.DataModel {
  /** @override */
  static defineSchema() {
    const fields = foundry.data.fields;
    const statChoices = {};
    for (var i = 0; i < STATS.length; i++) {
      const stat = STATS[i];
      statChoices[i] = stat.name;
    }
    return {
      notes: new fields.HTMLField(),
      primaryStat: new fields.NumberField({
        required: true,
        initial: 0,
        integer: true,
        choices: statChoices,
      }),
      pointsPerDie: new fields.NumberField({
        required: true,
        initial: 1,
        min: 0,
      }),
    };
  }
}
