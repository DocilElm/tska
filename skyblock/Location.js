import InternalEvents from "../event/InternalEvents"

/**
 * - Class with utilities for the location of the player in skyblock
 */
export default new class Location {
    constructor() {
        /** @private */
        this.registers = []
        /** @private */
        this._onArea = []
        /** @private */
        this._onSubarea = []

        /** @private */
        this._registered = true

        this.area = null
        this.subarea = null

        this._init()
    }

    /** @private */
    _init() {
        this.registers.push(register("gameUnload", () => {
            this._unregister()
        }))

        InternalEvents
            .on("scoreboard", (name) => {
                if (!/^ (⏣|ф)/.test(name)) return

                const newSubArea = name
                if (newSubArea !== this.subarea) {
                    for (let cb of this._onSubarea)
                        cb(newSubArea)
                }

                this.subarea = newSubArea
            })
            .on("tabadd", (name) => {
                const match = name.match(/^(?:Area|Dungeon): ([\w ]+)$/)
                if (!match) return

                const newArea = match[1]

                if (newArea !== this.area) {
                    for (let cb of this._onArea)
                        cb(newArea)
                }
                this.area = newArea
            })

        // Reset both variables
        this.registers.push(
            register("worldUnload", () => {
                // Don't trigger more than once
                if (!this.area && !this.subarea) return

                this.area = null
                this.subarea = null

                for (let cb of this._onArea)
                    cb()

                for (let cb of this._onSubarea)
                    cb()
            })
        )
    }

    /** @private */
    _unregister() {
        for (let reg of this.registers)
            reg.unregister()
    }

    /**
     * - Checks whether the player is currently at the specified `World`
     * @param {string|string[]} world The world from the `TabList` to check for
     * @param {boolean} lowerCase Whether to force check lower case (`true` by default)
     * @param {boolean} forceSb Whether to force this returning `true` only if the user is inside skyblock (`true` by default)
     * @returns {boolean}
     */
    inWorld(world, lowerCase = true, forceSb = true) {
        if (!World.isLoaded()) return false
        if (!this.area && forceSb) return false
        else if (!this.area) return true

        if (Array.isArray(world)) {
            if (lowerCase) return world.some((it) => it.toLowerCase().removeFormatting() === this.area.toLowerCase())
            return world.some((it) => it.removeFormatting() === this.area)
        }

        if (lowerCase) return this.area?.toLowerCase() === world.toLowerCase().removeFormatting()

        return this.area === world.removeFormatting()
    }

    /**
     * - Checks whether the player is currently at the specified `Area`
     * @param {string|string[]} area The area from the `Scoreboard` to check for
     * @param {boolean} lowerCase Whether to force check lower case (`true` by default)
     * @param {boolean} forceSb Whether to force this returning `true` only if the user is inside skyblock (`true` by default)
     * @returns {boolean}
     */
    inArea(area, lowerCase = true, forceSb = true) {
        if (!World.isLoaded()) return false
        if (!this.subarea && forceSb) return false
        else if (!this.subarea) return true

        if (Array.isArray(area)) {
            if (lowerCase) return area.some((it) => it.removeFormatting().toLowerCase().includes(this.subarea.toLowerCase()))
            return area.some((it) => it.removeFormatting().includes(this.subarea))
        }

        if (lowerCase) return this.subarea.toLowerCase().includes(area.toLowerCase().removeFormatting())

        return this.subarea.includes(area.removeFormatting())
    }

    /**
     * - Triggers the specified callback whenever the `World` changes (`TabList` area)
     * @param {(world: ?string) => void} cb The callback function
     * @returns {this} this for method chaining
     */
    onWorldChange(cb) {
        this._onArea.push(cb)

        return this
    }

    /**
     * - Calls the specified callback whenever the `Area` changes (`Scoreboard` area)
     * @param {(area: ?string) => void} cb The callback function
     * @returns {this} this for method chaining
     */
    onAreaChange(cb) {
        this._onSubarea.push(cb)

        return this
    }
}