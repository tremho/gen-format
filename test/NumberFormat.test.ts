import Tap from 'tap'

import F, {checkIntlSupport, useIntl} from '../src/Formatter'
import {formatV} from '../src/Formatter'
import i18n from "../src/i18n";

function numbeFormatTest() {

    let intlAvailable = checkIntlSupport() === 'complete'
    if(intlAvailable) {
        useIntl(true)
    }
    let hasI18n = false
    // i18n or Intl
    let stats:any = i18n.setLocale() // default locale
    if(stats && stats.totalStrings) {// looks like we have i18n tables
        hasI18n = true
    }

    Tap.test('numbers', t => {

        t.skip(`COMMENT: Intl Availability is ${checkIntlSupport()}. These tests were made with ${intlAvailable? 'full' : 'no'} Intl support`)

        let v = Math.PI

        let desc = "normal. Has space padded alignment"
        let r = F('2.3', v)
        let x = ' 3.142'
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc = "zero padded alignment"
        r = F('02.3', v)
        x = '03.142'
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc = "no problem with space"
        r = F(' 2.3', v)
        x = ' 3.142'
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc = "no alignment"
        r = F('-2.3', v)
        x = '3.142'
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc = "no rounding"
        r = F('!2.3', v)
        x = ' 3.141'
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc = "no rounding, no alignment"
        r = F('-!2.3', v)
        x = '3.141'
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc = "plus"
        r = F('+2.3', v)
        x = '+3.142'
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc = "no round plus"
        r = F('!+2.3', v)
        x = '+3.141'
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc = "integerize"
        v = 1.5
        r = F('1.0', v)
        x = '2'
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)
        r = F('!1.0', v)
        x = '1'
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc = 'negative'
        r = F('2.3', -6.283123456)
        x = '-6.283'
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc = "not negative, same rounding"
        r = F('2.3', 6.283123456)
        x = ' 6.283'
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc = "negative, round, no round"
        r = F('2.0', -1.6)
        x = '-2'
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)
        r = F('!2.0', -1.6)
        x = '-1'
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc = "thousands"
        v = 123456.789
        r = F('k6.3', v)
        x = '123,456.789'
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc = "overflow"
        r = F('3.0', v)
        x = '###'
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc = "trailing zeroes"
        v = 12.34
        r = F('2.04',v)
        x = '12.3400'
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc = "space padding"
        v = 12.34
        r = F('2.4+',v)
        x = '12.34  '
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc = "no alignment"
        v = 12.34
        r = F('2.4-',v)
        x = '12.34'
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc = 'can be accessed by name'
        r = F('number|2.4-',v)
        x = '12.34'
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)


        // en-US should be ok; this just tests passing of locale (which should certainly work)
        desc = 'can pass locale'
        r = F('number~en-US|2.4-', v)
        x = '12.34'
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        if(hasI18n || intlAvailable) {
            desc = 'can pass locale and get different separators'
            v = 123456.789
            r = F('number~es-ES|k6.3', v)
            x = '123.456,789'
            t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)
        } else {
            t.skip('(no i18n or Intl) no translation source for locale separators')
        }

        if (intlAvailable) {
            // Intl only
            desc = 'can pass locale and get different numbering'
            v = 123456.789
            r = F('number~ar|k6.3', v)
            x = '١٢٣٬٤٥٦٫٧٨٩'
            t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

            desc = 'can pass locale w/specified numbering'
            v = 123456.789
            r = F('number~ar-u-nu-latn|k6.3', v)
            x = '123,456.789'
            t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)
        } else {
            t.skip('(no Intl) Intl required for alternate numbering schemes')
        }
        if(intlAvailable || hasI18n) {
            const locs = ['am','ar','az','bg','bn', 'bs', 'ca', 'cs', 'da', 'de', 'el', 'en', 'es', 'et',
            'fa', 'fi', 'fil', 'fr', 'he', 'hi', 'hr', 'hu', 'id', 'it', 'ja', 'kn', 'lt', 'lv', 'ml', 'mr',
            'ms', 'nb', 'nl', 'pa', 'pl', 'pt', 'ro', 'ru', 'sk', 'sl', 'sr', 'sv', 'sw', 'ta', 'te', 'th',
            'tr', 'uk', 'uz', 'vi', 'zh']


            const sepexp = [
                "123,456.789",
                "١٢٣٬٤٥٦٫٧٨٩",
                "123.456,789",
                "123 456,789",
                "১,২৩,৪৫৬.৭৮৯",
                "123.456,789",
                "123.456,789",
                "123 456,789",
                "123.456,789",
                "123.456,789",
                "123.456,789",
                "123,456.789",
                "123.456,789",
                "123 456,789",
                "۱۲۳٬۴۵۶٫۷۸۹",
                "123 456,789",
                "123,456.789",
                "123 456,789",
                "123,456.789",
                "1,23,456.789",
                "123.456,789",
                "123456,789",
                "123.456,789",
                "123.456,789",
                "123,456.789",
                "123,456.789",
                "123 456,789",
                "123 456,789",
                "1,23,456.789",
                "१,२३,४५६.७८९",
                "123,456.789",
                "123 456,789",
                "123.456,789",
                "1,23,456.789",
                "123 456,789",
                "123.456,789",
                "123.456,789",
                "123 456,789",
                "123 456,789",
                "123.456,789",
                "123.456,789",
                "123 456,789",
                "123,456.789",
                "1,23,456.789",
                "1,23,456.789",
                "123,456.789",
                "123.456,789",
                "123 456,789",
                "123 456,789",
                "123.456,789",
                "123,456.789"
            ]

            let cnt = 0
            for(const loc of locs) {
                desc = "checking separators for "+loc
                v = 123456.789
                r = F(`number~${loc}|k6.3`, v)
                if(intlAvailable) {
                    let ri = new Intl.NumberFormat(loc).format(v)
                    t.skip(`${loc}   ${ri}`)
                } else {
                    let ri = sepexp[cnt++]
                    if(ri.charAt(1) != '2') {
                        t.skip(`skipping alternate numbering ${loc} ${ri}`)
                    } else {
                        if( r !== ri ) {
                            let i = -1;
                            while(++i < r.length) {
                                let ccr = r.charCodeAt(i).toString(16)
                                let ccx = ri.charCodeAt(i).toString(16)
                                if(ccr !== ccx) {
                                    t.skip(`${loc} codes at ${i} \\u00${ccr} vs. \\u00${ccx}`)
                                }

                            }
                        }
                        t.ok(r === ri, `${desc} expected "${ri}" got "${r}"`)
                    }

                }
            }
        }

        t.end()
    })
}

numbeFormatTest()