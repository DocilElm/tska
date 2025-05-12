const SimpleDateFormat = java.text.SimpleDateFormat
/**
 * @typedef {object} Locale
 * @prop {*} ENGLISH English
 * @prop {*} US English (United States)
 * @prop {*} UK English (United Kingdom)
 * @prop {*} CANADA English (Canada)
 * @prop {*} CANADA_FRENCH French (Canada)
 * @prop {*} FRENCH French
 * @prop {*} FRANCE French (France)
 * @prop {*} GERMAN German
 * @prop {*} GERMANY German (Germany)
 * @prop {*} ITALIAN Italian
 * @prop {*} ITALY Italian (Italy)
 * @prop {*} JAPANESE Japanese
 * @prop {*} JAPAN Japanese (Japan)
 * @prop {*} KOREAN Korean
 * @prop {*} KOREA Korean (South Korea)
 * @prop {*} CHINESE Chinese
 * @prop {*} CHINA Chinese (Simplified, China)
 * @prop {*} TAIWAN Chinese (Traditional, Taiwan)
 * @prop {*} SIMPLIFIED_CHINESE Chinese (Simplified)
 * @prop {*} TRADITIONAL_CHINESE Chinese (Traditional)
 * @prop {*} ROOT Root locale (no language/country)
 */
/** @type {Locale} */
const Locale = java.util.Locale
const zeroOffset = (24 - new Date(0).getHours()) * 3_600_000
const _defaultSDateFormat = new SimpleDateFormat("s's'", Locale.US)
const _defaultMDateFormat = new SimpleDateFormat("mm'm' ss's'", Locale.US)
const _defaultHDateFormat = new SimpleDateFormat("hh'h' mm'm' ss's'", Locale.US)

export default class TimeFormatter {
    /** @type {Locale} */
    static Locale = Locale

    /**
     * - Formats the given seconds number into human readable time string
     * @param {number} seconds Time in seconds
     * @returns {string} `"01h 03m 10s"` or `"03m 10s"` or `"0s"`
     */
    static format(seconds) {
        if (seconds < 60) return _defaultSDateFormat.format(zeroOffset + seconds * 1000)
        if (seconds >= 3600) return _defaultHDateFormat.format(zeroOffset + seconds * 1000)
        return _defaultMDateFormat.format(zeroOffset + seconds * 1000)
    }

    /**
     * - Formats the seconds into a readable string
     * @param {number} seconds Time in seconds
     * @returns {string} `0s`
     */
    static formatToSeconds(seconds) {
        return _defaultSDateFormat.format(zeroOffset + seconds * 1000)
    }

    /**
     * - Formats the seconds into a readable string
     * @param {number} seconds Time in seconds
     * @returns {string} `03m 10s`
     */
    static formatToMinutes(seconds) {
        return _defaultMDateFormat.format(zeroOffset + seconds * 1000)
    }

    /**
     * - Formats the seconds into a readable string
     * @param {number} seconds Time in seconds
     * @returns {string} `01h 05m 15s`
     */
    static formatToHours(seconds) {
        return _defaultHDateFormat.format(zeroOffset + seconds * 1000)
    }

    /**
     * - Formats the given milliseconds number into human readable time string
     * @param {number} ms Time in milliseconds
     * @returns {string} `"01h 03m 10s"` or `"03m 10s"`
     */
    static formatMs(ms) {
        return TimeFormatter.format(ms / 1000)
    }

    /**
     * @param {string} timeFormat `"hh'h' mm'm' ss's'"` etc
     * @param {?Locale} locale
     */
    constructor(timeFormat, locale = Locale.US) {
        this.timeFormat = timeFormat || "hh'h' mm'm' ss's'"
        this.locale = locale || Locale.US

        this.sdf = new SimpleDateFormat(this.timeFormat, this.locale)
    }

    /**
     * - Formats the given seconds number into human readable time string
     * @param {number} seconds Time in seconds
     * @returns {string}
     */
    format(seconds) {
        return this.sdf.format(zeroOffset + seconds * 1000)
    }

    /**
     * - Formats the given milliseconds number into human readable time string
     * @param {number} ms Time in milliseconds
     * @returns {string}
     */
    formatMs(ms) {
        return this.sdf.format(zeroOffset + ms)
    }
}