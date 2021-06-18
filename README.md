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

NODE_ENV = *Environment variable, set production to avoid some console logs*

UPDATE_FREQUENCY = *In ms the time between updates, time-out if error is set to 6 times the update frequency, defaults to 10 000ms=10s*

KINDLYXXXX = *Key used to fetch chattranscripts from Kindly*

XAPIKEY = *Sinch X-api key*

USENEWAUTH = *To use x-api key for all queries to Sinch*

RUNRAI = *To run RAI requests*

AZURE_CLIENTID = *Azure AD OATH Client ID*

AZURE_CLIENTSECRET = *Azure AD OATH Client Secret*

MONGODBURI = *Connection string for MongoDB*

MONGODBNAME = *MongoDB name*

SESSION_SECRET = *Session sercret used for express session*

RAI_URL = *Sinch RAI URL*

AUTH_URL = *Sinch AUTH URL, not used if USENEWAUTH*

BASE_URL = *Sinch BASE URL, not used if USENEWAUTH*

Alternatively these parameters can be set to enviranmental variables


# Sass variables
To easy customize look of the page, edit *public/css/_variables.scss*

$brand-color = *Main color used in navbar*

$secondary-brand-color = *Secondary color used in cards*

$pop-brand-color = *Color used to stand out, works instead of secondary color*

$bar-font-color = *Color contrasting good with both bfrand and secondary color*

$small-size = *Mobile breakpoint for responsive design*

$big-size = *Desktop breakpoing for responsive design*


$color-light-blue

$color-lighter-blue

$color-good

$color-best

$color-bad

$color-yellow

$color-light-grey

$color-grey

$color-dark-grey

$color-hotpink

$color-purple = *Etc Colors*