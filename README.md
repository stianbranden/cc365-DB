# Prerequisites
- [NodeJS](https://nodejs.org/en/) installed
- Clone repository
- Add .env file
- Run "npm i"
- Run "npm start"


# .env file
**Must contain:**

PORT = *Port for webserver*

BASE64 = *Base64 string of cc365 username:password*

PROXY = *Proxy adress to use for api request*

USEPROXY = *true = user proxy set over, false = do not use th eproxy settings*

Alternatively these parameters can be set to enviranmental variables


# Sass variables
To easy customize look of the page, edit *public/css/_variables.scss*

$brand-color = *Main color used in navbar*

$secondary-brand-color = *Secondary color used in cards*

$bar-font-color = *Color contrasting good with both bfrand and secondary color*

$small-size = *Mobile breakpoint for responsive design*

$big-size = *Desktop breakpoing for responsive design*