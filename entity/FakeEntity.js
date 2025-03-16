const UUID = Java.type("java.util.UUID")
const GameProfile = Java.type("com.mojang.authlib.GameProfile")
const EntityOtherPlayerMP = Java.type("net.minecraft.client.entity.EntityOtherPlayerMP")
const DefaultPlayerSkin = Java.type("net.minecraft.client.resources.DefaultPlayerSkin")
const EnumPlayerModelParts = Java.type("net.minecraft.entity.player.EnumPlayerModelParts")
const TEXTURE_ALEX = DefaultPlayerSkin.class.getDeclaredField(/* TEXTURE_ALEX */"field_177336_b")
TEXTURE_ALEX.setAccessible(true)
const actualTexture = TEXTURE_ALEX.get(null)
const emptyComp = new TextComponent("")

export class FakeEntity {
    /**
     * - Creates a fake entity using a real player's uuid, name and texture
     * @param {string} dashedUUID Uuid with dashes formatting i.e. "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
     * @param {string} name The name of the player
     * @returns {MCEntity} MCEntity
     */
    static fromReal(dashedUUID, name) {
        const uuid = UUID.fromString(dashedUUID)
        const fakeProfile = Client.getMinecraft()./* getSessionService */func_152347_ac().fillProfileProperties(new GameProfile(uuid, name), true)
    
        let skinLocation = null
        let capeLocation = null
        let skinType = null
    
        const fakeEntity = new JavaAdapter(EntityOtherPlayerMP, {
            /* getLocationSkin */func_110306_p() {
                return skinLocation || actualTexture
            },
            /* getSkinType */func_175154_l() {
                return skinType || "default"
            },
            /* getLocationCape */func_110303_q() {
                return capeLocation
            },
            /* getAlwaysRenderNameTagForRender */func_94059_bO() {
                return false
            },
            /* hasCustomName */func_145818_k_() {
                return false
            },
            /* getDisplayName */func_145748_c_() {
                return emptyComp.chatComponentText
            },
            /* getTeam */func_96124_cp() {
                return null
            },
            /* moveEntityWithHeading */func_70612_e(strafe, forward) {
                return
            },
            /* isOnTeam */func_142012_a(teamIn) {
                return false
            },
            /* canEntityBeSeen */func_70685_l(entityIn) {
                return false
            },
            func_175137_e(entity) {}
        }, World.getWorld(), fakeProfile)
    
        Client.getMinecraft()./* getSkinManager */func_152342_ad()./* loadProfileTextures */func_152790_a(fakeEntity./* getGameProfile */func_146103_bH(), (type, location1, profileTexture) => {
            switch (type) {
                case com.mojang.authlib.minecraft.MinecraftProfileTexture.Type.CAPE:
                    capeLocation = location1
                    break
                case com.mojang.authlib.minecraft.MinecraftProfileTexture.Type.SKIN:
                    skinLocation = location1
                    skinType = profileTexture.getMetadata("model")
                    break
                default:
                    break
            }
        }, false)
    
        let jbyte = 0
        for (let layer of EnumPlayerModelParts.values()) {
            jbyte |= Math.floor(layer./* getPartMask */func_179327_a())
        }
    
        fakeEntity./* getDataWatcher */func_70096_w()./* updateObject */func_75692_b(new (java.lang.Integer)(10), new (java.lang.Byte)(jbyte))
    
        return fakeEntity
    }
}