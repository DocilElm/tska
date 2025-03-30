/**
 * - Custom Set class that uses a `HashMap` as the underlying "list" (map)
 * - Manages most of the functionalities of a `"HashSet"` in here (not a real HashSet but sort of works like one)
 */
export class SetArray {
    constructor(size = 16, loadFactor = 0.75) {
        this._hashMap = new HashMap(size || 16, loadFactor || 0.75)
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

    size() {
        return this._hashMap.size()
    }

    clear() {
        this._hashMap.clear()

        return this
    }

    forEach(cb) {
        this._hashMap.forEach((k, v) => cb(v))

        return this
    }
}