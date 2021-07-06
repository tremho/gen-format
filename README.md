
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
- future units of measure and currency to be added (via `@tremho/locale-string-tables`)

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
there is nothing else to do.  Just use the API as directed.

To use the localized features of gen-format (for example, the DateTime formatter),
you must set up an `i18n` folder tree per `@tremho/locale-string-tables`
to hold the translation strings and formats.

This involves two parts.  The first is to create (or copy) the
`i18n` folder tree and populate it with the proper string identifiers.
You will find a copy of what you need in the gen-format distribution.
After installing gen-format, go to your project directory and
type 

    cp -r ./node_modules/@tremho/gen-format/i18n ./i18n

(_note the copy command above is for linux-lke operating systems.
For Windows, please adjust, or use File Explorer to perform the copy_)

If you have other localization needs for your application, you 
may wish to install and use `@tremho/locale-string-tables` for
your own purposes as well.  Just add your additional localization
string files into this pre-existing `i18n` tree

You may also safely remove any language/region folders you do not wish
to support in  your application.  You may also edit the localized
terms if you need to.  You should check these files into your repository
as they are now effectively part of your application sources.

##### Assigning FileOps

The second part to integrating i18n support is to supply a
`FileOps` object. This object links the library to your file
system (which may be Node-based, or may be another).







