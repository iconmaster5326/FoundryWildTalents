import { DEFAULT_SILHOUETTE, STATS } from "../util.mjs";
import { ORERollDialog } from "./ORERollDialog.mjs";
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
      const statField = event.currentTarget.getAttribute("stat");
      return ORERollDialog.showAndChat(this.actor.system.stats[statField], {
        flavor: game.i18n.localize(
          STATS.find((s) => s.field == statField).name
        ),
      });
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
