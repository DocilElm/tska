import Location from "../skyblock/Location"
import { Feature } from "./Feature"

/**
 * - Class that handles features as well as their events automatically for you
 * with an Amaterasu config system
 */
export class FeatureManager {
    /**
     * @param {import("../../Amaterasu/core/Settings").default} config The Amaterasu settings instance i.e. `config.getConfig()`
     */
    constructor(config) {
        this.config = config
        /** @type {Feature[]} */
        this.features = []

        this.config.registerListener((_, v, configName) => {
            for (let feat of this.features) {
                if (feat.configName !== configName) continue

                feat.configValue = v

                if (!feat.configValue) return feat._unregister()

                feat.onAreaChange(Location.area)
                feat.onSubareaChange(Location.subarea)
            }
        })

        Location.onWorldChange((areaName) => {
            for (let feat of this.features) {
                if (!feat.configValue) continue
                feat.onAreaChange(areaName)
            }
        })

        Location.onAreaChange((subareaName) => {
            for (let feat of this.features) {
                if (!feat.configValue) continue
                feat.onSubareaChange(subareaName)
            }
        })
    }

    /**
     * - Creates a new Feature with the specified required [area] and/or [subarea]
     * @param {string} configName
     * @param {?string} area
     * @param {?string} subarea
     * @returns {Feature}
     */
    createFeature(configName, area, subarea) {
        const feat = new Feature(area, subarea)
        // Inject important data into the obj class
        feat.configName = configName
        feat.configValue = this.config.settings[configName]

        this.features.push(feat)

        return feat
    }
}