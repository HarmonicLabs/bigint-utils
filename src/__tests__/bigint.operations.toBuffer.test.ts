import { toHex } from "@harmoniclabs/uint8array-utils";
import { bigintToBuffer } from "..";

describe("bigintToBuffer", () => {

    it("converts entirely on only bigint as input", () => {

        expect(
            toHex(
                bigintToBuffer( BigInt( 0xffff ) )
            )
        ).toBe( "ffff" )

        expect( 
            toHex(
                bigintToBuffer( BigInt( 0xfffff ) )
            )
        ).toBe( "0fffff" )

    })

    it("pads with zeroes if required buffer size is not met", () => {

        expect( 
            toHex(
                bigintToBuffer( 
                    BigInt( 0xffff ), 10 
                )
            )
        ).toBe( "0000000000000000ffff" )

        expect(
            toHex(
                bigintToBuffer( 
                    BigInt( 0xfffff ), 10
                )
            ) 
        ).toBe( "000000000000000fffff"  )
        
    })

    it("truncates the left-most part of the buffer (bigint) if requred buffer size is less than actual size", () => {

        console.log( "next 3 \"console.warn\" calls are expected");
        
        expect(
            toHex(
                bigintToBuffer( 
                    BigInt( 0xffff ), 0
                )
            )
        ).toBe( "" );

        expect(
            toHex(
                bigintToBuffer( 
                    BigInt( 0xffff ), 1 
                )
            )
        ).toBe( "ff" );

        expect( 
            toHex(
                bigintToBuffer( 
                    BigInt( 0xfffff ), 2
                )
            )
        ).toBe( "ffff"  );

    })

    it("throws on negative required byte-length", () => {

        expect( 
            () => bigintToBuffer( 
                BigInt( 0xffff ), -1
            )
        ).toThrow();

    })

    it("throws on non integer required byte-length", () => {

        expect( 
            () => bigintToBuffer( 
                BigInt( 0xffff ), Math.PI
            )
        ).toThrow();

    })
})