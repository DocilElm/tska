/**
 * - Custom array class that acts similarly to Sets
 * - This is simply to abstract away having to implement certain
 * functionalities that these provide as is, i.e. `has(item)`
 */
export class SetArray {
    constructor() {
        this.array = []
    }

    /**
     * - Gets the item at the specified index location in the list
     * @param {number} idx The index of the item (starts at `0`)
     * @returns {*}
     */
    get(idx) {
        if (idx >= this.array.length) return

        return this.array[idx]
    }

    /**
     * - Pushes an element into the array list with its respective value
     * @param {*} v The value
     * @returns {this} this for method chaining
     */
    push(v) {
        if (v == null) return
        this.array.push(v)

        return this
    }

    /**
     * - Pushes an element into the array list with its respective value
     * - This however does a check to see if the item is in the list already before-hand
     * - If it is it will not be added
     * @param {*} v The value
     * @returns {this} this for method chaining
     */
    pushCheck(v) {
        if (v == null || this.has(v)) return

        this.array.push(v)

        return this
    }

    /**
     * - Sets the value at the specified index location of the list
     * @param {number} idx The index to place this item at
     * @param {*} v The value
     * @returns {boolean}
     */
    set(idx, v) {
        if (idx >= this.array.length) return false

        this.array[idx] = v

        return true
    }

    /**
     * - Removes the specified value from the list
     * @param {*} v The value
     * @returns {boolean}
     */
    remove(v) {
        const idx = this._findIdx(v)
        if (idx === -1) return false

        this.array.splice(idx, 1)

        return true
    }

    /**
     * - Deletes the specified value from the list
     * @param {*} v The value
     * @returns {boolean}
     */
    delete(v) {
        return this.remove(v)
    }

    /**
     * - Checks whether this array has the specified value
     * @param {*} v The value
     * @returns {boolean}
     */
    has(v) {
        return this._findIdx(v) !== -1
    }

    /** @private */
    _findIdx(v) {
        return this.array.findIndex((it) => it === v)
    }
}