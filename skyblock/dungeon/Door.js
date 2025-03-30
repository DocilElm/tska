import { DoorTypes, isChunkLoaded } from "./Utils"

export class Door {
    constructor(comp) {
        /** @private */
        this.comp = comp

        // this.explored = false
        this.opened = false
        this.rotation = null
        this.type = DoorTypes.NORMAL

        if (comp[0] !== 0 && comp[1] !== 0) this.checkType()
    }

    /**
     * - Gets the real world position of this door
     * @returns {[x: number, y: number, z: number]}
     */
    getPos() {
        return [ this.comp[0], 69, this.comp[1] ]
    }

    /**
     * - Gets the component's position of this door
     * @returns {[x: number, z: number]}
     */
    getComp() {
        return [ this.comp[2], this.comp[3] ]
    }

    /**
     * - Sets the door type
     * @param {number} type
     * @returns {this} this for method chaining
     */
    setType(type) {
        this.type = type

        return this
    }

    /**
     * - Checks whether this door is opened or not
     * @returns
     */
    check() {
        let [ x, y, z ] = this.getPos()
        if (!isChunkLoaded(x, y, z)) return

        this.opened = World.getBlockAt(x, y, z).type.getID() === 0
    }

    /** @private */
    checkType() {
        const [ x, y, z ] = this.getPos()
        if (!isChunkLoaded(x, y, z)) return

        const id = World.getBlockAt(x, y, z).type.getID()

        if (id === 0 || id === 166) return

        if (id === 97) this.type = DoorTypes.ENTRANCE
        if (id === 173) this.type = DoorTypes.WITHER
        if (id === 159) this.type = DoorTypes.BLOOD

        this.opened = false
    }
}