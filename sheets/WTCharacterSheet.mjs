import { STATS } from "../util.mjs";

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

    html.find(".add-skill").click((event) => {
      event.preventDefault();
      this.actor.update({
        "system.skills": this.actor.system.skills.concat([{}]),
      });
    });
    html.find(".remove-skill").click((event) => {
      event.preventDefault();
      const i = Number(event.currentTarget.getAttribute("index"));
      const newArray = this.actor.system.skills
        .slice(0, i)
        .concat(this.actor.system.skills.slice(i + 1));
      this.actor.update({
        "system.skills": newArray,
      });
    });
    html.find(".skillslot").dblclick(async (event) => {
      event.preventDefault();
      const index = Number(event.currentTarget.getAttribute("index"));
      const instance = this.actor.system.skills[index];
      if (instance.id) {
        // open up existing
        lookup(instance.id).sheet.render(true);
      } else {
        // create new embedded
        const newItem = await getDocumentClass("Item").create(
          { name: game.i18n.localize("WT.Dialog.NewSkill"), type: "skill" },
          { parent: this.actor }
        );
        newItem.sheet.render(true);
        const newArray = this.actor.system.skills.slice();
        newArray[index] = {
          ...newArray[index],
          id: newItem.id,
        };
        this.actor.update({
          "system.skills": newArray,
        });
      }
    });
    ContextMenu.create(this, html, ".skillslot", [
      {
        name: game.i18n.localize("WT.Dialog.RemoveSkill"),
        icon: "",
        condition: (slot) => {
          var index = Number(slot.attr("index"));
          return this.actor.system.skills[index].id;
        },
        callback: async (slot) => {
          var index = Number(slot.attr("index"));
          const id = this.actor.system.skills[index].id;
          const newArray = this.actor.system.skills.slice();
          newArray[index] = {
            ...newArray[index],
            id: undefined,
          };
          const embeddedSkill = this.actor.getEmbeddedDocument("Item", id);
          if (embeddedSkill) {
            await embeddedSkill.delete();
          }
          this.actor.update({
            "system.skills": newArray,
          });
        },
      },
    ]);

    html.find(".add-archetype").click((event) => {
      event.preventDefault();
      this.actor.update({
        "system.archetypes": this.actor.system.archetypes.concat([""]),
      });
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
        },
      },
    ]);
  }

  /** @override */
  _onDropItem(event, itemInfo) {
    console.log("Dropping item into sheet...");
    if (itemInfo.type == "Item") {
      const itemID = itemInfo.uuid.slice("Item.".length);
      console.log("It's an Item! " + itemID);
      const item = Item.get(itemID);
      if (!item) return;
      if (item.type == "skill") {
        console.log("It's a skill!");
        const slots = document
          .elementsFromPoint(event.pageX, event.pageY)
          .filter((e) => e.classList.contains("skillslot"));
        if (slots.length) {
          console.log(
            "It's over a skill slot! " + slots[0].getAttribute("index")
          );
          const index = Number(slots[0].getAttribute("index"));
          const newArray = this.actor.system.skills.slice();
          newArray[index] = {
            ...newArray[index],
            id: itemID,
          };
          this.actor.update({
            "system.skills": newArray,
          });
        } else {
          console.log("It's NOT over a skill slot!");
          const tab = this._tabs[0].active;
          if (tab == "stats") {
            console.log("We're in the stats tab!");
            this.actor.update({
              "system.skills": this.actor.system.skills.concat([
                { id: itemID },
              ]),
            });
          }
        }
      } else if (item.type == "archetype") {
        console.log("It's a archetype!");
        const slots = document
          .elementsFromPoint(event.pageX, event.pageY)
          .filter((e) => e.classList.contains("archetypeslot"));
        if (slots.length) {
          console.log(
            "It's over a archetype slot! " + slots[0].getAttribute("index")
          );
          const index = Number(slots[0].getAttribute("index"));
          const newArray = this.actor.system.archetypes.slice();
          newArray[index] = itemID;
          this.actor.update({
            "system.archetypes": newArray,
          });
        } else {
          console.log("It's NOT over a archetype slot!");
          const tab = this._tabs[0].active;
          if (tab == "archetype") {
            console.log("We're in the archetype tab!");
            this.actor.update({
              "system.archetypes": this.actor.system.archetypes.concat([
                itemID,
              ]),
            });
          }
        }
      }
    }
  }
}
