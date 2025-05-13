/** @template T */
export class Promise {
    /**
     * @param {(resolve: (value: ...T), reject: (reason: ...any)) => void} cb The callback function that will be ran
     */
    constructor(cb) {
        this.state = 0
        this.value = null
        this.reason = null
        this.handlers = []

        try {
            cb(this._resolve.bind(this), this._reject.bind(this))
        } catch (err) {
            this._reject(err)
        }
    }

    /** @private */
    _resolve(...args) {
        if (this.state) return

        this.state = 1
        this.value = args
        this.handlers.forEach((it) => it.onFulfilled(args))
    }

    /** @private */
    _reject(...args) {
        if (this.state) return

        this.state = 2
        this.reason = args
        this.handlers.forEach((it) => it.onRejected(args))
    }

    /**
     * - Adds a handler with the specified callback functions to be triggered whenever this promise is `resolved`/`rejected`
     * @template U
     * @param {(...args: T[]) => U | Promise<U>} onFulfilled Triggers this callback whenever the promise is `resolved`
     * @param {(reason: ...any) => U | Promise<U>} onRejected Triggers this callback whenever the promise is `rejected`
     * @returns {Promise<U>} Promise
     */
    then(onFulfilled, onRejected) {
        return new Promise((resolve, reject) => {
            const handler = {
                onFulfilled(value) {
                    try {
                        const result = onFulfilled?.call(null, ...value)
                        if (result instanceof Promise) return result.then(resolve, reject)

                        resolve.call(null, ...value)
                    } catch (err) {
                        reject(err)
                    }
                },
                onRejected(reason) {
                    try {
                        const result = onRejected?.call(null, ...reason)
                        if (result instanceof Promise) return result.then(resolve, reject)

                        reject.call(null, ...reason)
                    } catch (err) {
                        reject(err)
                    }
                }
            }

            switch (this.state) {
                case 1:
                    handler.onFulfilled(this.value)
                    break
                case 2:
                    handler.onRejected(this.reason)
                    break
                default:
                    this.handlers.push(handler)
                    break
            }
        })
    }

    /**
     * - Adds a handler with the specified callback functions to be triggered whenever this promise is `rejected`
     * @template U
     * @param {(reason: ...any) => U | Promise<U>} onRejected Triggers this callback whenever the promise is `rejected`
     * @returns {Promise<U>} Promise
     */
    catch(onRejected) {
        return this.then(null, onRejected)
    }

    /**
     * - Resolves a promise with the given value(s)
     * @template T
     * @param  {...T} args The value(s) to resolve the promise with
     * @returns {Promise<T>} Promise
     */
    static resolve(...args) {
        return new Promise((resolve) => resolve(...args))
    }

    /**
     * - Rejects a promise with the given reason(s)
     * @param  {...any} args The reason(s) to reject the promise with
     * @returns {Promise<never>} Promise
     */
    static reject(...args) {
        return new Promise((_, reject) => reject(...args))
    }

    /**
     * - Makes a `Promise` that resolves only whenever all the given `Promises` are `fullfilled` (`resolved`),
     * or rejects if any `Promise` `rejected`
     * @template T
     * @param {Promise<T>[]} promises The promises list
     * @returns {Promise<T[]>} Promise
     */
    static all(promises) {
        return new Promise((resolve, reject) => {
            let result = []
            let completed = 0

            for (let idx = 0; idx < promises.length; idx++) {
                let promise = promises[idx]

                promise
                    .then((value) => {
                        result[idx] = value
                        completed += 1
                        if (completed === promises.length)
                            resolve(result)
                    })
                    .catch(reject)
            }
        })
    }

    /**
     * - Makes a `Promise` that `resolves` or `rejects` as soon as one of the promises does as well
     * @template T
     * @param {Promise<T>[]} promises The promises list
     * @returns {Promise<T>} Promise
     */
    static race(promises) {
        return new Promise((resolve, reject) => {
            for (let promise of promises) {
                promise.then(resolve).catch(reject)
            }
        })
    }
}