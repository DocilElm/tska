import { MapArray } from "../../collections/MapArray"

export class DungeonPlayer {
    constructor(player) {
        this.name = player
        this.inRender = false

        this.iconX = null
        this.iconZ = null
        this.rotation = null
        this.realX = null
        this.realZ = null
        this.currentRoom = null
        this.visitedRooms = new MapArray()
        this.clearedRooms = { solo: 0, stack: 0 }
        this.deaths = 0
        // this.secrets = 0

        this.lastRoomCheck = null
        this.lastRoom = null
    }

    toString() {
        return `DungeonPlayer[iconX: ${this.iconX}, iconZ: ${this.iconZ}, rotation: ${this.rotation}, realX: ${this.realX}, realZ: ${this.realZ}, currentRoom: ${this.currentRoom}]`
    }
}