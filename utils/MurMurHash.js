const mult = (x, y) => ((x & 0xffff) * y) + ((((x >>> 16) * y) & 0xffff) << 16)
const rotl = (x, y) => (x << y) | (x >>> (31 - y))

export class MurMurHash {
    static hash(k, seed = 0) {
        let r = k.length % 4
        let b = k.length - r

        let h1 = seed
        let k1 = 0
        let c1 = 0xcc9e2d51
        let c2 = 0x1b873593
        let x = 0

        for (let idx = 0; idx < b; idx += 4) {
            k1 = (k[idx]) | (k[idx + 1] << 8) | (k[idx + 2] << 16) | (k[idx + 3] << 24)

            k1 = mult(k1, c1)
            k1 = rotl(k1, 15)
            k1 = mult(k1, c2)

            h1 ^= k1
            h1 = rotl(h1, 13)
            h1 = mult(h1, 5) + 0xe6546b64

            x = idx
        }

        k1 = 0

        switch (r) {
            case 3:
                k1 ^= k[x + 2] << 16
            case 2:
                k1 ^= k[x + 1] << 8
            case 1:
                k1 ^= k[x]
                k1 = mult(k1, c1)
                k1 = rotl(k1, 15)
                k1 = mult(k1, c2)
                h1 ^= k1
        }

        h1 ^= k.length
        h1 ^= h1 >>> 16
        h1 = mult(h1, 0x85ebca6b)
        h1 ^= h1 >>> 13
        h1 = mult(h1, 0xc2b2ae35)
        h1 ^= h1 >>> 16

        return h1 >>> 0
    }
}