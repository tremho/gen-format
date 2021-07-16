import {IFormatHandler, SpecParts, formatV, IncompatibleValueType, getFileOps, getUseIntlChoice} from "../Formatter";
import F from '../Formatter'
import DateTimeFormatOptions = Intl.DateTimeFormatOptions;
import DateFormatter, {BadDateValue} from "./DateFormatter";
import {i18nFormatByStyle} from "./Shared";

import * as LocaleStringTables from "@tremho/locale-string-tables"

const sysloc = LocaleStringTables.getSystemLocale()

import i18n from '../i18n'
import {getSystemLocale} from "@tremho/locale-string-tables";

const IDTF = Intl && Intl.DateTimeFormat
// @ts-ignore
const IRTF = Intl && Intl.RelativeTimeFormat


let artificialNow = 0

/**
 * Complement to `setArtificialNow`, returns
 * the agreed upon current time
 *
 * @return {number} real or artificial current timestamp, in milliseconds
 */
export function getNow() {
    return artificialNow || Date.now()
}

/**
 * Set an artificial value for 'currentTime'.
 * Useful for debugging, or for setting up relative time scenarios
 * against a non-current context.
 * A string or number or Date suitable for a Date constructor
 * can be passed. Pass 0 or undefined to turn off.
 *
 * @param [datevalue] - a value suitable for a Date constructor, or none to turn off
 *
 */
export function setArtificialNow(datevalue) {
    if(!datevalue) artificialNow = 0
    if(typeof datevalue === 'number') {
        artificialNow = datevalue
    } else {
        artificialNow = new Date(datevalue).getTime()
    }
}

/**
 * DateRangeFormatter
 *
 * This is the _named handler_ for 'daterange' formatting.
 *
 * Evaluates the date format passed and uses this to group common aspects as implied by the given format
 * and then applies the group-separated formatting to the start and end dates of the range.
 * Uses `Intl` where appropriate and available.
 */
export default class DateRangeFormatter implements IFormatHandler {

    format(specParts: SpecParts, value: any): string {

        let out: string = ''
        if(Array.isArray(value)) {
            if(value.length !== 2) {
                throw BadDateValue('daterange must be an array of two Date, or date string, or date milllisecond values')
            }
       } else {
            // if we pass a single value, it is assumed to be a date and combined in range with 'now'
            if((typeof value === 'object' && value instanceof Date)
             || (typeof value === 'string' || typeof value === 'number')) {
                value = [value, 'now']
            } else {
                throw BadDateValue('daterange with one relative argument must be a Date, date string, or date milllisecond value')
            }
        }


        let [startDate, endDate] = value
        let endIsNow, startIsNow

        // if we use they 'now' keyword, default to current time
        if(typeof startDate === 'string' && startDate.trim().toLowerCase() === 'now') {
            startDate = getNow()
            startIsNow = true;
        }
        if(typeof endDate === 'string'  && endDate.trim().toLowerCase() === 'now') {
            endDate = getNow()
            endIsNow = true;
        }

        let dtStart = new Date(startDate)
        let dtEnd = new Date(endDate)

        let isDiff, isHuman, timeStyle

        let format = specParts.format

        if(format.indexOf('full') !== -1
            || format.indexOf('long') !== -1
            || format.indexOf('medium') !== -1
            || format.indexOf('short') !== -1
            || format.indexOf('human') !== -1
            || format.indexOf('none') !== -1 ) {

            let [dateStyle, tStyle] = format.split('-')
            timeStyle = tStyle
            if (!timeStyle) timeStyle = dateStyle
            const isUtc = false
            if(dateStyle === 'human') {
                dateStyle = 'long'
                isHuman = true
                isDiff = true
            }
            if(timeStyle === 'human') {
                timeStyle = 'full'
                isDiff = true
            }
            format = i18nFormatByStyle(specParts.locale, dateStyle, timeStyle,isUtc, ', ')
            // if we have a discrete format, timeStyle will not be part of format
            if(tStyle && tStyle.indexOf(':') !== -1) {
                format += timeStyle
            }
        }

        // TODO: we should be able to refactor out isDiff, as it is always true, no?

        // let hints = specParts.hints || []
        // let dhi = hints.indexOf('diff')
        // if(dhi !== -1) {
        //     hints = hints.splice(dhi, 1)
        //     isDiff = true
        // }

        let ti
        let dti = -1
        dti = ((ti = format.lastIndexOf('Y')) > dti) ? ti : dti
        dti = ((ti = format.lastIndexOf('M')) > dti) ? ti : dti
        dti = ((ti = format.lastIndexOf('D')) > dti) ? ti : dti
        dti = ((ti = format.lastIndexOf('W')) > dti) ? ti : dti

        let tti = -1
        tti = ((ti = format.lastIndexOf('h')) > tti) ? ti : tti
        tti = ((ti = format.lastIndexOf('h')) > tti) ? ti : tti
        tti = ((ti = format.lastIndexOf('m')) > tti) ? ti : tti
        tti = ((ti = format.lastIndexOf('s')) > tti) ? ti : tti
        tti = ((ti = format.lastIndexOf('-')) > tti) ? ti : tti
        tti = ((ti = format.lastIndexOf('+')) > tti) ? ti : tti

        if(tti === -1) {
            tti = dti+1
        }

        let zti = ((ti = format.lastIndexOf('z')) > tti) ? ti : -1
        zti = ((ti = format.lastIndexOf('Z')) > zti) ? ti : zti

        // extend zti forward to end of string or first pattern character
        if(zti !== -1) {
            while(zti < format.length) {
                let c = format.charAt(zti)
                if(c.match(/[MDYhms+-]/)) {
                    break;
                }
                zti++
            }
        }


        let dateLeft = (tti >= dti)

        let dateFmt, timeFmt
        if(dateLeft) {
            dateFmt = format.substring(0, dti + 1).trim()
            timeFmt = format.substring(dti + 1, tti + 1).trim()
        } else {
            dateFmt = format.substring(tti+1, dti+1).trim()
            timeFmt = format.substring(0, tti+1).trim()
        }

        const remove = (fmt, ltr) => {
            const re = new RegExp(ltr + '*'+ltr+'[^YMDhmszZ+-]*')
            return fmt.replace(re, '')
        }
        let postYear = (format.indexOf('Y') > format.indexOf('M'))

        if(timeFmt) postYear = false


        // timezones always on right
        let leftFormat = zti !==-1 ? format.substring(0, tti+1) : format
        let rightFormat = format

        let remMo = false
        if(dtStart.getUTCFullYear() === dtEnd.getFullYear()) {
            if (dateLeft && !postYear) {
                rightFormat = remove(rightFormat, 'Y')
            } else {
                leftFormat = remove(leftFormat, 'Y')
            }
            if(dtStart.getUTCMonth() === dtEnd.getUTCMonth()) {
                if(dtStart.getUTCDate() === dtEnd.getUTCDate()) {
                    if(timeFmt) {
                        if (dateLeft) {
                            rightFormat = remove(rightFormat, 'M')
                        } else {
                            leftFormat = remove(leftFormat, 'M')
                        }
                    }
                    if(dateLeft) {
                        if(rightFormat.indexOf('M') === -1) { // don't remove day if we have a month
                            rightFormat = remove(rightFormat, 'D')
                            rightFormat = remove(rightFormat, 'W')
                        }
                    } else {
                        if(leftFormat.indexOf('M') === -1) { // don't remove day if we have a month
                            leftFormat = remove(leftFormat, 'D')
                        }
                    }
                } else {
                    if(!timeFmt) {
                        if (dateLeft) {
                            rightFormat = remove(rightFormat, 'M')
                        } else {
                            leftFormat = remove(leftFormat, 'M')
                        }
                    }
                }
            }
        }

        const fmtchars = ['Y','M','D','H','V','h','m','s','-','+','z','Z']
        leftFormat = leftFormat.trim()
        let sep = i18n.getLocaleString('date.format.time.separator', '', true)
        // if(sep) leftFormat = leftFormat.replace(sep, ', ') // we use a comma in this form
        rightFormat = rightFormat.trim()
        let llc = leftFormat.charAt(leftFormat.length-1)
        if(fmtchars.indexOf(llc) === -1) {
            leftFormat = leftFormat.substring(0, leftFormat.length-1)
        }

        let dateFormatter = new DateFormatter()
        let spec = Object.assign({}, specParts) // copy
        // spec.hints = hints // pass any remaining hints not pulled above to the date formatter (i.e. timezone cast)
        spec.format = leftFormat || format
        let startStr = startIsNow ? i18n.getLocaleString('date.range.now','now') : dateFormatter.format(spec, dtStart)
        spec.format = rightFormat || format
        let endStr = endIsNow ? i18n.getLocaleString('date.range.now','now') : dateFormatter.format(spec, dtEnd)

        let stTime = dtStart.getTime()
        let endTime = dtEnd.getTime()

        if(endIsNow && isHuman) {
            let {datePart, isToday} =  fitRelativeDate(dtStart, specParts.locale)
            if(timeStyle === 'none') {
                return datePart
            }
            if(!isToday) {
                out = datePart
            }
            if(out) out += i18n.getLocaleString('date.range.time.separator',', ')
        }



        if(isDiff) {
            let ms = dtEnd.getTime() - dtStart.getTime()
            let dparts = getDurationParts(ms)
            out += fitRelativeTime(dparts, specParts.locale, spec, isHuman, timeStyle)
        } else {
            if(stTime === endTime) {
                // not a range if they are the same
                if(dateLeft) {
                    out = startStr
                } else {
                    out = endStr
                }
            } else {
                out = `${startStr} - ${endStr}`
            }
        }

        // NO need to use IDTF formatRange because it doesn't do anything we don't handle already.
        // that might be different if it had different treatments other than a '-' to depict range, but it seems not.
        // const opts = {
        //     dateStyle: 'short',
        //     timeStyle: 'short'
        // }
        // const dtf = new IDTF(specParts.locale, opts as DateTimeFormatOptions) // Bug: dateStyle is not declared as property. must force the cast
        // const bug = (dtf as any) // formatRange is not declared for DateTypeFormat. must force a cast to 'any'
        // out = bug.formatRange(dtStart, dtEnd)

        return out
    }
}

class DurationParts {
    public sign: number
    public years: number
    public months:number
    public weeks: number
    public days: number
    public hours:number
    public minutes: number
    public seconds: number
    public milliseconds: number
    public totalms:number
    
}

/**
 * Break down the interval into a DurationParts object that describes the span in graduated unite of time.
 * @param ms
 *
 * @private
 */
function getDurationParts(ms):DurationParts {

    let out = new DurationParts()

    const msPerSec = 1000
    const secPerMin = 60
    const minPerHr = 60
    const hrsPerDay = 24
    const dayPerWeek = 7
    const weeksPerMonth= 4
    const monthsPerYear = 12

    out.sign = ms < 0 ? -1 : 1
    ms = Math.abs(ms)
    out.totalms = ms
    out.seconds = Math.floor( ms/msPerSec)
    out.minutes = Math.floor(ms/(msPerSec * secPerMin))
    out.hours = Math.floor(ms/(msPerSec * secPerMin*minPerHr))
    out.days = Math.floor(ms/(msPerSec * secPerMin*minPerHr*hrsPerDay))
    out.weeks = Math.floor(ms/(msPerSec * secPerMin*minPerHr*hrsPerDay*dayPerWeek))
    out.months = Math.floor(ms/(msPerSec * secPerMin*minPerHr*hrsPerDay*dayPerWeek*weeksPerMonth))
    out.years = Math.floor(ms/(msPerSec * secPerMin*minPerHr*hrsPerDay*dayPerWeek*weeksPerMonth*monthsPerYear))
    out.milliseconds = ms - out.seconds*msPerSec
    out.seconds -= out.minutes*secPerMin
    out.minutes -= out.hours*minPerHr
    out.hours -= out.days*hrsPerDay
    out.days -= out.weeks*dayPerWeek
    out.weeks -= out.months*weeksPerMonth
    out.months -= out.years*monthsPerYear

    return out
}

/**
 * Break down the parts and structure a duration display in the proper semantics
 * based on the options.  Use Intl where appropriate; format our own where not.
 *
 * @param dparts
 * @param locale
 * @param specParts
 * @param isHuman
 * @param relStyle
 *
 * @private
 */
function fitRelativeTime(dparts, locale, specParts, isHuman, relStyle) {
    dparts.sign = -dparts.sign
    dparts = roundUpDParts(dparts)
    let out = ''
    const expressHMS = (hours, minutes, seconds) => {
        let hms = ''
        let lbl = ''
        let term = relStyle === 'full' || relStyle === 'long' ? 'term' : 'abbr'
        if(minutes) {
            lbl = i18n.getPluralizedString(locale,`date.${term}.minute`, minutes)
            if(!lbl) {
                const choices = {
                    full: ['minute', 'minutes'],
                    long: ['minute', 'minutes'],
                    short: ['min.', 'min.'],
                    narrow: ['min.', 'min.'],
                }
                let n = minutes == 1 ? 0 : 1
                lbl = choices[relStyle][n]
            }
        }
        else if(seconds) {
            lbl = i18n.getPluralizedString(locale,`date.${term}.second`, seconds)
            if(!lbl) {
                const choices = {
                    full: ['second', 'seconds'],
                    long: ['second', 'seconds'],
                    short: ['sec.', 'sec.'],
                    narrow: ['sec.', 'sec.'],
                }
                let n = seconds == 1 ? 0 : 1
                lbl = choices[relStyle][n]
            }
        }

        let fmt = ''
        if(hours) {
            lbl = i18n.getPluralizedString(locale,`date.${term}.hour`, hours)
            if(!lbl) {
                const choices = {
                    full: ['hour', 'hours'],
                    long: ['hour', 'hours'],
                    short: ['hr.', 'hr.'],
                    narrow: ['hr.', 'hr.'],
                }
                let n = hours == 1 ? 0 : 1
                lbl = choices[relStyle][n]
            }

            if(!minutes && !seconds) {
                hms += formatV('$(-2.0)', hours)
            } else {
                if(!seconds) {
                    hms += formatV('$(-2.0):$(02.0)', hours, minutes)

                } else {
                    hms += formatV('$(-2.0):$(02.0):$(02.3)', hours, minutes, seconds)
                    lbl = ''
                }
            }
        } else if(minutes) {

            let ms = formatV('$(-2.0):$(02.3)', minutes, seconds)
            if(minutes && !seconds) out += formatV('$(-2.0)', minutes)
            else hms += ms
        } else if(seconds) {
            out += formatV('$(-2.-3)', seconds)
        }

        hms += ' ' + lbl
        return hms
    }


    // fast out for now
    i18n.setLocale(locale)
    if(!dparts.years && !dparts.months && !dparts.weeks && !dparts.days
        && !dparts.hours && !dparts.minutes && !dparts.seconds && !dparts.milliseconds) {
        return i18n.getLocaleString('date.range.now','now')
    }



    if(!useIntl() || (relStyle && relStyle.indexOf(':') !== -1)) {

        let inago
        let count, unit
        let n = 0;
        let hms = false
        if(dparts.years) {
            dparts.months = dparts.weeks = dparts.days = dparts.hours = dparts.minutes = dparts.seconds = dparts.milliseconds = 0
            unit = 'year'
            count = dparts.years
            n++
        }
        if(dparts.months) {
            dparts.weeks = dparts.days = dparts.hours = dparts.minutes = dparts.seconds = dparts.milliseconds = 0
            unit = 'month'
            count = dparts.months
            n++
        }
        if(dparts.weeks) {
            dparts.days = dparts.hours = dparts.minutes = dparts.seconds = dparts.milliseconds = 0
            unit = 'week'
            count = dparts.weeks
            n++
        }
        if(dparts.days) {
            dparts.hours = dparts.minutes = dparts.seconds = dparts.milliseconds = 0
            unit = 'day'
            count = dparts.days
            n++
        }
        if(dparts.hours) {
            dparts.seconds = dparts.milliseconds = 0
            unit = 'hour'
            count = dparts.hours
            hms = true
            n++
        }
        if(dparts.minutes) {
            dparts.seconds = dparts.milliseconds = 0
            unit = 'minute'
            count = dparts.minutes
            hms = true
            n++
        }
        if (relStyle === 'full' && (dparts.seconds || dparts.milliseconds) && dparts.seconds < 6) {
            if (dparts.sign < 0) {
                return i18n.getLocaleString("date.range.moments.ago", "a few moments ago")
            } else {
                return i18n.getLocaleString("date.range.moments.away", "in a few moments")
            }
        } else if(dparts.seconds || dparts.milliseconds) {
            unit = 'second'
            count = dparts.seconds || dparts.milliseconds / 1000
            n++;
            hms = true
        }
        if(n !== 1 || (relStyle && relStyle.indexOf(':') !== -1)) {
            let tDate = new Date(0)
            tDate.setUTCHours(dparts.hours)
            tDate.setUTCMinutes(dparts.minutes)
            tDate.setUTCSeconds(dparts.seconds)
            tDate.setUTCMilliseconds(dparts.milliseconds)
            unit = F(`date~${locale}|${relStyle}`, tDate)
            count = ''
        }
        i18n.setLocale(locale)
        if (dparts.sign > 0) inago = i18n.getLocaleString('date.range.time.ahead', 'in $count() $unit()')
        else inago = i18n.getLocaleString('date.range.time.ago', '$count() $unit() ago')
        let term = 'term'
        if(relStyle !== 'full' && relStyle !== 'long') term = 'abbr'

        // fallback pluralization if we don't have any string tables
        let stats:any = i18n.setLocale() // default locale
        let hasI18nStrings = (stats && stats.totalStrings)
        if(!hasI18nStrings) {
            if(term === 'abbr') {
                switch(unit) {
                    case 'hour':
                        unit = 'hr.'
                        break
                    case 'minute':
                        unit = 'min.'
                        break;
                    case 'second':
                        unit = 'sec.'
                        break;
                }
            } else {
                if(count != 1) unit += 's'
            }
        }
        else {
            i18n.setLocale(locale)
            if (i18n.hasLocaleString(`date.${term}.${unit}`)) {
                unit = i18n.getPluralizedString(locale, `date.${term}.${unit}`, count)
            }
        }
        out += formatV(inago, {count, unit})
        return out.trim()

    } else { // using Intl for format style
        let opts = {
            numeric: isHuman ? 'auto' : 'always',
            style: relStyle === 'full' ? 'long' : relStyle
        }
        const rtf = new IRTF(locale, opts)
        let type = ''
        let value = 0
        if(dparts.years) { value = dparts.years; type = 'years'}
        else if(dparts.months) { value = dparts.months; type = 'months'}
        else if(dparts.weeks) { value = dparts.weeks; type = 'weeks'}
        else if(dparts.days) { value = dparts.days; type = 'days'}
        else if(dparts.hours) { value = dparts.hours; type = 'hours'}
        else if(dparts.minutes) { value = dparts.minutes; type = 'minutes'}
        else if(dparts.seconds) { value = dparts.seconds; type = 'seconds'}
        else if(dparts.milliseconds) { value = dparts.milliseconds/1000; type = 'seconds'}
        if(relStyle === 'full') {
            if (type === 'seconds' && dparts.seconds < 6) {
                i18n.setLocale(locale)
                if (dparts.sign < 0) {
                    return i18n.getLocaleString('date.range.moments.ago','a few moments ago')
                } else {
                    return i18n.getLocaleString('date.range.moments.away','in a few moments')
                }
            }
        }
        return rtf.format(value* dparts.sign, type)
    }
}

function roundUpDParts(dparts) {
    if(dparts.milliseconds >= 500) {
        dparts.milliseconds = 0
        dparts.seconds++
    }
    if(dparts.seconds >= 59) {
        dparts.seconds %= 60
        dparts.minutes++
    }
    if(dparts.minutes >= 59) {
        dparts.minutes %= 60
        dparts.hours++
    }
    if(dparts.hours > 23) {
        dparts.hours %= 24
        dparts.days++
    }
    return dparts
}

function fitRelativeDate(dt, locale) {
    if(!locale) locale = getSystemLocale()
    let out = ''
    let isToday = false
    let today = new Date(getNow())
    let timeDiff = dt.getTime() - today.getTime()
    let years = Math.floor(dt.getUTCFullYear() - today.getUTCFullYear())
    let months = dt.getUTCMonth() - today.getUTCMonth()
    let days = timeDiff / (1000 * 3600 * 24)
    let sign = days < 0 ? -1 : 1
    days = sign * Math.floor(Math.abs(days))
    if(days === -0) days = 0
    if(!years && !months) {
        // if in same month, be more direct
        days = dt.getUTCDate() - today.getUTCDate()
    }
    let weeks = Math.floor(Math.abs(days/7))
    if(weeks) weeks *=sign
    if((years || months) && Math.abs(weeks) > 2) {
        let dateStyle = i18n.getLocaleString('date.format.full', 'WWWW, MMMM D YYY')
        out = F(`date~${locale}|` + dateStyle, dt).trim()
    } else if (weeks) {
        // express as weeks
        let weekday = F(`date~${locale}|WWWW`, dt)
        i18n.setLocale(locale)
        if(weeks < 0) {
            if(weeks === -1) {
                out = formatV('@date.range.weekday.previous:$weekday(), last week', {weekday})
            } else {
                out = formatV('@date.range.weekday.weeks.ago:$weekday(), $weeks(-1.0) weeks ago', {weekday, weeks: -weeks})
            }
        } else {
            if(days <= 7) {
                out = formatV('@date.range.weekday.next:next $weekday()', {weekday})
            } else {
                if(weeks === 1) {
                    out = formatV('@date.range.weekday.week.ahead:a week from $weekday()', {weekday})

                } else {
                    out = formatV('@date.range.weekday.weeks.ahead:in $weeks(-1.0) weeks, on $weekday()', {weekday, weeks})
                }
            }
        }
    } else {
        i18n.setLocale(locale)
        // express as days
        if(days === 0) {
            out = i18n.getLocaleString('date.range.today','today')
            isToday = true
        } else if(days === 1) {
            out = i18n.getLocaleString('date.range.tomorrow','tomorrow')
        } else if(days === -1) {
            out = i18n.getLocaleString('date.range.yesterday','yesterday')
        }
        if(Math.abs(days) < 7 && Math.abs(days) > 2) {
            let weekday = F(`date~${locale}|WWWW`, dt)
            let last = i18n.getLocaleString('date.range.weekday.previous', '$weekday(), last week')
            let next = i18n.getLocaleString('date.range.weekday.next', 'next $weekday()')
            out += formatV((days < 0)? last  : next, {weekday})
        } else if(!out) {
            i18n.setLocale(locale)
            if (days < 0) {
                out = formatV('@date.range.days.ago:$days(-1.0) days ago', {days: -days})
            } else {
                out = formatV('@date.range.days.ahead:in $days(-1.0) days', {days})
            }
        }
    }
    return {datePart:out, isToday}

}

function useIntl() {
    return IRTF && getUseIntlChoice()
}

