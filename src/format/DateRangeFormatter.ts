import {IFormatHandler, SpecParts, formatV,IncompatibleValueType} from "../Formatter";
import DateTimeFormatOptions = Intl.DateTimeFormatOptions;
import DateFormatter, {BadDateValue} from "./DateFormatter";

const IDTF = Intl && Intl.DateTimeFormat
// @ts-ignore
const IRTF = Intl && Intl.RelativeTimeFormat


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
            startDate = Date.now()
            startIsNow = true;
        }
        if(typeof endDate === 'string'  && endDate.trim().toLowerCase() === 'now') {
            endDate = Date.now()
            endIsNow = true;
        }

        let dtStart = new Date(startDate)
        let dtEnd = new Date(endDate)

        let format = specParts.format

        let hints = specParts.hints || []
        let dhi = hints.indexOf('diff')
        let hhi = hints.indexOf('human')
        let ghi = hints.indexOf('digital')
        let lhi = hints.indexOf('long')
        let shi = hints.indexOf('short')
        let nhi = hints.indexOf('narrow')

        let isDiff, isHuman, relStyle
        if(dhi !== -1) {
            hints = hints.splice(dhi, 1)
            isDiff = true
        }
        if(hhi !== -1) {
            hints = hints.splice(hhi,1)
            isHuman = true
        }
        if(ghi !== -1) {
            hints = hints.splice(ghi,1)
            isHuman = false
        }
        if(lhi !== -1) {
            hints = hints.splice(lhi, 1)
            relStyle = 'long'
        }
        if(shi !== -1) {
            hints = hints.splice(shi, 1)
            relStyle = 'short'
        }
        if(nhi !== -1) {
            hints = hints.splice(nhi, 1)
            relStyle = 'narrow'
        }



        if(format.indexOf(' db') !== -1) {
            console.log('break')
        }

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
        rightFormat = rightFormat.trim()
        let llc = leftFormat.charAt(leftFormat.length-1)
        if(fmtchars.indexOf(llc) === -1) {
            leftFormat = leftFormat.substring(0, leftFormat.length-1)
        }

        let dateFormatter = new DateFormatter()
        let spec = Object.assign({}, specParts) // copy
        spec.hints = hints // pass any remaining hints not pulled above to the date formatter (i.e. timezone cast)
        spec.format = leftFormat || format
        let startStr = startIsNow ? 'now' : dateFormatter.format(spec, dtStart)
        spec.format = rightFormat || format
        let endStr = endIsNow ? 'now' : dateFormatter.format(spec, dtEnd)

        if(isDiff) {
            let ms = dtEnd.getTime() - dtStart.getTime()
            let dparts = getDurationParts(ms)
            out = fitRelativeTime(dparts, specParts.locale, spec, isHuman, relStyle)
        } else {
            if(dtStart.getTime() == dtEnd.getTime()) {
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

    if(!isHuman) {
        // the formatToParts doesn't help us here because that just (uselessly) deconstructs the semantics of the sentence,
        // and does not give us values in the formats we want.
        // Instead:
        // find largest. display n yr., n mo., n dy., h:m:s  or mininum 0:ss.sss (use in or ago per sign)
        let out = dparts.sign > 0 ? 'in ' : ''
        if (dparts.years) express(dparts.years, 'year', 'yr')
        else if (dparts.months) express(dparts.months, 'month', 'mo')
        else if (dparts.weeks) express(dparts.weeks, 'week', 'wk')
        else if (dparts.days) express(dparts.days, 'day', 'dy')
        else if (dparts.hours) out += formatV('$(-2.0):', dparts.hours)
        if(dparts.minutes) {
            if (dparts.milliseconds) {
                out += formatV('$(02.0):$(02.3)', dparts.minutes, dparts.seconds + dparts.milliseconds / 1000)
            } else {
                out += formatV('$(02.0):$(02.0)', dparts.minutes, dparts.seconds)
            }
        } else {
            // todo: localize
            let sec = relStyle === 'short' || relStyle === 'narrow' ? 'sec' : 'second'
            if(sec !== 'sec') {
                if(dparts.seconds != 1  || dparts.milliseconds) {
                    sec += 's'
                }
            }else{
                sec += '.'
            }
            if (dparts.milliseconds) {
                out += formatV(`$(-2.3-) ${sec}`, dparts.seconds + dparts.milliseconds / 1000)
            } else {
                out += formatV(`$(-2.0) ${sec}`, dparts.seconds)
            }

        }
        if (dparts.sign < 0) out += ' ago'
        return out
    }

    if(IRTF) {
        let opts = {
            numeric: isHuman ? 'auto' : 'always',
            style: relStyle
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
        return rtf.format(value* dparts.sign, type)
    }

}

