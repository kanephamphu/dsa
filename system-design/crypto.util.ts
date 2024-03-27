function md5(input: string): string {
    const rotateLeft = (value: number, shift: number) => (value << shift) | (value >>> (32 - shift));

    const addUnsigned = (x: number, y: number) => {
        let lsw = (x & 0xFFFF) + (y & 0xFFFF);
        let msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    };

    const F = (x: number, y: number, z: number) => (x & y) | ((~x) & z);
    const G = (x: number, y: number, z: number) => (x & z) | (y & (~z));
    const H = (x: number, y: number, z: number) => x ^ y ^ z;
    const I = (x: number, y: number, z: number) => y ^ (x | (~z));

    const K = [
        0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee,
        0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
        0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
        0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
        0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
        0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
        0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
        0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
        0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
        0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
        0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
        0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
        0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
        0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
        0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
        0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
    ];

    const blocks: number[] = [];
    const bitLen = input.length * 8;

    for (let i = 0; i < input.length; i++) {
        blocks[i >> 2] |= input.charCodeAt(i) << ((i % 4) * 8);
    }

    blocks[bitLen >> 5] |= 0x80 << (bitLen % 32);
    blocks[(((bitLen + 64) >>> 9) << 4) + 14] = bitLen;

    let a = 0x67452301;
    let b = 0xefcdab89;
    let c = 0x98badcfe;
    let d = 0x10325476;

    for (let i = 0; i < blocks.length; i += 16) {
        let aa = a;
        let bb = b;
        let cc = c;
        let dd = d;

        for (let j = 0; j < 64; j++) {
            let f: number;
            let g: number;

            if (j < 16) {
                f = F(b, c, d);
                g = j;
            } else if (j < 32) {
                f = G(b, c, d);
                g = (5 * j + 1) % 16;
            } else if (j < 48) {
                f = H(b, c, d);
                g = (3 * j + 5) % 16;
            } else {
                f = I(b, c, d);
                g = (7 * j) % 16;
            }

            let temp = d;
            d = c;
            c = b;
            b = addUnsigned(b, rotateLeft((a + f + K[j] + blocks[i + g]), [7, 12, 17, 22][j >> 4]));
            a = temp;
        }

        a = addUnsigned(a, aa);
        b = addUnsigned(b, bb);
        c = addUnsigned(c, cc);
        d = addUnsigned(d, dd);
    }

    const toHex = (value: number) => {
        const hex = value.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return toHex(a) + toHex(b) + toHex(c) + toHex(d);
}