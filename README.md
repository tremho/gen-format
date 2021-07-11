
# gen-format
###### General purpose and expandable format solutions for JavaScript / TypeScript

[![Build Status][build-status]][build-url]
[![NPM version][npm-image]][npm-url]
[![Downloads][downloads-image]][npm-url]
[![TotalDownloads][total-downloads-image]][npm-url]
[![Twitter Follow][twitter-image]][twitter-url]

[build-status]: https://travis-ci.com/tremho/gen-format.svg?branch=master

[build-url]: https://travis-ci.com/tremho/gen-format

[npm-image]: http://img.shields.io/npm/v/@tremho/gen-format.svg

[npm-url]: https://npmjs.org/package/@tremho/gen-format

[downloads-image]: http://img.shields.io/npm/dm/@tremho/gen-format.svg

[total-downloads-image]: http://img.shields.io/npm/dt/@tremho/gen-format.svg?label=total%20downloads

[twitter-image]: https://img.shields.io/twitter/follow/Tremho1.svg?style=social&label=Follow%20me

[twitter-url]: https://twitter.com/Tremho1


General purpose and expandable format solutions framework
including support for
- string: truncation, padding, and alignment
- numeric: decimal places, leading zeros, padding

- Uses `@tremho/locale-string-tables` to support i18n localization 
- date and time (with/without i18n support format definitions)
- date range and durations (w/wo i18n)  

Number and Date features will utilize the W3C Intl subsystem
internally if this is available.  Use of Intl is controllable
to insure consistent behavior across installations that may
or may not have this installed.

`gen-format` aims to be faithful to the Intl behavior in the
display of equivalent format functionality.
But `gen-format` also goes further in many cases, with
features such as:

- _Number Formatting_: Ability to align output with space padding
- _Number Formatting_: Ability to __not__ round a value
- _Date Formatting_: Expanded human-like descriptions for date ranges and relative times

While many of the formatting features of `gen-format`
may be possible to achieve in other ways, the `gen-format`
approach using template strings aims to be more syntactically
consistent between different types of formatting, and
to be portable and malleable enough to fullfill localization
needs.

`gen-format` presently does not have support for currency 
or unit display. However, currency display and unit display/conversion
features are planned for a later (possibly 2.0) release,, so watch this space.

`gen-format` provides support for over 50 languages and
multiple regions (matching a survey of Intl support under Chromium
and Node).
This support comes from the `i18n` localization files
which are downloaded separately.  See the setup instructions
in this document for more information.




### Installation

to install, type

    npm install @tremho/gen-format

### Usage

There are two main ways to use the gen-format module.  One simply
calls the core formatter directly, converting a value into a formatted string.
The second uses a templated string format to format a mixture of different values of different types
and literals to produce a formatted output.
You can mix and match how you use these two forms to suit the needs
of your application.

Read [the API documentation](API.md) for details.

### Internationalization

If you only need formatting for non-localizable purposes,
there may be nothing else to do.  Just use the API as directed.

For gen-format, internationalization / localization support
is mostly in regard to the Date/Time formatting, although there
are some aspects to number formatting that are subject to
locale rules as well.

Internationalization support is available via two different
possibilities.

If your system supports the [W3C Intl library](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)
then many of the formatting features can redirect through these APIs.

Note that many Javascript runtime environments either do not support 
the Intl library or else only have it implemented for the system locale.

Note that if you are running NodeJS, capabilities of tje
Intl solution may vary depending upon the version of Node,
how it was built, and/or the existence of the full icu4c-data module
and the environment Node is running within.  

See this link for [icu4c-data](https://www.npmjs.com/package/icu4c-data)
and this one for [Node Intl information](https://nodejs.org/api/intl.html#intl_internationalization_support)
for more information about setting up full icu data.

Within `gen-format`, you can use the `checkIntlSupport` and `useIntl`
functions from `Formatter` to determine your Intl capabilities
and control whether or not you wish `gen-format` to use it.
 
`checkIntlSupport()` will return either 'complete', 'partial', or 'none',
reflecting the discovery of Intl namespace and its capabilities.

If support is 'complete' or 'partial', it may be used.  
To enable its use, you must call `useIntl(true)`.

Note that a partial Intl availability is limited to the local
system locale. A practical option may be to not include string
table data in your app, and rely on the partial implementation
of Intl to correctly format Dates for the current locale.

If the support is 'none', you must include string table data 
for any locales you wish to support outside of `en-US`

#### Internationalization support via string tables

With or without Intl support, at least some locale-aware Date and Time formatting
will use language and region specific string translation tables
as provided for by the [@tremho/locale-string-tables]() 
module.

The string table data is not provided in the npm package for
`gen-format`, as it is technically optional to use it, and it
should reside at the root of your app project, not couched within the 
node_modules directory structure.  In this way, you are able to use
the `i18n` tree for your app's own localization needs and/or
can manage which languages you wish to support and ship with.

##### Downloading the `i18n` data

Point your web browser to [this web location](https://github.com/tremho/gen-format/releases/tag/v1.0.1)
and click on the `i18n.zip` attachment link to download the
data to your computer.  Unpack the zip file into the folder tree
and place the whole of the `i18n` folder into the root of your
app project.

##### Setting up for your environment

For many NodeJS projects, you will not need to do anything
further.  The presence of the `i18n` folder will be detected and utilized
by the `gen-format` code and will provide localized terms and 
formats even if Intl is not available or you have chosen
not to use it.

If you are running in an environment other than NodeJS (such as a 
web browser, or perhaps a NativeScript context or something similar), you will need
to supply a custom `FileOps` object that is used to access
the `i18n` files using the file system of your runtime environment,
and/or to provide the correct relative path to the root where
your `i18n` folder resides.

If you need to set up a custom FileOps object for your runtime context,
please refer to [this documentation](https://github.com/tremho/locale-string-tables#using-locale-string-tables)
for how to construct such an object.

##### Initializing Formatter and i18n

Full initialization, including setting of a `FileOps` object can
be seen in the example below.
_Note that this is optional for a typical NodeJS project, because
by default, the `Formatter` is initialized with an internally
supplied version of `NodeFileOps`. The default setting for
`useIntl` is `false`, so if you wish to enable Intl support (
assuming it is availale), you must do that directly by calling 
`useIntl(true)`.

```
import {checkIntlSupport, useIntl, setFileOps} from "@tremho/gen-format"'"
import fileOps from '../src/NodeFileOps' // or whatever your own FileOps implementation is

// Set up your custom FileOps object
setFileOps(fileOps)

// Use Intl if it is complete, otherwise no.
let intlStatus = checkIntlSupport()
// intlStatus will be one of `complete`, 'partial', or 'none'
if(intlStatus === 'complete') {
    useIntl(true) // enable Intl use (default is false)
}

```
These initialization steps, if used, should occur once before any
other use of the `Formatter` in your application, such as at app startup.

### Using the `gen-format` module

The core `Formatter` object is the default export of
the `gen-format` module.  Use it like this:

```
import Formatter from "@tremho/gen-format"
```
or, if you are using `require` syntax:

```
const Formatter = require("@tremho/gen-format").default
```

For brevity, the `Formatter` object is often abbreviated 
as simply `F`, so importing may look like this instead:

```
import F from "@tremho/gen-format"
```
or
```
const F = require("@tremho/gen-format").default
```

Other API items are imported indirectly. For example

```
import {checkIntlSupport, useIntl, setFileOps, getFileOps} from "@tremho/gen-format"
```
(or `const {import {checkIntlSupport, useIntl, setFileOps, getFileOps} = require("@tremho/gen-format")`)

to use the `formatV` function:
```
import {formatV} from "@tremho/gen-format"
```
(or `const {formatV} = require("@tremho/gen-format")`)

to gain access to the `i18n` API:
```
import {i18n} from "@tremho/gen-format"
```
(or `const {i18n} = require("@tremho/gen-format")`)

Refer to the [API docs](./API.md)
for how to use the formatter, and the _i18n API_ section
found there for how to access the _i18n_ features for
your own uses.

### Reporting issues and contributing

Please tell us if there are any problem you are having
with this module package.  We strive to create highly useable
products, but sometimes (as you may know as a developer yourself),
things "work fine on our systems" but may not go as smoothly on everyone
else's.  

Those of you fluent in languages can be of great service by
pointing out any localization errors you may find in the output
and/or the _i18n_ string tables.  
Most of the translation source comes either directly or
indirectly from the _W3C Intl_ subsystem as implemented in 
Chromium, so these aspects are probably okay, but the other
extended features rely on Google Translate for the first iteration of
translation, which I'm sure must have some contextual errors involved
for at least some languages.

Report any issues on the [Project Github Issues Page](https://github.com/tremho/gen-format/issues)
Please use the appropriate tags to identify your issue, such as "bug", "enhancement",
"documentation", or "question".

If you prefer to work with the Github source directly, that's great.
If you make changes, especially useful ones, please submit a Pull Request
with your updates.

If you simply have a question that can't be answered by the documentation,
you may also submit this as an issue.  Please use the "question"
tag to identify your post as a question.

Thank you for your interest in @tremho/gen-format.

Happy formatting!



