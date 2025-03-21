const InventoryBasic = net.minecraft.inventory.InventoryBasic
const GuiChest = net.minecraft.client.gui.inventory.GuiChest

/**
 * - Class to make a fake chest menu with the specified rows
 * @link Code mostly taken from [ChestMenu](https://chattriggers.com/modules/v/ChestMenu) module
 */
export class ChestGui {
    constructor(name, rows = 4) {
        /** @private */
        this.items = []
        /** @private */
        this.slots = rows * 9
        /** @private */
        this._inventory = new InventoryBasic(name.addColor(), true, this.slots)
        /** @private */
        this._gui = null
    }

    /**
     * - Sets the title for this ChestGui
     * @param {string} title The title with color codes if wanted
     * @returns {this} this for method chaining
     */
    setTitle(title) {
        this._inventory./* setCustomName */func_110133_a(title.addColor())

        return this
    }

    /**
     * - Sets the given item at the specified slot
     * @param {number} idx The slot that is being changed
     * @param {?MCItem|Item} item The item to set it to
     * @returns {this} this for method chaining
     */
    setItem(idx, item) {
        if (idx < 0 || idx >= this.slots) return
        if (item instanceof Item) item = item.itemStack

        this.items[idx] = item
        this._inventory./* setInventorySlotContents */func_70299_a(idx, item || null)

        return this
    }

    /**
     * - Sets all of the items from the specified array into the ChestGui
     * @param {MCItem[]|Item[]} items The item to set it to
     * @returns {this} this for method chaining
     */
    setItems(items) {
        this.clearItems()
        
        for (let item of items) {
            this.setItem(item)
        }

        return this
    }

    /**
     * - Clears all the items from the ChestGui
     * @returns {this} this for method chaining
     */
    clearItems() {
        this.items = []
        this._inventory./* clear */func_174888_l()

        return this
    }

    /**
     * - Opens the gui for this ChestGui
     * - Note: If the gui is not created before this call (which it should not be)
     * it will be created on first call then after that it opens the saved gui
     */
    open() {
        if (!this._gui) {
            this._gui = new JavaAdapter(GuiChest, {
                // cancel all [keyTyped] inputs and only listen for
                // [ESC] and inventory key (Default is E so whenever E is pressed close gui)
                /* keyTyped */func_73869_a(_, keycode) {
                    if (keycode === 1 || keycode === this./* mc */field_146297_k./* gameSettings */field_71474_y./* keyBindInventory */field_151445_Q./* getKeyCode */func_151463_i()) {
                        Player.getPlayer()./* closeScreen */func_71053_j()
                    }
                },
                // cancel [handleMouseInput] so the user cannot click in the gui
                /* handleMouseInput */func_146274_d() {}
            }, Player.getPlayer()./* inventory */field_71071_by, this._inventory)
        }

        GuiHandler.openGui(this._gui)
    }
}