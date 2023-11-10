export class WTExtraData extends foundry.abstract.DataModel {
  /** @override */
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      notes: new fields.HTMLField(),
      pointCost: new fields.NumberField({ required: true, initial: 0 }),
      multibuy: new fields.BooleanField({initial: false}),
      requiresCapacity: new fields.BooleanField({initial: false}),
      requiresCondition: new fields.BooleanField({initial: false}),
    };
  }
}
