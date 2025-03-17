export class Promise {
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

    _resolve(...args) {
        if (this.state) return

        this.state = 1
        this.value = args
        this.handlers.forEach((it) => it.onFulfilled(...args))
    }

    _reject(...args) {
        if (this.state) return

        this.state = 2
        this.reason = args
        this.handlers.forEach((it) => it.onRejected(...args))
    }

    then(onFulfilled, onRejected) {
        return new Promise((resolve, reject) => {
            const handler = {
                onFulfilled(value) {
                    try {
                        onFulfilled(...value)
                        resolve(...value)
                    } catch (err) {
                        reject(err)
                    }
                },
                onRejected(reason) {
                    try {
                        onRejected(...reason)
                        resolve(...reason)
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

    catch(onRejected) {
        return this.then(null, onRejected)
    }

    static resolve(...args) {
        return new Promise((resolve) => resolve(...args))
    }

    static reject(...args) {
        return new Promise((_, reject) => reject(...args))
    }

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

    static race(promises) {
        return new Promise((resolve, reject) => {
            for (let promise of promises) {
                promise.then(resolve).catch(reject)
            }
        })
    }
}