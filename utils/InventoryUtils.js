const NBTTagCompoundClass = net.minecraft.nbt.NBTTagCompound
const NBTTagListClass = net.minecraft.nbt.NBTTagList
const ItemStackClass = net.minecraft.item.ItemStack
const skullClass = net.minecraft.init.Items./* skull */field_151144_bL

/**
 * - Creates a skull item with the specified texture inserted into its nbt data
 * @param {string} texture
 * @returns {Item}
 */
export const createSkull = (texture) => {
    const uuid = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx".replace(/x/g, () => parseInt(Math.random() * 9, 16))
    const itemStack = new ItemStackClass(skullClass, 1, 3)
    const tag = new NBTTagCompoundClass()
    const skullOwner = new NBTTagCompoundClass()
    const properties = new NBTTagCompoundClass()
    const textures = new NBTTagListClass()
    const textures_0 = new NBTTagCompoundClass()

    skullOwner./* setString */func_74778_a("Id", uuid)
    skullOwner./* setString */func_74778_a("Name", uuid)

    textures_0./* setString */func_74778_a("Value", texture)
    textures./* appendTag */func_74742_a(textures_0)

    properties./* setTag */func_74782_a("textures", textures)
    skullOwner./* setTag */func_74782_a("Properties", properties)
    tag./* setTag */func_74782_a("SkullOwner", skullOwner)
    itemStack./* setTagCompound */func_77982_d(tag)

    return new Item(itemStack)
}