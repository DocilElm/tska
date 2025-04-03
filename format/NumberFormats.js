const NumberFormat = Java.type("java.text.NumberFormat")
const RoundingMode = Java.type("java.math.RoundingMode")
const Locale = Java.type("java.util.Locale")

export class GroupingFormat {
    /**
     * 
     * @param {"US"|"GERMANY"|null} locale Use "US" to format with commas, "GERMANY" to format with periods (Default = US)
     * @param {"CEILING"|"UP"|"DOWN"|"HALF_UP"|"HALF_DOWN"|"HALF_EVEN"|null} roundingMode Rounding strategy
     * @see https://docs.oracle.com/javase/8/docs/api/java/math/RoundingMode.html for rounding table
     */
    constructor(locale = "US", roundingMode) {
        this._formatter = NumberFormat.getNumberInstance(Locale[locale])
        this._formatter.setGroupingUsed(true)
        this._formatter.setMaximumFractionDigits(2)
        if (roundingMode) this._formatter.setRoundingMode(RoundingMode[roundingMode])
    }

    format(number) {
        this._formatter.format(number)
    }
}

export class PercentFormat {
    /**
     * 
     * @param {"US"|"GERMANY"|null} locale Use "US" to format with commas, "GERMANY" to format with periods (Default = US)
     * @param {"CEILING"|"UP"|"DOWN"|"HALF_UP"|"HALF_DOWN"|"HALF_EVEN"|null} roundingMode Rounding strategy
     * @see https://docs.oracle.com/javase/8/docs/api/java/math/RoundingMode.html for rounding table
     */
    constructor(locale = "US", roundingMode) {
        this._formatter = NumberFormat.getPercentInstance(Locale[locale])
        this._formatter.setGroupingUsed(true)
        this._formatter.setMaximumFractionDigits(2)
        if (roundingMode) this._formatter.setRoundingMode(RoundingMode[roundingMode])
    }

    format(number) {
        this._formatter.format(number)
    }
}

export class CompactFormat {
    /**
     * Polyfill for Java12 CompactNumberInstance
     * @param {"LOWER"|"HIGHER"|null} casing Suffix capitalization (Default = "LOWER")
     * @param {"US"|"GERMANY"|null} locale Use "US" to format with commas, "GERMANY" to format with periods (Default = US)
     * @param {"CEILING"|"UP"|"DOWN"|"HALF_UP"|"HALF_DOWN"|"HALF_EVEN"|null} roundingMode Rounding strategy
     * @see https://docs.oracle.com/javase/8/docs/api/java/math/RoundingMode.html for rounding table
     */
    constructor(casing = "LOWER", locale = "US", roundingMode) {
        this._formatter = NumberFormat.getNumberInstance(Locale[locale])
        this._formatter.setGroupingUsed(true)
        this._formatter.setMaximumFractionDigits(2)
        this._formatter.setMinimumFractionDigits(2)
        if (roundingMode) this._formatter.setRoundingMode(RoundingMode[roundingMode])

        this.suffixes = casing === "LOWER" ? "kmbt" : "KMBT"
    }

    format(number) {
        if (number < 1000) return this._formatter.format(number)

        let index = 0
        while (number >= 1000 && index < this.suffixes.length - 1) {
            number /= 1000
            index++
        }

        return this._formatter.format(number) + this.suffixes[index]
    }
}