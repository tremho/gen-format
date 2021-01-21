# Gen-Format 

### Overview
`gen-format` is a JavaScript library module providing text formatting
features for a variety of purposes, including

- string template with multivariant argument formatting
- formatting numbers for decimal places and alignment
- formatting text for alignment
- formatting date and time in numerous formats
- formatting date ranges and relative times
- localization support
- leverages the JS standard `Intl` APIs if available
- also works in environments without `Intl` present.
- Extensible construction allows future expansion
- Currency, and Unit Measure format support coming soon.

`gen-format` is written using Typescript and has full Typescript
definition support included.

### Installation

Install using NPM:
`npm install -s gen-format`

#### Two ways to use
Values may be formatted into display strings either by
a function call that formats a single value, or through use
of a template string with arguments that pass the values.

###### Using the direct format function
The formatter function is the direct export of the `gen-format` module,
and may be imported like this:

`import Formatter from 'gen-format`

or, if using require:
`const Formatter = require('gen-format')`

and then use like this:
```
// format the value as an integer with two digits, leading zeroes,
// and 3 decimal places (rounded)
let v = Math.PI
let result = Formatter('02.3', v)
// result = "03.142"

// same, without leading zeroes
let result = Formatter('2.3', v)
// result = " 3.142"

// same, without leading padding
let result = Formatter('-2.3', v)
// result = "3.142"

// ...without rounding
let result = Formatter('!2.3', v)
// result = "3.141"
```
This form can be used in the formatting of a larger string
by calling the formatter function as part of a backtick defined 
expansion string:
```
result = `The value of PI, ${Formatter('1.3',Math.PI)}, is useful for many math calculations.` 
```
If you are going to use this form, you may want to import to a smaller
variable name, for brevity.  e.g.:
```
import F from 'gen-format

result = `The value of PI, ${F('1.3',Math.PI)}, is useful for many math calculations.` 

```

###### Using the `formatV` function
The other way to use the formatter is to use a _template string_ and
subsequent _value arguments_ to compose a formatted output string that
displays zero or more values.
This is similar to a _sprintf_ approach.

Start by importing the _formatV_ function:

```
import {formatV} from `gen-format`
```
or, if using require:
`const {formatV} = require('gen-format')`

use like this:

```
let result = formatV("The value of PI, $('2.3') is useful for many math calulations", Math.PI)
```

You can see that this is similar to the previous example, but here
we define the position and the format of the value in the template string,
and then pass the value that goes there as subsequent arguments to the
`formatV` function.

Arguments are, by default, accessed in the respective order of
the formats that describe them:

```
let weather = 'rain'
let place = 'Spain'
let terrain = 'plain'

let result = formatV('The $() in $() is mainly in the $()',
                    weather, place, terrain)
                    
// result = 'The rain in Spain is mainly in the plain'

```
However, one can also designate which variable should be used
in each location:

```
let vehicle = 'cart'
let animal = 'horse'

let result = formatV("This places the $2() before the $1()",
    animal, vehicle)

// result = 'This places the cart before the horse'
    
```
or, by named property:

```
let obj = {
 vehicle: 'cart',
 animal: 'horse'
}
let result = formatV("This places the $vehicle() before the $animal()", obj)

// result = 'This places the cart before the horse'

```
###### Formatting strings

We've seen some examples above for formatting numbers, and for
displaying strings plainly without format.  Now let's look at
some of the key features of string formatting.

String formatting is basically defined by a format string
that states <min>,<max> sizes for string.  That is, two numbers
separate by a comma, as in "5,10". This example would mean
a string value should be displayed using no fewer than five characters,
and no more than ten. Thus:

```
import F = `gen-format`

console.log( '"'+ F('5,10', 'test') )+'"' 
// results in "test "

console.log( '"'+ F('5,10', 'this is a test') )+'"' 
// results in "this is a "
```
a format specifier of '10,10' would insure a string is always displayed as
ten characters, by padding with spaces if less, and truncating if more.

Padding with spaces to the right is the default (left-aligned).  
You can also specify that padding be to the left, or in other words, that
the text is right-aligned to fit the space, like this:
```
console.log( '"'+ F(' 8,8', 'test') )+'"' 
// results in "    test"
```
or centered, like this:
```
console.log( '"'+ F(' 8,8 ', 'test') )+'"' 
// results in "  test  "
```
and padding can be other than a space, as in:
```
console.log( '"'+ F('>8,8<', 'test') )+'"' 
// results in ">>test<<"
```

_For more details on the format options for strings and numbers, please
refer to the API documentation_

###### Formatting date and time
Date and time formatting is implemented as a _named extension_
to the formatting applied to numbers and strings, and offers full 
support of the `Intl` APIs for localized date and time displays as
well as _moment_-like formatting options.

To display a value as a date, the `date` type must be specified in the format specifier string.

For example, 

```
let dt = new Date('2021-02-14:19:30:00Z') 
let result = F(`date|MMMM DD YYYY h:mm ++', dt) 
// Feburary 14, 2021 7:30 PM
```
Check the API documentation for more on the display options for 
date / time, as there are many.

Date values passed may be any of the following:

- a `Date` instance
- a millisecond timestamp number (i.e. the value of Date.getTime())
- a string which is parseable by the standard Javascript Date parser.
- the string 'now', which results in the current time, same as `new Date()`
- certain relative keywords, such as "tomorrow", "last week", "next month"

See the API documentation for more details.

Date / times are in Universal Time (UTC, GMT) by default.
A Date/Time can be displayed in an alternate timezone by passing
the desired timezone as a _format hint_, indicated by the '?' character.
For example:

```
let dt = new Date('2021-02-14:19:30:00Z') 
let result = F(`date?est|MMMM DD YYYY h:mm ++', dt) 
// Feburary 14, 2021 2:30 PM
```
Timezones can be specified by common abbreviation, or by 
the representative city as recognized by the [IANA Timezone
Database](https://www.iana.org/time-zones).

The following all resolve to a GMT-5 timezone offset and corresponding
time display:

- est
- EST
- Eastern Standard Time
- edt *
- EDT *
- Eastern Daylight Time *
- Eastern
- GMT-5
- America/New York

_* Daylight time names/abbreviations are conflated with their standard time
counterparts, and both will name the same region (e.g. Eastern US).
Since the host system is Daylight Time aware, daylight time offsets will be
used in any daylight time display regardless of which hint value is used.
For consistency, prefer use of "America/New York", "Eastern" or "EST" to avoid confusion
by other readers of your code._

###### Date and time localization
Assuming your Javascript environment supports the `Intl` APIs (true in most
cases), you are able to pass the locale strings as part of the
_format specifier_ string using the tilde (~) character and the
[IETF BCP 47](https://tools.ietf.org/html/bcp47) standard locale string (2-letter lowercase language code,
optionally followed by a dash and a 2-letter uppercase country code,
as in en-US, or jp-JP).

You can (and in most cases, should) also forego specific Year/Month/Day,
and hour/minute/second formatting, which can be customarily different 
in differing locales, and instead prefer use of _style_ directives
(as defined by the `Intl` library) of __full__, __long__, __medium__,
and __short__.

For example:

// TODO: Bug: use of _style_ formats results in cast to local time.
```
let dt = new Date(2021-01-13TZ)
```

Unicode locale extensions that are given in the _locale_ string are passed along 
to the underlying `Intl` library calls, so requests for alternate numbering
sets or alternate calendars may be honored.  See [Intl use of locales documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat#using_locales)
for details.

Use of the _style_ format keywords(e.g. 'long', 'short') is more portable, but sometimes
you need more explicit control over the format string, so the 
specific format specifiers are also available.
Note that certain locale-based language translation may still be honored
when used with this format, but a better localization strategy is to stick 
with the predefined _style_ types rather than format your own.

###### Date Range display

Displaying a range of dates is handled by the `daterange` format
type, and displays dates in a range-interpreted version of the date
format passed, which takes the form of a standard date display format.
For example:

// TODO: switch to arrays for date range
// TODO:
```
dt1 = new Date('2021-04-03T10:12:00Z')
dt2 = new Date('2021-04-03T12:50:00Z')
r = F('daterange|MMM D hh:mm ++', {startDate:dt1, endDate:dt2})
// r = 'Apr 3 10:12 AM - 12:50 PM'

dt1 = new Date('2021-01-20T00:00:00Z')
dt2 = new Date('2021-04-03T00:00:00Z')
r = F('daterange|YYYY MMM D', {startDate:dt1, endDate:dt2})
// r = '2021 Jan 20 - Apr 3'

r = F('daterange|MMM D, YYYY', {startDate:dt1, endDate:dt2})
// r = 'Jan 20 - Apr 3, 2021'

```
When displaying a date range, items will be grouped for the consistent
aspects of the range according to the format, with the range 
specfied with a dash separator for the relevant difference.

###### Relative time display
The `daterange` formatter may also be used to show the difference between
times, including the difference from the current time.

This is done by supplying the _diff_ hint to the formatter.
For example:

```
dt1 = new Date() // now
dt2 = dt1.getTime() - 1000 // one second before now

console.log( F('daterange?diff',[dt2, dt1]
// -1.0 second
console.log( F('daterange?diff-human',[dt2, dt1]
// 1.0 second ago

dt2.setDate(dt2.getDate()-1)
console.log( F('daterange?diff',[dt2, dt1]
// -1 day 1 second
console.log( F('daterange?diff-human',[dt2, dt1]
// yesterday

```

