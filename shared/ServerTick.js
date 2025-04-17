import { Event } from "../event/Event"

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

register("packetReceived", (packet) => {
    if (packet./* getActionNumber */func_148890_d() > 0) return

    for (let idx = 0; idx < _onServerTick.length; idx++) {
        _onServerTick[idx]()
    }

    for (let idx = _scheduleTaskList.length - 1; idx >= 0; idx--) {
        let delay = _scheduleTaskList[idx][1]--

        if (delay !== 0) continue

        let fn = _scheduleTaskList[idx][0]
        fn()

        _scheduleTaskList.splice(idx, 1)
    }
}).setFilteredClass(net.minecraft.network.play.server.S32PacketConfirmTransaction)

Event.createEvent("servertick", (cb) => {
    return register("packetReceived", (packet) => {
        if (packet./* getActionNumber */func_148890_d() > 0) return

        cb()
    }).setFilteredClass(net.minecraft.network.play.server.S32PacketConfirmTransaction).unregister()
})