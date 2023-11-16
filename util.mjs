export const STATS = [
  { name: "WT.Stat.Body", field: "body" },
  { name: "WT.Stat.Coordination", field: "coordination" },
  { name: "WT.Stat.Sense", field: "sense" },
  { name: "WT.Stat.Mind", field: "mind" },
  { name: "WT.Stat.Charm", field: "charm" },
  { name: "WT.Stat.Command", field: "command" },
];

export const META_QUALITY_TYPES = [
  { name: "WT.MetaQualityType.Source", field: "sources" },
  { name: "WT.MetaQualityType.Permission", field: "permissions" },
  { name: "WT.MetaQualityType.Intrinsic", field: "intrinsics" },
];

export const POWER_TYPES = [
  { name: "WT.PowerType.Hyperstat", field: "hyperstats", cost: 4 },
  { name: "WT.PowerType.Hyperskill", field: "hyperskills", cost: 1 },
  { name: "WT.PowerType.Miracle", field: "miracles", cost: 0 },
];

export const QUALITY_TYPES = [
  { name: "WT.PowerQuality.Attacks" },
  { name: "WT.PowerQuality.Defends" },
  { name: "WT.PowerQuality.Useful" },
];

export const CAPACITY_TYPES = [
  { name: "WT.PowerCapacity.Mass", field: "mass", cost: 2 },
  { name: "WT.PowerCapacity.Range", field: "range", cost: 2 },
  { name: "WT.PowerCapacity.Speed", field: "speed", cost: 2 },
  { name: "WT.PowerCapacity.Touch", field: "touch", cost: 1 },
  { name: "WT.PowerCapacity.Self", field: "self", cost: 1 },
];

export const MINION_RATINGS = [
  { name: "WT.MinionRating.Rabble", command: 8, skill: 10, demoralization: 2 },
  { name: "WT.MinionRating.Trained", command: 6, skill: 8, demoralization: 4 },
  {
    name: "WT.MinionRating.Professional",
    command: 4,
    skill: 6,
    demoralization: 6,
  },
  { name: "WT.MinionRating.Expert", command: 2, skill: 3, demoralization: 8 },
];

export const DAMAGE_TYPES = [
  { name: "WT.DamageType.Shock" },
  { name: "WT.DamageType.Killing" },
  { name: "WT.DamageType.ShockKilling" },
];

export const DEFAULT_SILHOUETTE = [
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
];

function firstOneIsFree(caplist) {
  const result = { ...caplist };
  for (const ct of CAPACITY_TYPES) {
    if (result[ct.field]) {
      result[ct.field] = false;
      return result;
    }
  }
  return result;
}

export function qualityPointsPerDie(quality) {
  const caplist = firstOneIsFree(quality.capacities);
  return Math.max(
    1,
    2 +
      quality.level +
      Object.keys(caplist).reduce(
        (a, v) =>
          a + caplist[v] * CAPACITY_TYPES.find((ct) => ct.field == v).cost,
        0
      ) +
      quality.extras.reduce((a, v) => a + extraPointsPerDie(v), 0)
  );
}

export function extraPointsPerDie(extraInstance) {
  return (
    Item.get(extraInstance.id).system.pointCost * extraInstance.multibuyAmount
  );
}

export async function lookupItem(actor, id) {
  const item = Item.get(id);
  if (item) {
    return item;
  }
  if (actor) {
    try {
      const doc = actor.getEmbeddedDocument("Item", id);
      if (doc) return doc;
    } catch (_) {
      // do nothing
    }
  }
  try {
    return (await game.packs.getDocuments())
      .map((p) => p.getEmbeddedDocument("Item", id))
      .find((d) => d);
  } catch (_) {
    // do nothing
  }
  return null;
}
