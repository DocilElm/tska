import { Hud } from "./Hud"

export class TextHud extends Hud {
    constructor(name, obj, text) {
        super(name, obj)
        /** 
         * - IMPORTANT! if you're using this field as a setter, please avoid doing so and call `setText` instead
         * this will set this hud as dirty so the text size can be re-calculated
         * @private
         */
        this.text = text

        this._getTextSize()
    }

    /**
     * - Gets the text string for this [TextHud]
     * @returns {string}
     */
    getText() {
        return this.text
    }

    /**
     * - Sets the text for this [TextHud] as well as calling the function
     * to re-calculate the size of the text
     * @param {string} text
     * @returns {this} this for method chaining
     */
    setText(text) {
        this.text = text
        this._getTextSize()

        return this
    }

    /** @private */
    _getTextSize() {
        this.width = Renderer.getStringWidth(this.text) * this.scale
        const m = this.text.match(/\n/g)
        if (m == null) return this.height = 9 * this.scale
        this.height = (9 * (m.length + 1)) * this.scale
        this.width = 0
        this.text.split("\n").forEach((it) => {
            this.width = Math.max(this.width, Renderer.getStringWidth(it) * this.scale)
        })
    }

    /** @private */
    _triggerDraw(x, y) {
        this._onHover(x, y)
        this._onDraw?.(this.x, this.y, this.text)
    }

    /**
     * Adds a listeners that triggers whenever this [Hud] is being drawn in the editing gui
     * @param {(x: number, y: number, text: string) => void} cb
     * @returns {this} this for method chaining
     */
    onDraw(cb) {
        super.onDraw(cb)

        return this
    }
}