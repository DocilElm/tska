import EventListener from "../event/EventListener"
import { C17PacketWriter } from "../packet/C17PacketWriter"
import { S3FPacketReader } from "../packet/S3FPacketReader"

const apiErrors = [
    "DISABLED",
    "INTERNAL_SERVER_ERROR",
    "RATE_LIMITED",
    "INVALID_PACKET_VERSION",
    "NO_LONGER_SUPPORTED",
]
const apiEnvs = ["PRODUCTION", "BETA", "TEST"]
const apiPartyRoles = ["LEADER", "MOD", "MEMBER"]
const internalKey = "tska@_modapi_"
const channelVersions = {
    "hypixel:hello": null,
    "hypixel:ping": 1,
    "hypixel:party_info": 2,
    "hypixel:player_info": 1,
    "hyevent:location": 1,
    "hypixel:register": 1
}
const channelRegex = /^((?:hypixel|hyevent):)/
const allowedChannels = new Set(["hello", "ping", "party_info", "player_info", "location"])

EventListener
    .createEvent(`${internalKey}:error`)
    .createEvent(`${internalKey}:environment`)
    .createEvent(`${internalKey}:pong`)
    .createEvent(`${internalKey}:partyinfo`)
    .createEvent(`${internalKey}:playerinfo`)
    .createEvent(`${internalKey}:location`)

const sendPacket = (packet) => {
    const clientHandler = Client.getMinecraft()./* getNetHandler */func_147114_u()
    if (!clientHandler) return

    Client.scheduleTask(() => clientHandler./* addToSendQueue */func_147297_a(packet))

    return true
}

export default new class ModAPI {
    constructor() {
        this.packetReg = register("packetReceived", (packet) => {
            const reader = new S3FPacketReader(packet)
            try {
                if (channelRegex.test(reader.getChannelName())) {
                    const channel = reader.getChannelName().replace(channelRegex, "")
                    if (!allowedChannels.has(channel)) return
                    this[`_${channel}`](reader)
                }
            } finally {
                reader.release()
            }
        }).setFilteredClass(net.minecraft.network.play.server.S3FPacketCustomPayload)

        this.worldReg = register("worldLoad", () => {
            this.sendRegister({ "hyevent:location": 1 })
            this.worldReg.unregister()
        }).unregister()

        this.on("environment", () => {
            this.worldReg.register()
        })
    }

    /** @private */
    _handleBase(packet) {
        if (!packet.readBoolean()) {
            EventListener.post(`${internalKey}:error`, apiErrors[packet.readVarInt() + 1])
            return
        }

        const requiredVersion = channelVersions[packet.getChannelName()]
        const packetVersion = packet.readVarInt()
        if (requiredVersion != null && packetVersion !== requiredVersion) return

        return 1
    }

    /**
     * @param {import("../packet/S3FPacketReader").S3FPacketReader} packet
     * @private
     */
    _hello(packet) {
        EventListener.post(`${internalKey}:environment`, apiEnvs[packet.readVarInt()])
    }

    /**
     * @param {import("../packet/S3FPacketReader").S3FPacketReader} packet
     * @private
     */
    _ping(packet) {
        if (!this._handleBase(packet)) return

        EventListener.post(`${internalKey}:pong`, packet.readString())
    }

    /**
     * @param {import("../packet/S3FPacketReader").S3FPacketReader} packet
     * @private
     */
    _party_info(packet) {
        if (!this._handleBase(packet)) return

        const inParty = packet.readBoolean()
        const partyMembers = {}

        if (inParty) {
            const count = packet.readVarInt()

            for (let idx = 0; idx < count; idx++) {
                partyMembers[packet.readUUID()] = apiPartyRoles[packet.readVarInt()]
            }
        }

        EventListener.post(`${internalKey}:partyinfo`, inParty, partyMembers)
    }

    /**
     * @param {import("../packet/S3FPacketReader").S3FPacketReader} packet
     * @private
     */
    _player_info(packet) {
        if (!this._handleBase(packet)) return

        EventListener.post(
            `${internalKey}:playerinfo`,
            packet.readVarInt(), // rank
            packet.readVarInt(), // rank package
            packet.readVarInt(), // monthly rank package
            packet.readCheckString() // prefix
        )
    }

    /**
     * @param {import("../packet/S3FPacketReader").S3FPacketReader} packet
     * @private
     */
    _location(packet) {
        if (!this._handleBase(packet)) return

        EventListener.post(
            `${internalKey}:location`,
            packet.readString(), // server name
            packet.readCheckString(), // server type
            packet.readCheckString(), // lobby name
            packet.readCheckString(), // mode
            packet.readCheckString() // map
        )
    }

    /** @private */
    _createWriter(channelName) {
        const writer = new C17PacketWriter(channelName)
        const requiredVersion = channelVersions[channelName]
        if (requiredVersion != null)
            writer.writeVarInt(requiredVersion)

        return writer
    }

    /** @private */
    _queuePacket(channel) {
        return sendPacket(this._createWriter(channel).toPacket())
    }

    /**
     * - Runs the specified listener whenever the specified event is triggered
     * @param {"error"|"environment"|"pong"|"partyinfo"|"playerinfo"|"location"} eventName
     * @param {(args: ...any) => void} cb
     * @returns {this} this for method chaining
     */
    on(eventName, cb) {
        EventListener.on(`${internalKey}:${eventName}`, cb)

        return this
    }

    /**
     * - Runs the specified listener only once whenever the specified event is triggered
     * @param {"error"|"environment"|"pong"|"partyinfo"|"playerinfo"|"location"} eventName
     * @param {(args: ...any) => void} cb
     * @returns {this} this for method chaining
     */
    once(eventName, cb) {
        EventListener.once(`${internalKey}:${eventName}`, cb)

        return this
    }

    /**
     * - Removes the listener from the specified event name list
     * @param {"error"|"environment"|"pong"|"partyinfo"|"playerinfo"|"location"} eventName
     * @param {(args: ...any) => void} cb
     * @returns {boolean} Whether or not the listener was successfully deleted
     */
    remove(eventName, cb) {
        return EventListener.remove(`${internalKey}:${eventName}`, cb)
    }

    /**
     * - Sends the `ping` packet to the server
     * @returns {boolean} Whether the packet was successfully sent or not
     */
    requestPing() {
        return this._queuePacket("hypixel:ping")
    }

    /**
     * - Sends the `player_info` packet to the server
     * @returns {boolean} Whether the packet was successfully sent or not
     */
    requestPlayerInfo() {
        return this._queuePacket("hypixel:player_info")
    }

    /**
     * - Sends the `party_info` packet to the server
     * @returns {boolean} Whether the packet was successfully sent or not
     */
    requestPartyInfo() {
        return this._queuePacket("hypixel:party_info")
    }

    /** @param {{[key: string]: number}} obj */
    sendRegister(obj) {
        const write = this._createWriter("hypixel:register")
        write.writeObj(obj)
        return sendPacket(write.toPacket())
   }
}