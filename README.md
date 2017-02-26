# PureHelpers
Importable pure ES helper methods

##Usage
```javascript
const helpers = require("./PureHelpers").import("randomString, numberBetween".split(","), {});
helpers.randomString();
Number.prototype.between = function (min, max) { return helpers.numberBetween(this, min, max); }
// etc.
```
If you want to import methods in the *current* namespace directly, use

```javascript
[lib].import({numberBetween: 1, truncateString: 1}, function() { return this; }())
```
Now within your library file you can call

```javascript
numberBetween(15, 5, 20); //-> true
```

Note: a non existing method will translate to a method returning an error string

#Available methods #
**Method** `randomString`

**Parameters** `prefix = "", minRandomNumberValue = 10000, maxRandomNumberValue = 10000000`

**It** creates a random (hex) number string, possibly preceded with a prefix


Returns `String`


--


**Method** `repeatString`

**Parameters** `string2Repeat, n2Repeat`

**It** returns a `String` where [`string2Repeat`] is repeated [`n2Repeat`] times




--


**Method** `checkPostcode`

**Parameters** `postcodeStringCandidate`

**It** checks a dutch postal code to be valid


Returns `Boolean`


--


**Method** `cleanupWhitespace`

**Parameters** `string2Cleanup`

**It** removes *all* extra whitespace from [`string2Cleanup`] 


Example

```javascript
cleanupWhitespace(`  
     free me of all      that
     whitespace here     
               `); //=> "free me of all that whitespace here"
```

Returns `String`




--


**Method** `truncateString`

**Parameters** `string2Truncate, truncateAtPosition, truncateOnWholeWordsOnly`

**It** truncates [`string2Truncate`] @ position [`truncateAtPosition`] 


if [`truncateOnWholeWordsOnly`] is true, `string2Truncate` will be truncated right after the last word in the truncated string

Examples

```javascript
truncateString("this is too long", 10); //=> this is to...
truncateString("this is too long", 10, true); //=> this is...
```

Returns `String`


--


**Method** `splitAndClean`

**Parameters** `string2Split, splitter`

**It** splits [`string2Split`] using [`splitter`] and removes empty values from the resulting `Array`


`splitter` can be a string value or a regular expression 

Example

```javascript


"some\n\n\nstring".split(/\n/]);         //=> ["some", "", "", "string"]
splitAndClean("some\n\n\nstring", /\n/); //=> ["some", "string"]
```

Returns `Array`


--


**Method** `isPrime`

**Parameters** `number`

**It** determines if [`number`] is a prime number


Returns `Boolean`


--


**Method** `numberBetween`

**Parameters** `number, min, max`

**It** determines if [`number`] falls between [`min`] and [`max`]


Example

```javascript
let num = 15;
numberBetween(num, 12, 16); //=> true
numberBetween(num, 16, 20); //=> false
```

Returns `Boolean`


--


**Method** `padLeft`

**Parameters** `number, base = 10, char = "0"`

**It** left-pads a [`number`] with [`base`] - [`number`].length [`char`] 


Examples: 

```javascript
padLeft(15, 1000, "-"); //-> "--15"
padLeft(15, 1000);      //-> "0015"
```

Returns `String`




--


**Method** `interpolate`

**Parameters** `string2Interpolate, tokens`

**It** is a string templating method, using {[someproperty]} in string and a token object to replace [someproperty]


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


**Method** `tryParseDate`

**Parameters** `dateStringCandidateValue, format = "dmy"`

**It** tries to parse string [`dateStringCandidateValue`] into a Date instance using [`format`] 


[`format`] "dmy" = [d]ate, [m]onth, [y]ear

Example: 

```javascript
tryParseDate("07/02/2015", "mdy"); //-> (Date)2015-07-01
```

Returns a `Date` instance or `null` if parsing fails


--
