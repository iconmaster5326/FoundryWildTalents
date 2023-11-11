export function generateAddRefSheetListener(sheet, html) {
  return function (name, itemTypeName, propertyName, getProp, options = {}) {
    html.find(".add-" + name).click((event) => {
      event.preventDefault();
      sheet.actor.update({
        [propertyName]: getProp().concat([{}]),
      });
    });
    html.find(".remove-" + name).click((event) => {
      event.preventDefault();
      const i = Number(event.currentTarget.getAttribute("index"));
      const newArray = getProp()
        .slice(0, i)
        .concat(getProp().slice(i + 1));
      sheet.actor.update({
        [propertyName]: newArray,
      });
    });
    html.find("." + name + "slot").dblclick(async (event) => {
      event.preventDefault();
      const index = Number(event.currentTarget.getAttribute("index"));
      const instance = getProp()[index];
      if (instance.id) {
        // open up existing
        lookup(instance.id).sheet.render(true);
      } else if (options.creatable) {
        // create new embedded
        const newItem = await getDocumentClass("Item").create(
          {
            name: game.i18n.localize(
              options.newInstanceName ?? "WT.Dialog.New"
            ),
            type: itemTypeName,
          },
          { parent: sheet.actor }
        );
        newItem.sheet.render(true);
        const newArray = getProp().slice();
        newArray[index] = {
          ...newArray[index],
          id: newItem.id,
        };
        sheet.actor.update({
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
          return getProp()[index].id;
        },
        callback: async (slot) => {
          var index = Number(slot.attr("index"));
          const id = getProp()[index].id;
          const newArray = getProp().slice();
          newArray[index] = {
            ...newArray[index],
            id: undefined,
          };
          const embedded = sheet.actor.getEmbeddedDocument("Item", id);
          if (embedded) {
            await embedded.delete();
          }
          sheet.actor.update({
            [propertyName]: newArray,
          });
        },
      },
    ]);
  };
}

export function generateAddRefListDropHandler(sheet, item) {
  return function (
    tab,
    name,
    itemTypeName,
    propertyName,
    getProp,
    options = {}
  ) {
    if (item.type == itemTypeName && (options.filter ?? ((_) => true))(item)) {
      const slots = document
        .elementsFromPoint(event.pageX, event.pageY)
        .filter((e) => e.classList.contains(name + "slot"));
      if (slots.length) {
        const index = Number(slots[0].getAttribute("index"));
        const newArray = getProp().slice();
        newArray[index] = {
          ...newArray[index],
          id: item.id,
        };
        sheet.actor.update({
          [propertyName]: newArray,
        });
      } else {
        if (sheet._tabs[0].active == tab) {
          sheet.actor.update({
            [propertyName]: getProp().concat([{ id: item.id }]),
          });
        }
      }
    }
  };
}
