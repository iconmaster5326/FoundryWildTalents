import {
  WTItemSheet,
  generateAddRefListDropHandler,
  generateAddRefSheetListener,
} from "./sheets.mjs";

const SHEET_HTML = "systems/wildtalents/templates/wt-archetype-sheet.hbs";

export class WTArchetypeSheet extends WTItemSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: SHEET_HTML,
      classes: ["wildtalents", "archetype"],
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

    context.documents = {};
    for (const mq of context.system.sources) {
      context.documents[mq.id] = Item.get(mq.id);
    }
    for (const mq of context.system.permissions) {
      context.documents[mq.id] = Item.get(mq.id);
    }
    for (const mq of context.system.intrinsics) {
      context.documents[mq.id] = Item.get(mq.id);
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

    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    if (!this.isEditable) return;

    const addRefListListener = generateAddRefSheetListener(this, html);

    addRefListListener(
      "source",
      "metaquality",
      "system.sources",
      () => this.item.system.sources,
      {
        // creatable: true,
        // newInstanceName: "WT.Dialog.NewSource",
        // createWith: { system: { metaQualityType: 0 } },
        removeDialogText: "WT.Dialog.RemoveSource",
      }
    );
    addRefListListener(
      "permission",
      "metaquality",
      "system.permissions",
      () => this.item.system.permissions,
      {
        // creatable: true,
        // newInstanceName: "WT.Dialog.NewPermission",
        // createWith: { system: { metaQualityType: 1 } },
        removeDialogText: "WT.Dialog.RemovePermission",
      }
    );
    addRefListListener(
      "intrinsic",
      "metaquality",
      "system.intrinsics",
      () => this.item.system.intrinsics,
      {
        // creatable: true,
        // newInstanceName: "WT.Dialog.NewIntrinsic",
        // createWith: { system: { metaQualityType: 2 } },
        removeDialogText: "WT.Dialog.RemoveIntrinsic",
      }
    );
  }

  /** @override */
  _onDropItem(event, itemInfo) {
    if (!this.isEditable) return;

    if (itemInfo.type == "Item") {
      const itemID = itemInfo.uuid.slice("Item.".length);
      const item = Item.get(itemID);
      if (!item) return;

      const addRefListDropHandler = generateAddRefListDropHandler(this, item);

      addRefListDropHandler(
        "metaqualities",
        "source",
        "metaquality",
        "system.sources",
        () => this.item.system.sources,
        { filter: (item) => item.system.metaQualityType == 0 }
      );
      addRefListDropHandler(
        "metaqualities",
        "permission",
        "metaquality",
        "system.permissions",
        () => this.item.system.permissions,
        { filter: (item) => item.system.metaQualityType == 1 }
      );
      addRefListDropHandler(
        "metaqualities",
        "intrinsic",
        "metaquality",
        "system.intrinsics",
        () => this.item.system.intrinsics,
        { filter: (item) => item.system.metaQualityType == 2 }
      );
    }
  }
}
