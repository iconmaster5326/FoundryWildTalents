import { OREDice } from "../rolls/OREDice.mjs";
import { CAPACITY_TYPES, STATS, lookupItem } from "../util.mjs";
import { ORERollDialog } from "./ORERollDialog.mjs";

export function generateAddRefSheetListener(sheet, html) {
  const actorOrItem = sheet.actor ?? sheet.item;

  const lookup = async (id) => lookupItem(actorOrItem, id);

  return function (name, itemTypeName, propertyName, getProp, options = {}) {
    html.find(".add-" + name).click((event) => {
      event.preventDefault();
      actorOrItem.update({
        [propertyName]: getProp().concat([{}]),
      });
    });
    html.find(".remove-" + name).click(async (event) => {
      event.preventDefault();
      const i = Number(event.currentTarget.getAttribute("index"));
      try {
        const embedded = actorOrItem.getEmbeddedDocument(
          "Item",
          getProp()[i].id
        );
        if (embedded) {
          await embedded.delete();
        }
      } catch (_) {
        // we're in an item and lookup failed; Oh Well
      }
      const newArray = getProp()
        .slice(0, i)
        .concat(getProp().slice(i + 1));
      actorOrItem.update({
        [propertyName]: newArray,
      });
    });
    html.find("." + name + "slot").dblclick(async (event) => {
      event.preventDefault();
      const index = Number(event.currentTarget.getAttribute("index"));
      const instance = getProp()[index];
      if (instance.id) {
        // open up existing
        (await lookup(instance.id)).sheet.render(true);
      } else if (options.creatable) {
        // create new embedded
        const newItem = await getDocumentClass("Item").create(
          {
            name: game.i18n.localize(
              options.newInstanceName ?? "WT.Dialog.New"
            ),
            type: itemTypeName,
            ...(options.createWith ?? {}),
          },
          { parent: actorOrItem }
        );
        newItem.sheet.render(true);
        const newArray = getProp().slice();
        newArray[index] = {
          ...newArray[index],
          id: newItem.id,
        };
        actorOrItem.update({
          [propertyName]: newArray,
        });
      }
    });
    ContextMenu.create(sheet, html, "." + name + "slot", [
      {
        name: game.i18n.localize(
          options.removeDialogText ?? "WT.Dialog.Remove"
        ),
        icon: "",
        condition: (slot) => {
          var index = Number(slot.attr("index"));
          return getProp()[index].id && !getProp()[index].providedBy;
        },
        callback: async (slot) => {
          var index = Number(slot.attr("index"));
          const id = getProp()[index].id;
          const newArray = getProp().slice();
          newArray[index] = {
            ...newArray[index],
            id: undefined,
          };
          const embedded = actorOrItem.getEmbeddedDocument("Item", id);
          if (embedded) {
            await embedded.delete();
          }
          actorOrItem.update({
            [propertyName]: newArray,
          });
        },
      },
      ...(options.contextMenuActions ?? []),
    ]);
  };
}

export function generateAddRefListDropHandler(sheet, item) {
  return async function (
    tab,
    name,
    itemTypeName,
    propertyName,
    getProp,
    options = {}
  ) {
    const actorOrItem = sheet.actor ?? sheet.item;

    if (item.type == itemTypeName && (options.filter ?? ((_) => true))(item)) {
      const slots = document
        .elementsFromPoint(event.pageX, event.pageY)
        .filter((e) => e.classList.contains(name + "slot"));
      if (slots.length) {
        const index = Number(slots[0].getAttribute("index"));
        if (getProp()[index].providedBy) return;
        try {
          const embedded = actorOrItem.getEmbeddedDocument(
            "Item",
            getProp()[index].id
          );
          if (embedded) {
            await embedded.delete();
          }
        } catch (_) {
          // we're in an item and lookup failed; Oh Well
        }
        const newArray = getProp().slice();
        newArray[index] = {
          ...newArray[index],
          id: item.id,
        };
        actorOrItem.update({
          [propertyName]: newArray,
        });
      } else {
        if (!tab || sheet._tabs[0].active == tab) {
          actorOrItem.update({
            [propertyName]: getProp().concat([{ id: item.id }]),
          });
        }
      }
    }
  };
}

export class WTItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 600,
      height: 600,
      dragDrop: [{ dropSelector: null }],
    });
  }

  /** @override */
  async getData() {
    const context = await super.getData();
    const actorData = this.item.toObject(false);
    context.system = actorData.system;
    context.flags = actorData.flags;
    context.rollData = context.item.getRollData();

    context.CAPACITY_TYPES_SELECT_OPTIONS = {};
    for (var i = 0; i < CAPACITY_TYPES.length; i++) {
      context.CAPACITY_TYPES_SELECT_OPTIONS[i] = CAPACITY_TYPES[i].name;
    }

    context.STATS_SELECT_OPTIONS = {};
    for (var i = 0; i < STATS.length; i++) {
      context.STATS_SELECT_OPTIONS[i] = STATS[i].name;
    }

    context.notesEnriched = await TextEditor.enrichHTML(actorData.system.notes);

    return context;
  }

  /** @inheritdoc */
  _canDragDrop(selector) {
    return this.isEditable;
  }

  /** @override */
  async _onDrop(event) {
    const data = TextEditor.getDragEventData(event);
    const allowed = Hooks.call("dropItemSheetData", this.item, this, data);
    if (allowed === false) return;

    // Handle different data types
    switch (data.type) {
      case "Item":
        return this._onDropItem(event, data);
    }
  }

  /** @protected */
  async _onDropItem(event, itemInfo) {}
}

export class WTActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 600,
      height: 600,
    });
  }

  /** @override */
  async getData() {
    const context = await super.getData();
    const actorData = this.actor.toObject(false);
    context.system = actorData.system;
    context.flags = actorData.flags;
    context.rollData = context.actor.getRollData();

    context.appearenceEnriched = await TextEditor.enrichHTML(actorData.system.appearence);
    context.notesEnriched = await TextEditor.enrichHTML(actorData.system.notes);

    return context;
  }
}

export const showOrRoll = async (actor, event, dice, flavor, options = {}) => {
  if (event.shiftKey || event.ctrlKey) {
    return (
      await OREDice.fromString(dice, options).roll({
        ...options,
        flavor: flavor,
      })
    ).showChatMessage({
      ...options,
      speaker: { actor: actor.id },
    });
  } else {
    return ORERollDialog.showAndChat(dice, {
      ...options,
      speaker: { actor: actor.id },
      flavor: flavor,
    });
  }
};
