const numerals = {"M": 1000, "CM": 900, "D": 500, "CD": 400, "C": 100, "XC": 90, "L": 50, "XL": 40, "X": 10, "IX": 9, "V": 5, "IV": 4, "I": 1}

/** @param {string} str */
export const decodeRoman = (str) => {
    if (!str) return
    str = str.toUpperCase()
    if (!str.match(/^[IVXLCDM]+$/)) return

    let total = 0
    let prev = 0

    for (char of str) {
        let curr = numerals[char]
        if (!curr) {
            total = null
            break
        }

        total += curr <= prev ? curr : curr - 2 * prev
        prev = curr
    }

    return total
}