import Tap from 'tap'

import F, {checkIntlSupport, useIntl} from '../src/Formatter'
import fileOps from '../src/NodeFileOps'
import {setFileOps} from "../src/Formatter";
setFileOps(fileOps)

import i18n from '../src/i18n'

import {setArtificialNow, getNow} from "../src/format/DateRangeFormatter";
import expectations from "./localizedExpectations"
const testLocales = Object.getOwnPropertyNames(expectations)

function localizationTests(loc) {
    let r, x, desc
    let tn = 0;
    let intlAvailable = checkIntlSupport() === 'complete'
    if (intlAvailable) {
        useIntl(true)
    }
    setArtificialNow('2021-07-06T12:24:56Z') // anchor our test date
    Tap.test('Localization for ' + loc, t => {

        let dt1 = '2021-02-14T12:34:56Z'
        let dt2 = '2021-07-06T12:34:56Z'
        let ti = 0;

        t.skip('COMMENT: tested locale '+ loc)

        desc="full date is localized"
        r = F(`date~${loc}|full`, dt1)
        x = expectations[loc][ti++]
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="long date is localized"
        r = F(`date~${loc}|long`, dt1)
        x = expectations[loc][ti++]
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="short date is localized"
        r = F(`date~${loc}|short`, dt1)
        x = expectations[loc][ti++]
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="range is localized"
        r = F(`date~${loc}|full`, [dt1, dt2])
        x = expectations[loc][ti++]
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="now is localized"
        r = F(`date~${loc}|human`, 'now')
        x = expectations[loc][ti++]
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="moments ago is localized"
        r = F(`date~${loc}|human`, getNow() - 5000)
        x = expectations[loc][ti++]
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="moments away is localized"
        r = F(`date~${loc}|human`, getNow() + 5000)
        x = expectations[loc][ti++]
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="today is localized"
        let dt = new Date(getNow())
        r=F(`date~${loc}|human-none`, dt)
        x = expectations[loc][ti++]
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="tomorrow is localized"
        dt = new Date(getNow())
        dt.setUTCDate(dt.getUTCDate()+1)
        r=F(`date~${loc}|human-none`, dt)
        x = expectations[loc][ti++]
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="yesterday is localized"
        dt = new Date(getNow())
        dt.setUTCDate(dt.getUTCDate()-1)
        r=F(`date~${loc}|human-none`, dt)
        x = expectations[loc][ti++]
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="a year ago localized"
        dt = new Date(getNow())
        dt.setUTCFullYear(dt.getUTCFullYear()-1)
        r=F(`date~${loc}|human-none`, dt)
        x = expectations[loc][ti++]
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="a month ago localized"
        dt = new Date(getNow())
        dt.setUTCMonth(dt.getUTCMonth()-1)
        r=F(`date~${loc}|human-none`, dt)
        x = expectations[loc][ti++]
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="a week ago localized"
        dt = new Date(getNow())
        dt.setUTCDate(dt.getUTCDate()-7)
        r=F(`date~${loc}|human-none`, dt)
        x = expectations[loc][ti++]
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="a day ago localized"
        dt = new Date(getNow())
        dt.setUTCDate(dt.getUTCDate()-1)
        r=F(`date~${loc}|human-none`, dt)
        x = expectations[loc][ti++]
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="an hour ago localized"
        dt = new Date(getNow())
        dt.setUTCHours(dt.getUTCHours()-1)
        r=F(`date~${loc}|human`, dt)
        x = expectations[loc][ti++]
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="a minute ago localized"
        dt = new Date(getNow())
        dt.setUTCMinutes(dt.getUTCMinutes()-1)
        r=F(`date~${loc}|human`, dt)
        x = expectations[loc][ti++]
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="a second ago localized"
        dt = new Date(getNow())
        dt.setUTCSeconds(dt.getUTCSeconds()-1)
        r=F(`date~${loc}|human`, dt)
        x = expectations[loc][ti++]
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="a year from now localized"
        dt = new Date(getNow())
        dt.setUTCFullYear(dt.getUTCFullYear()+1)
        r=F(`date~${loc}|human-none`, dt)
        x = expectations[loc][ti++]
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="a month from now localized"
        dt = new Date(getNow())
        dt.setUTCMonth(dt.getUTCMonth()+1)
        r=F(`date~${loc}|human-none`, dt)
        x = expectations[loc][ti++]
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="a week from now localized"
        dt = new Date(getNow())
        dt.setUTCDate(dt.getUTCDate()+7)
        r=F(`date~${loc}|human-none`, dt)
        x = expectations[loc][ti++]
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="a day from now localized"
        dt = new Date(getNow())
        dt.setUTCDate(dt.getUTCDate()+1)
        r=F(`date~${loc}|human-none`, dt)
        x = expectations[loc][ti++]
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="an hour from now localized"
        dt = new Date(getNow())
        dt.setUTCHours(dt.getUTCHours()+1)
        r=F(`date~${loc}|human`, dt)
        x = expectations[loc][ti++]
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="a minute from now localized"
        dt = new Date(getNow())
        dt.setUTCMinutes(dt.getUTCMinutes()+1)
        r=F(`date~${loc}|human`, dt)
        x = expectations[loc][ti++]
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="a second from now localized"
        dt = new Date(getNow())
        dt.setUTCSeconds(dt.getUTCSeconds()+1)
        r=F(`date~${loc}|human`, dt)
        x = expectations[loc][ti++]
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)


        desc="4 years ago localized"
        dt = new Date(getNow())
        dt.setUTCFullYear(dt.getUTCFullYear()-4)
        r=F(`date~${loc}|human-none`, dt)
        x = expectations[loc][ti++]
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="4 months ago localized"
        dt = new Date(getNow())
        dt.setUTCMonth(dt.getUTCMonth()-4)
        r=F(`date~${loc}|human-none`, dt)
        x = expectations[loc][ti++]
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="3 weeks ago localized"
        dt = new Date(getNow())
        dt.setUTCDate(dt.getUTCDate()-21)
        r=F(`date~${loc}|human-none`, dt)
        x = expectations[loc][ti++]
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="4 days ago localized"
        dt = new Date(getNow())
        dt.setUTCDate(dt.getUTCDate()-4)
        r=F(`date~${loc}|human-none`, dt)
        x = expectations[loc][ti++]
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="2 days ago localized"
        dt = new Date(getNow())
        dt.setUTCDate(dt.getUTCDate()-2)
        r=F(`date~${loc}|human-none`, dt)
        x = expectations[loc][ti++]
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="2 hours ago localized"
        dt = new Date(getNow())
        dt.setUTCHours(dt.getUTCHours()-2)
        r=F(`date~${loc}|human`, dt)
        x = expectations[loc][ti++]
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="2 minutes ago localized"
        dt = new Date(getNow())
        dt.setUTCMinutes(dt.getUTCMinutes()-2)
        r=F(`date~${loc}|human`, dt)
        x = expectations[loc][ti++]
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="20 seconds ago localized"
        dt = new Date(getNow())
        dt.setUTCSeconds(dt.getUTCSeconds()-20)
        r=F(`date~${loc}|human`, dt)
        x = expectations[loc][ti++]
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)


        desc="4 years from now localized"
        dt = new Date(getNow())
        dt.setUTCFullYear(dt.getUTCFullYear()+4)
        r=F(`date~${loc}|human-none`, dt)
        x = expectations[loc][ti++]
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="4 months from now localized"
        dt = new Date(getNow())
        dt.setUTCMonth(dt.getUTCMonth()+4)
        r=F(`date~${loc}|human-none`, dt)
        x = expectations[loc][ti++]
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="3 weeks from now localized"
        dt = new Date(getNow())
        dt.setUTCDate(dt.getUTCDate()+21)
        r=F(`date~${loc}|human-none`, dt)
        x = expectations[loc][ti++]
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="4 days from now localized"
        dt = new Date(getNow())
        dt.setUTCDate(dt.getUTCDate()+4)
        r=F(`date~${loc}|human-none`, dt)
        x = expectations[loc][ti++]
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="2 days from now localized"
        dt = new Date(getNow())
        dt.setUTCDate(dt.getUTCDate()+2)
        r=F(`date~${loc}|human-none`, dt)
        x = expectations[loc][ti++]
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="2 hours from now localized"
        dt = new Date(getNow())
        dt.setUTCHours(dt.getUTCHours()+2)
        r=F(`date~${loc}|human`, dt)
        x = expectations[loc][ti++]
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="2 minutes from now localized"
        dt = new Date(getNow())
        dt.setUTCMinutes(dt.getUTCMinutes()+2)
        r=F(`date~${loc}|human`, dt)
        x = expectations[loc][ti++]
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        desc="20 seconds from now localized"
        dt = new Date(getNow())
        dt.setUTCSeconds(dt.getUTCSeconds()+20)
        r=F(`date~${loc}|human`, dt)
        x = expectations[loc][ti++]
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        t.end()
    })
}

function dateStringTests(loc) {
    let r, x, desc
    loc = (loc || '').split('-')[0].trim() // just use the language
    const stringIds = [
        "date.range.time.separator",
        "date.range.now",
        "date.range.one",
        "date.term.year",
        "date.term.year.plural",
        "date.abbr.year",
        "date.abbr.year.plural",
        "date.term.month",
        "date.term.month.plural",
        "date.abbr.month",
        "date.abbr.month.plural",
        "date.term.week",
        "date.term.week.plural",
        "date.abbr.week",
        "date.abbr.week.plural",
        "date.term.day",
        "date.term.day.plural",
        "date.abbr.day",
        "date.abbr.day.plural",
        "date.term.hour",
        "date.term.hour.plural",
        "date.abbr.hour",
        "date.abbr.hour.plural",
        "date.term.minute",
        "date.term.minute.plural",
        "date.abbr.minute",
        "date.abbr.minute.plural",
        "date.term.second",
        "date.term.second.plural",
        "date.abbr.second",
        "date.abbr.second.plural",
        "date.range.moments.ago",
        "date.range.moments.away",
        "date.range.ago",
        "date.range.today",
        "date.range.tomorrow",
        "date.range.yesterday",
        "date.range.weekday.next",
        "date.range.weekday.previous",
        "date.range.weekday.weeks.ago",
        "date.range.weekday.week.ahead",
        "date.range.weekday.weeks.ahead",
        "date.range.days.ago",
        "date.range.days.ahead"
    ]
    const expect = {
        "en" : [
        " at ",
        "now",
        "one",
        "year",
        "years",
        "yr.",
        "yr.",
        "month",
        "months",
        "mo.",
        "mo.",
        "week",
        "weeks",
        "wk.",
        "wk.",
        "day",
        "days",
        "dy.",
        "dy.",
        "hour",
        "hours",
        "hr.",
        "hr.",
        "minute",
        "minutes",
        "min.",
        "min.",
        "second",
        "seconds",
        "sec.",
        "sec.",
        "a few moments ago",
        "in a few moments",
        "ago",
        "today",
        "tomorrow",
        "yesterday",
        "next $weekday()",
        "$weekday(), last week",
        "$weekday(), $weeks(-1.0) weeks ago",
        "a week from $weekday()",
        "in $weeks(-1.0) weeks, on $weekday()",
        "$days(-1.0) days ago",
        "in $days(-1.0) days"
        ],
        "ar" : [
         " في ",
         "الآن",
         "واحد",

         "عام",
         "سنوات",
         "عام",
         "سنوات" ,

         "شهر",
         "الشهور",
         "شهر" ,
         "الشهور" ,

         "أسبوع",
         "أسابيع",
         "أسبوع",
         "أسابيع",

         "يوم",
         "أيام",
         "يوم",
         "أيام",

         "ساعة",
         "ساعات",
         "ساعة",
         "ساعات",

         "دقيقة",
         "الدقائق",
         "دقيقة",
         "الدقائق",

         "ثانيا",
         "ثواني",
         "ثانيا",
         "ثواني",

         "قبل لحظات قليلة" ,
         "في لحظات قليلة",
         "منذ",
         "اليوم",
         "غدا",
         "في الامس",
         "ال$weekday() القادمة",
         "ال$weekday() الأسبوع الماضي",
         "ال$weekday() ، قبل weeks$() أسابيع",
         "أسبوع من ال$weekday()",
         "في weeks$() أسابيع يوم ال$weekday()",
         "منذ $days() أيام",
         "في $days() أيام"
        ],
        "cs": [
         " v ",
         "nyní",
         "jeden",
         "rok",
         "rok",
         "rok",
         "rok",
         "měsíc",
         "měsíce",
         "měsíc.",
         "měsíce.",
         "týden",
         "týdny",
         "týden",
         "týdny",
         "den",
         "dny",
         "den",
         "dny",
         "hodina",
         "hodiny",
         "hodina",
         "hodiny",
         "minuta",
         "minut",
         "min.",
         "min.",
         "druhý",
         "sekundy",
         "sec.",
         "sec.",
         "před několika okamžiky",
         "za pár okamžiků",
         "před",
         "dnes",
         "zítra",
         "včera",
         "příští $weekday()",
         "$weekday(), minulý týden",
         "$weekday(), před $weeks(-1.0) týdny",
         "týden od $weekday()",
         "za $weeks(-1.0) týdny, v $weekday()",
         "Před $days(-1.0) dny",
         "za $days(-1.0) dny"     
        ],
        "de": [
         " um ",
         "jetzt",
         "einer",
         "jahr",
         "jahre",
         "jahr",
         "jahre",
         "monat",
         "monate",
         "monat",
         "monate",
         "woche",
         "wochen",
         "woce",
         "wochen",
         "tag",
         "tage",
         "tag",
         "tage",
         "stunde",
         "stunden",
         "std.",
         "std.",
         "minute",
         "minuten",
         "min.",
         "min.",
         "sekunde",
         "sekunden",
         "sek.",
         "sek.",
         "vor wenigen Augenblicken",
         "in ein paar Momenten",
         "vor",
         "heute",
         "morgen",
         "gestern",
         "nächsten $weekday()",
         "$weekday(), letzte Woche",
         "$weekday(), vor $weeks(-1.0) wochen",
         "eine Woche ab $weekday()",
         "in $weeks(-1.0) wochen, am $weekday()",
         "vor $days(-1.0) tagen",
         "in $days(-1.0) tagen"     
        ],
        "es": [
         "a las",
         "ahora",
         "uno",
         "año",
         "años",
         "año",
         "años",
         "mes",
         "meses",
         "mes",
         "mes",
         "semana",
         "semanas",
         "semana",
         "semana",
         "día",
         "días",
         "día",
         "días",
         "hora",
         "horas",
         "hora",
         "horas",
         "minuto",
         "minutos",
         "min.",
         "min.",
         "segundo",
         "segundos",
         "seg.",
         "seg.",
         "hace unos momentos",
         "en unos momentos",
         "hace",
         "hoy",
         "mañana",
         "ayer",
         " próximo $weekday()",
         "$weekday(), la semana pasada",
         "$weekday(), hace $weeks(-1.0) semanas",
         "una semana desde el $weekday()",
         "en $weeks(-1.0) semanas, el $weekday()",
         "hace $days(-1.0) dias",
         "en $days(-1.0) días"
        ],
        "fr" : [
         " à ",
         "à présent",
         "une",
         "an",
         "années",
         "an",
         "années",
         "mois",
         "mois",
         "mois",
         "mois",
         "semaine",
         "semaines",
         "semaine",
         "semaines",
         "journée",
         "journées",
         "journée",
         "journées",
         "heure",
         "les heures",
         "heure",
         "heures",
         "minute",
         "minutes",
         "min.",
         "min.",
         "seconde",
         "secondes",
         "sec.",
         "sec.",
         "il y a quelques instants",
         "dans quelques instants",
         "depuis",
         "aujourd'hui",
         "demain",
         "hier",
         "$weekday() prochain",
         "$weekday(), la semaine dernière",
         "$weekday(),il y a $weeks(-1.0) semaines",
         "une semaine à partir du $weekday()",
         "dans $weeks() semaines, le $weekday()",
         "Il ya $days(-1.0) jours",
         "dans $days(-1.0) jours"     
        ],
        "he" : [
         " בשעה ",
         "עַכשָׁיו",
         "אחד",
         "שָׁנָה",
         "שנים",
         "שָׁנָה.",
         "שנים.",
         "חוֹדֶשׁ",
         "חודשים",
         "חוֹדֶשׁ.",
         "חודשים",
         "שָׁבוּעַ",
         "שבועות",
         "שָׁבוּעַ",
         "שבועות",
         "יְוֹם",
         "ימים",
         "יְוֹם",
         "ימים",
         "שָׁעָה",
         "שעה (ות",
         "שָׁעָה",
         "שָׁעָה",
         "דַקָה",
         "דקות",
         "דַקָה",
         "דקות",
         "שְׁנִיָה",
         "שניות",
         "שְׁנִיָה",
         "שניות",
         "לפני כמה רגעים",
         "בעוד כמה רגעים",
         "לִפנֵי",
         "היום",
         "מָחָר",
         "אתמול",
         "יום $weekday()",
         "יום $weekday(), שבוע שעבר",
         "ב $weekday(), $weeks(-1.0) לפני שבועות",
         "שבוע מיום $weekday()",
         "בעוד $weeks(-1.0) שבועות, ביום $weekday()",
         "לפני $days(-1.0) ימים",
         "בעוד $days(-1.0) ימים"
        ],
        "hi" : [
         " पर ",
         "अब क",
         "एक",
         "साल",
         "वर्षों",
         "साल",
         "वर्षों",
         "महीना",
         "महीने",
         "महीना",
         "महीने",
         "सप्ताह",
         "सप्ताह",
         "सप्ताह",
         "सप्ताह",
         "दिन",
         "दिन",
         "दिन",
         "दिन",
         "घंटा",
         "घंटा",
         "घंटा",
         "घंटा",
         "मिनट",
         "मिनट",
         "मिनट",
         "मिनट",
         "दूसरा",
         "दूसरा",
         "दूसरा",
         "दूसरा",
         "कुछ पल पहले",
         "कुछ ही पलों में",
         "पहले",
         "आज",
         "आने वाला कल",
         "बिता हुआ कल",
         "अगले $weekday()",
         "$weekday(), पिछले सप्ताह",
         "$weekday(), $weeks(-1.0) सप्ताह पहले",
         "से एक सप्ताह $weekday()",
         "$weeks(-1.0) सप्ताह में, $weekday() को",
         "$days(-1.0) दिन पहले",
         "$days(-1.0) दिनों में"
        ],
        "it" : [
         " alle ",
         "adesso",
         "uno",
         "anno",
         "anni",
         "anno",
         "anni",
         "mese",
         "mesi",
         "mese",
         "mesi",
         "settimana",
         "settimane",
         "settimana",
         "settimane",
         "giorno",
         "giorni",
         "giorno",
         "giorni",
         "ora",
         "ore",
         "ora",
         "ore",
         "minuto",
         "minuti",
         "min.",
         "min.",
         "secondo",
         "secondi",
         "sec.",
         "sec.",
         "pochi istanti fa",
         "in pochi istanti",
         "fa",
         "oggi",
         "Domani",
         "ieri",
         "$weekday() prossimo",
         "$weekday(), la scorsa settimana",
         "$weekday(), $weeks(-1.0) settimane fa",
         "una settimana da $weekday()",
         "tra $weeks(-1.0) settimane, $weekday()",
         "$days(-1.0) giorni fa",
         "tra $days(-1.0) giorni"
        ],
        "ja" : [
         " の ",
         "今",
         "1",
         "年",
         "年",
         "年",
         "年",
         "月",
         "月",
         "月",
         "月",
         "週間",
         "数週間",
         "週間",
         "数週間",
         "日",
         "日々",
         "日",
         "日々",
         "時間",
         "時間",
         "時間",
         "時間",
         "分",
         "分",
         "分",
         "分",
         "秒",
         "秒",
         "秒",
         "秒",
         "少し前",
         "すぐに",
         "前",
         "今日",
         "明日",
         "昨日",
         "次の $weekday()",
         "先週の $weekday()",
         "$weeks(-1.0) 週間前の $weekday()",
         "$weekday() から一週間",
         "$weeks(-1.0) 週間後、$weekday()",
         "$days(-1.0)日前",
         "$days(-1.0)日で"
        ],
        "nl" : [
         " om ",
         "nu",
         "een",
         "jaar",
         "jaar",
         "jaar",
         "jaar",
         "maand",
         "maand",
         "maand",
         "maand",
         "week",
         "weken",
         "week",
         "weken",
         "dag",
         "dagen",
         "dag",
         "dagen",
         "uur",
         "uren",
         "uur",
         "uren.",
         "minuut",
         "minuten",
         "minuut",
         "minuten",
         "second",
         "seconden",
         "sec.",
         "sec.",
         "enkele ogenblikken geleden",
         "binnen enkele ogenblikken",
         "geleden",
         "vandaag",
         "morgen",
         "gisteren",
         "volgende $weekday()",
         "vorige week $weekday()",
         "$weekday(), $weeks(-1.0) weken geleden",
         "een week vanaf $weekday()",
         "over $weeks(-1.0) weken, op $weekday()",
         "$days(-1.0) dagen geleden",
         "binnen $days(-1.0) dagen"
        ],
        "pt" : [
         " às ",
         "agora",
         "1",
         "ano",
         "anos",
         "ano",
         "anos",
         "mês",
         "meses",
         "mês",
         "meses",
         "semana",
         "semanas",
         "semana",
         "semanas",
         "dia",
         "dias",
         "dia",
         "dias",
         "hora",
         "hora",
         "hora",
         "horas",
         "minuto",
         "minutos",
         "min.",
         "min.",
         "segundo",
         "segundos",
         "sec.",
         "sec.",
         "alguns momentos atrás",
         "em alguns instantes",
         "atrás",
         "hoje",
         "amanhã",
         "ontem",
         "próxima $weekday()",
         "$weekday(), semana passada",
         "$weekday(), $weeks(-1.0) semanas atrás",
         "uma semana a partir de $weekday()",
         "em $weeks(-1.0) semanas, na $weekday()",
         "$days(-1.0) dias atrás",
         "em $days(-1.0) dias"
        ],
        "ru" : [
         " в ",
         "сейчас",
         "один",
         "год",
         "годы",
         "год",
         "годы",
         "месяц",
         "месяцы",
         "месяц",
         "месяцы",
         "неделя",
         "недели",
         "неделя",
         "недели",
         "день",
         "дни",
         "день",
         "дни",
         "час",
         "часы",
         "час",
         "часы",
         "минута",
         "минут",
         "мин",
         "мин",
         "второй",
         "секунды",
         "сек",
         "сек",
         "несколько минут назад",
         "через несколько минут",
         "тому назад",
         "Cегодня",
         "завтра",
         "вчера",
         "в следующую $weekday()",
         "$weekday(), lна прошлой неделе",
         "$weekday(), $weeks(-1.0) недели назад",
         "неделя с $weekday()",
         "через $weeks(-1.0) недели, в $weekday()",
         "$days(-1.0) дня назад",
         "через $days(-1.0) дня"
        ],
        "sw" : [
         " saa ",
         "sasa",
         "moja",
         "mwaka",
         "miaka",
         "mwaka",
         "miaka",
         "mwezi",
         "miezi",
         "mwezi",
         "miezi",
         "wiki",
         "wiki",
         "wiki",
         "wiki",
         "siku",
         "siku",
         "siku",
         "siku",
         "saa",
         "masaa",
         "saa.",
         "masaa",
         "dakika",
         "dakika",
         "dk.",
         "dk.",
         "sekunde",
         "sekunde",
         "sec.",
         "sec.",
         "dakika chache zilizopita",
         "katika muda mfupi",
         "iliyopita",
         "leo",
         "kesho",
         "jana",
         "$weekday() ijayo",
         "$weekday(), wiki iliyopita",
         "$weekday(), wiki $weeks(-1.0) zilizopita",
         "wiki kutoka $weekday()",
         "katika wiki $weeks(-1.0), $weekday()",
         "siku $days(-1.0) zilizopita",
         "kwa siku $days(-1.0)"
        ],
        "vi" : [
         " lúc ",
         "hiện nay",
         "một",
         "năm",
         "năm",
         "năm",
         "năm",
         "tháng",
         "tháng",
         "tháng",
         "tháng",
         "tuần",
         "tuần",
         "tuần",
         "tuần",
         "ngày",
         "ngày",
         "ngày",
         "ngày",
         "giờ",
         "giờ",
         "giờ",
         "giờ",
         "phút",
         "phút",
         "phút",
         "phút",
         "giây",
         "giây",
         "giây",
         "giây",
         "một vài phút trước",
         "Trong giây lát",
         "trước",
         "hôm nay",
         "Ngày mai",
         "hôm qua",
         "$weekday() tới",
         "$weekday(), tuần trước",
         "$weekday(), $weeks(-1.0) tuần trước",
         "một tuần từ $weekday()",
         "trong $weeks(-1.0) tuần, vào $weekday()",
         "$days(-1.0) ngày trước",
         "trong $days(-1.0) ngày nữa"
        ],
        "zh" : [
         " ",
         "现在",
         "一",
         "年",
         "年",
         "年",
         "年",
         "月",
         "月",
         "月",
         "月",
         "星期",
         "周",
         "星期",
         "周",
         "日",
         "天",
         "日",
         "天",
         "小时",
         "小时",
         "小时",
         "小时",
         "分钟",
         "分钟",
         "分钟",
         "分钟",
         "秒",
         "秒",
         "秒",
         "秒",
         "几分钟前",
         "过一会儿",
         "前",
         "今天",
         "明天",
         "昨天",
         "next $weekday()",
         "$weekday(), 上周",
         "$weekday(), $weeks(-1.0) 周前",
         "从 $weekday() 开始的一周",
         "从 $weeks(-1.0) 周，在 $weekday()",
         "$days(-1.0) 天前",
         "在 $days(-1.0) 天"
        ]

    }
    Tap.test('date strings for ' + loc, t => {


        let ok = 0
        let missing = 0
        let noexpect = 0

        if(expect[loc]) {

            i18n.setLocale(loc)

            for (let ti = 0; ti < stringIds.length; ti++) {
                let id = stringIds[ti] || ""
                if (expect[loc]) {
                    let str = i18n.getLocaleString(id)
                    x = expect[loc][ti++] || ""
                    if(!x) noexpect++
                    else if (str === x) {
                        ok++
                    } else {
                        missing++
                        t.skip(`for locale ${loc} at ${id}: expected "${x}", got "${str}"`)
                    }
                }
            }
        } else {
            noexpect = stringIds.length
        }
        let desc = "stats for "+loc
        t.ok(!missing && !noexpect, `${desc}: ok ${ok}, missing ${missing} no expects ${noexpect}`)

        t.end()
    })
}

let stats:any = i18n.setLocale() // default locale
if(stats && stats.totalStrings) {// looks like we have i18n tables
// localizationTests('en-US')
// localizationTests('es')
    for (const loc of testLocales) {
        // localizationTests(loc)
        dateStringTests(loc)
    }
}

