
import tztable from './TZTable'

class TZBlockInfo {
    name:string = ''
    abbr:string = ''
    offset:number = 0
}

class TimezoneEntry {
    anchor:string = ''
    dstRange: number[] = [0,0]
    standard: TZBlockInfo
    daylight: TZBlockInfo
    shortHand?:string
}

class TimezoneBlock extends TZBlockInfo {
    city:string = ''
}

/**
 * Find the Timezone entries that matches the string given
 *
 * @param {string} tzString
 * @return {TimezoneEntry[]} array of entries that match this string
 *
 * @private
 */
export function findTimezones(tzString:string):TimezoneEntry[] {
    let found:TimezoneEntry[] = []
    if(tzString === 'UTC') {
        tzString = 'GMT' // use this eqivalent instead, UTC doesn't occur in table
    }
    const tzAbbr = tzString.toUpperCase()

    tztable.forEach(entry => {
        if(entry.anchor) {
            let anchor = entry.anchor
            let short = entry.shortHand && entry.shortHand.toUpperCase()
            let sabbr = entry.standard.abbr.toUpperCase()
            let dabbr = entry.daylight.abbr.toUpperCase()
            let sname = entry.standard.name
            let we = sname.indexOf(' ')
            if (we === -1) we = sname.length
            let ssname = sname.substring(0, we)
            let dname = entry.daylight.name
            we = dname.indexOf(' ')
            if (we === -1) we = dname.length
            let sdname = dname.substring(0, we)
            let city = anchor.substring(anchor.indexOf('/') + 1)
            if (tzString.toLowerCase() === anchor.toLowerCase() || tzString.toLowerCase() === city.toLowerCase()) {
                found.push(entry as TimezoneEntry)
            }
            if (tzString === sname || tzString === dname) {
                found.push(entry as TimezoneEntry)
            }
            if (tzString === ssname || tzString === sdname) {
                found.push(entry as TimezoneEntry)
            }
            if (tzAbbr == sabbr || tzAbbr == dabbr) {
                found.push(entry as TimezoneEntry)
            }
            if (tzAbbr == short) {
                found.push(entry as TimezoneEntry)
            }
        }
    })
    return found
}

export function findTimezonesByOffset(offset):TimezoneEntry[] {
    let found:TimezoneEntry[] = []
    tztable.forEach(entry => {
        if(entry.anchor) { // skip invalid entries
            if (entry.standard.offset === offset || entry.daylight.offset === offset) {
                found.push(entry as TimezoneEntry)
            }
        }
    })
    return found
}

function chooseBlock(tzd, dt) {
    let t = dt.getTime()
    let th = t / 3600000 // in hours

    let block:TimezoneBlock = (tzd.standard as TimezoneBlock)
    for(let i=0; i<tzd.dstRange.length; i+=2) {
        let st = tzd.dstRange[i]
        let end = tzd.dstRange[i+1]
        if (th >= st && th <= end) {
            block = (tzd.daylight as TimezoneBlock)
            break
        }
    }
    block.city = tzd.anchor
    return block
}

export function findTimezoneBlocksForDate(dt:Date):TimezoneBlock[] {
    let found:TimezoneBlock[] = []
    let offset = dt.getTimezoneOffset()
    let zones = findTimezonesByOffset(offset)
    zones.forEach(tzd => {
        found.push(chooseBlock(tzd, dt))
    })
    return found
}

export function findTimezoneBlocks(nameOrAbbr:string, dt:Date) {
    let found:TimezoneBlock[] = []
    let zones = findTimezones(nameOrAbbr)
    for(let i=0; i<zones.length; i++) {
        let block = chooseBlock(zones[i], dt)
        if(zones[i].shortHand === nameOrAbbr.toUpperCase()) {
            found.unshift(block)
        } else {
            found.push(block)
        }
    }
    return found
}