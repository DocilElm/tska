export default class TimeFormatter {
    /** @private */
    static addNumCheck(n) {
        return (n >>= 0) < 10 ? `0${n}` : n
    }

    /**
     * - Formats the given seconds number into human readable time string
     * @param {number} seconds Time in seconds
     * @returns {string} `"01h 03m 10s"` or `"03m 10s"`
     */
    static toFormat(seconds) {
        let hrs = seconds / 3600
        let mins = (seconds % 3600) / 60
        let secs = seconds % 60
        let time = ""

        if (seconds >= 3600) time += `${TimeFormatter.addNumCheck(hrs)}h `
        time += `${TimeFormatter.addNumCheck(mins)}m `
        time += `${TimeFormatter.addNumCheck(secs)}s`

        return time
    }
}