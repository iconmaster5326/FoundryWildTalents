import { OREDice } from "../rolls/OREDice.mjs";
import {
  POWER_TYPES,
  extraPointsPerDie,
  qualityPointsPerDie,
} from "../util.mjs";
import { extraInstanceField, rollField } from "./data.mjs";

export class WTFocusData extends foundry.abstract.DataModel {
  /** @override */
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      notes: new fields.HTMLField(),
      extras: new fields.ArrayField(extraInstanceField()),
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

  get pointCost() {
    return (
      this.hyperstats.reduce(
        (a, v) =>
          a +
          this.powerPointsPerDie(null, v) *
            OREDice.fromString(v.dice).pointCost,
        0
      ) +
      this.hyperskills.reduce(
        (a, v) =>
          a +
          this.powerPointsPerDie(null, v) *
            OREDice.fromString(v.dice).pointCost,
        0
      ) +
      this.miracles.reduce(
        (a, v) =>
          a +
          this.powerPointsPerDie(null, v) *
            OREDice.fromString(v.dice).pointCost,
        0
      )
    );
  }

  get pointsPerDieModifier() {
    return this.extras.reduce((a, v) => a + extraPointsPerDie(v), -1);
  }

  powerPointsPerDie(item, powerInstance) {
    const power = Item.get(powerInstance.id);
    return (
      POWER_TYPES[power.system.powerType].cost +
      power.system.qualities.reduce(
        (a, v) =>
          a + Math.max(1, qualityPointsPerDie(v) + this.pointsPerDieModifier),
        0
      )
    );
  }
}
