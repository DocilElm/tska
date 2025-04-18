import { Hud } from "./Hud"

export class TextHud extends Hud {
    constructor(name, obj, text) {
        super(name, obj)
        this.text = text

        this._getTextSize()
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
        this._onDraw?.(this.x, this.y, this.text)
        super._triggerDraw(x, y)
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