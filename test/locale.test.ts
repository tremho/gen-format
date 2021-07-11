import Tap from 'tap'

import F from '../src/Formatter'
import {formatV} from '../src/Formatter'

import i18n from "../src/i18n";

/**
 * This test just checks to see if we have weekday names in the i18n tables correctly.
 * It does not check month names, or any abbreviations.
 * It does not attempt to check the translation.
 * If a language in the 'locales' array that is not represented in the i18n tables, there will be errors reported.
 */

function localeTest() {
    let locales = ['es', 'fr', 'de', 'it', 'pt', 'ja']
    let weekday = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    Tap.test('locales', t => {
        for(let i=0; i<locales.length; i++) {
            const loc = locales[i]
            for(let d=0; d<weekday.length; d++) {
                const wd = weekday[d]
                let r = F(`date~${loc}|WWWW`, `next ${wd}`)
                let x = wd
                t.ok(r !== x, `expected ${loc} non-English ${r}"`)
            }
        }


        t.end()
    })
}

let stats:any = i18n.setLocale() // default locale
if(stats && stats.totalStrings) {// looks like we have i18n tables
    localeTest()
}

