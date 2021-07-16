import Tap from 'tap'

import * as fs from 'fs'
import * as path from 'path'

import F, {checkIntlSupport, useIntl} from '../src/Formatter'
import fileOps from '../src/NodeFileOps'
import {setFileOps} from "../src/Formatter";
setFileOps(fileOps)

import i18n from '../src/i18n'

import {setArtificialNow, getNow} from "../src/format/DateRangeFormatter";
import dateRangeExpectations from "./dateRangeExpectations"
import locExpectations from "./localizedExpectations"
const testLocales = Object.getOwnPropertyNames(locExpectations)

const stringIds = [
    "date.range.time.separator",
    "date.range.now",
    "date.range.one",
    "date.term.year",
    "date.term.year.plural",
    "date.abbr.year",
    "date.abbr.year.plural",
    "date.term.month",
    "date.term.month.plural",
    "date.abbr.month",
    "date.abbr.month.plural",
    "date.term.week",
    "date.term.week.plural",
    "date.abbr.week",
    "date.abbr.week.plural",
    "date.term.day",
    "date.term.day.plural",
    "date.abbr.day",
    "date.abbr.day.plural",
    "date.term.hour",
    "date.term.hour.plural",
    "date.abbr.hour",
    "date.abbr.hour.plural",
    "date.term.minute",
    "date.term.minute.plural",
    "date.abbr.minute",
    "date.abbr.minute.plural",
    "date.term.second",
    "date.term.second.plural",
    "date.abbr.second",
    "date.abbr.second.plural",
    "date.range.moments.ago",
    "date.range.moments.away",
    "date.range.ago",
    "date.range.today",
    "date.range.tomorrow",
    "date.range.yesterday",
    "date.range.weekday.next",
    "date.range.weekday.previous",
    "date.range.weekday.weeks.ago",
    "date.range.weekday.week.ahead",
    "date.range.weekday.weeks.ahead",
    "date.range.days.ago",
    "date.range.days.ahead"
]


function localizationTests(loc) {
    let r, x, desc
    let tn = 0;
    setArtificialNow('2021-07-06T12:24:56Z') // anchor our test date
    Tap.test('Localization for ' + loc, t => {

        let dt1 = '2021-02-14T12:34:56Z'
        let dt2 = '2021-07-06T12:34:56Z'
        let ti = 0;

        t.skip('COMMENT: tested locale '+ loc)

        desc="full date is localized"
        r = F(`date~${loc}|full`, dt1)
        if(!locExpectations[loc]) {
            t.ok(false, `${loc} does not exist in localizedExpectations data`)
            t.end()
            return
        }
        x = locExpectations[loc][ti++]
        writeOrDie(loc, ti, desc, r, x, t)

        desc="long date is localized"
        r = F(`date~${loc}|long`, dt1)
        x = locExpectations[loc][ti++]
        writeOrDie(loc, ti, desc, r, x, t)

        desc="short date is localized"
        r = F(`date~${loc}|short`, dt1)
        x = locExpectations[loc][ti++]
        writeOrDie(loc, ti, desc, r, x, t)

        desc="range is localized"
        r = F(`date~${loc}|full`, [dt1, dt2])
        x = locExpectations[loc][ti++]
        writeOrDie(loc, ti, desc, r, x, t)

        desc="now is localized"
        r = F(`date~${loc}|human`, 'now')
        x = locExpectations[loc][ti++]
        writeOrDie(loc, ti, desc, r, x, t)

        desc="moments ago is localized"
        r = F(`date~${loc}|human`, getNow() - 5000)
        x = locExpectations[loc][ti++]
        writeOrDie(loc, ti, desc, r, x, t)

        desc="moments away is localized"
        r = F(`date~${loc}|human`, getNow() + 5000)
        x = locExpectations[loc][ti++]
        writeOrDie(loc, ti, desc, r, x, t)

        desc="today is localized"
        let dt = new Date(getNow())
        r=F(`date~${loc}|human-none`, dt)
        x = locExpectations[loc][ti++]
        writeOrDie(loc, ti, desc, r, x, t)

        desc="tomorrow is localized"
        dt = new Date(getNow())
        dt.setUTCDate(dt.getUTCDate()+1)
        r=F(`date~${loc}|human-none`, dt)
        x = locExpectations[loc][ti++]
        writeOrDie(loc, ti, desc, r, x, t)

        desc="yesterday is localized"
        dt = new Date(getNow())
        dt.setUTCDate(dt.getUTCDate()-1)
        r=F(`date~${loc}|human-none`, dt)
        x = locExpectations[loc][ti++]
        writeOrDie(loc, ti, desc, r, x, t)

        desc="a year ago localized"
        dt = new Date(getNow())
        dt.setUTCFullYear(dt.getUTCFullYear()-1)
        r=F(`date~${loc}|human-none`, dt)
        x = locExpectations[loc][ti++]
        writeOrDie(loc, ti, desc, r, x, t)

        desc="a month ago localized"
        dt = new Date(getNow())
        dt.setUTCMonth(dt.getUTCMonth()-1)
        r=F(`date~${loc}|human-none`, dt)
        x = locExpectations[loc][ti++]
        writeOrDie(loc, ti, desc, r, x, t)

        desc="a week ago localized"
        dt = new Date(getNow())
        dt.setUTCDate(dt.getUTCDate()-7)
        r=F(`date~${loc}|human-none`, dt)
        x = locExpectations[loc][ti++]
        writeOrDie(loc, ti, desc, r, x, t)

        desc="a day ago localized"
        dt = new Date(getNow())
        dt.setUTCDate(dt.getUTCDate()-1)
        r=F(`date~${loc}|human-none`, dt)
        x = locExpectations[loc][ti++]
        writeOrDie(loc, ti, desc, r, x, t)

        desc="an hour ago localized"
        dt = new Date(getNow())
        dt.setUTCHours(dt.getUTCHours()-1)
        r=F(`date~${loc}|human`, dt)
        x = locExpectations[loc][ti++]
        writeOrDie(loc, ti, desc, r, x, t)

        desc="a minute ago localized"
        dt = new Date(getNow())
        dt.setUTCMinutes(dt.getUTCMinutes()-1)
        r=F(`date~${loc}|human`, dt)
        x = locExpectations[loc][ti++]
        writeOrDie(loc, ti, desc, r, x, t)

        desc="a second ago localized"
        dt = new Date(getNow())
        dt.setUTCSeconds(dt.getUTCSeconds()-1)
        r=F(`date~${loc}|human`, dt)
        x = locExpectations[loc][ti++]
        writeOrDie(loc, ti, desc, r, x, t)

        desc="a year from now localized"
        dt = new Date(getNow())
        dt.setUTCFullYear(dt.getUTCFullYear()+1)
        r=F(`date~${loc}|human-none`, dt)
        x = locExpectations[loc][ti++]
        writeOrDie(loc, ti, desc, r, x, t)

        desc="a month from now localized"
        dt = new Date(getNow())
        dt.setUTCMonth(dt.getUTCMonth()+1)
        r=F(`date~${loc}|human-none`, dt)
        x = locExpectations[loc][ti++]
        writeOrDie(loc, ti, desc, r, x, t)

        desc="a week from now localized"
        dt = new Date(getNow())
        dt.setUTCDate(dt.getUTCDate()+7)
        r=F(`date~${loc}|human-none`, dt)
        x = locExpectations[loc][ti++]
        writeOrDie(loc, ti, desc, r, x, t)

        desc="a day from now localized"
        dt = new Date(getNow())
        dt.setUTCDate(dt.getUTCDate()+1)
        r=F(`date~${loc}|human-none`, dt)
        x = locExpectations[loc][ti++]
        writeOrDie(loc, ti, desc, r, x, t)

        desc="an hour from now localized"
        dt = new Date(getNow())
        dt.setUTCHours(dt.getUTCHours()+1)
        r=F(`date~${loc}|human`, dt)
        x = locExpectations[loc][ti++]
        writeOrDie(loc, ti, desc, r, x, t)

        desc="a minute from now localized"
        dt = new Date(getNow())
        dt.setUTCMinutes(dt.getUTCMinutes()+1)
        r=F(`date~${loc}|human`, dt)
        x = locExpectations[loc][ti++]
        writeOrDie(loc, ti, desc, r, x, t)

        desc="a second from now localized"
        dt = new Date(getNow())
        dt.setUTCSeconds(dt.getUTCSeconds()+1)
        r=F(`date~${loc}|human`, dt)
        x = locExpectations[loc][ti++]
        writeOrDie(loc, ti, desc, r, x, t)


        desc="4 years ago localized"
        dt = new Date(getNow())
        dt.setUTCFullYear(dt.getUTCFullYear()-4)
        r=F(`date~${loc}|human-none`, dt)
        x = locExpectations[loc][ti++]
        writeOrDie(loc, ti, desc, r, x, t)

        desc="4 months ago localized"
        dt = new Date(getNow())
        dt.setUTCMonth(dt.getUTCMonth()-4)
        r=F(`date~${loc}|human-none`, dt)
        x = locExpectations[loc][ti++]
        writeOrDie(loc, ti, desc, r, x, t)

        desc="3 weeks ago localized"
        dt = new Date(getNow())
        dt.setUTCDate(dt.getUTCDate()-21)
        r=F(`date~${loc}|human-none`, dt)
        x = locExpectations[loc][ti++]
        writeOrDie(loc, ti, desc, r, x, t)

        desc="4 days ago localized"
        dt = new Date(getNow())
        dt.setUTCDate(dt.getUTCDate()-4)
        r=F(`date~${loc}|human-none`, dt)
        x = locExpectations[loc][ti++]
        writeOrDie(loc, ti, desc, r, x, t)

        desc="2 days ago localized"
        dt = new Date(getNow())
        dt.setUTCDate(dt.getUTCDate()-2)
        r=F(`date~${loc}|human-none`, dt)
        x = locExpectations[loc][ti++]
        writeOrDie(loc, ti, desc, r, x, t)

        desc="2 hours ago localized"
        dt = new Date(getNow())
        dt.setUTCHours(dt.getUTCHours()-2)
        r=F(`date~${loc}|human`, dt)
        x = locExpectations[loc][ti++]
        writeOrDie(loc, ti, desc, r, x, t)

        desc="2 minutes ago localized"
        dt = new Date(getNow())
        dt.setUTCMinutes(dt.getUTCMinutes()-2)
        r=F(`date~${loc}|human`, dt)
        x = locExpectations[loc][ti++]
        writeOrDie(loc, ti, desc, r, x, t)

        desc="20 seconds ago localized"
        dt = new Date(getNow())
        dt.setUTCSeconds(dt.getUTCSeconds()-20)
        r=F(`date~${loc}|human`, dt)
        x = locExpectations[loc][ti++]
        writeOrDie(loc, ti, desc, r, x, t)


        desc="4 years from now localized"
        dt = new Date(getNow())
        dt.setUTCFullYear(dt.getUTCFullYear()+4)
        r=F(`date~${loc}|human-none`, dt)
        x = locExpectations[loc][ti++]
        writeOrDie(loc, ti, desc, r, x, t)

        desc="4 months from now localized"
        dt = new Date(getNow())
        dt.setUTCMonth(dt.getUTCMonth()+4)
        r=F(`date~${loc}|human-none`, dt)
        x = locExpectations[loc][ti++]
        writeOrDie(loc, ti, desc, r, x, t)

        desc="3 weeks from now localized"
        dt = new Date(getNow())
        dt.setUTCDate(dt.getUTCDate()+21)
        r=F(`date~${loc}|human-none`, dt)
        x = locExpectations[loc][ti++]
        writeOrDie(loc, ti, desc, r, x, t)

        desc="4 days from now localized"
        dt = new Date(getNow())
        dt.setUTCDate(dt.getUTCDate()+4)
        r=F(`date~${loc}|human-none`, dt)
        x = locExpectations[loc][ti++]
        writeOrDie(loc, ti, desc, r, x, t)

        desc="2 days from now localized"
        dt = new Date(getNow())
        dt.setUTCDate(dt.getUTCDate()+2)
        r=F(`date~${loc}|human-none`, dt)
        x = locExpectations[loc][ti++]
        writeOrDie(loc, ti, desc, r, x, t)

        desc="2 hours from now localized"
        dt = new Date(getNow())
        dt.setUTCHours(dt.getUTCHours()+2)
        r=F(`date~${loc}|human`, dt)
        x = locExpectations[loc][ti++]
        writeOrDie(loc, ti, desc, r, x, t)

        desc="2 minutes from now localized"
        dt = new Date(getNow())
        dt.setUTCMinutes(dt.getUTCMinutes()+2)
        r=F(`date~${loc}|human`, dt)
        x = locExpectations[loc][ti++]
        writeOrDie(loc, ti, desc, r, x, t)

        desc="20 seconds from now localized"
        dt = new Date(getNow())
        dt.setUTCSeconds(dt.getUTCSeconds()+20)
        r=F(`date~${loc}|human`, dt)
        x = locExpectations[loc][ti++]
        writeOrDie(loc, ti, desc, r, x, t)

        t.end()
    })
}

function dateStringTests(loc) {
    let r, x, desc
    loc = (loc || '').split('-')[0].trim() // just use the language
    Tap.test('date strings for ' + loc, t => {


        let ok = 0
        let missing = 0
        let noexpect = 0

        if(dateRangeExpectations[loc]) {

            i18n.setLocale(loc)

            for (let ti = 0; ti < stringIds.length; ti++) {
                let id = stringIds[ti] || ""
                if (dateRangeExpectations[loc]) {
                    let str = i18n.getLocaleString(id)
                    x = dateRangeExpectations[loc][ti++] || ""
                    if(!x) {
                        noexpect++
                        t.skip(`missing expect for locale ${loc} at ${id}`)
                    }
                    else if (str === x) {
                        ok++
                    } else {
                        missing++
                        t.skip(`for locale ${loc} at ${id}: expected "${x}", got "${str}"`)
                    }
                }
            }
        } else {
            noexpect = stringIds.length
        }
        let desc = "stats for "+loc
        t.ok(!missing && !noexpect, `${desc}: ok ${ok}, missing ${missing} no expects ${noexpect}`)

        t.end()
    })
}

let intlAvailable = checkIntlSupport() === 'complete'
if (intlAvailable) {
    useIntl(true)
}

let stats:any = i18n.setLocale() // default locale
if(stats && stats.totalStrings) {// looks like we have i18n tables

    // i18n.enumerateAvailableLocales(loc => {
    //     if(loc.indexOf('-') === -1) { // languages only
    //         dateStringTests(loc)
    //         localizationTests(loc)
    //
    //         // use this to build tables
    //         // buildDateStringsFromExpectations(loc)
    //     }
    // })
    localizationTests('es')
}

function writeOrDie(loc, ti, desc, r, x, t) {
    if(r !== x) {
        let ex = locExpectations['en'][ti-1]
        if(r === ex) {
            console.log('Untranslated '+ r)
            t.ok(false, `no translation: (${loc}): ${desc} ==> "${r}"`)
        } else {
            t.ok(false, `data incorrect: (${loc} #${ti - 1}) ${desc} ==> "${r}" instead of "${x}"`)
        }
    } else {
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)
    }
}

function buildDateStringsFromExpectations(loc) {
    let out = '{\n'
    let i = 0;
    let expects = dateRangeExpectations[loc]
    if(!expects) {
        console.log('skipping '+loc)
        return
    }
    let id
    while(id = stringIds[i]) {
        if(i !== 0) out += ',\n'
        let v = expects[i]
        out += `    "${id}" : "${v}"`
        i++
    }
    out += '\n}'

    let i18n = path.resolve('./', 'i18n')
    let dsf = path.join(i18n,loc, 'date-range-'+loc+'.json')
    if(fs.existsSync(dsf)) {
        console.log('replacing '+dsf)
        fs.unlinkSync(dsf)
    } else {
        console.log('creating '+dsf)
    }
    fs.writeFileSync(dsf, out)
}

