import Tap from 'tap'

import F, {checkIntlSupport, useIntl} from '../src/Formatter'
import fileOps from '../src/NodeFileOps'
import {setFileOps} from "../src/Formatter";
setFileOps(fileOps)

const testLocales = [
    'us-en',
    'ar',
    'cs',
    'de',
    'es',
    'es-US',
    'fr-FR',
    'fr-CA',
    'he',
    'hi',
    'it',
    'ja',
    'nl',
    'pt',
    'ru',
    'sw',
    'vi',
    'zh'
]

function localizationTests(loc) {
    let r, x, desc
    let tn = 0;
    let intlAvailable = checkIntlSupport() === 'complete'
    if (intlAvailable) {
        useIntl(true)
    }
    Tap.test('Localization for ' + loc, t => {

        let dt1 = '2021-02-14T12:34:56Z'
        let dt2 = '2021-07-06T12:34:56Z'

        desc="full date is localized"
        r = F('date|full', dt1)
        x = "Sunday, February 14, 2021 at 12:34:56 PM Coordinated Universal Time"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="long date is localized"
        r = F('date|long', dt1)
        x = "February 14, 2021 at 12:34:56 PM UTC"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="short date is localized"
        r = F('date|short', dt1)
        x = "2/14/21, 12:34 PM"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="range is localized"
        r = F('date|full', [dt1, dt2])
        x = "Sunday, February 14, 2021, 12:34:56 PM - Tuesday, July 6, 12:34:56 PM Coordinated Universal Time"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="now is localized"
        r = F('date|human', 'now')
        x = "now"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="moments ago is localized"
        r = F('date|human', Date.now() - 5000)
        x = "a few moments ago"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="moments away is localized"
        r = F('date|human', Date.now() + 5000)
        x = "in a few moments"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="today is localized"
        let dt = new Date()
        r=F('date|human-none', dt)
        x = "today"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="tomorrow is localized"
        dt = new Date()
        dt.setUTCDate(dt.getUTCDate()+1)
        r=F('date|human-none', dt)
        x = "tomorrow"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="yesterday is localized"
        dt = new Date()
        dt.setUTCDate(dt.getUTCDate()-1)
        r=F('date|human-none', dt)
        x = "yesterday"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="a year ago localized"
        dt = new Date()
        dt.setUTCFullYear(dt.getUTCFullYear()-1)
        r=F('date|human-none', dt)
        x = "Monday, July 6 2020"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="a month ago localized"
        dt = new Date()
        dt.setUTCMonth(dt.getUTCMonth()-1)
        r=F('date|human-none', dt)
        x = "Sunday, June 6"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="a week ago localized"
        dt = new Date()
        dt.setUTCDate(dt.getUTCDate()-7)
        r=F('date|human-none', dt)
        x = "Tuesday, last week"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="a day ago localized"
        dt = new Date()
        dt.setUTCDate(dt.getUTCDate()-1)
        r=F('date|human-none', dt)
        x = "yesterday"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="an hour ago localized"
        dt = new Date()
        dt.setUTCHours(dt.getUTCHours()-1)
        r=F('date|human', dt)
        x = "1 hour ago"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="a minute ago localized"
        dt = new Date()
        dt.setUTCMinutes(dt.getUTCMinutes()-1)
        r=F('date|human', dt)
        x = "1 minute ago"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="a second ago localized"
        dt = new Date()
        dt.setUTCSeconds(dt.getUTCSeconds()-1)
        r=F('date|human', dt)
        x = "a few moments ago"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="a year from now localized"
        dt = new Date()
        dt.setUTCFullYear(dt.getUTCFullYear()+1)
        r=F('date|human-none', dt)
        x = "Wednesday, July 6 2022"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="a month from now localized"
        dt = new Date()
        dt.setUTCMonth(dt.getUTCMonth()+1)
        r=F('date|human-none', dt)
        x = "Friday, August 6"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="a week from now localized"
        dt = new Date()
        dt.setUTCDate(dt.getUTCDate()+7)
        r=F('date|human-none', dt)
        x = "next Tuesday"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="a day from now localized"
        dt = new Date()
        dt.setUTCDate(dt.getUTCDate()+1)
        r=F('date|human-none', dt)
        x = "tomorrow"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="an hour from now localized"
        dt = new Date()
        dt.setUTCHours(dt.getUTCHours()+1)
        r=F('date|human', dt)
        x = "in 1 hour"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="a minute from now localized"
        dt = new Date()
        dt.setUTCMinutes(dt.getUTCMinutes()+1)
        r=F('date|human', dt)
        x = "in 1 minute"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="a second from now localized"
        dt = new Date()
        dt.setUTCSeconds(dt.getUTCSeconds()+1)
        r=F('date|human', dt)
        x = "in a few moments"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)


        desc="4 years ago localized"
        dt = new Date()
        dt.setUTCFullYear(dt.getUTCFullYear()-4)
        r=F('date|human-none', dt)
        x = "Thursday, July 6 2017"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="4 months ago localized"
        dt = new Date()
        dt.setUTCMonth(dt.getUTCMonth()-4)
        r=F('date|human-none', dt)
        x = "Saturday, March 6"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="3 weeks ago localized"
        dt = new Date()
        dt.setUTCDate(dt.getUTCDate()-21)
        r=F('date|human-none', dt)
        x = "Tuesday, June 15"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="4 days ago localized"
        dt = new Date()
        dt.setUTCDate(dt.getUTCDate()-4)
        r=F('date|human-none', dt)
        x = "last Friday"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="2 days ago localized"
        dt = new Date()
        dt.setUTCDate(dt.getUTCDate()-2)
        r=F('date|human-none', dt)
        x = "2 days ago"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="2 hours ago localized"
        dt = new Date()
        dt.setUTCHours(dt.getUTCHours()-2)
        r=F('date|human', dt)
        x = "2 hours ago"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="2 minutes ago localized"
        dt = new Date()
        dt.setUTCMinutes(dt.getUTCMinutes()-2)
        r=F('date|human', dt)
        x = "2 minutes ago"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="20 seconds ago localized"
        dt = new Date()
        dt.setUTCSeconds(dt.getUTCSeconds()-20)
        r=F('date|human', dt)
        x = "20 seconds ago"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)


        desc="4 years from now localized"
        dt = new Date()
        dt.setUTCFullYear(dt.getUTCFullYear()+4)
        r=F('date|human-none', dt)
        x = "Sunday, July 6 2025"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="4 months from now localized"
        dt = new Date()
        dt.setUTCMonth(dt.getUTCMonth()+4)
        r=F('date|human-none', dt)
        x = "Saturday, November 6"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="3 weeks from now localized"
        dt = new Date()
        dt.setUTCDate(dt.getUTCDate()+21)
        r=F('date|human-none', dt)
        x = "in 3 weeks, on Tuesday"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="4 days from now localized"
        dt = new Date()
        dt.setUTCDate(dt.getUTCDate()+4)
        r=F('date|human-none', dt)
        x = "next Saturday"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="2 days from now localized"
        dt = new Date()
        dt.setUTCDate(dt.getUTCDate()+2)
        r=F('date|human-none', dt)
        x = "in 2 days"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="2 hours from now localized"
        dt = new Date()
        dt.setUTCHours(dt.getUTCHours()+2)
        r=F('date|human', dt)
        x = "in 2 hours"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="2 minutes from now localized"
        dt = new Date()
        dt.setUTCMinutes(dt.getUTCMinutes()+2)
        r=F('date|human', dt)
        x = "in 2 minutes"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="20 seconds from now localized"
        dt = new Date()
        dt.setUTCSeconds(dt.getUTCSeconds()+20)
        r=F('date|human', dt)
        x = "in 20 seconds"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)


        t.end()
    })
}

localizationTests('en-US')
// for (const loc of testLocales) {
//      localizationTests(loc)
// }
