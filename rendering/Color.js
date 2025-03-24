import { DGlStateManager } from "./DGlStateManager"

/**
 * Get a dynamic color object from an Amaterasu Setting
 * @param {object} settings The settings instance, not the config
 * @param {string} configName 
 * @returns {ColorContainer} Assign this to a constant reference so the listener can keep updating it
 */
export function amaterasuListener(settings, configName) {
    const color = new ColorContainer(settings[configName])
    settings.getConfig().registerListener(configName, (_, curr) => color.set(curr))
    return color
}

/**
 * - A handler for colors
 * - Especially useful with listeners
 * - Cuts down multiple operations compared to rgba array when using for rendering
 */
export class ColorContainer {
    /**
     * @param {number[]|ColorContainer} obj 
     * @returns array of RGBA within [0, 255]
     */
    static normal255(obj) {
        if (Array.isArray(obj)) return obj.map(comp => comp)
        else if (obj instanceof ColorContainer) return obj.rgba255
    }

    /**
     * @param {number[]|ColorContainer} obj 
     * @returns array of RGBA within [0, 1]
     */
    static normal1(obj) {
        if (Array.isArray(obj)) return obj.map(comp => comp / 0xff)
        else if (obj instanceof ColorContainer) return obj.rgba1
    }

    /**
     * Colors the stack where the obj can be an rgba array of [0, 255]
     * @param {number[]|ColorContainer} obj 
     */
    static color255(obj) {
        if (Array.isArray(obj)) return DGlStateManager.color(obj[0] / 255, obj[1] / 255, obj[2] / 255, obj[3] / 255)
        else if (obj instanceof ColorContainer) return obj.glColor()
    }

    /**
     * Colors the stack where the obj can be an rgba array of [0, 1]
     * @param {number[]|ColorContainer} obj 
     */
    static color1(obj) {
        if (Array.isArray(obj)) return DGlStateManager.color(obj[0], obj[1], obj[2], obj[3])
        else if (obj instanceof ColorContainer) return obj.glColor()
    }

    /**
     * @param {[number, number, number, number]} rgba255Array 4 ints within [0, 255]
     * @returns {number} 0xRRGGBBAA, int between [0, 2^32)
     */
    static toHex(rgba255Array) {
        const [r, g, b, a] = rgba255Array

        return r * 0x1000000
             + g * 0x10000
             + b * 0x100
             + a * 0x1
    }

    /**
     * @param {number} int 0xRRGGBBAA, int between [0, 2^32)
     * @returns {[number, number, number, number]} 4 ints within [0, 255]
     */
    static toRGBA(int) {
        return [
            int >> 24 & 0xff,
            int >> 16 & 0xff,
            int >> 8  & 0xff,
            int >> 0  & 0xff
        ]
    }

    /** @param {[number, number, number, number]} rgba255Array 4 ints within [0, 255] */
    constructor(rgba255Array) {
        this.set(rgba255Array)
    }

    /** @returns {[number, number, number, number]} 4 ints within [0, 255] */
    getRGBA255() {
        return this.rgba255
    }

    /** @returns {[number, number, number, number]} 4 floats within [0, 1] */
    getRGBA1() {
        return this.rgba1
    }

    /**
     * - Standard use
     * - This hex is formatted an [0xRRGGBBAA] int
     * @returns {number} int between [0, 2^32)
     */
    getHex() {
        return this.rgbaHex
    }

    /**
     * - Use only for MCFontRenderer and CTRenderer
     * - This hex is formatted as [0xAARRGGBB] int instead of [0xRRGGBBAA] int
     * @returns {number} int between [0, 2^32)
     */
    getFontHex() {
        return this.argbHex
    }

    /**
     * - Transform the color to the array's components
     * @param {[number, number, number, number]} rgbaArray 4 ints between [0, 255]
     */
    set(rgba255Array) {
        if (typeof(rgba255Array) === "number") return this.set(ColorContainer.toRGBA(rgba255Array))
        if (!rgba255Array.every(comp => comp === parseInt(comp))) return this.set(rgba255Array.map(comp => comp * 0xff))

        const r = rgba255Array[0] & 0xff
        const g = rgba255Array[1] & 0xff
        const b = rgba255Array[2] & 0xff
        const a = rgba255Array[3] & 0xff

        this.rgba255 = [r, g, b, a]
        this.rgba1 = [r / 0xff, g / 0xff, b / 0xff, a / 0xff]
        this.rgbaHex = ColorContainer.toHex([r, g, b, a])
        this.argbHex = ColorContainer.toHex([a, r, g, b])
    }

    /**
     * - Colorizes the GL stack with this color
     * - Setting alpha here can help with multiple drawings on the same stack using the same color
     */
    glColor() {
        DGlStateManager.color(this.rgba1[0], this.rgba1[1], this.rgba1[2], this.rgba1[3])
    }
}