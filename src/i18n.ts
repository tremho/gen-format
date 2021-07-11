// Have  your fileops ready (change this import line to suit your own FileOps object)
import {LocaleStrings, getSystemLocale, LoadStats}  from "@tremho/locale-string-tables";
import {getFileOps, setFileOps, FileOps} from "./Formatter";

let i18n

/**
 * This is access to the localization support features of the internal `@tremho/locale-string-tables` module
 * that `gen-format` uses.  This API allows you to use the `i18n` string tables for your own purposes as well.
 *
 * Access this API with `import {i18n} from "@tremho/gen-format")`
 *
 * for the i18n API reference, see the [@tremho/locale-string-tables reference](https://github.com/tremho/locale-string-tables#api)
 *
 * each of the API functions listed there can be found off of the imported `i18n` namespace object.
 *
 * _Note: `loadForLocale` is not exported by this API bridge. use `setLocale` instead, which will also load if needed_
 *
 * In addition to the APIs revealed by this bridge, please note the `init` function documented below.
 *
 */
function i18n_API () {}

const wrapper = {

    /**
     * Call once before using other functions of the i18n API.
     * If you do not call this before using any of the api functions, then it will be called upon first entry into an
     * api function, but there may be a resulting slight delay due to the initialization.
     * For this reason, it is best to initialize ahead of time.
     * As a convenience if you need to supply custom FileOps (see `Formatter.setFileOps()`), you may pass your
     * FileOps object here rather than having to call `Formatter.setFileOps()` first.  Both methods are equivalent
     * in functional result.
     *
     * @param withFileOps The FileOps that will be passed to `Formatter.setFileOps()` before initializing the
     * i18n system.
     */
    init(withFileOps?:FileOps) {
        // if we are setting file ops here, set them at Formatter, which holds the global for this
        if(withFileOps) {
            setFileOps(withFileOps)
        }
        // Construct the instance
        i18n = new LocaleStrings()
        // init it with the fileops object set in Formatter.setFileOps
        i18n.init(getFileOps())
        i18n.setLocale(getSystemLocale())
    },

    getSystemLocale():string {
        if(!i18n) wrapper.init()
        return getSystemLocale()
    },
    setLocale(locale?:string):LoadStats {
        if(!i18n) wrapper.init()
        return i18n.setLocale(locale)
    },
    isLocaleLoaded(locale):boolean {
        if(!i18n) wrapper.init()
        return i18n.isLocaleLoaded(locale)
    },
    hasLocaleString(id):boolean {
        if(!i18n) wrapper.init()
        return i18n.hasLocaleString(id)
    },
    getLocaleString(id, useDefault?:string, silent?:boolean):string {
        if(!i18n) wrapper.init()
        return i18n.getLocaleString(id, useDefault, silent)
    },
    populateObjectStrings (obj:any, shallow?:boolean):void {
        if(!i18n) wrapper.init()
        return i18n.populateObjectStrings(obj, shallow)
    },
    translateObjectStrings (obj:any, shallow?:boolean):any {
        if(!i18n) wrapper.init()
        return i18n.translateObjectStrings(obj, shallow)
    },
    getTokenDefault(inStr:string, silent?:boolean):string {
        if(!i18n) wrapper.init()
        return i18n.getTokenDefault(inStr, silent)
    },
    getPluralizedString (locale:string, stringId:string, count:number, type = 'cardinal') {
        if(!i18n) wrapper.init()
        return i18n.getPluralizedString(locale, stringId, count, type)
    },
    pluralize(locale, word, count, type = 'cardinal') {
        if(!i18n) wrapper.init()
        return i18n.pluralize(locale, word, count, type)
    }
}
export default wrapper