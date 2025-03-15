/**
 * - This class is basically a wrapper for Minecraft's GlStateManager
 * - mostly to not have to type the obfuscated method name rather use this ontop of it
 * - NOTE: it does not contain all of the methods
 */
export class DGlStateManager {
    static pushMatrix() {
        GlStateManager./* pushMatrix */func_179094_E()

        return this
    }

    static popMatrix() {
        GlStateManager./* popMatrix */func_179121_F()

        return this
    }

    static translate(x, y, z) {
        GlStateManager./* translate */func_179137_b(x, y, z)

        return this
    }

    static tryBlendFuncSeparate(srcFactor, dstFactor, srcFactorAlpha, dstFactorAlpha) {
        GlStateManager./* tryBlendFuncSeparate */func_179120_a(srcFactor, dstFactor, srcFactorAlpha, dstFactorAlpha)

        return this
    }

    static color(r, g, b, a) {
        GlStateManager./* color */func_179131_c(r, g, b, a)

        return this
    }

    static bindTexture(int) {
        GlStateManager./* bindTexture */func_179144_i(int)
        return this
    }

    static scale(x, y) {
        GlStateManager./* scale */func_179152_a(x, y || x, 1)
        return this
    }

    static enableBlend() {
        GlStateManager./* enableBlend */func_179147_l()

        return this
    }

    static enableAlpha() {
        GlStateManager./* enableAlpha */func_179141_d()

        return this
    }

    static enableTexture2D() {
        GlStateManager./* enableTexture2D */func_179098_w()

        return this
    }

    static enableDepth() {
        GlStateManager./* enableDepth */func_179126_j()

        return this
    }

    static enableCull() {
        GlStateManager./* enableCull */func_179089_o()

        return this
    }

    static enableLighting() {
        GlStateManager./* enableLighting */func_179145_e()

        return this
    }

    static disableTexture2D() {
        GlStateManager./* disableTexture2D */func_179090_x()

        return this
    }

    static disableLighting() {
        GlStateManager./* disableLighting */func_179140_f()

        return this
    }

    static disableAlpha() {
        GlStateManager./* disableAlpha */func_179118_c()

        return this
    }

    static disableBlend() {
        GlStateManager./* disableBlend */func_179084_k()

        return this
    }

    static disableDepth() {
        GlStateManager./* disableDepth */func_179097_i()

        return this
    }

    static disableCull() {
        GlStateManager./* disableCull */func_179129_p()

        return this
    }

    static resetColor() {
        GlStateManager./* resetColor */func_179117_G()

        return this
    }
}