import { STATS } from "../util.mjs";

const fields = foundry.data.fields;

function validateORERoll(s) {
  return true;
}

function validateHitLocations(s) {
  return true;
}

export function rollField(options = {}) {
  return new fields.StringField({
    required: true,
    initial: "1d",
    validate: validateORERoll,
    ...options,
  });
}

export function bodyPartField(options = {}) {
  return new fields.SchemaField({
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
    ...options,
  });
}

const statChoices = {};
for (var i = 0; i < STATS.length; i++) {
  const stat = STATS[i];
  statChoices[i] = stat.name;
}

export function statField(options = {}) {
  return new fields.NumberField({
    required: true,
    initial: 0,
    integer: true,
    choices: statChoices,
    ...options,
  });
}
