/**
 * - Custom Map class that uses a `HashMap` as the underlying "list" (map)
 * - Manages most of the functionalities of a `HashMap` in here
 */
export class MapArray {
    constructor(size = 16, loadFactor = 0.75) {
        /**
         * * The underlying `HashMap` that is used for this class
         * @private
         */
        this._hashMap = new HashMap(size || 16, loadFactor || 0.75)
    }

    /**
     * - Gets an item from the
     * - If no key is provided it'll return the underlying `HashMap`
     * @param {?any} k The key/item to get
     * @returns {any}
     */
    get(k) {
        if (!k) return this._hashMap

        return this._hashMap.get(k)
    }

    /**
     * - Pushes an element into the array list with its respective key and value
     * @param {*} k The key
     * @param {*} v The value
     * @returns {this} this for method chaining
     */
    push(k, v) {
        if (k == null) return

        this._hashMap.put(k, v)

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
        if (k == null) return this

        this._hashMap.putIfAbsent(k, v)

        return this
    }

    /**
     * - Checks whether this array has the specified key
     * @param {*} k The key
     * @returns {boolean}
     */
    has(k) {
        return this._hashMap.containsKey(k)
    }

    /**
     * - Sets the value of the specified key
     * @param {*} k The key
     * @param {*} v The value
     * @returns {this} this for method chaining
     */
    set(k, v) {
        this._hashMap.replace(k, v)
        return this
    }

    /**
     * - Removes the specified key from the list
     * @param {*} k The key
     * @returns {boolean}
     */
    remove(k) {
        if (this.has(k)) {
            this._hashMap.remove(k)
            return true
        }

        return false
    }

    /**
     * - Deletes the specified key from the list
     * @param {*} k The key
     * @returns {boolean}
     */
    delete(k) {
        return this.remove(k)
    }

    clear() {
        this._hashMap.clear()

        return this
    }

    forEach(cb) {
        this._hashMap.forEach((k, v) => cb(k, v))

        return this
    }
}