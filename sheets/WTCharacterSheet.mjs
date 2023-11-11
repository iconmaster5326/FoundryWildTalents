import { STATS } from "../util.mjs";
import {
  generateAddRefListDropHandler,
  generateAddRefSheetListener,
} from "./sheets.mjs";

const SHEET_HTML = "systems/wildtalents/templates/wt-character-sheet.hbs";

export class WTCharacterSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: SHEET_HTML,
      width: 600,
      height: 600,
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
    return SHEET_HTML;
  }

  /** @override */
  getData() {
    const lookup = (id) =>
      Item.get(id) || this.actor.getEmbeddedDocument("Item", id);

    const context = super.getData();
    const actorData = this.actor.toObject(false);
    context.system = actorData.system;
    context.flags = actorData.flags;
    context.rollData = context.actor.getRollData();
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

    html.find(".add-archetype").click((event) => {
      event.preventDefault();
      this.actor.update({
        "system.archetypes": this.actor.system.archetypes.concat([""]),
      });
      this.actor.system.updateProvidedAbilities(this.actor);
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
      this.actor.system.updateProvidedAbilities(this.actor);
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
          this.actor.system.updateProvidedAbilities(this.actor);
        },
      },
    ]);
  }

  /** @override */
  _onDropItem(event, itemInfo) {
    if (itemInfo.type == "Item") {
      const itemID = itemInfo.uuid.slice("Item.".length);
      const item = Item.get(itemID);
      if (!item) return;

      const addRefListDropHandler = generateAddRefListDropHandler(this, item);

      addRefListDropHandler(
        "stats",
        "skill",
        "skill",
        "system.skills",
        () => this.actor.system.skills
      );
      addRefListDropHandler(
        "archetype",
        "source",
        "metaquality",
        "system.sources",
        () => this.actor.system.sources,
        { filter: (item) => item.system.metaQualityType == 0 }
      );
      addRefListDropHandler(
        "archetype",
        "permission",
        "metaquality",
        "system.permissions",
        () => this.actor.system.permissions,
        { filter: (item) => item.system.metaQualityType == 1 }
      );
      addRefListDropHandler(
        "archetype",
        "intrinsic",
        "metaquality",
        "system.intrinsics",
        () => this.actor.system.intrinsics,
        { filter: (item) => item.system.metaQualityType == 2 }
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
          this.actor.system.updateProvidedAbilities(this.actor);
        } else {
          const tab = this._tabs[0].active;
          if (tab == "archetype") {
            this.actor.update({
              "system.archetypes": this.actor.system.archetypes.concat([
                itemID,
              ]),
            });
            this.actor.system.updateProvidedAbilities(this.actor);
          }
        }
      }
    }
  }
}
