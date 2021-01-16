import {IFormatHandler, SpecParts, IncompatibleValueType} from "../Formatter";

export default class NumberFormatter implements IFormatHandler {

    format(specParts: SpecParts, value: any): string {
        let out: string = ''
        if(typeof value !== 'string') {
            if(!value) return '' // null and undefined just result in empty string
            throw IncompatibleValueType(`expected string, got ${typeof value}`)
        }

        let [minStr, maxStr] = specParts.format.split(',')
        let m = minStr.match(/[0-9]/)
        let ni = m ? minStr.indexOf(m[0]) : minStr.length
        let minValStr = minStr.substring(ni)
        let lpad = minStr.substring(0, ni)
        m = maxStr.match(/[^0-9]/)
        ni = m ? maxStr.indexOf(m[0]) : maxStr.length
        let maxValStr = maxStr.substring(0, ni)
        let rpad = maxStr.substring(ni)
        let min = Number(minValStr)
        let max = maxValStr ? Number(maxValStr) : Number.MAX_SAFE_INTEGER

        let slen = value.length;
        let ps = min - slen
        if(lpad && rpad) {
            let hps = Math.floor(ps/2)
            let lp = hps ? lpad.repeat(hps).substring(0, hps) : ''
            let rp = hps ? rpad.repeat(hps).substring(0, hps) : ''
            out = (lp+value+rp).substring(0, max)
            if(out.length < min) {
                let rp = ' '.repeat(min - out.length)
                out += rp;
            }
        } else if(lpad) {
            let lp = lpad.repeat(ps).substring(0, ps)
            out = lp+value
        } else {
            if(!rpad) rpad = ' '
            let rp = ps > 0 ? rpad.repeat(ps).substring(0, ps) : ''
            out = value+rp
        }
        out = out.substring(0, max)

        return out
    }
}