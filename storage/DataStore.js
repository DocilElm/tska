/**
 * - A class with utilities to storing data locally and retrieving it
 */
export class DataStore {
    /**
     * - Gets data from the specified moduleName and path
     * @param {string} moduleName The module name, has to be the same as the folder name
     * @param {string} path The path to the file from the module directory
     * @param {boolean} json Whether to do `JSON.parse` on the data or not
     * @returns {?any}
     */
    static fromFile(moduleName, path, json = true) {
        return json
            ? JSON.parse(FileLib.read(moduleName, path) ?? "{}") ?? {}
            : FileLib.read(moduleName, path)
    }

    /**
     * - Gets data from the specified url
     * @param {string} url The link where the data is stored at
     * @param {boolean} json Whether to do `JSON.parse` on the data or not
     * @returns {?any}
     */
    static fromUrl(url, json = true) {
        return json
            ? JSON.parse(FileLib.getUrlContent(url) ?? "{}") ?? {}
            : FileLib.getUrlContent(url)
    }

    /**
     * - Gets the data from the specified file if it exists, otherwise it makes a url request for the data.
     * If the file data does not exist it'll get it from the url and save it at the specified path.
     * - Note: This does caching for the data so you need to set the `cacheLimit` to your limit,
     * the default limit is `30mins` and this only gets checked everytime the user does `/ct load` not every `30mins`
     * @param {string} moduleName The module name, has to be the same as the folder name
     * @param {string} path The path to the file from the module directory
     * @param {string} url The link where the data is stored at
     * @param {number} cacheLimit The caching limit time in milliseconds
     * @param {boolean} json Whether to do `JSON.parse` on the data or not
     * @returns {?any}
     */
    static fromFileOrUrl(moduleName, path, url, cacheLimit = 1000 * 60 * 30, json = true) {
        const cachedFile = DataStore.fromFile(moduleName, path, json)
        if (!cachedFile || !cachedFile.savedAt || Date.now() - cachedFile.savedAt >= cacheLimit) {
            const data = DataStore.fromUrl(url, json)
            if (!data) return

            DataStore.saveTo(moduleName, path, { data, savedAt: Date.now() })
            return data
        }

        return cachedFile.data
    }

    /**
     * - Saves the specified data at the given moduleName (folder name) and path
     * @param {string} moduleName The module name, has to be the same as the folder name
     * @param {string} path The path to the file from the module directory
     * @param {any} data The data to be stored.
     * Note: if the `data` is an object it'll call `JSON.stringify()` on it
     */
    static saveTo(moduleName, path, data) {
        FileLib.write(
            moduleName,
            path,
            data instanceof Object ? JSON.stringify(data, null, 4) : data,
            true)
    }

    /**
     * @param {string} moduleName The module name (has to be the same as the folder name)
     * @param {string} dataDirectory The data directory for your module i.e. `data/`
     */
    constructor(moduleName, dataDirectory = "data/") {
        if (!moduleName) throw `[TSKA] DataStore Error: \"${moduleName}\" is not a valid module name.`

        this.moduleName = moduleName
        this.dataDirectory = dataDirectory
        this.cacheLimit = 1000 * 60 * 30
    }

    /**
     * - Sets the cache limit for the data gathered from a url
     * - Currently only used in `fromFileOrUrl` function
     * @param {number} milliseconds The caching limit time in milliseconds
     * @returns {this} this for method chaining
     */
    setCacheLimit(milliseconds) {
        this.cacheLimit = milliseconds

        return this
    }

    /**
     * - Gets data from the specified path using the `dataDirectory` as the main directory
     * @param {string} path The file path from `dataDirectory`
     * @param {boolean} json Whether to do `JSON.parse` on the data or not
     * @returns {?any}
     */
    fromFile(path, json = true) {
        return DataStore.fromFile(this.moduleName, `${this.dataDirectory}${path}`, json)
    }

    /**
     * - Gets data from the specified url
     * @param {string} url The link where the data is stored at
     * @param {boolean} json Whether to do `JSON.parse` on the data or not
     * @returns {?any}
     */
    fromUrl(url, json = true) {
        return DataStore.fromUrl(url, json)
    }

    /**
     * - Gets the data from the specified file if it exists, otherwise it makes a url request for the data.
     * If the file data does not exist it'll get it from the url and save it at the specified path.
     * - Note: This does caching for the data so you need to set the `cacheLimit` to your limit,
     * the default limit is `30mins` and this only gets checked everytime the user does `/ct load` not every `30mins`
     * @param {string} path The file path from `dataDirectory`
     * @param {string} url The link where the data is stored at
     * @param {number} cacheLimit The caching limit time in milliseconds
     * @param {boolean} json Whether to do `JSON.parse` on the data or not
     * @returns {?any}
     */
    fromFileOrUrl(path, url, json = true) {
        return DataStore.fromFileOrUrl(this.moduleName, `${this.dataDirectory}${path}`, url, this.cacheLimit, json)
    }

    /**
     * - Saves the specified data at the given path using the `dataDirectory` as the main directory
     * @param {string} path The file path from `dataDirectory`
     * @param {any} data The data to be stored.
     * Note: if the `data` is an object it'll call `JSON.stringify()` on it
     */
    saveTo(path, data) {
        DataStore.saveTo(this.moduleName, `${this.dataDirectory}${path}`, data)
    }
}