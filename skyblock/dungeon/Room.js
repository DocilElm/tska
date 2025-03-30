import { SetArray } from "../../collections/SetArray"
import { DataStore } from "../../storage/DataStore"
import { Checkmark, ClearTypes, MapColorToRoomType, RoomTypes, RoomTypesStrings, componentToRealCoords, getCore, getHighestY, getRoomShape, halfRoomSize, isChunkLoaded, rotateCoords } from "./Utils"

const offsets = [[-halfRoomSize, -halfRoomSize], [halfRoomSize, -halfRoomSize], [halfRoomSize, halfRoomSize], [-halfRoomSize, halfRoomSize]]
const roomsJson = DataStore.fromFileOrUrl("tska", "data/rooms.json", "https://raw.githubusercontent.com/DocilElm/Doc-Data/refs/heads/main/dungeons/rooms.json", 86400000)

export class Room {
    constructor(comp, height) {
        /** @private */
        this.comps = []
        /** @private */
        this.rcomps = []
        /** @private */
        this.height = height
        /** @private */
        this.cores = []

        // Room data
        this.explored = false
        this.name = null
        this.corner = null
        this.rotation = null
        this.type = RoomTypes.UNKNOWN
        this.clear = null
        this.roomData = null
        this.shape = "1x1"
        this.secrets = 0
        this.crypts = 0
        this.checkmark = Checkmark.UNEXPLORED
        this.players = new SetArray()

        // Init
        this.addComponents(comp)
    }

    /** @private */
    loadFromData(roomData) {
        this.roomData = roomData
        this.name = roomData.name
        this.type = RoomTypesStrings.get(roomData.type) ?? RoomTypes.NORMAL
        this.secrets = roomData.secrets
        this.cores = roomData.cores
        // this.roomID = roomData.roomID
        this.clear = roomData.clear == "mob" ? ClearTypes.MOB : ClearTypes.MINIBOSS
        this.crypts = roomData.crypts ?? 0
    }

    /** @private */
    loadFromCore(core) {
        for (let data of roomsJson) {
            if (!data.cores.includes(core)) continue

            this.loadFromData(data)
            return true
        }

        return false
    }

    /** @private */
    loadFromMapColor(color) {
        this.type = MapColorToRoomType.get(color) ?? RoomTypes.NORMAL

        if (this.type === RoomTypes.BLOOD) this.loadFromData(roomsJson.find((it) => it.name === "Blood"))
        if (this.type === RoomTypes.ENTRANCE) this.loadFromData(roomsJson.find((it) => it.name === "Entrance"))

        return this
    }

    /**
     * - Scans the room's components to get its core and data
     * @private
     * @returns {this} this for method chaining
     */
    scan() {
        for (let c of this.rcomps) {
            let [ x, z ] = c
            if (!this.height) this.height = getHighestY(x, z)

            this.loadFromCore(getCore(x, z))
        }

        return this
    }

    /**
     * - Checks whether the specified component is in this room's data
     * @param {number} x
     * @param {number} z
     * @returns {this} this for method chaining
     */
    hasComponent(x, z) {
        for (let idx = 0; idx < this.comps.length; idx++) {
            let [ x1, z1 ] = this.comps[idx]

            if (x === x1 && z === z1) return true
        }

        return false
    }

    /**
     * - Adds a component to this room's data
     * @private
     * @param {[x: number, z: number]} comp
     * @returns {this} this for method chaining
     */
    addComponent(comp, update = true) {
        if (this.hasComponent(comp[0], comp[1])) return this

        this.comps.push(comp)

        if (update) this._update()

        return this
    }

    /**
     * - Adds all the components inside the specified array to this room's data
     * @private
     * @param {[x: number, z: number][]} comps
     * @returns {this} this for method chaining
     */
    addComponents(comps) {
        for (let comp of comps) this.addComponent(comp, false)
        this._update()

        return this
    }

    /** @private */
    _update() {
        this.comps.sort((a, b) => a[1] - b[1]).sort((a, b) => a[0] - b[0])
        this.rcomps = this.comps.map((c) => componentToRealCoords(c, false))
        this.scan()
        this.shape = getRoomShape(this.comps)

        this.corner = null
        this.rotation = null
    }

    /**
     * - Attempts to find the rotation for this room
     * @private
     * @returns
     */
    findRotation() {
        if (!this.height) return

        if (this.type === RoomTypes.FAIRY) {
            this.rotation = 0
            let [ x, z ] = this.rcomps[0]
            this.corner = [ x - halfRoomSize + 0.5, this.height, z - halfRoomSize + 0.5 ]
            return
        }

        for (let idx = 0; idx < this.rcomps.length; idx++) {
            let [ x, z ] = this.rcomps[idx]

            for (let jdx = 0; jdx < offsets.length; jdx++) {
                let [ dx, dz ] = offsets[jdx]
                let [ nx, nz ] = [ x + dx, z + dz ]

                if (!isChunkLoaded(nx, this.height, nz)) return

                let block = World.getBlockAt(nx, this.height, nz)
                if (block.type.getID() !== 159 || block.getMetadata() !== 11) continue

                this.rotation = jdx * 90
                this.corner = [ nx + 0.5, this.height, nz + 0.5 ]
                return
            }
        }
    }

    /**
     * - Converts a set of position to relative rotated coordinates
     * @param {[x: number, y: number, z: number]} pos
     * @returns {[x: number, y: number, z: number]}
     */
    fromPos(pos) {
        if (this.rotation === null || !this.corner) return

        return rotateCoords(pos.map((it, idx) => Math.floor(it) - Math.floor(this.corner[idx])), this.rotation)
    }

    /**
     * - Converts relative component positions into rotated world position
     * @param {[x: number, y: number, z: number]} comp
     * @returns {[x: number, y: number, z: number]}
     */
    fromComp(comp) {
        if (this.rotation === null || !this.corner) return

        const rotated = rotateCoords(comp, 360 - this.rotation)

        return rotated.map((it, idx) => Math.floor(it) + Math.floor(this.corner[idx]))
    }

    /**
     * - Converts a set of position to relative rotated coordinates
     * @alias fromPos
     * @param {[x: number, y: number, z: number]} pos
     * @returns {[x: number, y: number, z: number]}
     */
    getRoomCoord(pos) {
        return this.fromPos(pos)
    }

    /**
     * - Converts relative component positions into rotated world position
     * @alias fromComp
     * @param {[x: number, y: number, z: number]} comp
     * @returns {[x: number, y: number, z: number]}
     */
    getRealCoord(comp) {
        return this.fromComp(comp)
    }
}