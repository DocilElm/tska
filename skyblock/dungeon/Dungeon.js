import InternalEvents from "../../event/InternalEvents"
import Location from "../Location"

// (Username, Class | DEAD | EMPTY, Level)
const playerTabRegex = /^(?:[^\x00-\x7F])?(?:\[\d+\] )?(?:\[\w+\] )?(\w{1,16})(?: [^\x00-\x7F])? \((\w+ ([IVXLCDM]+)|EMPTY|DEAD)\)$/
const ItemMap = net.minecraft.item.ItemMap
const mapMaxX = net.minecraft.network.play.server.S34PacketMaps.class.getDeclaredField(/* mapMaxX */"field_179735_f")
const mapMaxY = net.minecraft.network.play.server.S34PacketMaps.class.getDeclaredField(/* mapMaxY */"field_179736_g")
mapMaxX.setAccessible(true)
mapMaxY.setAccessible(true)

InternalEvents.createEvent("mapdata")

export default new class Dungeon {
    constructor() {
        this.reset()
        this._init()
    }

    /** @private */
    reset() {
        this.partyMembers = []
        this.players = {}
        this.icons = {}
        this.mapData = null
        this.mapCorners = null
        this.mapRoomSize = null
        this.mapGapSize = null
        this.floor = null
        this.floorNumber = null
    }

    /** @private */
    _init() {
        InternalEvents.on("tabadd", (msg) => this.onTabPacket(msg))
        InternalEvents.on("tabupdate", (msg) => this.onTabPacket(msg))
        InternalEvents.on("scoreboardclear", (msg) => {
            if (this.floor) return
            const match = msg.match(/^  The Catacombs \((\w\d)\)$/)
            if (!match) return

            this.floor = match[1]
            this.floorNumber = +this.floor[1]
        })

        register("packetReceived", (packet) => {
            if (!this.floor) return
            const [ x, y ] = [ mapMaxX.get(packet), mapMaxY.get(packet) ]
            // TicTacToe map MaxX and MaxY are [ 128, 128 ]
            // though something to consider is that 128 is not only for TicTacToe so we check for 0, 0 instead
            // Dungeon map should always be MaxX and MaxY [ 0, 0 ]
            if (x !== 0 || y !== 0) return

            this.mapData = ItemMap./* loadMapData */func_150912_a(packet./* getMapId */func_149188_c(), World.getWorld())

            InternalEvents.post("mapdata", this.mapData)
        }).setFilteredClass(net.minecraft.network.play.server.S34PacketMaps)

        InternalEvents.on("mapdata", (data) => this.updateMapIcons(data))

        Location.onWorldChange((world) => {
            if (world === "catacombs") return

            this.reset()
        })
    }

    /** @private */
    onTabPacket(msg) {
        if (!this.floor) return

        const match = msg?.match(playerTabRegex)
        if (!match) return

        const [ _, playerName, className, classLevel ] = match

        if (this.partyMembers.indexOf(playerName) === -1) {
            this.partyMembers.push(playerName)
        }
        if (!className) return

        this.players[playerName] = {
            className,
            level: classLevel,
            name: playerName
        }
    }

    /** @private */
    getMapCorners() {
        if (!this.mapData) return

        const colors = this.mapData./* colors */field_76198_e
        if (!colors) return

        const pixelIdx = colors.findIndex((a, i) => a === 30 && i + 15 < colors.length && colors[i + 15] === 30 && i + 128 * 15 < colors.length && colors[i + 15 * 128] === 30)
        if (pixelIdx === -1) return

        let idx = 0
        while (colors[pixelIdx + idx] === 30) idx++

        this.mapRoomSize = idx
        this.mapGapSize = this.mapRoomSize + 4

        let x = (pixelIdx % 128) % this.mapGapSize
        let y = Math.floor(pixelIdx / 128) % this.mapGapSize

        if ([0, 1].includes(this.floorNumber)) x += this.mapGapSize
        if (this.floorNumber === 0) y += this.mapGapSize

        this.mapCorners = [ x, y ]
    }

    /** @private */
    updateMapIcons(mapData) {
        if (!mapData) return

        if (!this.mapCorners) this.getMapCorners()

        let iconOrder = [...this.partyMembers]
        iconOrder.push(iconOrder.shift())
        iconOrder = iconOrder.filter((it) => it?.className !== "DEAD")
        if (iconOrder.length < 1) return

        try {
            const decorators = mapData./* mapDecorations */field_76203_h
            this.icons = {}

            decorators.forEach((iconName, vec4b) => {
                const match = iconName.match(/^icon-(\d+)$/)
                if (!match) return

                const iconNumber = match[1] >> 0
                const player = iconNumber < iconOrder.length ? iconOrder[iconNumber] : null

                this.icons[iconName] = {
                    x: vec4b.func_176112_b() + 128,
                    y: vec4b.func_176113_c() + 128,
                    rotation: (vec4b.func_176111_d() * 360) / 16 + 180,
                    player
                }
            })
        } catch (ignore) {}
    }
}