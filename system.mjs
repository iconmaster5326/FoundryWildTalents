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
import { ORESetFaceDialog } from "./sheets/ORESetFaceDIalog.mjs";
import {
  QUALITY_TYPES,
  STATS,
  extraPointsPerDie,
  qualityPointsPerDie,
} from "./util.mjs";
import { WTMinionSheet } from "./sheets/WTMinionSheet.mjs";
import { WTMinionData } from "./data/WTMinion.mjs";
import { ORERollDialog, parseEDFs } from "./sheets/ORERollDialog.mjs";
import { OREDice } from "./rolls/OREDice.mjs";

Hooks.once("init", async function () {
  CONFIG.Actor.dataModels.character = WTCharacterData;
  CONFIG.Actor.dataModels.npc = WTCharacterData;
  CONFIG.Actor.dataModels.minion = WTMinionData;
  CONFIG.Item.dataModels.skill = WTSkillData;
  CONFIG.Item.dataModels.archetype = WTArchetypeData;
  CONFIG.Item.dataModels.extra = WTExtraData;
  CONFIG.Item.dataModels.focus = WTFocusData;
  CONFIG.Item.dataModels.metaquality = WTMetaQualityData;
  CONFIG.Item.dataModels.power = WTPowerData;

  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("wildtalents-character", WTCharacterSheet, {
    types: ["character", "npc"],
    makeDefault: true,
    label: game.i18n.localize("WT.Sheet.Character"),
  });
  Actors.registerSheet("wildtalents-minion", WTMinionSheet, {
    types: ["minion"],
    makeDefault: true,
    label: game.i18n.localize("WT.Sheet.Minion"),
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
  Handlebars.registerHelper("dieIsGobbled", function (roll, die) {
    return roll.isGobbled(die);
  });
  Handlebars.registerHelper("qualityTypeLetter", function (t) {
    return game.i18n.localize(QUALITY_TYPES[t].name + "Letter");
  });
  Handlebars.registerHelper("powerPtsPerDie", function (char, powerInstance) {
    return char.system.powerPointsPerDie(char, powerInstance);
  });
  Handlebars.registerHelper("qualityPtsPerDie", qualityPointsPerDie);
  Handlebars.registerHelper("extraPtsPerDie", extraPointsPerDie);
  Handlebars.registerHelper("localizeUnit", function (unit, x) {
    return game.i18n.localize("WT.Unit." + unit).replace("@X@", x);
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

    const isMessageOurs = (messageHTML) => {
      return (
        game.user.isGM ||
        game.messages.get(messageHTML.data("messageId")).user.id == game.user.id
      );
    };
    ContextMenu.create(
      this,
      html,
      ".message:has(.ore-roll-chat-message):not(:has(.die:hover))",
      [
        {
          name: game.i18n.localize("WT.Dialog.Refresh"),
          icon: "",
          condition: isMessageOurs,
          callback: async (messageHTML) => {
            const message = game.messages.get(messageHTML.data("messageId"));
            const roll = ORERoll.fromRollFlavor(message.rolls[0]);
            ORERoll.fromDice(roll.dice, {
              gobbled: roll.gobbled,
              minHeight: roll.minHeight,
              minWidth: roll.minWidth,
              flavor: roll.flavor,
            }).rerenderChatMessage(message);
          },
        },
        {
          name: game.i18n.localize("WT.Dialog.GobbleOne"),
          icon: "",
          condition: isMessageOurs,
          callback: async (messageHTML) => {
            const message = game.messages.get(messageHTML.data("messageId"));
            const roll = ORERoll.fromRollFlavor(message.rolls[0]);
            roll.gobble(1);
            roll.rerenderChatMessage(message);
          },
        },
        {
          name: game.i18n.localize("WT.Dialog.UngobbleOne"),
          icon: "",
          condition: isMessageOurs,
          callback: async (messageHTML) => {
            const message = game.messages.get(messageHTML.data("messageId"));
            const roll = ORERoll.fromRollFlavor(message.rolls[0]);
            roll.gobble(-1);
            roll.rerenderChatMessage(message);
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

Hooks.on("preCreateActor", function (actor, data, options, actorID) {
  if (data.type == "character") {
    actor.updateSource({
      "prototypeToken.actorLink": true,
    });
  }
});

Hooks.on("preCreateItem", function (item, data, options, itemID) {
  if (data.img || ITEM_TYPES.indexOf(data.type) == -1) return;
  item.updateSource({
    img: ASSETS + "default-icons/" + data.type + DEFAULT_ICON_EXT,
  });
});

Hooks.on("renderChatMessage", async function (message, html, data) {
  if (html.find(".ore-roll-chat-message").length) {
    const roll = ORERoll.fromRollFlavor(message.rolls[0]);

    const isMessageOurs = (dieJQ) => {
      return (
        game.user.isGM ||
        game.messages.get(dieJQ.parents(".message").data("messageId"))
          .user.id == game.user.id
      );
    };

    const setValueOptions = [];
    for (var i = 1; i <= 10; i++) {
      const i_ = i;
      setValueOptions.push({
        name: game.i18n.localize("WT.Dialog.SetFace").replace("@FACE@", i),
        icon: "",
        condition: (dieJQ) => {
          if (!isMessageOurs(dieJQ)) return false;
          const die = roll.getDieFromJQ(dieJQ);
          if (die.face == i_) {
            return false;
          }
          if (die.type == ORE_DIE_TYPE_WIGGLE) {
            for (const set of roll.sets) {
              if (set.includes(die)) {
                return set.height == i_;
              }
            }
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
        name: game.i18n
          .localize("WT.Dialog.MoveToSet")
          .replace("@SET@", i + 1)
          .replace("@W@", set.width)
          .replace("@H@", set.height),
        icon: "",
        condition: (dieJQ) => {
          if (!isMessageOurs(dieJQ)) return false;
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
          name: game.i18n.localize("WT.Dialog.RemoveFromSet"),
          icon: "",
          condition: (dieJQ) => {
            if (!isMessageOurs(dieJQ)) return false;
            const die = roll.getDieFromJQ(dieJQ);
            for (const set of roll.sets) {
              if (set.includes(die) && set.width == 1) {
                return false;
              }
            }
            return !roll.looseDice.includes(die);
          },
          callback: async (dieJQ) => {
            const die = roll.popDieFromJQ(dieJQ);
            if (die.type == ORE_DIE_TYPE_WIGGLE) {
              die.face = "*";
            }
            roll.looseDice.push(die);
            roll.rerenderChatMessage(message);
          },
        },
        {
          name: game.i18n.localize("WT.Dialog.ToNewSet"),
          icon: "",
          condition: (dieJQ) => {
            if (!isMessageOurs(dieJQ)) return false;
            const die = roll.getDieFromJQ(dieJQ);
            for (const set of roll.sets) {
              if (set.includes(die) && set.width == 1) {
                return false;
              }
            }
            return true;
          },
          callback: async (dieJQ) => {
            const die = roll.popDieFromJQ(dieJQ);
            if (die.type == ORE_DIE_TYPE_WIGGLE) {
              die.face = "*";
            }
            roll.sets.push(new OREDieSet(die));
            roll.rerenderChatMessage(message);
          },
        },
        {
          name: game.i18n.localize("WT.Dialog.DisbandSet"),
          icon: "",
          condition: (dieJQ) => {
            if (!isMessageOurs(dieJQ)) return false;
            const die = roll.getDieFromJQ(dieJQ);
            return !roll.looseDice.includes(die);
          },
          callback: async (dieJQ) => {
            const set = roll.sets.splice(OREDie.jqInfo(dieJQ).index1, 1)[0];
            for (const die of set) {
              if (die.type == ORE_DIE_TYPE_WIGGLE) {
                die.face = "*";
              }
              roll.looseDice.push(die);
            }
            roll.rerenderChatMessage(message);
          },
        },
        {
          name: game.i18n.localize("WT.Dialog.SetFaceAdvanced"),
          icon: "",
          condition: (dieJQ) => {
            if (!isMessageOurs(dieJQ)) return false;
            const die = roll.getDieFromJQ(dieJQ);
            return (
              die.type == ORE_DIE_TYPE_WIGGLE || die.type == ORE_DIE_TYPE_EXPERT
            );
          },
          callback: async (dieJQ) => {
            const die = roll.getDieFromJQ(dieJQ);
            die.face = await ORESetFaceDialog.show(
              die.face == "*" ? 1 : die.face
            );
            roll.rerenderChatMessage(message);
          },
        },
        {
          name: game.i18n.localize("WT.Dialog.RerollDie"),
          icon: "",
          condition: (dieJQ) => {
            if (!isMessageOurs(dieJQ)) return false;
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

function actorLookupItem(actor, id) {
  return Item.get(id) || actor.getEmbeddedDocument("Item", id);
}

Game.prototype.wildtalents = {
  roll: ORERollDialog.showAndChat,
  quickRoll: async (dice, options = {}) => {
    return (
      await OREDice.fromString(dice, options).roll(options)
    ).showChatMessage(options);
  },
};

Hooks.once("ready", async () => {
  Hooks.on("hotbarDrop", async (bar, data, slot) => {
    async function onActorDrop(
      dataType,
      macroGetName,
      macroGetDice,
      macroGetFlavor,
      macroGetOptions = (actor, data) => undefined
    ) {
      if (data.type == dataType) {
        const actor = Actor.get(data.actor);
        const name = macroGetName(data, actor);
        const fn = data.quick ? "quickRoll" : "roll";
        var options = macroGetOptions(data, actor);
        if (options) {
          options = "\n    " + options.replace("\n", "\n    ");
        } else {
          options = "";
        }
        const command = `await game.wildtalents.${fn}(
  ${macroGetDice(data, actor)},
  {
    flavor: "${macroGetFlavor(data, actor)}",
    speaker: { actor: "${actor.id}" },${options}
  }
)`;

        var macro = game.macros.contents.find(
          (m) => m.name == name && m.command == command
        );
        if (!macro) {
          macro = await Macro.create({
            name: name,
            type: "script",
            img: ASSETS + "macro/roll.png",
            command: command,
          });
        }
        game.user.assignHotbarMacro(macro, slot);
        return false;
      }
    }

    if (
      (await onActorDrop(
        "WTStat",
        (data, actor) =>
          game.i18n
            .localize("WT.Macro.Stat")
            .replace("@ACTOR@", actor.name)
            .replace("@STAT@", game.i18n.localize(STATS[data.stat].name)),
        (data, actor) =>
          `Actor.get("${actor.id}").system.stats.${STATS[data.stat].field}`,
        (data, actor) => game.i18n.localize(STATS[data.stat].name)
      )) === false
    ) {
      return false;
    } else if (
      (await onActorDrop(
        "WTSkill",
        (data, actor) =>
          game.i18n
            .localize("WT.Macro.Skill")
            .replace("@ACTOR@", actor.name)
            .replace("@SKILL@", actorLookupItem(actor, data.skill.id).name)
            .replace(
              "@SPECIALTY@",
              data.skill.specialty ? " (" + data.skill.specialty + ")" : ""
            ),
        (data, actor) => {
          const skill = actorLookupItem(actor, data.skill.id);
          return `Actor.get("${actor.id}").system.stats.${
            STATS[skill.system.primaryStat].field
          } + " + " + Actor.get("${
            actor.id
          }").system.skills.find(s => s.id == "${
            data.skill.id
          }" && s.specialty == "${data.skill.specialty}").dice`;
        },
        (data, actor) => {
          const skill = actorLookupItem(actor, data.skill.id);
          return (
            game.i18n.localize(STATS[skill.system.primaryStat].name) +
            " + " +
            skill.name +
            (data.skill.specialty ? " (" + data.skill.specialty + ")" : "")
          );
        }
      )) === false
    ) {
      return false;
    } else if (
      (await onActorDrop(
        "WTQuality",
        (data, actor) => {
          const power = actorLookupItem(actor, data.power.id);
          return game.i18n
            .localize("WT.Macro.Power")
            .replace("@ACTOR@", actor.name)
            .replace("@POWER@", power.name)
            .replace(
              "@QUALITY@",
              power.system.qualities[data.quality].name
                ? " (" + power.system.qualities[data.quality].name + ")"
                : ""
            );
        },
        (data, actor) => {
          const power = actorLookupItem(actor, data.power.id);
          const field = ["hyperstats", "hyperskills", "miracles"][
            power.system.powerType
          ];

          var prefix = "";
          if (power.system.powerType == 1) {
            // hyperskill
            prefix = `Actor.get("${actor.id}").system.stats.${
              STATS[power.system.stat].field
            } + " + " + `;
          }

          return (
            prefix +
            `Actor.get("${actor.id}").system.${field}.find(p => p.id == "${data.power.id}" && p.providedBy == "${data.power.providedBy}").dice`
          );
        },
        (data, actor) => {
          const power = actorLookupItem(actor, data.power.id);
          const quality = power.system.qualities[data.quality];

          var prefix = "";
          if (power.system.powerType == 1) {
            // hyperskill
            prefix = game.i18n.localize(STATS[power.system.stat].name) + " + ";
          }

          return (
            prefix +
            "[" +
            game.i18n.localize(
              QUALITY_TYPES[quality.qualityType].name + "Letter"
            ) +
            "+0] " +
            (quality.name || power.name)
          );
        }
      )) === false
    ) {
      return false;
    } else if (
      (await onActorDrop(
        "WTMinionGeneral",
        (data, actor) =>
          game.i18n
            .localize("WT.Macro.MinionGeneral")
            .replace("@ACTOR@", actor.name),
        (data, actor) => `Actor.get("${actor.id}").system.groupSize + "d"`,
        (data, actor) => ""
      )) === false
    ) {
      return false;
    } else if (
      (await onActorDrop(
        "WTMinionCommand",
        (data, actor) =>
          game.i18n
            .localize("WT.Macro.MinionCommand")
            .replace("@ACTOR@", actor.name),
        (data, actor) => `Actor.get("${actor.id}").system.groupSize + "d"`,
        (data, actor) => game.i18n.localize("WT.Dialog.RollCommand"),
        (data, actor) =>
          `minHeight: Actor.get("${actor.id}").system.effectiveCommand,`
      )) === false
    ) {
      return false;
    } else if (
      (await onActorDrop(
        "WTMinionSkill",
        (data, actor) =>
          game.i18n
            .localize("WT.Macro.MinionSkill")
            .replace("@ACTOR@", actor.name),
        (data, actor) => `Actor.get("${actor.id}").system.groupSize + "d"`,
        (data, actor) => game.i18n.localize("WT.Dialog.RollSkill"),
        (data, actor) =>
          `minHeight: Actor.get("${actor.id}").system.effectiveSkill,`
      )) === false
    ) {
      return false;
    } else if (
      (await onActorDrop(
        "WTMinionDemoralization",
        (data, actor) =>
          game.i18n
            .localize("WT.Macro.MinionDemoralization")
            .replace("@ACTOR@", actor.name),
        (data, actor) => `Actor.get("${actor.id}").system.groupSize + "d"`,
        (data, actor) => game.i18n.localize("WT.Dialog.RollDemoralization"),
        (data, actor) =>
          `minHeight: Actor.get("${actor.id}").system.effectiveDemoralization,`
      )) === false
    ) {
      return false;
    } else if (
      (await onActorDrop(
        "WTMinionMastery",
        (data, actor) =>
          game.i18n
            .localize("WT.Macro.MinionMastery")
            .replace("@ACTOR@", actor.name)
            .replace("@SKILL@", actorLookupItem(actor, data.mastery.id).name)
            .replace(
              "@SPECIALTY@",
              data.mastery.specialty ? " (" + data.mastery.specialty + ")" : ""
            ),
        (data, actor) => `Actor.get("${actor.id}").system.masteryDice`,
        (data, actor) => {
          const skill = actorLookupItem(actor, data.mastery.id);
          return (
            skill.name +
            (data.mastery.specialty ? " (" + data.mastery.specialty + ")" : "")
          );
        }
      )) === false
    ) {
      return false;
    }
  });
});

const ORE_OPTIONS = {
  mh: { option: "minHeight", ctor: Number },
  mw: { option: "minWidth", ctor: Number },
  pd: { option: "penaltyDice", ctor: Number },
  gd: { option: "gobbleDice", ctor: Number },
  ed: { option: "extraDice", ctor: (s) => parseEDFs(s, 1000) },
  flavor: { option: "flavor", ctor: String },
};
const ORE_COMMAND = "/ore";

async function oreCommand(message) {
  const args = message.split(/\s+/).slice(1);
  var dice = "";
  var options = {};

  for (const arg of args) {
    if (arg.includes("=")) {
      const parts = arg.split("=");
      if (parts.length != 2) {
        return ui.notifications.error(
          `${ORE_COMMAND} failed: ill-formed option '${arg}' (expected key=value)`
        );
      }
      const option = ORE_OPTIONS[parts[0]];
      if (!option) {
        return ui.notifications.error(
          `${ORE_COMMAND} failed: unknown option (expected one of: ${Object.keys(
            ORE_OPTIONS
          ).join(" ")})`
        );
      }
      try {
        options[option.option] = option.ctor(parts[1]);
      } catch (e) {
        console.error(e);
        return ui.notifications.error(
          `${ORE_COMMAND} failed: option ${parts[0]}: Invalid value '${parts[1]}'`
        );
      }
    } else {
      dice = dice + arg;
    }
  }

  try {
    (
      await OREDice.fromString(dice, options)
        .penalize(options.penaltyDice, options)
        .constrain(options)
        .roll(options)
    ).showChatMessage(options);
  } catch (e) {
    console.error(e);
    return ui.notifications.error(`${ORE_COMMAND} failed: ${e.message}'`);
  }
}

Hooks.on("chatMessage", (chatlog, message, data) => {
  if (message && message.split(/\s+/)[0] == ORE_COMMAND) {
    oreCommand(message);
    return false;
  }
});

// CONFIG.debug.hooks = true;
