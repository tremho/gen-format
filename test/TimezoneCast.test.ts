
/*

Test casts to timezones.
No cast should be same as UTC

should accept cast by anchor, city, abbreviation, or GMT+/- offset

 */

import Tap from 'tap'

import F from '../src/Formatter'
import {formatV} from '../src/Formatter'
import fileOps from '../src/NodeFileOps'
import {setFileOps} from "../src/Formatter";

setFileOps(fileOps)

function TimezoneTest() {
    let r, x, desc
    let tn = 1;
    Tap.test('Timezone casts', t => {


        let dt = '2021-01-25T00:10:00Z'
        desc="locale and hint"
        r = F('date~en-US?gmt|full', dt)
        x = 'Monday, January 25, 2021 at 12:10:00 AM Greenwich Mean Time'
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)
        
        desc="hint and locale"
        r = F('date?gmt~en-US|full', dt)
        x = 'Monday, January 25, 2021 at 12:10:00 AM Greenwich Mean Time'
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)
        


        desc = 'cast to gmt'
        r = F('date?gmt|full', dt)
        x = 'Monday, January 25, 2021 at 12:10:00 AM Greenwich Mean Time'
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)
        

        desc = 'cast to est'
        r = F('date?est|full', dt)
        x = "Sunday, January 24, 2021 at 7:10:00 PM Eastern Standard Time"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)
        

        desc = 'cast to cst'
        x = "Sunday, January 24, 2021 at 6:10:00 PM Central Standard Time"
        r = F('date?cst|full', dt)
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)
        

        desc = 'cast to mst'
        x = "Sunday, January 24, 2021 at 5:10:00 PM Mountain Standard Time"
        r = F('date?mst|full', dt)
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)
        

        desc = 'cast to pst'
        x = "Sunday, January 24, 2021 at 4:10:00 PM Pacific Standard Time"
        r = F('date?pst|full', dt)
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)
        

        desc = 'cast to local'
        r = F('date?local|full', dt)
        let x2 = "Monday, January 25, 2021 at 12:10:00 AM Greenwich Mean Time" // for local is GMT (travis)
        let localTimeIsGMT = r === x2
        t.ok(r === x || r === x2, `${desc}: expected "${x}", got "${r}"`)
        

        // wintertime
        desc = 'no cast default, winter'
        r = F('date|full', dt)
        x = 'Monday, January 25, 2021 at 12:10:00 AM Coordinated Universal Time'
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)
        

        desc = 'cast to utc, winter'
        r = F('date?utc|full', dt)
        x = 'Monday, January 25, 2021 at 12:10:00 AM Coordinated Universal Time'
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)
        

        desc = 'cast to gmt, winter'
        r = F('date?gmt|full', dt)
        x = 'Monday, January 25, 2021 at 12:10:00 AM Greenwich Mean Time'
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)
        

        // summertime
        dt = '2021-06-25T00:10:00Z'
        desc = 'no cast default, summer'
        r = F('date|full', dt)
        x = 'Friday, June 25, 2021 at 12:10:00 AM Coordinated Universal Time'
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)
        

        desc = 'cast to utc, summer'
        r = F('date?utc|full', dt)
        x = 'Friday, June 25, 2021 at 12:10:00 AM Coordinated Universal Time'
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)
        

        desc = 'cast to gmt, summer'
        r = F('date?gmt|full', dt)
        x = 'Friday, June 25, 2021 at 1:10:00 AM British Summer Time'
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)


        desc = 'cast to est, summer'
        r = F('date?est|full', dt)
        x = "Thursday, June 24, 2021 at 8:10:00 PM Eastern Daylight Time"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)


        desc = 'cast to cst, summer'
        x = "Thursday, June 24, 2021 at 7:10:00 PM Central Daylight Time"
        r = F('date?cst|full', dt)
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)


        desc = 'cast to mst, summer'
        x = "Thursday, June 24, 2021 at 6:10:00 PM Mountain Daylight Time"
        r = F('date?mst|full', dt)
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)


        desc = 'cast to pst, summer'
        x = "Thursday, June 24, 2021 at 5:10:00 PM Pacific Daylight Time"
        r = F('date?pst|full', dt)
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)


        desc = 'cast to local, summer'
        r = F('date?local|full', dt)
        if(localTimeIsGMT) x = "Friday, June 25, 2021 at 12:10:00 AM Greenwich Mean Time"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)


        desc = 'cast to edt, summer'
        r = F('date?edt|full', dt)
        x = "Thursday, June 24, 2021 at 8:10:00 PM Eastern Daylight Time"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)


        desc = 'cast to cdt, summer'
        x = "Thursday, June 24, 2021 at 7:10:00 PM Central Daylight Time"
        r = F('date?cdt|full', dt)
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)


        desc = 'cast to mdt, summer'
        x = "Thursday, June 24, 2021 at 6:10:00 PM Mountain Daylight Time"
        r = F('date?mdt|full', dt)
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)


        desc = 'cast to pdt, summer'
        x = "Thursday, June 24, 2021 at 5:10:00 PM Pacific Daylight Time"
        r = F('date?pdt|full', dt)
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        // preferred method: use full IANA anchor
        desc = 'cast to Europe/London, summer'
        r = F('date?europe/london|full', dt)
        x = 'Friday, June 25, 2021 at 1:10:00 AM British Summer Time'
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)


        desc = 'cast to America/New York, summer'
        r = F('date?America/New York|full', dt)
        x = "Thursday, June 24, 2021 at 8:10:00 PM Eastern Daylight Time"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)


        desc = 'cast to America/Chicago, summer'
        x = "Thursday, June 24, 2021 at 7:10:00 PM Central Daylight Time"
        r = F('date?America/Chicago|full', dt)
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)


        desc = 'cast to America/Denver, summer'
        x = "Thursday, June 24, 2021 at 6:10:00 PM Mountain Daylight Time"
        r = F('date?America/Denver|full', dt)
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)


        desc = 'cast to America/Los Angeles, summer'
        x = "Thursday, June 24, 2021 at 5:10:00 PM Pacific Daylight Time"
        r = F('date?America/Los Angeles|full', dt)
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        // city only
        desc = 'cast to London, summer'
        r = F('date?london|full', dt)
        x = 'Friday, June 25, 2021 at 1:10:00 AM British Summer Time'
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)


        desc = 'cast to New York, summer'
        r = F('date?New York|full', dt)
        x = "Thursday, June 24, 2021 at 8:10:00 PM Eastern Daylight Time"
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)


        desc = 'cast to Chicago, summer'
        x = "Thursday, June 24, 2021 at 7:10:00 PM Central Daylight Time"
        r = F('date?Chicago|full', dt)
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)


        desc = 'cast to Denver, summer'
        x = "Thursday, June 24, 2021 at 6:10:00 PM Mountain Daylight Time"
        r = F('date?Denver|full', dt)
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)


        desc = 'cast to Los Angeles, summer'
        x = "Thursday, June 24, 2021 at 5:10:00 PM Pacific Daylight Time"
        r = F('date?Los Angeles|full', dt)
        t.ok(r === x, `${desc}: expected "${x}", got "${r}"`)

        t.end()
    })
}

TimezoneTest()


