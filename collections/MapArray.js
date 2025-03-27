/**
 * - Custom array class that acts similarly to Maps or Sets
 * - This is simply to abstract away having to implement certain
 * functionalities that these provide as is, i.e. `has(item)`
 */
export class MapArray {
    constructor() {
        this.array = []
    }

    /**
     * - Gets an item from the
     * @param {any} k The key/item to get
     * @returns {{ k: any, v: any }}
     */
    get(k) {
        const idx = this._findIdx(k)
        if (idx === -1) return

        return this.array[idx]
    }

    /**
     * - Pushes an element into the array list with its respective key and value
     * @param {*} k The key
     * @param {*} v The value
     * @returns {this} this for method chaining
     */
    push(k, v) {
        this.array.push({ k, v })

        return this
    }

    /**
     * - Pushes an element into the array list with its respective key and value
     * - This however does a check to see if the item is in the list already before-hand
     * - If it is it will not be added
     * @param {*} k The key
     * @param {*} v The value
     * @returns {this} this for method chaining
     */
    pushCheck(k, v) {
        if (this.has(k)) return this

        this.array.push({ k, v })

        return this
    }

    /**
     * - Checks whether this array has the specified key
     * @param {*} k The key
     * @returns {boolean}
     */
    has(k) {
        return this._findIdx(k) !== -1
    }

    /**
     * - Sets the value of the specified key
     * @param {*} k The key
     * @param {*} v The value
     * @returns {boolean}
     */
    set(k, v) {
        const idx = this._findIdx(k)
        if (idx === -1) return false

        this.array[idx].v = v
        return true
    }

    /**
     * - Removes the specified key from the list
     * @param {*} k The key
     * @returns {boolean}
     */
    remove(k) {
        const idx = this._findIdx(k)
        if (idx === -1) return false

        this.array.splice(idx, 1)
        return true
    }

    /**
     * - Deletes the specified key from the list
     * @param {*} k The key
     * @returns {boolean}
     */
    delete(k) {
        return this.remove(k)
    }

    /**
     * @private
     * @param {*} k The key to find
     * @returns {number}
     */
    _findIdx(k) {
        return this.array.findIndex((it) => it.k === k)
    }
}