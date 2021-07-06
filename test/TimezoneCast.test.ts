
/*

Test casts to timezones.
No cast should be same as UTC

should accept cast by anchor, city, abbreviation, or GMT+/- offset

 */

import Tap from 'tap'

import F from '../src/Formatter'
import {formatV} from '../src/Formatter'
import fileOps from '../src/NodeFileOps'
import {setFileOps} from "../src/Formatter";

setFileOps(fileOps)

function TimezoneTest() {
    let r, x, desc
    let tn = 0;
    Tap.test('Timezone casts', t => {

        const dt = '2021-01-25T00:10:00Z'

        desc = 'cast to gmt'
        r = F('date?gmt|full', dt)
        x = 'Monday, January 25, 2021 at 12:10:00 AM Greenwich Mean Time'
        t.ok(r === x, `${tn++}) ${desc}: expected "${x}", got "${r}"`)

        desc = 'cast to est'
        r = F('date?est|full', dt)
        x = "Sunday, January 24, 2021 at 7:10:00 PM Eastern Standard Time"
        t.ok(r === x, `${tn++}) ${desc}: expected "${x}", got "${r}"`)

        desc = 'cast to cst'
        x = "Sunday, January 24, 2021 at 6:10:00 PM Central Standard Time"
        r = F('date?cst|full', dt)
        t.ok(r === x, `${tn++}) ${desc}: expected "${x}", got "${r}"`)

        desc = 'cast to mst'
        x = "Sunday, January 24, 2021 at 5:10:00 PM Mountain Standard Time"
        r = F('date?mst|full', dt)
        t.ok(r === x, `${tn++}) ${desc}: expected "${x}", got "${r}"`)

        desc = 'cast to pst'
        x = "Sunday, January 24, 2021 at 4:10:00 PM Pacific Standard Time"
        r = F('date?pst|full', dt)
        t.ok(r === x, `${tn++}) ${desc}: expected "${x}", got "${r}"`)

        desc = 'cast to local'
        r = F('date?local|full', dt)
        t.ok(r === x, `${tn++}) ${desc}: expected "${x}", got "${r}"`)

        desc = 'no cast default'
        r = F('date|full', dt)
        x = 'Monday, January 25, 2021 at 12:10:00 AM Greenwich Mean Time'
        t.ok(r === x, `${tn++}) ${desc}: expected "${x}", got "${r}"`)

        desc = 'cast to utc'
        r = F('date?utc|full', dt)
        x = 'Monday, January 25, 2021 at 12:10:00 AM Universal Time'
        t.ok(r === x, `${tn++}) ${desc}: expected "${x}", got "${r}"`)

        desc = 'cast to gmt'
        r = F('date?gmt|full', dt)
        x = 'Monday, January 25, 2021 at 12:10:00 AM Greenwich Mean Time'
        t.ok(r === x, `${tn++}) ${desc}: expected "${x}", got "${r}"`)

        t.end()
    })
}

TimezoneTest()


