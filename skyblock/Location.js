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

                const newSubArea = name.toLowerCase()
                if (newSubArea !== this.subarea) {
                    for (let cb of this._onSubarea)
                        cb(newSubArea)
                }

                this.subarea = newSubArea
            })
            .on("tabadd", (name) => {
                if (!/^Area|Dungeon: [\w ]+$/.test(name)) return

                const newArea = name.toLowerCase().replace(/(area|dungeon): /, "")

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
     * @param {string} world The world from the `TabList` to check for
     * @returns {boolean}
     */
    inWorld(world) {
        if (!World.isLoaded() || !this.area) return false

        return this.area === world.toLowerCase().removeFormatting()
    }

    /**
     * - Checks whether the player is currently at the specified `Area`
     * @param {string} area The area from the `Scoreboard` to check for
     * @returns {boolean}
     */
    inArea(area) {
        if (!World.isLoaded() || !this.subarea) return false

        return this.subarea.includes(area.toLowerCase().removeFormatting())
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