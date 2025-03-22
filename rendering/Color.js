const JavaColor = Java.type("java.awt.Color")

export class Color {
    /** @param {[number, number, number, number]} rgbaArray */
    constructor(rgbaArray) {
        // Need to reverse because u32 converts it from ABGR
        this.u8View = new Uint8ClampedArray(rgbaArray.slice().reverse())
        this.u32View = new Uint32Array(this.u8View.buffer)

        this._recompute()
    }

    /** @returns {[number, number, number, number]} 4 ints between [0, 255] */
    getRGBA() {
        return Array.from(this.u8View.values())
    }

    /** @returns {number} [0xRRGGBBAA] int between [0, 2^32) */
    getHex() {
        return this.u32View[0]
    }

    /** @returns {JavaTColor} */
    getJavaColor() {
        return new JavaColor(this.u8View[0], this.u8View[1], this.u8View[2], this.u8View[3])
    }

    /**
     * - Use only for drawing strings
     * - This hex is formatted as [0xAARRGGBB] instead of [0xRRGGBBAA]
     * @returns {number} int between [0, 2^32)
     */
    getColorForFont() {
        return this.argbHex
    }

    /**
     * - Transform the color to the hex/int
     * @param {number} u32int [0xRRGGBBAA] int between [0, 2^32)
     */
    setFromHex(u32int) {
        this.u32View[0] = u32int
        this.u8View.reverse()
        
        this._recompute()
    }

    /**
     * - Transform the color to the array's components
     * @param {[number, number, number, number]} rgbaArray 4 ints between [0, 255]
     */
    setFromRGBA(rgbaArray) {
        this.u8View = new Uint8Array(rgbaArray.slice().reverse())
        
        this._recompute()
    }

    /**
     * - Colorizes the GL stack with this color
     * - Changing alpha here can help with some drawings
     * @param {?number} alpha scaled float between [0, 1]
     */
    glColor(alpha = this.f32View[3]) {
        GlStateManager./* color */func_179131_c(
            this.f32View[0],
            this.f32View[1],
            this.f32View[2],
            alpha
        )
    }

    /** @private @internal*/
    _recompute() {
        this.f32View = Array.from(this.u8View.values(), c => c / 0xff)

        const argb = new Uint8ClampedArray([this.u8View[3], this.u8View[0], this.u8View[1], this.u8View[2]])
        this.argbHex = new Uint32Array(argb.buffer)[0]
    }
}