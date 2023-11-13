import { WTCharacterData } from "./data/WTCharacter.mjs";
import { WTCharacterSheet } from "./sheets/WTCharacterSheet.mjs";
import { WTSkillData } from "./data/WTSkill.mjs";
import { WTSkillSheet } from "./sheets/WTSkillSheet.mjs";
import { WTArchetypeData } from "./data/WTArchetype.mjs";
import { WTExtraData } from "./data/WTExtra.mjs";
import { WTFocusData } from "./data/WTFocus.mjs";
import { WTMetaQualityData } from "./data/WTMetaQuality.mjs";
import { WTPowerData } from "./data/WTPower.mjs";
import { WTArchetypeSheet } from "./sheets/WTArchetypeSheet.mjs";
import { WTMetaQualitySheet } from "./sheets/WTMetaQualitySheet.mjs";
import { WTPowerSheet } from "./sheets/WTPowerSheet.mjs";
import { WTExtraSheet } from "./sheets/WTExtraSheet.mjs";
import { WTFocusSheet } from "./sheets/WTFocusSheet.mjs";
import {
  OREDie,
  OREDieSet,
  ORERoll,
  ORE_DIE_TYPES,
  ORE_DIE_TYPE_EXPERT,
  ORE_DIE_TYPE_NORMAL,
  ORE_DIE_TYPE_WIGGLE,
} from "./rolls/ORERoll.mjs";

Hooks.once("init", async function () {
  CONFIG.Actor.dataModels.character = WTCharacterData;
  CONFIG.Item.dataModels.skill = WTSkillData;
  CONFIG.Item.dataModels.archetype = WTArchetypeData;
  CONFIG.Item.dataModels.extra = WTExtraData;
  CONFIG.Item.dataModels.focus = WTFocusData;
  CONFIG.Item.dataModels.metaquality = WTMetaQualityData;
  CONFIG.Item.dataModels.power = WTPowerData;

  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("wildtalents-character", WTCharacterSheet, {
    types: ["character"],
    makeDefault: true,
    label: game.i18n.localize("WT.Sheet.Character"),
  });

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("wildtalents-skill", WTSkillSheet, {
    types: ["skill"],
    makeDefault: true,
    label: game.i18n.localize("WT.Sheet.Skill"),
  });
  Items.registerSheet("wildtalents-archetype", WTArchetypeSheet, {
    types: ["archetype"],
    makeDefault: true,
    label: game.i18n.localize("WT.Sheet.Archetype"),
  });
  Items.registerSheet("wildtalents-metaquality", WTMetaQualitySheet, {
    types: ["metaquality"],
    makeDefault: true,
    label: game.i18n.localize("WT.Sheet.MetaQuality"),
  });
  Items.registerSheet("wildtalents-power", WTPowerSheet, {
    types: ["power"],
    makeDefault: true,
    label: game.i18n.localize("WT.Sheet.Power"),
  });
  Items.registerSheet("wildtalents-extra", WTExtraSheet, {
    types: ["extra"],
    makeDefault: true,
    label: game.i18n.localize("WT.Sheet.Extra"),
  });
  Items.registerSheet("wildtalents-focus", WTFocusSheet, {
    types: ["focus"],
    makeDefault: true,
    label: game.i18n.localize("WT.Sheet.Focus"),
  });

  Handlebars.registerHelper("eq", function (a, b) {
    return a == b;
  });
  Handlebars.registerHelper("ne", function (a, b) {
    return a != b;
  });
  Handlebars.registerHelper("enrich", function (t) {
    return TextEditor.enrichHTML(t, { async: false });
  });
  Handlebars.registerHelper("dieTypeLetter", function (t) {
    return game.i18n.localize(ORE_DIE_TYPES[t].name + "Letter");
  });

  const TEMPLATE_PARTS = "systems/wildtalents/templates/parts/";
  await loadTemplates([
    TEMPLATE_PARTS + "silhouette.hbs",
    TEMPLATE_PARTS + "die.hbs",
  ]);

  // monkey patch ChatLog._contextMenu for ORE roll messages
  ChatLog.prototype._contextMenu = function (html) {
    ContextMenu.create(
      this,
      html,
      ".message:not(:has(.ore-roll-chat-message))",
      this._getEntryContextOptions()
    );
    ContextMenu.create(
      this,
      html,
      ".message:has(.ore-roll-chat-message):not(:has(.die:hover))",
      [
        {
          name: "Refresh",
          icon: "",
          condition: (messageHTML) => true,
          callback: async (messageHTML) => {
            const message = game.messages.get(messageHTML.data("messageId"));
            const roll = ORERoll.fromRollFlavor(message.rolls[0]);
            ORERoll.fromDice(roll.dice).rerenderChatMessage(message);
          },
        },
        ...this._getEntryContextOptions(),
      ]
    );
  };
});

const ASSETS = "systems/wildtalents/assets/";
const DEFAULT_ICON_EXT = ".png";
const ITEM_TYPES = [
  "skill",
  "archetype",
  "metaquality",
  "power",
  "focus",
  "extra",
];

Hooks.on("preCreateItem", function (item, data, options, itemID) {
  if (data.img || ITEM_TYPES.indexOf(data.type) == -1) return;
  item.updateSource({
    img: ASSETS + "default-icons/" + data.type + DEFAULT_ICON_EXT,
  });
});

Hooks.on("renderChatMessage", async function (message, html, data) {
  if (html.find(".ore-roll-chat-message").length) {
    const roll = ORERoll.fromRollFlavor(message.rolls[0]);

    const setValueOptions = [];
    for (var i = 1; i <= 10; i++) {
      const i_ = i;
      setValueOptions.push({
        name: "Set to @FACE@".replace("@FACE@", i),
        icon: "",
        condition: (dieJQ) => {
          const die = roll.getDieFromJQ(dieJQ);
          if (die.type == ORE_DIE_TYPE_WIGGLE) {
            return !!roll.looseDice.find((d) => d.face == i_);
          }
          return false;
        },
        callback: async (dieJQ) => {
          const die = roll.getDieFromJQ(dieJQ);
          die.face = i_;
          roll.rerenderChatMessage(message);
        },
      });
    }

    const moveToSetOptions = [];
    for (var i = 0; i < roll.sets.length; i++) {
      const i_ = i;
      const set = roll.sets[i];
      moveToSetOptions.push({
        name: "Move to set @SET@ (@W@x@H@)"
          .replace("@SET@", i + 1)
          .replace("@W@", set.width)
          .replace("@H@", set.height),
        icon: "",
        condition: (dieJQ) => {
          const die = roll.getDieFromJQ(dieJQ);
          return !set.includes(die);
        },
        callback: async (dieJQ) => {
          const die = roll.popDieFromJQ(dieJQ);
          if (die.type == ORE_DIE_TYPE_WIGGLE) {
            die.face = set.height;
          }
          set.push(die);
          roll.rerenderChatMessage(message);
        },
      });
    }

    ContextMenu.create(
      message.sheet,
      html.find(".ore-roll-chat-message"),
      ".die",
      [
        ...moveToSetOptions,
        ...setValueOptions,
        {
          name: "Remove from set",
          icon: "",
          condition: (dieJQ) => {
            const die = roll.getDieFromJQ(dieJQ);
            return !roll.looseDice.includes(die);
          },
          callback: async (dieJQ) => {
            const die = roll.popDieFromJQ(dieJQ);
            roll.looseDice.push(die);
            roll.rerenderChatMessage(message);
          },
        },
        {
          name: "Move to new set",
          icon: "",
          condition: (dieJQ) => {
            return true;
          },
          callback: async (dieJQ) => {
            const die = roll.popDieFromJQ(dieJQ);
            roll.sets.push(new OREDieSet(die));
            roll.rerenderChatMessage(message);
          },
        },
        {
          name: "Disband set",
          icon: "",
          condition: (dieJQ) => {
            const die = roll.getDieFromJQ(dieJQ);
            return !roll.looseDice.includes(die);
          },
          callback: async (dieJQ) => {
            const set = roll.sets.splice(OREDie.jqInfo(dieJQ).index1, 1)[0];
            for (const die of set) {
              roll.looseDice.push(die);
            }
            roll.rerenderChatMessage(message);
          },
        },
        {
          name: "Set face...",
          icon: "",
          condition: (dieJQ) => {
            const die = roll.getDieFromJQ(dieJQ);
            return (
              die.type == ORE_DIE_TYPE_WIGGLE || die.type == ORE_DIE_TYPE_EXPERT
            );
          },
          callback: async (dieJQ) => {
            const die = roll.getDieFromJQ(dieJQ);
            // TODO
            roll.rerenderChatMessage(message);
          },
        },
        {
          name: "Reroll die",
          icon: "",
          condition: (dieJQ) => {
            const die = roll.getDieFromJQ(dieJQ);
            return die.type == ORE_DIE_TYPE_NORMAL;
          },
          callback: async (dieJQ) => {
            const die = roll.getDieFromJQ(dieJQ);
            die.face = (await new Roll("1d10").evaluate()).total;
            roll.rerenderChatMessage(message);
          },
        },
      ]
    );
  }
});

// CONFIG.debug.hooks = true;
