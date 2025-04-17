/**
 * @author [nwjn](https://github.com/nwjn)
 */
export class Method {
    /**
     * - Calls a wrapped java reflected method once
     * - For single-use calls
     * @param {JavaTClass} instance class or instance
     * @param {string} methodName 
     * @param {...any} params parameters used during method invocation
     * @returns {?any} value returned by method, if any
     */
    static callMethod(instance, methodName, ...params) {
        return new Method(instance, methodName).call(instance, params)
    }

    /**
     * - Gets an accessible wrapped java reflected method
     * @param {JavaTClass} instance class or instance
     * @param {string} methodName 
     */
    constructor(instance, methodName) {
        this.property = instance.class.getDeclaredMethod(methodName)
    }

    /**
     * - Accesses and calls the wrapped java reflected method
     * @param {JavaTClass} instance class or instance
     * @param {...any} params parameters used during method invocation
     * @returns {?any} value returned by method, if any
     */
    call(instance, ...params) {
        if (!instance) return console.warn("Reflected Java Methods require an instance parameter to access this caller")

        const value = this.property.invoke(instance, params)

        return value
    }
}