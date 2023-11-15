import { DEFAULT_SILHOUETTE, QUALITY_TYPES, STATS } from "../util.mjs";
import { ORERollDialog } from "./ORERollDialog.mjs";
import {
  WTActorSheet,
  generateAddRefListDropHandler,
  generateAddRefSheetListener,
  showOrRoll,
} from "./sheets.mjs";

const TEMPLATES = "systems/wildtalents/templates/";
const SHEET_HTML = TEMPLATES + "wt-character-sheet.hbs";
const SHEET_HTML_LIMITED = TEMPLATES + "wt-actor-sheet-limited.hbs";

export class WTCharacterSheet extends WTActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: SHEET_HTML,
      classes: ["wildtalents", "character"],
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "general",
        },
      ],
    });
  }

  /** @override */
  get template() {
    if (this.actor.limited && !game.user.isGM) {
      return SHEET_HTML_LIMITED;
    } else {
      return SHEET_HTML;
    }
  }

  get health() {
    const health = [];
    for (const bodyPart of this.actor.system.silhouette) {
      const boxes = [];
      for (var i = 0; i < bodyPart.boxes; i++) {
        var state = "healthy";
        if (i < bodyPart.killingDamage) {
          state = "killing";
        } else if (i < bodyPart.killingDamage + bodyPart.shockDamage) {
          state = "shock";
        }
        boxes.push({ state: state });
      }
      health.push({ name: bodyPart.name, boxes: boxes });
    }
    return health;
  }

  /** @override */
  getData() {
    const lookup = (id) =>
      Item.get(id) || this.actor.getEmbeddedDocument("Item", id);

    const context = super.getData();

    context.documents = {};
    for (const skill of context.system.skills) {
      context.documents[skill.id] = lookup(skill.id);
    }
    for (const archetype of context.system.archetypes) {
      context.documents[archetype] = lookup(archetype);
    }
    for (const mq of context.system.sources) {
      context.documents[mq.id] = lookup(mq.id);
    }
    for (const mq of context.system.permissions) {
      context.documents[mq.id] = lookup(mq.id);
    }
    for (const mq of context.system.intrinsics) {
      context.documents[mq.id] = lookup(mq.id);
    }
    for (const power of context.system.hyperstats) {
      context.documents[power.id] = lookup(power.id);
    }
    for (const power of context.system.hyperskills) {
      context.documents[power.id] = lookup(power.id);
    }
    for (const power of context.system.miracles) {
      context.documents[power.id] = lookup(power.id);
    }
    for (const focus of context.system.foci) {
      context.documents[focus] = lookup(focus);
    }

    context.health = this.health;
    context.STATS = STATS;
    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    const lookup = (id) =>
      Item.get(id) || this.actor.getEmbeddedDocument("Item", id);

    if (!this.isEditable) return;

    html.find(".add-conviction").click((event) => {
      event.preventDefault();
      this.actor.update({
        "system.convictions": this.actor.system.convictions.concat([{}]),
      });
    });
    html.find(".remove-conviction").click((event) => {
      event.preventDefault();
      const i = Number(event.currentTarget.getAttribute("index"));
      const newArray = this.actor.system.convictions
        .slice(0, i)
        .concat(this.actor.system.convictions.slice(i + 1));
      this.actor.update({
        "system.convictions": newArray,
      });
    });

    html.find(".add-body-part").click((event) => {
      event.preventDefault();
      this.actor.update({
        "system.silhouette": this.actor.system.silhouette.concat([{}]),
      });
    });
    html.find(".remove-body-part").click((event) => {
      event.preventDefault();
      const i = Number(event.currentTarget.getAttribute("index"));
      const newArray = this.actor.system.silhouette
        .slice(0, i)
        .concat(this.actor.system.silhouette.slice(i + 1));
      this.actor.update({
        "system.silhouette": newArray,
      });
    });

    const addRefListListener = generateAddRefSheetListener(this, html);

    addRefListListener(
      "skill",
      "skill",
      "system.skills",
      () => this.actor.system.skills,
      {
        creatable: true,
        newInstanceName: "WT.Dialog.NewSkill",
        removeDialogText: "WT.Dialog.RemoveSkill",
      }
    );
    addRefListListener(
      "source",
      "metaquality",
      "system.sources",
      () => this.actor.system.sources,
      {
        removeDialogText: "WT.Dialog.RemoveSource",
      }
    );
    addRefListListener(
      "permission",
      "metaquality",
      "system.permissions",
      () => this.actor.system.permissions,
      {
        removeDialogText: "WT.Dialog.RemovePermission",
      }
    );
    addRefListListener(
      "intrinsic",
      "metaquality",
      "system.intrinsics",
      () => this.actor.system.intrinsics,
      {
        removeDialogText: "WT.Dialog.RemoveIntrinsic",
      }
    );
    addRefListListener(
      "hyperstat",
      "power",
      "system.hyperstats",
      () => this.actor.system.hyperstats,
      {
        creatable: true,
        newInstanceName: "WT.Dialog.NewHyperstat",
        createWith: { system: { powerType: 0 } },
        removeDialogText: "WT.Dialog.RemoveHyperstat",
      }
    );
    addRefListListener(
      "hyperskill",
      "power",
      "system.hyperskills",
      () => this.actor.system.hyperskills,
      {
        creatable: true,
        newInstanceName: "WT.Dialog.NewHyperskill",
        createWith: { system: { powerType: 1 } },
        removeDialogText: "WT.Dialog.RemoveHyperskill",
      }
    );
    addRefListListener(
      "miracle",
      "power",
      "system.miracles",
      () => this.actor.system.miracles,
      {
        creatable: true,
        newInstanceName: "WT.Dialog.NewMiracle",
        createWith: { system: { powerType: 2 } },
        removeDialogText: "WT.Dialog.RemoveMiracle",
      }
    );

    html.find(".add-archetype").click((event) => {
      event.preventDefault();
      const newArray = this.actor.system.archetypes.concat([""]);
      this.actor.update({
        "system.archetypes": newArray,
      });
      this.actor.system.updateProvidedAbilities(
        this.actor,
        newArray,
        this.actor.system.foci
      );
    });
    html.find(".remove-archetype").click((event) => {
      event.preventDefault();
      const i = Number(event.currentTarget.getAttribute("index"));
      const newArray = this.actor.system.archetypes
        .slice(0, i)
        .concat(this.actor.system.archetypes.slice(i + 1));
      this.actor.update({
        "system.archetypes": newArray,
      });
      this.actor.system.updateProvidedAbilities(
        this.actor,
        newArray,
        this.actor.system.foci
      );
    });
    html.find(".archetypeslot").dblclick(async (event) => {
      event.preventDefault();
      const index = Number(event.currentTarget.getAttribute("index"));
      const instance = this.actor.system.archetypes[index];
      if (instance) {
        lookup(instance).sheet.render(true);
      }
    });
    ContextMenu.create(this, html, ".archetypeslot", [
      {
        name: game.i18n.localize("WT.Dialog.RemoveArchetype"),
        icon: "",
        condition: (slot) => {
          var index = Number(slot.attr("index"));
          return this.actor.system.archetypes[index];
        },
        callback: async (slot) => {
          var index = Number(slot.attr("index"));
          const id = this.actor.system.archetypes[index];
          const newArray = this.actor.system.archetypes.slice();
          newArray[index] = undefined;
          this.actor.update({
            "system.archetypes": newArray,
          });
          this.actor.system.updateProvidedAbilities(
            this.actor,
            newArray,
            this.actor.system.foci
          );
        },
      },
      {
        name: game.i18n.localize("WT.Dialog.UseSilhouette"),
        icon: "",
        condition: (slot) => {
          var index = Number(slot.attr("index"));
          const id = this.actor.system.archetypes[index];
          if (!id) return false;
          const archetype = Item.get(id);
          if (!archetype) return false;
          return archetype.system.customSilhouette;
        },
        callback: async (slot) => {
          var index = Number(slot.attr("index"));
          const id = this.actor.system.archetypes[index];
          const archetype = Item.get(id);
          this.actor.update({
            "system.silhouette": archetype.system.silhouette,
          });
        },
      },
    ]);

    ContextMenu.create(this, html, ".silhouette-header", [
      {
        name: game.i18n.localize("WT.Dialog.RestoreSilhouette"),
        icon: "",
        condition: (_) => true,
        callback: async (_) => {
          this.actor.update({
            "system.silhouette": DEFAULT_SILHOUETTE,
          });
        },
      },
    ]);

    html.find(".add-focus").click((event) => {
      event.preventDefault();
      const newArray = this.actor.system.foci.concat([""]);
      this.actor.update({
        "system.foci": newArray,
      });
      this.actor.system.updateProvidedAbilities(
        this.actor,
        this.actor.system.archetypes,
        newArray
      );
    });
    html.find(".remove-focus").click((event) => {
      event.preventDefault();
      const i = Number(event.currentTarget.getAttribute("index"));
      const newArray = this.actor.system.foci
        .slice(0, i)
        .concat(this.actor.system.foci.slice(i + 1));
      this.actor.update({
        "system.foci": newArray,
      });
      this.actor.system.updateProvidedAbilities(
        this.actor,
        this.actor.system.archetypes,
        newArray
      );
    });
    html.find(".focusslot").dblclick(async (event) => {
      event.preventDefault();
      const index = Number(event.currentTarget.getAttribute("index"));
      const instance = this.actor.system.foci[index];
      if (instance) {
        // open existing
        lookup(instance).sheet.render(true);
      } else {
        // create new
        const newItem = await getDocumentClass("Item").create(
          {
            name: game.i18n.localize("WT.Dialog.NewFocus"),
            type: "focus",
          },
          { parent: this.actor }
        );
        newItem.sheet.render(true);
        const newArray = this.actor.system.foci.slice();
        newArray[index] = [...newArray[index], newItem.id];
        this.actor.update({
          "system.foci": newArray,
        });
        this.actor.system.updateProvidedAbilities(
          this.actor,
          this.actor.system.archetypes,
          newArray
        );
      }
    });
    ContextMenu.create(this, html, ".focusslot", [
      {
        name: game.i18n.localize("WT.Dialog.RemoveFocus"),
        icon: "",
        condition: (slot) => {
          var index = Number(slot.attr("index"));
          return this.actor.system.foci[index];
        },
        callback: async (slot) => {
          var index = Number(slot.attr("index"));
          const id = this.actor.system.foci[index];
          const newArray = this.actor.system.foci.slice();
          newArray[index] = undefined;
          this.actor.update({
            "system.foci": newArray,
          });
          const embedded = this.actor.getEmbeddedDocument("Item", id);
          if (embedded) {
            await embedded.delete();
          }
          this.actor.system.updateProvidedAbilities(
            this.actor,
            this.actor.system.archetypes,
            newArray
          );
        },
      },
    ]);

    html.find(".roll-stat").click(async (event) => {
      event.preventDefault();
      const field = event.currentTarget.getAttribute("stat");
      return showOrRoll(
        this.actor,
        event,
        this.actor.system.stats[field],
        game.i18n.localize(STATS.find((s) => s.field == field).name)
      );
    });
    html.find(".roll-stat").on("dragstart", async (event) => {
      const field = event.currentTarget.getAttribute("stat");
      event.originalEvent.dataTransfer.setData(
        "text/plain",
        JSON.stringify({
          type: "WTStat",
          actor: this.actor.id,
          stat: STATS.findIndex((s) => s.field == field),
          quick: event.shiftKey || event.ctrlKey,
        })
      );
    });

    const rollSkill = async (event, skillInstance, stat) => {
      const skill = lookup(skillInstance.id);
      const statDice = this.actor.system.stats[STATS[stat].field];
      return showOrRoll(
        this.actor,
        event,
        statDice + " + " + skillInstance.dice,
        game.i18n.localize(STATS[stat].name) +
          " + " +
          skill.name +
          (skillInstance.specialty ? " (" + skillInstance.specialty + ")" : "")
      );
    };
    html.find(".roll-skill").click(async (event) => {
      event.preventDefault();
      const index = Number(event.currentTarget.getAttribute("index"));
      const skillInstance = this.actor.system.skills[index];
      return rollSkill(
        event,
        skillInstance,
        lookup(skillInstance.id).system.primaryStat
      );
    });
    const rollSkillMenu = [];
    for (var i = 0; i < STATS.length; i++) {
      const i_ = i;
      rollSkillMenu.push({
        name: game.i18n
          .localize("WT.Dialog.RollSkillWithStat")
          .replace("@STAT@", game.i18n.localize(STATS[i_].name)),
        icon: "",
        condition: (jq) => true,
        callback: async (jq) => {
          const index = Number(jq.attr("index"));
          return rollSkill({}, this.actor.system.skills[index], i_);
        },
      });
    }
    ContextMenu.create(this, html, ".roll-skill", rollSkillMenu);
    html.find(".roll-skill").on("dragstart", async (event) => {
      event.originalEvent.dataTransfer.setData(
        "text/plain",
        JSON.stringify({
          type: "WTSkill",
          actor: this.actor.id,
          skill:
            this.actor.system.skills[
              Number(event.currentTarget.getAttribute("index"))
            ],
          quick: event.shiftKey || event.ctrlKey,
        })
      );
    });

    html.find(".roll-hyperstat").click(async (event) => {
      event.preventDefault();
      const i = Number(event.currentTarget.getAttribute("index1"));
      const j = Number(event.currentTarget.getAttribute("index2"));
      const powerInstance = this.actor.system.hyperstats[i];
      const power = lookup(powerInstance.id);
      const quality = power.system.qualities[j];
      return showOrRoll(
        this.actor,
        event,
        powerInstance.dice,
        "[" +
          game.i18n.localize(
            QUALITY_TYPES[quality.qualityType].name + "Letter"
          ) +
          "+" +
          quality.level +
          "] " +
          (quality.name || power.name)
      );
    });
    ContextMenu.create(this, html, ".roll-hyperstat", [
      {
        name: game.i18n.localize("WT.Dialog.RollHyperstatWithStat"),
        icon: "",
        condition: (jq) => true,
        callback: async (jq) => {
          const i = Number(jq.attr("index1"));
          const j = Number(jq.attr("index2"));
          const powerInstance = this.actor.system.hyperstats[i];
          const power = lookup(powerInstance.id);
          const quality = power.system.qualities[j];
          return ORERollDialog.showAndChat(
            this.actor.system.stats[STATS[power.system.stat].field] +
              " + " +
              powerInstance.dice,
            {
              flavor:
                game.i18n.localize(STATS[power.system.stat].name) +
                " + [" +
                game.i18n.localize(
                  QUALITY_TYPES[quality.qualityType].name + "Letter"
                ) +
                "+0] " +
                (quality.name || power.name),
            }
          );
        },
      },
    ]);
    html.find(".roll-hyperstat").on("dragstart", async (event) => {
      const i = Number(event.currentTarget.getAttribute("index1"));
      const j = Number(event.currentTarget.getAttribute("index2"));
      event.originalEvent.dataTransfer.setData(
        "text/plain",
        JSON.stringify({
          type: "WTQuality",
          actor: this.actor.id,
          power: this.actor.system.hyperstats[i],
          quality: j,
          quick: event.shiftKey || event.ctrlKey,
        })
      );
    });

    const rollHyperskill = async (event, powerInstance, quality, stat) => {
      const power = lookup(powerInstance.id);
      return showOrRoll(
        this.actor,
        event,
        this.actor.system.stats[STATS[stat].field] + " + " + powerInstance.dice,
        game.i18n.localize(STATS[stat].name) +
          " + [" +
          game.i18n.localize(
            QUALITY_TYPES[quality.qualityType].name + "Letter"
          ) +
          "+" +
          quality.level +
          "] " +
          (quality.name || power.name)
      );
    };
    html.find(".roll-hyperskill").click(async (event) => {
      event.preventDefault();
      const i = Number(event.currentTarget.getAttribute("index1"));
      const j = Number(event.currentTarget.getAttribute("index2"));
      const powerInstance = this.actor.system.hyperskills[i];
      const power = lookup(powerInstance.id);
      rollHyperskill(
        event,
        powerInstance,
        power.system.qualities[j],
        lookup(power.system.skill.id).system.primaryStat
      );
    });
    const hyperskillMenu = [];
    for (var i = 0; i < STATS.length; i++) {
      const i_ = i;
      hyperskillMenu.push({
        name: game.i18n
          .localize("WT.Dialog.RollSkillWithStat")
          .replace("@STAT@", game.i18n.localize(STATS[i_].name)),
        icon: "",
        condition: (jq) => true,
        callback: async (jq) => {
          const i = Number(jq.attr("index1"));
          const j = Number(jq.attr("index2"));
          const powerInstance = this.actor.system.hyperskills[i];
          rollHyperskill(
            {},
            powerInstance,
            lookup(powerInstance.id).system.qualities[j],
            i_
          );
        },
      });
    }
    ContextMenu.create(this, html, ".roll-hyperskill", hyperskillMenu);
    html.find(".roll-hyperskill").on("dragstart", async (event) => {
      const i = Number(event.currentTarget.getAttribute("index1"));
      const j = Number(event.currentTarget.getAttribute("index2"));
      event.originalEvent.dataTransfer.setData(
        "text/plain",
        JSON.stringify({
          type: "WTQuality",
          actor: this.actor.id,
          power: this.actor.system.hyperskills[i],
          quality: j,
          quick: event.shiftKey || event.ctrlKey,
        })
      );
    });

    html.find(".roll-miracle").click(async (event) => {
      event.preventDefault();
      const i = Number(event.currentTarget.getAttribute("index1"));
      const j = Number(event.currentTarget.getAttribute("index2"));
      const powerInstance = this.actor.system.miracles[i];
      const power = lookup(powerInstance.id);
      const quality = power.system.qualities[j];
      return showOrRoll(
        this.actor,
        event,
        powerInstance.dice,
        "[" +
          game.i18n.localize(
            QUALITY_TYPES[quality.qualityType].name + "Letter"
          ) +
          "+" +
          quality.level +
          "] " +
          (quality.name || power.name)
      );
    });
    html.find(".roll-miracle").on("dragstart", async (event) => {
      const i = Number(event.currentTarget.getAttribute("index1"));
      const j = Number(event.currentTarget.getAttribute("index2"));
      event.originalEvent.dataTransfer.setData(
        "text/plain",
        JSON.stringify({
          type: "WTQuality",
          actor: this.actor.id,
          power: this.actor.system.miracles[i],
          quality: j,
          quick: event.shiftKey || event.ctrlKey,
        })
      );
    });

    html.find(".healthbox").click(async (event) => {
      var health = this.health;
      var i = Number($(event.currentTarget).find(".box-info-index1").text());
      var j = Number($(event.currentTarget).find(".box-info-index2").text());
      var newArray = this.actor.system.silhouette.slice();
      var state = health[i].boxes[j].state;
      newArray[i] = {
        ...newArray[i],
        shockDamage:
          newArray[i].shockDamage +
          (state == "shock" ? -1 : state == "healthy" ? 1 : 0),
        killingDamage: newArray[i].killingDamage + (state == "shock" ? 1 : 0),
      };
      this.actor.update({ "system.silhouette": newArray });
    });
    html.find(".healthbox").contextmenu(async (event) => {
      var health = this.health;
      var i = Number($(event.currentTarget).find(".box-info-index1").text());
      var j = Number($(event.currentTarget).find(".box-info-index2").text());
      var newArray = this.actor.system.silhouette.slice();
      var state = health[i].boxes[j].state;
      newArray[i] = {
        ...newArray[i],
        shockDamage:
          newArray[i].shockDamage -
          (state == "killing" ? -1 : state == "shock" ? 1 : 0),
        killingDamage: newArray[i].killingDamage - (state == "killing" ? 1 : 0),
      };
      this.actor.update({ "system.silhouette": newArray });
    });
  }

  /** @override */
  async _onDropItem(event, itemInfo) {
    if (!this.isEditable) return;

    if (itemInfo.type == "Item") {
      const itemID = itemInfo.uuid.slice("Item.".length);
      const item = Item.get(itemID);
      if (!item) return;

      const addRefListDropHandler = generateAddRefListDropHandler(this, item);

      await addRefListDropHandler(
        "stats",
        "skill",
        "skill",
        "system.skills",
        () => this.actor.system.skills
      );
      await addRefListDropHandler(
        "archetype",
        "source",
        "metaquality",
        "system.sources",
        () => this.actor.system.sources,
        { filter: (item) => item.system.metaQualityType == 0 }
      );
      await addRefListDropHandler(
        "archetype",
        "permission",
        "metaquality",
        "system.permissions",
        () => this.actor.system.permissions,
        { filter: (item) => item.system.metaQualityType == 1 }
      );
      await addRefListDropHandler(
        "archetype",
        "intrinsic",
        "metaquality",
        "system.intrinsics",
        () => this.actor.system.intrinsics,
        { filter: (item) => item.system.metaQualityType == 2 }
      );
      await addRefListDropHandler(
        "powers",
        "hyperstat",
        "power",
        "system.hyperstats",
        () => this.actor.system.hyperstats,
        { filter: (item) => item.system.powerType == 0 }
      );
      await addRefListDropHandler(
        "powers",
        "hyperskill",
        "power",
        "system.hyperskills",
        () => this.actor.system.hyperskills,
        { filter: (item) => item.system.powerType == 1 }
      );
      await addRefListDropHandler(
        "powers",
        "miracle",
        "power",
        "system.miracles",
        () => this.actor.system.miracles,
        { filter: (item) => item.system.powerType == 2 }
      );

      if (item.type == "archetype") {
        const slots = document
          .elementsFromPoint(event.pageX, event.pageY)
          .filter((e) => e.classList.contains("archetypeslot"));
        if (slots.length) {
          const index = Number(slots[0].getAttribute("index"));
          const newArray = this.actor.system.archetypes.slice();
          newArray[index] = itemID;
          this.actor.update({
            "system.archetypes": newArray,
          });
          this.actor.system.updateProvidedAbilities(
            this.actor,
            newArray,
            this.actor.system.foci
          );
        } else {
          const tab = this._tabs[0].active;
          if (tab == "archetype") {
            const newArray = this.actor.system.archetypes.concat([itemID]);
            this.actor.update({
              "system.archetypes": newArray,
            });
            this.actor.system.updateProvidedAbilities(
              this.actor,
              newArray,
              this.actor.system.foci
            );
          }
        }
      }

      if (item.type == "focus") {
        const slots = document
          .elementsFromPoint(event.pageX, event.pageY)
          .filter((e) => e.classList.contains("focusslot"));
        if (slots.length) {
          const index = Number(slots[0].getAttribute("index"));
          const embedded = this.actor.getEmbeddedDocument(
            "Item",
            this.actor.system.foci[index]
          );
          if (embedded) {
            await embedded.delete();
          }
          const newArray = this.actor.system.foci.slice();
          newArray[index] = itemID;
          this.actor.update({
            "system.foci": newArray,
          });
          this.actor.system.updateProvidedAbilities(
            this.actor,
            this.actor.system.archetypes,
            newArray
          );
        } else {
          const tab = this._tabs[0].active;
          if (tab == "powers") {
            const newArray = this.actor.system.foci.concat([itemID]);
            this.actor.update({
              "system.foci": newArray,
            });
            this.actor.system.updateProvidedAbilities(
              this.actor,
              this.actor.system.archetypes,
              newArray
            );
          }
        }
      }
    }
  }
}
