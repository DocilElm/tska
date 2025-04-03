const PacketBuffer = net.minecraft.network.PacketBuffer

export class C17PacketWriter {
    constructor(channelName) {
        this.channelName = channelName
        this.buff = new PacketBuffer(Java.type("io.netty.buffer.Unpooled").buffer())
    }

    /** @param {number} n */
    writeVarInt(n) {
        this.buff./* writeVarIntToBuffer */func_150787_b(n)
    }

    /** @param {string} s */
    writeString(s) {
        this.buff.func_180714_a(s)
    }

    /** @param {{[key: string]: number}} obj */
    writeObj(obj) {
        const entries = Object.entries(obj)
        this.writeVarInt(entries.length)

        entries.forEach(([event, version]) => {
            this.writeString(event)
            this.writeVarInt(version)
        })
    }

    /**
     * - Converts this buffer into a `MCC17PacketCustomPayload`
     * @returns {*} `MCC17PacketCustomPayload`
     */
    toPacket() {
        return new (net.minecraft.network.play.client.C17PacketCustomPayload)(this.channelName, this.buff)
    }
}