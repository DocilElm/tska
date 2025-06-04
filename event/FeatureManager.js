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
        /** @private */
        this.config = config
        /** @type {Feature[]} @private */
        this.features = []

        this.config.registerListener((_, v, configName) => {
            for (let feat of this.features) {
                if (feat.configName !== configName) continue

                feat.configValue = v

                if (!feat.configValue) return feat._unregister()

                feat.onSubareaChange(Location.subarea?.toLowerCase())
            }
        })

        Location.onWorldChange((areaName) => {
            for (let feat of this.features) {
                if (feat.noConfig) {
                    feat.onAreaChange(areaName)
                    continue
                }

                if (!feat.configValue) continue
                feat.onAreaChange(areaName)
            }
        })

        Location.onAreaChange((subareaName) => {
            for (let feat of this.features) {
                if (feat.noConfig) {
                    feat.onSubareaChange(subareaName)
                    continue
                }

                if (!feat.configValue) continue
                feat.onSubareaChange(subareaName)
            }
        })
    }

    /**
     * - Creates a new Feature with the specified required [area] and/or [subarea]
     * @param {string} configName
     * @param {?string|string[]} area
     * @param {?string|string[]} subarea
     * @returns {Feature}
     */
    createFeature(configName, area, subarea) {
        const feat = new Feature(area, subarea)
        // Inject important data into the obj class
        feat.configName = configName
        feat.configValue = this.config.settings[configName]
        if (feat.configValue) feat.onSubareaChange(Location.subarea?.toLowerCase())

        this.features.push(feat)

        return feat
    }

    /**
     * - Creates a new Feature with the specified required [area] and/or [subarea]
     * - This however does not check for config
     * @param {?string|string[]} area
     * @param {?string|string[]} subarea
     * @returns {Feature}
     */
    createFeatureNo(area, subarea) {
        const feat = new Feature(area, subarea)
        feat.noConfig = true

        this.features.push(feat)

        return feat
    }

    /**
     * - Calls `register` to all the features at once
     * - Note: This checks whether the config value is enabled or not,
     * it DOES NOT check for world.
     * @returns {this} this for method chaining
     */
    register() {
        for (let feat of this.features) {
            if (!feat.configValue) continue
            feat._register()
        }

        return this
    }

    /**
     * - Calls `unregister` to all the features at once without any checking.
     * @returns {this} this for method chaining
     */
    unregister() {
        for (let feat of this.features) {
            feat._unregister()
        }

        return this
    }
}