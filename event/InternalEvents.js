import EventListener from "./EventListener"

const S38PacketPlayerListItem = net.minecraft.network.play.server.S38PacketPlayerListItem

/**
 * - This class handles _most_ of the events used by `tska`'s internal system.
 * - i.e. listening for a tab update or a tab addition these type of things is what
 * this class will handle
 * - If you are a developer which is trying to use any of these functionalities just know that
 * they weren't meant for you to use rather the internal system so if they do not work
 * that is your problem not `tska`'s
 * @private
 */
export default new class InternalEvent {

    constructor() {
        /** @private */
        this.events = []
        this.eventKey = "tska@_internal_"

        this
            .createEvent("ctload")
            .createEvent("scoreboard")
            .createEvent("tabadd")
            .createEvent("tabupdate")
            .init()
    }

    /** @private */
    init() {
        this.push(
            register("gameLoad", () => {
                // If world is not loaded this means that the user didn't /ct load
                // so we return because this should only work during /ct load
                if (!World.isLoaded()) return

                this.post("ctload")

                // Trigger tab/scoreboard listeners since on load no packets will be sent
                // and the user might've already gotten the packet that we need
                Scoreboard?.getLines()?.forEach((it) => {
                    const name = it.getName()
                    if (!name) return

                    this.post("scoreboard", name.removeFormatting(), name)
                })

                TabList?.getNames()?.forEach((it) => {
                    if (!it) return

                    this.post("tabadd", it.removeFormatting(), it)
                    this.post("tabupdate", it.removeFormatting(), it)
                })
            })
        )
        .push(
            register("gameUnload", () => {
                this.unregister()
            })
        )
        .push(
            register("packetReceived", (packet, event) => {
                const channel = packet./* getAction */func_149307_h()
                if (channel !== 2) return

                const teamStr = packet./* getName */func_149312_c()
                const teamMatch = teamStr.match(/^team_(\d+)$/)
                if (!teamMatch) return

                const formatted = packet./* getPrefix */func_149311_e().concat(packet./* getSuffix */func_149309_f())
                const unformatted = formatted.removeFormatting()

                this.post("scoreboard", unformatted, formatted, event)
            }).setFilteredClass(net.minecraft.network.play.server.S3EPacketTeams)
        )
        .push(
            register("packetReceived", (packet, event) => {
                const players = packet./* getEntries */func_179767_a()
                const action = packet./* getAction */func_179768_b()

                if (!(action === S38PacketPlayerListItem.Action.ADD_PLAYER || action === S38PacketPlayerListItem.Action.UPDATE_DISPLAY_NAME)) return
                let eventName = "tabadd"
                if (action === S38PacketPlayerListItem.Action.UPDATE_DISPLAY_NAME) eventName = "tabupdate"

                players.forEach(addPlayerData => {
                    const name = addPlayerData./* getDisplayName */func_179961_d()

                    if (!name) return

                    const formatted = name./* getFormattedText */func_150254_d()
                    const unformatted = formatted.removeFormatting()

                    this.post(eventName, unformatted, formatted, event)
                })
            }).setFilteredClass(S38PacketPlayerListItem)
        )
    }

    /** @private */
    push(reg) {
        this.events.push(reg)

        return this
    }
    
    /** @private */
    unregister() {
        for (let event of events)
            event.unregister()
    }

    post(eventName, ...args) {
        EventListener.post(`${this.eventKey}:${eventName}`, ...args)

        return this
    }

    createEvent(eventName) {
        EventListener.createEvent(`${this.eventKey}:${eventName}`)

        return this
    }

    on(eventName, cb) {
        EventListener.on(`${this.eventKey}:${eventName}`, cb)

        return this
    }

    once(eventName, cb) {
        EventListener.once(`${this.eventKey}:${eventName}`, cb)

        return this
    }

    remove(eventName, cb) {
        return EventListener.remove(`${this.eventKey}:${eventName}`, cb)
    }
}