import { statField } from "./data.mjs";

export class WTSkillData extends foundry.abstract.DataModel {
  /** @override */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      notes: new fields.HTMLField(),
      primaryStat: statField(),
      pointsPerDie: new fields.NumberField({
        required: true,
        initial: 1,
        min: 0,
      }),
    };
  }
}
