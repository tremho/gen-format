// Have  your fileops ready (change this import line to suit your own FileOps object)
import {LocaleStrings, getSystemLocale, LoadStats}  from "@tremho/locale-string-tables";
import {getFileOps, setFileOps, FileOps} from "./Formatter";

// let i18n
let i18nArray:LocaleStrings[] = []

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
        const i18n = new LocaleStrings()
        // init it with the fileops object set in Formatter.setFileOps
        i18n.init(getFileOps())
        i18n.setLocale(getSystemLocale())
        i18nArray.unshift(i18n)
    },

    addI18nLocation(i18nPath:string) {
        const i18n = new LocaleStrings()
        i18n.init(getFileOps(),i18nPath)
        i18n.setLocale(getSystemLocale())
        i18nArray.unshift(i18n)
    },

    getSystemLocale():string {
        if(!i18nArray.length) wrapper.init()
        return getSystemLocale()
    },
    setLocale(locale?:string):LoadStats {
        if(!i18nArray.length) wrapper.init()
        let allStats = new LoadStats();
        allStats.regionFiles =
            allStats.commonRegionFiles =
                allStats.commonFiles =
                    allStats.totalStrings =
                    allStats.languageFiles = 0

        allStats.localeName = locale
        for (let i18n of i18nArray) {
            let stats = i18n.setLocale(locale)
            allStats.totalStrings += stats.totalStrings
            allStats.commonFiles += stats.commonFiles
            allStats.regionFiles += stats.regionFiles
            allStats.commonRegionFiles += stats.commonRegionFiles
            allStats.languageFiles += stats.languageFiles
        }
        return allStats
    },
    isLocaleLoaded(locale):boolean {
        if(!i18nArray.length) wrapper.init()
        for (let i18n of i18nArray) {
            if(!i18n.isLocaleLoaded(locale)) {
                console.warn(`locale ${locale}' not found in table at '${i18n.geti18nFolder()}'`)
                return false;
            }
        }
        return true
    },
    hasLocaleString(id):boolean {
        if(!i18nArray.length) wrapper.init()
        for (let i18n of i18nArray) {
            if(!i18n.hasLocaleString(id)) return false
        }
        return true
    },
    getLocaleString(id, useDefault?:string, silent?:boolean):string {
        if(!i18nArray) wrapper.init()
        let str = ''
        for (let i18n of i18nArray) {
            str = i18n.getLocaleString(id)
            if(str) break;
        }
        return str ? str : useDefault
    },
    populateObjectStrings (obj:any, shallow?:boolean):void {
        if(!i18nArray.length) wrapper.init()
        let i = i18nArray.length;
        while(--i >= 0) {
            const i18n = i18nArray[i]
            i18n.populateObjectStrings(obj, shallow)
        }
    },
    translateObjectStrings (obj:any, shallow?:boolean):any {
        if(!i18nArray.length) wrapper.init()
        let i = i18nArray.length;
        let objOut = Object.assign({}, obj)
        while(--i >= 0) {
            const i18n = i18nArray[i]
            objOut = i18n.translateObjectStrings(objOut, shallow)
        }
        return objOut
    },
    getTokenDefault(inStr:string, silent?:boolean):string {
        if(!i18nArray) wrapper.init()
        const def = inStr.split(':')[1]
        let val
        for (let i18n of i18nArray) {
            val = i18n.getTokenDefault(inStr, silent)
            if(val !== def) break
        }
        return val;
    },
    getPluralizedString (locale:string, stringId:string, count:number, type = 'cardinal') {
        if(!i18nArray) wrapper.init()
        for (let i18n of i18nArray) {
            let p = i18n.getPluralizedString(locale, stringId, count, type)
            if (p && !p.startsWith("%$<NO PLURALS")) return p
        }
        return '%$<NO PLURALS '+locale+'>$%'
    },
    pluralize(locale, word, count, type = 'cardinal') {
        if(!i18nArray) wrapper.init()
        for (let i18n of i18nArray) {
            let p = i18n.pluralize(locale, word, count, type)
            if(p) return p
        }
    },
    getInstalledLocales() {
        if(!i18nArray) wrapper.init()
        let locSet = new Set();
        for (let i18n of i18nArray) {
            let locs = i18n.getInstalledLocales()
            locs.forEach(loc=>{ locSet.add(locs)})
        }
        return Array.from(locSet)
    },
    enumerateAvailableLocales(callback) {
        if(!i18nArray) wrapper.init()
        let locSet = new Set();
        for (let i18n of i18nArray) {
            i18n.enumerateAvailableLocales(callback)
        }
        return Array.from(locSet)
    }
}
export default wrapper