import { Event } from "./Event"

const S38PacketPlayerListItem = net.minecraft.network.play.server.S38PacketPlayerListItem

const checkCriteria = (cb, criteria, formatted, event) => {
    const unformatted = formatted.removeFormatting()
    if (!criteria) return cb(unformatted, formatted, event)

    if (typeof criteria === "string") {
        if (unformatted !== criteria) return
        cb(unformatted, formatted, event)
        return
    }

    const match = unformatted.match(criteria)
    if (!match) return

    cb(...match.slice(1), formatted, event)
}

Event.createEvent("command", (cb, commandName) => register("command", cb).setName(commandName))
Event.createEvent("renderEntity", (cb, entityType) => register("renderEntity", cb).setFilteredClass(entityType))
Event.createEvent("postRenderEntity", (cb, entityType) => register("postRenderEntity", cb).setFilteredClass(entityType))
Event.createEvent("stepFps", (cb, fps) => register("step", cb).setFps(fps))
Event.createEvent("stepDelay", (cb, delay) => register("step", cb).setDelay(delay))
Event.createEvent("chat", (cb, criteria) => register("chat", cb).setCriteria(criteria))
Event.createEvent("soundPlay", (cb, criteria) => register("soundPlay", cb).setCriteria(criteria))

Event.createEvent("servertick", (cb) => {
    return register("packetReceived", (packet) => {
        if (packet./* getActionNumber */func_148890_d() > 0) return

        cb()
    }).setFilteredClass(net.minecraft.network.play.server.S32PacketConfirmTransaction)
})

Event.createEvent("serverChat", (cb, criteria) => {
    return register("packetReceived", (packet, event) => {
        if (packet./* isChat */func_148916_d()) return

        const chatComponent = packet./* getChatComponent */func_148915_c()
        const formatted = chatComponent?./* getFormattedText */func_150254_d()

        if (!formatted) return

        checkCriteria(cb, criteria, formatted, event)
    }).setFilteredClass(net.minecraft.network.play.server.S02PacketChat)
})

Event.createEvent("serverActionbar", (cb, criteria) => {
    return register("packetReceived", (packet, event) => {
        if (!packet./* isChat */func_148916_d()) return

        const chatComponent = packet./* getChatComponent */func_148915_c()
        const formatted = chatComponent?./* getFormattedText */func_150254_d()

        if (!formatted) return

        checkCriteria(cb, criteria, formatted, event)
    }).setFilteredClass(net.minecraft.network.play.server.S02PacketChat)
})

Event.createEvent("serverScoreboard", (cb, criteria) => {
    return register("packetReceived", (packet, event) => {
        const channel = packet./* getAction */func_149307_h()
        if (channel !== 2) return

        const teamName = packet./* getName */func_149312_c()
        const team = teamName.match(/^team_(\d+)$/)
        if (!team) return

        const formatted = packet./* getPrefix */func_149311_e().concat(packet./* getSuffix */func_149309_f())
        if (!formatted) return

        checkCriteria(cb, criteria, formatted, event)
    }).setFilteredClass(net.minecraft.network.play.server.S3EPacketTeams)
})

Event.createEvent("serverTabUpdate", (cb, criteria) => {
    return register("packetReceived", (packet, event) => {
        const players = packet./* getEntries */func_179767_a()
        const action = packet./* getAction */func_179768_b()
        if (action !== S38PacketPlayerListItem.Action.UPDATE_DISPLAY_NAME) return

        players.forEach(addPlayerData => {
            const name = addPlayerData./* getDisplayName */func_179961_d()
            if (!name) return

            const formatted = name./* getFormattedText */func_150254_d()
            if (!formatted) return

            checkCriteria(cb, criteria, formatted, event)
        })
    }).setFilteredClass(S38PacketPlayerListItem)
})

Event.createEvent("serverTabAdd", (cb, criteria) => {
    return register("packetReceived", (packet, event) => {
        const players = packet./* getEntries */func_179767_a()
        const action = packet./* getAction */func_179768_b()
        if (action !== S38PacketPlayerListItem.Action.ADD_PLAYER) return

        players.forEach(addPlayerData => {
            const name = addPlayerData./* getDisplayName */func_179961_d()
            if (!name) return

            const formatted = name./* getFormattedText */func_150254_d()
            if (!formatted) return

            checkCriteria(cb, criteria, formatted, event)
        })
    }).setFilteredClass(S38PacketPlayerListItem)
})

Event.createEvent("serverWindowItems", (cb) => register("packetReceived", (packet) => cb(packet./* getItemStacks */func_148910_d())).setFilteredClass(net.minecraft.network.play.server.S30PacketWindowItems))

Event.createEvent("serverWindowOpen", (cb) => {
    return register("packetReceived", (packet) => {
        const windowTitle = packet./* getWindowTitle */func_179840_c()./* getFormattedText */func_150254_d().removeFormatting()
        const windowID = packet./* getWindowId */func_148901_c()
        const hasSlots = packet./* hasSlots */func_148900_g()
        const slotCount = packet./* getSlotCount */func_148898_f()
        const guiID = packet./* getGuiId */func_148902_e()
        const entityID = packet./* getEntityId */func_148897_h()

        cb(windowTitle, windowID, hasSlots, slotCount, guiID, entityID)
    }).setFilteredClass(net.minecraft.network.play.server.S2DPacketOpenWindow)
})

Event.createEvent("serverPlayerPosLook", (cb) => {
    return register("packetReceived", (packet) => {
        const pos = [ packet./* getX */func_148932_c(), packet./* getY */func_148928_d(), packet./* getZ */func_148933_e() ]
        const [ yaw, pitch ] = [ packet./* getYaw */func_148931_f(), packet./* getPitch */func_148930_g() ]

        cb(pos, yaw, pitch)
    }).setFilteredClass(net.minecraft.network.play.server.S08PacketPlayerPosLook)
})

Event.createEvent("serverCollectItem", (cb) => {
    return register("packetReceived", (packet) => {
        cb(packet./* getCollectedItemEntityID */func_149354_c())
    }).setFilteredClass(net.minecraft.network.play.server.S0DPacketCollectItem)
})

Event.createEvent("serverEntityLookMove", (cb) => {
    return register("packetReceived", (packet) => {
        cb(packet./* getEntity */func_149065_a(World.getWorld()), [ packet.func_149062_c(), packet.func_149061_d(), packet.func_149064_e() ])
    }).setFilteredClass(net.minecraft.network.play.server.S14PacketEntity$S17PacketEntityLookMove)
})

Event.createEvent("serverSpawnParticle", (cb, criteria) => {
    return register("packetReceived", (packet, event) => {
        const particleType = packet./* getParticleType */func_179749_a()./* getParticleName */func_179346_b().replace(/\_/g, "")
        const pos = [
            packet./* getXCoordinate */func_149220_d(), // getXCoordinate
            packet./* getYCoordinate */func_149226_e(), // getYCoordinate
            packet./* getZCoordinate */func_149225_f() // getZCoordinate
        ]

        if (criteria && particleType !== criteria) return

        cb(particleType, pos, event)
    }).setFilteredClass(net.minecraft.network.play.server.S2APacketParticles)
})

Event.createEvent("serverWindowClose", (cb) => register("packetReceived", cb).setFilteredClass(net.minecraft.network.play.server.S2EPacketCloseWindow))
Event.createEvent("serverSpawnMob", (cb) => register("packetReceived", (packet) => cb(packet./* getEntityID */func_149024_d())).setFilteredClass(net.minecraft.network.play.server.S0FPacketSpawnMob))

Event.createEvent("serverBlockChange", (cb) => {
    return register("packetReceived", (packet) => {
        const blockPos = packet./* getBlockPosition */func_179827_b()
        const pos = [
            blockPos./* getX */func_177958_n(),
            blockPos./* getY */func_177956_o(),
            blockPos./* getZ */func_177952_p()
        ]
        const block = packet./* getBlockState */func_180728_a()./* getBlock */func_177230_c()

        cb(block, pos)
    }).setFilteredClass(net.minecraft.network.play.server.S23PacketBlockChange)
})

Event.createEvent("serverMultiBlockChange", (cb) => register("packetReceived", (packet) => cb(packet./* getChangedBlocks */func_179844_a())).setFilteredClass(net.minecraft.network.play.server.S22PacketMultiBlockChange))

Event.createEvent("customBlockChange", (cb) => {
    return register("packetReceived", (packet) => {
        const blockPos = packet./* getBlockPosition */func_179827_b()
        const pos = [
            blockPos./* getX */func_177958_n(),
            blockPos./* getY */func_177956_o(),
            blockPos./* getZ */func_177952_p()
        ]
        const block = packet./* getBlockState */func_180728_a()./* getBlock */func_177230_c()

        cb(new Block(new BlockType(block), new BlockPos(pos[0], pos[1], pos[2]), null), pos, block)
    }).setFilteredClass(net.minecraft.network.play.server.S23PacketBlockChange)
})