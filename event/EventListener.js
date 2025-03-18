/**
 * - Similar to [EventEmitter] though not really
 * - Its functionality is to be able to post events for those listening for that specific event
 */
export default new class EventListener {
    constructor() {
        /** @private */
        this.eventListeners = new HashMap()

        register("gameUnload", () => {
            this._clearListeners()
        })
    }

    /**
     * - Adds a custom named event to the event list
     * - Used to setup an event before being able to use it
     * @param {string} name
     * @returns {this} this for method chaining
     */
    createEvent(name) {
        if (!name || !(name instanceof String)) throw `[TSKA] "${name}" is not a valid event name or string.`
        if (this.eventListeners.has(name)) throw `[TSKA] event with name "${name}" already exists.`

        this.eventListeners.put(name, [])

        return this
    }

    /**
     * - Posts an event with the given [eventName] to trigger the listeners
     * @param {string} eventName The event name that was previously created for listening
     * @param  {...any} args The arguments for this event to pass through the listeners
     * @returns {this} this for method chaining
     */
    post(eventName, ...args) {
        if (!this.eventListeners.has(eventName)) throw `[TSKA] event with name "${eventName}" does not exist.`

        const callbacks = this.eventListeners.get(eventName)
        for (let event of callbacks)
            event(...args)

        return this
    }

    /**
     * - Runs the specified listener whenever the specified event is triggered
     * @param {string} eventName The event name that was previously created for listening
     * @param {(...args) => void} listener The callback function that will trigger
     * @returns {this} this for method chaining
     */
    on(eventName, listener) {
        if (!this.eventListeners.has(eventName)) throw `[TSKA] event with name "${eventName}" does not exist.`
        if (!(listener instanceof Function)) throw `[TSKA] listener "${listener}" is not a valid function.`

        this.eventListeners.get(eventName).push(listener)

        return this
    }

    /**
     * - Runs the specified listener only once whenever the specified event is triggered
     * @param {string} eventName The event name that was previously created for listening
     * @param {(...args) => void} listener The callback function that will trigger
     * @returns {this} this for method chaining
     */
    once(eventName, listener) {
        if (!this.eventListeners.has(eventName)) throw `[TSKA] event with name "${eventName}" does not exist.`
        if (!(listener instanceof Function)) throw `[TSKA] listener "${listener}" is not a valid function.`

        const eventList = this.eventListeners.get(eventName)
        const idx = eventList.length - 1
        eventList.push((...args) => {
            listener(...args)
            eventList.splice(idx, 1)
        })

        return this
    }

    /**
     * - Removes the listener from the specified event name list
     * @param {string} eventName The event name that was previously created for listening
     * @param {(...args) => void} listener 
     * @returns {boolean} Whether or not the listener was successfully deleted
     */
    remove(eventName, listener) {
        if (!this.eventListeners.has(eventName)) throw `[TSKA] event with name "${eventName}" does not exist.`
        if (!(listener instanceof Function)) throw `[TSKA] listener "${listener}" is not a valid function.`

        const eventList = this.eventListeners.get(eventName)
        const idx = eventList.find((it) => it === listener)

        if (idx === -1) return false

        eventList.splice(idx, 1)

        return true
    }

    /** @private */
    _clearListeners() {
        this.eventListeners.clear()
    }
}