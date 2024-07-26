import {getFileOps, IFormatHandler, SpecParts, getUseIntlChoice} from "../Formatter";
import DateTimeFormatOptions = Intl.DateTimeFormatOptions;
import {findTimezones, findTimezoneBlocks, findTimezoneBlocksForDate} from './Timezone'
import {i18nFormatByStyle} from "./Shared";
// import * as LocaleStringTables from "@tremho/locale-string-tables"
import {getSystemLocale, LoadStats} from "@tremho/locale-string-tables"
import DateRangeFormatter from "./DateRangeFormatter";

const sysloc = getSystemLocale()
let localTimeZone;

import i18n from '../i18n'

// We'll use Intl if it is available and has language support

// TO Enable full icu for Node, run test like this:
//>NODE_ICU_DATA="/Users/sohmert/.npm-global/lib/node_modules/full-icu" npm test
// Otherwise, it will run with a limited ICU


let IDTF = Intl && Intl.DateTimeFormat

/*
TODO List for Date
- today and (yesterday, tomorrow, etc) @ time parse
- timeformat keywords (built in and expandable via string tables) / use i18n, intl if available
    - √ full, long, medium, short for date and for time, so   as date-time, e.g. full-full, medium-short
    - √ locale date|medium-short~es-ES = medium-short format in Continental Spanish
    - √ requested timezone date|medium-short(CET)~es-ES

    will accept any of the following forms:
    - √ Pacific (or Eastern, Central, etc)
    - √ Pacific Standard Time / Pacific Daylight Time
    - √ America/Los Angeles (must be the IANA representative city)
    - Los Angeles (shorthand will only work if there is no ambiguity)
    - PST or PDT (will translate to Pacific; daylight designation can't be prescribed by format specifier)
    - these letter codes are for US and Europe (https://en.wikipedia.org/wiki/Time_in_Europe)
    - asia (https://en.wikipedia.org/wiki/ASEAN_Common_Time)
    - africa (https://greenwichmeantime.com/time-zone/africa/time-zones/)
    - australia (https://en.wikipedia.org/wiki/Time_in_Australia)
    - antarctica (n/a)
    - maybe the best overall (https://www.timeanddate.com/time/current-number-time-zones.html)
    - value passed to timezone option of Intl support is the IANA Area/City string

    1. Create a table with all the IANA names
    2. Set a date and run it through this list, get the short name (abbr) for each and put into table
    3. Get the minutes offset for each.  this is the numeric form of tz
    4. create a class that empowers this data.
    5. create lookup helpers to find as needed.


- relative (to now or timestamp)
- cast to timezone
 -
 */

/**
 * Error thrown for an invalid value passed to the date formatter.
 *
 * This may be due to a string that fails to parse, a non-Date object instance,
 * an Invalid Date instance, or not a Date or a string.
 *
 * @param message
 * @constructor
 */
export function BadDateValue(message:string) {
    class BadDateValue extends Error {
        constructor(message) {
            super(message)
            this.name = 'BadDateValue'
        }
    }

    return new BadDateValue(message)
}

/**
 * DateFormatter
 *
 * This is the _named handler_ for 'date' formatting.
 * This main class evaluates the passed value and discerns the desired Date object from this.
 * It then employs the internal `SimpleDateParser` to represent the date according to format.
 */
export default class DateFormatter implements IFormatHandler {

    format(specParts: SpecParts, value: any): string {

        if(specParts.format && specParts.format.indexOf('human') !== -1
        || Array.isArray(value)) {
            return new DateRangeFormatter().format(specParts, value)
        }

        let out: string = ''
        // if(typeof value !== 'string') {
        //     if(!value) return '' // null and undefined just result in empty string
        //     throw IncompatibleValueType(`expected string, got ${typeof value}`)
        // }
        if (value === 'now') {
            value = Date.now()
        }

        // value can be a parseable* string (* only strings parsed by Date.parse)
        // or "now" or "future(seconds)" or "past(seconds)"
        // or a timestamp
        // or a Date instance
        let timestamp
        if (typeof value === 'string') {
            let keyword = value.trim().toLowerCase()
            if (keyword.indexOf('future(') !== -1) {
                let pi = value.indexOf('(')
                let pe = value.indexOf(')', pi)
                let secs = Number(value.substring(pi + 1, pe))
                timestamp = Date.now() + secs * 1000
            }
            if (keyword.indexOf('past(') !== -1) {
                let pi = value.indexOf('(')
                let pe = value.indexOf(')', pi)
                let secs = Number(value.substring(pi + 1, pe))
                timestamp = Date.now() - secs * 1000
            }
            if (keyword === 'now') {            // current date/time to millisecond
                timestamp = Date.now()
            }
            if(keyword.indexOf('today') !== -1) {
                timestamp = dayMark(0 ) // midnight on this day
                timestamp += parseTimeArg(keyword) // or set the time within the day (default current time)
            }
            if(keyword.indexOf('tomorrow') !== -1) {
                timestamp = dayMark(1)              // midnight tomorrow
                timestamp += parseTimeArg(keyword)  // set the time (default current time) (0) for midnight

            }
            if(keyword.indexOf('yesterday') !== -1) {
                timestamp = dayMark(-1)             // midnight yesterday
                timestamp += parseTimeArg(keyword)  // set the time
            }
            if(keyword.indexOf('next') !== -1) {
                if(keyword.indexOf('week') !== -1) {
                    timestamp = weekMark(1)
                    timestamp += parseTimeArg(keyword)  // set the time
                }
                if(keyword.indexOf('month') !== -1) {
                    timestamp = monthMark(1)
                    timestamp += parseTimeArg(keyword)  // set the time
                }
                if(keyword.indexOf('year') !== -1) {
                    timestamp = yearMark(1)
                    timestamp += parseTimeArg(keyword)  // set the time
                }
                // weekday names
                let wkd = findWeekdayName(keyword)
                if(wkd !== undefined) {
                    timestamp = nextWeekday(wkd)
                    timestamp += parseTimeArg(keyword)  // set the time
                }
            }
            if(keyword.indexOf('last') !== -1) {
                if(keyword.indexOf('week') !== -1) {
                    timestamp = weekMark(-1)             // last week at midnight
                    timestamp += parseTimeArg(keyword) // set the time
                }
                if(keyword.indexOf('month') !== -1) {
                    timestamp = monthMark(-1)
                    timestamp += parseTimeArg(keyword) // set the time
                }
                if(keyword.indexOf('year') !== -1) {
                    timestamp = yearMark(-1)
                    timestamp += parseTimeArg(keyword) // set the time
                }
                // weekday names
                let wkd = findWeekdayName(keyword)
                if(wkd !== undefined) {
                    timestamp = lastWeekday(wkd, true)
                    timestamp += parseTimeArg(keyword)  // set the time
                }
            }
            if(keyword.indexOf('this') !== -1) {
                if(keyword.indexOf('day') !== -1) { // same as today
                    timestamp = dayMark(0)
                }
                if(keyword.indexOf('hour') !== -1) { // top of current hour
                    timestamp = hourMark(0)
                }
                if(keyword.indexOf('minute') !== -1) { // top of current minute
                    timestamp = minuteMark(0)
                }
                if(keyword.indexOf('second') !== -1) { // top of current second
                    timestamp = secondMark(0)
                }
                if(keyword.indexOf('week') !== -1) { // Midnight Sunday of current week, looking backward
                    timestamp = weekMark(0, true)
                    if(keyword.indexOf('@') !== -1) { // default to midnight if no explicit time set
                        timestamp += parseTimeArg(keyword)
                    }
                }
                if(keyword.indexOf('month') !== -1) { // Midnight on first of current month
                    timestamp = monthMark(0,  true)
                    if(keyword.indexOf('@') !== -1) { // default to midnight if no explicit time set
                        timestamp += parseTimeArg(keyword)
                    }
                }
                if(keyword.indexOf('year') !== -1) { // Midnight 01/01 of current year
                    timestamp = yearMark(0,  true)
                    if(keyword.indexOf('@') !== -1) { // default to midnight if no explicit time set
                        timestamp += parseTimeArg(keyword)
                    }
                }
                let wkd = findWeekdayName(keyword)
                if(wkd !== undefined) {
                    timestamp = thisWeekday(wkd)
                    if(keyword.indexOf('@') !== -1) { // default to midnight if no explicit time set
                        timestamp += parseTimeArg(keyword)  // set the time
                    }
                }
            }
            if(timestamp === undefined) {
                let dtp = Date.parse(value) // will result in a timestamp or NaN
                if (isNaN(dtp)) {
                    throw BadDateValue(`Unable to parse date string "${value}"`)
                }
                value = dtp
            }
        }
        if (typeof value === 'number') {
            if (!isNaN(value)) {
                timestamp = value
            }
        }
        if (value instanceof Date) {
            timestamp = value.getTime()
        }

        if (timestamp === undefined) {
            throw BadDateValue(`"${value}" is not an acceptable value for a date`)
        }

        // the only type of hint we recognize is a single cast to a timezone
        const hints = specParts.hints
        let tzCast
        if(hints) {
            if (hints.length > 1) {
                throw RangeError('Unsupported number of hints')
            }
            tzCast = hints[0]
        }
        if(!tzCast) tzCast = 'UTC' // default to UTC

        if(!localTimeZone) {
            let ds = new Date().toString()
            let abbr = ds.substring(ds.lastIndexOf('(')+1, ds.lastIndexOf(')'))
            let name
            if(abbr.indexOf(' ') !== -1) {
                name = abbr;
                abbr = ''
            }
            let gmti = ds.lastIndexOf('GMT')
            let endi = ds.lastIndexOf('(')
            if(endi === -1) endi=ds.length
            localTimeZone = ds.substring(gmti, endi).trim() // default if we have no named zone

            let dt = new Date()
            let blocks = findTimezoneBlocksForDate(dt)
            for(let i=0; i<blocks.length; i++) {
                if(abbr && blocks[i].abbr === abbr
                || name && blocks[i].name === name) {
                    localTimeZone = blocks[i].city
                    break
                }
            }
        }
        if(tzCast && tzCast.toLowerCase() === 'local') tzCast = localTimeZone

        let rt = ''
        let sdf = new SimpleDateFormat(timestamp)
        sdf.setFormat(specParts.format)
        try {
            sdf.setLocale(specParts.locale)
        } catch(e) {
            console.error(e.message)
            i18n.setLocale() // revert to system locale on error
            specParts.locale = getSystemLocale()
        }

        try {
            sdf.setTimezoneCast(tzCast)
            rt = sdf.toString()
            if(tzCast && tzCast.toLowerCase() === 'utc') {
                let parts = (specParts.format || '').split('-')
                let style = parts[1] || parts[0]
                let utcName = i18n.getLocaleString('date.format.timezone.UTC.short', 'UTC', false)
                if( style.indexOf('Z') !== -1) style = 'full'
                if( style === 'full') utcName = i18n.getLocaleString('date.format.timezone.UTC.long', 'Coordinated Universal Time', false)
                rt = rt.replace('Greenwich Mean Time', utcName)
            }
        } catch(e) {
            console.error(e)
        }
        return rt.trim()
    }
}


const months = ['--', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const monthAbbr = ['--', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const weekdayAbbrs = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const weekdayAbbr2 = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']  // deprecated
const weekdayAbbr3 = ['S', 'M', 'T', 'W', 'Th', 'F', 'Sa']  // deprecated

/**
 * This internal class is the workhorse of DateFormatter.  It transforms a date format string into a correspondingly
 * formatted Date display utiliing the format components as decribed.  Will utilize `Intl` where appropriate, if available.
 *
 * format notation:
 *      YYYY = 4 digit year (e.g. 2020)
 *      YYY =  4 digit year, but only show if not the current year
 *      YY = 2 digit year (e.g. 20)
 *      Y =  2 digit year only shown if not the current year
 *      (if a year is not shown, characters in format beyond are skipped until the next parse token)
 *
 *      MMMM = full name of month (e.g. 'February')
 *      MMM = abbreviated name of month (3 letters, e.g. 'Feb')
 *      MM = 2 digit month (leading 0) (e.g. 02)
 *      M = 1-2 digit month (no leading 0) (e.g. 2)
 *
 *      WWWW = Full weekday name (e.g. 'Saturday')
 *      WWW = three letter weekday abbreviation (e.g. 'Sat')
 *      WW = two letter weekday abbreviation (uncommon) (e.g. 'Mo', 'Sa')
 *      W = 1 - 2 letter weekday abbreviation (e.g. 'M', 'Th')
 *
 *      DD = 2 digit day, with leading 0
 *      D = 1 - 2 digit day, no leading 0
 *
 *      hhhh = 24 hour time, leading 0
 *      hhh = 24 hour time, no leading 0
 *      hh = 12 hour time, leading 0
 *      h  = 12 hour time, no leading 0
 *
 *      mm = minutes with leading 0
 *      m = minutes without leading 0
 *
 *      ss = seconds with leading 0
 *      s  = seconds witout leading 0
 *
 *      .sss = milliseconds (includes the .)
 *      .ss` = 1/100th seconds (includes the .)
 *      .s   = 1/10th seconds (includes the .)
 *
 *      ++ = AM/PM notation (upper case)
 *      -- = am/pm (lower case)
 *      -+ - PM only (upper case)
 *      +- = PM only (lower case)
 *      -? = a/p (lower case)
 *      +? = A/P (upper case)
 *
 *      x = milliseconds (as an integer without a period)
 *
 *      j = javascript standard millisecond timestamp
 *      u = unix standard second timestamp
 *
 *      all other characters are kept in place for format display. Do not use format characters elsewhere.
 */
export class SimpleDateFormat {

    private format:string = 'MMM DD YYY hh:mm:ss.sss ++ (UTC)'
    private locale:string;
    private tzCast:string;
    private workingDate:Date;
    private mo:number;
    private wd:number;
    private dy:number;
    private yr:number;
    private hr:number;
    private mn:number;
    private ss:number;
    private ms:number;
    private tz:number;
    private jts:number;
    private uts:number;

    constructor(dtIn) {
        let workingDate;
        if (dtIn instanceof Date) {
            workingDate = dtIn;
        } else {
            workingDate = dtIn ? new Date(dtIn) : new Date()
        }
        this.setWorkingDate(workingDate)
    }
    setWorkingDate(workingDate) {
        this.workingDate = workingDate
        this.mo = workingDate.getUTCMonth() + 1
        this.wd = workingDate.getUTCDay();
        this.dy = workingDate.getUTCDate()
        this.yr = workingDate.getUTCFullYear()
        this.hr = workingDate.getUTCHours()
        this.mn = workingDate.getUTCMinutes()
        this.ss = workingDate.getUTCSeconds()
        this.ms = workingDate.getUTCMilliseconds()
        this.tz = workingDate.getTimezoneOffset()
        this.jts = workingDate.getTime()
        this.uts = Math.floor(this.jts/1000)
    }

    // set the format template to use
    setFormat(fmt:string) {
        this.format = fmt;
    }
    setLocale(locale:string = '') {
        if(locale.toLowerCase().trim() === 'default') locale = ''
        let invalid = false
        if(locale) {
            let lc = locale.split('-')
            let ln = (lc[0] && lc[0].trim().length) || 0
            if(lc[0] !== 'u') { // unicode extension without specifying locale
                if (ln !== 2 && ln !== 3) {
                   invalid = true
                }
            }
            ln = (lc[1] && lc[1].trim().length) || 0
            if (ln !== 0 && ln !== 2) {
                invalid = true
            }
            if (invalid) {
                throw Error('Invalid Locale ' + locale)
            }
            if(lc[0] === 'u') {
                locale = sysloc+'-'+locale
            }

            this.locale = locale
            const stats:LoadStats = i18n.setLocale(locale)
            if(!stats.languageFiles  && !stats.regionFiles && !stats.commonRegionFiles) {
                throw Error('No Locale files loaded for '+locale)
            }
        }
    }
    setTimezoneCast(tzCast:string) {
        this.tzCast = tzCast
    }
    toIntlString() {
        let fmt = this.format
        let tzr = this.tzCast
        if(!tzr || tzr.toLowerCase() === 'utc') tzr = 'UTC'
        let timeZone
        if(tzr === 'UTC') timeZone = 'UTC'
        else if(tzr) {
            let tzes = findTimezones(tzr)
            let tze = pickTimezone(tzr, tzes)
            if(tze && tze.anchor) {
                timeZone = tze.anchor.replace(/ /g, '_')
            }
        }
        let [dateStyle, timeStyle] = fmt.split('-')
        if(!timeStyle) timeStyle = dateStyle
        if(dateStyle === 'none') dateStyle = undefined
        if(timeStyle === 'none') timeStyle = undefined
            let opts:DateTimeFormatOptions
        opts = {dateStyle, timeStyle, timeZone} as DateTimeFormatOptions // need to force cast? (bad .d?)

        if(!dateStyle && !timeStyle) return "" // none-none passed

        const dtf = new IDTF(this.locale, opts)
        return dtf.format(this.workingDate)
    }
    // read the template and format values
    toString() {
        // use pure IDTF
        if(useIntl()) {
            if(this.format.indexOf('full') !== -1
            || this.format.indexOf('long') !== -1
            || this.format.indexOf('medium') !== -1
            || this.format.indexOf('short') !== -1
            || this.format.indexOf('none') !== -1 ) {
                return this.toIntlString()
            }
        }

        // handle timezone cast for non-intl context
        let fmt = this.format
        let tzDisp = ''
        let tzName = 'UTC', tzOffset = 0
        let tzr = this.tzCast
        if(tzr) {
            let blocks = findTimezoneBlocks(tzr, this.workingDate)
            let block = pickTimezoneBlock(tzr, blocks)
            if(block) {
                tzName = block.city.replace(/_/g, ' ')
                tzDisp = block.abbr
                tzOffset = -block.offset
                if(block.abbr === 'GMT') tzOffset = 0 // TODO: Fix Table

                let adjtime = tzOffset * 60 * 1000
                this.workingDate.setTime(this.workingDate.getTime() + adjtime) // offset so the UTC values match the cast TZ
                this.setWorkingDate(this.workingDate)
            }
        }

        // use IDTF for format parts
        const opts:DateTimeFormatOptions = {
            timeZone: tzName && tzName.replace(/ /g, '_'),
            dateStyle: 'full',
            timeStyle: 'long'
        }

        let longParts = []
        let medParts = []
        let shortParts = []
        if(useIntl()) {
            let dtf = new IDTF(this.locale, opts)
            longParts = (dtf as any).formatToParts(this.workingDate)
            opts.dateStyle = opts.timeStyle = 'short'
            dtf = new IDTF(this.locale, opts)
            shortParts = (dtf as any).formatToParts(this.workingDate)
            opts.dateStyle = opts.timeStyle = 'medium'
            dtf = new IDTF(this.locale, opts)
            medParts = (dtf as any).formatToParts(this.workingDate)
        }

        const getFormatPart = (key:string, type:string):string => {
            const list = type === 'short' ? shortParts : type== 'long' ? longParts : medParts
            for(let i=0; i<list.length; i++) {
                let p = list[i]
                if(p.type === key) {
                    return p.value
                }
            }
        }

        if(this.format.indexOf('full') !== -1
            || this.format.indexOf('long') !== -1
            || this.format.indexOf('medium') !== -1
            || this.format.indexOf('short') !== -1
            || this.format.indexOf('none') !== -1 ) {

            let [dateStyle, timeStyle] = fmt.split('-')
            if (!timeStyle) timeStyle = dateStyle
            const isUtc = this.tzCast && this.tzCast.toLowerCase() === 'utc'
            fmt = i18nFormatByStyle(this.locale, dateStyle, timeStyle,isUtc, dateStyle === 'short' ? ' ' : ' at ')
        }
        let out = fmt

        let tzStyle
        if(fmt.indexOf('Z') !== -1) {
            tzStyle = 'long'
        }
        if(fmt.indexOf('z') !== -1) {
            tzStyle = 'short'
        }

        // use Intl to get timezone
        if(!tzDisp || tzStyle === 'long' || tzDisp.toLowerCase() === 'local') {
            if (tzName === 'UTC') {
                // // do the opposite of the other fix-up here
                // let gmtName = 'GMT'
                // if( tzStyle === 'full') gmtName = 'Greenwich Mean Time'
                // if( tzStyle === 'short') gmtName = ''
                tzDisp = 'Greenwich Mean Time' // this gets fixed later for UTC
            } else {
                try {
                    if (tzStyle && useIntl()) {
                        let opts = {
                            timeZone: tzName,
                            timeZoneName: tzStyle
                        }
                        let dtf = new IDTF(this.locale, opts)
                        let dstr = dtf.format(this.workingDate)
                        tzDisp = dstr.substring(dstr.lastIndexOf(',') + 2)
                    } else {
                        tzDisp = i18nTimezone(this.locale, tzName, tzStyle, this.workingDate)
                    }
                } catch (e) {
                    console.warn('Error w/ tzDisp ', e)
                }
            }
        }


        const thisYear = new Date().getFullYear()
        // set the year
        let yril = getFormatPart('relatedYear', 'long')
        let yris = getFormatPart('relatedYear', 'short')
        let yr4 = yril || ''+this.yr;
        let yr3 = yril || thisYear === this.yr ? '' : yr4;
        let yr2 = yris || yr4.substring(2)
        let yr1 = yris || thisYear === this.yr ? '' : yr2;
        let n = 0;
        while ((n = out.indexOf('YYYY', n)) !== -1) {
            out = out.replace('YYYY', yr4)
            n += yr4.length;
        }
        n = 0;
        while ((n = out.indexOf('YYY', n)) !== -1) {
            out = out.replace('YYY', yr3)
            n += yr3.length;
        }
        n = 0;
        while ((n = out.indexOf('YY', n)) !== -1) {
            out = out.replace('YY', yr2)
            n += yr2.length;
        }
        n = 0;
        while ((n = out.indexOf('Y', n)) !== -1) {
            out = out.replace('Y', yr1)
            n += yr1.length;
        }
        // set the date
        let dyil = '' //getFormatPart('day', 'long')
        let dyis = '' //getFormatPart('day', 'short')

        let dy2 = dyil || this.dy < 10 ? '0'+this.dy : ''+this.dy
        let dy1 = dyis || '' + this.dy
        n = 0;
        while ((n = out.indexOf('DD', n)) !== -1) {
            out = out.replace('DD', dy2)
            n += dy2.length;
        }
        n = 0;
        while ((n = out.indexOf('D', n)) !== -1) {
            out = out.replace('D', dy1)
            n += dy1.length;
        }
        // set the hour
        let hril = '' // getFormatPart('hour', 'long')
        let hris = '' // getFormatPart('hour','short')
        let hr4 = hril || this.hr < 10 ? '0'+this.hr : ''+this.hr;
        let hr3 = hril || ''+this.hr;
        let hr1 = hris || this.hr > 12 ? this.hr - 12 : this.hr == 0 ? 12 : this.hr
        let hr2 = hris || hr1 < 10 ? '0' + hr1 : ''+hr1;
        let hour12 = false;
        n = 0;
        while ((n = out.indexOf('hhhh', n)) !== -1) {
            out = out.replace('hhhh', hr4)
            n += hr4.length;
        }
        n = 0;
        while ((n = out.indexOf('hhh', n)) !== -1) {
            out = out.replace('hhh', hr3)
            n += hr3.length;
        }
        n = 0;
        while ((n = out.indexOf('hh', n)) !== -1) {
            out = out.replace('hh', hr2)
            n += hr2.length;
            hour12 = true;
        }
        n = 0;
        while ((n = out.indexOf('h', n)) !== -1) {
            out = out.replace('h', ''+hr1)
            n += (''+hr1).length;
            hour12 = true;
        }
        // do minutes
        let mnil = ''//getFormatPart('minute', 'long')
        let mnis = ''//getFormatPart('minute', 'short')
        let mn2 = mnil || this.mn < 10 ? '0'+this.mn : ''+this.mn;
        let mn1 = mnis || ''+this.mn;
        n = 0;
        while ((n = out.indexOf('mm', n)) !== -1) {
            out = out.replace('mm', mn2)
            n += mn2.length;
        }
        n = 0;
        while ((n = out.indexOf('m', n)) !== -1) {
            out = out.replace('m', ''+mn1)
            n += mn1.length;
        }

        // do milliseconds first
        let msil = '' //getFormatPart('fractionalSecond', 'long')
        let msis = '' //getFormatPart('fractionalSecond', 'short')
        let mss;
        if (this.ms < 10) {
            mss = '00'+ this.ms; //009
        } else if(this.ms < 100) {
            mss = '0' + this.ms; //099
        } else {
            mss = ''+this.ms; //999
        }
        while ((n = out.indexOf('x')) !== -1) {
            out = out.replace('x', mss)
            n += mss.length;
        }

        while ((n = out.indexOf('.sss')) !== -1) {
            out = out.replace('.sss', '.'+(msil||mss))
            n += mss.length+1;
        }

        let hnd = mss.substring(0,2)
        while ((n = out.indexOf('.ss')) !== -1) {
            out = out.replace('.ss', '.'+(msis||hnd))
            n += hnd.length+1;
        }
        let tnth = mss.substring(1)
        while ((n = out.indexOf('.s')) !== -1) {
            out = out.replace('.s', '.'+(msis||tnth))
            n += tnth.length+1;
        }
        // do seconds
        let sil = '' //getFormatPart('second', 'long')
        let sis = '' //getFormatPart('second', 'short')
        let ss2 = sil || this.ss < 10 ? '0'+this.ss : ''+this.ss;
        let ss1 = sis || ''+this.ss;
        n = 0;
        while ((n = out.indexOf('ss', n)) !== -1) {
            out = out.replace('ss', ss2)
            n += ss2.length;
        }
        n = 0;
        while ((n = out.indexOf('s', n)) !== -1) {
            out = out.replace('s', ''+ss1)
            n += ss1.length;
        }

        // then timestamps
        let jts = ''+this.jts;
        let uts = ''+this.uts;
        n = 0;
        while ((n = out.indexOf('j', n)) !== -1) {
            out = out.replace('j', ''+jts)
            n += jts.length;
        }
        n = 0;
        while ((n = out.indexOf('u', n)) !== -1) {
            out = out.replace('u', ''+uts)
            n += uts.length;
        }

        // set the month
        let mil = getFormatPart('month', 'long')
        let mim = getFormatPart('month', 'medium')
        let mis = getFormatPart('month', 'short')
        let mo4 = mil || i18nMonth(this.locale, this.mo, 'long')
        let mo3 = mim || i18nMonth(this.locale, this.mo, 'medium')
        let mo2 = mis || this.mo < 10 ? '0'+this.mo : ''+this.mo
        let mo1 = mis || ''+ this.mo
        n = 0;
        let nn = 0;
        while ((nn = out.indexOf('MMMM', n)) !== -1) {
            out = out.replace('MMMM', mo4)
            nn += mo4.length;
            n = nn;
        }
        while ((nn = out.indexOf('MMM', n)) !== -1) {
            out = out.replace('MMM', mo3)
            nn += mo3.length;
            n = nn;
        }
        while ((nn = out.indexOf('MM', n)) !== -1) {
            out = out.replace('MM', mo2)
            nn += mo2.length;
            n = nn;
        }
        while ((nn = out.indexOf('M', n)) !== -1) {
            out = out.replace('M', mo1)
            nn += mo1.length;
            n = nn;
        }
        // set the weekday
        let wil = getFormatPart('weekday', 'long')
        let wim = getFormatPart('weekday', 'medium') || wil
        let wis = getFormatPart('weekday', 'short')

        let wd4 = wil || i18nWeekday(this.locale, this.wd, 'long')
        let wd3 = wim || i18nWeekday(this.locale, this.wd, 'medium')
        let wd2 = wis || i18nWeekday(this.locale, this.wd, 'short')
        let wd1 = wis || i18nWeekday(this.locale, this.wd, 'shortest')

        n = 0;
        nn = 0;
        while ((nn = out.indexOf('WWWW', n)) !== -1) {
            out = out.replace('WWWW', wd4)
            nn += wd4.length;
            n = nn;
        }
        while ((nn = out.indexOf('WWW', n)) !== -1) {
            out = out.replace('WWW', wd3)
            nn += wd3.length;
            n = nn;
        }
        while ((nn = out.indexOf('WW', n)) !== -1) {
            out = out.replace('WW', wd2)
            nn += wd2.length;
            n = nn;
        }
        while ((nn = out.indexOf('W', n)) !== -1) {
            out = out.replace('W', wd1)
            nn += wd1.length;
            n = nn;
        }

        // timezone
        let z = tzStyle === 'long' ? 'Z' : 'z'

        if(tzDisp) {
            let n = 0;
            while ((n = out.indexOf(z, n)) !== -1) {
                if(!out.charAt(n+1) || out.charAt(n+1).toLowerCase() === out.charAt(n+1).toUpperCase()) {
                    out = out.replace(z, tzDisp)
                    n += tzDisp.length;
                } else n++
            }
        }

        // do AM/PM
        i18n.setLocale(this.locale)
        let ampm = this.hr >= 12 ? i18n.getLocaleString('time.pm.lowercase', 'pm') : i18n.getLocaleString('time.am.lowercase', 'am');
        let pm = this.hr >= 12 ? i18n.getLocaleString('time.pm.lowercase', 'pm') : '';

        let AMPM = this.hr >= 12 ? i18n.getLocaleString('time.pm', 'PM') : i18n.getLocaleString('time.am', 'AM');
        let PM = this.hr >= 12 ? i18n.getLocaleString('time.pm', 'PM') : '';


        if(!ampm && out.indexOf(' --') !== -1) {
            out = out.replace(' --', '--')
        }
        while ((n = out.indexOf('--')) !== -1) {
            out = out.replace('--', ampm)
            n += ampm.length;
        }
        if(!AMPM && out.indexOf(' ++') !== -1) {
            out = out.replace(' ++', '++')
        }
        while ((n = out.indexOf('++')) !== -1) {
            out = out.replace('++', AMPM)
            n += ampm.length;
        }
        if(!pm && out.indexOf(' +-') !== -1) {
            out = out.replace(' +-', '+-')
        }
        while ((n = out.indexOf('+-')) !== -1) {
            out = out.replace('+-', pm)
            n += ampm.length;
        }
        if(!pm && out.indexOf(' -+') !== -1) {
            out = out.replace(' -+', '-+')
        }
        while ((n = out.indexOf('-+')) !== -1) {
            out = out.replace('-+', PM)
            n += ampm.length;
        }
        // if(!pm && out.indexOf(' -?') !== -1) {
        //     out = out.replace(' -?', '-?')
        // }
        while ((n = out.indexOf('-?')) !== -1) {
            out = out.replace('-?', ampm.charAt(0))
            n += ampm.length;
        }
        // if(!pm && out.indexOf(' +?') !== -1) {
        //     out = out.replace(' +?', '+?')
        // }
        if ((n = out.indexOf('+?')) !== -1) {
            out = out.replace('+?', AMPM.charAt(0))
            n += ampm.length;
        }

        return out;
    }
}

//-------------

/**
 * Picks from the timezone list.
 * Note: probably unnecessary at this point; it is already
 * somewhat redundant to findTimezone.
 * @param tz
 * @param entries
 *
 * @private
 */
function pickTimezone(tz, entries) {
    let bestEntry
    let tzu = tz.toUpperCase()
    let tzl = tz.toLowerCase()
    if(tzu === 'UTC') {
        tzu = 'GMT'
        tzl = 'gmt'
    }
    for(let i=0; i<entries.length; i++) {
        const tze = entries[i]
        let anchor = tze.anchor
        if(anchor) {
            let city = anchor.substring(anchor.indexOf('/') + 1)
            if (anchor.toLowerCase() === tzl || city.toLowerCase() === tzl) {
                return tze
            }
        }
        let sabbr = tze.standard && tze.standard.abbr && tze.standard.abbr.toUpperCase()
        let dabbr = tze.daylight && tze.daylight.abbr && tze.daylight.abbr.toUpperCase()
        if(sabbr === tzu || dabbr === tzu) {
            bestEntry = tze
            if(tze.shortHand && tze.shortHand.toUpperCase() === tzu) {
                return tze
            }
        }
    }
    return bestEntry
}
function pickTimezoneBlock(tz, blocks) {
    let bestBlock
    const tzu = tz.toUpperCase()
    const tzl = tz.toLowerCase()
    for(let i=0; i<blocks.length; i++) {
        const block = blocks[i]
        let anchor = block.city
        if(anchor) {
            let city = anchor.substring(anchor.indexOf('/') + 1)
            if (anchor.toLowerCase() === tzl || city.toLowerCase() === tzl) {
                bestBlock = block
                if(findTimezones(anchor)[0].shortHand === tzu) return block
            }
        }

        if(findTimezones(anchor)[0].shortHand === tzu) return block

        if(block.abbr && block.abbr.toUpperCase() === tzu) {
            bestBlock = block
        }
    }
    return bestBlock
}

/**
 * Adjust the current time by interval of years
 * @param v
 *
 * @private
 */
function yearMark(v, top=false) {
    const dt = new Date()
    dt.setUTCFullYear(dt.getUTCFullYear()+v)
    if(top) {
        dt.setUTCMonth(0)
        dt.setUTCDate(1)
    }
    dt.setUTCHours(0,0,0,0)
    return dt.getTime()
}

const daysInMonth = [31,28,31,30,31,30,31,31,30,31,30,31]
/**
 * Adjust the current time by interval of months
 * where (n) is the month relative to current month.
 * by setting to the current date in month (n).
 * If the current date in month (n) is invalid,
 * set the date to 4 weeks ahead/back from the current date instead
 * (per setDate)
 * @param v
 *
 * @private
 */
function monthMark(v, top=false) {
    let dt = new Date()
    let curMo = dt.getUTCMonth()
    let newMo = curMo + v
    let date = dt.getUTCDate()
    if(date > daysInMonth[newMo]) {
        date += v*28
        newMo = curMo
    }
    if(newMo < 0 || newMo > 11) {
        let yo = /*newMo < 0 ? Math.ceil(newMo/12) :*/ Math.floor(newMo/12)
        dt = new Date(yearMark(yo))
        if(newMo < 0) newMo += 12
        newMo = newMo % 12
    }
    dt.setUTCMonth(newMo)
    dt.setUTCDate(top?1:date)
     dt.setUTCHours(0,0,0,0)

    return dt.getTime()
}

/**
 * Adjust date/time by a relative number of weeks
 * @param v
 *
 * @private
 */
function weekMark(v, top=false) {
    const dt = new Date()
    let date = dt.getUTCDate()
    if(top) {
        let wd = dt.getUTCDay()
        date -= wd
    }
    dt.setUTCDate(date + v * 7) // see spec for setDate.  this should do what we want to reconcile dates
    dt.setUTCHours(0,0,0,0)
    return dt.getTime()
}
/**
 * Adjust date/time by a relative number of days
 * @param v
 *
 * @private
 */
function dayMark(v) {
    const dt = new Date()
    let date = dt.getUTCDate()
    dt.setUTCDate(date + v) // see spec for setDate.  this should do what we want to reconcile dates
    let off = dt.getTimezoneOffset()
    dt.setUTCHours(0,0,0,0)
    return dt.getTime()
}
/**
 * set time to top of current hour
 * @param v
 *
 * @private
 */
function hourMark(v) {
    const dt = new Date()
    let hr = dt.getUTCHours()
    dt.setUTCHours(hr,0,0,0)
    return dt.getTime()
}
/**
 * set time to top of current minute
 * @param v
 *
 * @private
 */
function minuteMark(v) {
    const dt = new Date()
    let hr = dt.getUTCHours()
    let mn = dt.getUTCMinutes()
    dt.setUTCHours(hr, mn,0,0)
    return dt.getTime()
}
/**
 * set time to top of current second
 * @param v
 *
 * @private
 */
function secondMark(v) {
    const dt = new Date()
    let hr = dt.getUTCHours()
    let mn = dt.getUTCMinutes()
    let sc = dt.getUTCSeconds()
    dt.setUTCHours(hr, mn, sc,0)
    return dt.getTime()
}

/**
 * Parse the string for @ hh:mm:ss.sss am/pm time specifier
 * and return the time offset (milliseconds) from midnight this time represents
 *
 * no time spec results in the current time offset from midnight
 *
 * @param str
 *
 * @private
 */
function parseTimeArg(str) {
    let hr = 0, mn = 0, sn = 0
    let isAm = false, isPm = false
    let timeset = 0
    let pi = str.indexOf('@')
    if(pi !== -1) {
        try {
            let tmstr = str.substring(pi + 1).trim().toLowerCase()

            let ai = tmstr.lastIndexOf('m')
            let se = ai - 1
            if (ai !== -1) {
                if (tmstr.charAt(se) === 'a') {
                    isAm = true
                }
                if (tmstr.charAt(se) === 'p') {
                    isPm = true
                }
            }
            if(se < 0) se = tmstr.length;
            let hi = tmstr.indexOf(':')
            if(hi === -1) hi = se
            let hs = tmstr.substring(0, hi)
            hr = parseInt(hs)
            let mi = tmstr.indexOf(':', hi + 1)
            if (mi === -1) mi = se
            let ms = tmstr.substring(hi + 1, mi)
            mn = parseInt(ms)

            if (se > mi) {
                let ss = tmstr.substring(mi + 1, se)
                sn = parseInt(ss)
            }
        } catch(e) {
            console.warn(`parse error on time spec; no time applied: ${str.substring(pi)}`)
        }
        if(isPm && hr < 12) hr += 12
        if(isAm && hr == 12) hr = 0
    } else {
        let now = new Date()
        hr = now.getUTCHours()
        mn = now.getUTCMinutes()
        sn = now.getUTCSeconds() + now.getUTCMilliseconds() / 1000
    }

    return hr * 3600000 + mn * 60000 + sn * 1000

}

/**
 * Find the referenced weekday in a string such as 'last Tuesday' or 'next Th'
 * @param str
 *
 * @private
 */
function findWeekdayName(str) {
    let si = str.indexOf(' ')
    if(si !== -1) {
        let se = str.indexOf('@', si)
        if(se === -1) se = str.length
        let wkdName = str.substring(si, se).trim().toLowerCase()
        for(let i=0; i<weekdays.length; i++) {
            let fn = weekdays[i].toLowerCase()
            let a1 = weekdayAbbrs[i].toLowerCase()
            let a2 = weekdayAbbr2[i].toLowerCase()
            let a3 = weekdayAbbr3[i].toLowerCase()
            if (wkdName === fn || wkdName === a1 || wkdName === a2 || wkdName === a3) {
                return i
            }
        }
    }
}

/**
 * Move to the last occurrence of the given weekday prior to the current day
 * @param wd
 * @param midnight
 *
 * @private
 */
function lastWeekday(wd, midnight) {
    let ndt = new Date()
    let nwd = ndt.getUTCDay()
    let wm = 0
    if(wd >= nwd) {
        wm = -1
    }
    let dt = new Date(weekMark(wm, true)) // reset to sunday of this week or last week
    dt.setUTCDate(dt.getUTCDate()+wd) // move forward to selected day
    return dt.getTime()
}

/**
 * Move forward to the next occurrence of the given weekday
 * @param wd
 * @param midnight
 *
 * @private
 */
function nextWeekday(wd) {
    let ndt = new Date()
    let nwd = ndt.getUTCDay()
    let wm = 0
    if(wd <= nwd) {
        wm = 1
    }
    let dt = new Date(weekMark(wm, true)) // reset to sunday of this week or next week
    dt.setUTCDate(dt.getUTCDate()+wd) // move forward to selected day
    return dt.getTime()
}

/**
 * move forward or back to to named weekday within the current week
 * @param wd
 * @param midnight
 *
 * @private
 */
function thisWeekday(wd) {
    let dt = new Date(weekMark(0, true)) // reset to sunday of this week or next week
    dt.setUTCDate(dt.getUTCDate()+wd) // move forward to selected day
    return dt.getTime()
}

function i18nMonth(locale, mn, style) {
    if(!locale) locale = sysloc
    i18n.setLocale(locale)
    if(style === 'medium') style = 'short'
    let ikey = `date.month.${mn}.${style}`
    // lookup this key in the tables
    let value = i18n.getLocaleString(ikey, '', true)
    if(!value) {
        // fallback to hard-coded en-US
        value = style === 'long' ? months[mn] : monthAbbr[mn]
    }
    return value
}
function i18nWeekday(locale, wd, style) {
    if(!locale) locale = sysloc
    i18n.setLocale(locale)
    if(style === 'medium') style = 'long'
    let ikey = `date.weekday.${wd}.${style}`
    // lookup this key in the tables
    let value = i18n.getLocaleString(ikey, '', true)
    if(!value) {
        // fallback to hard-coded en-US
        value = style === 'long' ? weekdays[wd] : style === 'medium' ? weekdayAbbrs[wd] : weekdayAbbrs[wd]//weekdayAbbr2[wd]
    }
    return value
}

function i18nTimezone(locale, tzName, style, dt) {
    if(!locale) locale = sysloc
    i18n.setLocale(locale)
    let blocks = findTimezoneBlocks(tzName, dt)
    let block = pickTimezoneBlock(tzName, blocks)
    let value = style === 'long' ? 'Greenwich Mean Time' : 'GMT'
    if(block) {
        let abbr = block.abbr
        let name = block.name
        value = i18n.getLocaleString(`date.format.timezone.${abbr}.${style}`, style === 'long' ? name : abbr)
    }
    return value;
}

function useIntl() {
    return IDTF && getUseIntlChoice()
}
