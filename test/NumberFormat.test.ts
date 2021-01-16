import Tap from 'tap'

import F from '../src/Formatter'
import {formatV} from '../src/Formatter'

function numbeFormatTest() {
    Tap.test('numbers', t => {

        let v = Math.PI

        // normal. Has space padded alignment
        let r = F('2.3', v)
        let x = ' 3.142'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // zero padded alignment
        r = F('02.3', v)
        x = '03.142'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // no problem with space
        r = F(' 2.3', v)
        x = ' 3.142'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // no alignment
        r = F('-2.3', v)
        x = '3.142'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // no rounding
        r = F('!2.3', v)
        x = ' 3.141'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // no rounding, no alignment
        r = F('-!2.3', v)
        x = '3.141'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // plus
        r = F('+2.3', v)
        x = '+3.142'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // no round plus
        r = F('!+2.3', v)
        x = '+3.141'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // integerize
        v = 1.5
        r = F('1.0', v)
        x = '2'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('!1.0', v)
        x = '1'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // negative
        r = F('2.3', -6.283123456)
        x = '-6.283'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // negative, round, no round
        r = F('2.0', -1.6)
        x = '-2'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('!2.0', -1.6)
        x = '-1'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // thousands
        v = 123456.789
        r = F('k6.3', v)
        x = '123,456.789'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // overflow
        r = F('3.0', v)
        x = '###'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // trailing zeroes
        v = 12.34
        r = F('2.04',v)
        x = '12.3400'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // space padding
        v = 12.34
        r = F('2.4+',v)
        x = '12.34  '
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // no alignment
        v = 12.34
        r = F('2.4-',v)
        x = '12.34'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        t.end()
    })
}

numbeFormatTest()