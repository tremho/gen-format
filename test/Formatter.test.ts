import Tap from 'tap'

import F from '../src/Formatter'
import {formatV} from '../src/Formatter'

function formatTest() {
    Tap.test('numbers', t => {
        
        let v = Math.PI

        // normal. Has space padded alignment
        let r = F('2.3', v)
        let x = ' 3.142'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // zero padded alignment
        r = F('02.3', v)
        x = '03.142'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // no problem with space
        r = F(' 2.3', v)
        x = ' 3.142'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // no alignment
        r = F('-2.3', v)
        x = '3.142'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // no rounding
        r = F('!2.3', v)
        x = ' 3.141'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // no rounding, no alignment
        r = F('-!2.3', v)
        x = '3.141'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // plus
        r = F('+2.3', v)
        x = '+3.142'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // no round plus
        r = F('!+2.3', v)
        x = '+3.141'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // integerize
        v = 1.5
        r = F('1.0', v)
        x = '2'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('!1.0', v)
        x = '1'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // negative
        r = F('2.3', -6.283123456)
        x = '-6.283'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // negative, round, no round
        r = F('2.0', -1.6)
        x = '-2'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('!2.0', -1.6)
        x = '-1'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // thousands
        v = 123456.789
        r = F('k6.3', v)
        x = '123,456.789'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // overflow
        r = F('3.0', v)
        x = '###'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // trailing zeroes
        v = 12.34
        r = F('2.04',v)
        x = '12.3400'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // space padding
        v = 12.34
        r = F('2.4+',v)
        x = '12.34  '
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // no alignment
        v = 12.34
        r = F('2.4-',v)
        x = '12.34'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        t.end()
    })
    Tap.test('strings', t => {

        /*
         * [10,20]              // Will pad the end of the string with spaces if less than 10 characters,
         *                      // or truncate it if its length is more than 20.
         */
        // pad to 10 spaces
        let v = 'test'
        let r = F('10,10', v)
        let x = 'test      '
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // truncate to 10 spaces
        v = 'this is an epic test'
        r = F('10,10', v)
        x = 'this is an'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // [10,10-] // Similar, but pads with "-" instead of space
        v = 'test'
        r = F('10,10-', v)
        x = 'test------'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // [10,10hello] // Similar, but pads with "hello" instead of space
        v = 'test'
        r = F('10,10hello', v)
        x = 'testhelloh'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        v = 'test'
        r = F('10,10 \u1F600', v) // smiley face
        x = 'test \u1f600 \u1f600'      // remember: extended unicode is 2 characters length
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // [10,] // Pads if less than 10 characters, but unlimited max length otherwise
        v = 'test'
        r = F('10,', v)
        x = 'test      '
        t.ok(r === x, `expected "${x}", got "${r}"`)
        v = 'this is an epic test'
        r = F('10,', v)
        x = 'this is an epic test'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // [,10] [0,10] // No minimum length, but maximum is 10
        v = 'this is an epic test'
        r = F(',10,', v)
        x = 'this is an'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        v = 't'
        r = F(',10,', v)
        x = 't'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        v = 'this is an epic test'
        r = F('0,10,', v)
        x = 'this is an'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        v = 't'
        r = F('0,10,', v)
        x = 't'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        // [,0] // empty string
        v = 'test'
        r = F(',0,', v)
        x = ''
        t.ok(r === x, `expected "${x}", got "${r}"`)
        v = 'test'
        r = F('0,0,', v)
        x = ''
        t.ok(r === x, `expected "${x}", got "${r}"`)
        // [ 10,10] // right align
        v = 'test'
        r = F(' 10,10', v)
        x = '      test'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        // [ 10,10 ] // center align
        v = 'test'
        r = F(' 10,10 ', v)
        x = '   test   '
        r = F('>10,10<', 'hello')
        x = '>>hello<< ' // symmetrically padded for center, then padded with spaces for fit
        t.ok(r === x, `expected "${x}", got "${r}"`)
        // [,] no effect
        v = 'test'
        r = F(',', v)
        x = 'test'
        t.ok(r === x, `expected "${x}", got "${r}"`)


        t.end()
    })
    Tap.test('formatV', t => {
        t.ok(formatV, 'there is a formatV value')
        t.ok(typeof formatV === 'function', 'there is a formatV function')
        let a = 'rain', b= 'Spain', c = 'plain'
        let f = 'the $() in $() is mainly in the $()'
        let r = formatV(f, a, b, c)
        let x = 'the rain in Spain is mainly in the plain'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        // all the examples from Formatter.ts
        r = formatV("Pi to 3 digits is $(1.3)", Math.PI)
        x = 'Pi to 3 digits is 3.142'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        let aString = "Now is the time for all good men to come to the aid of their country"
        r = formatV("This string is a padded minimum of 10 and max 20 characters $(10,20)", aString)
        x = 'This string is a padded minimum of 10 and max 20 characters Now is the time for '
        t.ok(r === x, `expected "${x}", got "${r}"`)

        aString = "Now"
        r = formatV("This string is a padded minimum of 10 and max 20 characters $(10,20)", aString)
        x = 'This string is a padded minimum of 10 and max 20 characters Now       '
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = formatV("This string is right to 10 characters from here:$( 10,)", aString)
        x = 'This string is right to 10 characters from here:       Now'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        r = formatV("This is padded $(>10,10<)", "Hello")
        x = 'This is padded >>Hello<< '
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // from format/Formatter.ts
        r = formatV("The $() jumped over the $()", "cow", "moon");
        x = 'The cow jumped over the moon'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // trailing literal
        r = formatV('we have an insert $(), and then more to say', 'here')
        x = 'we have an insert here, and then more to say'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // order
        r = formatV("We are putting the $2() before the $1() with this one", "horse", "cart");
        x = 'We are putting the cart before the horse with this one'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        r = formatV("The $dish() ran away with the $spoon()",{dish: "platter", spoon: "spatula"});
        x = 'The platter ran away with the spatula'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        do {
            let a = {
                    individual: "man",
                    foo: "not important",
                    bar: "never mind"
                },
                b = {
                    fruit: "apple",
                    color: "blue",
                    group: "mankind"
                }
            r = formatV("One small step for a $1:individual(), one giant leap for $2:group()", a, b);
            x = 'One small step for a man, one giant leap for mankind'
            t.ok(r === x, `expected "${x}", got "${r}"`)
        } while(false)
        do {
            let name = 'Dr. Victor Frankenstein'
            let addr = '1122 BoogieWoogie Ave.'
            let state = 'NJ'
            r = formatV("Name: $1(20,20) Address: $2( 60,60 ) State: $3(2,2)", name, addr, state);
            x = 'Name: Dr. Victor Frankenst Address:                    1122 BoogieWoogie Ave.                    State: NJ'
            t.ok(r === x, `expected "${x}", got "${r}"`)
        } while(false)
        do {
            r = formatV("The value of PI to 6 places is $(1.6)", Math.PI);
            x = "The value of PI to 6 places is 3.141593"
            t.ok(r === x, `expected "${x}", got "${r}"`)
        } while(false)

        // test a number with default format
        r = F('.', Math.PI)
        x = '3.141592653589793'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = formatV('Put the number here $() and see what it is', Math.PI)
        x = 'Put the number here 3.141592653589793 and see what it is'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        t.end()
    })
    Tap.test('date', t => {

        /* Skip all these while we are testing


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
        r = F('date|short-long(America/Los Angeles)', testDate)
        let lr = r
        x = '1/12/21, 4:00:00 PM PST'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('date|short-long(Los Angeles)', testDate)
        x = lr
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('date|short-long(Pacific Standard Time)', testDate)
        x = lr
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('date|short-long(Pacific Daylight Time)', testDate)
        x = lr
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('date|short-long(PST)', testDate)
        x = lr
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = F('date|short-long(PDT)', testDate)
        x = lr
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // interval
        // let dtn = new Date()
        // let dtp = dtn.getTime() - 130000
        // r = F('daterange|long(UTC) relative', dtp)
        // x = '2 minutes ago'
        // t.ok(r === x, `daterange expected "${x}", got "${r}"`)
        // r = F('daterange|long(UTC) relative', dtp- 24321)
        // x = 'a little over 2 minutes ago'
        // t.ok(r === x, `daterange 1 expected "${x}", got "${r}"`)
        // r = F('daterange|long(UTC) relative', 'now')
        // x = 'just now'
        // t.ok(r === x, `daterange 2 expected "${x}", got "${r}"`)
        // r = F('daterange|long(UTC) relative', Date.now() - 1500)
        // x = 'a moment ago'
        // t.ok(r === x, `daterange 3 expected "${x}", got "${r}"`)
        // r = F('daterange|long(UTC) relative', Date.now() - 3500)
        // x = 'a little over 3 seconds ago'
        // t.ok(r === x, `daterange 4 expected "${x}", got "${r}"`)
        // r = F('daterange|long(UTC) relative', Date.now() - 33500)
        // x = 'a little over 33 seconds ago'
        // t.ok(r === x, `daterange 5 expected "${x}", got "${r}"`)
        // r = F('daterange|long(UTC) relative', Date.now() - 66500)
        // x = 'a minute ago'
        // t.ok(r === x, `daterange 6 expected "${x}", got "${r}"`)
        // r = F('daterange|long(UTC) relative', Date.now() - 80500)
        // x = 'a little over a minute ago'
        // t.ok(r === x, `daterange 7 expected "${x}", got "${r}"`)

        // sanity TZ cast test
        r = F('date|MM/DD hh:mm:ss', '2021-01-14T10:00:00Z')
        x = '01/14 10:00:00'
        t.ok(r === x, `default utc expected "${x}", got "${r}"`)
        r = F('date|MM/DD hh:mm:ss (UTC)', '2021-01-14T10:00:00Z')
        x = '01/14 10:00:00'
        t.ok(r === x, `cast utc expected "${x}", got "${r}"`)
        r = F('date|MM/DD hh:mm:ss (EST)', '2021-01-14T10:00:00Z')
        x = '01/14 05:00:00'
        t.ok(r === x, `cast est expected "${x}", got "${r}"`)
        r = F('date|MM/DD hh:mm:ss (CST)', '2021-01-14T10:00:00Z')
        x = '01/14 04:00:00'
        t.ok(r === x, `cast cst expected "${x}", got "${r}"`)
        r = F('date|MM/DD hh:mm:ss (MST)', '2021-01-14T10:00:00Z')
        x = '01/14 03:00:00'
        t.ok(r === x, `cast mst expected "${x}", got "${r}"`)
        r = F('date|MM/DD hh:mm:ss (PST)', '2021-01-14T10:00:00Z')
        x = '01/14 02:00:00'
        t.ok(r === x, `cast pst expected "${x}", got "${r}"`)
        r = F('date|MM/DD hh:mm:ss (Local)', '2021-01-14T10:00:00Z')
        x = '01/14 02:00:00'
        t.ok(r === x, `cast loc expected "${x}", got "${r}"`)

        r = F('date|MM/DD hh:mm:ss z', '2021-01-14T10:00:00Z')
        x = '01/14 10:00:00 (UTC)'
        t.ok(r === x, `tz z expected "${x}", got "${r}"`)
        r = F('date|MM/DD hh:mm:ss Z', '2021-01-14T10:00:00Z')
        x = '01/14 10:00:00 (Universal Time)'
        t.ok(r === x, `tz Z expected "${x}", got "${r}"`)
        r = F('date|MM/DD hh:mm:ss z (EST)', '2021-01-14T10:00:00Z')
        x = '01/14 05:00:00 (EST)'
        t.ok(r === x, `tz Z expected "${x}", got "${r}"`)
        r = F('date|MM/DD hh:mm:ss Z (EST)', '2021-01-14T10:00:00Z')
        x = '01/14 05:00:00 (Eastern Standard Time)'
        t.ok(r === x, `tz Z expected "${x}", got "${r}"`)

        r = F('date|MM/DD hh:mm:ss z (PST)', '2021-01-14T10:00:00Z')
        x = '01/14 02:00:00 (PST)'
        t.ok(r === x, `tz Z expected "${x}", got "${r}"`)
        r = F('date|MM/DD hh:mm:ss z (Local)', '2021-01-14T10:00:00Z')
        x = '01/14 02:00:00 (PST)'
        t.ok(r === x, `tz Z expected "${x}", got "${r}"`)

        */
        let r,x
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
        r = F('daterange|h:mm:ss', {startDate:tn, endDate:tn})
        x = '12:00:00'
        t.ok(r === x, `${name()} expected "${x}", got "${r}"`)
        // start < end
        r = F('daterange|h:mm:ss', {startDate:tn - 5000, endDate:tn})
        x = '11:59:55 - 12:00:00'
        t.ok(r === x, `${name()} expected "${x}", got "${r}"`)
        // start > end
        r = F('daterange|h:mm:ss', {startDate:tn + 5000, endDate:tn})
        x = '12:00:05 - 12:00:00'
        t.ok(r === x, `${name()} expected "${x}", got "${r}"`)

        // paired dates
        label = 'group dates left, times right'
        count = 0
        // paired range : use the time format to show range, and use date format if date is needed, with grouping
        // both the same
        r = F('daterange|MMM D h:mm:ss', {startDate:tn, endDate:tn})
        x = 'Jan 14 12:00:00'
        t.ok(r === x, `${name()} expected "${x}", got "${r}"`)
        // start < end
        r = F('daterange|MMM D, h:mm:ss', {startDate:tn - 5000, endDate:tn})
        x = 'Jan 13, 11:59:55 - Jan 14, 12:00:00'
        t.ok(r === x, `${name()} expected "${x}", got "${r}"`)
        // start > end
        r = F('daterange|MMM D h:mm:ss', {startDate:tn + 5000, endDate:tn})
        x = 'Jan 14 12:00:05 - 12:00:00'
        t.ok(r === x, `${name()} expected "${x}", got "${r}"`)

        label = 'group dates left, time sets right'
        count = 0
        // 2 morning times
        tn = new Date('2021-04-03T07:30:00Z').getTime()
        let tn2 = new Date('2021-04-03T09:30:00Z').getTime()
        r = F('daterange|MMM D h:mm', {startDate:tn, endDate:tn2})
        x = 'Apr 3 7:30 - 9:30'
        t.ok(r === x, `${name()} expected "${x}", got "${r}"`)
        // times crossing noon
        tn2 = new Date('2021-04-03T15:15:00Z').getTime()
        r = F('daterange|MMM D h:mm ++', {startDate:tn, endDate:tn2})
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
        r = F('daterange|h:mm:ss MMM D', {startDate:tn, endDate:tn})
        x = '12:00:00 Jan 14'
        t.ok(r === x, `${name()} expected "${x}", got "${r}"`)
        // start < end
        r = F('daterange|h:mm:ss MMM D', {startDate:tn - 5000, endDate:tn})
        x = '11:59:55 Jan 13 - 12:00:00 Jan 14'
        t.ok(r === x, `${name()} expected "${x}", got "${r}"`)
        // start > end
        r = F('daterange|h:mm:ss MMM D', {startDate:tn + 5000, endDate:tn})
        x = '12:00:05 - 12:00:00 Jan 14'
        t.ok(r === x, `${name()} expected "${x}", got "${r}"`)

        label = 'group time sets left, date right'
        count = 0
        // two afternoon times
        tn = new Date('2021-04-03T14:12:00Z').getTime()
        tn2 = new Date('2021-04-03T17:50:00Z').getTime()
        r = F('daterange|MMM D hh:mm', {startDate:tn, endDate:tn2})
        x = 'Apr 3 02:12 - 05:50'
        t.ok(r === x, `${name()} expected "${x}", got "${r}"`)

        // times crossing noon
        tn = new Date('2021-04-03T10:12:00Z').getTime()
        tn2 = new Date('2021-04-03T12:50:00Z').getTime()
        r = F('daterange|MMM D hh:mm ++', {startDate:tn, endDate:tn2})
        x = 'Apr 3 10:12 AM - 12:50 PM'
        t.ok(r === x, `${name()} expected "${x}", got "${r}"`)

        // group dates in year
        label = 'group year left, range right'
        count = 0
        tn = new Date('2021-01-20T00:00:00Z').getTime()
        tn2 = new Date('2021-04-03T00:00:00Z').getTime()
        r = F('daterange|YYYY MMM D', {startDate:tn, endDate:tn2})
        x = '2021 Jan 20 - Apr 3'
        t.ok(r === x, `${name()} expected "${x}", got "${r}"`)

        label = 'group range left, year right'
        count = 0
        r = F('daterange|MMM D, YYYY', {startDate:tn, endDate:tn2})
        x = 'Jan 20 - Apr 3, 2021'
        t.ok(r === x, `${name()} expected "${x}", got "${r}"`)

        label = 'group month left, range right'
        count = 0
        // group days in month
        tn2 = new Date('2021-01-23T00:00:00Z').getTime()
        r = F('daterange|YYYY MMM D', {startDate:tn, endDate:tn2})
        x = '2021 Jan 20 - 23'
        t.ok(r === x, `${name()} expected "${x}", got "${r}"`)

        // TODO: group with date decorators M/D/YY
        // TODO: group with time zone displays and casts

        // TODO: human ranges ?

        // TODO: diffs (different display options, human)


        // Support + - (for A a) as well as ++, -- (AM am)

        // TODO: .sss, .ss, .s, x
        // TODO: j, u
        // TODO: h H V (12-12, 0-24, 0-11), no ap on 24
        // TODO: start with survey of all format sizes: e.g. Y vs. YYY


        t.end()
    })
}

formatTest()