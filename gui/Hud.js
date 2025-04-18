import { Render2D } from "../rendering/Render2D"

export class Hud {
    constructor(name, obj) {
        /** @private */
        this.name = name
        /** @private */
        this.x = obj.x ?? 0
        /** @private */
        this.y = obj.y ?? 0
        /** @private */
        this.scale = obj.scale ?? 1
        /** @private */
        this.width = obj.width ?? 0
        /** @private */
        this.height = obj.height ?? 0
        /** @private */
        this.shouldDrawBounds = true
        /** @private */
        this.scaleStep = 0.02

        /** @private */
        this._onDraw = null
        /** @private */
        this._hasFocus = false
        /** @private */
        this._hovering = false
        /** @private */
        this._normalOutline = [70, 70, 70, 255]
        /** @private */
        this._hoverOutline = [150, 150, 150, 255]
    }

    /**
     * - Sets whether this hud should draw its own boundaries as outline
     * @param {boolean} value
     * @returns {this} this for method chaining
     */
    setShouldDrawOutline(value) {
        this.shouldDrawBounds = value

        return this
    }

    /**
     * - Sets the scale step whenever scrolling on this [Hud]
     * - Default is set to `0.02` steps per scroll
     * @param {number} value
     * @returns {this} this for method chaining
     */
    setScaleStep(value) {
        this.scaleStep = value

        return this
    }

    /**
     * - Sets the hover outline color for this [Hud]
     * @param {[r: number, g: number, b: number, a: number]} color rgba array with `0-255` values
     * @returns {this} this for method chaining
     */
    setHoverColor(color) {
        this._hoverOutline = color

        return this
    }

    /**
     * - Sets the normal outline color for this [Hud]
     * @param {[r: number, g: number, b: number, a: number]} color rgba array with `0-255` values
     * @returns {this} this for method chaining
     */
    setNormalColor(color) {
        this._normalOutline = color

        return this
    }

    /**
     * Adds a listeners that triggers whenever this [Hud] is being drawn in the editing gui
     * @param {(x: number, y: number, width: number, height: number) => void} cb 
     * @returns {this} this for method chaining
     */
    onDraw(cb) {
        this._onDraw = cb

        return this
    }

    /**
     * @returns {number}
     */
    getX() {
        return this.x ?? 0
    }

    /**
     * @returns {number}
     */
    getY() {
        return this.y ?? 0
    }

    /**
     * @returns {number}
     */
    getWidth() {
        return this.width ?? 0
    }

    /**
     * @returns {number}
     */
    getHeight() {
        return this.height ?? 0
    }

    /**
     * @returns {number}
     */
    getScale() {
        return this.scale ?? 1
    }

    /**
     * * Gets the position of this [Hud] taking into consideration the scale factor
     * @returns {number[]}
     */
    getPos() {
        return [ this.x, this.y, this.width * this.scale, this.height * this.scale ]
    }

    /**
     * * Gets the boundaries of this [Hud]
     * * Note: the scaling factor is only applied to the `width` and `height`
     * @returns {number[]}
     */
    getBounds() {
        return [
            this.x,
            this.y,
            this.x + this.width * this.scale,
            this.y + this.height * this.scale
        ]
    }

    /**
     * * Checks whether the given `x, y` are in the bounds of this [Hud]
     * @returns {boolean}
     */
    inBounds(x, y) {
        const [ x1, y1, x2, y2 ] = this.getBounds()
        return x >= x1 && x <= x2 && y >= y1 && y <= y2
    }

    /** @private */
    _save(obj) {
        obj[this.name] = {
            x: this.getX(),
            y: this.getY(),
            scale: this.getScale(),
            width: this.getWidth(),
            height: this.getHeight()
        }
    }

    /** @private */
    _drawOutline() {
        if (!this.shouldDrawBounds) return

        Render2D.preDrawRect()
        const colors = this._hovering ? this._hoverOutline : this._normalOutline
        Render2D.colorize(colors[0], colors[1], colors[2], colors[3])
        Render2D.drawRect(this.x - 1.5, this.y - 1.5, (this.width + 1.5) * this.scale, (this.height + 1.5) * this.scale, false)
        Render2D.postDrawRect()
    }

    /** @override */
    _triggerDraw(x, y) {
        this._hovering = this.inBounds(x, y)
    }

    /** @override */
    _onScroll(dx, dy, dir) {
        if (dir === 1) {
            this.scale += this.scaleStep
            return
        }

        this.scale -= this.scaleStep
    }

    /** @private */
    _onDragged(dx, dy) {
        this.x = Math.max(0, Math.min(this.x + dx, Renderer.screen.getWidth() - (this.width * this.scale)))
        this.y = Math.max(0, Math.min(this.y + dy, Renderer.screen.getHeight() - (this.height * this.scale)))
    }
}