const cachedInstances = []

/**
 * - This data is meant to be edited on the fly as well as gathered from a file
 */
export class LocalStore {
    constructor(moduleName, defaultData = {}, fileName = ".data.json") {
        const cachedData = FileLib.read(moduleName, fileName)
        if (!cachedData) console.warn(`[TSKA] Seems like your data for module \"${moduleName}\" was corruputed therefore resetted.`)

        const parsed = JSON.parse(cachedData ?? "{}")
        Object.assign(this, defaultData, parsed)

        /**
         * - Function that returns the module's `moduleName` and `fileName`
         * to store the data at
         * @returns {[string, string]}
         */
        this.getModuleData = () => {
            return [ moduleName, fileName ]
        }

        cachedInstances.push(this)
    }

    /**
     * - This function is mostly for internal use since the dev should not handle this
     * but it is open to use if you feel like it is better.
     * - This gets called every time the game unloads automatically
     * @deprecated
     */
    save() {
        const [ moduleName, fileName ] = this.getModuleData()

        FileLib.write(moduleName, fileName, JSON.stringify(this, null, 4), true)
    }
}

register("gameUnload", () => {
    for (let local of cachedInstances)
        local.save()
})