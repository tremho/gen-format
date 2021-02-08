
/**
 * Object that holds the parsed results of the format specification
 *
 * - hints: a string array that holds each hint as specified by ?hint1-hint2-hint3-etc
 * - type: the named type of this format specification (and thus handler)
 * - format: the passed format string (after the |)
 * - locale: the passed locale (after the ~)
 */
export class SpecParts {
    hints:string[]
    type:string
    format:string
    locale:string
}

/**
 * Base class that all constituent 'named' format handlers derive from.
 * Uts sole contract is the `format` function
 */
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

/**
 * Attaches a format handler to the general Formatter choices
 * May be used to create a unique `IFormatHandler` instance as a new named type
 * @param type
 * @param handler
 *
 * @example
 *      class MyFoobarFormatter extends IFormatHandler) {
 *          format(specParts:SpecParts, value:any):string {
 *              return 'FUBAR!'
 *          }
 *      }
 *      registerFormatHandler('foobar', MyFoobarFormatter)
 */
export function registerFormatHandler(type:string, handler:IFormatHandler) {
    registeredHandlers[type] = handler
}

/**
 * The primary export of the gen-format module: The `Formatter` operation (sometimes `F` as shorthand)
 * is represented by this function
 *
 * _describe specification format semantics here, and type identification_
 *
 * @param spec The format specifier string.
 * @param value THe value to be formatted
 *
 * @example
 *      import F from 'gen-format
 *
 *      console.log( F('date|full', 'now') )
 */
export default function formatFactory(spec:string, value:any) {

    let specParts: SpecParts = decodeSpec(spec)
    let handler = registeredHandlers[specParts.type]
    if(!handler) {
        throw UnknownFormatType(`"${specParts.type} is not registered as a format type`)
    }
    return handler.format(specParts, value)
}

/**
 * Error thrown for a specified type that does not exist
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
 * Error thrown for the wrong type of value passed to a handler
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
 * Error thrown for a syntax error in the format specifier
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


/**
 * Parses the format specifier into SpecParts object for processing
 * @param str
 *
 * @private
 */
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
        if(te === -1) te = li
        if(te === -1) te = fi
        if(te === -1) te = str.length
        specParts.type = str.substring(0, te)
        if(fi == -1) fi = str.length;
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
    if(!specParts.type) specParts.type = 'string' // default to string formatter
    return specParts
}


import {parseFormat, applyItems} from './format/TemplateFormatter'

/**
 * Use a format template string and passed arguments to create
 * a formatted output
 *
 * @param fmt The first parameter is a string that defines the format template
 * @param args Subsequent arguments represent the value sources that are represented
 *
 * @example
 *
 *      import {formatV} from 'gen-format'
 *
 *      formatV("Pi day, $(date|MMM DD} honors the value Pi which is $(1.2)", '2021-03-14Z', Math.PI)
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

