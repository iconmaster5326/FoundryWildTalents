import { rollField, bodyPartField } from "./data.mjs";

export class WTArchetypeData extends foundry.abstract.DataModel {
  /** @override */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      notes: new fields.HTMLField(),
      sources: new fields.ArrayField(
        new fields.SchemaField({
          id: new fields.StringField(), // ID of metaquality
        })
      ),
      permissions: new fields.ArrayField(
        new fields.SchemaField({
          id: new fields.StringField(), // ID of metaquality
          condition: new fields.StringField(),
        })
      ),
      intrinsics: new fields.ArrayField(
        new fields.SchemaField({
          id: new fields.StringField(), // ID of metaquality
          condition: new fields.StringField(),
          minMultibuyAmount: new fields.NumberField({
            required: true,
            initial: 1,
            integer: true,
            min: 1,
          }),
        })
      ),
      hyperstats: new fields.ArrayField(
        new fields.SchemaField({
          id: new fields.StringField(), // ID of power
          minDice: rollField(),
        })
      ),
      hyperskills: new fields.ArrayField(
        new fields.SchemaField({
          id: new fields.StringField(), // ID of power
          minDice: rollField(),
        })
      ),
      miracles: new fields.ArrayField(
        new fields.SchemaField({
          id: new fields.StringField(), // ID of power
          minDice: rollField(),
        })
      ),
      customSilhouette: new fields.BooleanField({ initial: false }),
      silhouette: new fields.ArrayField(bodyPartField()),
    };
  }
}
