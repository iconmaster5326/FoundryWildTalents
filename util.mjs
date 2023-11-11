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
  { name: "WT.PowerType.Hyperstat", field: "hyperstats" },
  { name: "WT.PowerType.Hyperskill", field: "hyperskills" },
  { name: "WT.PowerType.Miracle", field: "miracles" },
];

export const QUALITY_TYPES = [
  { name: "WT.PowerQuality.Attacks" },
  { name: "WT.PowerQuality.Defends" },
  { name: "WT.PowerQuality.Useful" },
];

export const CAPACITY_TYPES = [
  { name: "WT.PowerCapacity.Mass", field: "mass" },
  { name: "WT.PowerCapacity.Range", field: "range" },
  { name: "WT.PowerCapacity.Speed", field: "speed" },
  { name: "WT.PowerCapacity.Touch", field: "touch" },
  { name: "WT.PowerCapacity.Self", field: "self" },
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
