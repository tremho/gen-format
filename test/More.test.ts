import Tap from 'tap'

import F from '../src/Formatter'
import {formatV} from '../src/Formatter'

function moreTest() {
    Tap.test('diffs and more', t => {

        let r, x;
        let tn = new Date('2021-01-17T19:18:17Z')
        // Some idle thinking: does this work with the dashes? (yes, because we need -- for am/pm)
        r = F('date|YY-MM-DD hhhh:mm:ss', tn)
        x = '21-01-17 19:18:17'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // TODO: diffs (different display options, human)

        let tn2 = tn.getTime() - 500
        r = F('daterange?diff', [tn, tn2])
        x = '0.5 seconds ago'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('daterange?diff-digital', [tn, tn2])
        x = '0.5 seconds ago'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('daterange?diff-human', [tn, tn2])
        x = '0.5 seconds ago'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        tn2 = tn.getTime() - 5000
        r = F('daterange?diff-digital', [tn, tn2])
        x = '5 seconds ago'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('daterange?diff-human', [tn, tn2])
        x = '5 seconds ago'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        tn2 = tn.getTime() - 50000
        r = F('daterange?diff-digital', [tn, tn2])
        x = '50 seconds ago'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('daterange?diff-human', [tn, tn2])
        x = '50 seconds ago'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        tn2 = tn.getTime() - 500000
        r = F('daterange?diff-digital', [tn, tn2])
        x = '08:20 ago'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('daterange?diff-human', [tn, tn2])
        x = '8 minutes ago'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        tn2 = tn.getTime() - 5000000
        r = F('daterange?diff-digital', [tn, tn2])
        x = '1:23:20 ago'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('daterange?diff-human', [tn, tn2])
        x = '1 hour ago'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        //-------
        tn2 = tn.getTime() - 500
        r = F('daterange?diff-short', [tn, tn2])
        x = '0.5 sec. ago'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('daterange?diff-short-digital', [tn, tn2])
        x = '0.5 sec. ago'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('daterange?diff-short-human', [tn, tn2])
        x = '0.5 sec. ago'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        tn2 = tn.getTime() - 5000
        r = F('daterange?diff-short-digital', [tn, tn2])
        x = '5 sec. ago'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('daterange?diff-short-human', [tn, tn2])
        x = '5 sec. ago'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        tn2 = tn.getTime() - 50000
        r = F('daterange?diff-short-digital', [tn, tn2])
        x = '50 sec. ago'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('daterange?diff-short-human', [tn, tn2])
        x = '50 sec. ago'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        tn2 = tn.getTime() - 500000
        r = F('daterange?diff-short-digital', [tn, tn2])
        x = '08:20 ago'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('daterange?diff-short-human', [tn, tn2])
        x = '8 min. ago'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        tn2 = tn.getTime() - 5000000
        r = F('daterange?diff-short-digital', [tn, tn2])
        x = '1:23:20 ago'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('daterange?diff-short-human', [tn, tn2])
        x = '1 hr. ago'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // Support + - (for A a) as well as ++, -- (AM am)

        // DROP THIS.  We can do am/pm, AM/PM and pm/PM
        // can't do a, A, P, or p --, ++, -+, +-,
        // maybe -?, +? for a/p, A/P

        r = F('date?utc|hh:mm ++', '2021-01-01T05:30Z')
        x = '05:30 AM'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('date?utc|hh:mm --', '2021-01-01T05:30Z')
        x = '05:30 am'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('date?pst|hh:mm +?', '2021-01-01T10:00Z')
        x = '02:00 A'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('date?pst|hh:mm -?', '2021-01-01T10:00Z')
        x = '02:00 a'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('date?utc|hh:mm -?', '2021-01-01T10:00Z')
        x = '10:00 a'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('date?utc|hh:mm -?', '2021-01-01T15:00Z')
        x = '03:00 p'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // TODO: The rest of this can be done as documentation and associated tests...

        // locale and format
        // r = F('date|full-full~es-ES', 'now')
        r = F('date~es-ES|WWW DD MMM YYYY hh:mm:ss ++', '2021-02-14:13:23:34Z')
        x = 'domingo 14 feb. 2021 01:23:34 PM'
        t.ok(r === x, `expected "${x}", got "${r}"`)

            /*
        - [X] test that we can name number and string as well as not
        - [X] typeless $() variable passing

        - [ ] Bug: use of _style_ formats results in cast to local time.
            */

        r = F('1.3', Math.PI)
        x = '3.142'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('number|1.3', Math.PI)
        x = '3.142'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        r = formatV('one $() two $() three $() four $()', 'hello', Math.PI, 4, 2)
        x = 'one hello two 3.141592653589793 three 4 four 2'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        r = F('date|none-long', '2021-01-24:10:30:00Z')
        x = '2:30:00 AM PST'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        x = r
        r = F('date?local|h:mm:ss ++ z', '2021-01-24:10:30:00Z')
        t.ok(r === x, `expected "${x}", got "${r}"`)


        const dt = '2021-01-25T00:10:00Z'
        r = F('date?gmt|full', dt)
        x = 'Monday, January 25, 2021 at 12:10:00 AM Greenwich Mean Time'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('date?est|full', dt)
        x = "Sunday, January 24, 2021 at 7:10:00 PM Eastern Standard Time"
        t.ok(r === x, `expected "${x}", got "${r}"`)
        x = "Sunday, January 24, 2021 at 6:10:00 PM Central Standard Time"
        r = F('date?cst|full', dt)
        t.ok(r === x, `expected "${x}", got "${r}"`)
        x = "Sunday, January 24, 2021 at 5:10:00 PM Mountain Standard Time"
        r = F('date?mst|full', dt)
        t.ok(r === x, `expected "${x}", got "${r}"`)
        x = "Sunday, January 24, 2021 at 4:10:00 PM Pacific Standard Time"
        r = F('date?pst|full', dt)
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('date|full', dt)
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('date?local|full', dt)
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // format bug investigation
        const foo = {
            foo:'foo',
            bar: {
                value: 'world'
            }
        }
        r = formatV('This is a test of object output default $(,),$(,),$(,),$(,),$(,),$(,)', foo, 'hello world', Math.PI, ['apple', 'banana', 'cherry'], null, { more: 'stuff' })
        x = 'This is a test of object output default [object Object],hello world,3.141592653589793,apple,banana,cherry,,[object Object]'
        t.ok(r === x, `expected "${x}", got "${r}"`)


        t.end()
    })
}

moreTest()