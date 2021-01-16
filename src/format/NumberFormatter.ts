import {IFormatHandler, SpecParts, IncompatibleValueType} from "../Formatter";

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

        // let decimal = (props.decimal === undefined ? this.decimalSeparator : props.decimal)
        // let thousands = ksep ? (props.thousands === undefined ? this.thousandsSeparator : props.thousandsSeparator) : ''
        let decimal = '.'
        let thousands = ksep ? ',' : ''

        let sign = ''
        let maxDigs = 0
        let limitVal = 0

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
        }
        return out
    }
}