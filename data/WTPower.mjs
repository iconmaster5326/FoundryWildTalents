import { CAPACITY_TYPES, POWER_TYPES } from "../util.mjs";

export class WTPowerData extends foundry.abstract.DataModel {
  /** @override */
  static defineSchema() {
    const fields = foundry.data.fields;
    const ptChoices = {};
    for (var i = 0; i < POWER_TYPES.length; i++) {
      const pt = POWER_TYPES[i];
      ptChoices[i] = pt.name;
    }
    const pcChoices = {};
    for (var i = 0; i < CAPACITY_TYPES.length; i++) {
      const pc = CAPACITY_TYPES[i];
      pcChoices[i] = pc.name;
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
          extras: new fields.ArrayField(
            new fields.SchemaField({
              id: new fields.StringField(), // ID of extra
              multibuyAmount: new fields.NumberField({
                required: true,
                initial: 1,
                integer: true,
                min: 1,
              }),
              capacity: new fields.NumberField({
                required: true,
                initial: 0, // mass
                choices: pcChoices,
              }),
              condition: new fields.StringField(),
            })
          ),
          notes: new fields.StringField(),
        })
      ),
    };
  }
}
