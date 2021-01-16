import {IFormatHandler, SpecParts, IncompatibleValueType} from "../Formatter";
import DateTimeFormatOptions = Intl.DateTimeFormatOptions;
import {findTimezone,TimezoneEntry, TimezoneDetail} from './Timezone'

const IDTF = Intl && Intl.DateTimeFormat


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
 * For an invalid value passed to the formatter
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

export default class DateFormatter implements IFormatHandler {

    format(specParts: SpecParts, value: any): string {
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
            let at = keyword.indexOf('@') !== -1; // at is true if we have a time offset to apply
            if(keyword.indexOf('today') !== -1) {
                timestamp = dayMark(0 , true) // midnight on this day
                timestamp += parseTimeArg(keyword) // or set the time within the day (default current time)
            }
            if(keyword.indexOf('tomorrow') !== -1) {
                timestamp = dayMark(1, at)              // midnight tomorrow
                if(at) timestamp += parseTimeArg(keyword)  // set the time (default current time) (0) for midnight

            }
            if(keyword.indexOf('yesterday') !== -1) {
                timestamp = dayMark(-1, at)             // midnight yesterday
                if(at) timestamp += parseTimeArg(keyword)  // set the time
            }
            if(keyword.indexOf('next') !== -1) {
                if(keyword.indexOf('week') !== -1) {
                    timestamp = weekMark(1, at)              // midnight next week at this time
                    if(at) timestamp += parseTimeArg(keyword)  // set the time
                }
                if(keyword.indexOf('month') !== -1) {
                    timestamp = monthMark(1, at)            // this date next month, or else 4 weeks at midnight
                    if(at) timestamp += parseTimeArg(keyword)  // set the time
                }
                if(keyword.indexOf('year') !== -1) {
                    timestamp = yearMark(1, at)             // this date next year at midnight
                    if(at) timestamp += parseTimeArg(keyword)  // set the time
                }
                // weekday names
                let wkd = findWeekdayName(keyword)
                if(wkd !== undefined) {
                    timestamp = nextWeekday(wkd, at)
                    if(at) timestamp += parseTimeArg(keyword)  // set the time
                }
            }
            if(keyword.indexOf('last') !== -1) {
                if(keyword.indexOf('week') !== -1) {
                    timestamp = weekMark(-1, at)             // last week at midnight
                    if(at) timestamp += parseTimeArg(keyword) // set the time
                }
                if(keyword.indexOf('month') !== -1) {
                    timestamp = monthMark(-1, at)          // this date last month, or else 4 weeks ago at midnight
                    if(at) timestamp += parseTimeArg(keyword) // set the time
                }
                if(keyword.indexOf('year') !== -1) {
                    timestamp = yearMark(-1, at)          // this date last year, at midnight
                    if(at) timestamp += parseTimeArg(keyword) // set the time
                }
                // weekday names
                let wkd = findWeekdayName(keyword)
                if(wkd !== undefined) {
                    timestamp = lastWeekday(wkd, at)
                    if(at) timestamp += parseTimeArg(keyword)  // set the time
                }
            }
            if(keyword.indexOf('this') !== -1) {
                if(keyword.indexOf('day') !== -1) { // same as today
                    timestamp = dayMark(0, true)
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
                    timestamp = weekMark(0, true, true)
                    if(at) timestamp += parseTimeArg(keyword)
                }
                if(keyword.indexOf('month') !== -1) { // Midnight on first of current month
                    timestamp = monthMark(0, true, true)
                    if(at) timestamp += parseTimeArg(keyword)
                }
                if(keyword.indexOf('year') !== -1) { // Midnight 01/01 of current year
                    timestamp = yearMark(0, true, true)
                    if(at) timestamp += parseTimeArg(keyword)
                }
                let wkd = findWeekdayName(keyword)
                if(wkd !== undefined) {
                    timestamp = thisWeekday(wkd, at)
                    if(at) timestamp += parseTimeArg(keyword)  // set the time
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
        let tzCast = '' // UTC is the default
        if(hints) {
            if (hints.length > 1) {
                throw RangeError('Unsupported number of hints')
            }
            tzCast = hints[0]
        }

        let sdf = new SimpleDateFormat(timestamp)
        sdf.setFormat(specParts.format)
        sdf.setLocale(specParts.locale)
        sdf.setTimezoneCast(tzCast)
        return sdf.toString()
    }
}


const months = ['--', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const monthAbbr = ['--', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const weekdayAbbrs = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const weekdayAbbr2 = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const weekdayAbbr3 = ['S', 'M', 'T', 'W', 'Th', 'F', 'Sa']

/**
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
 *      m = minutes with leading 0
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
    setLocale(locale:string) {
        this.locale = locale
    }
    setTimezoneCast(tzCast:string) {
        this.tzCast = tzCast
    }
    useIntl() {
        if(IDTF) {
            if(this.format.indexOf('full') !== -1
            || this.format.indexOf('long') !== -1
            || this.format.indexOf('medium') !== -1
            || this.format.indexOf('short') !== -1) {
                return true
            }
        }
        return false
    }
    toIntlString() {
        let fmt = this.format
        let tzr = this.tzCast
        let timeZone
        if(tzr) {
            let tzes = findTimezone(tzr)
            let n = 0
            let tze = tzes[n]
            timeZone = tze.anchor.replace(/ /g,'_')
        }
        let [dateStyle, timeStyle] = fmt.split('-')
        let opts:DateTimeFormatOptions
        opts = {dateStyle, timeStyle, timeZone} as DateTimeFormatOptions // need to force cast? (bad .d?)
        const dtf = new IDTF(this.locale, opts)
        return dtf.format(this.workingDate)
    }
    // read the template and format values
    toString() {
        if(this.useIntl()) return this.toIntlString()
        // handle timezone cast for non-intl context
        let fmt = this.format
        let tzName = 'UTC', tzOffset = 0
        let tzr = this.tzCast
        if(tzr) {
            let tzes = findTimezone(tzr)
            let n = 0
            let tze = tzes[n]
            if(tze) {
                tzName = tze.anchor
                tzOffset = -tze.standard.offset
                // timeZone = tze.anchor.replace(/ /g,'_')

                let adjtime = tzOffset * 60 * 1000
                this.workingDate.setTime(this.workingDate.getTime() + adjtime) // offset so the UTC values match the cast TZ
                this.setWorkingDate(this.workingDate)
            }
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
        let tzDisp = ''
        if(tzName === 'UTC') {
            tzDisp = tzStyle === 'short' ? 'UTC' : 'Universal Time'
        } else {
            try {
                if (IDTF && tzStyle) {
                    let opts = {
                        timeZone: tzName,
                        timeZoneName: tzStyle
                    }
                    let dtf = new IDTF(this.locale, opts)
                    let dstr = dtf.format(this.workingDate)
                    tzDisp = dstr.substring(dstr.lastIndexOf(',') + 2)
                }
            } catch (e) {

            }
        }
        const thisYear = new Date().getFullYear()
        // set the year
        let yr4 = ''+this.yr;
        let yr3 = thisYear === this.yr ? '' : yr4;
        let yr2 = yr4.substring(2)
        let yr1 = thisYear === this.yr ? '' : yr2;
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
        let dy2 = this.dy < 10 ? '0'+this.dy : ''+this.dy
        let dy1 = '' + this.dy
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
        let hr4 = this.hr < 10 ? '0'+this.hr : ''+this.hr;
        let hr3 = ''+this.hr;
        let hr1 = this.hr > 12 ? this.hr - 12 : this.hr == 0 ? 12 : this.hr
        let hr2 = hr1 < 10 ? '0' + hr1 : ''+hr1;
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
        let mn2 = this.mn < 10 ? '0'+this.mn : ''+this.mn;
        let mn1 = ''+this.mn;
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
            out = out.replace('.sss', '.'+mss)
            n += mss.length+1;
        }

        let hnd = mss.substring(0,2)
        while ((n = out.indexOf('.ss')) !== -1) {
            out = out.replace('.ss', '.'+hnd)
            n += hnd.length+1;
        }
        let tnth = mss.substring(1)
        while ((n = out.indexOf('.s')) !== -1) {
            out = out.replace('.s', '.'+tnth)
            n += tnth.length+1;
        }
        // do seconds
        let ss2 = this.ss < 10 ? '0'+this.ss : ''+this.ss;
        let ss1 = ''+this.ss;
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
        let mo4 = months[this.mo]
        let mo3 = monthAbbr[this.mo]
        let mo2 = this.mo < 10 ? '0'+this.mo : ''+this.mo
        let mo1 = ''+ this.mo
        n = 0;
        while ((n = out.indexOf('MMMM', n)) !== -1) {
            out = out.replace('MMMM', mo4)
            n += mo4.length;
        }
        n = 0;
        while ((n = out.indexOf('MMM', n)) !== -1) {
            out = out.replace('MMM', mo3)
            n += mo3.length;
        }
        n = 0;
        while ((n = out.indexOf('MM', n)) !== -1) {
            out = out.replace('MM', mo2)
            n += mo2.length;
        }
        n = 0;
        while ((n = out.indexOf('M', n)) !== -1) {
            out = out.replace('M', mo1)
            n += mo1.length;
        }
        // set the weekday
        let wd4 = weekdays[this.wd]
        let wd3 = weekdayAbbrs[this.wd]
        let wd2 = weekdayAbbr2[this.wd]
        let wd1 = weekdayAbbr3[this.wd]
        n = 0;
        while ((n = out.indexOf('WWWW', n)) !== -1) {
            out = out.replace('WWWW', wd4)
            n += wd4.length;
        }
        n = 0;
        while ((n = out.indexOf('WWW', n)) !== -1) {
            out = out.replace('WWW', wd3)
            n += wd3.length;
        }
        n = 0;
        while ((n = out.indexOf('WW', n)) !== -1) {
            out = out.replace('WW', wd2)
            n += wd2.length;
        }
        n = 0;
        while ((n = out.indexOf('W', n)) !== -1) {
            out = out.replace('W', wd1)
            n += wd1.length;
        }

        // timezone
        let z = tzStyle === 'long' ? 'Z' : 'z'

        if(tzDisp) {
            let n = 0;
            while ((n = out.indexOf(z, n)) !== -1) {
                out = out.replace(z, tzDisp)
                n += tzDisp.length;
            }
        }

        // do AM/PM
        let ampm = this.hr >= 12 ? 'pm' : 'am';
        let pm = this.hr >= 12 ? 'pm' : '';

        while ((n = out.indexOf('--')) !== -1) {
            out = out.replace('--', ampm)
            n += ampm.length;
        }
        while ((n = out.indexOf('++')) !== -1) {
            out = out.replace('++', ampm.toUpperCase())
            n += ampm.length;
        }
        while ((n = out.indexOf('+-')) !== -1) {
            out = out.replace('+-', pm)
            n += ampm.length;
        }
        while ((n = out.indexOf('-+')) !== -1) {
            out = out.replace('-+', pm.toUpperCase())
            n += ampm.length;
        }

        return out;
    }
}

//-------------

/**
 * Adjust the current time by interval of years
 * @param v
 */
function yearMark(v, midnight, top=false) {
    const dt = new Date()
    dt.setUTCFullYear(dt.getUTCFullYear()+v)
    if(top) {
        dt.setUTCMonth(0)
        dt.setUTCDate(1)
    }
    if(midnight) dt.setUTCHours(0,0,0,0)
    return dt.getTime()
}

/**
 * Adjust the current time by interval of months
 * where (n) is the month relative to current month.
 * by setting to the current date in month (n).
 * If the current date in month (n) is invalid,
 * set the date to 4 weeks ahead/back from the current date instead
 * (per setDate)
 * @param v
 */
function monthMark(v, midnight, top=false) {
    let dt = new Date()
    let curMo = dt.getUTCMonth()
    let newMo = curMo + v
    let date = dt.getUTCDate()
    if(newMo < 0 || newMo > 11) {
        let yo = /*newMo < 0 ? Math.ceil(newMo/12) :*/ Math.floor(newMo/12)
        dt = new Date(yearMark(yo, midnight))
        if(newMo < 0) newMo += 12
        newMo = newMo % 12
    }
    dt.setUTCMonth(newMo)
    dt.setUTCDate(top?1:date)
    if(midnight) dt.setUTCHours(0,0,0,0)

    return dt.getTime()
}

/**
 * Adjust date/time by a relative number of weeks
 * @param v
 */
function weekMark(v, midnight, top=false) {
    const dt = new Date()
    let date = dt.getDate()
    if(top) {
        let wd = dt.getUTCDay()
        date -= wd
    }
    dt.setUTCDate(date + v * 7) // see spec for setDate.  this should do what we want to reconcile dates
    if(midnight) dt.setUTCHours(0,0,0,0)
    return dt.getTime()
}
/**
 * Adjust date/time by a relative number of days
 * @param v
 */
function dayMark(v, midnight) {
    const dt = new Date()
    let date = dt.getUTCDate()
    dt.setUTCDate(date + v) // see spec for setDate.  this should do what we want to reconcile dates
    if(midnight) dt.setUTCHours(0,0,0,0)
    return dt.getTime()
}
/**
 * set time to top of current hour
 * @param v
 */
function hourMark(v) {
    const dt = new Date()
    let hr = dt.getUTCHours()
    dt.setUTCHours(hr, 0,0,0)
    return dt.getTime()
}
/**
 * set time to top of current minute
 * @param v
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
 */
function secondMark(v) {
    const dt = new Date()
    let hr = dt.getUTCHours()
    let mn = dt.getUTCMinutes()
    let sc = dt.getUTCSeconds()
    dt.setUTCHours(hr, mn,sc,0)
    return dt.getTime()
}

/**
 * Parse the string for @ hh:mm:ss.sss am/pm time specifier
 * and return the time offset (milliseconds) from midnight this time represents
 *
 * no time spec results in the current time offset from midnight
 *
 * @param str
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
    }

    return hr * 3600000 + mn * 60000 + sn * 1000

}

/**
 * Find the referenced weekday in a string such as 'last Tuesday' or 'next Th'
 * @param str
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

function lastWeekday(wd, midnight) {
    let ndt = new Date()
    let nwd = ndt.getUTCDay()
    let wm = 0
    if(wd >= nwd) {
        wm = -1
    }
    let dt = new Date(weekMark(wm, midnight, true)) // reset to sunday of this week or last week
    dt.setUTCDate(dt.getUTCDate()+wd) // move forward to selected day
    return dt.getTime()
}

function nextWeekday(wd, midnight) {
    let ndt = new Date()
    let nwd = ndt.getUTCDay()
    let wm = 0
    if(wd <= nwd) {
        wm = 1
    }
    let dt = new Date(weekMark(wm, midnight, true)) // reset to sunday of this week or next week
    dt.setUTCDate(dt.getUTCDate()+wd) // move forward to selected day
    return dt.getTime()
}

function thisWeekday(wd, midnight) {
    let dt = new Date(weekMark(0, midnight, true)) // reset to sunday of this week or next week
    dt.setUTCDate(dt.getUTCDate()+wd) // move forward to selected day
    return dt.getTime()
}