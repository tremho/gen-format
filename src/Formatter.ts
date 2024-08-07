

import fileOps from './NodeFileOps'

let gFileOps:FileOps = fileOps // default; can override

let useIntlChoice = false

/**
 * Sets up the file operation functions needed for the `i18n` / `locale-string-tables` support
 * This must be done prior to any use of the features of this module.
 * By default, file operations for a typical NodeJS environment are loaded.  If this does not
 * fit your needs, you MUST call this setup function.
 * @param {FileOps} fileOps
 */
export function setFileOps(fileOps:FileOps) {
    gFileOps = fileOps
}

/**
 * Returns the currently loaded fileOps object
 * @return {FileOps} fileOps
 */
export function getFileOps():FileOps {
    return gFileOps
}

let IDTF = Intl && Intl.DateTimeFormat

function hasLanguages() {
    try {
        const january = new Date(9e8);
        const spanish = new Intl.DateTimeFormat('es', { month: 'long' });
        const japanese = new Intl.DateTimeFormat('ja', { month: 'long' });
        return spanish.format(january) === 'enero' && japanese.format(january) === '1月'
    } catch (err) {
        return false;
    }
}

/**
 * Returns a string describing the availability and support for
 * W3C "Intl" library for DateTimeFormat.
 *
 * If availability is complete, and the function `useIntl(true)` is called (with `true`),
 * this library will be used for most of the localization aspects of the date/time formatting.
 *
 * Intl support may be necessary to support extended numbering systems or calendar options, or
 * to faithfully represent formats for certain locales.
 *
 * @returns {string} one of:
 *
 *  - `complete` :  the Intl library appears to support languages beyond the system locale
 *  - `partial` : the Intl libary appears to support the system locale, but perhaps not others
 *  - `none` : there is no Intl support available on this system.
 */
export function checkIntlSupport() {
    if(IDTF) {
        if(hasLanguages()) return 'complete'
        else return 'partial'
    } else {
        return 'none'
    }
}

/**
 * Call with the option to utilize the W3C Intl library, if available.
 *
 * Use the `checkIntlSupport()` function to determine type of support available on this system.
 *
 * If set true, Intl.DateTimeFormat will be called where appropriate rather than using the formatting and localization
 * entirely through this library.
 *
 * Default is `false`: no use of Intl.
 *
 * @param use - pass `true` to enable Intl support, false to disable
 */
export function useIntl(use) {
    useIntlChoice = use
}

/**
 * Returns the current setting of the `useIntl` choice
 *
 * @return {boolean} the choice currently in effect
 */
export function getUseIntlChoice() {
    return useIntlChoice
}


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

export interface FileOps {
    read(path:string):string
    enumerate(relDir:string, callback:any):void
    i18nPath:string
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
 * A _specifier string_ defines the type of format handler either by name (e.g. 'date') or by inference (i.e. numbers and strings)
 * as well as the format and any hints or locale.
 *
 * format type names are given first, followed by any locale or hint declarations, followed by a "|" character and
 * then the format.
 *
 * locales are preceded by a tilde character (~).  Locales passed to date or number formatters may include
 * unicode extended values for calendar and numbering system if Intl support is available and enabled.
 *
 * hints are indicated by a ? character.  If there are multiple hints, each is separated by a dash (-) character.
 * Hints vary according to the type of formatter used. Refer to the documentation for the specific formatter type.
 *
 * Refer to the examples elsewhere in the `gen-format` module documentation
 * for the types of specifier strings and values that can be passed.
 *
 *
 * @param {string} spec The format specifier string.
 * @param {any} value The value to be formatted
 *
 * @example
 *      import F, {useIntl} from '@tremho/gen-format
 *      useIntl(true) // assumes Intl is available. see `checkIntlSupport`
 *
 *      console.log( F('date~zh-ZH-u-nu-hans-ca-chinese?Asia/Hong Kong|full', 'now') )
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
    if(hi > fi) hi = -1
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
        if(fi === -1) fi = str.length;

        let te = Math.min(hi, li)
        if(te == -1) te = hi

        if(te === -1) te = li
        if(te === -1 || fi < te) te = fi
        specParts.type = str.substring(0, te)
    }
    // TODO: Consider allowing either period or comma and using the value to determine type
    
    if(hi !== -1 ) {
        let he = -1
        if(li > hi) he = li
        if(he === -1 && fi > hi) he = fi
        if(he === -1) he = str.length
        specParts.hints = str.substring(hi+1, he).split('-')
    }
    if(li !== -1) {
        let le = Math.min(hi, fi)
        if(le < li) le = fi
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

