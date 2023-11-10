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
    const context = super.getData();
    const actorData = this.actor.toObject(false);
    context.system = actorData.system;
    context.flags = actorData.flags;
    context.rollData = context.actor.getRollData();
    context.skilldocs = {};
    for (const skill of context.system.skills) {
      const skillDoc = Item.get(skill.skill);
      context.skilldocs[skill.skill] = skillDoc;
    }
    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

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
        const skillslots = document
          .elementsFromPoint(event.pageX, event.pageY)
          .filter((e) => e.classList.contains("skillslot"));
        if (skillslots.length) {
          console.log(
            "It's over a skill slot! " +
              skillslots[0].getAttribute("skillindex")
          );
          const skillslot = Number(skillslots[0].getAttribute("skillindex"));
          const newArray = this.actor.system.skills.slice();
          newArray[skillslot] = {
            ...newArray[skillslot],
            skill: itemID,
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
                { skill: itemID },
              ]),
            });
          }
        }
      }
    }
  }
}
