/**
 * @author [nwjn](https://github.com/nwjn)
 */
export class Field {
    /**
     * - Calls a wrapped java reflected field once
     * - For single-use calls
     * @param {JavaTClass} instance class or instance
     * @param {string} fieldName
     * @returns {?any} value returned by field, if any
     */
    static getFieldValue(instance, fieldName) {
        return new Field(instance, fieldName).get(instance)
    }

    /**
     * - Calls a wrapped java reflected field once
     * - For single-use calls
     * @param {JavaTClass} instance class or instance
     * @param {string} fieldName
     */
    static setFieldValue(instance, fieldName, value) {
        return new Field(instance, fieldName).set(instance, value)
    }

    /**
     * - Gets an accessible wrapped java reflected field
     * @param {JavaTClass} instance class or instance
     * @param {string} fieldName
     */
    constructor(instance, fieldName) {
        this.property = instance.class.getDeclaredField(fieldName)
        this.property.setAccessible(true)
    }

    /**
     * - Accesses and returns the value on this field
     * @param {JavaTClass} instance class or instance
     * @returns {?any} value returned by field, if any
     */
    get(instance) {
        if (!instance) return console.warn("Reflected Java Fields require an instance parameter to access this getter")

        const value = this.property.get(instance)

        return value
    }

    /**
     * - Accesses and set the value on this field
     * @param {JavaTClass} instance class or instance
     * @param {any} value
     */
    set(instance, value) {
        if (!instance) return console.warn("Reflected Java Fields require an instance parameter to access this setter")

        this.property.set(instance, value)
    }
}