# PureHelpers
Importable pure ES helper methods

##Usage
```javascript
const helpers = require("./PureHelpers").import("randomString, numberBetween".split(","), {});
helpers.randomString();
Number.prototype.between = function (min, max) { return helpers.numberBetween(this, min, max); }
// etc.
```
--
`randomString (prefix = "", minRandomNumberValue = 10000, maxRandomNumberValue = 10000000)`

It creates a random (hex) number string, possibly preceded with a prefix

Returns `String`

--
`repeatString (string2Repeat, n2Repeat)`

It returns a `String` where [`string2Repeat`] is repeated [`n2Repeat`] times


--
`checkPostcode (postcodeStringCandidate)`

It checks a dutch postal code to be valid

Returns `Boolean`

--
`truncateString (string2Truncate, truncateAtPosition, truncateOnWholeWordsOnly)`

It truncates [`string2Truncate`] @ position [`truncateAtPosition`] 

if [`truncateOnWholeWordsOnly`] is true, `string2Truncate` will be truncated right after the last word in the truncated string

Returns `String`



--
`numberBetween (number, min, max)`

It determines if [`number`] falls between [`min`] and [`max`]

Returns `Boolean`



--
`padLeft (number, base = 10, char = "0")`

It left-pads a [`number`] with [`base`] - [`number`].length [`char`] 

Example: 

```javascript
padLeft(15, 1000, "-"); //-> "0015"
```

Returns `String`



--
`interpolate (string2Interpolate, tokens)`

It is a string templating method, using {[someproperty]} in string and a token object to replace [someproperty]

Example: 

```javascript
interpolate("Hello {world}", {world: "folks"}); //-> "Hello folks"
interpolate("Hello {world} # ", [{world: "folks"}, {world: "Pete"}]); //-> "Hello folks # Hello Pete"
```

You can use it to extend String.prototype:

```javascript
String.prototype.interpolate = function (tokens) { return interpolate(this, tokens); };
```

Example usage: 

```javascript
"Hello {world} # ".interpolate([{world: "folks"}, {world: "Pete"}]); //-> "Hello folks # Hello Pete"
```

Returns `String`

--
`tryParseDate (dateStringCandidateValue, format = "dmy")`

It tries to parse string [`dateStringCandidateValue`] into a Date instance using [`format`] 

[`format`] "dmy" = [d]ate, [m]onth, [y]ear

Example: 

```javascript
tryParseDate("07/02/2015", "mdy"); //-> (Date)2015-07-01
```

Returns a `Date` instance or 'null' if parsing fails