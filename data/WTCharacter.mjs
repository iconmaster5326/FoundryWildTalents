import { OREDice } from "../rolls/OREDice.mjs";
import { DEFAULT_SILHOUETTE, STATS } from "../util.mjs";
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
      silhouette: new fields.ArrayField(bodyPartField(true), {
        required: true,
        initial: DEFAULT_SILHOUETTE,
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

  updateProvidedAbilities(actor, systemArchetypes, systemFoci) {
    console.log("Updating provided abilities for " + actor.id);
    const archetypes = systemArchetypes
      .map((id) => Item.get(id))
      .filter((x) => x);
    const foci = systemFoci.map((id) => Item.get(id)).filter((x) => x);
    // gather data for provided abilities
    const existingData = {};
    for (const x of this.sources
      .concat(this.permissions)
      .concat(this.intrinsics)
      .concat(this.hyperstats)
      .concat(this.hyperskills)
      .concat(this.miracles)
      .filter((x) => x.providedBy)) {
      const key = x.providedBy + "." + x.id;
      existingData[key] = (existingData[key] ?? []) + [x];
    }
    // add the provided abilities back
    const newSources = [];
    for (const archetype of archetypes) {
      for (const x of archetype.system.sources) {
        const result = { id: x.id, providedBy: archetype.id };
        const key = archetype.id + "." + x.id;
        if (existingData[key]) {
          const existing = existingData[key][0];
          existingData[key] = existing.slice(1);
        }
        newSources.push(result);
      }
    }
    const newPermissions = [];
    for (const archetype of archetypes) {
      for (const x of archetype.system.permissions) {
        const result = {
          id: x.id,
          providedBy: archetype.id,
          condition: x.condition,
        };
        const key = archetype.id + "." + x.id;
        if (existingData[key]) {
          const existing = existingData[key][0];
          existingData[key] = existing.slice(1);
          result.condition = existing.condition ?? result.condition;
        }
        newPermissions.push(result);
      }
    }
    const newIntrinsics = [];
    for (const archetype of archetypes) {
      for (const x of archetype.system.intrinsics) {
        const result = {
          id: x.id,
          providedBy: archetype.id,
          condition: x.condition,
          multibuyAmount: x.minMultibuyAmount,
        };
        const key = archetype.id + "." + x.id;
        if (existingData[key]) {
          const existing = existingData[key][0];
          existingData[key] = existing.slice(1);
          result.condition = existing.condition ?? result.condition;
          result.multibuyAmount =
            existing.multibuyAmount ?? result.multibuyAmount;
        }
        newIntrinsics.push(result);
      }
    }
    const newHyperstats = [];
    for (const powerSource of archetypes.concat(foci)) {
      for (const x of powerSource.system.hyperstats) {
        const result = {
          id: x.id,
          providedBy: powerSource.id,
          dice: x.minDice,
        };
        const key = powerSource.id + "." + x.id;
        if (existingData[key]) {
          const existing = existingData[key][0];
          existingData[key] = existing.slice(1);
          result.dice = existing.dice ?? result.dice;
        }
        newHyperstats.push(result);
      }
    }
    const newHyperskills = [];
    for (const powerSource of archetypes.concat(foci)) {
      for (const x of powerSource.system.hyperskills) {
        const result = {
          id: x.id,
          providedBy: powerSource.id,
          dice: x.minDice,
        };
        const key = powerSource.id + "." + x.id;
        if (existingData[key]) {
          const existing = existingData[key][0];
          existingData[key] = existing.slice(1);
          result.dice = existing.dice ?? result.dice;
        }
        newHyperskills.push(result);
      }
    }
    const newMiracles = [];
    for (const powerSource of archetypes.concat(foci)) {
      for (const x of powerSource.system.miracles) {
        const result = {
          id: x.id,
          providedBy: powerSource.id,
          dice: x.minDice,
        };
        const key = powerSource.id + "." + x.id;
        if (existingData[key]) {
          const existing = existingData[key][0];
          existingData[key] = existing.slice(1);
          result.dice = existing.dice ?? result.dice;
        }
        newMiracles.push(result);
      }
    }
    // add the normal abilities back
    newSources.push(...this.sources.filter((x) => !x.providedBy));
    newPermissions.push(...this.permissions.filter((x) => !x.providedBy));
    newIntrinsics.push(...this.intrinsics.filter((x) => !x.providedBy));
    newHyperstats.push(...this.hyperstats.filter((x) => !x.providedBy));
    newHyperskills.push(...this.hyperskills.filter((x) => !x.providedBy));
    newMiracles.push(...this.miracles.filter((x) => !x.providedBy));
    // update the document
    actor.update({
      "system.sources": newSources,
      "system.permissions": newPermissions,
      "system.intrinsics": newIntrinsics,
      "system.hyperstats": newHyperstats,
      "system.hyperskills": newHyperskills,
      "system.miracles": newMiracles,
    });
  }

  get initiative() {
    return -OREDice.fromString(this.stats.sense).size;
  }

  powerPointsPerDie(actor, powerInstance) {
    const lookup = (id) =>
      Item.get(id) || actor.getEmbeddedDocument("Item", id);

    if (powerInstance.providedBy) {
      const item = lookup(powerInstance.providedBy);
      return item.system.powerPointsPerDie(item, powerInstance);
    } else {
      return lookup(powerInstance.id).system.pointsPerDie;
    }
  }
}
