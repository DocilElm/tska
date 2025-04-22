let _onServerTick = []
let _scheduleTaskList = []

/**
 * - Runs the given function every Server Tick
 * - NOTE: This uses `S32PacketConfirmTransaction`
 * @param {() => void} fn
 */
export const onTick = (fn) => {
    if (typeof fn !== "function") throw `${fn} is not a valid function.`

    _onServerTick.push(fn)
}

/**
 * - Runs the given function after the delay is done
 * - NOTE: These are server ticks not client ticks for that use ct's one
 * @param {() => void} fn The function to be ran
 * @param {number?} delay The delay in ticks (defaults to `1`)
 */
export const scheduleTask = (fn, delay = 1) => {
    if (typeof fn !== "function") throw `${fn} is not a valid function.`
    _scheduleTaskList.push([fn, delay])
}

let ticks = 0
let lastCheck = 0
let lastTicks = Array(5).fill(0)

/**
 * - Gets the Server TPS taking the last 5 ticks
 * - Note: This returns `0` whenever it's initially (world swap etc) calculating, it's done this way
 * so that the dev can do something like `if (tps === 0) drawString("TPS: Loading...")`
 * and not be like every other implementation that returns `20` so the user isn't aware of it being calculated
 * @returns {number}
 */
export const getServerTPS = () => Math.max(0, Math.min(20, lastTicks.reduce((a, b) => a + b, 0) / 5))

register("worldUnload", () => {
    ticks = 0
    lastCheck = 0
    lastTicks = Array(5).fill(0)
})

register("packetReceived", (packet) => {
    if (packet./* getActionNumber */func_148890_d() > 0) return
    ticks++

    if (ticks % 20 === 0) {
        lastTicks.push(20_000 / (Date.now() - (lastCheck || Date.now())))
        lastCheck = Date.now()
        if (lastTicks.length > 5) lastTicks.shift()
    }

    for (let listener of _onServerTick) {
        listener()
    }

    for (let idx = _scheduleTaskList.length - 1; idx >= 0; idx--) {
        let delay = _scheduleTaskList[idx][1]--

        if (delay !== 0) continue

        let fn = _scheduleTaskList[idx][0]
        fn()

        _scheduleTaskList.splice(idx, 1)
    }
}).setFilteredClass(net.minecraft.network.play.server.S32PacketConfirmTransaction)