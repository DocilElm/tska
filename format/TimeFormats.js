const SimpleDateFormat = Java.type("java.text.SimpleDateFormat")
const Locale = Java.type("java.util.Locale")
const ZERO = Date.parse("1/1/1970")

/** 
 * - Wrapper for SimpleDateFormat
 * - Yes, a constant format object will always be faster than Date#toLocaleString or other native Date methods
 * - Date#toLocaleString creates a new formatter object each call
 */
export class ClockFormat {
    constructor(pattern = "hh:mm:ss a", locale = "US") {
        this._formatter = new SimpleDateFormat(pattern, Locale[locale])
    }

    format(time = Date.now()) {
        return this._formatter.format(time)
    }
}

/** 
 * - Formats a time difference
 * - allowed range [0, 86_400_000] ms
 */
export class TimerFormat {
    constructor(pattern = "s.SSS's'", locale) {
        this._formatter = new SimpleDateFormat(pattern, Locale[locale])
    }

    format(time) {
        const rebased = time + ZERO
        return this._formatter.format(rebased)
    }
}