# PureHelpers
Importable mostly 'pure' ES helper methods.

## Usage
Use `npm install purehelpers`.
Or download files to your computer. After downloading 
within the download directory, open a cmd window and start `npm install`.


Now the file `PureHelpers.js` is the main file to use. For example:

```javascript
const helpers = require("[path.to]PureHelpers").import("randomString, numberBetween".split(","), {});
helpers.randomString();
Number.prototype.between = function (min, max) { return helpers.numberBetween(this, min, max); }
// etc.
```

Note: a non existing method will translate to a method returning an error string.


## Build.js builder file usage


Build.js contains:

 - Tests for all methods
 - A method to export only the methods to PureHelpers.js (the entry point of this library)
 - A method to create a README.md from the description property in each method object

Use `node build test` to test, `node build createjs` to (re)build PureHelpers.js 
,`node build readme` to (re)create README.md and `node build all` to do it all.


**Note**: in case of building the js-file the tests are run first. 
If one or more of the tests fail, PureHelpers.js will *not* be created.


# Available methods
## randomString

**Parameters** `prefix = "", minRandomNumberValue = 10000, maxRandomNumberValue = 10000000`

**It** creates a random (hex) number string, possibly preceded with a prefix


Returns `String`


## getUniqueRandomValues

**Parameters** `nValues, maxRandomValue`

**It** retrieves an `Array` of [`nValues`] unique (pseudo) random number values from 1 to [`maxRandomValue`]


Returns `Array`


## mapCollection

**Parameters** `collection = [], callback = el => el, shouldMutate = false`

**It** loops  `Array` or `ArrayLike` collection and applies `callback` to each element.


Looping by default does not change the collection (`[shouldMutate = false]`)  

`[collection]`: the collection, array or arraylike (e.g. `document.querySelectorAll('#somediv'))`

`[callback]`: the method to apply to each element of the collection

`[shouldMutate]`: mutate the original collection or deliver a new collection

Returns `Array` (`shouldMutate` = false) or nothing (`shouldMutate` = true)


## regExForDiacriticals

**Parameters** `modifiers`

**It** returns a regular expression for all diacritical characters.


`[modifiers]`: use know RegEx modifiers if applicable (e.g. `"im"` or `"gi"`)

Returns this `Regex`: 

`/[\.\-a-z\s]|[\300-\306\340-\346]|[\310-\313\350-\353]|[\314-\317\354-\357]|[\322-\330\362-\370]|[\331-\334\371-\374]|[\321-\361]|[\307-\347]/`[modifiers]


## repeatString

**Parameters** `string2Repeat, n2Repeat`

**It** returns a `String` where [`string2Repeat`] is repeated [`n2Repeat`] times.


Note: ES>6 contains a native `String.prototype.repeat`


## checkPostalCode

**Parameters** `postcodeStringCandidate, postalCodeFormat = "nnnnaa"`

**It** checks a postal (aka zip-) code [`postcodeStringCandidate`] to be valid vis a vis [`postalCodeFormat`]


Postal code should consist of numbers and/or alphanumeric characters (like `"123 ZX"`)

[`postcodeStringCandidate`] can contain spaces or hyphens.

[`postalCodeFormat`] is a string where `n` signifies a number, and `a` an alphanumeric character.

Default is `"nnnnaa"`  (dutch postal code format).

Examples

```javascript
checkPostalCode('9822 AA');             //=> true
checkPostalCode('982234 N');            //=> false
checkPostalCode('982234-N', 'nnnnnna'); //=> true
checkPostalCode('98 Z-12B', 'nnanna');  //=> true
```

Returns `Boolean`


## checkEmailValidity

**Parameters** `emailValueCandidate`

**It** checks *syntactic* validity of email address [`emailValueCandidate`].


**Note**: this will not absolutely guarantee the address validity. It's a sloppy first check. 

The only 100% guaranteed verification of an e-mail address is to send a mail to it.

[See also](https://hackernoon.com/the-100-correct-way-to-validate-email-addresses-7c4818f24643#.1e40365kv)

Examples

```javascript
checkEmailValidity('I.Am.Email@somewhere.com'); //=> true
checkEmailValidity('I-Am-Ëmáil@isok.eu');       //=> true
checkEmailValidity('IAmNotEmail@@notok.nl');    //=> false

```

Returns `Boolean`


## cleanupWhitespace

**Parameters** `string2Cleanup, keepCRLF = false`

**It** removes extra whitespace from [`string2Cleanup`] or extra whitespace except CR/LF (`\n`) with [`keepCRLF === true`]


**NOTE** also cleans whitespace within html-tags

Examples

```javascript
cleanupWhitespace(`  
      free me of all      that
      whitespace here     
                `); //=> "free me of all that whitespace here"
```

```javascript
cleanupWhitespace(`  
      free me of all      that
      whitespace here`, true); //=> "free me of all that\n whitespace here"
```

Returns `String`




## charAtIsUpperCase

**Parameters** `inputString, atpos`

**It** determines if the character at [`atPos`] within [`inputString`] is upper case


returns `Boolean`




## charAtIsLowerCase

**Parameters** `inputString, atpos`

**It** determines if the character at [`atPos`] (zero based) within [`inputString`] is lower case


returns `Boolean`




## truncateString

**Parameters** `string2Truncate, truncateAtPosition, truncateOnWholeWordsOnly`

**It** truncates [`string2Truncate`] @ position [`truncateAtPosition`] 


if [`truncateOnWholeWordsOnly`] is true, `string2Truncate` will be truncated right after the last word in the truncated string

Examples

```javascript
truncateString("this is too long", 10);       //=> this is to...
truncateString("this is too long", 10, true); //=> this is...
```

Returns `String`


## splitAndClean

**Parameters** `string2Split, splitter`

**It** splits [`string2Split`] using [`splitter`] and removes empty values from the resulting `Array`


`splitter` can be a string value or a regular expression 

Example

```javascript
"some\n\n\nstring".split(/\n/);          //=> ["some", "", "", "string"]
splitAndClean("some\n\n\nstring", /\n/); //=> ["some", "string"]
```

Returns `Array`


## isPrime

**Parameters** `number`

**It** determines (fast) if [`number`] is a prime number


See it [in action](http://jsfiddle.net/KooiInc/g5rg3rxn/embedded/result,js,html,css/)

Returns `Boolean`


## hash2Object

**Parameters** `hashInput`

**It** deserializes a (url) hash string [`hashInput`] to a key-value pair collection


```javascript

hash2Object("Country=Netherlands&Lang=NL&min=10&max=89"); 
    //=> {Country: "Netherlands", Lang: "NL", min: 10, max: 89}

```

Returns `Object`




## uniqueValuesFromArray

**Parameters** `inputArray`

**It** retrieves unique values from [`inputArray`]


```javascript

uniqueValuesFromArray([1, 2, 2, 3, "la", 2, 3, 23, 5, 6, 5, "la"]); //=> [ 1, 2, 3, 'la', 23, 5, 6 ]
uniqueValuesFromArray([1, 2, 1, 2, 1, 2]);                          //=> [ 1, 2 ]
``` 

returns `Array`




## numberBetween

**Parameters** `number, min, max`

**It** determines if [`number`] falls between [`min`] and [`max`]


Example

```javascript
let num = 15;
numberBetween(num, 12, 16); //=> true
numberBetween(num, 16, 20); //=> false
```

Returns `Boolean`


## padLeft

**Parameters** `number, base = 10, char = "0"`

**It** left-pads a [`number`] with [`base`] - [`number`].length [`char`] 


Examples: 

```javascript
padLeft(15, 1000, "-"); //-> "--15"
padLeft(15, 1000);      //-> "0015"
```

Returns `String`




## interpolate

**Parameters** `string2Interpolate, tokens`

**It** is a string templating method, using {[someproperty]} in string and a(n array of) token object(s) to replace [someproperty]


Example: 

```javascript
interpolate("Hello {world}", {world: "folks"}); //-> "Hello folks"
interpolate("# Hello {world} ", [{world: "folks"}, {world: "Pete"}]); //-> "# Hello folks # Hello Pete "
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


## tryParseDate

**Parameters** `dateStringCandidateValue, format = "dmy"`

**It** tries to parse string [`dateStringCandidateValue`] into a Date instance using [`format`] 


[`format`] "dmy" = [d]ate, [m]onth, [y]ear

Example: 

```javascript
tryParseDate("07/02/2015", "mdy"); //-> (Date)2015-07-01
```

Returns a `Date` instance or `null` if parsing fails
