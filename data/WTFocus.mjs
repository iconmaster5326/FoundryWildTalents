export class WTFocusData extends foundry.abstract.DataModel {
  /** @override */
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      notes: new fields.HTMLField(),
      hyperstats: new fields.ArrayField(
        new fields.SchemaField({
          id: new fields.StringField(), // ID of power
          dice: rollField(),
        })
      ),
      hyperskills: new fields.ArrayField(
        new fields.SchemaField({
          id: new fields.StringField(), // ID of power
          dice: rollField(),
        })
      ),
      miracles: new fields.ArrayField(
        new fields.SchemaField({
          id: new fields.StringField(), // ID of power
          dice: rollField(),
        })
      ),
    };
  }
}