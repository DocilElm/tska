import { DoorTypes, isChunkLoaded } from "./Utils"

export class Door {
    constructor(comp) {
        /** @private */
        this.comp = comp

        // this.explored = false
        this.opened = false
        this.rotation = null
        /**
         * - As of tska `v1.4.1` this does not currently handle
         * door types properly, in the future it will
         */
        this.type = DoorTypes.NORMAL
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
}