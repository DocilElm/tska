import { Render2D } from "../rendering/Render2D"
import { Hud } from "./Hud"
import { ResizableHud } from "./ResizableHud"
import { TextHud } from "./TextHud"

/** @type {HudManager[]} */
const hudManagers = []

const drawCentered = (str, yPadding = 0) => {
    Renderer.drawStringWithShadow(
        str,
        (Renderer.screen.getWidth() - Renderer.getStringWidth(str.removeFormatting())) / 2,
        (Renderer.screen.getHeight() / 2) + yPadding
        )
}

export class HudManager {
    constructor(obj, drawBackground = true) {
        /** @private */
        this.obj = obj
        /** @private */
        this.drawBackground = drawBackground
        /** @private */
        this.gui = new Gui()
        /** @type {Hud[]} @private */
        this.huds = []
        /** @type {Hud?} @private */
        this._selectedHud = null
        /** @private */
        this.backgroundColor = [ 0, 0, 0, 150 ]
        /** @private */
        this.drawCenterText = true

        this.gui.registerClicked(this._onClick.bind(this))
        this.gui.registerScrolled(this._onScroll.bind(this))
        this.gui.registerDraw(this._onDraw.bind(this))

        hudManagers.push(this)
    }

    /** @private */
    _onClick(x, y, mbtn) {
        if (mbtn !== 0) return

        for (let hud of this.huds) {
            if (hud.inBounds(x, y)) {
                this._selectedHud = hud
                break
            } else if (this._selectedHud) {
                this._selectedHud = null
            }
        }
    }

    /** @private */
    _onDragged(dx, dy, mbtn) {
        if (!Client.isInGui() || !this.gui.isOpen() || mbtn !== 0 || !this._selectedHud) return

        this._selectedHud._onDragged(dx, dy)
    }

    /** @private */
    _onScroll(dx, dy, dir) {
        if (!this._selectedHud) return

        this._selectedHud._onScroll(dx, dy, dir)
    }

    /** @private */
    _onDraw(x, y, t) {
        if (this.drawBackground) {
            Render2D.preDrawRect()
            Render2D.colorize(this.backgroundColor[0], this.backgroundColor[1], this.backgroundColor[2], this.backgroundColor[3])
            Render2D.drawRect(0, 0, Renderer.screen.getWidth(), Renderer.screen.getHeight())
            Render2D.postDrawRect()
        }

        for (let hud of this.huds) {
            hud._triggerDraw(x, y)
            hud._drawOutline()
        }

        this.drawListener?.(this._selectedHud)

        if (!this._selectedHud || !this.drawCenterText) return

        drawCentered(`&bCurrently editing&f: &6${this._selectedHud.name}`)

        if (this._selectedHud.text)
            return drawCentered("&eUse &ascroll wheel&e to scale the text in size", 10)

        drawCentered("&eUse &ascroll wheel&e to scale the hud in size", 10)
        if (!this._selectedHud.resizeStep) return

        drawCentered("&eUse &ashift&e + &ascroll wheel&e to change the width size", 20)
        drawCentered("&eUse &actrl&e + &ascroll wheel&e to change the height size", 30)
    }

    /**
     * - Sets the background color for this [HudManager]
     * @param {[r: number, g: number, b: number, a: number]} color rgba array with `0-255` values
     * @returns {this} this for method chaining
     */
    setBackgroundColor(color) {
        this.backgroundColor = color

        return this
    }

    /**
     * - Whether to draw the center text when editing a hud or not. `true` by default
     * @param {boolean} value
     * @returns {this} this for method chaining
     */
    setDrawCenterText(value) {
        this.drawCenterText = value

        return this
    }

    /**
     * - Sets a listener that will get triggered after drawing all the [Hud]s
     * @param {(selectedHud: Hud?) => void} cb
     * @returns {this} this for method chaining
     */
    onDraw(cb) {
        this.drawListener = cb

        return this
    }

    /**
     * * Opens this [HudManager] gui
     * @returns this for method chaining
     */
    open() {
        this.gui.open()
        return this
    }

    /**
     * * Closes this [HudManager] gui
     * @returns this for method chaining
     */
    close() {
        this.gui.close()
        return this
    }

    /**
     * * Checks whether this [HudManager] gui is opened
     * @returns {boolean}
     */
    isOpen() {
        return this.gui.isOpen()
    }

    /**
     * * Saves the data into the [obj]
     * * Note: this does not call `save` in `PogData` you have to do that manually if using `PogData`.
     * if you use `LocalStore` this doesn't matter
     * @returns this for method chaining
     */
    save() {
        for (let hud of this.huds) hud._save(this.obj)
        return this
    }

    /**
     * * Makes a hud that can be dragged and scaled
     * @param {string} name
     * @param {number?} x
     * @param {number?} y
     * @param {number?} width
     * @param {number?} height
     * @returns {Hud}
     */
    createHud(name, x = 0, y = 0, width = 0, height = 0) {
        const hud = new Hud(name, this.obj[name] ?? { x, y, width, height })
        this.huds.push(hud)

        return hud
    }

    /**
     * * Makes a hud that can be dragged and scaled as well as having custom resize logic
     * * i.e. if you `shift` + `scroll` it'll make the `width` go up/down, same with `ctrl` + `scroll` it'll do the same with `height`
     * @param {string} name
     * @param {number?} x
     * @param {number?} y
     * @param {number?} width
     * @param {number?} height
     * @returns {ResizableHud}
     */
    createResizableHud(name, x = 0, y = 0, width = 0, height = 0) {
        const hud = new ResizableHud(name, this.obj[name] ?? { x, y, width, height })
        this.huds.push(hud)

        return hud
    }

    /**
     * Makes a hud that can be dragged and scaled for strings
     * @param {string} name
     * @param {number?} x
     * @param {number?} y
     * @param {string} text
     * @returns {TextHud}
     */
    createTextHud(name, x = 0, y = 0, text) {
        const hud = new TextHud(name, this.obj[name] ?? { x, y }, text)
        this.huds.push(hud)

        return hud
    }
}

register("dragged", (dx, dy, _, __, mbtn) => {
    for (let manager of hudManagers) manager._onDragged(dx, dy, mbtn)
})

register("gameUnload", () => {
    for (let manager of hudManagers) manager.save()
})