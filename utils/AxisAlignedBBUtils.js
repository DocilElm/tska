const AxisAlignedBB = Java.type("net.minecraft.util.AxisAlignedBB")
const IBlockStateAir = new BlockType("minecraft:air").getDefaultState()

export class AxisAlignedBBUtils {
    /**
     * - Creates a new MCAxisAlignedBB from the given boundaries
     * @param {number} minx
     * @param {number} miny
     * @param {number} maxx
     * @param {number} maxy
     * @returns {*} MCAxisAlignedBB
     */
    static fromBounds(minx, miny, maxx, maxy) {
        return new AxisAlignedBB(minx, miny, maxx, maxy)
    }

    /**
     * - Gets the bounds of the specified AABB
     * @param {*} axis The MCAxisAlignedBB
     * @param {boolean} filled Whether the bounds are for filled block rendering or not (default to `false`)
     * @returns 
     */
    static getBounds(axis, filled = false) {
        return [
            axis./* minX */field_72340_a - (filled ? .01 : 0),
            axis./* minY */field_72338_b - (filled ? .01 : 0),
            axis./* minZ */field_72339_c - (filled ? .01 : 0),
            axis./* maxX */field_72336_d + (filled ? .01 : 0),
            axis./* maxY */field_72337_e + (filled ? .01 : 0),
            axis./* maxZ */field_72334_f + (filled ? .01 : 0)
        ]
    }

    /**
     * - (mostly) Internal use.
     * - Gets the [AxisAlignedBB] for the given [Block]
     * - The same way mojang does it (kind of)
     * @param {Block|MCBlock} block The CTBlock or MCBlock
     * @param {?BlockPos} blockPos The CTBlockPos Or MCBlockPos, note: if it's a ct block you don't need to pass through the blockpos
     * @returns {*} MCAxisAlignedBB
     */
    static getBlockBounds(block, blockPos) {
        if (!blockPos && block instanceof Block) blockPos = block.pos.toMCBlock()
        if (!block || !blockPos) return
        if (block instanceof Block) block = block.type.mcBlock

        const state = block./* getBlockState */func_176194_O()

        if (state != IBlockStateAir)
            block./* setBlockBoundsBasedOnState */func_180654_a(World.getWorld(), blockPos)

        return block./* getSelectedBoundingBox */func_180646_a(World.getWorld(), blockPos)
                ./* expand */func_72314_b(0.002, 0.002, 0.002)
    }
}