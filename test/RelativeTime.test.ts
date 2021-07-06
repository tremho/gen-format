
/*

Test casts to timezones.
No cast should be same as UTC

should accept cast by anchor, city, abbreviation, or GMT+/- offset

 */

import Tap from 'tap'

import F, {checkIntlSupport, useIntl} from '../src/Formatter'
import {formatV} from '../src/Formatter'
import fileOps from '../src/NodeFileOps'
import {setFileOps} from "../src/Formatter";

setFileOps(fileOps)

function RelativeTimeTest() {
    let r, x, desc
    let event

    let intlAvailable = checkIntlSupport() === 'complete'
    if(intlAvailable) {
        useIntl(true)
    }
    Tap.test('Relative Time', t => {

        t.skip(`COMMENT: Intl Availability is ${checkIntlSupport()}. These tests were made with ${intlAvailable? 'full' : 'no'} Intl support`)

        // t.skip('Check relative time syntax and come back later')
        // return t.end()

        // do the first test with a non-relative range in case so we don't incur the i18n load delay
        desc ="initial"
        r = F('daterange|h:mm:ss', ['now', 'now'])
        x = 'now'
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc = "now"
        r = F('daterange|human', 'now')
        x = 'now'
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc = "now human"
        r = F('daterange|human', 'now')
        x = 'now'
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="moments ago human"
        event = Date.now() - 5000
        r = F('daterange|human', event)
        x = "a few moments ago"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="moments ago long"
        event = Date.now() - 5000
        r = F('daterange|human-long', event)
        x = "5 seconds ago"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="moments ago short"
        event = Date.now() - 5000
        r = F('daterange|human-short', event)
        x = "5 sec. ago"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="1 second ago narrow"
        event = Date.now() - 1000
        r = F('daterange|human-narrow', event)
        x = "1 sec. ago"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="ms ago narrow"
        event = Date.now() - 250
        r = F('daterange|human-narrow', event)
        x = "0.25 sec. ago"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="moments from now human"
        event = Date.now() + 5000
        r = F('daterange|human', event)
        x = "in a few moments"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="moments from now long"
        event = Date.now() + 5000
        r = F('daterange|human-long', event)
        x = "in 5 seconds"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="seconds ago 1"
        event = Date.now() - 7400
        r = F('daterange|human', event)
        x = "7 seconds ago"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="seconds ago 2"
        event = Date.now() - 7800
        r = F('daterange|human', event)
        x = "8 seconds ago" //
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="seconds from now"
        event = Date.now() + 7000
        r = F('daterange|human', event)
        x = "in 7 seconds"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="a minute ago human"
        event = Date.now() - 60000
        r = F('daterange|human', event)
        x = "1 minute ago"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="a minute ago (long)"
        event = Date.now() - 60000
        r = F('daterange|human', event)
        x = "1 minute ago"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="a minute ago (short)" // (does not force segmented numeric)
        event = Date.now() - 60000
        r = F('daterange|human-short', event)
        x = "1 min. ago"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="an hour ago human"
        event = Date.now() - 3605000
        r = F('daterange|human', event)
        x = "1 hour ago"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="an hour ago (long)" // (does not force segmented numeric)
        event = Date.now() - 3600000
        r = F('daterange|human', event)
        x = "1 hour ago"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="an hour ago short" // (does not force segmented numeric)
        event = Date.now() - 3600000
        r = F('daterange|human-short', event)
        x = "1 hr. ago"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="an hour ago formatted"
        event = Date.now() - 3600000
        r = F('daterange|human-h:mm:ss', event)
        x = "1:00:00 ago"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="a minute ago and some seconds (long)"
        event = Date.now() - 66600
        r = F('daterange|human', event)
        x = "1 minute ago"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="a minute, 40 seconds"
        event = Date.now() - 100000
        r = F('daterange|human', event)
        x = "1 minute ago"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc = "today"
        event = Date.now()
        r = F('daterange|human-none', event)
        x = "today"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc = "tomorrow"
        event = Date.now() + (1000*24*3600)
        r = F('daterange|human-none', event)
        x = "tomorrow"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc = "yesterday"
        event = Date.now() - (1000*24*3600)
        r = F('daterange|human-none', event)
        x = "yesterday"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc = "2 days ago"
        event = Date.now() - (2*1000*24*3600)
        r = F('daterange|human-none', event)
        x = "2 days ago"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        let dt = new Date()
        dt.setUTCDate(dt.getUTCDate()-3);
        let wd = F('date|WWWW', dt)

        desc = "3 days ago"
        event = Date.now() - (3*1000*24*3600)
        r = F('daterange|human-none', event)
        x = "last "+wd
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        dt = new Date()
        dt.setUTCDate(dt.getUTCDate()+3);
        wd = F('date|WWWW', dt)

        desc = "3 days from now"
        event = Date.now() + (3*1000*24*3600)
        r = F('daterange|human-none', event)
        x = "next "+wd
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        dt = new Date()
        dt.setUTCDate(dt.getUTCDate()+10);
        wd = F('date|WWWW', dt)

        desc = "10 days from now"
        event = Date.now() + (10*1000*24*3600)
        r = F('daterange|human-none', event)
        x = "a week from "+wd
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        dt = new Date()
        dt.setUTCDate(dt.getUTCDate()-10);
        wd = F('date|WWWW', dt)

        desc = "10 days ago"
        event = Date.now() - (10*1000*24*3600)
        r = F('daterange|human-none', event)
        x = wd+", last week"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        dt = new Date()
        dt.setUTCDate(dt.getUTCDate()+1);
        wd = F('date|WWWW', dt)

        desc = "20 days ago"
        event = Date.now() - (20*1000*24*3600)
        r = F('daterange|human-none', event)
        x = wd+", 2 weeks ago"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)


        // Verify that we can use date with human format instead of daterange to get same results
        desc = " [date]now"
        r = F('date|human', 'now')
        x = 'now'
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc = " [date]now human"
        r = F('date|human', 'now')
        x = 'now'
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc=" [date]moments ago human"
        event = Date.now() - 5000
        r = F('date|human', event)
        x = "a few moments ago"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc=" [date]moments ago long"
        event = Date.now() - 5000
        r = F('date|human-long', event)
        x = "5 seconds ago"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc=" [date]moments ago short"
        event = Date.now() - 5000
        r = F('date|human-short', event)
        x = "5 sec. ago"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc=" [date]1 second ago narrow"
        event = Date.now() - 1000
        r = F('date|human-narrow', event)
        x = "1 sec. ago"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc=" [date]ms ago narrow"
        event = Date.now() - 250
        r = F('date|human-narrow', event)
        x = "0.25 sec. ago"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc=" [date]moments from now human"
        event = Date.now() + 5000
        r = F('date|human', event)
        x = "in a few moments"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc=" [date]moments from now long"
        event = Date.now() + 5000
        r = F('date|human-long', event)
        x = "in 5 seconds"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc=" [date]seconds ago 1"
        event = Date.now() - 7400
        r = F('date|human', event)
        x = "7 seconds ago"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc=" [date]seconds ago 2"
        event = Date.now() - 7800
        r = F('date|human', event)
        x = "8 seconds ago" //
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc=" [date]seconds from now"
        event = Date.now() + 7000
        r = F('date|human', event)
        x = "in 7 seconds"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc=" [date]a minute ago human"
        event = Date.now() - 60000
        r = F('date|human', event)
        x = "1 minute ago"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc=" [date]a minute ago (long)"
        event = Date.now() - 60000
        r = F('date|human', event)
        x = "1 minute ago"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc=" [date]a minute ago (short)" // (does not force segmented numeric)
        event = Date.now() - 60000
        r = F('date|human-short', event)
        x = "1 min. ago"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc=" [date]an hour ago human"
        event = Date.now() - 3605000
        r = F('date|human', event)
        x = "1 hour ago"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc=" [date]an hour ago (long)" // (does not force segmented numeric)
        event = Date.now() - 3600000
        r = F('date|human', event)
        x = "1 hour ago"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc=" [date]an hour ago short" // (does not force segmented numeric)
        event = Date.now() - 3600000
        r = F('date|human-short', event)
        x = "1 hr. ago"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc=" [date]an hour ago formatted"
        event = Date.now() - 3600000
        r = F('date|human-h:mm:ss', event)
        x = "1:00:00 ago"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc=" [date]a minute ago and some seconds (long)"
        event = Date.now() - 66600
        r = F('date|human', event)
        x = "1 minute ago"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc=" [date]a minute, 40 seconds"
        event = Date.now() - 100000
        r = F('date|human', event)
        x = "1 minute ago"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc = " [date]today"
        event = Date.now()
        r = F('date|human-none', event)
        x = "today"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc = " [date]tomorrow"
        event = Date.now() + (1000*24*3600)
        r = F('date|human-none', event)
        x = "tomorrow"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc = " [date]yesterday"
        event = Date.now() - (1000*24*3600)
        r = F('date|human-none', event)
        x = "yesterday"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc = " [date]2 days ago"
        event = Date.now() - (2*1000*24*3600)
        r = F('date|human-none', event)
        x = "2 days ago"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        dt = new Date()
        dt.setUTCDate(dt.getUTCDate()-3);
        wd = F('date|WWWW', dt)

        desc = " [date]3 days ago"
        event = Date.now() - (3*1000*24*3600)
        r = F('date|human-none', event)
        x = "last "+wd
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        dt = new Date()
        dt.setUTCDate(dt.getUTCDate()+3);
        wd = F('date|WWWW', dt)

        desc = " [date]3 days from now"
        event = Date.now() + (3*1000*24*3600)
        r = F('date|human-none', event)
        x = "next "+wd
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        dt = new Date()
        dt.setUTCDate(dt.getUTCDate()+10);
        wd = F('date|WWWW', dt)

        desc = " [date]10 days from now"
        event = Date.now() + (10*1000*24*3600)
        r = F('date|human-none', event)
        x = "a week from "+wd
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        dt = new Date()
        dt.setUTCDate(dt.getUTCDate()-10);
        wd = F('date|WWWW', dt)

        desc = " [date]10 days ago"
        event = Date.now() - (10*1000*24*3600)
        r = F('date|human-none', event)
        x = wd+", last week"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        dt = new Date()
        dt.setUTCDate(dt.getUTCDate()-20);
        wd = F('date|WWWW', dt)

        desc = " [date]20 days ago"
        event = Date.now() - (20*1000*24*3600)
        r = F('date|human-none', event)
        x = wd+", 2 weeks ago"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        t.end()
    })
}

RelativeTimeTest()


