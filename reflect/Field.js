/**
 * - Gets an accessible wrapped java reflected field
 * @param {JavaTClass} instance class or instance
 * @param {string} fieldName 
 * @returns {WrappedJavaMethod}
 */
export function getField(instance, fieldName) {
    return new WrappedJavaField(instance, fieldName)
}

/**
 * - Calls a wrapped java reflected field once
 * - For single-use calls
 * @param {JavaTClass} instance class or instance
 * @param {string} fieldName
 * @returns {?any} value returned by field, if any
 */
export function getFieldValue(instance, fieldName) {
    return new WrappedJavaField(instance, fieldName).get(instance)
}

/**
 * - Calls a wrapped java reflected field once
 * - For single-use calls
 * @param {JavaTClass} instance class or instance
 * @param {string} fieldName
 */
export function setFieldValue(instance, fieldName, value) {
    return new WrappedJavaField(instance, fieldName).set(instance, value)
}

/** @internal */
class WrappedJavaField {
    /**
     * @param {JavaTClass} instance class or instance
     * @param {string} fieldName 
     */
    constructor(instance, fieldName) {
        this.property = instance.class.getDeclaredField(fieldName)
        this.shouldLeaveOpen = this.property.isAccessible()
    }

    /**
     * - Accesses and returns the value on this field
     * @param {JavaTClass} instance class or instance
     * @returns {?any} value returned by field, if any
     */
    get(instance) {
        if (!instance) return console.warn("Reflected Java Fields require an instance parameter to access this getter")
        /* Resetting accessibility because it is better practice despite it being largely unnecessary */

        if (!this.shouldLeaveOpen) this.property.setAccessible(true)
        const value = this.property.get(instance)
        if (!this.shouldLeaveOpen) this.property.setAccessible(false)

        return value
    }

    /**
     * - Accesses and set the value on this field
     * @param {JavaTClass} instance class or instance
     * @param {any} value
     */
    set(instance, value) {
        if (!instance) return console.warn("Reflected Java Fields require an instance parameter to access this setter")
        /* Resetting accessibility because it is better practice despite it being largely unnecessary */

        if (!this.shouldLeaveOpen) this.property.setAccessible(true)
        this.property.set(instance, value)
        if (!this.shouldLeaveOpen) this.property.setAccessible(false)
    }
}