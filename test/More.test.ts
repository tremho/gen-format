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
        r = F('daterange?diff', {startDate:tn, endDate:tn2})
        x = '0.5 seconds ago'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('daterange?diff-digital', {startDate:tn, endDate:tn2})
        x = '0.5 seconds ago'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('daterange?diff-human', {startDate:tn, endDate:tn2})
        x = '0.5 seconds ago'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        tn2 = tn.getTime() - 5000
        r = F('daterange?diff-digital', {startDate:tn, endDate:tn2})
        x = '5 seconds ago'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('daterange?diff-human', {startDate:tn, endDate:tn2})
        x = '5 seconds ago'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        tn2 = tn.getTime() - 50000
        r = F('daterange?diff-digital', {startDate:tn, endDate:tn2})
        x = '50 seconds ago'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('daterange?diff-human', {startDate:tn, endDate:tn2})
        x = '50 seconds ago'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        tn2 = tn.getTime() - 500000
        r = F('daterange?diff-digital', {startDate:tn, endDate:tn2})
        x = '08:20 ago'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('daterange?diff-human', {startDate:tn, endDate:tn2})
        x = '8 minutes ago'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        tn2 = tn.getTime() - 5000000
        r = F('daterange?diff-digital', {startDate:tn, endDate:tn2})
        x = '1:23:20 ago'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('daterange?diff-human', {startDate:tn, endDate:tn2})
        x = '1 hour ago'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        //-------
        tn2 = tn.getTime() - 500
        r = F('daterange?diff-short', {startDate:tn, endDate:tn2})
        x = '0.5 sec. ago'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('daterange?diff-short-digital', {startDate:tn, endDate:tn2})
        x = '0.5 sec. ago'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('daterange?diff-short-human', {startDate:tn, endDate:tn2})
        x = '0.5 sec. ago'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        tn2 = tn.getTime() - 5000
        r = F('daterange?diff-short-digital', {startDate:tn, endDate:tn2})
        x = '5 sec. ago'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('daterange?diff-short-human', {startDate:tn, endDate:tn2})
        x = '5 sec. ago'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        tn2 = tn.getTime() - 50000
        r = F('daterange?diff-short-digital', {startDate:tn, endDate:tn2})
        x = '50 sec. ago'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('daterange?diff-short-human', {startDate:tn, endDate:tn2})
        x = '50 sec. ago'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        tn2 = tn.getTime() - 500000
        r = F('daterange?diff-short-digital', {startDate:tn, endDate:tn2})
        x = '08:20 ago'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('daterange?diff-short-human', {startDate:tn, endDate:tn2})
        x = '8 min. ago'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        tn2 = tn.getTime() - 5000000
        r = F('daterange?diff-short-digital', {startDate:tn, endDate:tn2})
        x = '1:23:20 ago'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('daterange?diff-short-human', {startDate:tn, endDate:tn2})
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

        // TODO: .sss, .ss, .s, x
        // TODO: j, u
        // TODO: h H V (12-12, 0-24, 0-11), no ap on 24
        // TODO: start with survey of all format sizes: e.g. Y vs. YYY



        t.end()
    })
}

moreTest()