/*
 * Support for `formatV` action
 */

class ParsedItem {
    public prelit:string // literal string preceding this item
    public argOrdinal: number // which argument this uses for a value
    public argProp: string    // which property from the ordinal specified object to get value from
    public format: string   // the format to apply to this value
}

/**
 * Support for the `formatV` operation.
 *
 * Parses the format template into parsed items
 *
 * new format form is "literal $(fmt) or $2(fmt) or $name(fmt)"
 *
 * @private
 */
export function parseFormat(fmt:string= ''):ParsedItem[] {
    const parsedItems:ParsedItem[] = []
    // find the next '$'
    let natOrder = 0
    let pi = 0
    let ps = 0
    while(pi !== -1) {
        pi = fmt.indexOf('$', ps)
        if(pi !== -1) {
            let item = new ParsedItem()
            natOrder++
            item.prelit = fmt.substring(ps, pi)
            let fi = fmt.indexOf('(', pi)
            if(fi !== -1) {
                let fe = fmt.indexOf(')', fi)
                item.format = fmt.substring(fi+1, fe)
                let pf = fmt.substring(pi+1, fi)
                let sn
                try {
                    let m = pf.match(/[^0-9]/)
                    let ni = m ? pf.indexOf(m[0]) : pf.length
                    let pd = pf.substring(0, ni)
                    item.argProp = pf.substring(ni)
                    if(item.argProp.charAt(0) === ':') {
                        item.argProp = item.argProp.substring(1)
                    }
                    if(pd) sn = parseInt(pd)
                } catch(e) {
                    sn = 0
                }
                if(fe !== -1) pi = fe
                else {
                    console.warn(`unclosed parenthesis in format string ${fmt} at ${fi}`)
                }
                if(item.argProp) {
                    item.argOrdinal = sn || 1
                } else {
                    item.argOrdinal = sn || natOrder
                }
            } else {
                // not a spec... no item is created
                item = null
            }
            if(item) {
                parsedItems.push(item)
            }
            ps = pi + 1
        }
    }
    // now pick up the trailing literal
    if(ps < fmt.length) {
        let item = new ParsedItem()
        item.prelit = fmt.substring(ps)
        item.format = ',' // treat as undefined string
        item.argOrdinal = -1
        parsedItems.push(item)
    }
    return parsedItems
}

/**
 * Applies the values to the corresponding formats
 *
 * @param formatter
 * @param items
 * @param args
 *
 * @private
 */
export function applyItems(formatter:any, items:ParsedItem[], args:any[]):string {

    let out:string = ''

    for(let i=0; i<items.length; i++) {
        let item = items[i]
        out += item.prelit || ''
        let n = item.argOrdinal - 1
        let v = args[n]
        if(item.argProp) {
            if(v && typeof v === 'object') {
                v = v[item.argProp]
            } else {
                console.warn(`property ${v} not found in object ${JSON.stringify(v)}`)
                v = undefined
            }
        }
        if(!item.format) {
            if(typeof v === 'string') {
                item.format = ','
            } else if(typeof v === 'number') {
                item.format = '.'
            }
        }
        let formed = formatter(item.format, v)
        out += formed
    }
    return out

}
