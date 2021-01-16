import Tap from 'tap'

import F from '../src/Formatter'
import {formatV} from '../src/Formatter'

function dateFormatTest() {
    Tap.test('date', t => {
        let r = F('date|YY MM DD h:mm:ss', 'now')
        let m = r.match(/[0-9][0-9] [0-9][0-9] [0-9][0-9] [0-9]+:[0-9][0-9]:[0-9][0-9]/)
        t.ok(m, `YY MM DD h:mm:ss Pattern expected, got "${r}"`)

        let ts = 693878400 * 1000 // 12/28/91
        r = F('date|WWWW, MMMM D, YYYY', ts)
        let x = 'Saturday, December 28, 1991'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        ts = 808444800 * 1000 // 8/15/95
        r = F('date|WWWW, MMMM D, YYYY', ts)
        x = 'Tuesday, August 15, 1995'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        ts = -206409600 * 1000 // June 18, 1963
        r = F('date|WWWW, MMMM D, YYYY', ts)
        x = 'Tuesday, June 18, 1963'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        ts = -276048000 * 1000 // April 3, 1961
        r = F('date|WWWW, MMMM D, YYYY', ts)
        x = 'Monday, April 3, 1961'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        ts = 1609945200 * 1000 // 01/06/21 15:00 utc
        r = F('date|WWWW, MMMM D, YYYY h:mm--', ts)
        x = 'Wednesday, January 6, 2021 3:00pm'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // test parseable string
        r = F('date|WWWW, MMMM D, YYYY h:mm--', 'Tuesday, January 12, 2021 11:36 AM')
        x = 'Tuesday, January 12, 2021 7:36pm' // because of UTC to local conversion
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // UTC
        r = F('date|WWWW, MMMM D, YYYY h:mm--', 'Tuesday, January 12, 2021 11:36 AM UTC')
        x = 'Tuesday, January 12, 2021 11:36am' // all in utc
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // ISO
        r = F('date|WWWW, MMMM D, YYYY h:mm--', '2021-01-12T11:36Z')
        x = 'Tuesday, January 12, 2021 11:36am' // all in utc
        t.ok(r === x, `expected "${x}", got "${r}"`)


        // ------------------


        let mo = F('date|MMM', 'now')
        let dy = F('date|D', 'now')
        let td = mo + ' '+dy
        let hr = Number(F('date|hh', 'now'))
        let mn = Number(F('date|m', 'now'))
        let ap = F('date|++', 'now')


        // future (seconds)
        r = F('date|MMM D, h:mm++', 'future(0)')
        x = td+`, ${hr}:${mn < 10 ? '0'+mn : ''+mn}${ap}`
        t.ok(r === x, `f0 expected "${x}", got "${r}"`)
        r = F('date|MMM D, h:mm++', 'future(60)')
        x = td+`, ${hr}:${mn < 10 ? '0'+(mn+1) : ''+(mn+1)}${ap}`
        t.ok(r === x, `f60 expected "${x}", got "${r}"`)

        // past (seconds)
        let cmn = mn, chr = hr
        mn -=2
        if(mn < 0) {
            hr--
            mn+=60
        }
        r = F('date|MMM D, h:mm++', 'past(120)')
        x = td+`, ${hr}:${mn < 10 ? '0'+mn : ''+mn}${ap}`
        t.ok(r === x, `p120 expected "${x}", got "${r}"`)

        // today
        r = F('date|MMM D, h:mm++', 'today')
        x = td+`, 12:00AM`
        t.ok(r === x, `today expected "${x}", got "${r}"`)

        // today @ hh:mm:ss
        r = F('date|MMM D, h:mm:ss++', 'today @ 1:23:34 pm')
        x = td+', 1:23:34PM'
        t.ok(r === x, `today@ expected "${x}", got "${r}"`)

        hr = chr
        mn = cmn
        // tomorrow
        let tmrw = mo + ' '+(Number(dy)+1)

        r = F('date|MMM D, h:mm++', 'tomorrow')
        x = tmrw+`, ${hr}:${mn < 10 ? '0'+mn : ''+mn}${ap}`
        t.ok(r === x, `tomorrow expected "${x}", got "${r}"`)

        r = F('date|MMM D, h:mm++', 'tomorrow @ 7:30')
        x = tmrw+', 7:30AM'
        t.ok(r === x, `tomorrow @ expected "${x}", got "${r}"`)

        // yesterday
        let ystr = mo + ' '+(Number(dy)-1)

        r = F('date|MMM D, h:mm++', 'yesterday')
        x = ystr+`, ${hr}:${mn < 10 ? '0'+mn : ''+mn}${ap}`
        t.ok(r === x, `yesterday expected "${x}", got "${r}"`)

        r = F('date|MMM D, h:mm++', 'yesterday @ 19:30')
        x = ystr+', 7:30PM'
        t.ok(r === x, `yesterday @ expected "${x}", got "${r}"`)

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
        x = nyr+' '+td+`, ${hr}:${mn < 10 ? '0'+mn : ''+mn}${ap}`
        t.ok(r === x, `next year expected "${x}", got "${r}"`)
        // last year
        r = F('date|YYYY MMM D, h:mm++', 'last year')
        x = lyr+' '+td+`, ${hr}:${mn < 10 ? '0'+mn : ''+mn}${ap}`
        t.ok(r === x, `last year expected "${x}", got "${r}"`)

        // next month
        r = F('date|M/D/YYYY, h:mm++', 'next month')
        x = `${nmo}/${tdy}/${tyr}, ${hr}:${mn < 10 ? '0'+mn : ''+mn}${ap}`
        t.ok(r === x, `next month expected "${x}", got "${r}"`)
        // last month
        r = F('date|M/D/YYYY, h:mm++', 'last month')
        x = `${lmo}/${tdy}/${lmyr}, ${hr}:${mn < 10 ? '0'+mn : ''+mn}${ap}`
        t.ok(r === x, `last month expected "${x}", got "${r}"`)


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
        t.ok(rd === xd, `1 next week expected "${xd}", got "${rd}"`)
        t.ok(rdy !== dn, `2 next week expected day "${dn}", got "${rdy}"`)
        // last week
        r = F('date|WWWW YYYY MMM D, h:mm++', 'last week')
        rd = r.substring(0, r.indexOf(' '))
        ci = r.indexOf(',')
        rdy = r.substring(r.lastIndexOf(' ', ci), ci)
        rt = r.substring(r.lastIndexOf(' '))
        xd = wdn
        t.ok(rd === xd, `3 next week expected "${xd}", got "${rd}"`)
        t.ok(rdy !== dn, `4 next week expected day "${dn}", got "${rdy}"`)



        // this year, month, week, day, hour, minute, second

        let top = F('date|YYYY-MMM-D hh:mm:ss', 'now')
        let [datePart, timePart] = top.split(' ')
        let [yrTop,moTop, dyTop] = datePart.split('-')
        let [hrTop, mnTop, scTop] = timePart.split(':')
        let wd = new Date().getUTCDay()
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
        t.ok(r === x, `this year expected "${x}", got "${r}"`)
        r = F('date|MMM D YYYY, hh:mm--', 'this month')
        x = `${moTop} 1 ${yrTop}, 12:00am`
        t.ok(r === x, `this month expected "${x}", got "${r}"`)
        r = F('date|MMM D YYYY, hh:mm--', 'this week')
        x = `${moTop} ${wkdTop} ${yrTop}, 12:00am`
        t.ok(r === x, `this week expected "${x}", got "${r}"`)
        r = F('date|MMM D YYYY, hh:mm--', 'this day')
        x = `${moTop} ${dyTop} ${yrTop}, 12:00am`
        t.ok(r === x, `this day expected "${x}", got "${r}"`)
        r = F('date|MMM D YYYY, hh:mm:ss--', 'this hour')
        x = `${moTop} ${dyTop} ${yrTop}, ${hrTop}:00:00${ap}`
        t.ok(r === x, `this hour expected "${x}", got "${r}"`)
        r = F('date|MMM D YYYY, hh:mm:ss--', 'this minute')
        x = `${moTop} ${dyTop} ${yrTop}, ${hrTop}:${mnTop}:00${ap}`
        t.ok(r === x, `this minute expected "${x}", got "${r}"`)
        r = F('date|MMM D YYYY, hh:mm:ss.sss--', 'this second')
        x = `${moTop} ${dyTop} ${yrTop}, ${hrTop}:${mnTop}:${scTop}.000${ap}`
        t.ok(r === x, `this second expected "${x}", got "${r}"`)

        //  next, last weekday
        r = F('date|WWWW MMM D YYYY, hh:mm--', 'last Wednesday')
        r = r.substring(0, r.indexOf(' '))
        x = 'Wednesday'
        t.ok(r === x, `last Wednesday expected "${x}", got "${r}"`)
        r = F('date|WWWW MMM D YYYY, hh:mm--', 'next Fri')
        r = r.substring(0, r.indexOf(' '))
        x = 'Friday'
        t.ok(r === x, `next Fri expected "${x}", got "${r}"`)
        r = F('date|WWWW MMM D YYYY, hh:mm--', 'next Friday @ 12:34')
        rd = r.substring(0, r.indexOf(' '))
        xd = 'Friday'
        rt = r.substring(r.lastIndexOf(' '))
        let xt = ' 12:34pm'
        t.ok(rd === xd, `next Friday @ expected "${xd}", got "${rd}"`)
        t.ok(rt === xt, `next Friday @ expected "${xt}", got "${rt}"`)

        // this weekday
        r = F('date|WWWW MMM D YYYY, hh:mm--', 'this Monday')
        r = r.substring(0, r.indexOf(' '))
        x = 'Monday'
        t.ok(r === x, `this Monday expected "${x}", got "${r}"`)
        r = F('date|WWWW MMM D YYYY, hh:mm--', 'this Friday')
        r = r.substring(0, r.indexOf(' '))
        x = 'Friday'
        t.ok(r === x, `this Friday expected "${x}", got "${r}"`)
        r = F('date|WWWW MMM D YYYY, hh:mm--', 'this Friday @ 12:34')
        rd = r.substring(0, r.indexOf(' '))
        xd = 'Friday'
        rt = r.substring(r.lastIndexOf(' '))
        xt = ' 12:34pm'
        t.ok(rd === xd, `this Friday @ expected "${xd}", got "${rd}"`)
        t.ok(rt === xt, `this Friday @ expected "${xt}", got "${rt}"`)

        let testDate = '2021-01-13Z'

        // intl full, long, medium, short
        r = F('date|full-full', testDate)
        x = 'Tuesday, January 12, 2021 at 4:00:00 PM Pacific Standard Time'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        r = F('date|long-long', testDate)
        x = 'January 12, 2021 at 4:00:00 PM PST'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        r = F('date|medium-medium', testDate)
        x = 'Jan 12, 2021, 4:00:00 PM'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        r = F('date|short-short', testDate)
        x = '1/12/21, 4:00 PM'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        r = F('date|short-long', testDate)
        x = '1/12/21, 4:00:00 PM PST'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        r = F('date|full-full~es-ES', testDate)
        x = 'martes, 12 de enero de 2021, 16:00:00 (hora estándar del Pacífico)'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        r = F('date|long-long~es-ES', testDate)
        x = '12 de enero de 2021, 16:00:00 GMT-8'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        r = F('date|medium-medium~es-ES', testDate)
        x = '12 ene. 2021 16:00:00'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        r = F('date|short-short~es-ES', testDate)
        x = '12/1/21 16:00'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        r = F('date|short-long~es-ES', testDate)
        x = '12/1/21 16:00:00 GMT-8'
        t.ok(r === x, `expected "${x}", got "${r}"`)


        // all should be equivalent
        r = F('date?America/Los Angeles|short-long', testDate)
        let lr = r
        x = '1/12/21, 4:00:00 PM PST'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('date?Los Angeles|short-long', testDate)
        x = lr
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('date?Pacific Standard Time|short-long', testDate)
        x = lr
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('date?Pacific Daylight Time|short-long', testDate)
        x = lr
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('date?PST|short-long', testDate)
        x = lr
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('date?PDT|short-long', testDate)
        x = lr
        t.ok(r === x, `expected "${x}", got "${r}"`)


        // sanity TZ cast test
        r = F('date|MM/DD hh:mm:ss', '2021-01-14T10:00:00Z')
        x = '01/14 10:00:00'
        t.ok(r === x, `default utc expected "${x}", got "${r}"`)

        r = F('date?utc|MM/DD hh:mm:ss', '2021-01-14T10:00:00Z')
        x = '01/14 10:00:00'
        t.ok(r === x, `cast utc expected "${x}", got "${r}"`)
        r = F('date?est|MM/DD hh:mm:ss', '2021-01-14T10:00:00Z')
        x = '01/14 05:00:00'
        t.ok(r === x, `cast est expected "${x}", got "${r}"`)
        r = F('date?cst|MM/DD hh:mm:ss', '2021-01-14T10:00:00Z')
        x = '01/14 04:00:00'
        t.ok(r === x, `cast cst expected "${x}", got "${r}"`)
        r = F('date?mst|MM/DD hh:mm:ss', '2021-01-14T10:00:00Z')
        x = '01/14 03:00:00'
        t.ok(r === x, `cast mst expected "${x}", got "${r}"`)
        r = F('date?pst|MM/DD hh:mm:ss', '2021-01-14T10:00:00Z')
        x = '01/14 02:00:00'
        t.ok(r === x, `cast pst expected "${x}", got "${r}"`)
        r = F('date?local|MM/DD hh:mm:ss', '2021-01-14T10:00:00Z')
        x = '01/14 02:00:00'
        t.ok(r === x, `cast loc expected "${x}", got "${r}"`)

        // timezone display
        r = F('date|MM/DD hh:mm:ss z', '2021-01-14T10:00:00Z')
        x = '01/14 10:00:00 UTC'
        t.ok(r === x, `tz z expected "${x}", got "${r}"`)
        r = F('date|MM/DD hh:mm:ss Z', '2021-01-14T10:00:00Z')
        x = '01/14 10:00:00 Universal Time'
        r = F('date|MM/DD hh:mm:ss (z)', '2021-01-14T10:00:00Z')
        x = '01/14 10:00:00 (UTC)'
        t.ok(r === x, `tz z expected "${x}", got "${r}"`)
        r = F('date|MM/DD hh:mm:ss (Z)', '2021-01-14T10:00:00Z')
        x = '01/14 10:00:00 (Universal Time)'
        t.ok(r === x, `tz Z expected "${x}", got "${r}"`)
        r = F('date?EST|MM/DD hh:mm:ss z', '2021-01-14T10:00:00Z')
        x = '01/14 05:00:00 EST'
        t.ok(r === x, `tz Z expected "${x}", got "${r}"`)
        r = F('date?EST|MM/DD hh:mm:ss Z', '2021-01-14T10:00:00Z')
        x = '01/14 05:00:00 Eastern Standard Time'
        t.ok(r === x, `tz Z expected "${x}", got "${r}"`)

        r = F('date?PST|MM/DD hh:mm:ss z', '2021-01-14T10:00:00Z')
        x = '01/14 02:00:00 PST'
        t.ok(r === x, `tz Z expected "${x}", got "${r}"`)
        r = F('date?local|MM/DD hh:mm:ss z', '2021-01-14T10:00:00Z')
        x = '01/14 02:00:00 PST'
        t.ok(r === x, `tz Z expected "${x}", got "${r}"`)

        t.end()
    })
}

dateFormatTest()