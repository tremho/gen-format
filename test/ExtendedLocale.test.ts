
/*
Test settings for locale, including extensions for calendar and numbering

test that undefined, '' and 'default' are acceptable for system locale

check calendar for japanese, chinese... find others maybe from test262
const invalidCalendarOptions = [
  "",
  "a",
  "ab",
  "abcdefghi",
  "abc-abcdefghi",
  "!invalid!",
  "-gregory-",
  "gregory-",
  "gregory--",
  "gregory-nu",
  "gregory-nu-",
  "gregory-nu-latn",
  "gregoryé",
  "gregory역법",
];

let supportedCalendars = ["gregory", "chinese"].filter(ca =>
  new Intl.DateTimeFormat(defaultLocale + "-u-ca-" + ca)
    .resolvedOptions().calendar === ca
);

Per MDN 'japanese' should also work

check numbering systems

let supportedNumberingSystems = ["latn", "arab"].filter(nu =>
  new Intl.DateTimeFormat(defaultLocale + "-u-nu-" + nu)
    .resolvedOptions().numberingSystem === nu
);

 */

import Tap from 'tap'

import F from '../src/Formatter'
import {checkIntlSupport, useIntl} from "../src/Formatter";
import {formatV} from '../src/Formatter'
import fileOps from '../src/NodeFileOps'
import {setFileOps} from "../src/Formatter";
import i18n from "../src/i18n";
import {getUseIntlChoice} from "../index";

setFileOps(fileOps)

function extLocaleTest() {
    let r, x, desc
    let tn = 0;
    let intlAvailable = checkIntlSupport() === 'complete'

    // Disabling because number conversions may not be supported in all versions of intl
    // and I don't have a sub-test for that level of compliance
    // TODO: check for level of compliance better and adjust tests here for a partial support case
    // Also, see if we can do more with hasI18nStrings --- doesn't look like I use it for these tests, which seems odd
    // intlAvailable = false;

    // Limit numbering tests to latin, which may be necessary with certain Intl packages
    const latinNumberingOnlyForMatrix = true


    if(intlAvailable) {
        useIntl(true)
    }
    let stats:any = i18n.setLocale() // default locale
    let hasI18nStrings = (stats && stats.totalStrings)

    Tap.test('diffs and more', t => {

        t.skip({name: `COMMENT: Intl Availability is '${checkIntlSupport()}'. These tests were made with ${intlAvailable? 'full' : 'no'} Intl support`} as any)
        t.skip({name: `COMMENT: hasI18nStrings is  '${hasI18nStrings}'.`} as any)

        let dts = '2021-07-01T16:03:00Z'

        desc = 'Check use with default locale'
        r = F(`date?utc|full`, dts)
        x = 'Thursday, July 1, 2021 at 4:03:00 PM Coordinated Universal Time'
        let fbx = r;
        t.ok(r === x, `${tn++}) ${desc}: expected "${x}", got "${r}"` as any)

        desc = 'Check use with locale = "default"'
        r = F(`date?utc~default|full`, dts)
        x = fbx  // equivalent
        t.ok(r === x, `${tn++}) ${desc}: expected "${x}", got "${r}"` as any)

        desc = 'Check use with invalid locale, foobar'
        r = F(`date?utc~foobar|full`, dts)
        x = fbx  // fallback to system (en-US)
        t.ok(r === x, `${tn++}) ${desc}: expected "${x}", got "${r}"` as any)

        let fbx2 = fbx
        if(!getUseIntlChoice()) {
            // separator changes on the reset... (minor weirdness)
            fbx2 = "Thursday, July 1, 2021, 16:03:00 Coordinated Universal Time"
        }
        // desc = 'Check use with invalid locale, fu-BR'
        // r = F(`date?utc~fu-BR|full`, dts)
        // x = fbx2  // default full
        // t.ok(r === x, `${tn++}) ${desc}: expected "${x}", got "${r}"` as any)

        desc = 'Check use with undefined locale and no tz cast'
        r = F(`date|full`, dts)
        x = fbx  // default full
        t.ok(r === x, `${tn++}) ${desc}: expected "${x}", got "${r}"` as any)

        desc = 'Check use with "" locale'
        r = F(`date?utc~|full`, dts)
        x = fbx  // default full
        t.ok(r === x, `${tn++}) ${desc}: expected "${x}", got "${r}"` as any)

        desc = 'Check use with "default" locale'
        r = F(`date?utc~default|full`, dts)
        x = fbx  // default full
        t.ok(r === x, `${tn++}) ${desc}: expected "${x}", got "${r}"` as any)

        // desc = 'Check use with valid but unsupported locale'
        // r = F(`date?utc~ban-UD|full`, dts)
        // x = fbx2  // default full
        // t.ok(r === x, `${tn++}) ${desc}: expected "${x}", got "${r}"` as any)

        desc = 'Check attempt to include a fallback locale'
        r = F(`date?utc~ban-UD, es-ES|full`, dts)
        x = fbx  // default full
        t.ok(r === x, `${tn++}) ${desc}: expected "${x}", got "${r}"` as any)

        desc = 'check invalid calendar option'
        r = F(`date?utc~en-US-u-ca-foobar|full`, dts)
        x = 'Thursday, July 1, 2021 at 4:03:00 PM Coordinated Universal Time' // no error, just ignores calendar
        t.ok(r === x, `${tn++}) ${desc}: expected "${x}", got "${r}"` as any)

        desc = 'check calendar option gregory'
        r = F(`date?utc~en-US-u-ca-gregory|full`, dts)
        x = 'Thursday, July 1, 2021 at 4:03:00 PM Coordinated Universal Time'
        t.ok(r === x, `${tn++}) ${desc}: expected "${x}", got "${r}"` as any)

        desc = 'check calendar option chinese'
        r = F(`date?utc~en-US-u-ca-chinese|full`, dts)
        if(intlAvailable) {
            x = 'Thursday, Fifth Month 22, 2021(xin-chou) at 4:03:00 PM Coordinated Universal Time'
        } else {
            // extension ignored if no intl
            x = 'Thursday, July 1, 2021 at 4:03:00 PM Coordinated Universal Time'
        }
        t.ok(r === x, `${tn++}) ${desc}: expected "${x}", got "${r}"` as any)

        desc = 'check calendar option japanese'
        r = F(`date?utc~en-US-u-ca-japanese|full`, dts)
        if(intlAvailable) {
            x = 'Thursday, July 1, 3 Reiwa at 4:03:00 PM Coordinated Universal Time'
        } else {
            // extension ignored if no intl
            x = 'Thursday, July 1, 2021 at 4:03:00 PM Coordinated Universal Time'
        }
        t.ok(r === x, `${tn++}) ${desc}: expected "${x}", got "${r}"` as any)

        desc = 'check invalid numbering option'
        r = F(`date?utc~en-US-u-nu-foobar|full`, dts)
        x = 'Thursday, July 1, 2021 at 4:03:00 PM Coordinated Universal Time' // no error, just ignores option
        t.ok(r === x, `${tn++}) ${desc}: expected "${x}", got "${r}"` as any)

        desc = 'check numbering system latn'
        r = F(`date?utc~en-US-u-nu-latn|full`, dts)
        x = 'Thursday, July 1, 2021 at 4:03:00 PM Coordinated Universal Time'
        t.ok(r === x, `${tn++}) ${desc}: expected "${x}", got "${r}"` as any)

        desc = 'check numbering system arab'
        r = F(`date?utc~en-US-u-nu-arab|full`, dts)
        if(intlAvailable) {
            x = 'Thursday, July ١, ٢٠٢١ at ٤:٠٣:٠٠ PM Coordinated Universal Time'
        } else {
            // extension ignored if no intl
            x = 'Thursday, July 1, 2021 at 4:03:00 PM Coordinated Universal Time'
        }
        t.ok(r === x, `${tn++}) ${desc}: expected "${x}", got "${r}"` as any)

        if(latinNumberingOnlyForMatrix) {
            t.skip({name: 'COMMENT: Not testing chinese or full matrix numbering because limited number support is enabled'} as any)
        } else {
            desc = 'check numbering system hans (simplified chinese)'
            r = F(`date?utc~en-US-u-nu-hans|full`, dts)
            if (intlAvailable) {
                x = 'Thursday, July 一, 二千零二十一 at 四:三:零 PM Coordinated Universal Time'
            } else {
                // extension ignored if no intl
                x = 'Thursday, July 1, 2021 at 4:03:00 PM Coordinated Universal Time'
            }
            t.ok(r === x, `${tn++}) ${desc}: expected "${x}", got "${r}"` as any)

            desc = 'check numbering system hant (traditional chinese)'
            r = F(`date?utc~en-US-u-nu-hant|full`, dts)
            if(intlAvailable) {
                x = 'Thursday, July 一, 二千零二十一 at 四:三:零 PM Coordinated Universal Time'
            } else {
                // extension ignored if no intl
                x = hasI18nStrings ? "Thursday, July 1, 2021 at 4:03:00 PM Coordinated Universal Time"
                    : 'Thursday, July 1, 2021 at 4:03:00 PM Coordinated Universal Time'
            }
            t.ok(r === x, `${tn++}) ${desc}: expected "${x}", got "${r}"` as any)
        }


        desc = `check a known combination without a locale`
        r = F(`date?utc~u-nu-hans-ca-chinese|full`, dts)
        x = 'Thursday, Fifth Month 二十二, 二千零二十一(xin-chou) at 四:三:零 PM Coordinated Universal Time'
        if(intlAvailable) {
            //x = 'Thursday, Fifth Month 二十二, 二千零二十一(xin-chou) at 四:三:零 PM Coordinated Universal Time'
            x = 'Thursday, Fifth Month 22, 2021(xin-chou) at 4:03:00 PM Coordinated Universal Time'
        } else {
            // extension ignored if no intl
            x = hasI18nStrings ? 'Thursday, July 1, 2021 at 4:03:00 PM Coordinated Universal Time'
                : 'Thursday, July 1, 2021 at 4:03:00 PM Coordinated Universal Time'
        }
        t.ok(r === x, `${tn++}) ${desc}: expected "${x}", got "${r}"` as any)

        // desc = `check a known combination with a locale`
        // r = F(`date?utc~zh-CH-u-nu-hans-ca-chinese|full`, dts)
        // if(intlAvailable) {
        //     x = '二千零二十一辛丑年五月廿二星期四 协调世界时 下午四:三:零'
        // } else {
        //     x = hasI18nStrings ? '星期四 1 七月 2021 at 16:03:00 Coordinated Universal Time' : fbx2
        // }
        // t.ok(r === x, `${tn++}) ${desc}: expected "${x}", got "${r}"` as any)

        desc = "check matrix of calendar and numbering combinations"
        // TODO: all the values from the CLDR.  These are just a select few.
        const expects = {
            "arab-buddhist" : "Thursday, July ١, ٢٥٦٤ BE at ٤:٠٣:٠٠ PM Coordinated Universal Time",
            "arab-chinese" :  "Thursday, Fifth Month ٢٢, ٢٠٢١(xin-chou) at ٤:٠٣:٠٠ PM Coordinated Universal Time",
            "arab-coptic" :  "Thursday, Paona ٢٤, ١٧٣٧ ERA1 at ٤:٠٣:٠٠ PM Coordinated Universal Time",
            "arab-dangi" :  "Thursday, Fifth Month ٢٢, ٢٠٢١(xin-chou) at ٤:٠٣:٠٠ PM Coordinated Universal Time",
            "arab-ethiopic" :  "Thursday, Sene ٢٤, ٢٠١٣ ERA1 at ٤:٠٣:٠٠ PM Coordinated Universal Time",
            "arab-gregory" :  "Thursday, July ١, ٢٠٢١ at ٤:٠٣:٠٠ PM Coordinated Universal Time",
            "arab-hebrew" :  "Thursday, ٢١ Tamuz ٥٧٨١ at ٤:٠٣:٠٠ PM Coordinated Universal Time",
            "arab-indian" :  "Thursday, Asadha ١٠, ١٩٤٣ Saka at ٤:٠٣:٠٠ PM Coordinated Universal Time",
            "arab-islamic" :  "Thursday, Dhuʻl-Qiʻdah ٢١, ١٤٤٢ AH at ٤:٠٣:٠٠ PM Coordinated Universal Time",
            "arab-japanese" :  "Thursday, July ١, ٣ Reiwa at ٤:٠٣:٠٠ PM Coordinated Universal Time",
            "arab-persian" :  "Thursday, Tir ١٠, ١٤٠٠ AP at ٤:٠٣:٠٠ PM Coordinated Universal Time",
            "arab-roc" :  "Thursday, July ١, ١١٠ Minguo at ٤:٠٣:٠٠ PM Coordinated Universal Time",
            "bali-buddhist" :  "Thursday, July ᭑, ᭒᭕᭖᭔ BE at ᭔:᭐᭓:᭐᭐ PM Coordinated Universal Time",
            "bali-chinese" :  "Thursday, Fifth Month ᭒᭒, ᭒᭐᭒᭑(xin-chou) at ᭔:᭐᭓:᭐᭐ PM Coordinated Universal Time",
            "bali-coptic" :  "Thursday, Paona ᭒᭔, ᭑᭗᭓᭗ ERA1 at ᭔:᭐᭓:᭐᭐ PM Coordinated Universal Time",
            "bali-dangi" :  "Thursday, Fifth Month ᭒᭒, ᭒᭐᭒᭑(xin-chou) at ᭔:᭐᭓:᭐᭐ PM Coordinated Universal Time",
            "bali-ethiopic" :  "Thursday, Sene ᭒᭔, ᭒᭐᭑᭓ ERA1 at ᭔:᭐᭓:᭐᭐ PM Coordinated Universal Time",
            "bali-gregory" :  "Thursday, July ᭑, ᭒᭐᭒᭑ at ᭔:᭐᭓:᭐᭐ PM Coordinated Universal Time",
            "bali-hebrew" :  "Thursday, ᭒᭑ Tamuz ᭕᭗᭘᭑ at ᭔:᭐᭓:᭐᭐ PM Coordinated Universal Time",
            "bali-indian" :  "Thursday, Asadha ᭑᭐, ᭑᭙᭔᭓ Saka at ᭔:᭐᭓:᭐᭐ PM Coordinated Universal Time",
            "bali-islamic" :  "Thursday, Dhuʻl-Qiʻdah ᭒᭑, ᭑᭔᭔᭒ AH at ᭔:᭐᭓:᭐᭐ PM Coordinated Universal Time",
            "bali-japanese" :  "Thursday, July ᭑, ᭓ Reiwa at ᭔:᭐᭓:᭐᭐ PM Coordinated Universal Time",
            "bali-persian" :  "Thursday, Tir ᭑᭐, ᭑᭔᭐᭐ AP at ᭔:᭐᭓:᭐᭐ PM Coordinated Universal Time",
            "bali-roc" :  "Thursday, July ᭑, ᭑᭑᭐ Minguo at ᭔:᭐᭓:᭐᭐ PM Coordinated Universal Time",
            "brah-buddhist" :  "Thursday, July 𑁧, 𑁨𑁫𑁬𑁪 BE at 𑁪:𑁦𑁩:𑁦𑁦 PM Coordinated Universal Time",
            "brah-chinese" :  "Thursday, Fifth Month 𑁨𑁨, 𑁨𑁦𑁨𑁧(xin-chou) at 𑁪:𑁦𑁩:𑁦𑁦 PM Coordinated Universal Time",
            "brah-coptic" :  "Thursday, Paona 𑁨𑁪, 𑁧𑁭𑁩𑁭 ERA1 at 𑁪:𑁦𑁩:𑁦𑁦 PM Coordinated Universal Time",
            "brah-dangi" :  "Thursday, Fifth Month 𑁨𑁨, 𑁨𑁦𑁨𑁧(xin-chou) at 𑁪:𑁦𑁩:𑁦𑁦 PM Coordinated Universal Time",
            "brah-ethiopic" :  "Thursday, Sene 𑁨𑁪, 𑁨𑁦𑁧𑁩 ERA1 at 𑁪:𑁦𑁩:𑁦𑁦 PM Coordinated Universal Time",
            "brah-gregory" :  "Thursday, July 𑁧, 𑁨𑁦𑁨𑁧 at 𑁪:𑁦𑁩:𑁦𑁦 PM Coordinated Universal Time",
            "brah-hebrew" :  "Thursday, 𑁨𑁧 Tamuz 𑁫𑁭𑁮𑁧 at 𑁪:𑁦𑁩:𑁦𑁦 PM Coordinated Universal Time",
            "brah-indian" :  "Thursday, Asadha 𑁧𑁦, 𑁧𑁯𑁪𑁩 Saka at 𑁪:𑁦𑁩:𑁦𑁦 PM Coordinated Universal Time",
            "brah-islamic" :  "Thursday, Dhuʻl-Qiʻdah 𑁨𑁧, 𑁧𑁪𑁪𑁨 AH at 𑁪:𑁦𑁩:𑁦𑁦 PM Coordinated Universal Time",
            "brah-japanese" :  "Thursday, July 𑁧, 𑁩 Reiwa at 𑁪:𑁦𑁩:𑁦𑁦 PM Coordinated Universal Time",
            "brah-persian" :  "Thursday, Tir 𑁧𑁦, 𑁧𑁪𑁦𑁦 AP at 𑁪:𑁦𑁩:𑁦𑁦 PM Coordinated Universal Time",
            "brah-roc" :  "Thursday, July 𑁧, 𑁧𑁧𑁦 Minguo at 𑁪:𑁦𑁩:𑁦𑁦 PM Coordinated Universal Time",
            "cyrl-buddhist" :  "Thursday, July а҃, ҂вфѯ҃д BE at д҃:г҃:0҃ PM Coordinated Universal Time",
            "cyrl-chinese" :  "Thursday, Fifth Month к҃в, ҂вк҃а(xin-chou) at д҃:г҃:0҃ PM Coordinated Universal Time",
            "cyrl-coptic" :  "Thursday, Paona к҃д, ҂аѱл҃з ERA1 at д҃:г҃:0҃ PM Coordinated Universal Time",
            "cyrl-dangi" :  "Thursday, Fifth Month к҃в, ҂вк҃а(xin-chou) at д҃:г҃:0҃ PM Coordinated Universal Time",
            "cyrl-ethiopic" :  "Thursday, Sene к҃д, ҂вг҃і ERA1 at д҃:г҃:0҃ PM Coordinated Universal Time",
            "cyrl-gregory" :  "Thursday, July а҃, ҂вк҃а at д҃:г҃:0҃ PM Coordinated Universal Time",
            "cyrl-hebrew" :  "Thursday, к҃а Tamuz ҂єѱп҃а at д҃:г҃:0҃ PM Coordinated Universal Time",
            "cyrl-indian" :  "Thursday, Asadha і҃, ҂ацм҃г Saka at д҃:г҃:0҃ PM Coordinated Universal Time",
            "cyrl-islamic" :  "Thursday, Dhuʻl-Qiʻdah к҃а, ҂аум҃в AH at д҃:г҃:0҃ PM Coordinated Universal Time",
            "cyrl-japanese" :  "Thursday, July а҃, г҃ Reiwa at д҃:г҃:0҃ PM Coordinated Universal Time",
            "cyrl-persian" :  "Thursday, Tir і҃, ҂ау҃ AP at д҃:г҃:0҃ PM Coordinated Universal Time",
            "cyrl-roc" :  "Thursday, July а҃, р҃і Minguo at д҃:г҃:0҃ PM Coordinated Universal Time",
            "grek-buddhist" :  "Thursday, July Α´, ͵ΒΦΞΔ´ BE at Δ´:Γ´:𐆊´ PM Coordinated Universal Time",
            "grek-chinese" :  "Thursday, Fifth Month ΚΒ´, ͵ΒΚΑ´(xin-chou) at Δ´:Γ´:𐆊´ PM Coordinated Universal Time",
            "grek-coptic" :  "Thursday, Paona ΚΔ´, ͵ΑΨΛΖ´ ERA1 at Δ´:Γ´:𐆊´ PM Coordinated Universal Time",
            "grek-dangi" :  "Thursday, Fifth Month ΚΒ´, ͵ΒΚΑ´(xin-chou) at Δ´:Γ´:𐆊´ PM Coordinated Universal Time",
            "grek-ethiopic" :  "Thursday, Sene ΚΔ´, ͵ΒΙΓ´ ERA1 at Δ´:Γ´:𐆊´ PM Coordinated Universal Time",
            "grek-gregory" :  "Thursday, July Α´, ͵ΒΚΑ´ at Δ´:Γ´:𐆊´ PM Coordinated Universal Time",
            "grek-hebrew" :  "Thursday, ΚΑ´ Tamuz ͵ΕΨΠΑ´ at Δ´:Γ´:𐆊´ PM Coordinated Universal Time",
            "grek-indian" :  "Thursday, Asadha Ι´, ͵ΑϠΜΓ´ Saka at Δ´:Γ´:𐆊´ PM Coordinated Universal Time",
            "grek-islamic" :  "Thursday, Dhuʻl-Qiʻdah ΚΑ´, ͵ΑΥΜΒ´ AH at Δ´:Γ´:𐆊´ PM Coordinated Universal Time",
            "grek-japanese" :  "Thursday, July Α´, Γ´ Reiwa at Δ´:Γ´:𐆊´ PM Coordinated Universal Time",
            "grek-persian" :  "Thursday, Tir Ι´, ͵ΑΥ´ AP at Δ´:Γ´:𐆊´ PM Coordinated Universal Time",
            "grek-roc" :  "Thursday, July Α´, ΡΙ´ Minguo at Δ´:Γ´:𐆊´ PM Coordinated Universal Time",
            "latn-buddhist" :  "Thursday, July 1, 2564 BE at 4:03:00 PM Coordinated Universal Time",
            "latn-chinese" :  "Thursday, Fifth Month 22, 2021(xin-chou) at 4:03:00 PM Coordinated Universal Time",
            "latn-coptic" :  "Thursday, Paona 24, 1737 ERA1 at 4:03:00 PM Coordinated Universal Time",
            "latn-dangi" :  "Thursday, Fifth Month 22, 2021(xin-chou) at 4:03:00 PM Coordinated Universal Time",
            "latn-ethiopic" :  "Thursday, Sene 24, 2013 ERA1 at 4:03:00 PM Coordinated Universal Time",
            "latn-gregory" :  "Thursday, July 1, 2021 at 4:03:00 PM Coordinated Universal Time",
            "latn-hebrew" :  "Thursday, 21 Tamuz 5781 at 4:03:00 PM Coordinated Universal Time",
            "latn-indian" :  "Thursday, Asadha 10, 1943 Saka at 4:03:00 PM Coordinated Universal Time",
            "latn-islamic" :  "Thursday, Dhuʻl-Qiʻdah 21, 1442 AH at 4:03:00 PM Coordinated Universal Time",
            "latn-japanese" :  "Thursday, July 1, 3 Reiwa at 4:03:00 PM Coordinated Universal Time",
            "latn-persian" :  "Thursday, Tir 10, 1400 AP at 4:03:00 PM Coordinated Universal Time",
            "latn-roc" :  "Thursday, July 1, 110 Minguo at 4:03:00 PM Coordinated Universal Time",
            "hans-buddhist" :  "Thursday, July 一, 二千五百六十四 BE at 四:三:零 PM Coordinated Universal Time",
            "hans-chinese" :  "Thursday, Fifth Month 二十二, 二千零二十一(xin-chou) at 四:三:零 PM Coordinated Universal Time",
            "hans-coptic" :  "Thursday, Paona 二十四, 一千七百三十七 ERA1 at 四:三:零 PM Coordinated Universal Time",
            "hans-dangi" :  "Thursday, Fifth Month 二十二, 二千零二十一(xin-chou) at 四:三:零 PM Coordinated Universal Time",
            "hans-ethiopic" :  "Thursday, Sene 二十四, 二千零一十三 ERA1 at 四:三:零 PM Coordinated Universal Time",
            "hans-gregory" :  "Thursday, July 一, 二千零二十一 at 四:三:零 PM Coordinated Universal Time",
            "hans-hebrew" :  "Thursday, 二十一 Tamuz 五千七百八十一 at 四:三:零 PM Coordinated Universal Time",
            "hans-indian" :  "Thursday, Asadha 十, 一千九百四十三 Saka at 四:三:零 PM Coordinated Universal Time",
            "hans-islamic" :  "Thursday, Dhuʻl-Qiʻdah 二十一, 一千四百四十二 AH at 四:三:零 PM Coordinated Universal Time",
            "hans-japanese" :  "Thursday, July 一, 三 Reiwa at 四:三:零 PM Coordinated Universal Time",
            "hans-persian" :  "Thursday, Tir 十, 一千四百 AP at 四:三:零 PM Coordinated Universal Time",
            "hans-roc" :  "Thursday, July 一, 一百一十 Minguo at 四:三:零 PM Coordinated Universal Time",
            "jpan-buddhist" :  "Thursday, July 一, 二千五百六十四 BE at 四:三:〇 PM Coordinated Universal Time",
            "jpan-chinese" :  "Thursday, Fifth Month 二十二, 二千二十一(xin-chou) at 四:三:〇 PM Coordinated Universal Time",
            "jpan-coptic" :  "Thursday, Paona 二十四, 千七百三十七 ERA1 at 四:三:〇 PM Coordinated Universal Time",
            "jpan-dangi" :  "Thursday, Fifth Month 二十二, 二千二十一(xin-chou) at 四:三:〇 PM Coordinated Universal Time",
            "jpan-ethiopic" :  "Thursday, Sene 二十四, 二千十三 ERA1 at 四:三:〇 PM Coordinated Universal Time",
            "jpan-gregory" :  "Thursday, July 一, 二千二十一 at 四:三:〇 PM Coordinated Universal Time",
            "jpan-hebrew" :  "Thursday, 二十一 Tamuz 五千七百八十一 at 四:三:〇 PM Coordinated Universal Time",
            "jpan-indian" :  "Thursday, Asadha 十, 千九百四十三 Saka at 四:三:〇 PM Coordinated Universal Time",
            "jpan-islamic" :  "Thursday, Dhuʻl-Qiʻdah 二十一, 千四百四十二 AH at 四:三:〇 PM Coordinated Universal Time",
            "jpan-japanese" :  "Thursday, July 一, 三 Reiwa at 四:三:〇 PM Coordinated Universal Time",
            "jpan-persian" :  "Thursday, Tir 十, 千四百 AP at 四:三:〇 PM Coordinated Universal Time",
            "jpan-roc" :  "Thursday, July 一, 百十 Minguo at 四:三:〇 PM Coordinated Universal Time",
            "hebr-buddhist" :  "Thursday, July א׳, ב׳תקס״ד BE at ד׳:ג׳:״׳ PM Coordinated Universal Time",
            "hebr-chinese" :  "Thursday, Fifth Month כ״ב, ב׳כ״א(xin-chou) at ד׳:ג׳:״׳ PM Coordinated Universal Time",
            "hebr-coptic" :  "Thursday, Paona כ״ד, א׳תשל״ז ERA1 at ד׳:ג׳:״׳ PM Coordinated Universal Time",
            "hebr-dangi" :  "Thursday, Fifth Month כ״ב, ב׳כ״א(xin-chou) at ד׳:ג׳:״׳ PM Coordinated Universal Time",
            "hebr-ethiopic" :  "Thursday, Sene כ״ד, ב׳י״ג ERA1 at ד׳:ג׳:״׳ PM Coordinated Universal Time",
            "hebr-gregory" :  "Thursday, July א׳, ב׳כ״א at ד׳:ג׳:״׳ PM Coordinated Universal Time",
            "hebr-hebrew" :  "Thursday, כ״א Tamuz ה׳תשפ״א at ד׳:ג׳:״׳ PM Coordinated Universal Time",
            "hebr-indian" :  "Thursday, Asadha י׳, א׳תתקמ״ג Saka at ד׳:ג׳:״׳ PM Coordinated Universal Time",
            "hebr-islamic" :  "Thursday, Dhuʻl-Qiʻdah כ״א, א׳תמ״ב AH at ד׳:ג׳:״׳ PM Coordinated Universal Time",
            "hebr-japanese" :  "Thursday, July א׳, ג׳ Reiwa at ד׳:ג׳:״׳ PM Coordinated Universal Time",
            "hebr-persian" :  "Thursday, Tir י׳, א׳ת׳ AP at ד׳:ג׳:״׳ PM Coordinated Universal Time",
            "hebr-roc" :  "Thursday, July א׳, ק״י Minguo at ד׳:ג׳:״׳ PM Coordinated Universal Time",
            "khmr-buddhist" :  "Thursday, July ១, ២៥៦៤ BE at ៤:០៣:០០ PM Coordinated Universal Time",
            "khmr-chinese" :  "Thursday, Fifth Month ២២, ២០២១(xin-chou) at ៤:០៣:០០ PM Coordinated Universal Time",
            "khmr-coptic" :  "Thursday, Paona ២៤, ១៧៣៧ ERA1 at ៤:០៣:០០ PM Coordinated Universal Time",
            "khmr-dangi" :  "Thursday, Fifth Month ២២, ២០២១(xin-chou) at ៤:០៣:០០ PM Coordinated Universal Time",
            "khmr-ethiopic" :  "Thursday, Sene ២៤, ២០១៣ ERA1 at ៤:០៣:០០ PM Coordinated Universal Time",
            "khmr-gregory" :  "Thursday, July ១, ២០២១ at ៤:០៣:០០ PM Coordinated Universal Time",
            "khmr-hebrew" :  "Thursday, ២១ Tamuz ៥៧៨១ at ៤:០៣:០០ PM Coordinated Universal Time",
            "khmr-indian" :  "Thursday, Asadha ១០, ១៩៤៣ Saka at ៤:០៣:០០ PM Coordinated Universal Time",
            "khmr-islamic" :  "Thursday, Dhuʻl-Qiʻdah ២១, ១៤៤២ AH at ៤:០៣:០០ PM Coordinated Universal Time",
            "khmr-japanese" :  "Thursday, July ១, ៣ Reiwa at ៤:០៣:០០ PM Coordinated Universal Time",
            "khmr-persian" :  "Thursday, Tir ១០, ១៤០០ AP at ៤:០៣:០០ PM Coordinated Universal Time",
            "khmr-roc" :  "Thursday, July ១, ១១០ Minguo at ៤:០៣:០០ PM Coordinated Universal Time",
            "telu-buddhist" :  "Thursday, July ౧, ౨౫౬౪ BE at ౪:౦౩:౦౦ PM Coordinated Universal Time",
            "telu-chinese" :  "Thursday, Fifth Month ౨౨, ౨౦౨౧(xin-chou) at ౪:౦౩:౦౦ PM Coordinated Universal Time",
            "telu-coptic" :  "Thursday, Paona ౨౪, ౧౭౩౭ ERA1 at ౪:౦౩:౦౦ PM Coordinated Universal Time",
            "telu-dangi" :  "Thursday, Fifth Month ౨౨, ౨౦౨౧(xin-chou) at ౪:౦౩:౦౦ PM Coordinated Universal Time",
            "telu-ethiopic" :  "Thursday, Sene ౨౪, ౨౦౧౩ ERA1 at ౪:౦౩:౦౦ PM Coordinated Universal Time",
            "telu-gregory" :  "Thursday, July ౧, ౨౦౨౧ at ౪:౦౩:౦౦ PM Coordinated Universal Time",
            "telu-hebrew" :  "Thursday, ౨౧ Tamuz ౫౭౮౧ at ౪:౦౩:౦౦ PM Coordinated Universal Time",
            "telu-indian" :  "Thursday, Asadha ౧౦, ౧౯౪౩ Saka at ౪:౦౩:౦౦ PM Coordinated Universal Time",
            "telu-islamic" :  "Thursday, Dhuʻl-Qiʻdah ౨౧, ౧౪౪౨ AH at ౪:౦౩:౦౦ PM Coordinated Universal Time",
            "telu-japanese" :  "Thursday, July ౧, ౩ Reiwa at ౪:౦౩:౦౦ PM Coordinated Universal Time",
            "telu-persian" :  "Thursday, Tir ౧౦, ౧౪౦౦ AP at ౪:౦౩:౦౦ PM Coordinated Universal Time",
            "telu-roc" :  "Thursday, July ౧, ౧౧౦ Minguo at ౪:౦౩:౦౦ PM Coordinated Universal Time"

        }
        const nus = ['arab', 'bali', 'brah', 'cyrl', 'grek', 'latn', 'hans', 'jpan', 'hebr', 'khmr', 'telu']
        const cas = ['buddhist', 'chinese', 'coptic', 'dangi', 'ethiopic', 'gregory', 'hebrew', 'indian', 'islamic', 'japanese', 'persian', 'roc']
        let c = 1;
        for(let num of nus) {
            if(latinNumberingOnlyForMatrix) num = 'latn'
            for(const cal of cas) {
                const loc = `en-US-u-nu-${num}-ca-${cal}`
                let d = desc + ` (case ${c}: ${num}-${cal})`
                c++
                r = F(`date?utc~${loc}|full`, dts)
                // if no intl, extensions are ignored
                x = intlAvailable ? expects[`${num}-${cal}`] : 'Thursday, July 1, 2021 at 4:03:00 PM Coordinated Universal Time'
                t.ok(r === x, `${tn++}) ${d}: expected "${x}", got "${r}"` as any)
            }
            if(latinNumberingOnlyForMatrix) break;
        }


        t.end()
    })
}

extLocaleTest()


