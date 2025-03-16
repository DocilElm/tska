import { AxisAlignedBBUtils } from "../utils/AxisAlignedBBUtils"
import { DGlStateManager } from "./DGlStateManager"

const RenderGlobal = Java.type("net.minecraft.client.renderer.RenderGlobal")
const MCTessellator = Java.type("net.minecraft.client.renderer.Tessellator")./* getInstance */func_178181_a()
const DefaultVertexFormats = Java.type("net.minecraft.client.renderer.vertex.DefaultVertexFormats")
const WorldRenderer = MCTessellator./* getWorldRenderer */func_178180_c()
// From BeaconBeam module
const ResourceLocation = Java.type("net.minecraft.util.ResourceLocation")
const MathHelper = Java.type("net.minecraft.util.MathHelper")
const beaconBeam = new ResourceLocation("textures/entity/beacon_beam.png")

/**
 * - Rendering utilities for 3D (world)
 */
export class Render3D {
    /**
     * - Lerps a value with the specified multiplier
     * - This is more commonly used in rendering so the highlight does not look jittery
     * @param {number} current The current value
     * @param {number} last The last value
     * @param {?number} pticks The partial ticks multiplier or null to use global one
     * @returns {number}
     */
    static lerp(current, last, pticks = null) {
        if (pticks == null) pticks = Tessellator.getPartialTicks()
        return last + (current - last) * pticks
    }

    /**
     * - Lerps a value with the specified multiplier
     * - This is more commonly used in rendering so the highlight does not look jittery
     * - Note: This is an alias for `Render3D.lerp()`
     * @param {number} current The current value
     * @param {number} last The last value
     * @param {?number} pticks The partial ticks multiplier or null to use global one
     * @returns {number}
     */
    static interpolate(current, last, pticks = null) {
        return Render3D.lerp(current, last, pticks)
    }

    /**
     * - Gets the MCTessellator instance
     * @returns {MCTessellator} MCTessellator
     */
    static getMCTessellator() {
        return MCTessellator
    }

    /**
     * - Gets the MCWorldRenderer instance
     * @returns {MCWorldRenderer} MCWorldRenderer
     */
    static getMCWorldRenderer() {
        return WorldRenderer
    }

    /**
     * - Gets the render view entity
     * @returns {MCEntity} MCEntity
     */
    static getRenderViewEntity() {
        return Client.getMinecraft()./* getRenderViewEntity */func_175606_aa()
    }

    /**
     * - Lerps the RenderViewEntity's position and returns it
     * @returns {number[]}
     */
    static lerpViewEntity(partialTicks = null) {
        if (!partialTicks) partialTicks = Tessellator.getPartialTicks()
        const entity = Render3D.getRenderViewEntity()

        return [
            Render3D.lerp(entity./* posX */field_70165_t, entity./* lastTickPosX */field_70142_S, partialTicks),
            Render3D.lerp(entity./* posY */field_70163_u, entity./* lastTickPosY */field_70137_T, partialTicks),
            Render3D.lerp(entity./* posZ */field_70161_v, entity./* lastTickPosZ */field_70136_U, partialTicks)
        ]
    }

    /**
     * - Calls the [drawOutlinedBoundingBox] from minecraft's [RenderGlobal]
     * - NOTE: this does not setup anything in the stack, it directly calls the method.
     * @param {AxisAlignedBB} aabb
     * @param {number} r Red (`0` - `255`)
     * @param {number} g Green (`0` - `255`)
     * @param {number} b Blue (`0` - `255`)
     * @param {number} a Alpha (`0` - `255`)
     * @returns
     */
    static renderOutlinedBoundingBox(aabb, r, g, b, a) {
        RenderGlobal./* drawOutlinedBoundingBox */func_181563_a(aabb, r, g, b, a)
    }

    /**
     * - Renders a filled box at the given [AxisAlignedBB]
     * - NOTE: this does not setup anything in the stack, it directly draws.
     * @param {AxisAlignedBB} aabb 
     * @param {number} r Red (`0` - `255`)
     * @param {number} g Green (`0` - `255`)
     * @param {number} b Blue (`0` - `255`)
     * @param {number} a Alpha (`0` - `255`)
     */
    static renderFilledBoundingBox(aabb, r, g, b, a) {
        const [ x0, y0, z0, x1, y1, z1 ] = AxisAlignedBBUtils.getBounds(aabb)
        DGlStateManager.color(r / 255, g / 255, b / 255, a / 255)

        WorldRenderer./* begin */func_181668_a(5, DefaultVertexFormats./* POSITION */field_181705_e)
        WorldRenderer./* pos */func_181662_b(x0, y0, z0)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x1, y0, z0)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x0, y0, z1)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x1, y0, z1)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x0, y1, z1)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x1, y1, z1)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x0, y1, z0)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x1, y1, z0)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x0, y0, z0)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x1, y0, z0)./* endVertex */func_181675_d()
        MCTessellator./* draw */func_78381_a()

        WorldRenderer./* begin */func_181668_a(7, DefaultVertexFormats./* POSITION */field_181705_e)
        WorldRenderer./* pos */func_181662_b(x0, y0, z0)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x0, y0, z1)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x0, y1, z1)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x0, y1, z0)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x1, y0, z0)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x1, y0, z1)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x1, y1, z1)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x1, y1, z0)./* endVertex */func_181675_d()
        MCTessellator./* draw */func_78381_a()
    }

    /**
     * - Renders an outlined box at the given [AxisAlignedBB] position
     * @param {number} r Red (`0` - `255`)
     * @param {number} g Green (`0` - `255`)
     * @param {number} b Blue (`0` - `255`)
     * @param {number} a Alpha (`0` - `255`)
     * @param {boolean} phase Whether to render it on see through walls or not (`false` by default)
     * @param {number} lineWidth The width of the rendering outline (`3` by default)
     * @param {boolean} translate Whether to translate the position to the render view entity position (`true` by default)
     * @param {number} pticks The partial ticks to use for this rendering, only matters if the rendering looks jittery
     */
    static renderOutlinedBox(aabb, r, g, b, a, phase = false, lineWidth = 3, translate = true, pticks) {
        if (!aabb) return

        const [ realX, realY, realZ ] = Render3D.lerpViewEntity(pticks)

        DGlStateManager
            .pushMatrix()
            .disableTexture2D()
            .enableBlend()
            .disableLighting()
            .disableAlpha()
            .tryBlendFuncSeparate(770, 771, 1, 0)

        GL11.glLineWidth(lineWidth)

        if (translate) DGlStateManager.translate(-realX, -realY, -realZ)
        if (phase) DGlStateManager.disableDepth()

        Render3D.renderOutlinedBoundingBox(aabb, r, g, b, a)

        if (translate) DGlStateManager.translate(realX, realY, realZ)
        if (phase) DGlStateManager.enableDepth()

        DGlStateManager
            .disableBlend()
            .enableAlpha()
            .enableTexture2D()
            .color(1, 1, 1, 1)
            .enableLighting()
            .popMatrix()

        GL11.glLineWidth(2)
    }

    /**
     * - Renders a filled box at the given [AxisAlignedBB] position
     * @param {number} r Red (`0` - `255`)
     * @param {number} g Green (`0` - `255`)
     * @param {number} b Blue (`0` - `255`)
     * @param {number} a Alpha (`0` - `255`)
     * @param {boolean} phase Whether to render it on see through walls or not (`false` by default)
     * @param {boolean} translate Whether to translate the position to the render view entity position (`true` by default)
     * @param {number} pticks The partial ticks to use for this rendering, only matters if the rendering looks jittery
     */
    static renderFilledBox(aabb, r, g, b, a, phase = false, translate = true, pticks) {
        const [ realX, realY, realZ ] = Render3D.lerpViewEntity(pticks)

        DGlStateManager
            .pushMatrix()
            .disableCull()
            .disableTexture2D()
            .enableBlend()
            .disableLighting()
            .disableAlpha()
            .tryBlendFuncSeparate(770, 771, 1, 0)

        if (translate) DGlStateManager.translate(-realX, -realY, -realZ)
        if (phase) DGlStateManager.disableDepth()

        Render3D.renderFilledBoundingBox(aabb, r, g, b, a)

        if (translate) DGlStateManager.translate(realX, realY, realZ)
        if (phase) DGlStateManager.enableDepth()

        DGlStateManager
            .disableBlend()
            .enableAlpha()
            .enableTexture2D()
            .color(1, 1, 1, 1)
            .enableCull()
            .enableLighting()
            .popMatrix()
    }

    /**
     * - Renders an entity box with the given [x, y, z, w, h] values
     * @param {number} x X axis
     * @param {number} y Y axis
     * @param {number} z Z axis
     * @param {number} w Width
     * @param {number} h Height
     * @param {number} r Red (`0` - `255`)
     * @param {number} g Green (`0` - `255`)
     * @param {number} b Blue (`0` - `255`)
     * @param {number} a Alpha (`0` - `255`)
     * @param {boolean} phase Whether to render the box through walls or not (`false` by default)
     * @param {number} lineWidth The width of the line (`3` by default)
     * @param {boolean} translate Whether to translate the rendering coords to the [RenderViewEntity] coords (`true` by default)
     * @param {number} pticks The partial ticks to use for this rendering, only matters if the rendering looks jittery
     */
    static renderEntityBox(x, y, z, w, h, r, g, b, a, lineWidth = 3, phase = false, translate = true, pticks = null) {
        if (x == null) return

        const axis = AxisAlignedBBUtils.fromBounds(
            x - w / 2,
            y,
            z - w / 2,
            x + w / 2,
            y + h,
            z + w / 2
        )

        Render3D.renderOutlinedBox(axis, r, g, b, a, phase, lineWidth, translate, pticks)
    }

    /**
     * - Renders an entity filled box with the given [x, y, z, w, h] values
     * @param {number} x X axis
     * @param {number} y Y axis
     * @param {number} z Z axis
     * @param {number} w Width
     * @param {number} h Height
     * @param {number} r Red (`0` - `255`)
     * @param {number} g Green (`0` - `255`)
     * @param {number} b Blue (`0` - `255`)
     * @param {number} a Alpha (`0` - `255`)
     * @param {boolean} phase Whether to render the filled box through walls or not (`false` by default)
     * @param {boolean} translate Whether to translate the rendering coords to the [RenderViewEntity] coords (`true` by default)
     * @param {number} pticks The partial ticks to use for this rendering, only matters if the rendering looks jittery
     */
    static renderEntityBoxFilled(x, y, z, w, h, r, g, b, a, phase = false, translate = true, pticks = null) {
        if (x == null) return

        const axis = AxisAlignedBBUtils.fromBounds(
            x - w / 2,
            y,
            z - w / 2,
            x + w / 2,
            y + h,
            z + w / 2
        )

        Render3D.renderFilledBox(axis, r, g, b, a, phase, translate, pticks)
    }

    /**
     * - Renders an outline like at the given [Block]
     * - This is (mostly) [Mojang]'s code
     * @param {Block} ctBlock
     * @param {number} r Red (`0` - `255`)
     * @param {number} g Green (`0` - `255`)
     * @param {number} b Blue (`0` - `255`)
     * @param {number} a Alpha (`0` - `255`)
     * @param {boolean} phase Whether to render the filled block through walls or not (`false` by default)
     * @param {number} lineWidth The width of the line to outline this block
     * @param {boolean} translate Whether to translate the rendering coords to the [RenderViewEntity] coords (`true` by default)
     * @param {number} pticks The partial ticks to use for this rendering, only matters if the rendering looks jittery
     * @returns
     */
    static outlineBlock(ctBlock, r, g, b, a, phase = false, lineWidth = 3, translate = true, customTicks) {
        if (!ctBlock) return

        Render3D.renderOutlinedBox(AxisAlignedBBUtils.getBlockBounds(ctBlock), r, g, b, a, phase, lineWidth, translate, customTicks)
    }

    /**
     * - Renders a filled block like at the given [Block]
     * @param {Block} ctBlock
     * @param {number} r Red (`0` - `255`)
     * @param {number} g Green (`0` - `255`)
     * @param {number} b Blue (`0` - `255`)
     * @param {number} a Alpha (`0` - `255`)
     * @param {boolean} phase Whether to render the filled block through walls or not (`false` by default)
     * @param {boolean} translate Whether to translate the rendering coords to the [RenderViewEntity] coords (`true` by default)
     * @link Huge thanks to [Ch1ck3nNeedsRNG](https://github.com/PerseusPotter)
     * @returns
     */
    static filledBlock(ctBlock, r, g, b, a, phase = false, translate = true, customTicks) {
        if (!ctBlock) return

        Render3D.renderFilledBox(AxisAlignedBBUtils.getBlockBounds(ctBlock), r, g, b, a, phase, translate, customTicks)
    }

    /**
     * - Renders a beacon beam
     * @param {number} x X axis
     * @param {number} y Y axis
     * @param {number} z Z axis
     * @param {number} r Red (`0` - `255`)
     * @param {number} g Green (`0` - `255`)
     * @param {number} b Blue (`0` - `255`)
     * @param {number} a Alpha (`0` - `255`)
     * @param {boolean} phase Whether it should render through walls or not
     * @param {number} height The limit height for the beam to render to (`300` by default)
     * @param {boolean} translate Whether to translate the rendering coords to the [RenderViewEntity] coords (`true` by default)
     * @link From [NotEnoughUpdates](https://github.com/NotEnoughUpdates/NotEnoughUpdates/blob/master/src/main/java/io/github/moulberry/notenoughupdates/core/util/render/RenderUtils.java#L220)
     */
    static renderBeaconBeam(x, y, z, r, g, b, a, phase = false, height = 300, translate = true) {
        const [ realX, realY, realZ ] = Render3D.lerpViewEntity()

        DGlStateManager.pushMatrix()

        if (translate) DGlStateManager.translate(-realX, -realY, -realZ)
        if (phase) DGlStateManager.disableDepth()

        r = r / 255
        g = g / 255
        b = b / 255
        a = a / 255

        Client.getMinecraft()./* getTextureManager */func_110434_K()./* bindTexture */func_110577_a(beaconBeam)

        GL11.glTexParameterf(GL11.GL_TEXTURE_2D, GL11.GL_TEXTURE_WRAP_S, GL11.GL_REPEAT)
        GL11.glTexParameterf(GL11.GL_TEXTURE_2D, GL11.GL_TEXTURE_WRAP_T, GL11.GL_REPEAT)

        DGlStateManager
            .disableLighting()
            .enableCull()
            .enableTexture2D()
            .tryBlendFuncSeparate(GL11.GL_SRC_ALPHA, GL11.GL_ONE, GL11.GL_ONE, GL11.GL_ZERO)
            .enableBlend()
            .tryBlendFuncSeparate(GL11.GL_SRC_ALPHA, GL11.GL_ONE_MINUS_SRC_ALPHA, GL11.GL_ONE, GL11.GL_ZERO)

        const time = World.getTime() + Tessellator.getPartialTicks()
        const d1 = MathHelper.func_181162_h(-time * 0.2 - MathHelper./* floor_double */func_76128_c(-time * 0.1))
        const d2 = time * 0.025 * -1.5
        const d4 = 0.5 + Math.cos(d2 + 2.356194490192345) * 0.2
        const d5 = 0.5 + Math.sin(d2 + 2.356194490192345) * 0.2
        const d6 = 0.5 + Math.cos(d2 + (Math.PI / 4)) * 0.2
        const d7 = 0.5 + Math.sin(d2 + (Math.PI / 4)) * 0.2
        const d8 = 0.5 + Math.cos(d2 + 3.9269908169872414) * 0.2
        const d9 = 0.5 + Math.sin(d2 + 3.9269908169872414) * 0.2
        const d10 = 0.5 + Math.cos(d2 + 5.497787143782138) * 0.2
        const d11 = 0.5 + Math.sin(d2 + 5.497787143782138) * 0.2
        const d14 = -1 + d1
        const d15 = height * 2.5 + d14

        WorldRenderer./* begin */func_181668_a(GL11.GL_QUADS, DefaultVertexFormats./* POSITION_TEX_COLOR */field_181709_i)
        WorldRenderer./* pos */func_181662_b(x + d4, y + height, z + d5)./* tex */func_181673_a(1, d15)./* color */func_181666_a(r, g, b, a)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x + d4, y, z + d5)./* tex */func_181673_a(0, d14)./* color */func_181666_a(r, g, b, a)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x + d6, y, z + d7)./* tex */func_181673_a(0, d14)./* color */func_181666_a(r, g, b, 1)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x + d6, y + height, z + d7)./* tex */func_181673_a(0, d15)./* color */func_181666_a(r, g, b, a)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x + d10, y + height, z + d11)./* tex */func_181673_a(1, d15)./* color */func_181666_a(r, g, b, a)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x + d10, y, z + d11)./* tex */func_181673_a(1, d14)./* color */func_181666_a(r, g, b, 1)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x + d8, y, z + d9)./* tex */func_181673_a(0, d14)./* color */func_181666_a(r, g, b, 1)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x + d8, y + height, z + d9)./* tex */func_181673_a(0, d15)./* color */func_181666_a(r, g, b, a)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x + d6, y + height, z + d7)./* tex */func_181673_a(1, d15)./* color */func_181666_a(r, g, b, a)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x + d6, y, z + d7)./* tex */func_181673_a(1, d14)./* color */func_181666_a(r, g, b, 1)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x + d10, y, z + d11)./* tex */func_181673_a(0, d14)./* color */func_181666_a(r, g, b, 1)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x + d10, y + height, z + d11)./* tex */func_181673_a(0, d15)./* color */func_181666_a(r, g, b, a)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x + d8, y + height, z + d9)./* tex */func_181673_a(1, d15)./* color */func_181666_a(r, g, b, a)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x + d8, y, z + d9)./* tex */func_181673_a(1, d14)./* color */func_181666_a(r, g, b, 1)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x + d4, y, z + d5)./* tex */func_181673_a(0, d14)./* color */func_181666_a(r, g, b, 1)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x + d4, y + height, z + d5)./* tex */func_181673_a(0, d15)./* color */func_181666_a(r, g, b, a)./* endVertex */func_181675_d()
        MCTessellator./* draw */func_78381_a()

        DGlStateManager.disableCull()

        const d12 = -1 + d1
        const d13 = height + d12

        WorldRenderer./* begin */func_181668_a(GL11.GL_QUADS, DefaultVertexFormats./* POSITION_TEX_COLOR */field_181709_i)
        WorldRenderer./* pos */func_181662_b(x + 0.2, y + height, z + 0.2)./* tex */func_181673_a(1, d13)./* color */func_181666_a(r, g, b, 0.25 * a)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x + 0.2, y, z + 0.2)./* tex */func_181673_a(1, d12)./* color */func_181666_a(r, g, b, 0.25)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x + 0.8, y, z + 0.2)./* tex */func_181673_a(0, d12)./* color */func_181666_a(r, g, b, 0.25)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x + 0.8, y + height, z + 0.2)./* tex */func_181673_a(0, d13)./* color */func_181666_a(r, g, b, 0.25 * a)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x + 0.8, y + height, z + 0.8)./* tex */func_181673_a(1, d13)./* color */func_181666_a(r, g, b, 0.25 * a)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x + 0.8, y, z + 0.8)./* tex */func_181673_a(1, d12)./* color */func_181666_a(r, g, b, 0.25)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x + 0.2, y, z + 0.8)./* tex */func_181673_a(0, d12)./* color */func_181666_a(r, g, b, 0.25)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x + 0.2, y + height, z + 0.8)./* tex */func_181673_a(0, d13)./* color */func_181666_a(r, g, b, 0.25 * a)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x + 0.8, y + height, z + 0.2)./* tex */func_181673_a(1, d13)./* color */func_181666_a(r, g, b, 0.25 * a)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x + 0.8, y, z + 0.2)./* tex */func_181673_a(1, d12)./* color */func_181666_a(r, g, b, 0.25)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x + 0.8, y, z + 0.8)./* tex */func_181673_a(0, d12)./* color */func_181666_a(r, g, b, 0.25)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x + 0.8, y + height, z + 0.8)./* tex */func_181673_a(0, d13)./* color */func_181666_a(r, g, b, 0.25 * a)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x + 0.2, y + height, z + 0.8)./* tex */func_181673_a(1, d13)./* color */func_181666_a(r, g, b, 0.25 * a)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x + 0.2, y, z + 0.8)./* tex */func_181673_a(1, d12)./* color */func_181666_a(r, g, b, 0.25)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x + 0.2, y, z + 0.2)./* tex */func_181673_a(0, d12)./* color */func_181666_a(r, g, b, 0.25)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x + 0.2, y + height, z + 0.2)./* tex */func_181673_a(0, d13)./* color */func_181666_a(r, g, b, 0.25 * a)./* endVertex */func_181675_d()
        MCTessellator./* draw */func_78381_a()

        if (translate) DGlStateManager.translate(realX, realY, realZ)
        if (phase) DGlStateManager.enableDepth()

        DGlStateManager
            .enableLighting()
            .enableTexture2D()
            .popMatrix()
    }

    /**
     * - Renders a waypoint at the specified location, also renders an outline and filled block at the set position
     * @param {string} text The string to draw at the waypoint
     * @param {number} x X axis
     * @param {number} y Y axis
     * @param {number} z Z axis
     * @param {number} r Red (`0` - `255`)
     * @param {number} g Green (`0` - `255`)
     * @param {number} b Blue (`0` - `255`)
     * @param {number} a Alpha (`0` - `255`)
     * @param {boolean} phase Whether to render the filled block through walls or not (`true` by default)
     */
    static renderWaypoint(text, x, y, z, r, g, b, a, phase = true) {
        const block = World.getBlockAt(x, y, z)

        Render3D.outlineBlock(block, r, g, b, a, phase)
        Render3D.filledBlock(block, r, g, b, 50, phase)
        Tessellator.drawString(text, x + 0.5, y + 5, z + 0.5, Renderer.WHITE, true)
        Render3D.renderBeaconBeam(x, y, z, r, g, b, a, phase)
    }

    /**
     * - Renders a line through the given points
     * @param {number[][]} points The points in an array of arrays
     * @param {number} r Red (`0` - `255`)
     * @param {number} g Green (`0` - `255`)
     * @param {number} b Blue (`0` - `255`)
     * @param {number} a Alpha (`0` - `255`)
     * @param {boolean} phase Whether to render the lines through walls or not (`true` by default)
     * @param {number} lineWidth The width of the line
     * @param {boolean} translate Whether to translate the rendering coords to the [RenderViewEntity] coords (`true` by default)
     */
    static renderLines(points, r, g, b, a, phase = true, lineWidth = 3, translate = true) {
        const [ realX, realY, realZ ] = this.getInterp()

        GL11.glLineWidth(lineWidth)
        DGlStateManager
            .pushMatrix()
            .disableCull()
            .disableLighting()
            .disableTexture2D()
            .enableBlend()
            .tryBlendFuncSeparate(770, 771, 1, 0)

        if (translate) DGlStateManager.translate(-realX, -realY, -realZ)
        if (phase) DGlStateManager.disableDepth()

        DGlStateManager.color(r / 255, g / 255, b / 255, a / 255)

        WorldRenderer./* begin */func_181668_a(3, DefaultVertexFormats./* POSITION */field_181705_e)
        for (let it of points) {
            let [ x, y, z ] = it
            WorldRenderer./* pos */func_181662_b(x, y, z)./* endVertex */func_181675_d()
        }
        MCTessellator./* draw */func_78381_a()

        if (translate) DGlStateManager.translate(realX, realY, realZ)
        if (phase) DGlStateManager.enableDepth()

        DGlStateManager
            .color(1, 1, 1, 1)
            .enableCull()
            .enableLighting()
            .enableTexture2D()
            .enableBlend()
            .popMatrix()
        GL11.glLineWidth(2)
    }

    /**
     * - Renders a string in the world, similar to CT's `Tessellator.drawString()`
     * method but with more features for making it more dev friendly,
     * - Allows the use of `\n` (newline) for multiple strings to draw as well as depth check and shadows
     * @link Taken and modified from nwjn's [Chattriggers code-snippet](https://discord.com/channels/119493402902528000/1109135083228643460/1291612204361060434)
     * @param {string|string[]} text The text(s) to render in the world
     * @param {number} x The X axis
     * @param {number} y The Y axis
     * @param {number} z The Z axis
     * @param {number[]} bgColor The background color (only works if `renderBackground` is enabled)
     * @param {boolean} renderBackground Whether to draw a background in the text that is being rendered
     * @param {number} scale The scale (`1` by default)
     * @param {boolean} increase Whether to increase the box's size the close the player is to it (`true` by default)
     * @param {boolean} shadow Whether to add shadows to the text (`true` by default)
     * @param {boolean} phase Whether to make the text see through walls (`false` by default)
     * @returns 
     */
    static renderString(
        text,
        x,
        y,
        z,
        bgColor = [0, 0, 0, 180],
        renderBackground = true,
        scale = 1,
        increase = true,
        shadow = true,
        phase = false
    ) {
        if (text == null || x == null) return

        let length = 1
        let isArray = false
        if (text.includes("\n")) {
            text = text.split("\n")
            length = text.length
            isArray = true
        }

        const [ realX, realY, realZ ] = Render3D.lerpViewEntity()
        let totalWidth = 0
        const textLines = isArray
            ? text.map(it => (totalWidth += Renderer.getStringWidth(it.removeFormatting())) && it.addColor())
            : (totalWidth += Renderer.getStringWidth(text.removeFormatting())) && text.addColor()
        const mult = Client.getMinecraft()./* gameSettings */field_71474_y./* thirdPersonView */field_74320_O == 2 ? -1 : 1
        let distanceScale = scale
        if (increase) distanceScale = scale * 0.45 * (Math.hypot(x, y, z) / 120)

        const fr = Renderer.getFontRenderer()
        const renderManager = Renderer.getRenderManager()
        const playerViewY = renderManager./* playerViewY */field_78735_i
        const playerViewX = renderManager./* playerViewX */field_78732_j

        DGlStateManager
            .pushMatrix()
            .translate(realX, realY, realZ)
            .rotate(-playerViewY, 0, 1, 0)
            .rotate(playerViewX * mult, 1, 0, 0)
            .scale(-distanceScale, -distanceScale, distanceScale)
            .disableLighting()
            .enableBlend()
            .tryBlendFuncSeparate(770, 771, 1, 0)

        if (phase) DGlStateManager.disableDepth()

        if (renderBackground) {
            const [ r, g, b, a ] = [
                bgColor[0] / 255,
                bgColor[1] / 255,
                bgColor[2] / 255,
                bgColor[3] / 255
            ]
            const ww = totalWidth / 2

            DGlStateManager.disableTexture2D()
            WorldRenderer./* begin */func_181668_a(7, DefaultVertexFormats./* POSITION_COLOR */field_181706_f)
            WorldRenderer./* pos */func_181662_b(-ww - 1, -1 * length, 0)./* color */func_181666_a(r, g, b, a)./* endVertex */func_181675_d()
            WorldRenderer./* pos */func_181662_b(-ww - 1, 10 * length, 0)./* color */func_181666_a(r, g, b, a)./* endVertex */func_181675_d()
            WorldRenderer./* pos */func_181662_b(ww + 1, 10 * length, 0)./* color */func_181666_a(r, g, b, a)./* endVertex */func_181675_d()
            WorldRenderer./* pos */func_181662_b(ww + 1, -1 * length, 0)./* color */func_181666_a(r, g, b, a)./* endVertex */func_181675_d()
            MCTessellator./* draw */func_78381_a()
            DGlStateManager.enableTexture2D()
        }

        if (!isArray)
            fr./* drawString */func_175065_a(textLines, -Renderer.getStringWidth(textLines) / 2, 0, 0xffffff, shadow)
        else {
            for (let idx = 0; idx < textLines.length; idx++) {
                let it = textLines[idx]
                fr./* drawString */func_175065_a(it, -Renderer.getStringWidth(it) / 2, idx * 9, 0xffffff, shadow)
            }
        }

        if (phase) DGlStateManager.enableDepth()
        if (renderBackground) DGlStateManager.color(1, 1, 1, 1)

        DGlStateManager.popMatrix()
    }
}