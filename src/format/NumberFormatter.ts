import {IFormatHandler, SpecParts, IncompatibleValueType} from "../Formatter";
import i18n from '../i18n'
import {getUseIntlChoice} from "../Formatter";

/**
 * NumberFormatter
 *
 * Standard formatter for displaying numbers with various precision and alignment formatting
 *
 */
export default class NumberFormatter implements IFormatHandler {

    format(specParts:SpecParts, value:any):string {
        let out:string = ''
        if(typeof value !== 'number') {
            if(!value) return '' // null and undefined just result in empty string
            throw IncompatibleValueType(`expected number, got ${typeof value}`)
        }

        let format = specParts.format
        let [intSide, decSide] = format.split('.') // number splits on period character

        let m = intSide.match(/[1-9]/) // first non-zero digit
        let ni = m ? intSide.indexOf(m[0]) : intSide.length
        let pre = intSide.substring(0, ni)
        let iss = intSide.substring(ni)
        let intSize = iss && Number(iss) || undefined

        let noRound = pre.indexOf('!') >= 0
        let lead0 = pre.indexOf('0') >= 0
        let plus = pre.indexOf('+') >= 0
        let ksep = pre.indexOf('k') >= 0
        let noAlignInt = pre.indexOf('-') >= 0
        let noAlignDec = decSide.indexOf('-') >= 0
        let paddedSpaces = decSide.indexOf('+') >= 0
        m = decSide.match(/[^0-9]/) // first non digit
        ni = m ? decSide.indexOf(m[0]) : decSide.length
        let dss = decSide.substring(0, ni)
        let decSize = dss ? Number(dss) : undefined

        // TODO: Attach to i18n
        let hasI18n = false
        // i18n or Intl
        let stats:any = i18n.setLocale(specParts.locale) // default locale
        if(stats && stats.totalStrings) {// looks like we have i18n tables
            hasI18n = true
        }
        // start out with the english and then we'll change it
        let decimal = '.'
        let thousands = ksep ? ',' : ''
        let i18nDecimal = decimal, i18nThousands = thousands
        if(hasI18n) {
            i18n.setLocale(specParts.locale)
            i18nDecimal = i18n.getLocaleString('number.format.decimal', decimal)
            i18nThousands = i18n.getLocaleString('number.format.thousand', thousands)
        }


        let sign = ''
        let maxDigs = 0
        let limitVal = 0
        let didRound = false

        value = Number(value)

        let sval = ''+value
        let [strIntVal, strDecVal] = sval.split('.')

        if (value < 0) {
            value = -value
            sign = '-'
        } else {
            sign = plus ? '+' : ''
        }

        if (!noRound && decSize !== undefined) {
            value += 5 / Math.pow(10, decSize + 1) // round up
            didRound = true
        }

        let n = Math.floor(value)
        let d = value - n

        let strVal = '' + value

        if (!isNaN(value)) {
            strIntVal = '' + n
            if (intSize || value) {
                maxDigs = intSize > 16 ? 16 : intSize // largest possible value is 16 digits long
                limitVal = Math.pow(10, maxDigs)
                if (value >= limitVal) {
                    if (!maxDigs) {
                        maxDigs = 1 // for [0.] cases
                    }
                    strIntVal = '#'.repeat(maxDigs)
                    // strIntVal = '################'.substring(0, maxDigs) // workaround for es5
                    d = 0
                    paddedSpaces = true
                }
            } else if (!n && n !== 0) {
                strIntVal = ''
                strVal = strVal.substring(strVal.indexOf('.'))
            }

            if (d) {
                strDecVal = strVal.substring(strIntVal.length + 1)
            } else {
                strDecVal = ''
            }
            if (intSize === undefined) {
                intSize = strIntVal.length
            } else if (intSize === 0 && value < 1) {
                strIntVal = ''
            }
            if (decSize === undefined || paddedSpaces || noAlignDec) {
                if (decSize === undefined) {
                    decSize = strDecVal.length
                }
                let ds = decSize
                while (strDecVal.charAt(ds - 1) === '0') {
                    ds--
                }
                strDecVal = strDecVal.substring(0, ds)
            }
            if (decSize < strDecVal.length) {
                strDecVal = strDecVal.substring(0, decSize)
            }
            if (!noAlignDec) {
                n = decSize - strDecVal.length
                if (paddedSpaces) {
                    strDecVal += ' '.repeat(n)
                    // strDecVal += '                '.substring(0, n)  // workaround for es5
                } else {
                    strDecVal += '0'.repeat(n)
                    // strDecVal += '0000000000000000'.substring(0, n) // workaround for es5
                }
            }
            strIntVal = sign + strIntVal
            if (lead0) {
                n = intSize - strIntVal.length
                strIntVal = '0'.repeat(n) + strIntVal
                //strIntVal = '0000000000000000'.substring(0, n) + strIntVal
            } else if (!noAlignInt) {
                n = intSize - strIntVal.length
                if(n > 0) strIntVal = ' '.repeat(n) + strIntVal
                // strIntVal = '                 '.substring(0, n) + strIntVal
            }
            if (thousands && thousands.length) {
                let d = ''
                n = strIntVal.length
                while (n > 3) {
                    d = thousands + strIntVal.substring(n - 3, n) + d
                    n -= 3
                }
                if (n) {
                    let c = strIntVal.charAt(n - 1)
                    if (c >= '0' && c <= '9') {
                        strIntVal = strIntVal.substring(0, n) + d
                    } else {
                        strIntVal = strIntVal.substring(0, n) + d.substring(1)
                    }
                }
            }

            if (strDecVal.length) {
                out = strIntVal + decimal + strDecVal
            } else {
                out = strIntVal
            }


            if(getUseIntlChoice()) {
                if (Intl && Intl.NumberFormat) {

                    // for compatibility, convert our formatted number string back to a value
                    // so Intl inherits our rounding (or no-rounding) strategy per spec.
                    // but bail out if we have overflow
                    if(out.indexOf('#') !== -1) return out

                    out = out.replace(/[^0-9\-.]/g, '') // get rid of any spaces or kseps
                    value = parseFloat(out)

                    let opts: any = {
                        maximumIntegerDigits: intSize,
                        minimumIntegerDigits: lead0 ? intSize : undefined,
                        maximumFractionDigits: decSize,
                        minimumFractionDigits: noAlignDec ? undefined : decSize,
                        signDisplay: plus ? 'exceptZero' : undefined,

                    }
                    const nf = new Intl.NumberFormat(specParts.locale, opts)
                    let v = Number(value)
                    out = nf.format(v)
                    let n = intSize - strIntVal.trim().length
                    if(strIntVal.charAt(0) === '-') n--
                    if (!lead0 && n > 0 && !noAlignInt) out = ' '.repeat(n) + out
                    if(!noAlignDec && paddedSpaces) {
                        let n = out.length
                        let t = n
                        while(--n && out.charAt(n) !== '0') {}
                        out = out.substring(0, --n)
                        if(t-n > 0) out +=' '.repeat(t-n)
                    }
                }
            } else {
                if(i18nThousands !== ',') {
                    while(out.indexOf(',') !== -1) {
                        out = out.replace(',', i18nThousands)
                    }
                }
                if(i18nDecimal !== '.') {
                    let ci = out.lastIndexOf('.')
                    if(ci !== -1) {
                        out = out.substring(0,ci)+i18nDecimal+out.substring(ci+1)
                    }
                }

            }

        }
        return out
    }
}