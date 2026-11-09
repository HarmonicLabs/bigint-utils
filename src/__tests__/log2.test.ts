import { log2 } from "..";

/** the definition: count the shifts until nothing is left */
function referenceLog2( num: bigint ): bigint
{
    if( num === BigInt( 0 ) ) return BigInt( 0 );
    if( num < BigInt( 0 ) ) return -referenceLog2( -num );
    let n = num;
    let result = BigInt( 0 );
    while( n >>= BigInt( 1 ) ) result++;
    return result;
}

describe("log2", () => {

    it("is 0 for 0 and 1", () => {
        expect( log2( BigInt( 0 ) ) ).toBe( BigInt( 0 ) );
        expect( log2( BigInt( 1 ) ) ).toBe( BigInt( 0 ) );
    });

    it("is the floor of the logarithm around every power of two up to 2^600", () => {
        for( let k = 1; k <= 600; k++ )
        {
            const p = BigInt( 1 ) << BigInt( k );
            expect( log2( p - BigInt( 1 ) ) ).toBe( BigInt( k - 1 ) );
            expect( log2( p ) ).toBe( BigInt( k ) );
            expect( log2( p + BigInt( 1 ) ) ).toBe( BigInt( k ) );
        }
    });

    it("is exact at the 32 and 53 bit boundaries", () => {
        expect( log2( BigInt( 0xffffffff ) ) ).toBe( BigInt( 31 ) );
        expect( log2( BigInt( "0x100000000" ) ) ).toBe( BigInt( 32 ) );
        expect( log2( BigInt( Number.MAX_SAFE_INTEGER ) ) ).toBe( BigInt( 52 ) );
        expect( log2( BigInt( Number.MAX_SAFE_INTEGER ) + BigInt( 1 ) ) ).toBe( BigInt( 53 ) );
    });

    it("negates the result for negative inputs", () => {
        expect( log2( BigInt( -1 ) ) ).toBe( BigInt( 0 ) );
        expect( log2( BigInt( -8 ) ) ).toBe( BigInt( -3 ) );
        expect( log2( -( BigInt( 1 ) << BigInt( 100 ) ) ) ).toBe( BigInt( -100 ) );
    });

    it("matches the definition on pseudo-random values up to 576 bits", () => {
        // xorshift, so a failure is reproducible
        let state = 0x9e3779b9;
        const next = () => {
            state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
            return BigInt( state >>> 0 );
        };
        for( let i = 0; i < 2000; i++ )
        {
            let v = BigInt( 0 );
            const words = 1 + ( i % 18 );
            for( let w = 0; w < words; w++ ) v = ( v << BigInt( 32 ) ) | next();
            v >>= BigInt( i % 31 );
            expect( log2( v ) ).toBe( referenceLog2( v ) );
            expect( log2( -v ) ).toBe( referenceLog2( -v ) );
        }
    });

    it("takes time linear in the size of the input", () => {
        // 2^(2^19): a 64 KiB integer. Shifting one bit at a time costs
        // seconds here, a linear pass well under a millisecond.
        const bits = 1 << 19;
        const n = BigInt( 1 ) << BigInt( bits );
        const start = Date.now();
        expect( log2( n ) ).toBe( BigInt( bits ) );
        expect( log2( n - BigInt( 1 ) ) ).toBe( BigInt( bits - 1 ) );
        expect( Date.now() - start ).toBeLessThan( 250 );
    });
});
