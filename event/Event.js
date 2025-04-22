const customEvents = new Map()

/**
 * * A class that handles events and custom events
 */
export class Event {
    /**
     * - Creates a new custom event with the specified name
     * - The callback MUST return a register
     * @param {string} eventName
     * @param {(...args) => any} cb
     */
    static createEvent(eventName, cb) {
        customEvents.set(eventName.toLowerCase(), cb)
    }

    constructor(eventName, cb, ...args) {
        /** @private */
        this.name = eventName
        /** @private */
        this.cb = cb
        /** @private */
        this.args = args

        /** @private */
        this.isCustom = customEvents.get(eventName.toLowerCase())

        /** @private */
        this.hasRegistered = false
        /** @private */
        this._register = this.isCustom?.(cb, ...(args || [])) || register(eventName, cb)
        /** @private */
        this.isArray = Array.isArray(this._register)

        this.isCustom
            ? this.isArray
                ? this._register.forEach((it) => it.unregister())
                : this._register.unregister()
            : this._register.unregister()
    }

    /**
     * - Registers this event
     * - Note: If the event is already registered it skips registering it
     * @returns {this} this for method chaining
     */
    register() {
        if (this.isRegistered()) return this

        if (this.isArray) {
            for (let reg of this._register)
                reg.register()
            this.hasRegistered = true

            return this
        }

        this._register.register()
        this.hasRegistered = true

        return this
    }

    /**
     * - Unregisters this event
     * - Note: If the event is already unregistered it skips unregistering it
     * @returns {this} this for method chaining
     */
    unregister() {
        if (!this.isRegistered()) return this

        if (this.isArray) {
            for (let reg of this._register)
                reg.unregister()
            this.hasRegistered = false

            return this
        }

        this._register.unregister()
        this.hasRegistered = false

        return this
    }

    /**
     * - Whether this event has been registered or not
     * @returns {boolean}
     */
    isRegistered() {
        return this.hasRegistered
    }
}

// Shh don't tell anyone about this
import "./CustomEvents"