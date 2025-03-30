export const cornerStart = [ -200, -200 ]
export const cornerEnd = [ -10, -10 ]
export const dungeonRoomSize = 31
export const dungeonDoorSize = 1
export const roomDoorCombinedSize = dungeonRoomSize + dungeonDoorSize
export const halfRoomSize = Math.floor(dungeonRoomSize / 2)
export const halfCombinedSize = Math.floor(roomDoorCombinedSize / 2)
export const directions = [
    [halfCombinedSize, 0, 1, 0],
    [-halfCombinedSize, 0, -1, 0],
    [0, halfCombinedSize, 0, 1],
    [0, -halfCombinedSize, 0, -1]
]
export const defaultMapSize = [125, 125]

export const getHighestY = (x, z) => {
    for (let idx = 256; idx > 0; idx--) {
        let id = World.getBlockAt(x, idx, z)?.type?.getID()
        if (id === 0 || id === 41) continue

        return idx
    }
}

export const hashCode = (str) => str.split("").reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0) & 0xFFFFFFFF

export const getScanCoords = () => {
    let coords = []

    for (let z = 0; z < 11; z++) {
        for (let x = 0; x < 11; x++) {
            if (x % 2 && z % 2) continue

            let rx = cornerStart[0] + halfRoomSize + x * halfCombinedSize
            let rz = cornerStart[1] + halfRoomSize + z * halfCombinedSize
            coords.push([x, z, rx, rz])
        }
    }

    return coords
}

export const getCore = (x, z) => {
    let ids = ""

    for (let idx = 140; idx >= 12; idx--) {
        let block = World.getBlockAt(x, idx, z)
        let id = block.type.getID()
        if (id === 101 || id === 54) {
            ids += "0"
            continue
        }

        ids += id
    }

    return hashCode(ids)
}

export const componentToRealCoords = ([x, z], isIncludingDoors = false) => {
    const [ x0, z0 ] = cornerStart
    if (isIncludingDoors) return [
        x0 + halfRoomSize + halfCombinedSize * x,
        z0 + halfRoomSize + halfCombinedSize * z,
    ]

    return [
        x0 + halfRoomSize + roomDoorCombinedSize * x,
        z0 + halfRoomSize + roomDoorCombinedSize * z,
    ]
}

export const isChunkLoaded = (x, y, z) => World.isLoaded() && World.getChunk(x, y, z).chunk./* isLoaded */func_177410_o()

export const realCoordToComponent = ([x, z], isIncludingDoors = false) => {
    const [ x0, z0 ] = cornerStart

    const size = isIncludingDoors ? halfCombinedSize : roomDoorCombinedSize
    const s = 4 + (size - 16 >> 4)

    return [
        (x - x0 + 0.5) >> s,
        (z - z0 + 0.5) >> s
    ]
}

export const DoorTypes = {
    NORMAL: 0,
    WITHER: 1,
    BLOOD: 2,
    ENTRANCE: 3
}

export const ClearTypes = {
    MOB: 0,
    MINIBOSS: 1
}

export const Checkmark = {
    NONE: 0,
    WHITE: 1,
    GREEN: 2,
    FAILED: 3,
    UNEXPLORED: 4
}

export const RoomTypes = {
    NORMAL: 0,
    PUZZLE: 1,
    TRAP: 2,
    YELLOW: 3,
    BLOOD: 4,
    FAIRY: 5,
    RARE: 6,
    ENTRANCE: 7,
    UNKNOWN: 8
}

export const RoomTypesStrings = new Map([
    ["normal", RoomTypes.NORMAL],
    ["puzzle", RoomTypes.PUZZLE],
    ["trap", RoomTypes.TRAP],
    ["yellow", RoomTypes.YELLOW],
    ["blood", RoomTypes.BLOOD],
    ["fairy", RoomTypes.FAIRY],
    ["rare", RoomTypes.RARE],
    ["entrance", RoomTypes.ENTRANCE]
])

export const rotateCoords = ([x, y, z], degree) => {
    if (degree < 0) degree = degree + 360

    if (degree == 0) return [x, y, z]
    if (degree == 90) return [z, y, -x]
    if (degree == 180) return [-x, y, -z]
    if (degree == 270) return [-z, y, x]
    return [x, y, z]
}

export const getRoomShape = (components) => {
    if (!components || !components.length || components.length > 4) return "Unknown"
    else if (components.length == 4) {
        if (new Set(components.map(a => a[0])).size == 1 || new Set(components.map(a => a[1])).size == 1) return "1x4"
        else return "2x2"
    }
    if (components.length == 1) return "1x1"
    if (components.length == 2) return "1x2"
    if (new Set(components.map(a => a[0])).size == components.length || new Set(components.map(a => a[1])).size == components.length) return "1x3"
    return "L"
}

export const MapColorToRoomType = new Map([
    [18, RoomTypes.BLOOD],
    [30, RoomTypes.ENTRANCE],
    [63, RoomTypes.NORMAL],
    [82, RoomTypes.FAIRY],
    [62, RoomTypes.TRAP],
    [74, RoomTypes.YELLOW],
    [66, RoomTypes.PUZZLE]
])