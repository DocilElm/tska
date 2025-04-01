/**
 * - Custom Set class that uses a `HashMap` as the underlying "list" (map)
 * - Manages most of the functionalities of a `"HashSet"` in here (not a real HashSet but sort of works like one)
 */
export class SetArray {
    constructor(size = 16, loadFactor = 0.75) {
        /**
         * * The underlying `HashMap` that is used for this class
         * @private
         */
        this._hashMap = new HashMap(size || 16, loadFactor || 0.75)
        /** @private */
        this._dirty = true
        /** @private */
        this._cachedArray = this.toArray()
    }

    /**
     * - Gets the item at the specified index location in the list
     * @param {number} idx The index of the item (starts at `0`)
     * @returns {*}
     */
    get(idx) {
        if (idx >= this.size()) return

        return this._hashMap.get(idx)
    }

    /**
     * - Pushes an element into the array list with its respective value
     * @param {*} v The value
     * @returns {this} this for method chaining
     */
    push(v) {
        if (v == null) return

        this._hashMap.put(this.size(), v)
        this._dirty = true

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
        if (v == null) return

        this._hashMap.putIfAbsent(this.size(), v)
        this._dirty = true

        return this
    }

    /**
     * - Sets the value at the specified index location of the list
     * @param {number} idx The index to place this item at
     * @param {*} v The value
     * @returns {boolean}
     */
    set(idx, v) {
        if (idx >= this.size()) return false

        this._hashMap.replace(idx, v)
        this._cachedArray[idx] = v

        return true
    }

    /**
     * - Removes the specified value from the list
     * @param {*} v The value
     * @returns {boolean}
     */
    remove(v) {
        if (this.has(v)) {
            for (let idx = 0; idx < this.size(); idx++) {
                let val = this.get(idx)
                if (val !== v) continue

                this._hashMap.remove(idx)
                this._cachedArray.splice(idx, 1)
                break
            }
            return true
        }

        return false
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
        return this._hashMap.containsValue(v)
    }

    /**
     * - Gets the size of this list
     * - Note: It will not count null values
     * @returns {number}
     */
    size() {
        return this._hashMap.size()
    }

    /**
     * - Clears all of the elements from this [SetArray]
     * @returns {this} this for method chaining
     */
    clear() {
        this._hashMap.clear()
        this._cachedArray = []

        return this
    }

    /**
     * @param {(value: *, index: number)} cb
     * @returns {this} this for method chaining
     */
    forEach(cb) {
        this._hashMap.forEach((k, v) => cb(v, k))

        return this
    }

    /**
     * - Converts the elements inside of this [SetArray] into an array and returns it
     * @returns {any[]}
     */
    toArray() {
        if (!this._dirty) return this._cachedArray

        this._cachedArray = []
        this.forEach((v) => {
            this._cachedArray.push(v)
        })
        this._dirty = false

        return this._cachedArray
    }
}