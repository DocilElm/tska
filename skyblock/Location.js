const S38PacketPlayerListItem = net.minecraft.network.play.server.S38PacketPlayerListItem

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
        // Getting world/area data on `/ct load`
        // trigger the corresponding listeners
        this.registers.push(
            register("gameLoad", () => {
                if (!World.isLoaded()) return

                // Getting the area
                Scoreboard.getLines()
                    ?.map(line => line?.getName()?.removeFormatting()?.replace(/[^\u0000-\u007F]/g, ""))
                    ?.forEach(it => {
                        const match = it?.match(/^  (\w.+)$/)?.[1]
                        if (!match) return

                        this.subarea = match.toLowerCase()
                        for (let cb of this._onSubarea)
                            cb(this.subarea)
                    })

                // Getting the world
                TabList.getNames()
                    ?.forEach(it => {
                        const match = it?.removeFormatting()?.match(/^(Area|Dungeon): ([\w\d ]+)$/)?.[2]
                        if (!match) return

                        this.area = match.toLowerCase().replace(/(area|dungeon): /, "")
                        for (let cb of this._onArea)
                            cb(this.area)
                    })
            })
        )

        // Getting scoreboard subarea
        this.registers.push(
            register("packetReceived", (packet) => {
                const channel = packet./* getAction */func_149307_h()
                if (channel !== 2) return

                const teamStr = packet./* getName */func_149312_c()
                const teamMatch = teamStr.match(/^team_(\d+)$/)
                if (!teamMatch) return

                const formatted = packet./* getPrefix */func_149311_e().concat(packet./* getSuffix */func_149309_f())
                const unformatted = formatted.removeFormatting()

                if (!/^ (⏣|ф)/.test(unformatted)) return

                this.subarea = unformatted.toLowerCase()
                for (let cb of this._onSubarea)
                    cb(this.subarea)
            }).setFilteredClass(net.minecraft.network.play.server.S3EPacketTeams)
        )

        // Getting tablist area
        this.registers.push(
            register("packetReceived", (packet) => {
                const players = packet./* getEntries */func_179767_a()
                const action = packet./* getAction */func_179768_b()

                if (action !== S38PacketPlayerListItem.Action.ADD_PLAYER) return

                players.forEach(addPlayerData => {
                    const name = addPlayerData./* getDisplayName */func_179961_d()

                    if (!name) return

                    const formatted = name./* getFormattedText */func_150254_d()
                    const unformatted = formatted.removeFormatting()

                    if (!/^Area|Dungeon: [\w ]+$/.test(unformatted)) return
                    if (action !== S38PacketPlayerListItem.Action.ADD_PLAYER) return

                    this.area = unformatted.toLowerCase().replace(/(area|dungeon): /, "")
                    for (let cb of this._onArea)
                        cb(this.area)
                })
            }).setFilteredClass(S38PacketPlayerListItem)
        )

        // Reset both variables
        this.registers.push(
            register("worldUnload", () => {
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