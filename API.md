# gen-format API Reference

##### What is a format operation?

A _format operation_ is a single act of converting a value into
a _formatted display string_ according to the _format specification_ 
provided.

The default export of the `gen-format` module is the _primary formatter_
and will perform a single format operation each time it is called.

Typescript:

```typescript
import F from '@tremho/gen-format'

let result:string = F('1.2', Math.PI)
// result = "3.14"
```

If you are not using typescript or ES6 imports:  

```javascript
var F = require('@tremho/gen-format').default

var result = F('1.2', Math.PI)
// result = "3.14"
```

A _format operation_ is defined by its _format specifier_ and its _value_

###### The _format specifier_

The string passed as the format specifier may consists of several parts:

_name_?_hints_~_locale_\|_format_

The `name` component, if given, is the first part of the format specifier.
It need not be used for string or number formatting, as these types are
determined by inference. It must be used for other types, such as 'date'.

If the named format accepts hints, these may be passed in the
format specifier string following a '?' character after the name.
One or more hint keywords may be passed to the formatter in this way, by
separating subsequent hints with a dash (-).  
For example: `"name?hint1-hint2-hint3"`

Most formatters accept a _format string_ that encodes a description
for display of the given value.  If a formatter name is given, the
format portion of the format specifier is delimited with the vertical pipe (|) character.
For example: `"date|YYYY MMM DD"`

Locale-aware formatters will accept a 'locale' string passed
following a tilde (~) character in the format specification string.
For example: `"date~fr|long"`

locales are specified by the common [IETF BCP 47](https://tools.ietf.org/html/bcp47) standard locale string (2-letter lowercase language code,
optionally followed by a dash and a 2-letter uppercase country code,
as in en-US, or jp-JP).  The `date` formatter will accept certain unicode
extensions also.  See the **DateFormatter** API docmentation.

* * *

### using the _Formatter_ directly vs. using _formatV_

There are two basic ways to generate formatted output. One
is to use the direct export of `gen-format` to perform a single
_format operation_ on a value and return the formatted string.

It is sometimes convenient to import the formatter to a short variable
name (such as 'F') so that it is easy to type and doesn't appear overly
awkward in code statements that use it often.
Some examples of using this form:

(typescript)

```typescript
import F from '@tremho/gen-format'

let pi = Math.PI
let piFmt = F(`1.2`, pi)

console.log('The value of Pi is '+ piFmt)
```

The 'F' form may be handy for use with Javascript _Template Literal_ strings,
like this:

```typescript
import F from '@tremho/gen-format'

let name = 'Pi'
let value = Math.PI

console.log( `The value of ${name} is ${F('1.2', value)}` 
```

However, if you are composing formatted values into strings like
this often, you may prefer to use the `formatV` function instead.

The `formatV` function is also imported from the `gen-format` module, 
but it is not the direct export, so it must be imported indirectly
using one of these methods:

`import {formatV} from '@tremho/gen-format`

or 

`const {formatV} = require('@tremho/gen-format')`

or
`var formatV = require('@tremho/gen-format').formatV`

The _formatV_ function accepts a _format template string_ that defines
the formats and positions within the string for values that are passed
as subsequent arguments.

This form is reminiscent of other similar formatter functions found across
several languages, such as the _sprintf_ function of 'C'.

The _format template string_ passed as the first parameter to 
_formatV_ is typically a mixture of literal text and one or more _format
directives_.
for example:

```typescript
import {formatV} from '@tremho/gen-format'

let outStr = formatV('The value of $() is $(1.2)', 'Pi', Math.PI)
// outStr == 'The value of Pi is 3.14'
```

the dollar sign and parentheses patterns in the template string
designate areas where values will be inserted, and the characters
between the parentheses (if any) represent the _format specification_ to apply when 
displaying this value.

###### values associated by natural order

In the following example, the values are pulled from the argument list
in the order in which they are referenced in the template string.

```typescript
import {formatV} from '@tremho/gen-format'

let weather = 'rain'
let place = 'Spain'
let terrain = 'plain'

console.log(formatV('The $() in $() is mainly in the $()', weather, place, terrain))
```

###### values associated by declaration

Sometimes, the order your parameters are in is not necessarily how
you wish to refer to them in the format template.  For this case, one
option is to provide the _ordinal number_ of the value following the
dollar-sign ($), but prior to the parentheses, like this:

```typescript
import {formatV} from '@tremho/gen-format'

let animal = 'horse'
let vehicle = 'cart'

console.log(formatV('We are putting the $2() before the $1() here', animal, vehicle))
```

###### values associated by name

Yet another way is to pass values as properties in an object, and then
refer to those values by thier property name, as in this example:

```typescript
import {formatV} from '@tremho/gen-format'

let obj = {
    animal: 'horse',
    vehicle: 'cart',
    weather: 'rain',
    place: 'Spain',
    terrain: 'plain' 
}

console.log(formatV('the $animal() pulled his $vehicle() along the $terrain() in $place(), where it would often $weather()', obj))
```

###### Empty parentheses

Several of the examples above use empty parentheses (no format specifier).
This is commonly used to display a value without any formatting applied.
The value may be a string or a number.  In the above examples, these have
all been strings meant to simply 'pass through' and be placed into the template
at the designated position.

##### Format templates using _i18n_ stringIds in _@token:default_ form

Access to the _i18n_ `@tremho/locale-string-tables` strings
can of course be mananged using the _i18n_ API (as explained
elsewhere in this document).  The `Formatter` also supports
a shortcut form as part of the format template parsing.

Within a format template string, the occurence of a pattern

    @<token>:<default>

may be used, 
where _&lt;token>_ is the string identifier for an _i18n_ string,
and _&lt;default>_ is the optional default to use if
the stringId is not found in the tables for the currently
set locale.
This will result in the substitution of the realized string
from the string tables for the portion of the format template
that contained the @token:default pattern.

This provides a convenent way to localize format patterns
as well as a simple API for retrieving localized strings in 
general.  

See the documentation for `getTokenDefault` in the `i18n`
API section for more detail on using this pattern replacement
technique.

* * *

## Types of formatters

The formatter type may be designated in the _format specifier_ in
the _type_ portion, but for strings and number, this name can be
omitted as the format type will be inferred for these type.

* * *

### The Number formatter

The number formatter is handled by the **NumberFormatter** class.

Number and String types do not need to be explictly named.  The _format specifier_ passed for
a Number or String type typically consists solely of the _format_ portion.

The Number format type recognizes no hint keywords.

A locale _may_ be passed to a number formatter, as this information may inform the 
choice of decimal or thousands separation characters appropriate for the display locale.
a locale is passed using the tilde (~) character either at the end of the _format specifier_ string
or prior to a | separator that marks the start of the _format_ portion.

##### Basic numeric format

_integer_._decimal_

A Number format is indicated by the presence of a period (.) character in the _format_ string.
This period character separates the formatting information applied to the _integer_ portion of
the number frmo the formatting information to apply to the _decimal_ portion of the number.

These format values are numbers:  The max number of digits to reserve for display of the integer
portion, or the max number of digits to include for the fractional (decimal) portion of the number
display.

For example, the number 123.456789 may be displayed in full with the format `"4.6"` since this
allows for four characters of integer display and five for the decimal portion.
Similarly, the value 1234.56789 would also fit this display, and if aligned to the previous
formatted value, would align at the decimal point positions because the smaller value, having
only three digits in its integer portion would be padded with a leading space.  For the larger value,
the format accommodates its four-digit integer without padding.

If the integer portion of a number is too large to fit into the specified format, # characters
will be displayed to fill the size of the format allotment, signifying an overflow error.
For example `F('2.0`, 1234)\` results in '##' because 1234 cannot be represented in two digits.

The absence of a number on either side of the period indicates unconstrained display.  That is, 
a format of ".3" would allow any size integer, but limit the display to a maximum of three decimal places, 
whereas a format of "3." would limit integers to a max of 999, but allow unconstrained decimal place display.

An empty format or one consisting of simply "." does not assign a format contraint to the given
number.

###### Value rounding

Values displayed are rounded up to fit the number of displayed
digits.

For example, Pi (3.1415927) displayed using format "1.3" will display as 
3.142, because the next digit, (5) is rounded up.
Displayed as "1.2" displays 3.14, becuase the next digit (1) does
not round up.
Similarly, the value 1.6 displayed with format "1.0" will display 
as "2" due to rounding.
To disable rounding, use the ! flag, as shown in the table below.  
For example: F("!1.0", 1.6) === "1" because rounding is disabled.  

###### Flags

This table lists flags that can be included in the format
for number formatting:

| flag              | Purpose                                                         | Example                                                                                     |
| ----------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| !                 | Do not perform rounding of value                                | F("1.3", Math.PI) === "3.142"                                                               |
| 0                 | use leading zeroes on integer                                   | F("02.3", Math.PI) === "03.142"                                                             |
| + <br/>(on left)  | show + on positive numbers<br/>(Negative numbers always show -) | F("+1.3", Math.PI) === "+3.142"<br/>F("1.3", -Math.PI) === "-3.142"                         |
| + <br/>(on right) | pad decimal with trailing 0's to full width                     | F("1.3", 0.5) === "0.500"                                                                   |
| k                 | use thousands separator                                         | F("k4.0", 1234) === "1,234"                                                                 |
| - <br/>(on left)  | No alignment padding on left                                    | F("-4.2", 12.34) === "12.34",<br/>instead of  "  12.34"                                     |
| - <br/>(on left)  | No alignment padding on right                                   | F("3.4-", 12.34) === " 12.34",<br/>instead of  " 12.34  "<br/>F("-2.4-", 12.34) === "12.34" |

<br/>

##### Passing locale to the number formatter

The number formatter, like the string formatter, does not need to be named, 
because it infers the context from the format syntax, unlike
the DateFormatter, which requires the name in order to inform the
formatter of the context.

However, the number formatter can be called as a _named formatter_
as well, and this is required if you intend to specify locale information.

###### Using as a named formatter without locale

`F('number|2.3', value)`

###### Specifying a locale

`F('number~fr-FR|2.3', value)`

the tilde (~) denotes a locale string and the pipe (|) character
separates from the format string.

#### Behaviors when using Intl for certain locales

###### Alternate numeric lettering

Some locales of course use non-latin numerals when displaying
numeric information.  The W3C Intl subsystem will use
these alternate unicode numeric characters when rendering
for these locales.

`gen-format` currently does not have alternate numeric
character support outside of Intl, so the behavior 
for these languages is different with and without Intl enabled.
With Intl enabled, the alternate numerics will be displayed,
but without Latin numeral are rendered instead.

If you would like Latin numerals under Intl support anyway,
include the unicode extension `-u-nu-latn` to your locale
specifier, as this will be honored by Intl.

Locale languages that fall into this category are:

-   **ar** (Arabic)
-   **bn** (Bengalese)
-   **fa** (Persian)
-   **mr** (Marathi)

###### Different placement of `thousands` separator

English and most other languages display large numbers with 
separators at each 3-digit interval starting at 1,000.  
For example, 1,900,000 represents one billion, nine-hundred thousand.
and 123,456 represent 123 thousand, 456. 
Some languages include a thousands separator (comma) at
the one-hundred thousand mark, so 123456 would be
represented as 1,23,456.

`gen-format` does not currently support such separation
placement, so unless you are utilizing Intl, numbers
in these locales will display incorrectly.

Locale languages that fall into this category include:

-   **hi** (Hindi)
-   **ml** (Malayalam)
-   **mr** (Marathi)
-   **pa** (Punjabi)
-   **ta** (Tamil)
-   **te** (Telugu)

* * *

### The String formatter

The string formatter is handled by the **StringFormatter** class.

Number and String types do not need to be explictly named.  The _format specifier_ passed for
a Number or String type typically consists solely of the _format_ portion.

The string formatter is limited to alignment padding of strings
No hints are recognized, and a passed locale has no effect on the string formatter.

##### Basic string format

_min_,_max_

A String format is indicated by the presence of a comma (,) character in the _format_ string.
This comma character separates the value for the minimum length of the display string and
the value for the maximum allowable length of the string.  

These format values are numbers:  The max number of digits to reserve for display of the integer
portion, or the max number of digits to include for the fractional (decimal) portion of the number
display.

For example, the format "3,7" applied to the values "This", "is", "a", "test" and "Excellent!"
would result in display strings of

    "This"
    "is "
    "a  "
    "test"
    "Excelle"

Note that string values shorter than the minimum (3 characters) are
padding on the right to reach that length.
The string value "Excellent!" exceeds the maximum (7 characters), and
thus is truncated to its first seven characters.

The default, as shown above, is to left-align the strings.
Strings may be right-aligned by including a space preceding
the format, like this:

     F(" 10,10", 'test') === "      test"

to pad with something other than a space, use that character instead

     F("-10,10", 'test') === "------test"

pad characters can be assigned to either side:

     F("10,10>", 'test') === "test>>>>>>"

text may be centered by padding both sides:

     F(" 10,10 ", "test") === "   test   "

padding may be a multiple character string:

     F("Xo10,10", "test") === "XoXoXotest"

* * *

### The Date formatter

Formatting dates and times is handled by the **DateFormatter** class.

The date formatter is a _named formatter_, and requires its type
name to be explicitly specifies as the first part of the
_format specification_ string.

For example: F("date|full", new Date()) will display the 
current date and time in a verbose format.

the `date` type formatter accepts hints and reacts to locale
values.  Both of these options are discussed below.

##### Basic date format

<p style="font-size:larger">
date?&lt;hint&gt;~&lt;locale&gt;|&lt;format&gt;
</p>

Let's look at the options for _format_ first.  There are many.
For starters, date formats can be specified in two different ways.
One is to use the set of predefined _style_ keywords that define the 
way the date is to be formatted for display.  These style
keywords are:

-   **full**
-   **long**
-   **medium**
-   **short**
-   **none**

With the exception of `none`, these _style_ keywords are used directly when the DateFormatter hands off
to the `Intl` library for implementation.
Refer to the documentation for [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)
for more information on this and how the _style_ keywords apply.

_style_ keywords apply to both the date portion of the display and the
time portion of the display.  These may be applied to date and time
independently, but if only one is given, it is used for both.  For example, a format directive of 'short-full'
would apply the 'short' style to date and the 'full' style to time in the
resulting display.  Use of a single style keyword applies that style to
both date and time.  That is, 'long-long' is the same as 'long'
To omit the display of either date or time, specify `none` as the
keyword for this portion, for example: 'none-long' would produce a time
display only.  Note that 'none-none' results in an empty display.

###### Timezone hints

The only _hint_ the Date formatter recognizes is one that specifies
the desired timezone for the display.

Date and Time are considered to be in UTC (Coordinated Universal Time)
when presented to the formatter.  With no other timezone hinting, all time displays
are expressed in UTC form.

To display a time in a specific timezone, enter the name or the abbreviation
of that timezone as a hint in the _format specification_.
If no timezone hint is given, the timezone displayed will be Univeral Time (UTC ).  

To control which timezone the time is displayed for, pass either the
[IANA 'representative city' name](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) (e.g. America/Los Angeles), or else
the name of the time zone (e.g. Pacific, or Pacific Standard Time), or
else the abbreviation (e.g. PST) as a hint. Daylight time names and abbreviations
are conflated with Standard time for this purpose of identification, so
specifying either 'EST' or 'EDT' with both represent US Eastern Time,
aka America/New York, at any time of year.  The time displayed will be correct
for the currently observed regional time, as the host system is
timezone aware and handles these offsets automatically.

_Note: Use of the full IANA region/name form is preferred as it is the least ambiguous of the forms to search for in the data_

For example, the time of ten minutes after midnight in Universal Time
on January 25, 2021 in different time zones:

    import F from '@tremho/gen-format'

    const dt = '2021-01-25T:00:10:00Z'
    console.log( F('date?gmt|full', 'dt') )
    console.log( F('date?est|full', 'dt') )
    console.log( F('date?cst|full', 'dt') )
    console.log( F('date?mst|full', 'dt') )
    console.log( F('date?pst|full', 'dt') )
    console.log( F('date?local|full', 'dt') )
    console.log( F('date|full', 'dt') )

    // Monday, January 25, 2021 at 12:10:00 AM Greenwich Mean Time
    // Sunday, January 24, 2021 at 7:10:00 PM Eastern Standard Time
    // Sunday, January 24, 2021 at 6:10:00 PM Central Standard Time
    // Sunday, January 24, 2021 at 5:10:00 PM Mountain Standard Time
    // Sunday, January 24, 2021 at 4:10:00 PM Pacific Standard Time
    // <Whatever your local timezone display is>
    // Monday, January 25, 2021 at 12:10:00 AM Coordinated Universal Time

##### Specifically defined date and time formats:

A popular Date format utility called 'Moment' has been often used in Javascript applications to
format date and time.  Some of what 'Moment' offers has been 
superceded by the (usually built-in) functionality of the 'Intl' libraries,
but there is still much utility (and legacy need) for applications
to declare more precisely how date and time elements should be
reresented in a display string.

Thus, `gen-format` offers a _moment-inspired_ (but note: not  _moment-compatible_)
syntax for specifying date and time formats distinctly.

This is done with tokens in the _format_ directive string for year, month,
day, hour, minute, second, and other elements that may be within a
Date() value.  Each token represents a display type, like Year or Month,
and the number of times its representative letter is repeated determines
the _style_ of this display.  Most token values have more than one style in which
they can be represented.

For example: MMMM means "Spell out the name of the month in full" (e.g. "January")<br/>
   whereas    MMM means "Spell out the abbreviated name" (e.g. Jan)
    and        MM means "Show the month vale as two digits" (e.g. 01)
    and         M means "Show the month value without leading 0" (e.g. 1)

The full list of this type of format option is here:

-        YYYY = 4 digit year (e.g. 2020)
-        YYY =  4 digit year, but only show if not the current year
-        YY = 2 digit year (e.g. 20)
-        Y =  2 digit year only shown if not the current year
-        (if a year is not shown, characters in format beyond are skipped until the next parse token)
-   
-        MMMM = full name of month (e.g. 'February')
-        MMM = abbreviated name of month (3 letters, e.g. 'Feb')
-        MM = 2 digit month (leading 0) (e.g. 02)
-        M = 1-2 digit month (no leading 0) (e.g. 2)
-   
-        WWWW = Full weekday name (e.g. 'Saturday')
-        WWW = three letter weekday abbreviation (e.g. 'Sat')
-        WW = two letter weekday abbreviation (uncommon) (e.g. 'Mo', 'Sa')
-        W = 1 - 2 letter weekday abbreviation (e.g. 'M', 'Th')
-   
-        DD = 2 digit day, with leading 0
-        D = 1 - 2 digit day, no leading 0
-   
-        hhhh = 24 hour time, leading 0
-        hhh = 24 hour time, no leading 0
-        hh = 12 hour time, leading 0
-        h  = 12 hour time, no leading 0
-   
-        m = minutes with leading 0
-        m = minutes without leading 0
-   
-        ss = seconds with leading 0
-        s  = seconds witout leading 0
-   
-        .sss = milliseconds (includes the .)
-        .ss` = 1/100th seconds (includes the .)
-        .s   = 1/10th seconds (includes the .)
-   
-        ++ = AM/PM notation (upper case)
-        -- = am/pm (lower case)
-        -+ - PM only (upper case)
-        +- = PM only (lower case)
-   
-        x = milliseconds (as an integer without a period)
-   
-        j = javascript standard millisecond timestamp
-        u = unix standard second timestamp
-   

 Please note that some options, like YYY or Y _will display nothing_
if the conditions are not correct (in this case, current year).
Please keep this in mind when choosing format options for the situation
at hand.

Note also that the options j, and u represent alternate representations
of the complete date/time value, rather than a portion thereof, while
'x' represents only the millisecond value.

###### Default timezone

As noted above in the discussion of _style_ keyword formats,
use of these specific format tokens will force the default time
to be displayed in a Universal Time (UTC / GMT) timezone rather
than local time, by default.  Use a timezone hint (e.g. `'date?pst| -- '`) to 
control the timezone displayed.

###### Other characters in format string

Other characters that appear in the format string, such as /, - or
: dividers, or other appear in place within the restulting display
string.  Avoid using characters from the token list for such 
purposes.  

###### Reminder to Moment users

Users of _moment_ will quickly recognize the inspiration for these
format tokens, but will also quickly realize that while similar and
in some cases the same, the semantics used here are _not_ those of
_moment_, and some work will indeed be necessary in the case of migrating
format descriptions designed to work in a _moment_ environment.

###### Localization usage

For maximum portability across different locales, one should prefer the use
of the _style_ keywords, rather than forming a date display template directly.
The display format, and of course, the language, may differ per
locale, and while language may be properly translated for the
direct tokens, the layout is up to you.  Use of the _style_ keywords
means you will get an appropriate display for the chosen context
for any locale.

Furthermore, unicode extensions for numbering system (-nu-) and calendar
type (-ca-) are recognized by the underlying `Intl` library and
may be further used to customize locale handling for certain
areas.  See [Intl.DateTimeFormat locale documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat#using_locales)
for more information.
These locale extensions are not recognized by the direct format option.

###### examples:

            let ts = 693878400 * 1000 // 12/28/91
            let r = F('date|WWWW, MMMM D, YYYY', ts)
            console.log(r)        

displays "Saturday, December 28, 1991"

Dates may be given to the formatter 
as a millisecond timestamp, as shown above,
or as a `Date` object itself,
or as any string parseable by the `Date` constructor

            let r = F('date|WWWW, MMMM D, YYYY h:mm--', 'Tuesday, January 12, 2021 11:36 AM UTC')
            console.log(r)
            r = F('date|WWWW, MMMM D, YYYY h:mm--', 'Tuesday, January 12, 2021 11:36 AM')
            console.log(r)                
            r = F('date?local|WWWW, MMMM D, YYYY h:mm--', 'Tuesday, January 12, 2021 11:36 AM')
            console.log(r)                

will display

    "Tuesday, January 12, 2021 11:36am"
    "Tuesday, January 12, 2021 7:36pm"
    "Tuesday, January 12, 2021 11:36am"

Note that the first example was entered as Universal time, 11:36.  
All dates received by the Formatter are assumed to be in Universal Time.
By default, all dates are displayed in UTC as well, so the first display
matches the time input.  
The second example was parsed as local time (in this case, Pacific Standard Time)
and converted to UTC standard on input by the Date constructor.
Thus the output (in UTC) shows the timezone adjustment time value.  
The third example takes this same input, but uses the timezone hint to
specify local timezone and thus we see the time represented
in the way it was parsed.

Dates may be represented in different keyword styles
or may have their date format explicitly rendered

            let testDate = '2021-01-13Z'

            // intl full, long, medium, short
            console.log( F('date|full', testDate) )
            console.log( F('date|long', testDate) )
            console.log( F('date|medium', testDate) )
            console.log( F('date|short', testDate) )
            console.log( F('date|short-full', testDate) )

produces these different outputs

        Wednesday, January 13, 2021 at 12:00:00 AM Coordinated Universal Time
        January 13, 2021 at 12:00:00 AM UTC
        Wed, Jan 13,  at 12:00:00 AM UTC
        1/13/21 at 12:00:00 AM UTC
        1/13/21 at  12:00:00 AM Coordinated Universal Time

Date formats may also be explicitly given 

            let testDate = '2021-01-13Z'
            console.log( F('date|WWWW, MMMM, D, YYYY hh:mm:ss ++ Z', testDate) )
            console.log( F('date|WWW, MMM, D, YY hhhh:mm:ss z', testDate) )
            console.log( F('date|WWW, MM/DD/YY', testDate) )
            console.log( F('date|D/MM/YY', testDate) )
            console.log( F('date|M-D-YY', testDate) )

produces the following:

        Wednesday, January 13, 2021 at 12:00:00 AM Coordinated Universal Time
        Wed. Jan. 13, 21 00:00:00 UTC
        Wed. 01/13/21
        13/01/21
        1-13-21

These formats of course also apply to dates which are
cast to display for other timezones and/or locales:

            let testDate = '2021-01-13Z'
            console.log( F('date?pst|full', testDate) )
            console.log( F('date?pst|long', testDate) )
            console.log( F('date?pst|medium', testDate) )
            console.log( F('date?pst|short', testDate) )
            console.log( F('date?pst|short-long', testDate) )

            console.log( F('date~es-ES?pst|full', testDate) )
            console.log( F('date~es-ES?pst|long', testDate) )
            console.log( F('date~es-ES?pst|medium', testDate) )
            console.log( F('date~es-ES?pst|short', testDate) )
            console.log( F('date~es-ES?pst|short-long', testDate) )

produces:

        Tuesday, January 12, 2021 at 4:00:00 PM Pacific Standard Time
        January 12, 2021 at 4:00:00 PM PST
        Tue, Jan 12,  at 4:00:00 PM
        1/12/21 at 4:00 PM
        1/12/21 at 4:00:00 PM PST

        martes, enero 12, 2021 at 16:00:00  Hora estándar del Pacífico
        enero 12, 2021 at 16:00:00  PST
        mar., ene. 12,  at 16:00:00
        12/01/21 at 16:00
        12/01/21 at 16:00:00  PST

AM / PM can be displayed a few different ways:

        let amTest = '2021-07-11T01:23:00Z'
        let pmTest = '2021-07-11T13:23:00Z'

        // upper case AM/PM
        console.log( F('date| h:mm ++', amTest) )
        console.log( F('date| h:mm ++', pmTest) )
        
        // lower case am/pm  
        console.log( F('date| h:mm --', amTest) )  
        console.log( F('date| h:mm --', pmTest) )
        
        // PM only (upper case)  
        console.log( F('date| h:mm -+', amTest) )  
        console.log( F('date| h:mm -+', pmTest) )  
        
        // PM only (lower case)  
        console.log( F('date| h:mm +-', amTest) )  
        console.log( F('date| h:mm +-', pmTest) )  
        
        // A/P (upper case)  
        console.log( F('date| h:mm +?', amTest) )  
        console.log( F('date| h:mm +?', pmTest) )  
        
        // a/p (lower case)  
        console.log( F('date| h:mm -?', amTest) )  
        console.log( F('date| h:mm -?', pmTest) )
        
        // using 24-hour time
        console.log( F('date| hhh:mm', amTest) )  
        console.log( F('date| hhh:mm', pmTest) )
          

results: 

        1:23 AM
        1:23 PM
        
        1:23 am
        1:23 pm

        1:23
        1:23 PM

        1:23
        1:23 pm

        1:23 A
        1:23 P

        1:23 a
        1:23 p

        1:23
        13:23

        
     

In addition to legally parseable date strings, other strings can be
entered as date values

-   `F('date|full, 'now')` the 'now' string is equivalent to Date.now() and provides the current time to the millisecond.
-   `F('date|full', 'this year'`) sets a date as Jan 1 midnight for current year
-   `F('date|full', 'this month')` sets a date at midnight on the first of the current month
-   `F('date|full', 'this week')` sets a date at midnight on Sunday of the current week.
-   `F('date|full', 'this day')` sets a date at midnight of the current date
-   `F('date|full', 'this hour')` sets a date at the top of the current hour
-   `F('date|full', 'this minute')` sets a date at top of the current minute
-   `F('date|full', 'this second')` sets a date the current time, sans milliseconds

Relative date references may also be used as date input:

-   \`F('date|full', 'last Wednesday') sets a date at the preceding named weekday
-   \`F('date|full', 'next Friday') sets a date at the following named weekday
-   \`F('date|full', 'last Wednesday') sets a date at the preceding named weekday

### Date Ranges

Date ranges can be displayed by passing an array
of two dates.  
This is falls to the 'daterange' _named formatter_, but
you can specify 'date' as the name and it will use the
'daterange' formatter if the the value is an array.

            // two morning times
            let t1 =  '2021-04-03T07:30:00Z'
            let t2 = '2021-04-03T09:30:00Z'
            let r = F('date|MMM D h:mm', [t2, t2])
            console.log(r)

            // times crossing noon
            t2 = '2021-04-03T15:15:00Z'
            r = F('date|MMM D h:mm ++', [t1, t2])
            console.log(r)

            // group dates in year
            t1 = '2021-01-20T00:00:00Z'
            t2 = '2021-04-03T00:00:00Z'
            console.log(r)

            // group year left, range right
            r = F('date|YYYY MMM D', [t1, t2])
            console.log(r)

            // group range left, year right
            r = F('date|MMM D, YYYY', [t1, t2])
            console.log(r)

            // group days in month
            t2 = '2021-01-23T00:00:00Z'
            r = F('date|YYYY MMM D', [t1,t2])
            console.log(r)

            // with timezone cast 
            t1 = '1961-04-03T10:12:00Z'
            t2 = '1961-04-03T12:50:00Z'
            r = F('date?pst|M/D/YY hh:mm -- (z)', [t1, t2])
            console.log(r)

            // with named styles
            t1 = '1961-04-03T10:12:00Z'
            t2 = '1961-04-03T12:50:00Z'
            
            r = (F('date|full', [tn, tn2]))
            console.log(r)

results:

        Apr 3 7:30 - 9:30
        Apr 3 7:30 AM - 3:15 PM

        2021 Jan 20 - Apr 3
        Jan 20 - Apr 3, 2021

        2021 Jan 20 - 23

        4/3/61 02:12 am - 04:50 am (PST)

        Monday, April 3, 1961, 10:12:00 AM - 12:50:00 PM Coordinated Universal Time

### Date differences

Passing the format type "human" will
produce a descriptive output of an event time
relative to the current time.
This is falls to the 'daterange' _named formatter_, but
you can specify 'date' as the name and it will use the
'daterange' formatter if the format type is "human".

    const F = require('./src/Formatter').default

    function show(desc, r) {
      console.log(desc+': '+r)
    }

    let event = Date.now()
    let desc = 'Date/Time of this test'
    let r = F('date|full', event)
    show(desc, r)

    desc = "current event (human)"
    r = F('date|human', event)
    show(desc, r)

    desc="moments ago human"
    event = Date.now() - 5000
    r = F('date|human', event)
    show(desc, r)

    desc="moments ago long"
    r = F('date|human-long', event)
    show(desc, r)

    desc="moments ago short"
    r = F('date|human-short', event)
    show(desc, r)

    desc="1 second ago narrow"
    event = Date.now() - 1000
    r = F('date|human-narrow', event)
    show(desc, r)

    desc="ms ago narrow"
    event = Date.now() - 250
    r = F('date|human-narrow', event)
    show(desc, r)

    desc="moments from now human"
    event = Date.now() + 5000
    r = F('date|human', event)
    show(desc, r)

    desc="moments from now long"
    event = Date.now() + 5000
    r = F('date|human-long', event)
    show(desc, r)

    desc="seconds ago, no ms < 500"
    event = Date.now() - 7400

    desc="seconds ago, ms > 500"
    event = Date.now() - 7800
    r = F('date|human', event)
    show(desc, r)

    desc="seconds from now"
    event = Date.now() + 7000
    r = F('date|human', event)
    show(desc, r)

    desc="a minute ago human"
    event = Date.now() - 60000
    r = F('date|human', event)
    show(desc, r)

    desc="a minute ago (long)"
    event = Date.now() - 60000
    r = F('date|human', event)
    show(desc, r)

    desc="a minute ago (short)" // (does not force segmented numeric)
    event = Date.now() - 60000
    r = F('date|human-short', event)
    show(desc, r)

    desc="an hour ago human"
    event = Date.now() - 3605000
    r = F('date|human', event)
    show(desc, r)

    desc="an hour ago (long)" // (does not force segmented numeric)
    event = Date.now() - 3600000
    r = F('date|human', event)
    show(desc, r)

    desc="an hour ago short" // (does not force segmented numeric)
    event = Date.now() - 3600000
    r = F('date|human-short', event)
    show(desc, r)

    desc="an hour ago formatted"
    event = Date.now() - 3600000
    r = F('date|human-h:mm:ss', event)
    show(desc, r)

    desc="a minute ago and some seconds (long)"
    event = Date.now() - 66600
    r = F('date|human', event)
    show(desc, r)

    desc="a minute, 40 seconds"
    event = Date.now() - 100000
    r = F('date|human', event)
    show(desc, r)

    desc = "today"
    event = Date.now()
    r = F('date|human-none', event)
    show(desc, r)

    desc = "tomorrow"
    event = Date.now() + (1000*24*3600)
    r = F('date|human-none', event)
    show(desc, r)

    desc = "yesterday"
    event = Date.now() - (1000*24*3600)
    r = F('date|human-none', event)
    show(desc, r)

    desc = "2 days ago"
    event = Date.now() - (2*1000*24*3600)
    r = F('date|human-none', event)
    show(desc, r)

    desc = "3 days ago"
    event = Date.now() - (3*1000*24*3600)
    r = F('date|human-none', event)
    show(desc, r)

    desc = "3 days from now"
    event = Date.now() + (3*1000*24*3600)
    r = F('date|human-none', event)
    show(desc, r)

    desc = "10 days from now"
    event = Date.now() + (10*1000*24*3600)
    r = F('date|human-none', event)
    show(desc, r)

    desc = "10 days ago"
    event = Date.now() - (10*1000*24*3600)
    r = F('date|human-none', event)
    show(desc, r)


    desc = "20 days ago"
    event = Date.now() - (20*1000*24*3600)
    r = F('date|human-none', event)
    show(desc, r)

results: 

    Date/Time of this test: Sunday, July 11, 2021 at 9:08:47 PM Coordinated Universal Time
    current event (human): a few moments ago
    moments ago human: a few moments ago
    moments ago long: 5 seconds ago
    moments ago short: 5 sec. ago
    1 second ago narrow: 1 sec. ago
    ms ago narrow: 0.25 sec. ago
    moments from now human: in a few moments
    moments from now long: in 5 seconds
    seconds ago, ms > 500: 8 seconds ago
    seconds from now: in 7 seconds
    a minute ago human: 1 minute ago
    a minute ago (long): 1 minute ago
    a minute ago (short): 1 min. ago
    an hour ago human: 1 hour ago
    an hour ago (long): 1 hour ago
    an hour ago short: 1 hr. ago
    an hour ago formatted: 1:00:00 ago
    a minute ago and some seconds (long): 1 minute ago
    a minute, 40 seconds: 1 minute ago
    today: today
    tomorrow: tomorrow
    yesterday: yesterday
    2 days ago: 2 days ago
    3 days ago: last Thursday
    3 days from now: next Wednesday
    10 days from now: a week from Wednesday
    10 days ago: Thursday, last week
    20 days ago: Monday, 2 weeks ago

# API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

## BadDateValue

Error thrown for an invalid value passed to the date formatter.

This may be due to a string that fails to parse, a non-Date object instance,
an Invalid Date instance, or not a Date or a string.

### Parameters

-   `message`  

## DateFormatter

DateFormatter

This is the _named handler_ for 'date' formatting.
This main class evaluates the passed value and discerns the desired Date object from this.
It then employs the internal `SimpleDateParser` to represent the date according to format.

## SimpleDateFormat

This internal class is the workhorse of DateFormatter.  It transforms a date format string into a correspondingly
formatted Date display utiliing the format components as decribed.  Will utilize `Intl` where appropriate, if available.

format notation:
     YYYY = 4 digit year (e.g. 2020)
     YYY =  4 digit year, but only show if not the current year
     YY = 2 digit year (e.g. 20)
     Y =  2 digit year only shown if not the current year
     (if a year is not shown, characters in format beyond are skipped until the next parse token)

     MMMM = full name of month (e.g. 'February')
     MMM = abbreviated name of month (3 letters, e.g. 'Feb')
     MM = 2 digit month (leading 0) (e.g. 02)
     M = 1-2 digit month (no leading 0) (e.g. 2)

     WWWW = Full weekday name (e.g. 'Saturday')
     WWW = three letter weekday abbreviation (e.g. 'Sat')
     WW = two letter weekday abbreviation (uncommon) (e.g. 'Mo', 'Sa')
     W = 1 - 2 letter weekday abbreviation (e.g. 'M', 'Th')

     DD = 2 digit day, with leading 0
     D = 1 - 2 digit day, no leading 0

     hhhh = 24 hour time, leading 0
     hhh = 24 hour time, no leading 0
     hh = 12 hour time, leading 0
     h  = 12 hour time, no leading 0

     m = minutes with leading 0
     m = minutes without leading 0

     ss = seconds with leading 0
     s  = seconds witout leading 0

     .sss = milliseconds (includes the .)
     .ss` = 1/100th seconds (includes the .)
     .s   = 1/10th seconds (includes the .)

     ++ = AM/PM notation (upper case)
     -- = am/pm (lower case)
     -+ - PM only (upper case)
     +- = PM only (lower case)
     -? = a/p (lower case)
     +? = A/P (upper case)

     x = milliseconds (as an integer without a period)

     j = javascript standard millisecond timestamp
     u = unix standard second timestamp

     all other characters are kept in place for format display. Do not use format characters elsewhere.

## getNow

Complement to `setArtificialNow`, returns
the agreed upon current time

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** real or artificial current timestamp, in milliseconds

## setArtificialNow

Set an artificial value for 'currentTime'.
Useful for debugging, or for setting up relative time scenarios
against a non-current context.
A string or number or Date suitable for a Date constructor
can be passed. Pass 0 or undefined to turn off.

### Parameters

-   `datevalue`  a value suitable for a Date constructor, or none to turn off

## DateRangeFormatter

DateRangeFormatter

This is the _named handler_ for 'daterange' formatting.

Evaluates the date format passed and uses this to group common aspects as implied by the given format
and then applies the group-separated formatting to the start and end dates of the range.
Uses `Intl` where appropriate and available.

## NumberFormatter

NumberFormatter

Standard formatter for displaying numbers with various precision and alignment formatting

## StringFormatter

StringFormatter

Standard formatter for the padding, truncation, and alignment of strings

## setFileOps

Sets up the file operation functions needed for the `i18n` / `locale-string-tables` support
This must be done prior to any use of the features of this module.
By default, file operations for a typical NodeJS environment are loaded.  If this does not
fit your needs, you MUST call this setup function.

### Parameters

-   `fileOps` **FileOps** 

## getFileOps

Returns the currently loaded fileOps object

Returns **FileOps** fileOps

## checkIntlSupport

Returns a string describing the availability and support for
W3C "Intl" library for DateTimeFormat.

If availability is complete, and the function `useIntl(true)` is called (with `true`),
this library will be used for most of the localization aspects of the date/time formatting.

Intl support may be necessary to support extended numbering systems or calendar options, or
to faithfully represent formats for certain locales.

Returns **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** one of:-   `complete` :  the Intl library appears to support languages beyond the system locale
-   `partial` : the Intl libary appears to support the system locale, but perhaps not others
-   `none` : there is no Intl support available on this system.

## useIntl

Call with the option to utilize the W3C Intl library, if available.

Use the `checkIntlSupport()` function to determine type of support available on this system.

If set true, Intl.DateTimeFormat will be called where appropriate rather than using the formatting and localization
entirely through this library.

Default is `false`: no use of Intl.

### Parameters

-   `use`  pass `true` to enable Intl support, false to disable

## getUseIntlChoice

Returns the current setting of the `useIntl` choice

Returns **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** the choice currently in effect

## SpecParts

Object that holds the parsed results of the format specification

-   hints: a string array that holds each hint as specified by ?hint1-hint2-hint3-etc
-   type: the named type of this format specification (and thus handler)
-   format: the passed format string (after the |)
-   locale: the passed locale (after the ~)

## registerFormatHandler

Attaches a format handler to the general Formatter choices
May be used to create a unique `IFormatHandler` instance as a new named type

### Parameters

-   `type`  
-   `handler`  

### Examples

```javascript
class MyFoobarFormatter extends IFormatHandler) {
         format(specParts:SpecParts, value:any):string {
             return 'FUBAR!'
         }
     }
     registerFormatHandler('foobar', MyFoobarFormatter)
```

## formatFactory

The primary export of the gen-format module: The `Formatter` operation (sometimes `F` as shorthand)
is represented by this function

A _specifier string_ defines the type of format handler either by name (e.g. 'date') or by inference (i.e. numbers and strings)
as well as the format and any hints or locale.

format type names are given first, followed by any locale or hint declarations, followed by a "|" character and
then the format.

locales are preceded by a tilde character (~).  Locales passed to date or number formatters may include
unicode extended values for calendar and numbering system if Intl support is available and enabled.

hints are indicated by a ? character.  If there are multiple hints, each is separated by a dash (-) character.
Hints vary according to the type of formatter used. Refer to the documentation for the specific formatter type.

Refer to the examples elsewhere in the `gen-format` module documentation
for the types of specifier strings and values that can be passed.

### Parameters

-   `spec` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The format specifier string.
-   `value` **any** The value to be formatted

### Examples

```javascript
import F, {useIntl} from '@tremho/gen-format
     useIntl(true) // assumes Intl is available. see `checkIntlSupport`

     console.log( F('date~zh-ZH-u-nu-hans-ca-chinese?Asia/Hong Kong|full', 'now') )
```

## UnknownFormatType

Error thrown for a specified type that does not exist

### Parameters

-   `message`  

## IncompatibleValueType

Error thrown for the wrong type of value passed to a handler

### Parameters

-   `message`  

## BadFormatSpecifier

Error thrown for a syntax error in the format specifier

### Parameters

-   `message`  

## formatV

Use a format template string and passed arguments to create
a formatted output

### Parameters

-   `fmt`  The first parameter is a string that defines the format template
-   `args`  Subsequent arguments represent the value sources that are represented

### Examples

```javascript
import {formatV} from 'gen-format'

     formatV("Pi day, $(date|MMM DD} honors the value Pi which is $(1.2)", '2021-03-14Z', Math.PI)
```

## i18n_API

This is access to the localization support features of the internal `@tremho/locale-string-tables` module
that `gen-format` uses.  This API allows you to use the `i18n` string tables for your own purposes as well.

Access this API with `import {i18n} from "@tremho/gen-format")`

for the i18n API reference, see the [@tremho/locale-string-tables reference](https://github.com/tremho/locale-string-tables#api)

each of the API functions listed there can be found off of the imported `i18n` namespace object.

_Note: `loadForLocale` is not exported by this API bridge. use `setLocale` instead, which will also load if needed_

In addition to the APIs revealed by this bridge, please note the `init` function documented below.

## init

Call once before using other functions of the i18n API.
If you do not call this before using any of the api functions, then it will be called upon first entry into an
api function, but there may be a resulting slight delay due to the initialization.
For this reason, it is best to initialize ahead of time.
As a convenience if you need to supply custom FileOps (see `Formatter.setFileOps()`), you may pass your
FileOps object here rather than having to call `Formatter.setFileOps()` first.  Both methods are equivalent
in functional result.

### Parameters

-   `withFileOps`  The FileOps that will be passed to `Formatter.setFileOps()` before initializing the
    i18n system.
