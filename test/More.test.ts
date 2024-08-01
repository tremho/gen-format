import Tap from 'tap'

import F from '../src/Formatter'
import {formatV} from '../src/Formatter'
import fileOps from '../src/NodeFileOps'
import {setFileOps} from "../src/Formatter";
import i18n from "../src/i18n";

setFileOps(fileOps)

function moreTest() {
    Tap.test('diffs and more', t => {

        let r, x;
        let tn = new Date('2021-01-17T19:18:17Z')
        // Some idle thinking: does this work with the dashes? (yes, because we need -- for am/pm)
        r = F('date|YY-MM-DD hhhh:mm:ss', tn)
        x = '21-01-17 19:18:17'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // TODO: diffs (different display options, human)

        // Superceded by RelativeTime.test.ts
        // let tn2 = tn.getTime() - 500
        // r = F('daterange?diff', [tn, tn2])
        // x = '0.5 seconds ago'
        // t.ok(r === x, `expected "${x}", got "${r}"`)
        // r = F('daterange?diff-digital', [tn, tn2])
        // x = '0.5 seconds ago'
        // t.ok(r === x, `expected "${x}", got "${r}"`)
        // r = F('daterange?diff-human', [tn, tn2])
        // x = '0.5 seconds ago'
        // t.ok(r === x, `expected "${x}", got "${r}"`)
        //
        // tn2 = tn.getTime() - 5000
        // r = F('daterange?diff-digital', [tn, tn2])
        // x = '5 seconds ago'
        // t.ok(r === x, `expected "${x}", got "${r}"`)
        // r = F('daterange?diff-human', [tn, tn2])
        // x = '5 seconds ago'
        // t.ok(r === x, `expected "${x}", got "${r}"`)
        //
        // tn2 = tn.getTime() - 50000
        // r = F('daterange?diff-digital', [tn, tn2])
        // x = '50 seconds ago'
        // t.ok(r === x, `expected "${x}", got "${r}"`)
        // r = F('daterange?diff-human', [tn, tn2])
        // x = '50 seconds ago'
        // t.ok(r === x, `expected "${x}", got "${r}"`)
        //
        // tn2 = tn.getTime() - 500000
        // r = F('daterange?diff-digital', [tn, tn2])
        // x = '08:20 ago'
        // t.ok(r === x, `expected "${x}", got "${r}"`)
        // r = F('daterange?diff-human', [tn, tn2])
        // x = '8 minutes ago'
        // t.ok(r === x, `expected "${x}", got "${r}"`)
        //
        // tn2 = tn.getTime() - 5000000
        // r = F('daterange?diff-digital', [tn, tn2])
        // x = '1:23:20 ago'
        // t.ok(r === x, `expected "${x}", got "${r}"`)
        // r = F('daterange?diff-human', [tn, tn2])
        // x = '1 hour ago'
        // t.ok(r === x, `expected "${x}", got "${r}"`)

        //-------
        // let tn2 = tn.getTime() - 500
        // r = F('daterange?diff-short', [tn, tn2])
        // x = '0.5 sec. ago'
        // t.ok(r === x, `expected "${x}", got "${r}"`)
        // r = F('daterange?diff-short-digital', [tn, tn2])
        // x = '0.5 sec. ago'
        // t.ok(r === x, `expected "${x}", got "${r}"`)
        // r = F('daterange?diff-short-human', [tn, tn2])
        // x = '0.5 sec. ago'
        // t.ok(r === x, `expected "${x}", got "${r}"`)
        //
        // tn2 = tn.getTime() - 5000
        // r = F('daterange?diff-short-digital', [tn, tn2])
        // x = '5 sec. ago'
        // t.ok(r === x, `expected "${x}", got "${r}"`)
        // r = F('daterange?diff-short-human', [tn, tn2])
        // x = '5 sec. ago'
        // t.ok(r === x, `expected "${x}", got "${r}"`)
        //
        // tn2 = tn.getTime() - 50000
        // r = F('daterange?diff-short-digital', [tn, tn2])
        // x = '50 sec. ago'
        // t.ok(r === x, `expected "${x}", got "${r}"`)
        // r = F('daterange?diff-short-human', [tn, tn2])
        // x = '50 sec. ago'
        // t.ok(r === x, `expected "${x}", got "${r}"`)
        //
        // tn2 = tn.getTime() - 500000
        // r = F('daterange?diff-short-digital', [tn, tn2])
        // x = '08:20 ago'
        // t.ok(r === x, `expected "${x}", got "${r}"`)
        // r = F('daterange?diff-short-human', [tn, tn2])
        // x = '8 min. ago'
        // t.ok(r === x, `expected "${x}", got "${r}"`)
        //
        // tn2 = tn.getTime() - 5000000
        // r = F('daterange?diff-short-digital', [tn, tn2])
        // x = '1:23:20 ago'
        // t.ok(r === x, `expected "${x}", got "${r}"`)
        // r = F('daterange?diff-short-human', [tn, tn2])
        // x = '1 hr. ago'
        // t.ok(r === x, `expected "${x}", got "${r}"`)

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
        let stats:any = i18n.setLocale() // default locale
        if(stats && stats.totalStrings) {// looks like we have i18n tables
            // r = F('date|full-full~es-ES', 'now')
            r = F('date~es-ES|WWW DD MMM YYYY hhh:mm:ss ++', '2021-02-14:13:23:34Z')
            x = 'domingo 14 feb. 2021 13:23:34 PM'
            t.ok(r === x, `expected "${x}", got "${r}"`) //30
        }

            /*
        - [X] test that we can name number and string as well as not
        - [X] typeless $() variable passing

        - [ ] Bug: use of _style_ formats results in cast to local time.
            */

        r = F('1.3', Math.PI)
        x = '3.142'
        t.ok(r === x, `expected "${x}", got "${r}"`) // 31
        r = F('number|1.3', Math.PI)
        x = '3.142'
        t.ok(r === x, `expected "${x}", got "${r}"`) //32

        r = formatV('one $() two $() three $() four $()', 'hello', Math.PI, 4, 2)
        x = 'one hello two 3.141592653589793 three 4 four 2'
        t.ok(r === x, `expected "${x}", got "${r}"`) //33

        r = F('date|none-full', '2021-01-24:10:30:00Z')
        x = '10:30:00 AM Coordinated Universal Time'
        t.ok(r === x, `expected "${x}", got "${r}"`) //34

        // Note: tests originally written to assume local === PST fail on Travis CI, which is GMT
        // But that seems to have revealed another bug that we should get back "GMT" not "Greenwich Mean Time"
        // for a 'z' format.  Add this to bug list.
        const mo = new Date().getMonth()
        const doLocal = !(mo >=6 && mo <=10)

        if(doLocal) { // don't do a local test in summer (on Windows) because it gets timezone wrong (DST)
            x = '2:30:00 AM PST'
            r = F('date?local|h:mm:ss ++ z', '2021-01-24:10:30:00Z')
            let localTimeIsGMT = (r === '10:30:00 AM Greenwich Mean Time')
            if(localTimeIsGMT) x = '10:30:00 AM Greenwich Mean Time'
            t.ok(r === x, `expected "${x}", got "${r}"`) //35
        
            if(localTimeIsGMT) {
                x = '10:30:00 AM Greenwich Mean Time'
            } else {
                x = '3:30:00 AM PDT'
            }
            r = F('date?local|h:mm:ss ++ z', '2021-06-24:10:30:00Z')
            t.ok(r === x, `expected "${x}", got "${r}"`) //36
        }

        // format bug investigation
        const foo = {
            foo:'foo',
            bar: {
                value: 'world'
            }
        }
        r = formatV('This is a test of object output default $(,),$(,),$(,),$(,),$(,),$(,)', foo, 'hello world', Math.PI, ['apple', 'banana', 'cherry'], null, { more: 'stuff' })
        x = 'This is a test of object output default [object Object],hello world,3.141592653589793,apple,banana,cherry,,[object Object]'
        t.ok(r === x, `expected "${x}", got "${r}"`) // 43


        t.end()
    })
}

moreTest()