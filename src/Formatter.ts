
/*
Construction types

F(spec, value)

old spec def:
hint | format | locale

###### new spec definition:
Tags:
    - `?` hint
    - [`!`] format  ! optional and assumed @0 if not found
    - `~` locale 
    
Nominal form:
    format [?hint][~locale]
alternately:
    ?hint!format~locale
or
    ~locale!format?hint
or
    ~locale?hint!format
    
[number] comma [number] == string type    
[number] period [number] == number type
no comma or period = type name

supports:

    F('10,20') - comma indicates string type
    F('2.2') - period indicates number type
    F('date!hh::mm::ss~jp') - date type , with format and locale
    F('>10<') string type because of > form
    F('2. >4) number type because of period (then padded)
 */

export class SpecParts {
    hints:string[]
    type:string
    format:string
    locale:string
}
export interface IFormatHandler {

    /**
     * Formats the incoming value per this handler purpose
     * into a string, using the passed specs.
     *
     * @param specParts
     * @param value
     */
    format(specParts:SpecParts, value:any):string
}
const registeredHandlers:any = {}

export function registerFormatHandler(type:string, handler:IFormatHandler) {
    registeredHandlers[type] = handler
}
export default function formatFactory(spec:string, value:any) {

    let specParts: SpecParts = decodeSpec(spec)
    let handler = registeredHandlers[specParts.type]
    if(!handler) {
        throw UnknownFormatType(`"${specParts.type} is not registered as a format type`)
    }
    return handler.format(specParts, value)
}

/**
 * For a specified type that does not exist
 *
 * @param message
 * @constructor
 */
export function UnknownFormatType(message:string) {
    class UnknownFormatType extends Error {
        constructor(message) {
            super(message)
            this.name = 'UnknownFormatType'
        }
    }

    return new UnknownFormatType(message)
}

/**
 * For the wrong type of value passed to a handler
 *
 * @param message
 * @constructor
 */
export function IncompatibleValueType(message:string) {
    class IncompatibleValueType extends Error {
        constructor(message) {
            super(message)
            this.name = 'IncompatibleValueType'
        }
    }

    return new IncompatibleValueType(message)
}

/**
 * For a syntax error in the format specifier
 *
 * @param message
 * @constructor
 */
export function BadFormatSpecifier(message:string) {
    class BadFormatSpecifier extends Error {
        constructor(message) {
            super(message)
            this.name = 'BadFormatSpecifier'
        }
    }

    return new BadFormatSpecifier(message)
}


function decodeSpec(str:string):SpecParts {
    let fi = str.indexOf('|') // format, explicit
    let hi = str.indexOf('?') // hint list, dash delimited
    let li = str.indexOf('~') // locale specifier
    // don't let explicit formatting (e.g. date) interfere
    let di = fi === -1 ? str.indexOf('.') : -1 // period (number)
    let ci = fi === -1 ? str.indexOf(',') : -1 // comma (string)

    const specParts = new SpecParts()
    
    if(di !== -1) {
        if(ci !== -1) {
            throw BadFormatSpecifier(`specifier cannot include both "," and "." [${str}]`)
        }
        specParts.type = 'number'
    }
    if(ci !== -1) {
        specParts.type = 'string'
    }
    else if(di === -1) {
        // neither. so we must be naming a type
        let te = hi
        if(te === -1) te = fi
        if(te === -1) te = li
        if(te === -1) te = str.length
        specParts.type = str.substring(0, te)
    }
    // TODO: Consider allowing either period or comma and using the value to determine type
    
    if(hi !== -1) {
        let he = -1
        if(fi > hi) he = fi
        if(he === -1 && li > hi) he = li
        if(he === -1) he = str.length
        specParts.hints = str.substring(hi+1, he).split('-')
    }
    if(li !== -1) {
        let le = -1
        if(fi > li) le = fi
        if(le === -1 && hi > li) le = hi
        if(le === -1) le = str.length
        specParts.locale = str.substring(li+1, le)
    }
    if(true) {
        let fe = hi
        if(fe <= fi ) fe = li
        if(fe <= fi) fe = str.length
        specParts.format = str.substring(fi+1, fe)
    }
    return specParts
}


import {parseFormat, applyItems} from './format/TemplateFormatter'

/**
 * use a format string and passed arguments to create
 * a formatted output
 *
 * @param fmt
 * @param args
 */
export function formatV(fmt:string, ...args):string {
    const items = parseFormat(fmt)
    return applyItems(formatFactory, items, args)
}

// setup the defaults
import NumberFormatter from './format/NumberFormatter'
import StringFormatter from './format/StringFormatter'
import DateFormatter from "./format/DateFormatter";
import DateRangeFormatter from "./format/DateRangeFormatter";

registerFormatHandler('number', new NumberFormatter())
registerFormatHandler('string', new StringFormatter())
registerFormatHandler('date', new DateFormatter())
registerFormatHandler('daterange', new DateRangeFormatter())

