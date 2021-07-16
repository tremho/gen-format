import i18n from "../i18n";
import {getSystemLocale} from "@tremho/locale-string-tables";

export function i18nFormatByStyle(locale, dateStyle, timeStyle, isUtc, fallbackSeparator) {
    if(!locale) locale = getSystemLocale()
    i18n.setLocale(locale)
    if(!dateStyle) dateStyle = 'none'
    if(!timeStyle) timeStyle = 'none'
    i18n.setLocale(locale)
    let ikeyDate = `date.format.${dateStyle}`
    let ikeyTime = `time.format.${timeStyle}`
    let dateFmt = i18n.getLocaleString(ikeyDate, '', false)
    if(dateFmt === '') {
        // console.log('missing '+ ikey+ ' for '+locale)
        if (dateStyle === 'full') {
            dateFmt = 'WWWW, MMMM D, YYYY'
        } else if(dateStyle === 'long') {
            dateFmt = 'MMMM D, YYYY'
        } else if (dateStyle === 'medium') {
            dateFmt = 'WW, MMM D, YYY'
        } else if (dateStyle === 'short' || dateStyle === 'numeric') {
            if (locale.split('-')[1] === 'US') {
                dateFmt = 'M/D/YY'
            } else {
                dateFmt = 'D/M/YY'
            }
        }
        else if(dateStyle === 'none') {
            dateFmt = ''
        }
    }


    let useSep = !!dateFmt
    if(useSep) {
        if((dateFmt.indexOf('YYYY') === -1 && dateFmt.indexOf('YYY') !== -1)
        || (dateFmt.indexOf('YY') === -1 && dateFmt.indexOf('Y') !== -1)) {
            useSep = false
        }
    }

    // TODO: refactor out the pass-in of fallbackSeparator, because we do that all here
    let fbs
    if(locale.split('-')[0] === 'en') {
        if(dateStyle === 'short') {
            fbs = ', '
        } else if(dateStyle === 'narrow') {
            fbs = ' '
        } else {
            fbs = ' at '
        }
    } else {
        fbs = ', '
        if(dateStyle === 'short' || dateStyle === 'narrow') fbs = ' '
    }

    let sep = i18n.getLocaleString(`date.format.time.separator.${dateStyle}`, '')
    if(!sep) sep = i18n.getLocaleString('date.format.time.separator', fbs, false)
    let timeFmt = useSep ? sep : ' '

    // short: ' ' common, ', ' en


    if(timeStyle.indexOf(':') !== -1) {
        timeFmt += timeStyle
    } else {
        if(isUtc && !timeStyle) {
            timeFmt += 'h:mm:ss ++ Z' // Intl chooses this style for UTC
        } else {
            let tmf = i18n.getLocaleString(ikeyTime, '', false)
            if(!tmf) {
                // hard coded fallback if no i18n
                const isUS = (locale.split('-')[1] === 'US')
                switch(timeStyle) {
                    case 'full':
                        tmf = isUS?"h:mm:ss ++ Z":"hhh:mm:ss ++ Z"
                        break;
                    case 'long':
                        tmf = isUS?"h:mm:ss ++ z":"hhh:mm:ss ++ z"
                        break;
                    case 'medium':
                        tmf = isUS?"h:mm:ss ++" :"hhh:mm:ss ++"
                        break
                    case 'short':
                        tmf = isUS?"h:mm ++" :"hhh:mm ++"
                        break
                    case 'narrow':
                        tmf = isUS?"h:mm -?" :"hhh:mm"
                        break
                }
            }
            timeFmt += tmf
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
