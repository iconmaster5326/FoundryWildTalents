import { CAPACITY_TYPES, POWER_TYPES } from "../util.mjs";
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
      skill: new fields.StringField(), // ID of skill; only used if hyperskill
      qualities: new fields.ArrayField(
        new fields.SchemaField({
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
}
