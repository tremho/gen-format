
### Making our Formatter a module

###### Started 1/10/21
Better to do this as a module now than to go through yet another
refactor. Already started this in Thunderbolt, migrating from WanWan.

This is a good opportunity to clean, refactor, and improve and to
make a prime-time ready NPM module.

###### Target End: 1/15/21
This was part of a single task for logging in TB, and it grew 
exponentially here in dependency scope once examined.  So that
target has been moved to __1/20/21__ so hopefully we can get 
this and the others (i18n, source maps) done comfortably before then.

We are working on a slightly different paradigm that puts the
guts of the formatter into a separate public function

for a single value:

    F = Formatter(hint?, spec?, fmtStr, value)

like 

    limited size string = "${F('10,20', str)
or

    this price is $${F('02,2, value) dollars

and then implement our existing format mode in
terms of these string/number bases.

Maybe also date or other extensions ${F('date|hint', value)

- [ ] create the key formatter function
    - [X] for numbers 
        - <s>[ ] decimal alignment e.g. 2. <6 or 2.2 >6
        means format then pad from right or left so that the
        decimal point is always at this location (6) from r/l.  
        </s> ___we can already do that___ with other options  
    - [X] for strings
        - <s>[ ] alignment >N or N< is pad from left, right to reach N
        and >N< is centered
          </s> ___we can already do that___ with other options

    - [ ] for extensions / date

- [ ] TODO and roadmap international-strings support
    - [ ] Perhaps create this with intl discovery and other
    stubbed functions so we can use it as a mock now.
- [ ] implement our muli-variable parser in these terms
- [ ] create TS .d file
- [ ] define tests
- [ ] create separate module test
- [ ] create documentation

--------

###### 1/13

- going okay, I guess, but time to think about reletive ranges
- we have a loose form working now
- will also want to have a more precise format
- and of course we want gradiations (4 -1) like other features

0. explore other scnearios for date ranges and relative vocabs.
1. come up with terms for style
2. devise gradients for each style 
3. flex out the syntax

<div style="margin-left: 100px; width: 300px; background:lightblue">
<h3>Oh hell... how did I miss this</h3>

  <code>Intl.relativeTimeFormat</code>

_This is what we want to use_
</div>
mement uses the term humanize with boolean for prefix
Lets use 'diff' instead of 'relative'

diff human
Past "2 minutes ago"; 2 minutes before Date  
Future "in a minute"; a minute after Date

diff digital 
Past 2:00 min ago, 0:12 sec sgo; since 1:23pm
Futre in 1:14 min; in 1:23 hours; at 3:14am Tue

no-diff
Date - Date

human
from Date to Date

digital
2:00 - 3:00pm
5:30am - 3:30pm Sept 23

DT / TD
Sept 23 5:30 - 7:30am
5:30 - 7:30am Sept 23

| keyword | before | after |
| ------- | ------ | ----  |
| diff  | ago, since | in, at |
| human | from, to         | 
|       | fmt - fmt
| DT | date then time
| TD | time then date

If stert/end have the same am/pm or date, this only needs to be 
printed once, but uses the same format style.
if these things can be commonized:
if DT, date is shown on first only
if TD, date is shown on second only
am/pm is shown on second only 


these all have the same style, but different values
Jan 15 3:00pm - Jan 22 10:00am 
Jan 15 8:00am - 3:00pm
Jan 15 7:30 - 10:30am

We can also group dates if there is no time component
Same month:
- March 5-8, 2021
- from March 5 to 8, 2021
- 3/5 - 3/8, 2021

Same year:
- March 5 - April 10, 2021
- March 5 10:00am - April 10 5:00pm, 2021


#####style types
- full
- medium
- long
- short

prefixed date and time with D/T, and order: Dfull Tshort
can also be explicit h:mm-- WWW MMM DD
in this case no D/T prefix is needed

###### Human
- from/to for date to date
- loose description: ago, since / in,at for date to now

###### Diff
- dash for date to date
- short from digital w/unit: ago, since / in,at for date to now

####### short form digital w/unit
1yr 3mo 2wks 1dy 4:32 hrs ago
1234:32 hrs ago
√ 423.4 days ago
(smallest unit that can be represented in 3digs or less)
for values less than 10 hours:
hh:mm:ss ago

####from Date to Date
######full = no grouping, full words
from 10:00am Friday January 15, 2021 to 5:00pm Friday January 22, 2021

from 8:00am Friday January 15, 2021 to 10:00am Friday January 15, 2021

######medium - grouped, full words
from 8:00 to 10:00am Friday January 15 2021

###### short/medium
8:00 - 10:00am Friday January 15 2021

###### short/long
8:00 - 10:00am Fri Jan 15 2021

###### short/long optimized
8 - 10am Fri Jan 15 2021

###### short
8:00 - 10:00am 01/15/21

###### short optimized
8 - 10am 01/15/21

-----
When we get to units:

on the fly value
`F('unit|(2.3) kg as lb', 4.2)`
otherwide, we can use 'as' for a unit

When we write it up and publish:

- flexible formatter
- best of backtick and sprintf approaches
- extensible
- utilizes Intl
- date is moment-like, but better
- localization: Intl, timezones, 
- date ranges
- currency
- units of measure

------

#### Back to notes


- Pass an array for daterange 
  - sort in order for time expression
  - then take first and last
  - for diff, compute sign before sort
  
<s>- Default to local time.  absence of (TZ) is Local. Remove hack
from findTimezone.</s>
  
- √ use hint to defne TZ cast date?PST|fmt <s>as well as date|fmt (PST)</s>
- √ Remove display of parenthesis around timezone 
  

√ Using IRTF for relative time

hint:
- √ diff specifies we are using diff
- √ 'human' maps to numeric: 'auto'  'always'
- √ long/short/narrow go directly to style
- √ other hints pass through to dateformatter (i.e. timezone)

--------------

Next branch:
- √ Updated version that uses Intl for all formatted elements.
- √ bug: allow locale next to type in spec
- √ clean: take out the `'' // getFormatParts` items not used

Branch after that:
- Documentation and associated tests

- [ ] Bug: use of _style_ formats results in cast to local time.
- [ ] change daterange to use array
- [ ] typeless $() variable passing

- [ ] typescript .d 
- [ ] external module import and example cases

--------------

- import into Nativescript and test compliance there (Intl, etc)
- write a blog (this can be the presentation for your example cases) 
- nudge folks / start WoM campaign

___Be sure to go through everything again and look for issues that
might bite us___

--------------
# Push It!


