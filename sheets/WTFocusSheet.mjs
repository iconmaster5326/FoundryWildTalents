import { CAPACITY_TYPES } from "../util.mjs";
import {
  WTItemSheet,
  generateAddRefListDropHandler,
  generateAddRefSheetListener,
} from "./sheets.mjs";

const SHEET_HTML = "systems/wildtalents/templates/wt-focus-sheet.hbs";

export class WTFocusSheet extends WTItemSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: SHEET_HTML,
      classes: ["wildtalents", "focus"],
    });
  }

  /** @override */
  get template() {
    return SHEET_HTML;
  }

  /** @override */
  getData() {
    const context = super.getData();

    context.documents = {};
    for (const extra of context.system.extras) {
      context.documents[extra.id] = Item.get(extra.id);
    }
    for (const power of context.system.hyperstats) {
      context.documents[power.id] = Item.get(power.id);
    }
    for (const power of context.system.hyperskills) {
      context.documents[power.id] = Item.get(power.id);
    }
    for (const power of context.system.miracles) {
      context.documents[power.id] = Item.get(power.id);
    }

    context.CAPACITY_TYPES = CAPACITY_TYPES;
    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    if (!this.isEditable) return;

    const addRefListListener = generateAddRefSheetListener(this, html);

    addRefListListener(
      "extra",
      "extra",
      "system.extras",
      () => this.item.system.extras,
      {
        removeDialogText: "WT.Dialog.RemoveExtra",
      }
    );
    addRefListListener(
      "hyperstat",
      "power",
      "system.hyperstats",
      () => this.item.system.hyperstats,
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
      () => this.item.system.hyperskills,
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
      () => this.item.system.miracles,
      {
        creatable: true,
        newInstanceName: "WT.Dialog.NewMiracle",
        createWith: { system: { powerType: 2 } },
        removeDialogText: "WT.Dialog.RemoveMiracle",
      }
    );
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
        undefined,
        "extra",
        "extra",
        "system.extras",
        () => this.item.system.extras,
        { filter: (item) => item.system.fociOnly }
      );
      await addRefListDropHandler(
        undefined,
        "hyperstat",
        "power",
        "system.hyperstats",
        () => this.item.system.hyperstats,
        { filter: (item) => item.system.powerType == 0 }
      );
      await addRefListDropHandler(
        undefined,
        "hyperskill",
        "power",
        "system.hyperskills",
        () => this.item.system.hyperskills,
        { filter: (item) => item.system.powerType == 1 }
      );
      await addRefListDropHandler(
        undefined,
        "miracle",
        "power",
        "system.miracles",
        () => this.item.system.miracles,
        { filter: (item) => item.system.powerType == 2 }
      );
    }
  }
}
