import Location from "../skyblock/Location"
import { Event } from "./Event"

export class Feature {
    /**
     * - Class that handles event based utilities
     * - For example waiting for the proper world to be loaded in order
     * - to register the event/subevents
     * @param {?string|string[]} area The required area for this Feature (if left empty it will not check)
     * @param {?string|string[]} subarea The required subarea for this Feature (if left empty it will not check)
     */
    constructor(area = null, subarea = null) {
        /** @private */
        this.isAreaArray = Array.isArray(area)
        /** @private */
        this.isSubareaArray = Array.isArray(subarea)

        /** @private */
        this.area = this.isAreaArray
            ? area.map((it) => it.toLowerCase().removeFormatting())
            : area?.toLowerCase()?.removeFormatting()
        /** @private */
        this.subarea = this.isSubareaArray
            ? subarea.map((it) => it.toLowerCase().removeFormatting())
            : subarea?.toLowerCase()?.removeFormatting()
        /** @private */
        this.hasRegistered = false
        /** @private */
        this.events = []
        /** @private */
        this.subevents = []
        /** @private */
        this._onRegister = []
        /** @private */
        this._onUnregister = []
        /** @private */
        this._dirty = false
    }

    /**
     * - Checks whether the given [areaName] matches with this Feature's
     * required area.
     * @private
     * @param {string} areaName
     * @returns {boolean}
     */
    _checkArea(areaName) {
        if (!this.area) return true
        if (!areaName) return false

        if (this.isAreaArray) return this.area.some((it) => it === areaName)

        return areaName === this.area
    }

    /**
     * - Checks whether the given [subareaName] matches with this Feature's
     * required subarea.
     * @private
     * @param {string} subareaName
     * @returns {boolean}
     */
    _checkSubarea(subareaName) {
        if (!this.subarea) return true
        if (!subareaName) return false

        if (this.isSubareaArray) return this.subarea.some((it) => subareaName.includes(it))

        return subareaName.includes(this.subarea)
    }

    /**
     * - Internal use.
     * - Registers all of the events and triggers the listener for this Feature
     * - Only registers the events if it should and if they haven't been registered before-hand
     * @private
     * @returns this for method chaining
     */
    _register() {
        if (this.hasRegistered) return this
        if (!this.events.length) {
            // Schedule this action to the next time there's an actual event
            this._dirty = true
            return this
        }

        for (let event of this.events) event.register()
        for (let listener of this._onRegister) listener?.()

        this.hasRegistered = true

        return this
    }

    /**
     * - Internal use.
     * - Unregisters all of the events and subevents for this Feature
     * - Only unregisters if the events have been registered before-hand
     * @private
     * @returns this for method chaining
     */
    _unregister() {
        if (!this.hasRegistered) return this

        for (let subevent of this.subevents) subevent[0].unregister()
        for (let event of this.events) event.unregister()
        for (let listener of this._onUnregister) listener?.()

        this.hasRegistered = false

        return this
    }

    /**
     * - Adds an event to this Feature with the specified
     * [eventName] [args] and [callback] function
     * @param {string} eventName
     * @param {(args: any) => void} cb
     * @param  {...any} args
     * @returns {this} this for method chaining
     */
    register(eventName, cb, ...args) {
        this.events.push(new Event(eventName, cb, ...args).unregister())
        if (this._dirty) {
            this.onSubareaChange(Location.subarea)
            this._dirty = false
        }

        return this
    }

    /**
     * - Adds a sub event to this Feature with the specified
     * [eventName] [args] [callback] function and [registerWhen] function
     * - This will only get registered if the [registerWhen] function returns `true`
     * on `update()` call
     * @param {string} eventName
     * @param {(args: any) => void} cb
     * @param {() => boolean} registerWhen
     * @param  {...any} args
     * @returns {this} this for method chaining
     */
    registersub(eventName, cb, registerWhen, ...args) {
        this.subevents.push([new Event(eventName, cb, ...args).unregister(), registerWhen])
        if (this._dirty) {
            this.onSubareaChange(Location.subarea)
            this._dirty = false
        }

        return this
    }

    /**
     * - Calls the given function whenever this Feature's events have been registered
     * @param {() => void} fn
     * @returns this for method chaining
     */
    onRegister(cb) {
        this._onRegister.push(cb)

        return this
    }

    /**
     * - Calls the given function whenever this Feature's events have been unregistered
     * @param {() => void} fn
     * @returns this for method chaining
     */
    onUnregister(cb) {
        this._onUnregister.push(cb)

        return this
    }

    /**
     * - Checks whether the changed [areaName] matches with this
     * Feature's [area] and/or [subarea] then registers or unregisters the events
     * @param {string} areaName
     * @returns {this} this for method chaining
     */
    onAreaChange(areaName) {
        if (!this._checkArea(areaName)) return this._unregister()
        if (!this._checkSubarea(Location.subarea)) return this._unregister()

        this._register()

        return this
    }

    /**
     * - Checks whether the changed [subareaName] matches with this
     * Feature's [subarea] and/or [area] then registers or unregisters the events
     * @param {string} subareaName
     * @returns {this} this for method chaining
     */
    onSubareaChange(subareaName) {
        if (!this._checkSubarea(subareaName)) return this._unregister()
        if (!this._checkArea(Location.area)) return this._unregister()

        this._register()

        return this
    }

    /**
     * - Calls all of the subevents for update
     * - Each subevent's function is ran to see whether it should be registered or not
     * @returns this for method chaining
     */
    update() {
        for (let subevent of this.subevents) {
            let [ event, registerWhen ] = subevent
            if (!registerWhen()) {
                event.unregister()
                continue
            }

            event.register()
        }

        return this
    }
}