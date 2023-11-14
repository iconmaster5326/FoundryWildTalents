import {
  CAPACITY_TYPES,
  POWER_TYPES,
  QUALITY_TYPES,
  qualityPointsPerDie,
} from "../util.mjs";
import { extraInstanceField, statField } from "./data.mjs";

export class WTPowerData extends foundry.abstract.DataModel {
  /** @override */
  static defineSchema() {
    const fields = foundry.data.fields;

    const ptChoices = {};
    for (var i = 0; i < POWER_TYPES.length; i++) {
      const pt = POWER_TYPES[i];
      ptChoices[i] = pt.name;
    }

    const qtChoices = {};
    for (var i = 0; i < QUALITY_TYPES.length; i++) {
      const pt = QUALITY_TYPES[i];
      qtChoices[i] = pt.name;
    }

    const capacities = {};
    for (var i = 0; i < CAPACITY_TYPES.length; i++) {
      const pc = CAPACITY_TYPES[i];
      capacities[pc.field] = new fields.BooleanField({ initial: false });
    }

    return {
      notes: new fields.HTMLField(),
      powerType: new fields.NumberField({
        required: true,
        initial: 2, // miracle
        choices: ptChoices,
      }),
      stat: statField(), // only used if hyperstat
      skill: new fields.SchemaField({
        // only used if hyperskill
        id: new fields.StringField(), // ID of skill
        specialty: new fields.StringField(),
      }),
      qualities: new fields.ArrayField(
        new fields.SchemaField({
          qualityType: new fields.NumberField({
            required: true,
            initial: 0, // attacks
            choices: qtChoices,
          }),
          name: new fields.StringField({ required: true, initial: "" }),
          level: new fields.NumberField({
            required: true,
            initial: 0,
            integer: true,
            min: 0,
          }),
          capacities: new fields.SchemaField(capacities),
          extras: new fields.ArrayField(extraInstanceField()),
          notes: new fields.StringField(),
        })
      ),
    };
  }

  get pointsPerDie() {
    return (
      POWER_TYPES[this.powerType].cost +
      this.qualities.reduce((a, v) => a + qualityPointsPerDie(v), 0)
    );
  }
}
