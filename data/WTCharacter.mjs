import { STATS } from "../util.mjs";
import { bodyPartField, rollField } from "./data.mjs";

export class WTCharacterData extends foundry.abstract.DataModel {
  /** @override */
  static defineSchema() {
    const fields = foundry.data.fields;
    const statsFields = {};
    for (var i = 0; i < STATS.length; i++) {
      const stat = STATS[i];
      statsFields[stat.field] = rollField();
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
          id: new fields.StringField(), // ID of skill
          dice: rollField(),
          specialty: new fields.StringField(),
        })
      ),
      silhouette: new fields.ArrayField(bodyPartField(), {
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
      }),
      archetypes: new fields.ArrayField(new fields.StringField()), // IDs of archetypes
      sources: new fields.ArrayField(
        new fields.SchemaField({
          id: new fields.StringField(), // ID of metaquality
          providedBy: new fields.StringField(), // ID of archetype; optional
        })
      ),
      permissions: new fields.ArrayField(
        new fields.SchemaField({
          id: new fields.StringField(), // ID of metaquality
          condition: new fields.StringField(),
          providedBy: new fields.StringField(), // ID of archetype; optional
        })
      ),
      intrinsics: new fields.ArrayField(
        new fields.SchemaField({
          id: new fields.StringField(), // ID of metaquality
          condition: new fields.StringField(),
          providedBy: new fields.StringField(), // ID of archetype; optional
          multibuyAmount: new fields.NumberField({
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
          dice: rollField(),
          providedBy: new fields.StringField(), // ID of focus/archetype; optional
        })
      ),
      hyperskills: new fields.ArrayField(
        new fields.SchemaField({
          id: new fields.StringField(), // ID of power
          dice: rollField(),
          providedBy: new fields.StringField(), // ID of focus/archetype; optional
        })
      ),
      miracles: new fields.ArrayField(
        new fields.SchemaField({
          id: new fields.StringField(), // ID of power
          dice: rollField(),
          providedBy: new fields.StringField(), // ID of focus/archetype; optional
        })
      ),
      foci: new fields.ArrayField(new fields.StringField()), // ID of focus
    };
  }
}
