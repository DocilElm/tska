import { SetArray } from "../../collections/SetArray"
import InternalEvents from "../../event/InternalEvents"
import Location from "../Location"
import { Door } from "./Door"
import Dungeon from "./Dungeon"
import { DungeonPlayer } from "./DungeonPlayer"
import { Room } from "./Room"
import { Checkmark, DoorTypes, RoomTypes, defaultMapSize, directions, getHighestY, getScanCoords, isChunkLoaded, realCoordToComponent } from "./Utils"

// TODO: add this to its own class
const clampMap = (n, inMin, inMax, outMin, outMax) => {
    if (n <= inMin) return outMin
    if (n >= inMax) return outMax

    return (n - inMin) * (outMax - outMin) / (inMax - inMin) + outMin
}

const isBetween = (n, min, max) => (n - min >>> 31) + (max - n >>> 31) === 0

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
        this.uniqueRooms = new SetArray()
        /** @private */
        this.uniqueDoors = new SetArray()
        /** @type {DungeonPlayer[]} */
        this.players = []

        /** @private */
        this._roomEnterListener = []
        /** @private */
        this._roomLeaveListener = []

        /** @private */
        this.lastIdx = null
        /** @private */
        this.tickRegister = register("tick", (ticks) => {
            const [ x, z ] = realCoordToComponent([Player.getX(), Player.getZ()])
            const idx = 6 * z + x

            // Scan rooms
            this.scan()
            // TODO: optimize these
            // Find their rotations if not found on first scan
            this.checkRoomState()
            // Checks whether a door is opened or not
            this.checkDoorState()
            this.checkPlayerState(ticks)

            // Outside the room's bounds since only 36 total rooms is possible
            // this means that the player is either on an unknown place or in boss room
            // so we can unregister ourselves
            if (idx > 35) this.tickRegister.unregister()

            if (
                this.lastIdx !== null &&
                this.lastIdx !== idx &&
                this.rooms?.[this.lastIdx]?.name !== this.rooms?.[idx]?.name
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

        InternalEvents.on("mapdata", (data) => this.onMapData(data))
    }

    /**
     * - Resets this DungeonScanner's data to default state
     */
    reset() {
        this.tickRegister.unregister()
        this.availablePos = getScanCoords()
        this.rooms.fill(null)
        this.doors.fill(null)
        this.uniqueDoors.clear()
        this.uniqueRooms.clear()
        this.currentRoom = null
        this.lastIdx = null
        this.players = []
    }

    /** @private */
    onMapData(data) {
        if (!Dungeon.mapCorners || !data) return

        for (let k of Object.keys(Dungeon.icons)) {
            let v = Dungeon.icons[k]
            /** @type {DungeonPlayer} */
            let player = this.players.find((it) => it?.name === v?.name)
            if (!player || player.inRender) continue

            player.iconX = clampMap(v.x / 2 - Dungeon.mapCorners[0], 0, Dungeon.mapRoomSize * 6 + 20, 0, defaultMapSize[0])
            player.iconZ = clampMap(v.y / 2 - Dungeon.mapCorners[1], 0, Dungeon.mapRoomSize * 6 + 20, 0, defaultMapSize[1])
            player.realX = clampMap(player.iconX, 0, 125, -200, -10)
            player.realZ = clampMap(player.iconZ, 0, 125, -200, -10)
            player.rotation = v.rotation
            player.currentRoom = this.getRoomAt(player.realX, player.realZ)
            player.currentRoom?.players?.pushCheck(player)
        }

        const colors = data./* colors */field_76198_e
        if (!colors || colors.length < 16384) return

        for (let room of this.rooms) {
            if (!room || !room.comps.length) continue

            let [ x, z ] = room.comps[0]
            let mx = Dungeon.mapCorners[0] + Math.floor(Dungeon.mapRoomSize / 2) + Dungeon.mapGapSize * x
            let my = Dungeon.mapCorners[1] + Math.floor(Dungeon.mapRoomSize / 2) + 1 + Dungeon.mapGapSize * z
            let idx = mx + my * 128

            let center = colors[idx - 1]
            let rcolor = colors[idx + 5 + 128 * 4]
            if (rcolor === 0 || rcolor === 85) {
                room.explored = false
                continue
            }

            room.explored = true

            if (room.type === RoomTypes.NORMAL && !room.height) room.loadFromMapColor(rcolor)

            // TODO: make checkmarked room array
            let check = null
            if (center === 30 && rcolor !== 30) {
                if (room.checkmark !== Checkmark.GREEN) this.roomCleared(room, Checkmark.GREEN)
                check = Checkmark.GREEN
            }
            else if (center === 34) {
                if (room.checkmark !== Checkmark.WHITE) this.roomCleared(room, Checkmark.WHITE)
                check = Checkmark.WHITE
            }
            else if (center === 18 && rcolor !== 18) check = Checkmark.FAILED
            else if (room.checkmark === Checkmark.UNEXPLORED) check = Checkmark.NONE

            // if (room.checkmark !== check && check !== Checkmark.NONE) // handle checkmarked push room here
            room.checkmark = check
        }
    }

    /**
     * @private
     * @param {DungeonPlayer} entity
     * @param {number} x
     * @param {number} z
     * @param {number} yaw
     * @returns 
     */
    onPlayerMove(entity, x, z, yaw) {
        if (!entity || !isBetween(x, -200, -10) || !isBetween(z, -200, -10)) return

        entity.inRender = true
        entity.iconX = clampMap(x, -200, -10, 0, defaultMapSize[0])
        entity.iconZ = clampMap(z, -200, -10, 0, defaultMapSize[1])
        entity.realX = x
        entity.realZ = z
        entity.rotation = yaw + 180

        let curr = this.getRoomAt(x, z)
        entity.currentRoom = curr
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
        const comp = realCoordToComponent([x, z])
        const idx = this.getRoomIdx(comp)
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
        const comp = realCoordToComponent([x, z])
        const idx = this.getDoorIdx(comp)
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
        this.uniqueDoors.pushCheck(door)
    }

    /** @private */
    mergeRooms(room1, room2) {
        this.uniqueRooms.remove(room2)

        for (let comp of room2.comps) {
            if (!room1.hasComponent(comp[0], comp[1])) {
                room1.addComponent(comp, false)
            }

            this.rooms[this.getRoomIdx(comp)] = room1
        }

        if (!this.uniqueRooms.has(room1)) this.uniqueRooms.push(room1)

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
        for (let idx = 0; idx < this.uniqueDoors.size(); idx++) {
            let door = this.uniqueDoors.get(idx)
            if (!door || door.opened) continue

            door.check()
        }

        return this
    }

    /**
     * @private
     * @param {Room} room
     */
    roomCleared(room, check) {
        let players = room.players
        let isGreen = check === Checkmark.GREEN

        for (let idx = 0; idx < players.size(); idx++) {
            /** @type {DungeonPlayer} */
            let v = players.get(idx)
            if (!v) continue

            v.clearedRooms[isGreen ? "GREEN" : "WHITE"].pushCheck(room.name, {
                time: v.visitedRooms.get(room),
                room,
                solo: players.size() === 1,
            })
        }
    }

    /** @private */
    checkPlayerState(ticks = 0) {
        if (this.players.length === Dungeon.partyMembers.length) {
            // Check player's rooms
            for (let v of this.players) {
                let p = World.getPlayerByName(v.name)
                let ping = p.getPing()
                // Since map (9th slot) doesn't update that frequently we can afford
                // to "simulate" the way its updated with the `inRender` players as well
                if (ticks !== 0 && ticks % 4 === 0 && p) {
                    if (ping !== -1) this.onPlayerMove(v, p.getX(), p.getZ(), p.getYaw())
                    else v.inRender = false
                }
                if (ping === -1) continue

                let curr = v.currentRoom
                if (!curr) continue

                if (curr !== v.lastRoom) {
                    if (v.lastRoom && v.lastRoom.players.has(v)) v.lastRoom.players.remove(v)
                    curr.players.pushCheck(v)
                }

                v.visitedRooms.pushCheck(curr, 0)
                if (v.lastRoomCheck) v.visitedRooms.set(curr, (v.visitedRooms.get(curr) || 0) + Date.now() - v.lastRoomCheck)

                v.lastRoomCheck = Date.now()
                v.lastRoom = curr
            }

            return
        }

        for (let v of Dungeon.partyMembers) {
            if (this.players.find((it) => it.name === v) || World.getPlayerByName(v)?.getPing() === -1) continue

            this.players.push(new DungeonPlayer(v))
        }
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
            this.uniqueRooms.pushCheck(room)
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

                let nroom = this.rooms[ndx]

                if (!nroom) {
                    room.addComponent(ncomp)
                    this.rooms[ndx] = room
                    continue
                }

                let exists = nroom
                if (exists.type === RoomTypes.ENTRANCE || exists === room) continue

                this.mergeRooms(exists, room)
            }
        }
    }
}