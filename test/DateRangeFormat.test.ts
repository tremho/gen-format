import Tap from 'tap'

import F from '../src/Formatter'
import {formatV} from '../src/Formatter'

function dateRangeFormatTest() {
    let desc, r, x;
    Tap.test('date range', t => {
        // date range tests
        let label
        let count = 0;
        const name = () => {
            return label + ' ' + (++count)
        }
        // paired range : use the time format to show range
        label = 'paired range, time'
        count = 0;
        let tn = new Date('2021-01-14T00:00:00Z').getTime()
        // both the same
        r = F('daterange|h:mm:ss', [tn, tn])
        x = '12:00:00'
        t.ok(r === x, `${name()} expected "${x}", got "${r}"`)
        // start < end
        r = F('daterange|h:mm:ss', [tn - 5000, tn])
        x = '11:59:55 - 12:00:00'
        t.ok(r === x, `${name()} expected "${x}", got "${r}"`)
        // start > end
        r = F('daterange|h:mm:ss', [tn + 5000, tn])
        x = '12:00:05 - 12:00:00'
        t.ok(r === x, `${name()} expected "${x}", got "${r}"`)

        // paired dates
        label = 'group dates left, times right'
        count = 0
        // paired range : use the time format to show range, and use date format if date is needed, with grouping
        // both the same
        r = F('daterange|MMM D h:mm:ss', [tn,tn])
        x = 'Jan 14 12:00:00'
        t.ok(r === x, `${name()} expected "${x}", got "${r}"`)
        // start < end
        r = F('daterange|MMM D, h:mm:ss', [tn - 5000, tn])
        x = 'Jan 13, 11:59:55 - Jan 14, 12:00:00'
        t.ok(r === x, `${name()} expected "${x}", got "${r}"`)
        // start > end
        r = F('daterange|MMM D h:mm:ss', [tn + 5000, tn])
        x = 'Jan 14 12:00:05 - 12:00:00'
        t.ok(r === x, `${name()} expected "${x}", got "${r}"`)

        label = 'group dates left, time sets right'
        count = 0
        // 2 morning times
        tn = new Date('2021-04-03T07:30:00Z').getTime()
        let tn2 = new Date('2021-04-03T09:30:00Z').getTime()
        r = F('daterange|MMM D h:mm', [tn, tn2])
        x = 'Apr 3 7:30 - 9:30'
        t.ok(r === x, `${name()} expected "${x}", got "${r}"`)
        // times crossing noon
        tn2 = new Date('2021-04-03T15:15:00Z').getTime()
        r = F('daterange|MMM D h:mm ++', [tn, tn2])
        x = 'Apr 3 7:30 AM - 3:15 PM'
        t.ok(r === x, `${name()} expected "${x}", got "${r}"`)


        // more grouping examples
        // group with date on right
        tn = new Date('2021-01-14T00:00:00Z').getTime()
        label = 'group times left, dates right'
        count = 0
        // paired range : use the time format to show range, and use date format if date is needed, with grouping
        // tn = new Date('2021-01-14T00:00:00Z').getTime()
        // both the same
        r = F('daterange|h:mm:ss MMM D', [tn, tn])
        x = '12:00:00 Jan 14'
        t.ok(r === x, `${name()} expected "${x}", got "${r}"`)
        // start < end
        r = F('daterange|h:mm:ss MMM D', [tn - 5000,tn])
        x = '11:59:55 Jan 13 - 12:00:00 Jan 14'
        t.ok(r === x, `${name()} expected "${x}", got "${r}"`)
        // start > end
        r = F('daterange|h:mm:ss MMM D', [tn + 5000, tn])
        x = '12:00:05 - 12:00:00 Jan 14'
        t.ok(r === x, `${name()} expected "${x}", got "${r}"`)

        label = 'group time sets left, date right'
        count = 0
        // two afternoon times
        tn = new Date('2021-04-03T14:12:00Z').getTime()
        tn2 = new Date('2021-04-03T17:50:00Z').getTime()
        r = F('daterange|MMM D hh:mm', [tn, tn2])
        x = 'Apr 3 02:12 - 05:50'
        t.ok(r === x, `${name()} expected "${x}", got "${r}"`)

        // times crossing noon
        tn = new Date('2021-04-03T10:12:00Z').getTime()
        tn2 = new Date('2021-04-03T12:50:00Z').getTime()
        r = F('daterange|MMM D hh:mm ++', [tn, tn2])
        x = 'Apr 3 10:12 AM - 12:50 PM'
        t.ok(r === x, `${name()} expected "${x}", got "${r}"`)

        // group dates in year
        label = 'group year left, range right'
        count = 0
        tn = new Date('2021-01-20T00:00:00Z').getTime()
        tn2 = new Date('2021-04-03T00:00:00Z').getTime()
        r = F('daterange|YYYY MMM D', [tn, tn2])
        x = '2021 Jan 20 - Apr 3'
        t.ok(r === x, `${name()} expected "${x}", got "${r}"`)

        label = 'group range left, year right'
        count = 0
        r = F('daterange|MMM D, YYYY', [tn, tn2])
        x = 'Jan 20 - Apr 3, 2021'
        t.ok(r === x, `${name()} expected "${x}", got "${r}"`)

        label = 'group month left, range right'
        count = 0
        // group days in month
        tn2 = new Date('2021-01-23T00:00:00Z').getTime()
        r = F('daterange|YYYY MMM D', [tn,tn2])
        x = '2021 Jan 20 - 23'
        t.ok(r === x, `${name()} expected "${x}", got "${r}"`)


        tn = new Date('1961-04-03T10:12:00Z').getTime()
        tn2 = new Date('1961-04-03T12:50:00Z').getTime()
        r = F('daterange|M/D/YY hh:mm --', [tn, tn2])
        x = '4/3/61 10:12 am - 12:50 pm'
        t.ok(r === x, `${name()} expected "${x}", got "${r}"`)

        r = F('daterange|M/D/YY hh:mm -- z', [tn, tn2])
        x = '4/3/61 10:12 am - 12:50 pm UTC'
        t.ok(r === x, `${name()} expected "${x}", got "${r}"`)

        // weird truncation bug...
        r = F('daterange|M/D/YY hh:mm -- (z)', [tn, tn2])
        x = '4/3/61 10:12 am - 12:50 pm (UTC)'
        t.ok(r === x, `${name()} expected "${x}", got "${r}"`)

        r = F('daterange?pst|M/D/YY hh:mm -- (z)', [tn, tn2])
        x = '4/3/61 02:12 am - 04:50 am (PST)'
        t.ok(r === x, `${name()} expected "${x}", got "${r}"`)



        desc = "style = full"
        r = (F('daterange|full', [tn, tn2]))
        x = 'Monday, April 3, 1961, 10:12:00 AM - 12:50:00 PM Coordinated Universal Time'
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc = "style = long"
        r = (F('daterange|long', [tn, tn2]))
        x = 'April 3, 1961, 10:12:00 AM - 12:50:00 PM UTC'
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc = "style = medium"
        r = (F('daterange|medium', [tn, tn2]))
        x = 'Mon, Apr 3, 1961, 10:12:00 AM - 12:50:00 PM'
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc = "style = short"
        r = (F('daterange|short', [tn, tn2]))
        x = '4/03/61, 10:12 AM - 12:50 PM'
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        t.end()
    })
}

dateRangeFormatTest()