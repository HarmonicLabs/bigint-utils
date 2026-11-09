import { fromHex, isUint8Array, toHex } from "@harmoniclabs/uint8array-utils";
import { assert } from "./utils/assert";

/**
 * same as ```Math.abs``` but for bigints
 */
export function abs( n: bigint ): bigint
{
    return n < BigInt( 0 ) ? -n : n;
}

/**
 * @returns {bigint} a ```bigint``` between ```0``` and ```Number.MAX_SAFE_INTEGER``` so that is safe to convert to Number for whatever reason 
 */
    export function random(): bigint
    {
        return BigInt(
            Math.round(
                Math.random() * Number.MAX_SAFE_INTEGER
            )
        );
    }

export function max( ...nums: bigint[] ): bigint
{
    return nums.reduce( (a,b) => a > b ? a : b );
}

export function min( ...nums: bigint[] ): bigint
{
    return nums.reduce( (a,b) => a < b ? a : b );
}

const ZERO = BigInt( 0 );
const MAX_UINT32 = BigInt( 0xffffffff );

/**
 * `floor( log2( num ) )` for a positive `num`, `-log2( -num )` for a negative one, `0` for `0`
 */
export function log2( num: bigint ): bigint
{
    const n = BigInt( num );
    if( n < ZERO ) return -log2( -n );
    if( n <= MAX_UINT32 ) return n === ZERO ? ZERO : BigInt( 31 - Math.clz32( Number( n ) ) );

    // 4 bits per hex digit after the first, plus the bits of the first digit
    const hex = n.toString( 16 );
    return BigInt( ( hex.length - 1 ) * 4 + 31 - Math.clz32( parseInt( hex[0], 16 ) ) );
}

/**
 * uses the bytes of the buffer to construct a BigInteger
 * > **IMPORTANT** the bytes are considered in Little Endian order; use ```bigintFromBuffer``` for Big Endian
 */
export function bigintFromBufferLE( buffer: Uint8Array ): bigint
{
    return bigintFromBuffer(
        // need to copy so that it doesn't reverses the original buffer
        Uint8Array.from( buffer )
        .reverse()
    );

}

/**
 * converts a Uint8Array to a ```bigint```
 * Big-Endian default
 */
export function bigintFromBuffer( buffer: Uint8Array ): bigint
{
    assert(
        isUint8Array( buffer ),
        "expected buffer as input, while constructing a bigint instance using bigintFromBufferBE"
    );

    const hexBuff = toHex( buffer );

    if ( hexBuff.length === 0 ) {
        return BigInt( 0 );
    }
    
    return BigInt( `0x${hexBuff}` );
}

/**
 * converts a ```bigint``` to a ```Uint8Array``` of length ```nBytes``` given as second argument
 * 
 * if ```nBytes``` is not specified the Uint8Array takes only the bytes needed
 * @param bigint 
 * @param nBytes 
 * @returns 
 */
export function bigintToBuffer( bigint: bigint, nBytes: number | undefined = undefined ): Uint8Array
{
    assert(
        bigint >= BigInt( 0 ),
        "cannot convert negative bigint to buffer"
    );

    if( bigint == BigInt( 0 ) )
    {
        if(nBytes === undefined)
        {
            return Uint8Array.from( [] );
        }

        return new Uint8Array( nBytes )
    }
    
    let buffHexString = bigint.toString(16);
    buffHexString = buffHexString.length % 2 === 0 ? buffHexString : '0' + buffHexString;

    if( nBytes !== undefined )
    {
        assert(
            Math.round( Math.abs( nBytes ) ) === nBytes,
            "cannot construct a buffer of length " + nBytes + ", while using bigintToBufferOfNBytesBE"
        );

        // pads with zeroes so that the final length is of nBytes*2 (2 hex digits per byte)
        // String.prototype.padStart docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
        buffHexString = buffHexString.padStart( nBytes * 2, "00" );  
        
        if( buffHexString.length > nBytes * 2 )
        {
            console.warn(
                "required buffer size is smaller than the one used effectively by the given bigint, truncating the initial bytes as overflow"
            );

            buffHexString = buffHexString.slice( buffHexString.length - (nBytes * 2) );
        }
    }

    return fromHex( buffHexString );
}