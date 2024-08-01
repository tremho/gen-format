import Tap from 'tap'

import fileOps from '../src/NodeFileOps'
import {setFileOps} from "../src/Formatter";
import F from '../src/Formatter'
import {formatV} from '../src/Formatter'

import {setArtificialNow, getNow} from "../src/format/DateRangeFormatter";
import i18n from "../src/i18n";

setFileOps(fileOps)

function dateFormatTest() {

    let stats:any = i18n.setLocale() // default locale
    let hasI18nStrings = (stats && stats.totalStrings)

    Tap.test('date', t => {

        let r = F('date|YY MM DD h:mm:ss', 'now')
        let m = r.match(/[0-9][0-9] [0-9][0-9] [0-9][0-9] [0-9]+:[0-9][0-9]:[0-9][0-9]/)
        t.ok(m, `YY MM DD h:mm:ss Pattern expected, got "${r}"` as any)

        let ts = 693878400 * 1000 // 12/28/91
        r = F('date|WWWW, MMMM D, YYYY', ts)
        let x = 'Saturday, December 28, 1991'
        t.ok(r === x, `expected "${x}", got "${r}"` as any)


        ts = 808444800 * 1000 // 8/15/95
        r = F('date|WWWW, MMMM D, YYYY', ts)
        x = 'Tuesday, August 15, 1995'
        t.ok(r === x, `expected "${x}", got "${r}"` as any)

        ts = -206409600 * 1000 // June 18, 1963
        r = F('date|WWWW, MMMM D, YYYY', ts)
        x = 'Tuesday, June 18, 1963'
        t.ok(r === x, `expected "${x}", got "${r}"` as any)


        ts = -276048000 * 1000 // April 3, 1961
        r = F('date|WWWW, MMMM D, YYYY', ts)
        x = 'Monday, April 3, 1961'
        t.ok(r === x, `expected "${x}", got "${r}"` as any)

        ts = 1609945200 * 1000 // 01/06/21 15:00 utc
        r = F('date|WWWW, MMMM D, YYYY h:mm--', ts)
        x = 'Wednesday, January 6, 2021 3:00pm'
        t.ok(r === x, `expected "${x}", got "${r}"` as any)

        // test parseable string
        r = F('date|WWWW, MMMM D, YYYY h:mm--', 'Tuesday, January 12, 2021 11:36 AM PST')
        x = 'Tuesday, January 12, 2021 7:36pm' // because of UTC to local conversion
        t.ok(r === x, `expected "${x}", got "${r}"` as any)


        // UTC
        r = F('date|WWWW, MMMM D, YYYY h:mm--', 'Tuesday, January 12, 2021 11:36 AM UTC')
        x = 'Tuesday, January 12, 2021 11:36am' // all in utc
        t.ok(r === x, `expected "${x}", got "${r}"` as any)

        // ISO
        r = F('date|WWWW, MMMM D, YYYY h:mm--', '2021-01-12T11:36Z')
        x = 'Tuesday, January 12, 2021 11:36am' // all in utc
        t.ok(r === x, `expected "${x}", got "${r}"` as any)


        // ------------------


        let tn = getNow()
        let mo = F('date|MMM', tn)
        let dy = F('date|D', tn)
        let td = mo + ' '+dy
        let hr = Number(F('date|hh', tn))
        let mn = Number(F('date|m', tn))
        if(mn >=60) {
            mn -= 60;
            hr++
        }
        let ap = F('date|++', tn)


        // future (seconds)
        r = F('date|MMM D, h:mm++', 'future(0)')
        x = td+`, ${hr}:${mn < 10 ? '0'+mn : ''+mn}${ap}`
        t.ok(r === x, `f0 expected "${x}", got "${r}"` as any)
        r = F('date|MMM D, h:mm++', 'future(60)')
        x = td+`, ${hr}:${mn < 9 ? '0'+(mn+1) : ''+(mn+1)}${ap}`
        t.ok(r === x, `f60 expected "${x}", got "${r}"` as any)

        // past (seconds)
        let cmn = mn, chr = hr
        mn -=2
        if(mn < 0) {
            hr--
            mn+=60
        }
        r = F('date|MMM D, h:mm++', 'past(120)')
        x = td+`, ${hr}:${mn < 10 ? '0'+mn : ''+mn}${ap}`
        t.ok(r === x, `p120 expected "${x}", got "${r}"` as any)

        // today
        let tmNow = F('date| h:mm++', 'now')
        r = F('date|MMM D, h:mm++', 'today')
        x = td+`, ${tmNow}`
        t.ok(r === x, `today expected "${x}", got "${r}"` as any)

        // today @ hh:mm:ss
        r = F('date|MMM D, h:mm:ss++', 'today @ 1:23:34 pm')
        x = td+', 1:23:34PM'
        t.ok(r === x, `today@ expected "${x}", got "${r}"` as any)

        hr = chr
        mn = cmn
        // tomorrow
        let tmrw = mo + ' '+(Number(dy)+1)

        r = F('date|MMM D, h:mm++', 'tomorrow')
        x = tmrw+`, ${tmNow}`
        t.ok(r === x, `tomorrow expected "${x}", got "${r}"` as any)

        r = F('date|MMM D, h:mm++', 'tomorrow @ 7:30')
        x = tmrw+', 7:30AM'
        t.ok(r === x, `tomorrow @ expected "${x}", got "${r}"` as any)

        // yesterday
        const yday = (Number(dy)-1)
        if(yday > 0) { // can't test on the first of the month without more date foo
            let ystr = mo + ' ' + yday

            r = F('date|MMM D, h:mm++', 'yesterday')
            x = ystr + `, ${tmNow}`
            t.ok(r === x, `yesterday expected "${x}", got "${r}"` as any)

            r = F('date|MMM D, h:mm++', 'yesterday @ 19:30')
            x = ystr + ', 7:30PM'
            t.ok(r === x, `yesterday @ expected "${x}", got "${r}"` as any)
        }
        // next year, month, week
        let tyr = F('date|YYYY', 'now')
        let nyr = Number(tyr)+1
        let lyr = Number(tyr)-1
        let tmo = F('date|M', 'now')
        let nmo = Number(tmo)+1
        let lmo = Number(tmo)-1

        let lmyr = tyr
        if(lmo <= 0) {
            lmo+=12
            lmyr = lyr
        }
        let tdy = F('date|D', 'now')

        // next year
        r = F('date|YYYY MMM D, h:mm++', 'next year')
        x = nyr+' '+td+`, ${tmNow}`
        t.ok(r === x, `next year expected "${x}", got "${r}"` as any)
        // last year
        r = F('date|YYYY MMM D, h:mm++', 'last year')
        x = lyr+' '+td+`, ${tmNow}`
        t.ok(r === x, `last year expected "${x}", got "${r}"` as any)

        // next month
        r = F('date|M/D/YYYY, h:mm++', 'next month')
        x = `${nmo}/${tdy}/${tyr}, ${hr}:${mn < 10 ? '0'+mn : ''+mn}${ap}`
        t.ok(r === x, `next month expected "${x}", got "${r}"` as any)
        // last month
        r = F('date|M/D/YYYY, h:mm++', 'last month')
        x = `${lmo}/${tdy}/${lmyr}, ${hr}:${mn < 10 ? '0'+mn : ''+mn}${ap}`
        t.ok(r === x, `last month expected "${x}", got "${r}"` as any)


        // // These can't be auto tested as written but can be viewed on console to confirm.
        // // consider an alternate that simply looks for day of the week to remain the same
        // // but the date changes (we can ignore the verification of 7 days between)
        // // next week
        // r = F('date|YYYY MMM D, h:mm++', 'next week')
        // x = 'Jan 20?'
        // t.ok(r === x, `next week expected "${x}", got "${r}"`)
        // // last week
        // r = F('date|YYYY MMM D, h:mm++', 'last week')
        // x = 'Jan 6?'
        // t.ok(r === x, `last week expected "${x}", got "${r}"`)


        // here's that alternative
        let wdn = F('date|WWWW', 'now')
        let dn = F('date|D', 'now')
        r = F('date|WWWW YYYY MMM D, h:mm++', 'next week')
        let rd = r.substring(0, r.indexOf(' '))
        let ci = r.indexOf(',')
        let rdy = r.substring(r.lastIndexOf(' ', ci), ci)
        let rt = r.substring(r.lastIndexOf(' '))
        let xd = wdn
        t.ok(rd === xd, `1 next week expected "${xd}", got "${rd}"` as any)
        t.ok(rdy !== dn, `2 next week expected day "${dn}", got "${rdy}"` as any)
        // last week
        r = F('date|WWWW YYYY MMM D, h:mm++', 'last week')
        rd = r.substring(0, r.indexOf(' '))
        ci = r.indexOf(',')
        rdy = r.substring(r.lastIndexOf(' ', ci), ci)
        rt = r.substring(r.lastIndexOf(' '))
        xd = wdn
        t.ok(rd === xd, `3 next week expected "${xd}", got "${rd}"` as any)
        t.ok(rdy !== dn, `4 next week expected day "${dn}", got "${rdy}"` as any)



        // this year, month, week, day, hour, minute, second

        let top = F('date|YYYY-MMM-D hh:mm:ss', getNow())
        let [datePart, timePart] = top.split(' ')
        let [yrTop,moTop, dyTop] = datePart.split('-')
        let [hrTop, mnTop, scTop] = timePart.split(':')
        let wd = new Date(getNow()).getUTCDay()
        let wkdTop = Number(dyTop) - wd
        if(hrTop > 12) {
            hrTop = Number(hrTop) - 12
        }
        if(hrTop == 0) {
            hrTop = 12
        }
        ap = ap.toLowerCase()

        r = F('date|MMM D YYYY, hh:mm--', 'this year')
        x = `Jan 1 ${yrTop}, 12:00am`
        t.ok(r === x, `this year expected "${x}", got "${r}"` as any)
        r = F('date|MMM D YYYY, hh:mm--', 'this month')
        x = `${moTop} 1 ${yrTop}, 12:00am`
        t.ok(r === x, `this month expected "${x}", got "${r}"` as any)
        if(wkdTop >=0) {
            r = F('date|MMM D YYYY, hh:mm--', 'this week')
            x = `${moTop} ${wkdTop} ${yrTop}, 12:00am`
        }
        t.ok(r === x, `this week expected "${x}", got "${r}"` as any)
        r = F('date|MMM D YYYY, hh:mm--', 'this day')
        x = `${moTop} ${dyTop} ${yrTop}, 12:00am`
        t.ok(r === x, `this day expected "${x}", got "${r}"` as any)
        r = F('date|MMM D YYYY, hh:mm:ss--', 'this hour')
        x = `${moTop} ${dyTop} ${yrTop}, ${hrTop}:00:00${ap}`
        t.ok(r === x, `this hour expected "${x}", got "${r}"` as any)
        r = F('date|MMM D YYYY, hh:mm:ss--', 'this minute')
        x = `${moTop} ${dyTop} ${yrTop}, ${hrTop}:${mnTop}:00${ap}`
        t.ok(r === x, `this minute expected "${x}", got "${r}"` as any)
        r = F('date|MMM D YYYY, hh:mm:ss.sss--', 'this second')
        x = `${moTop} ${dyTop} ${yrTop}, ${hrTop}:${mnTop}:${scTop}.000${ap}`
        t.ok(r === x, `this second expected "${x}", got "${r}"` as any)

        //  next, last weekday
        r = F('date|WWWW MMM D YYYY, hh:mm--', 'last Wednesday')
        r = r.substring(0, r.indexOf(' '))
        x = 'Wednesday'
        t.ok(r === x, `last Wednesday expected "${x}", got "${r}"` as any)
        r = F('date|WWWW MMM D YYYY, hh:mm--', 'next Fri')
        r = r.substring(0, r.indexOf(' '))
        x = 'Friday'
        t.ok(r === x, `next Fri expected "${x}", got "${r}"` as any)
        r = F('date|WWWW MMM D YYYY, hh:mm--', 'next Friday @ 12:34')
        rd = r.substring(0, r.indexOf(' '))
        xd = 'Friday'
        rt = r.substring(r.lastIndexOf(' '))
        let xt = ' 12:34pm'
        t.ok(rd === xd, `next Friday @ expected "${xd}", got "${rd}"` as any)
        t.ok(rt === xt, `next Friday @ expected "${xt}", got "${rt}"` as any)

        // this weekday
        r = F('date|WWWW MMM D YYYY, hh:mm--', 'this Monday')
        r = r.substring(0, r.indexOf(' '))
        x = 'Monday'
        t.ok(r === x, `this Monday expected "${x}", got "${r}"` as any)
        r = F('date|WWWW MMM D YYYY, hh:mm--', 'this Friday')
        r = r.substring(0, r.indexOf(' '))
        x = 'Friday'
        t.ok(r === x, `this Friday expected "${x}", got "${r}"` as any)
        r = F('date|WWWW MMM D YYYY, hh:mm--', 'this Friday @ 12:34')
        rd = r.substring(0, r.indexOf(' '))
        xd = 'Friday'
        rt = r.substring(r.lastIndexOf(' '))
        xt = ' 12:34pm'
        t.ok(rd === xd, `this Friday @ expected "${xd}", got "${rd}"` as any)
        t.ok(rt === xt, `this Friday @ expected "${xt}", got "${rt}"` as any)

        let testDate = '2021-01-13Z'

        // intl full, long, medium, short
        r = F('date|full-full', testDate)
        x = 'Wednesday, January 13, 2021 at 12:00:00 AM Coordinated Universal Time'
        t.ok(r === x, `(full) expected "${x}", got "${r}"` as any)

        r = F('date|long-long', testDate)
        x = 'January 13, 2021 at 12:00:00 AM UTC'
        t.ok(r === x, `(long) expected "${x}", got "${r}"` as any)

        r = F('date|medium-medium', testDate)
        x = 'Wed, Jan 13, 2021 12:00:00 AM'
        t.ok(r === x, `(medium) expected "${x}", got "${r}"` as any)

        r = F('date|short-short', testDate)
        x = '1/13/21, 12:00 AM'
        t.ok(r === x, `(short) expected "${x}", got "${r}"` as any)

        r = F('date|short-long', testDate)
        x = '1/13/21, 12:00:00 AM UTC'
        t.ok(r === x, `(short-long) expected "${x}", got "${r}"` as any)

        r = F('date?pst|full', testDate)
        x = 'Tuesday, January 12, 2021 at 4:00:00 PM Pacific Standard Time'
        t.ok(r === x, `(full pst) expected "${x}", got "${r}"` as any)

        r = F('date?pst|long', testDate)
        x = 'January 12, 2021 at 4:00:00 PM PST'
        t.ok(r === x, `(long pst) expected "${x}", got "${r}"` as any)

        r = F('date?pst|medium', testDate)
        x = 'Tue, Jan 12, 2021 4:00:00 PM'
        t.ok(r === x, `(medium pst) expected "${x}", got "${r}"` as any)

        r = F('date?pst|short', testDate)
        x = '1/12/21, 4:00 PM'
        t.ok(r === x, `(short pst) expected "${x}", got "${r}"` as any)

        r = F('date?pst|short-long', testDate)
        x = '1/12/21, 4:00:00 PM PST'
        t.ok(r === x, `(short-long pst) expected "${x}", got "${r}"` as any)

        if(hasI18nStrings) {
            r = F('date~es-ES?pst|full', testDate)
            x = 'martes, 12 de enero de 2021, 16:00:00 Hora estándar del Pacífico'
            t.ok(r === x, `(ES) expected "${x}", got "${r}"` as any)

            r = F('date~es-ES?pst|long', testDate)
            x = '12 de enero de 2021, 16:00:00 PST'
            t.ok(r === x, `(ES long) expected "${x}", got "${r}"` as any)

            r = F('date~es-ES?pst|medium', testDate)
            x = 'mar., ene. 12, 2021 16:00:00'
            t.ok(r === x, `(ES med) expected "${x}", got "${r}"` as any)

            r = F('date~es-ES?pst|short', testDate)
            x = '12/1/21 16:00'
            t.ok(r === x, `(ES short) expected "${x}", got "${r}"` as any)

            r = F('date~es-ES?pst|short-long', testDate)
            x = '12/1/21 16:00:00 PST'
            t.ok(r === x, `(ES short-long) expected "${x}", got "${r}"` as any)
        } else {
            t.skip({name: 'No string tables: skipped ES locale tests'} as any)
        }


        // am-pm
        let amTest = '2021-07-11T01:23:00Z'
        let pmTest = '2021-07-11T13:23:00Z'
        let desc = "upper case AM/PM"
        r = F('date|h:mm ++', amTest)
        x = "1:23 AM"
        t.ok(r === x, `${desc} expected "${x}", got "${r}"` as any)
        r = F('date|h:mm ++', pmTest)
        x = "1:23 PM"
        t.ok(r === x, `${desc} expected "${x}", got "${r}"` as any)

        desc = "lower case am/pm"
        r = F('date|h:mm --', amTest)
        x = "1:23 am"
        t.ok(r === x, `${desc} expected "${x}", got "${r}"` as any)
        r = F('date|h:mm --', pmTest)
        x = "1:23 pm"
        t.ok(r === x, `${desc} expected "${x}", got "${r}"` as any)

        desc = "PM only (upper case)"
        r = F('date|h:mm -+', amTest)
        x = "1:23"
        t.ok(r === x, `${desc} expected "${x}", got "${r}"` as any)
        r = F('date|h:mm -+', pmTest)
        x = "1:23 PM"
        t.ok(r === x, `${desc} expected "${x}", got "${r}"` as any)

        desc = "PM only (lower case)"
        r = F('date|h:mm +-', amTest)
        x = "1:23"
        t.ok(r === x, `${desc} expected "${x}", got "${r}"` as any)
        r = F('date|h:mm +-', pmTest)
        x = "1:23 pm"
        t.ok(r === x, `${desc} expected "${x}", got "${r}"` as any)

        desc = "A/P (upper case)"
        r = F('date| h:mm +?', amTest)
        x = "1:23 A"
        t.ok(r === x, `${desc} expected "${x}", got "${r}"` as any)
        r = F('date| h:mm +?', pmTest)
        x = "1:23 P"
        t.ok(r === x, `${desc} expected "${x}", got "${r}"` as any)

        desc = "a/p (lower case)"
        r =  F('date| h:mm -?', amTest)
        x = "1:23 a"
        t.ok(r === x, `${desc} expected "${x}", got "${r}"` as any)
        r = F('date| h:mm -?', pmTest)
        x = "1:23 p"
        t.ok(r === x, `${desc} expected "${x}", got "${r}"` as any)

        desc = "using 24-hour time"
        r = F('date| hhh:mm', amTest)
        x = "1:23"
        t.ok(r === x, `${desc} expected "${x}", got "${r}"` as any)
        r = F('date| hhh:mm', pmTest)
        x = "13:23"
        t.ok(r === x, `${desc} expected "${x}", got "${r}"` as any)

        t.end()
    })
}




dateFormatTest()