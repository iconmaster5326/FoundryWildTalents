import { validateORERoll, STATS } from "../util.mjs";

function validateHitLocations(s) {
  return true;
}

export class WTCharacterData extends foundry.abstract.DataModel {
  /** @override */
  static defineSchema() {
    const fields = foundry.data.fields;
    const statsFields = {};
    for (var i = 0; i < STATS.length; i++) {
      const stat = STATS[i];
      statsFields[stat.field] = new fields.StringField({
        required: true,
        initial: "1d",
        validate: validateORERoll,
      });
    }
    return {
      appearence: new fields.HTMLField(),
      notes: new fields.HTMLField(),
      pointTotal: new fields.NumberField({
        required: true,
        initial: 0,
        min: 0,
      }),
      xp: new fields.NumberField({
        required: true,
        initial: 0,
        min: 0,
      }),
      willpower: new fields.NumberField({
        required: true,
        initial: 0,
        integer: true,
        min: 0,
      }),
      baseWill: new fields.NumberField({
        required: true,
        initial: 0,
        integer: true,
        min: 0,
      }),
      convictions: new fields.ArrayField(
        new fields.SchemaField({
          phrase: new fields.StringField({ required: true }),
          amount: new fields.NumberField({
            required: true,
            initial: 1,
            integer: true,
            min: 0,
          }),
        })
      ),
      stats: new fields.SchemaField(statsFields, { required: true }),
      skills: new fields.ArrayField(
        new fields.SchemaField({
          skill: new fields.StringField(Item),
          value: new fields.StringField({
            required: true,
            initial: "1d",
            validate: validateORERoll,
          }),
        })
      ),
      silhouette: new fields.ArrayField(
        new fields.SchemaField({
          hitLocations: new fields.StringField({
            required: true,
            initial: "",
            validate: validateHitLocations,
          }),
          name: new fields.StringField({
            required: true,
            initial: "",
          }),
          boxes: new fields.NumberField({
            required: true,
            initial: 1,
            integer: true,
            min: 1,
          }),
          important: new fields.BooleanField({
            required: true,
            initial: false,
          }),
          brainBoxes: new fields.NumberField({
            required: true,
            initial: 0,
            integer: true,
            min: 0,
          }),
          shockDamage: new fields.NumberField({
            required: true,
            initial: 0,
            integer: true,
            min: 0,
          }),
          killingDamage: new fields.NumberField({
            required: true,
            initial: 0,
            integer: true,
            min: 0,
          }),
        }),
        {
          required: true,
          initial: [
            { hitLocations: "1", name: "Left Leg", boxes: 5 },
            { hitLocations: "2", name: "Right Leg", boxes: 5 },
            { hitLocations: "3,4", name: "Left Arm", boxes: 5 },
            { hitLocations: "5,6", name: "Right Arm", boxes: 5 },
            {
              hitLocations: "7-9",
              name: "Torso",
              boxes: 10,
              important: true,
            },
            { hitLocations: "10", name: "Head", boxes: 4, brainBoxes: 4 },
          ],
        }
      ),
    };
  }
}
