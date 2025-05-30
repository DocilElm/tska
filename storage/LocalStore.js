const cachedInstances = []

const moduleNameSym = Symbol("moduleName")
const fileNameSym = Symbol("fileName")

/**
 * - This data is meant to be edited on the fly as well as gathered from a file
 * - Note: The data is backed up in a folder inside of `.minecraft/config/tska-backup` every 10minutes
 * and whenever the file gets corrupted it attempts to re-set it with the backup one
 * @template T
 * @param {string} moduleName
 * @param {T} [defaultData={}] `{}`
 * @param {string} [fileName=".data.json"] `".data.json"`
 * @returns {T & LocalStoreImpl<T>}
 */
function LocalStoreImpl(moduleName, defaultData = {}, fileName = ".data.json") {
    if (!(this instanceof LocalStoreImpl)) return new LocalStoreImpl(moduleName, defaultData, fileName)

    let cachedData = FileLib.read(moduleName, fileName) || FileLib.read(`./config/tska-backup/${moduleName}/${fileName}`)
    if (!cachedData && FileLib.exists(moduleName, fileName))
        console.warn(`[TSKA] Seems like your data for module \"${moduleName}\" was corruputed therefore resetted.`)

    const parsed = JSON.parse(cachedData || "{}")
    Object.assign(this, defaultData, parsed)

    this[moduleNameSym] = moduleName
    this[fileNameSym] = fileName

    cachedInstances.push(this)

    return this
}

/**
 * - Function that returns the module's `moduleName` and `fileName`
 * to store the data at
 * @private
 * @returns {[string, string]}
 */
LocalStoreImpl.prototype.getModuleData = () => {
    return [this[moduleNameSym], this[fileNameSym]]
}
/**
 * - This function is mostly for internal use since the dev should not handle this
 * but it is open to use if you feel like it is better.
 * - This gets called every time the game unloads automatically
 * @deprecated
 */
LocalStoreImpl.prototype.save = function save() {
    const [moduleName, fileName] = this.getModuleData()

    FileLib.write(moduleName, fileName, JSON.stringify(this, null, 4), true)
}

/** @private */
LocalStoreImpl.prototype._saveBackup = function _saveBackup() {
    const [moduleName, fileName] = this.getModuleData()

    FileLib.write(`./config/tska-backup/${moduleName}/${fileName}`, JSON.stringify(this, null, 4), true)
}

/** @type {{ new<T>(moduleName: string, defaultData: T, fileName: string): (T & LocalStoreImpl<T>) } & typeof LocalStoreImpl} */
export const LocalStore = LocalStoreImpl

const data = new LocalStore("tska", {
    LocalStore: {
        lastBackup: null
    }
}, "data/data.json")

register("gameUnload", () => {
    for (let local of cachedInstances)
        local.save()
}).setPriority(Priority.LOWEST)

register("tick", () => {
    if (!World.isLoaded()) return
    const lastBackup = data.LocalStore.lastBackup
    if (lastBackup && Date.now() - lastBackup <= 1000 * 60 * 10) return

    data.LocalStore.lastBackup = Date.now()
    new Thread(() => {
        for (let local of cachedInstances)
            local._saveBackup()
    }).start()
})