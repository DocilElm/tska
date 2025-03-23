import Location from "../Location"
import { Door } from "./Door"
import { Room } from "./Room"
import { DoorTypes, RoomTypes, directions, getHighestY, getScanCoords, isChunkLoaded, realCoordToComponent } from "./Utils"

/**
 * - Utilities for getting the current location of the player inside of dungeons
 */
export default new class DungeonScanner {
    constructor() {
        /** @private */
        this.currentRoom = null
        /** @type {Room[]} @private */
        this.rooms = new Array(36).fill(null)
        /** @type {Door[]} @private */
        this.doors = new Array(60).fill(null)
        /** @private */
        this.availablePos = getScanCoords()

        /** @private */
        this._roomEnterListener = []
        /** @private */
        this._roomLeaveListener = []

        /** @private */
        this.lastIdx = null
        /** @private */
        this.tickRegister = register("tick", () => {
            const [ x, z ] = realCoordToComponent([Player.getX(), Player.getZ()])
            const idx = 6 * z + x

            // Scan rooms
            this.scan()
            // TODO: optimize these
            // Find their rotations if not found on first scan
            this.checkRoomState()
            // Checks whether a door is opened or not
            this.checkDoorState()

            // Outside the room's bounds since only 36 total rooms is possible
            // this means that the player is either on an unknown place or in boss room
            // so we can unregister ourselves
            if (idx > 35) this.tickRegister.unregister()

            if (
                this.lastIdx !== null &&
                this.lastIdx !== idx &&
                this.rooms[this.lastIdx]?.name !== this.rooms[idx]?.name
                ) {
                for (let cb of this._roomLeaveListener) cb(this.rooms[idx], this.rooms[this.lastIdx])
            }
            if (this.lastIdx === idx) return

            if (this.rooms[this.lastIdx]?.name !== this.rooms[idx]?.name) {
                for (let cb of this._roomEnterListener) cb(this.rooms[idx])
            }
            this.lastIdx = idx
            this.currentRoom = this.rooms[idx]
        }).unregister()

        Location.onWorldChange((world) => {
            if (!world || world !== "catacombs") {
                this.reset()
                return
            }

            this.tickRegister.register()
        })
    }

    /**
     * - Resets this DungeonScanner's data to default state
     */
    reset() {
        this.tickRegister.unregister()
        this.availablePos = getScanCoords()
        this.rooms.fill(null)
        this.doors.fill(null)
        this.currentRoom = null
        this.lastIdx = null
    }

    /**
     * @param {(room: ?Room) => void} cb
     * @returns {this} this for method chaining
     */
    onRoomEnter(cb) {
        this._roomEnterListener.push(cb)

        return this
    }

    /**
     * @param {(newRoom: ?Room, oldRoom: ?Room)} cb
     * @returns {this} this for method chaining
     */
    onRoomLeft(cb) {
        this._roomLeaveListener.push(cb)

        return this
    }

    /**
     * @param {(newRoom: ?Room, oldRoom: ?Room)} cb
     * @returns {this} this for method chaining
     */
    onRoomLeave(cb) {
        this._roomLeaveListener.push(cb)

        return this
    }

    /**
     * - Gets the room the player is currently in
     * @returns {?Room}
     */
    getCurrentRoom() {
        return this.currentRoom
    }

    /**
     * - Gets the room that is located at the specified index
     * - Note: Room index can only go between `0` and `35`
     * @param {number} idx
     * @returns {?Room}
     */
    getRoomAtIdx(idx) {
        if (idx < 0 || idx > 35) return

        return this.rooms[idx]
    }

    /**
     * - Gets the room that is located at the specified room component
     * @param {[x: number, z: number]} comp
     * @returns {?Room}
     */
    getRoomAtComp(comp) {
        const idx = this.getRoomIdx(comp)
        if (idx < 0 || idx > 35) return

        return this.rooms[idx]
    }

    /**
     * - Gets the room located at the specified world position
     * @param {number} x
     * @param {number} z
     * @returns {?Room}
     */
    getRoomAt(x, z) {
        const idx = this.getRoomIdx([x, z])
        if (idx < 0 || idx > 35) return

        return this.rooms[idx]
    }

    /**
     * - Gets the index of the specified component
     * @param {[x: number, z: number]} comp
     * @returns {number}
     */
    getDoorIdx(comp) {
        const idx = (comp[0] - 1 >> 1) + 6 * comp[1]

        return idx - Math.floor(idx / 12)
    }

    /**
     * - Gets the room that is located at the specified door component
     * @param {[x: number, z: number]} comp
     * @returns {?Door}
     */
    getDoorAtComp(comp) {
        const idx = this.getDoorIdx(comp)
        if (idx < 0 || idx > 59) return

        return this.doors[idx]
    }

    /**
     * - Gets the door that is located at the specified index
     * - Note: Doom index can only go between `0` and `59`
     * @param {number} idx
     * @returns {?Door}
     */
    getDoorAtIdx(idx) {
        if (idx < 0 || idx > 59) return

        return this.doors[idx]
    }

    /**
     * - Gets the door that is located at the specified world position
     * @param {number} x
     * @param {number} z
     * @returns {?Door}
     */
    getDoorAt(x, z) {
        const idx = this.getDoorIdx([x, z])
        if (idx < 0 || idx > 59) return

        return this.doors[idx]
    }

    /**
     * - Gets the index of the specified component
     * @param {[x: number, z: number]} comp
     * @returns {number}
     */
    getRoomIdx(comp) {
        return 6 * comp[1] + comp[0]
    }

    /** @private */
    addDoor(door) {
        const idx = this.getDoorIdx(door.getComp())
        if (idx < 0 || idx > 59) return

        this.doors[idx] = door
    }

    /** @private */
    mergeRooms(room1, room2) {
        this.removeRoom(room2)

        for (let comp of room2.comps) {
            if (!room1.hasComponent(comp[0], comp[2])) {
                room1.addComponent(comp, false)
            }

            this.rooms[this.getRoomIdx(comp)] = room1
        }

        room1._update()
    }

    /** @private */
    removeRoom(room) {
        for (let comp of room.comps) {
            let idx = this.getRoomIdx(comp)
            this.rooms[idx] = null
        }
    }

    /** @private */
    checkRoomState() {
        for (let room of this.rooms) {
            if (!room) continue
            if (room.rotation !== null) continue

            room.findRotation()
        }

        return this
    }

    /** @private */
    checkDoorState() {
        for (let door of this.doors) {
            if (!door) continue
            if (door.opened) continue

            door.check()
        }

        return this
    }

    /** @private */
    scan() {
        if (this.availablePos.length <= 0) return

        for (let idx = this.availablePos.length - 1; idx >= 0; idx--) {
            let [ x, z, rx, rz ] = this.availablePos[idx]
            if (!isChunkLoaded(rx, 0, rz)) continue

            this.availablePos.splice(idx, 1)

            let roofHeight = getHighestY(rx, rz)
            if (!roofHeight) continue

            // Door scan
            if (x % 2 === 1 || z % 2 === 1) {
                if (roofHeight < 85) {
                    let door = new Door([rx, rz, x, z])

                    if (z % 2 === 1) door.rotation = 0
                    
                    this.addDoor(door)
                }

                continue
            }

            x >>= 1
            z >>= 1

            let cdx = this.getRoomIdx([x, z])
            let room = new Room([[x, z]], roofHeight).scan()
            this.rooms[cdx] = room

            for (let dir of directions) {
                let [ dx, dz, dx1, dz1 ] = dir
                let [ nx, nz ] = [ rx + dx, rz + dz ]

                let heightBlock = World.getBlockAt(nx, roofHeight, nz)
                let aboveHeightBlock = World.getBlockAt(nx, roofHeight + 1, nz)

                if (room.type === RoomTypes.ENTRANCE && heightBlock.type.getID() !== 0) {
                    if (World.getBlockAt(nx, 76, nz).type.getID() === 0) continue

                    let doorComp = [ x * 2 + dx1, z * 2 + dz1 ]
                    let dooridx = this.getDoorIdx(doorComp)
                    if (dooridx >= 0 && dooridx < 60) {
                        this.addDoor(new Door([nx, nz, doorComp[0], doorComp[1]]).setType(DoorTypes.ENTRANCE))
                    }
                    continue
                }

                if (heightBlock.type.getID() === 0 || aboveHeightBlock.type.getID() !== 0) continue

                let ncomp = [ x + dx1, z + dz1 ]
                let ndx = this.getRoomIdx(ncomp)
                if (ndx < 0 || ndx > 35) continue

                if (!this.rooms[ndx]) {
                    room.addComponent(ncomp)
                    this.rooms[ndx] = room
                    continue
                }

                let exists = this.rooms[ndx]
                if (exists.type === RoomTypes.ENTRANCE || exists === room) continue

                this.mergeRooms(exists, room)
            }
        }
    }
}