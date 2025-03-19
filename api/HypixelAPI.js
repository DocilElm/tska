import { fetch } from "../polyfill/Fetch"
import { Promise } from "../polyfill/Promise"

const ColorNameToFormat = {
	"BLACK": "&0",
	"DARK_BLUE": "&1",
	"DARK_GREEN": "&2",
	"DARK_AQUA": "&3",
	"DARK_RED": "&4",
	"DARK_PURPLE": "&5",
	"GOLD": "&6",
	"GRAY": "&7",
	"DARK_GRAY": "&8",
	"BLUE": "&9",
	"GREEN": "&a",
	"AQUA": "&b",
	"RED": "&c",
	"LIGHT_PURPLE": "&d",
	"YELLOW": "&e",
	"WHITE": "&f"
}

/**
 * - HypixelApi wrapper
 * - Currently does not add a lot but hopefully with more suggestions it can be complete
 */
export class HypixelAPI {
    /**
     * - Names of the ranks based on their api name
     * - i.e. `VIP` -> `&a[VIP]`
     */
    static RankFromName = {
        "VIP": "&a[VIP]",
        "VIP_PLUS": "&a[VIP&6+&a]",
        "MVP": "&b[MVP]",
        "MVP_PLUS": "&b[MVP&c+&b]",
        "ADMIN": "&c[ADMIN]",
        "MODERATOR": "&2[MOD]",
        "HELPER": "&9[HELPER]",
        "YOUTUBER": "&c[&fYOUTUBE&c]",
        "GAME_MASTER": "&2[GM]"
    }

    /**
     * - Gets the player data from the hypixel api with the specified api
     * - Note: Your api has to be "formatted" the same way the hypixel one is, this calls `${api}/v2/player?uuid=${uuid}`
     * @template T
     * @param {string} api The api link without a `/` at the end i.e. `https://api.hypixel.net`
     * @param {string} uuid The uuid of the player to look for
     * @returns {Promise<T>} Promise
     */
    static getPlayer(api, uuid) {
        return new Promise((resolve, reject) => {
            fetch(`${api}/v2/player?uuid=${uuid}`)
                .then((data) => {
                    if (!data.success) return reject("Could not find hypixel data")

                    resolve(data)
                })
                .catch((err) => reject(err))
        })
    }

    /**
     * - Gets the player rank from specified hypixel data
     * - Note: The data has to be similar to the one returned by `getPlayer` function
     * @param {any} data The hypixel data
     * @returns {string} The rank i.e. `&a[VIP&6+&a]`
     */
    static getRank(data) {
        const playerData = data.player
        if ("prefix" in playerData)
            return playerData.prefix.replace(/[^\u0000-\u007F]/g, "").replace(/§/g, "&")
        if ("rank" in playerData) return HypixelAPI.RankFromName[playerData.rank]

        let rankColor = "&c"
        if ("rankPlusColor" in playerData) rankColor = ColorNameToFormat[playerData.rankPlusColor]

        // MVP++
    	if (playerData.monthlyPackageRank === "SUPERSTAR") {
            let bracketColor = playerData.monthlyRankColor == "AQUA" ? "&b" : "&6"

            return `${bracketColor}[MVP${rankColor}++${bracketColor}]`
        }
        if (playerData.newPackageRank == "MVP_PLUS")
            return HypixelAPI.RankFromName[playerData.newPackageRank].replace("&c", rankColor)

        if ("newPackageRank" in playerData)
            return HypixelAPI.RankFromName[playerData.newPackageRank]

        return "&7"
    }

    /**
     * @param {string} api The api link without a `/` ending.
     * i.e. `https://api.hypixel.net`
     */
    constructor(api) {
        this.api = api
        this.data = null
    }

    /**
     * - Gets the player data from the hypixel api with the specified uuid
     * - Similar to `getPlayer(api, uuid)` but this one auto completes the `api` param with
     * the one specified on the class constructor
     * @template T
     * @param {string} uuid The uuid of the player to look for
     * @returns {Promise<T>} Promise
     */
    getPlayer(uuid) {
        // Wrap the promise so we know what data was received
        return new Promise((resolve, reject) => {
            HypixelAPI.getPlayer(this.api, uuid)
                .then((data) => {
                    this.data = data
                    resolve(data)
                })
                .catch((err) => reject(err))
        })
    }

    /**
     * - Gets the player rank from specified hypixel data
     * - Note: The data has to be similar to the one returned by `getPlayer` function
     * @param {?any} data The hypixel data. If `data` is not passed through
     * it will use the one cached or rather gathered by the previous `getPlayer(uuid)` call
     * @returns {string} The rank i.e. `&a[VIP&6+&a]`
     */
    getRank(data) {
        if (!this.data && !data) return
        return HypixelAPI.getRank(data ?? this.data)
    }
}