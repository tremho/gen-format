import Tap from 'tap'

import F from '../src/Formatter'
import {formatV} from '../src/Formatter'

function stringFormatTest() {
    Tap.test('strings', t => {

        /*
         * [10,20]              // Will pad the end of the string with spaces if less than 10 characters,
         *                      // or truncate it if its length is more than 20.
         */
        // pad to 10 spaces
        let v = 'test'
        let r = F('10,10', v)
        let x = 'test      '
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // truncate to 10 spaces
        v = 'this is an epic test'
        r = F('10,10', v)
        x = 'this is an'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // [10,10-] // Similar, but pads with "-" instead of space
        v = 'test'
        r = F('10,10-', v)
        x = 'test------'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // [10,10hello] // Similar, but pads with "hello" instead of space
        v = 'test'
        r = F('10,10hello', v)
        x = 'testhelloh'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        v = 'test'
        r = F('10,10 \u1F600', v) // smiley face
        x = 'test \u1f600 \u1f600'      // remember: extended unicode is 2 characters length
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // [10,] // Pads if less than 10 characters, but unlimited max length otherwise
        v = 'test'
        r = F('10,', v)
        x = 'test      '
        t.ok(r === x, `expected "${x}", got "${r}"`)
        v = 'this is an epic test'
        r = F('10,', v)
        x = 'this is an epic test'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // [,10] [0,10] // No minimum length, but maximum is 10
        v = 'this is an epic test'
        r = F(',10,', v)
        x = 'this is an'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        v = 't'
        r = F(',10,', v)
        x = 't'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        v = 'this is an epic test'
        r = F('0,10,', v)
        x = 'this is an'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        v = 't'
        r = F('0,10,', v)
        x = 't'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        // [,0] // empty string
        v = 'test'
        r = F(',0,', v)
        x = ''
        t.ok(r === x, `expected "${x}", got "${r}"`)
        v = 'test'
        r = F('0,0,', v)
        x = ''
        t.ok(r === x, `expected "${x}", got "${r}"`)
        // [ 10,10] // right align
        v = 'test'
        r = F(' 10,10', v)
        x = '      test'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        // [ 10,10 ] // center align
        v = 'test'
        r = F(' 10,10 ', v)
        x = '   test   '
        r = F('>10,10<', 'hello')
        x = '>>hello<< ' // symmetrically padded for center, then padded with spaces for fit
        t.ok(r === x, `expected "${x}", got "${r}"`)
        // [,] no effect
        v = 'test'
        r = F(',', v)
        x = 'test'
        t.ok(r === x, `expected "${x}", got "${r}"`)


        t.end()
    })
 }

stringFormatTest()