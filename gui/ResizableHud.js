import { Hud } from "./Hud"

export class ResizableHud extends Hud {
    constructor(name, obj) {
        super(name, obj)
        /** @private */
        this.resizeStep = 1
    }

    /** @private */
    _triggerDraw(x, y) {
        this.onDraw?.(this.x, this.y, this.width, this.height)
        super._triggerDraw(x, y)
    }

    /**
     * - Sets the [resizedStep] of this [Hud]
     * - Default is `1`
     * @param {number} value
     * @returns {this} this for method chaining
     */
    setResizeStep(value) {
        this.resizeStep = value

        return this
    }

    /**
     * - Sets the [width] for this [Hud]
     * @param {number} width
     * @returns {this} this for method chaining
     */
    setWidth(width) {
        this.width = width

        return this
    }

    /**
     * - Sets the [height] for this [Hud]
     * @param {number} height
     * @returns {this} this for method chaining
     */
    setHeight(height) {
        this.height = height

        return this
    }

    /**
     * - Sets the [width] and/or [height] for this [Hud]
     * - If either [width] or [height] param is null it will skip setting it
     * @param {number?} width
     * @param {number?} height
     * @returns {this} this for method chaining
     */
    setSize(width = null, height = null) {
        if (width !== null) this.width = width
        if (height !== null) this.height = height

        return this
    }

    /** @private */
    _onScroll(dx, dy, dir) {
        const isShiftDown = Client.isShiftDown()
        const isControlDown = Client.isControlDown()
        if (isShiftDown || isControlDown) {
            let k = isShiftDown ? "width" : "height"
            if (dir === 1) this[k] += this.resizeStep
            else this[k] -= this.resizeStep
            return
        }

        super._onScroll(dx, dy, dir)
    }
}