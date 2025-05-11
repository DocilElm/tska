import TskaAPI from "../../api/TskaAPI"
import { Event } from "../../event/Event"
import EventListener from "../../event/EventListener"
import InternalEvents from "../../event/InternalEvents"
import { fetch } from "../../polyfill/Fetch"
import { decodeRoman } from "../../shared/Math"
import Location from "../Location"
import { realCoordToComponent } from "./Utils"

const PuzzleEnums = {
    "✦": 0,
    "✔": 1,
    "✖": 2
}
const Milestones = ["⓿", "❶", "❷", "❸", "❹", "❺", "❻", "❼", "❽", "❾"]
const floorSecrets = {
    "F1": 0.3,
    "F2": 0.4,
    "F3": 0.5,
    "F4": 0.6,
    "F5": 0.7,
    "F6": 0.85
}
const floorTimes = {
    "F3": 120,
    "F4": 240,
    "F5": 120,
    "F6": 240,
    "F7": 360,
    "M1": 0,
    "M2": 0,
    "M3": 0,
    "M4": 0,
    "M5": 0,
    "M6": 120,
    "M7": 360,
}
const mimicMessages = [
    "mimic dead",
    "mimic dead!",
    "mimic killed",
    "mimic killed!",
    "$skytils-dungeon-score-mimic$"
]
const ItemMap = net.minecraft.item.ItemMap
const mapMaxX = net.minecraft.network.play.server.S34PacketMaps.class.getDeclaredField(/* mapMaxX */"field_179735_f")
const mapMaxY = net.minecraft.network.play.server.S34PacketMaps.class.getDeclaredField(/* mapMaxY */"field_179736_g")
mapMaxX.setAccessible(true)
mapMaxY.setAccessible(true)

EventListener.createEvent("puzzlestate")
InternalEvents.createEvent("mapdata")

/** @typedef {"Mage"|"Archer"|"Berserk"|"Healer"|"Tank"} DungeonClass */
/**
  * @typedef {Object} ScoreData
  * @prop {number} totalSecrets The total secrets of this dungeon
  * @prop {number} secretsRemaining The secrets remaining of this dungeon
  * @prop {number} totalRooms The total rooms of this dungeon
  * @prop {number} deathPenalty
  * @prop {number} completionRatio
  * @prop {number} adjustedRooms Essentially completed rooms but with the addition of blood and boss if required
  * @prop {number} roomsScore
  * @prop {number} skillScore
  * @prop {number} secretsScore
  * @prop {number} exploreScore
  * @prop {number} bonusScore
  * @prop {number} score The score of the current Dungeon
  * @prop {number} maxSecrets The maxmimum secrets of this Dungeon
  * @prop {number} minSecrets The minimum secrets required for s+ for this Dungeon
  */

const coerceIn = (v, min, max) => Math.min(Math.max(v, min), max)

export default new class Dungeon {
    constructor() {
        /** @private */
        this._hasPaul = false
        /** @private */
        this._on270Listeners = []
        /** @private */
        this._on300Listeners = []

        /** @private */
        this.mimicTrigger = new Event("entityDeath", (entity) => {
            const mcEntity = entity.entity
            if (!(mcEntity instanceof net.minecraft.entity.monster.EntityZombie)) return
            if (![6, 7].includes(this.floorNumber) || this.mimicDead) return
            if (
                !mcEntity./* isChild */func_70631_g_() ||
                mcEntity./* getCurrentArmor */func_82169_q(0) ||
                mcEntity./* getCurrentArmor */func_82169_q(1) ||
                mcEntity./* getCurrentArmor */func_82169_q(2) ||
                mcEntity./* getCurrentArmor */func_82169_q(3)
            ) return
            this.mimicDead = true
        })

        /** @private */
        this.chatReg = new Event("serverChat", (msg) => {
            if (!this.floor || ![6, 7].includes(this.floorNumber)) return
            if (!mimicMessages.some((it) => it === msg.toLowerCase())) return

            this.mimicDead = true
        }, /^Party > (?:\[[\w\+]+\] )?(?:\w{1,16}): (.*)$/).register()

        fetch("https://api.hypixel.net/resources/skyblock/election", { json: true })
            .then((it) => {
                this._hasPaul = it?.mayor?.name?.toLowerCase() == "paul" && it?.mayor?.perks?.some(a => a?.name?.toLowerCase() == "ezpz")
            })

        this._resetRegex()
        this.reset()
        this._init()

        InternalEvents.on("apiupdate", () => {
            this._resetRegex()
        })
    }

    /** @private */
    _resetRegex() {
        this.dungeonRegex = TskaAPI.getDungeonsRegex()
        // Regex
        /** @private */
        this.floorRegex = this.dungeonRegex.Floor
        /** @private */
        this.playerInfoRegex = this.dungeonRegex.PlayerInfo
        /** @private */
        this.secretsFoundRegex = this.dungeonRegex.ScretsFound
        /** @private */
        this.secretsFoundPercentRegex = this.dungeonRegex.ScretsFoundPer
        /** @private */
        this.milestoneRegex = this.dungeonRegex.Milestone
        /** @private */
        this.completedRoomsRegex = this.dungeonRegex.CompletedRooms
        /** @private */
        this.teamDeathsRegex = this.dungeonRegex.TeamDeaths
        /** @private */
        this.puzzleCountRegex = this.dungeonRegex.PuzzleCount
        /** @private */
        this.cryptsCountRegex = this.dungeonRegex.Crypts
        /** - Action bar regex for (1/5) secrets @private */
        this.roomSecretsFound = this.dungeonRegex.RoomSecretsFound
        /** @private */
        this.puzzleStateRegex = this.dungeonRegex.PuzzleState
        /** @private */
        this.openedRoomsRegex = this.dungeonRegex.OpenedRooms
        /** @private */
        this.clearedRoomsRegex = this.dungeonRegex.ClearedRooms
        /** @private */
        this.clearedPercentRegex = this.dungeonRegex.ClearedPercent
        /** @private */
        this.dungeonSecondsRegex = this.dungeonRegex.DungeonTime
    }

    /** @private */
    reset() {
        /** @type {string[]} player names */
        this.partyMembers = []
        /** @type {Record<string, PlayerInfo>} */
        this.players = {}
        this.icons = {}
        this.mapData = null
        this.mapCorners = null
        this.mapRoomSize = null
        this.mapGapSize = null
        /** @private */
        this.floor = null
        /** @private */
        this.floorNumber = null
        /** @private */
        this.secretsFound = 0
        /** @private */
        this.secretsFoundPercent = 0
        /** @private */
        this.crypts = 0
        /** @private */
        this.milestone = "⓿"
        /** @private */
        this.completedRooms = 0
        /** @private */
        this.puzzleCount = 0
        /** @private */
        this.teamDeaths = 0
        /** @private */
        this.openedRooms = 0
        /** @private */
        this.clearedRooms = 0
        /** @private */
        this.currentClass = null
        /** @private */
        this.currentLevel = 0
        /** @private */
        this.puzzlesDone = 0
        /** @private */
        this.clearedPercent = 0
        /** @private */
        this.secretsPercentNeeded = 1
        /** @private */
        this.scoreData = {
            totalSecrets: 0,
            secretsRemaining: 0,
            totalRooms: 0,
            deathPenalty: 0,
            completionRatio: 0,
            adjustedRooms: 0,
            roomsScore: 0,
            skillScore: 0,
            secretsScore: 0,
            exploreScore: 0,
            bonusScore: 0,
            score: 0,
            maxSecrets: 0,
            minSecrets: 0
        }
        /** @private */
        this.bloodDone = false
        /** @private */
        this.dungeonSeconds = 0
        /** @private */
        this.hasSpiritPet = false
        /** @private */
        this.mimicDead = false
        /** @private */
        this._has270Triggered = false
        /** @private */
        this._has300Triggered = false
        this._resetRegex()
        this.mimicTrigger.unregister()
    }

    /** @private */
    _init() {
        InternalEvents.on("tabadd", (msg) => this.onTabPacket(msg))
        InternalEvents.on("tabupdate", (msg) => this.onTabPacket(msg))
        InternalEvents.on("scoreboardclear", (msg) => {
            const percentMatch = msg.match(this.clearedPercentRegex)
            if (percentMatch) {
                const [ _, percent ] = percentMatch
                this.clearedPercent = +percent
                return
            }

            if (this.floor) return
            const match = msg.match(this.floorRegex)
            if (!match) return

            this.floor = match[1]
            this.floorNumber = +this.floor[1]
            this.secretsPercentNeeded = floorSecrets[this.floor] || 1
            this.mimicTrigger.register()
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
        if (!msg) return
        const timeMatch = msg.match(this.dungeonSecondsRegex)
        if (timeMatch) {
            let [ _, hours, minutes, seconds ] = timeMatch
            hours ??= 0
            minutes ??= 0
            this.dungeonSeconds = +seconds + (+minutes * 60) + (+hours * 60 * 60)
        }

        this.secretsFound = +(msg.match(this.secretsFoundRegex)?.[1] ?? this.secretsFound)
        this.secretsFoundPercent = +(msg.match(this.secretsFoundPercentRegex)?.[1] ?? this.secretsFoundPercent)
        this.crypts = +(msg.match(this.cryptsCountRegex)?.[1] ?? this.crypts)
        this.milestone = msg.match(this.milestoneRegex)?.[1] ?? this.milestone
        this.completedRooms = +(msg.match(this.completedRoomsRegex)?.[1] ?? this.completedRooms)
        this.puzzleCount = +(msg.match(this.puzzleCountRegex)?.[1] ?? this.puzzleCount)
        this.teamDeaths = +(msg.match(this.teamDeathsRegex)?.[1] ?? this.teamDeaths)
        this.openedRooms = +(msg.match(this.openedRoomsRegex)?.[1] ?? this.openedRooms)
        this.clearedRooms = +(msg.match(this.clearedRoomsRegex)?.[1] ?? this.clearedRooms)
        this._calculateScore()

        const puzzleMatch = msg.match(this.puzzleStateRegex)
        if (puzzleMatch) {
            const [ _, puzzleName, puzzleState, failedBy ] = puzzleMatch
            const puzzleEnum = PuzzleEnums[puzzleState]
            if (puzzleEnum === 1) this.puzzlesDone++

            EventListener.post("puzzlestate", puzzleName, puzzleEnum, failedBy)
            return
        }

        const match = msg.match(this.playerInfoRegex)
        if (!match) return

        const [ _, playerName, className, classLevel ] = match

        if (this.partyMembers.indexOf(playerName) === -1) {
            this.partyMembers.push(playerName)
        }
        if (!className) return

        this.players[playerName] = {
            className,
            level: decodeRoman(classLevel),
            levelRoman: classLevel,
            name: playerName
        }

        if (playerName === Player.getName()) {
            this.currentClass = className
            this.currentLevel = decodeRoman(classLevel)
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

    /**
     * - Most of the logic behind this function was taken from BloomCore
     * @private
     * @author [UnclaimedBloom6](https://github.com/UnclaimedBloom6/) for the logic
     */
    _calculateScore() {
        if (!this.floor) return
        const missingPuzzles = this.puzzleCount - this.puzzlesDone

        this.scoreData.totalSecrets = Math.floor((100 / this.secretsFoundPercent * this.secretsFound + 0.5)) || 0
        this.scoreData.secretsRemaining = this.scoreData.totalSecrets - this.secretsFound
        this.scoreData.totalRooms = Math.floor((100 / this.clearedPercent * this.completedRooms + 0.4)) || 36
        this.scoreData.adjustedRooms = this.completedRooms
        if (!this.bloodDone || !this.inBoss()) this.scoreData.adjustedRooms++
        if (this.completedRooms <= this.scoreData.totalRooms - 1 && !this.bloodDone) this.scoreData.adjustedRooms++

        this.scoreData.deathPenalty = this.teamDeaths * -2 + (this.hasSpiritPet && this.teamDeaths > 0 ? 1 : 0)
        this.scoreData.completionRatio = this.scoreData.adjustedRooms / this.scoreData.totalRooms
        this.scoreData.roomsScore = coerceIn(80 * this.scoreData.completionRatio, 0, 80)
        this.scoreData.skillScore = coerceIn(Math.floor(20 + this.scoreData.roomsScore - 10 * missingPuzzles + this.scoreData.deathPenalty), 20, 100)
        this.scoreData.secretsScore = coerceIn(40 * ((this.secretsFoundPercent / 100) / this.secretsPercentNeeded), 0, 40)
        this.scoreData.exploreScore = coerceIn(Math.floor(60 * this.scoreData.completionRatio + this.scoreData.secretsScore), 0, 100)
        if (!this.clearedPercent) this.scoreData.exploreScore = 0

        let cryptScore = this.crypts > 5 ? 5 : this.crypts
        let mimicScore = this.mimicDead ? 2 : 0
        let paulScore = this._hasPaul ? 10 : 0

        this.scoreData.bonusScore = cryptScore + mimicScore + paulScore

        const totalTime = this.dungeonSeconds - (floorTimes[this.floor] ?? 0)
        let speedScore = 0

        if (totalTime < 480) speedScore = 100
        else if (totalTime >= 480 && totalTime <= 600) speedScore = 140 - totalTime / 12
        else if (totalTime >= 600 && totalTime <= 840) speedScore = 115 - totalTime / 24
        else if (totalTime >= 840 && totalTime <= 1140) speedScore = 108 - totalTime / 30
        else if (totalTime >= 1140 && totalTime <= 3940) speedScore = 98.5 - totalTime / 40

        this.scoreData.score = this.scoreData.skillScore + this.scoreData.exploreScore + Math.floor(speedScore) + this.scoreData.bonusScore
        this.scoreData.maxSecrets = Math.ceil(this.scoreData.totalSecrets * this.secretsPercentNeeded)
        this.scoreData.minSecrets = Math.floor(this.scoreData.maxSecrets * ((40 - this.scoreData.bonusScore + this.scoreData.deathPenalty) / 40))

        if (this.scoreData.score >= 300 && !this._has300Triggered) {
            for (let cb of this._on300Listeners)
                cb()
            this._has300Triggered = true
            return
        }
        if (this.scoreData.score < 270 || this._has270Triggered) return

        for (let cb of this._on270Listeners)
            cb()
        this._has270Triggered = true
    }

    /**
     * @typedef {Object} PlayerInfo
     * @prop {DungeonClass} className
     * @prop {number} level
     * @prop {string} levelRoman Roman numeral
     * @prop {string} name
     */

    /**
     * - Gets the players from the current dungeon with their class and level
     * @returns {Record<string, PlayerInfo>}
     * ```js
     * {
     *     playerName: {
     *         className: "Mage",
     *         level: 6,
     *         levelRoman: "VI",
     *         name: playerName
     *     }
     * }
     * ```
     */
    getTeam() {
        return this.players
    }

    /**
     * - Gets the total secrets found in the current Dungeon
     * @returns {number}
     */
    getSecretsFound() {
        return this.secretsFound
    }

    /**
     * - Gets the total secrets found in percent of the current Dungeon
     * @returns {number}
     */
    getSecretsFoundPercent() {
        return this.secretsFoundPercent
    }

    /**
     * - Gets the current Dungeon's crypts count
     * @returns {number}
     */
    getCryptsCount() {
        return this.crypts
    }

    /**
     * - Gets the current Dungeon's crypts count
     * @alias getCryptsCount
     * @returns {number}
     */
    getCrypts() {
        return this.crypts
    }

    /**
     * - Gets the player's current milestone
     * @param {boolean} num Whether this should return the number of the symbol (`false` by default, returns the symbol)
     * @returns {string|number}
     */
    getMilestone(num = false) {
        return num ? Milestones.indexOf(this.milestone) : this.milestone
    }

    /**
     * - Gets the total completed rooms count of the current Dungeon
     * @returns {number}
     */
    getCompletedRooms() {
        return this.completedRooms
    }

    /**
     * - Gets the current Dungeon's puzzle count
     * @returns {number}
     */
    getPuzzleCount() {
        return this.puzzleCount
    }

    /**
     * - Gets the current Dungeon's deaths
     * @returns {number}
     */
    getTeamDeaths() {
        return this.teamDeaths
    }

    /**
     * - Gets the current Dungeon's opened rooms count
     * @returns {number}
     */
    getOpenedRooms() {
        return this.openedRooms
    }

    /**
     * - Gets the current Dungeon's cleared rooms count
     * @returns {number}
     */
    getClearedRooms() {
        return this.clearedRooms
    }

    /**
     * - Gets all the players that have the specified class
     * - Note: This returns an array, this array's length can be 1
     * @param {DungeonClass} className
     * @returns {PlayerInfo[]}
     */
    getByClass(className) {
        const keys = Object.keys(this.players)

        let playersClass = []

        for (let k of keys) {
            let v = this.players[k]
            if (v.className !== className) continue

            playersClass.push(v)
        }

        return playersClass
    }

    /**
     * - Gets the player's class data
     * @param {string} playerName
     * @returns {?PlayerInfo}
     */
    getByName(playerName) {
        return this.players[playerName]
    }

    /**
     * - Checks whether the specified class is duplicate, i.e. has more than one player assigned to it
     * @param {DungeonClass} className
     * @returns {boolean}
     */
    isDupeClass(className) {
        return this.getByClass(className).length > 1
    }

    /**
     * - Gets the player's current class
     * @returns {?DungeonClass}
     */
    getCurrentClass() {
        return this.currentClass
    }

    /**
     * - Gets the player's current class level
     * @returns {number}
     */
    getCurrentLevel() {
        return this.currentLevel
    }

    /**
     * - Gets the cooldown of a specified item's cooldown taking into account the mage reduction
     * @param {number} cooldown The base item cooldown in seconds
     * @param {boolean} checkClass Whether to check if the player's current class is Mage or not (`false` by default)
     * @returns {number}
     */
    getMageReduction(cooldown, checkClass = false) {
        if (checkClass && this.currentClass !== "Mage") return cooldown

        const mult = this.isDupeClass("Mage") ? 1 : 2
        return cooldown * (0.75 - (Math.floor(this.currentLevel / 2) / 100) * mult)
    }

    /**
     * - Checks whether the player is outside of the room grid bounds
     * - If it is this should mean they're in boss room
     * @returns {boolean}
     */
    inBoss() {
        if (!this.floor) return false
        const [ x, z ] = realCoordToComponent([Player.getX(), Player.getZ()])
        const idx = 6 * z + x
        if (idx <= 35) return false

        return true
    }

    /**
     * - Whether the first death should have spirit pet perk applied to it or not (`false` by default)
     * - You need to set this variable every world swap to `true`/`false`
     * @param {boolean} value
     * @returns {this} this for method chaining
     */
    setSpiritPet(value) {
        this.hasSpiritPet = value

        return this
    }

    /**
     * - Whether or not paul is the current mayor with the ezpz perk
     * @returns {boolean}
     */
    hasPaul() {
        return this._hasPaul
    }

    /**
     * - Adds a listener for whenever 270 score is reached
     * @param {() => void} cb
     * @returns {this} this for method chaining
     */
    on270Score(cb) {
        this._on270Listeners.push(cb)

        return this
    }

    /**
     * - Adds a listener for whenever 300 score is reached
     * @param {() => void} cb
     * @returns {this} this for method chaining
     */
    on300Score(cb) {
        this._on300Listeners.push(cb)

        return this
    }

    /**
     * - Gets the current score data of this Dungeon
     * @returns {ScoreData}
     */
    getScoreData() {
        return this.scoreData
    }
}