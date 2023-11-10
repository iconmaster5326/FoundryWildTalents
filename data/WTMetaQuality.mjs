import { META_QUALITY_TYPES } from "../util.mjs";

export class WTMetaQualityData extends foundry.abstract.DataModel {
  /** @override */
  static defineSchema() {
    const fields = foundry.data.fields;
    const mqtChoices = {};
    for (var i = 0; i < META_QUALITY_TYPES.length; i++) {
      const mqt = META_QUALITY_TYPES[i];
      mqtChoices[i] = mqt.name;
    }
    return {
      notes: new fields.HTMLField(),
      metaQualityType: new fields.NumberField({
        required: true,
        initial: 0, // source
        choices: mqtChoices,
      }),
      pointCost: new fields.NumberField({
        required: true,
        initial: 1,
      }),
      multibuy: new fields.BooleanField({ initial: false }),
      requiresCondition: new fields.BooleanField({ initial: false }),
    };
  }
}
