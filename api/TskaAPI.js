import InternalEvents from "../event/InternalEvents"
import { DataStore } from "../storage/DataStore"

const apiUrl = "https://raw.githubusercontent.com/DocilElm/Doc-Data/refs/heads/main/api/tska.json"

InternalEvents
    .createEvent("apiupdate")

export default new class TskaAPI {
    constructor() {
        this.api = DataStore.fromFileOrUrl("tska", "data/tskaApi.json", apiUrl)
        this.regex = this.api.regex
        this._refresh()
        this._cacheRegex()
    }

    _cacheRegex() {
        if (!this.regex) return
        this.regexData = {}
        const keys = Object.keys(this.regex)

        for (let k of keys) {
            if (!(k in this.regexData)) this.regexData[k] = {}

            let v = this.regex[k]

            for (let k2 of Object.keys(v)) {
                let v2 = v[k2]

                this.regexData[k][k2] = Array.isArray(v2)
                    ? new RegExp(v2[0], v2[1])
                    : new RegExp(v2)
            }
        }
    }

    _refresh() {
        const repoApi = DataStore.fromUrl(apiUrl)
        if (repoApi.version === this.api.version) return

        this.api = repoApi
        this.regex = this.api.regex
        this._cacheRegex()
        InternalEvents.post("apiupdate", repoApi)
    }

    /**
     * @returns {?{[name: string]: ?RegExp}}
     */
    getDungeonsRegex() {
        return this.regexData?.Dungeons
    }
}