const PacketBuffer = net.minecraft.network.PacketBuffer

export class S3FPacketReader {
    constructor(packet) {
        this.channelName = packet./* getChannelName */func_149169_c()
        this.buff = new PacketBuffer(packet./* getBufferData */func_180735_b().copy())
    }

    /** @returns {string} */
    getChannelName() {
        return this.channelName
    }

    /** @returns {number} */
    readVarInt() {
        return this.buff./* readVarIntFromBuffer */func_150792_a()
    }

    /** @returns {string} */
    readUUID() {
        return this.buff./* readUuid */func_179253_g().toString()
    }

    /** @returns {string} */
    readString() {
        return this.buff./* readStringFromBuffer */func_150789_c(32767)
    }

    /** @returns {boolean} */
    readBoolean() {
        return this.buff.readBoolean()
    }

    /**
     * - Checks whether the string exists or not before passing it through
     * - If the string does not it returns `null` instead otherwise the `string`
     * @returns {?string}
     */
    readCheckString() {
        return this.readBoolean() ? this.readString() : null
    }

    /** - might just be self explanatory */
    release() {
        this.buff.release()
    }
}