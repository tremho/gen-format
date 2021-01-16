import {IFormatHandler, SpecParts, IncompatibleValueType} from "../Formatter";
import DateTimeFormatOptions = Intl.DateTimeFormatOptions;
import DateFormatter, {BadDateValue} from "./DateFormatter";

const IDTF = Intl && Intl.DateTimeFormat


export default class DateRangeFormatter implements IFormatHandler {

    format(specParts: SpecParts, value: any): string {
        let out: string = ''

        if(typeof value === 'object') {
            if(!value.hasOwnProperty('startDate') && !value.hasOwnProperty('endDate')) {
                if(!(value instanceof Date)) {
                    throw BadDateValue('daterange must be a Date, date string, or {startDate, endDate} object')
                } else {
                    // if we pass a date, it is combined in range with 'now'
                    value = {startDate: value, endDate: 'now'}
                }
            }
       } else {
            // if we pass a date, it is combined in range with 'now'
            value = {startDate: value, endDate: 'now'}
        }


        let {startDate, endDate} = value
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

        let isDiff = format.indexOf(' diff') !== -1
        format = format.replace(' diff', '') // now remove it
        let isHuman = format.indexOf(' human') !== -1
        format = format.replace(' human', '')

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
        tti = ((ti = format.lastIndexOf('z')) > tti) ? ti : tti
        tti = ((ti = format.lastIndexOf('Z')) > tti) ? ti : tti
        if(tti === -1) {
            tti = dti+1
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
        let leftFormat = remove(format, 'Z')
        leftFormat = remove(leftFormat, 'z')
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
        let lrc = rightFormat.charAt(rightFormat.length-1)
        if(fmtchars.indexOf(lrc) === -1) {
            rightFormat = rightFormat.substring(0, rightFormat.length-1)
        }


        let dateFormatter = new DateFormatter()
        let spec = Object.assign({}, specParts) // copy
        spec.format = leftFormat || format
        let startStr = startIsNow ? 'now' : dateFormatter.format(spec, dtStart)
        spec.format = rightFormat || format
        let endStr = endIsNow ? 'now' : dateFormatter.format(spec, dtEnd)

        if(isDiff) {
            let ms = dtEnd.getTime() - dtStart.getTime()
            if(Math.abs(ms) < 1000) {
                out =  endIsNow ? 'just now' : 'same time as ' + endStr
                return out
            }

            if(Math.abs(ms) < 3000) {
                out = 'a moment'
            } else {
                out = describeDuration(ms)
            }
            if(!endIsNow) {
                if(ms > 0) {
                    out += ' before '
                } else {
                    out += ' after '
                }
                out += endStr
            } else { // relative to now
                if(ms > 0) {
                    if(out !== 'just now') out += ' ago'
                } else {
                    if(out !== 'just now') out += ' from now'
                }
            }
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

function describeDuration(ms) {

    let out = ''

    const msPerSec = 1000
    const secPerMin = 60
    const minPerHr = 60
    const hrsPerDay = 24
    const dayPerWeek = 7
    const weeksPerMonth= 4
    const monthsPerYear = 12

    let secs = Math.floor( ms/msPerSec)
    let mins = Math.floor(ms/(msPerSec * secPerMin))
    let hrs = Math.floor(ms/(msPerSec * secPerMin*minPerHr))
    let days = Math.floor(ms/(msPerSec * secPerMin*minPerHr*hrsPerDay))
    let weeks = Math.floor(ms/(msPerSec * secPerMin*minPerHr*hrsPerDay*dayPerWeek))
    let months = Math.floor(ms/(msPerSec * secPerMin*minPerHr*hrsPerDay*dayPerWeek*weeksPerMonth))
    let years = Math.floor(ms/(msPerSec * secPerMin*minPerHr*hrsPerDay*dayPerWeek*weeksPerMonth*monthsPerYear))
    let msecs = ms - secs*msPerSec
    secs -= mins*secPerMin
    mins -= hrs*minPerHr
    hrs -= days*hrsPerDay
    days -= weeks*dayPerWeek
    weeks -= months*weeksPerMonth
    months -= years*monthsPerYear


    if(years) {
        if(months || weeks) {
            out = 'a little over '
        }
        if(years === 1) {
            out += 'a year'
        } else {
            out += `${years} years`
        }
        return out
    }
    if(months) {
        if(weeks || days > 2) {
            out = 'a little over '
        }
        if(months === 1) {
            out += 'a month'
        } else {
            out += `${months} months`
        }
        return out
    }
    if(weeks) {
        if(days > 8 )  {
            out = 'a little over '
        }
        if(weeks === 1) {
            out += 'a week'
        } else {
            out += `${weeks} weeks`
        }
        return out
    }
    if(days) {
        if(hrs > 8 )  {
            out = 'a little over '
        }
        if(days === 1) {
            out += 'a day'
        } else {
            out += `${days} days`
        }
        return out
    }
    if(hrs) {
        if(mins > 15 )  {
            out = 'a little over '
        }
        if(hrs === 1) {
            out += 'an hour'
        } else {
            out += `${hrs} hours`
        }
        return out
    }
    if(mins) {
        if(secs > 15 )  {
            out = 'a little over '
        }
        if(mins === 1) {
            out += 'a minute'
        } else {
            out += `${mins} minutes`
        }
        return out
    }
    if(secs) {
        if(msecs > 300 )  {
            out = 'a little over '
        }
        if(secs === 1) {
            out += 'a second'
        } else {
            out += `${secs} seconds`
        }
        return out
    }


}