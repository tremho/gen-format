import {IFormatHandler, SpecParts, formatV, IncompatibleValueType, getFileOps, getUseIntlChoice} from "../Formatter";
import F from '../Formatter'
import DateTimeFormatOptions = Intl.DateTimeFormatOptions;
import DateFormatter, {BadDateValue} from "./DateFormatter";

import * as LocaleStringTables from "@tremho/locale-string-tables"

const sysloc = LocaleStringTables.getSystemLocale()

let i18n

const IDTF = Intl && Intl.DateTimeFormat
// @ts-ignore
const IRTF = Intl && Intl.RelativeTimeFormat

// TODO: switch to @token form passing to formatV
const loc = {
    "date.range.time.separator" : " at ",
    "date.range.now": "now",
    "date.range.one": "one",
    "date.term.year": "year",
    "date.abbr.year": "yr.",
    "date.abbr.year.plural": "yr.",
    "date.term.month": "month",
    "date.abbr.month": "mo.",
    "date.abbr.month.plural": "mo.",
    "date.term.week": "week",
    "date.abbr.week": "wk.",
    "date.abbr.week.plural": "wk.",
    "date.term.day": "day",
    "date.abbr.day": "dy.",
    "date.abbr.day.plural": "dy.",
    "date.term.hour": "hour",
    "date.abbr.hour": "hr.",
    "date.abbr.hour.plural": "hr.",
    "date.term.minute": "minute",
    "date.abbr.minute": "min.",
    "date.abbr.minute.plural": "min.",
    "date.term.second": "second",
    "date.abbr.second": "sec.",
    "date.abbr.second.plural": "sec.",
    "date.range.moments.ago": "a few moments ago",
    "date.range.moments.away": "in a few moments",
    "date.range.ago": "ago",
    "date.range.today": "today",
    "date.range.tomorrow": "tomorrow",
    "date.range.yesterday": "yesterday",
    "date.range.weekday.next": "next $weekday()",
    "date.range.weekday.previous": "$weekday(), last week",
    "date.range.weekday.weeks.ago": "$weekday(), $weeks(-1.0) weeks ago",
    "date.range.weekday.week.ahead": "a week from $weekday()",
    "date.range.weekday.weeks.ahead": "in $weeks(-1.0) weeks, on $weekday()",
    "date.range.days.ago": "$days(-1.0) days ago",
    "date.range.days.ahead": "in $days(-1.0) days",
    "date.range.in.span.on.date": "in $span() on $date()"
}

function setupLoc() {
    Object.getOwnPropertyNames(loc).forEach(p => {
        loc[p] = i18n.getLocaleString(p)
    })
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

        if(!i18n) {
            i18n = new LocaleStringTables.LocaleStrings()
            i18n.init(getFileOps())
            i18n.loadForLocale(sysloc)
        }

        let out: string = ''
        if(Array.isArray(value)) {
            if(value.length !== 2) {
                throw BadDateValue('daterange must be an array of two Date, or date string, or date milllisecond values')
            }
       } else {
            // if we pass a single value, it is assumed to be a date and combined in range with 'now'
            if((typeof value === 'object' && value instanceof Date)
             || (typeof value === 'string' || typeof value === 'number')) {
                value = [value, loc['date.range.now']]
            } else {
                throw BadDateValue('daterange with one relative argument must be a Date, date string, or date milllisecond value')
            }
        }


        let [startDate, endDate] = value
        let endIsNow, startIsNow

        // if we use they 'now' keyword, default to current time
        if(typeof startDate === 'string' && startDate.trim().toLowerCase() === 'now') {
            startDate = Date.now()
            startIsNow = true;
        }
        if(typeof endDate === 'string'  && endDate.trim().toLowerCase() === 'now') {
            endDate = Date.now()
            endIsNow = true;
        }

        let dtStart = new Date(startDate)
        let dtEnd = new Date(endDate)

        let isDiff, isHuman, timeStyle

        let format = specParts.format

        if(format.indexOf(' db') !== -1) {
            format = format.substring(0, format.indexOf(' db'))
            console.log('break')
        }

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
            format = i18nFormatByStyle(specParts.locale, dateStyle, timeStyle,isUtc)
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
        if(sep) leftFormat = leftFormat.replace(sep, ', ') // we use a comma in this form
        rightFormat = rightFormat.trim()
        let llc = leftFormat.charAt(leftFormat.length-1)
        if(fmtchars.indexOf(llc) === -1) {
            leftFormat = leftFormat.substring(0, leftFormat.length-1)
        }

        let dateFormatter = new DateFormatter()
        let spec = Object.assign({}, specParts) // copy
        // spec.hints = hints // pass any remaining hints not pulled above to the date formatter (i.e. timezone cast)
        spec.format = leftFormat || format
        let startStr = startIsNow ? loc['date.range.now'] : dateFormatter.format(spec, dtStart)
        spec.format = rightFormat || format
        let endStr = endIsNow ? loc['date.range.now'] : dateFormatter.format(spec, dtEnd)

        let stTime = dtStart.getTime()
        let endTime = dtEnd.getTime()

        if(endIsNow && isHuman) {
            let {datePart, isToday} =  fitRelativeDate(dtStart)
            if(timeStyle === 'none') {
                return datePart
            }
            if(!isToday) {
                out = datePart
            }
            if(out) out += loc['date.range.time.separator']
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
    const express = (value, type, abbr) => {
        let lbl = type
        let isAbbr = false
        if(relStyle === 'short' || relStyle === 'narrow') {
            lbl = abbr
            isAbbr = true
        }
        if(value == 1) {
            value = 'one'
        } else {
            lbl += 's'
        }
        if(isAbbr) {
            lbl += '.'
        }
        out += `${value} ${lbl} `
    }
    const expressHMS = (hours, minutes, seconds) => {
        let lbl = ''
        if(minutes) {
            lbl = '' //i18n.getPluralizedString(`date.term.minute.${relStyle}`, minutes)
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
            lbl = '' //i18n.getPluralizedString(`date.term.second.${relStyle}`, seconds)
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
            lbl = '' //i18n.getPluralizedString(`date.term.hour.${relStyle}`, hours)
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
                out += formatV('$(-2.0)', hours, minutes, seconds)
            } else {
                if(!seconds) {
                    out += formatV('$(-2.0):$(02.0)', hours, minutes)

                } else {
                    out += formatV('$(-2.0):$(02.0):$(02.3)', hours, minutes, seconds)
                    lbl = ''
                }
            }
        } else if(minutes) {

            let ms = formatV('$(-2.0):$(02.3)', minutes, seconds)
            if(minutes && !seconds) out += formatV('$(-2.0)', minutes)
            else out += ms
        } else if(seconds) {
            out += formatV('$(-2.-3)', seconds)
        }

        out += ' ' + lbl
    }


    // fast out for now
    if(!dparts.years && !dparts.months && !dparts.weeks && !dparts.days
        && !dparts.hours && !dparts.minutes && !dparts.seconds && !dparts.milliseconds) {
        return loc['date.range.now']
    }

    if(!useIntl() || (relStyle && relStyle.indexOf(':') !== -1)) {
        out = dparts.sign > 0 ? 'in ' : ''

        if (dparts.years) express(dparts.years, 'year', 'yr')
        else if (dparts.months) express(dparts.months, 'month', 'mo')
        else if (dparts.weeks) express(dparts.weeks, 'week', 'wk')
        else if (dparts.days) express(dparts.days, 'day', 'dy')
        else {
            if(relStyle === 'full') {
                if(dparts.hours || dparts.minutes) dparts.seconds = dparts.milliseconds = 0
                if ((dparts.seconds || dparts.milliseconds) && dparts.seconds < 6) {
                    if (dparts.sign < 0) {
                        return loc["date.range.moments.ago"]
                    } else {
                        return loc["date.range.moments.away"]
                    }
                }
            }
            if(relStyle && relStyle.indexOf(':') !== -1) {
                let tDate = new Date(0)
                tDate.setUTCHours(dparts.hours)
                tDate.setUTCMinutes(dparts.minutes)
                tDate.setUTCSeconds(dparts.seconds)
                tDate.setUTCMilliseconds(dparts.milliseconds)
                out += F('date|'+relStyle, tDate)
            } else {
                if(dparts.hours) dparts.minutes = dparts.seconds = dparts.milliseconds = 0
                if(dparts.minutes) dparts.seconds = dparts.milliseconds = 0
                if (dparts.seconds)  dparts.milliseconds = 0
                expressHMS(dparts.hours, dparts.minutes, dparts.seconds + dparts.milliseconds / 1000)
            }

        }

        out = out.trim()
        if (dparts.sign < 0) out += ' '+ loc["date.range.ago"]
        return out

    } else {
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
                if (dparts.sign < 0) {
                    return loc['date.range.moments.ago']
                } else {
                    return loc['date.range.moments.away']
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

function fitRelativeDate(dt) {
    let out = ''
    let isToday = false
    let today = new Date()
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
        let dateStyle = 'WWWW, MMMM D YYY'
        out = F('date|' + dateStyle, dt).trim()
    } else if (weeks) {
        // express as weeks
        let weekday = F('date|WWWW', dt)
        if(weeks < 0) {
            if(weeks === -1) {
                out = formatV(loc['date.range.weekday.previous'], {weekday})
            } else {
                out = formatV(loc['date.range.weekday.weeks.ago'], {weekday, weeks: -weeks})
            }
        } else {
            if(days <= 7) {
                out = formatV(loc['date.range.weekday.next'], {weekday})
            } else {
                if(weeks === 1) {
                    out = formatV(loc['date.range.weekday.week.ahead'], {weekday})

                } else {
                    out = formatV(loc['date.range.weekday.weeks.ahead'], {weekday, weeks})
                }
            }
        }
    } else {
        // express as days
        if(days === 0) {
            out = loc['date.range.today']
            isToday = true
        } else if(days === 1) {
            out = loc['date.range.tomorrow']
        } else if(days === -1) {
            out = loc['date.range.yesterday']
        }
        if(Math.abs(days) < 7 && Math.abs(days) > 2) {
            let weekday = F('date|WWWW', dt)
            out += (days < 0)? 'last ' : 'next '
            out += weekday
        } else if(!out) {
            if (days < 0) {
                out = formatV(loc['date.range.days.ago'], {days: -days})
            } else {
                out = formatV(loc['date.range.days.ahead'], {days})
            }
        }
    }
    return {datePart:out, isToday}

}

// TODO: The following functions are mostly in common with DateFormatter. Combine for better maintainability

function useIntl() {
    return IRTF && getUseIntlChoice()
}

function i18nFormatByStyle(locale, dateStyle, timeStyle, isUtc) {
    if(!locale) locale = sysloc
    i18n.setLocale(locale)
    if(!dateStyle) dateStyle = 'none'
    if(!timeStyle) timeStyle = 'none'
    i18n.setLocale(locale)
    let ikeyDate = `date.format.${dateStyle}`
    let ikeyTime = `time.format.${timeStyle}`
    let dateFmt = i18n.getLocaleString(ikeyDate, '', false)
    if(dateFmt === '') {
        // console.log('missing '+ ikey+ ' for '+locale)
        if (dateStyle === 'long' || dateStyle === 'full') {
            dateFmt = 'WWWW, MMMM D, YYYY'
        } else if (dateStyle === 'medium') {
            dateFmt = 'WW, MMM D, YYY'
        } else if (dateStyle === 'short' || dateStyle === 'numeric') {
            if (locale.split('-')[1] === 'US') {
                dateFmt = 'MM/DD/YYYY'
            } else {
                dateFmt = 'DD/MM/YYYY'
            }
        }
    }


    let timeFmt = dateFmt ? i18n.getLocaleString('date.format.time.separator', ', ', false) : ''

    if(timeStyle.indexOf(':') !== -1) {
        timeFmt += timeStyle
    } else {
        if(isUtc) {
            timeFmt += 'h:mm:ss ++ Z' // Intl chooses this style for UTC
        } else {
            timeFmt += i18n.getLocaleString(ikeyTime, '', false)
        }
    }



    if(!timeFmt && timeStyle !== 'none') {
        let h = 'hhh' // 24 hour, no lead
        if (locale.split('-')[1] === 'US') h = 'h' // 12 hour, no lead
        timeFmt += `${h}:mm:ss`
        if (locale.split('-')[1] === 'US') timeFmt += ' ++ ' // AM/PM
        if (isUtc || timeStyle === 'long' || timeStyle === 'full') {
            timeFmt += 'Z' // timezone
        }
    }


    return dateFmt + timeFmt
}
