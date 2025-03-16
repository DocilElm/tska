import { DGlStateManager } from "./DGlStateManager"

const MCTessellator = Java.type("net.minecraft.client.renderer.Tessellator")./* getInstance */func_178181_a()
const DefaultVertexFormats = Java.type("net.minecraft.client.renderer.vertex.DefaultVertexFormats")
const WorldRenderer = MCTessellator./* getWorldRenderer */func_178180_c()
const mcRenderItemField = Java.type("net.minecraft.client.Minecraft").class.getDeclaredField(/* renderItem */"field_175621_X")
mcRenderItemField.setAccessible(true)
const MCRenderItem = mcRenderItemField.get(Client.getMinecraft())
const MCRenderHelper = Java.type("net.minecraft.client.renderer.RenderHelper")

const currentTitle = {
    title: null,
    subtitle: null,
    time: null
}
let started = null

const _drawTitle = (title, subtitle) => {
    if (!title) return
    const [ x, y ] = [
        Renderer.screen.getWidth() / 2,
        Renderer.screen.getHeight() / 2
    ]

    Renderer.translate(x, y)
    Renderer.scale(4, 4)
    Renderer.drawStringWithShadow(title, -(Renderer.getStringWidth(title) / 2), -10)

    if (!subtitle) return

    Renderer.translate(x, y)
    Renderer.scale(2, 2)
    Renderer.drawStringWithShadow(subtitle, -(Renderer.getStringWidth(subtitle) / 2), 5)
}

const showTitleRegister = register("renderOverlay", () => {
    if (!currentTitle.time) return
    if (!started) started = Date.now()

    const remainingTime = currentTitle.time - (Date.now() - started)

    if (remainingTime <= 0) {
        currentTitle.title = null
        currentTitle.subtitle = null
        currentTitle.time = null

        started = null
        showTitleRegister.unregister()
    }

    _drawTitle(currentTitle.title, currentTitle.subtitle)
}).unregister()

/**
 * - Rendering utilities for 2D (screen)
 */
export class Render2D {
    /**
     * - Gets the MCRenderHelper instance
     * @returns {MCRenderHelper} MCRenderHelper
     */
    static getMCRenderHelper() {
        return MCRenderHelper
    }

    /**
     * - Gets the MCRenderItem instance
     * @returns {MCRenderItem} MCRenderItem
     */
    static getMCRenderItem() {
        return MCRenderItem
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
     * - Sets up the stack for a rect draw
     */
    static preDrawRect() {
        Tessellator.enableBlend()
        Tessellator.disableTexture2D()
        Tessellator.tryBlendFuncSeparate(770, 771, 1, 0)
    }

    /**
     * - Resets the stack's state from the rect draw one
     */
    static postDrawRect() {
        Tessellator.disableBlend()
        Tessellator.enableTexture2D()
        Tessellator.colorize(1, 1, 1, 1)
    }

    /**
     * - Draws a rect in screen at the specified position
     * - Note: this does not set the stack, you have to manually do it.
     * @param {number} x The X axis
     * @param {number} y The Y axis
     * @param {number} width The width of the rect
     * @param {number} height The height of the rect
     * @param {boolean} solid Whether to draw a "filled" rect or not (`true` by default)
     * @param {number} lineWidth The line width of the borders (mostly used for `solid = false`)
     */
    static drawRect(x, y, width, height, solid = true, lineWidth = null) {
        if (lineWidth && lineWidth > 0) GL11.glLineWidth(lineWidth)

        WorldRenderer./* begin */func_181668_a(solid ? 6 : 2, DefaultVertexFormats./* POSITION */field_181705_e)
        WorldRenderer./* pos */func_181662_b(x, y + height, 0)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x + width, y + height, 0)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x + width, y, 0)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(x, y, 0)./* endVertex */func_181675_d()
        MCTessellator./* draw */func_78381_a()

        if (lineWidth && lineWidth > 0) GL11.glLineWidth(1)
    }

    /**
     * - Draws an item in screen at the specified position
     * @param {MCItem|Item} item The MCItem or CTItem to draw
     * @param {number} x The X axis
     * @param {number} y The Y axis
     * @param {number} scale The scale factor for the item (`1` by default)
     * @param {number} zlvl The z level this item should render at (`200` by default)
     */
    static drawItem(item, x, y, scale = 1, zlvl = 200) {
        if (scale !== 1) Renderer.scale(scale)
        if (item instanceof Item) item = item.itemStack

        Tessellator.colorize(1, 1, 1, 1)
        MCRenderHelper./* enableStandardItemLighting */func_74519_b()
        MCRenderHelper./* enableGUIStandardItemLighting */func_74520_c()
        MCRenderItem./* zLevel */field_77023_b = zlvl
        MCRenderItem./* renderItemIntoGUI */func_175042_a(item, x / scale, y / scale)
        MCRenderHelper./* disableStandardItemLighting */func_74518_a()
        MCRenderHelper./* disableStandardItemLighting */func_74518_a()

        if (scale !== 1) Renderer.scale(1 / scale)
    }

    /**
     * - Renders a gradient rect at the specified location with the given colors
     * - Some of the code was taken from forge's implementation however it was improved
     * @param {number} left
     * @param {number} top
     * @param {number} right
     * @param {number} bottom
     * @param {number[]} startColor `RGBA` in `0` - `255`
     * @param {number[]} endColor `RGBA` in `0` - `255`
     * @param {number} zlevel The z level to draw this rect at (`300` by default)
     */
    static drawGradientRect(left, top, right, bottom, startColor, endColor, zlevel = 300) {
        const [ r1, g1, b1, a1 ] = [ startColor[0] / 255, startColor[1] / 255, startColor[2] / 255, startColor[3] / 255 ]
        const [ r2, g2, b2, a2 ] = [ endColor[0] / 255, endColor[1] / 255, endColor[2] / 255, endColor[3] / 255 ]

        WorldRenderer./* begin */func_181668_a(7, /* POSITION_COLOR */ DefaultVertexFormats./* POSITION_COLOR */field_181706_f)
        WorldRenderer./* pos */func_181662_b(right, top, zlevel)./* color */func_181666_a(r1, g1, b1, a1)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(left, top, zlevel)./* color */func_181666_a(r1, g1, b1, a1)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(left, bottom, zlevel)./* color */func_181666_a(r2, g2, b2, a2)./* endVertex */func_181675_d()
        WorldRenderer./* pos */func_181662_b(right, bottom, zlevel)./* color */func_181666_a(r2, g2, b2, a2)./* endVertex */func_181675_d()
        MCTessellator./* draw */func_78381_a()
    }

    /**
     * - Draws a hovering-like text with gradient background (similar to ToolTip)
     * - Some of the code was taken from forge's implementation however it was improved
     * @param {string|string[]} textLines The text lines to draw
     * @param {?number} mx The mouse x position
     * @param {?number} my The mouse y position
     * @param {number[]} bgColor The background color (array of `0-255`)
     * @param {number[]} borderColor The border color (array of `0-255`)
     * @param {number} zlevel The z level to draw this at (`300` by default)
     * @returns 
     */
    static drawHoveringText(textLines, mx = Client.getMouseX(), my = Client.getMouseY(), bgColor = [16, 0, 16, 240], borderColor = [80, 0, 255, 80], zlevel = 300) {
        if (!textLines) return
        if (textLines instanceof String) textLines = [textLines]

        const screenWidth = Renderer.screen.getWidth()
        const screenHeight = Renderer.screen.getHeight()
        const fontRenderer = Renderer.getFontRenderer()

        DGlStateManager.disableRescaleNormal()
        MCRenderHelper./* disableStandardItemLighting */func_74518_a()
        DGlStateManager
            .disableLighting()
            .disableDepth()

        let tooltipWidth = 0
        for (let str of textLines) {
            let textWidth = Renderer.getStringWidth(str)
            if (textWidth < tooltipWidth) continue
            tooltipWidth = textWidth
        }

        let shouldWrap = false
        let titleLinesCount = 1
        let tooltipX = mx + 12

        if (tooltipX + tooltipWidth + 4 > screenWidth) {
            tooltipX = mx - 16 - tooltipWidth
            if (tooltipX < 4) {
                if (mx > screenWidth / 2) tooltipWidth = mx - 12 - 8
                else tooltipWidth = screenWidth - 16 - mx
                shouldWrap = true
            }
        }

        if (shouldWrap) {
            let wrappedTooltipWidth = 0
            let wrappedTextLines = []

            for (let i = 0; i < textLines.length; i++) {
                let str = textLines[i]
                let wrappedStr = fontRenderer./* listFormattedStringToWidth */func_78271_c(str, tooltipWidth)
                if (i === 0) titleLinesCount = wrappedStr.length

                for (let str in wrappedStr) {
                    let lineWidth = Renderer.getStringWidth(str)
                    if (lineWidth > wrappedTooltipWidth) wrappedTooltipWidth = lineWidth
                    wrappedTextLines.push(str)
                }
            }

            tooltipWidth = wrappedTooltipWidth
            textLines = wrappedTextLines

            if (mx > screenWidth / 2) tooltipX = mx - 16 - tooltipWidth
            else tooltipX = mx + 12
        }

        let tooltipY = my - 12
        let tooltipHeight = 8

        if (textLines.length > 1) {
            tooltipHeight = textLines.length * 10
            if (textLines.length > titleLinesCount) tooltipHeight += 2
        }

        if (tooltipY + tooltipHeight + 6 > screenHeight) tooltipY = screenHeight - tooltipHeight - 6

        const borderColorEnd = [
            (borderColor[0] & 0xFE) >> 1,
            (borderColor[1] & 0xFE) >> 1,
            (borderColor[2] & 0xFE) >> 1,
            borderColor[3]
        ]

        // Pre gradient draw
        MCRenderItem./* zLevel */field_77023_b = zlevel
        DGlStateManager
            .disableTexture2D()
            .enableBlend()
            .disableAlpha()
            .tryBlendFuncSeparate(770, 771, 1, 0)
            .shadeModel(7425)

        // draw
        Render2D.drawGradientRect(tooltipX - 3, tooltipY - 4, tooltipX + tooltipWidth + 3, tooltipY - 3, bgColor, bgColor, zlevel)
        Render2D.drawGradientRect(tooltipX - 3, tooltipY + tooltipHeight + 3, tooltipX + tooltipWidth + 3, tooltipY + tooltipHeight + 4, bgColor, bgColor, zlevel)
        Render2D.drawGradientRect(tooltipX - 3, tooltipY - 3, tooltipX + tooltipWidth + 3, tooltipY + tooltipHeight + 3, bgColor, bgColor, zlevel)
        Render2D.drawGradientRect(tooltipX - 4, tooltipY - 3, tooltipX - 3, tooltipY + tooltipHeight + 3, bgColor, bgColor, zlevel)
        Render2D.drawGradientRect(tooltipX + tooltipWidth + 3, tooltipY - 3, tooltipX + tooltipWidth + 4, tooltipY + tooltipHeight + 3, bgColor, bgColor,zlevel)
        Render2D.drawGradientRect(tooltipX - 3, tooltipY - 3 + 1, tooltipX - 3 + 1, tooltipY + tooltipHeight + 3 - 1, borderColor, borderColorEnd, zlevel)
        Render2D.drawGradientRect(tooltipX + tooltipWidth + 2, tooltipY - 3 + 1, tooltipX + tooltipWidth + 3, tooltipY + tooltipHeight + 3 - 1, borderColor, borderColorEnd, zlevel)
        Render2D.drawGradientRect(tooltipX - 3, tooltipY - 3, tooltipX + tooltipWidth + 3, tooltipY - 3 + 1, borderColor, borderColor, zlevel)
        Render2D.drawGradientRect(tooltipX - 3, tooltipY + tooltipHeight + 2, tooltipX + tooltipWidth + 3, tooltipY + tooltipHeight + 3, borderColorEnd, borderColorEnd, zlevel)

        // Post gradient draw
        DGlStateManager
            .shadeModel(7424)
            .disableBlend()
            .enableAlpha()
            .enableTexture2D()

        // drawing text
        for (let i = 0; i < textLines.length; i++) {
            let line = textLines[i]
            fontRenderer./* drawStringWithShadow */func_175063_a(line.addColor(), tooltipX, tooltipY, -1)
            if (i + 1 === titleLinesCount) tooltipY += 2
            tooltipY += 10
        }

        MCRenderItem./* zLevel */field_77023_b = zlevel

        DGlStateManager
            .enableLighting()
            .enableDepth()
        MCRenderHelper./* enableStandardItemLighting */func_74519_b()
        DGlStateManager.enableRescaleNormal()
    }

    /**
     * - Draws a title with subtitle in the middle of the screen
     * @param {string} title The title
     * @param {?string} subtitle The subtitle for this Title
     * @param {number} ms The amount of ms this title should be displayed for
     */
    static showTitle(title, subtitle, ms) {
        currentTitle.title = title
        currentTitle.subtitle = subtitle
        currentTitle.time = ms
        showTitleRegister.register()
    }

    /**
     * - Colorizes the stack with the specified rgba
     * @param {number} r Red (`0` - `255`)
     * @param {number} g Green (`0` - `255`)
     * @param {number} b Blue (`0` - `255`)
     * @param {number} a Alpha (`0` - `255`) defaults to `255`
     */
    static colorize(r, g, b, a = 255) {
        DGlStateManager.color(r / 255, g / 255, b / 255, a / 255)
    }
}