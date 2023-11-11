import { CAPACITY_TYPES, STATS } from "../util.mjs";

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

export function bodyPartField(useDamage, options = {}) {
  return new fields.SchemaField(
    {
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
      ...(useDamage
        ? {
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
          }
        : {}),
    },
    options
  );
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

const pcChoices = {};
for (var i = 0; i < CAPACITY_TYPES.length; i++) {
  const pc = CAPACITY_TYPES[i];
  pcChoices[i] = pc.name;
}

export function powerCapacityField(options = {}) {
  return new fields.NumberField({
    required: true,
    initial: 0, // mass
    choices: pcChoices,
    ...options,
  });
}

export function extraInstanceField(options = {}) {
  return new fields.SchemaField(
    {
      id: new fields.StringField(), // ID of extra
      multibuyAmount: new fields.NumberField({
        required: true,
        initial: 1,
        integer: true,
        min: 1,
      }),
      capacity: powerCapacityField(),
      condition: new fields.StringField(),
    },
    options
  );
}
