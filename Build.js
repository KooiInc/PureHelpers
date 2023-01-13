"use strict";
const args = process.argv.slice(2);
if (args.length > 0) {
    let buildArgs = null;
    switch (args[0].toLowerCase()) {
        case "test":
            buildArgs = {test: 1}; break;
        case "createjs":
            buildArgs = {test: 1, createjs: 1}; break;
        case "readme":
            buildArgs = {readme: 1}; break;
        case "all":
            buildArgs = {readme: 1, test: 1, createjs: 1}; break;
    }

    if (!buildArgs) {
        console.log("no valid arguments");
    } else {
        BuildAll(buildArgs);
    }
    process.exit(0);
}

// region methods
function getMethods() {
    return {
        randomString: {
            description: `
                creates a random (hex) number string, possibly preceded with a prefix
                Returns \`String\``,
            method: (prefix = "", minRandomNumberValue = 10000, maxRandomNumberValue = 10000000) =>
                prefix +
                    (Math.floor(Math.random() * (maxRandomNumberValue - minRandomNumberValue || 1)) +
                    minRandomNumberValue || 1)
                    .toString(16),
            tests() {
                Tester.Test(
                    `randomString("HELLO")`,
                    () => this.method("HELLO"), val => val.startsWith("HELLO"),
                    "Should start with HELLO");
            }
        },
        getUniqueRandomValues: {
            method:(nValues, maxRandomValue) => {
                let existing = {};
                maxRandomValue -= 1;
                const randomUnique = () => {
                    const rndm = Math.floor(1 + Math.random() * maxRandomValue);
                    const exists = existing[rndm];
                    if ( !exists ) { existing[rndm] = 1; }
                    return exists ? randomUnique() : rndm;
                };
                return Array(nValues).join(",").split(",")
                .map( () => randomUnique() ) ;
            },
            tests() {
                Tester.Test(
                    `getUniqueRandomValues(10, 1000)`,
                    () => this.method(10, 1000),
                    val => val && val.filter( function(a) {return !this[a] ? this[a] = true : false;}, {} ).length === 10);
                Tester.Test(
                    `getUniqueRandomValues(5, 100000)`,
                    () => this.method(5, 100000),
                    val => val && val.filter( function(a) {return !this[a] ? this[a] = true : false;}, {} ).length === 5);
                Tester.Test(
                        `getUniqueRandomValues(3, 25)`,
                        () => this.method(3, 25),
                        val => val && val.filter( function(a) {return !this[a] ? this[a] = true : false;}, {} ).length === 3);
            },
            description: `
                     retrieves an \`Array\` of [\`nValues\`] unique (pseudo) random number values from 1 to [\`maxRandomValue\`]
                     Returns \`Array\``,
        },
        mapCollection: {
            method: (collection = [], callback = el => el, shouldMutate = false) => {
                const mapNew = f => x => Array.prototype.map.call(x, f);
                const mapChange = f => c => Array.prototype.forEach.call(c, (el, i) => c[i] = f(c[i]));
                return shouldMutate ? mapChange(callback)(collection) : mapNew(callback)(collection);
            },
            description: `loops  \`Array\` or \`ArrayLike\` collection and applies \`callback\` to each element.
                          Looping by default does not change the collection (\`[shouldMutate = false]\`)  
                          \`[collection]\`: the collection, array or arraylike (e.g. \`document.querySelectorAll('#somediv'))\`
                          \`[callback]\`: the method to apply to each element of the collection
                          \`[shouldMutate]\`: mutate the original collection or deliver a new collection
                          Returns \`Array\` (\`shouldMutate\` = false) or nothing (\`shouldMutate\` = true)`,
            tests() {
                let initialValue = [1, 2, 3, 4, 5];
                Tester.Test(
                    `mapCollection(/*initialValue*/[1, 2, 3, 4, 5], el => el += 1)`,
                    () => this.method(initialValue, el => el += 1),
                    val => val.join() === '2,3,4,5,6' && val.join() !== initialValue.join(),
                    `Note: observed value is the result, not initialValue (${initialValue})`);
                Tester.Test(
                    `mapCollection(/*initialValue*/[1, 2, 3, 4, 5], el => el += 1, true)`,
                    () => this.method(initialValue, el => el += 1, true),
                    () => initialValue.join() !== '1,2,3,4,5' && initialValue.join() === '2,3,4,5,6',
                    `Note: observed = initialValue (${initialValue} observed value itself should be undefined))`
                );
            }
        },
        regExForDiacriticals: {
            description: `returns a regular expression for all diacritical characters.
                          \`[modifiers]\`: use know RegEx modifiers if applicable (e.g. \`"im"\` or \`"gi"\`)
                          Returns this \`Regex\`: 
                          \`/[\\.\\-a-z\\s]|[\\300-\\306\\340-\\346]|[\\310-\\313\\350-\\353]|[\\314-\\317\\354-\\357]|[\\322-\\330\\362-\\370]|[\\331-\\334\\371-\\374]|[\\321-\\361]|[\\307-\\347]/\`[modifiers]`,
            method: modifiers =>  new RegExp(
                ['[\\.\\-a-z\\s]|',            // [a-z, . - and space]
                 '[\\300-\\306\\340-\\346]|',  // all accented A, a
                 '[\\310-\\313\\350-\\353]|',  // all accented E, e
                 '[\\314-\\317\\354-\\357]|',  // all accented I, i
                 '[\\322-\\330\\362-\\370]|',  // all accented O, o
                 '[\\331-\\334\\371-\\374]|',  // all accented U, u
                 '[\\321-\\361]|',             // all accented N, n
                 '[\\307-\\347]'               // all accented C, c
                ].join(''), modifiers),
            tests() {
                Tester.Test(`regExForDiacriticals("i").test("Namibië")`, () => this.method("i").test("Namibië"), true, "should be true" );
                Tester.Test(`regExForDiacriticals("i").test("Netherlands")`, () => this.method("i").test("Netherlands"), true, "should be true" );
                Tester.Test(`!regExForDiacriticals("i").test("I^Am~Ëmáil@isok.eu")`, () => !this.method("i").test("I^Am~Ëmáil@isok.eu"), false, "should be false" );
            }
        },
        repeatString: {
            description: `
                returns a \`String\` where [\`string2Repeat\`] is repeated [\`n2Repeat\`] times.
                Note: ES>6 contains a native \`String.prototype.repeat\``,
            method: (string2Repeat, n2Repeat) => Array(n2Repeat).join(string2Repeat) + string2Repeat,
            tests() {
                Tester.Test(`repeatString("-", 5)`, () => this.method("-", 5), "-----" );
                Tester.Test(`repeatString("0", 3)`, () => this.method("0", 3), "000");
                Tester.Test(`repeatString("anyway", 2)`, () => this.method("anyway", 2), "anywayanyway");
            }
        },
        checkPostalCode: {
            method: (postcodeStringCandidate, postalCodeFormat = "nnnnaa") =>
                new RegExp(`^(${postalCodeFormat
                    .toLowerCase()
                    .split("")
                    .map(el => el === "n" ? "\\d" : "[a-z]").join("")})$`,
                    "i").test(postcodeStringCandidate.replace(/\s+|\-+/g, '')
            ),
            description: `
                checks a postal (aka zip-) code [\`postcodeStringCandidate\`] to be valid vis a vis [\`postalCodeFormat\`]
                Postal code should consist of numbers and/or alphanumeric characters (like \`"123 ZX"\`)
                [\`postcodeStringCandidate\`] can contain spaces or hyphens.
                [\`postalCodeFormat\`] is a string where \`n\` signifies a number, and \`a\` an alphanumeric character.
                Default is \`"nnnnaa"\`  (dutch postal code format).
                Examples
                <ex>checkPostalCode('9822 AA');             //=> true
                checkPostalCode('982234 N');            //=> false
                checkPostalCode('982234-N', 'nnnnnna'); //=> true
                checkPostalCode('98 Z-12B', 'nnanna');  //=> true</ex>
                Returns \`Boolean\``,
            tests() {
                Tester.Test("checkPostalCode('9822 AA')", () => this.method("9822 AA"), true, "should be ok" );
                Tester.Test("checkPostalCode('982234 N')", () => this.method("982234 N"), false, "should be false");
                Tester.Test("checkPostalCode('982234-N', 'nnnnnna')", () => this.method("982234-N", "nnnnnna"), true, "should be true");
                Tester.Test("checkPostalCode('982234-N', 'nannnna')", () => this.method("982234-N", "nannnna"), false, "should be false");
                Tester.Test("checkPostalCode('98 Z-12B', 'nnanna')", () => this.method("98 Z-12B", "nnanna"), true, "should be true");
            }
        },
        checkEmailValidity: {
            method: emailValueCandidate =>
                 new RegExp(['^((([a-z]|\\d|[!#\\$%&\'\\*\\+\\-\\/=\\?\\^_`{\\|}~]|[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF])',
                    '+(\\.([a-z]|\\d|[!#\\$%&\'\\*\\+\\-\\/=\\?\\^_`{\\|}~]|[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF])+)*)',
                    '|((\\x22)((((\\x20|\\x09)*(\\x0d\\x0a))?(\\x20|\\x09)+)?(([\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x7f]|\\x21|',
                    '[\\x23-\\x5b]|[\\x5d-\\x7e]|[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF])|',
                    '(\\\\([\\x01-\\x09\\x0b\\x0c\\x0d-\\x7f]|[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF]))))*',
                    '(((\\x20|\\x09)*(\\x0d\\x0a))?(\\x20|\\x09)+)?(\\x22)))@((([a-z]|\\d|',
                    '[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF])|(([a-z]|\\d|[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF])',
                    '([a-z]|\\d|-|\\.|_|~|[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF])*([a-z]|\\d|',
                    '[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF])))\\.)+(([a-z]|[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF])|',
                    '(([a-z]|[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF])([a-z]|\\d|-|\\.|_|~|',
                    '[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF])*([a-z]|[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF])))\\.?$']
                .join(''), 'i').test(emailValueCandidate.trim()),
            tests() {
                Tester.Test("checkEmailValidity('I.Am.Email@somewhere.com')", () => this.method("I.Am.Email@somewhere.com"), true, "should be ok" );
                Tester.Test("checkEmailValidity('I.Am.NotEmail@somewhere')", () => this.method("I.Am.NotEmail@somewhere"), false, "should not be ok" );
                Tester.Test("checkEmailValidity('IAmNotEmail')", () => this.method("IAmNotEmail"), false, "should not be ok" );
                Tester.Test("checkEmailValidity('IAmNotEmail@@notok.nl')", () => this.method("IAmNotEmail@@notok.nl"), false, "should not be ok" );
                Tester.Test("checkEmailValidity('I-Am-Ëmáil@isok.eu')", () => this.method("IAmNotEmail@@notok.nl"), false, "should be ok" );
                Tester.Test("checkEmailValidity('I^Am~Ëmáil@isok.eu')", () => this.method("IAmNotEmail@@notok.nl"), false, "should be ok" );
            },
            description: `
                checks *syntactic* validity of email address [\`emailValueCandidate\`].
                **Note**: this will not absolutely guarantee the address validity. It's a sloppy first check. 
                The only 100% guaranteed verification of an e-mail address is to send a mail to it.
                [See also](https://hackernoon.com/the-100-correct-way-to-validate-email-addresses-7c4818f24643#.1e40365kv)
                Examples
                <ex>checkEmailValidity('I.Am.Email@somewhere.com'); //=> true
                checkEmailValidity('I-Am-Ëmáil@isok.eu');       //=> true
                checkEmailValidity('IAmNotEmail@@notok.nl');    //=> false
                </ex>
                Returns \`Boolean\``,
        },
        cleanupWhitespace: {
            method: (string2Cleanup, keepCRLF = false) => {
                const cleanup = str => str
                    .replace(/\r|\n|\r\n/g, keepCRLF ? "##" : "")
                    .replace(/\s{2,}/g, ' ')
                    .replace(/(>\s+<)/g, '><')
                    .replace(/\s+>/g, '>')
                    .replace(/##/gm, "\n");
                return keepCRLF
                    ? string2Cleanup.split(/\r|\n|\r\n/g).map(s => cleanup(s)).join('\n').trim()
                    : cleanup(string2Cleanup).trim();
            },
            description: `
                removes extra whitespace from [\`string2Cleanup\`] or extra whitespace except CR/LF (\`\\n\`) with [\`keepCRLF === true\`]
                **NOTE** also cleans whitespace within html-tags
                Examples
                <ex>cleanupWhitespace(\`  
                |x5| free me of all      that
                |x5| whitespace here     
                |x12|    \`); //=> "free me of all that whitespace here"</ex>
                 <ex>cleanupWhitespace(\`  
                |x5| free me of all      that
                |x5| whitespace here\`, true); //=> "free me of all that\\n whitespace here"</ex>
                Returns \`String\`
            `,
            tests() {
                Tester.Test(`cleanupWhitespace("   9822     \\nAA   \\t ")`, () => this.method("   9822     \nAA   \t "),  "9822 AA");
                Tester.Test(`cleanupWhitespace("   9822     \\nAA", true)`, () => this.method("   9822     \nAA", true),  "9822 \nAA");
            }
        },
        charAtIsUpperCase: {
            method: (inputString, atpos) => {
                const chr = inputString.charAt(atpos);
                return /[A-Z]|[\u0080-\u024F]/.test(chr) && chr === chr.toUpperCase();
            },
            description: `
                determines if the character at [\`atPos\`] within [\`inputString\`] is upper case
                returns \`Boolean\`
            `,
            tests() {
                Tester.Test(`charAtIsUpperCase("someChar", 4)`, () => this.method("someChar", 4),  true);
                Tester.Test(`charAtIsUpperCase("someChar", 2)`, () => this.method("someChar", 2), false);
            }
        },
        charAtIsLowerCase: {
            method: (inputString, atpos) =>{
                const chr = inputString.charAt(atpos);
                return /[A-Z]|[\u0080-\u024F]/i.test(chr) && chr === chr.toLowerCase();
            },
            description: `
                determines if the character at [\`atPos\`] (zero based) within [\`inputString\`] is lower case
                returns \`Boolean\`
            `,
            tests() {
                Tester.Test("charAtIsLowerCase (\"someChar\", 4)", () => this.method("someChar", "someChar".indexOf("C")),  false);
                Tester.Test("charAtIsLowerCase (\"someChar\", 2)", () => this.method("someChar", 2), true);
            }
        },
        truncateString: {
            method: (string2Truncate, truncateAtPosition, truncateOnWholeWordsOnly) => {
                if (truncateAtPosition >= string2Truncate.length) {
                    return string2Truncate;
                }
                const truncatedRaw = string2Truncate.slice(0, truncateAtPosition);
                return (truncateOnWholeWordsOnly && /[a-z]/gi.test(string2Truncate.substr(truncateAtPosition, 1)) ?
                        truncatedRaw.slice(0, truncatedRaw.lastIndexOf(' ')) :
                        truncatedRaw) + '\u2026';
            },
            description: `
                truncates [\`string2Truncate\`] @ position [\`truncateAtPosition\`] 
                if [\`truncateOnWholeWordsOnly\`] is true, \`string2Truncate\` will be truncated right after the last word in the truncated string
                Examples
                <ex>truncateString("this is too long", 10);       //=> this is to...
                truncateString("this is too long", 10, true); //=> this is...</ex>
                Returns \`String\``,
                tests() {
                    Tester.Test(`truncateString("this is too long", 10)`, () => this.method("this is too long", 10),  "this is to\u2026");
                    Tester.Test(`truncateString("this is too long", 10, true)`, () => this.method("this is too long", 10, true), "this is\u2026");
                }
        },
        splitAndClean: {
            method: (string2Split, splitter) => string2Split.split(splitter).filter( e => e && String(e).trim().length),
            tests() {
                Tester.Test(
                    `splitAndClean("some\\n\\n\\nstring", /\\n/)`,
                    () => this.method("some\n\n\nstring", /\n/),
                    val => val.join(",") === "some,string");
                Tester.Test(
                    `splitAndClean("some string   some", "")`,
                    () => this.method("some string   some", "").join(""),
                    "somestringsome");
            },
            description: `
                splits [\`string2Split\`] using [\`splitter\`] and removes empty values from the resulting \`Array\`
                 \`splitter\` can be a string value or a regular expression 
                Example
                <ex>"some\\n\\n\\nstring".split(/\\n/);          //=> ["some", "", "", "string"]
                splitAndClean("some\\n\\n\\nstring", /\\n/); //=> ["some", "string"]</ex>
                Returns \`Array\``
        },
        isPrime: {
            method: number => {
                let start = 2;
                while (start <= Math.sqrt(number)) {
                    if (number % start++ < 1) { return false; }
                }
                return number > 1;
            },
            description: `
                determines (fast) if [\`number\`] is a prime number
                See it [in action](http://jsfiddle.net/KooiInc/g5rg3rxn/embedded/result,js,html,css/)
                Returns \`Boolean\``,
            tests() {
                Tester.Test(`isPrime(3)`, () => this.method(3), true);
                Tester.Test(`isPrime(222)`, () => this.method(222), false);
            }
        },
        hash2Object: {
            method: hashInput =>
                      hashInput
                        .split("&")
                        .map(el => el.split("="))
                        .reduce((pre, cur) => {
                            pre[cur[0]] = cur[1];
                            return pre;
                        }, {}),
            description: `
                deserializes a (url) hash string [\`hashInput\`] to a key-value pair collection
                <ex>
                    hash2Object("Country=Netherlands&Lang=NL&min=10&max=89"); 
                    |x4|//=> {Country: "Netherlands", Lang: "NL", min: 10, max: 89}
                </ex>
                Returns \`Object\`
            `,
            tests() {
                Tester.Test(
                    `+hash2Object("Lang=NL&min=10&max=89").max`,
                    () => +this.method("Lang=NL&min=10&max=89").max,
                    89);
                Tester.Test(
                    `+hash2Object("Lang=NL&min=10&max=89").min`,
                    () => +this.method("Lang=NL&min=10&max=89").min,
                    10);
                Tester.Test(
                    `hash2Object("Lang=NL&min=10&max=89").Lang`,
                    () => this.method("Lang=NL&min=10&max=89").Lang,
                    "NL");
            }
        },
        uniqueValuesFromArray: {
            method: inputArray => inputArray.filter( function(a) {return !this[a] ? this[a] = true : false;}, {} ),
            description: `
                retrieves unique values from [\`inputArray\`]
                <ex>
                uniqueValuesFromArray([1, 2, 2, 3, "la", 2, 3, 23, 5, 6, 5, "la"]); //=> [ 1, 2, 3, 'la', 23, 5, 6 ]
                uniqueValuesFromArray([1, 2, 1, 2, 1, 2]);                          //=> [ 1, 2 ]</ex> 
                returns \`Array\`
            `,
            tests() {
                Tester.Test(
                    `uniqueValuesFromArray([1, 1, 2, 2, 3])`,
                    () => this.method([1, 1, 2, 2, 3]),
                    val => val.join(",") === "1,2,3");
                Tester.Test(
                    `uniqueValuesFromArray([1, 1, 'hi', 2, 2, 3, 'hi'])`,
                    () => this.method([1, 1, 'hi', 2, 2, 3, 'hi']),
                    val => val.join(",") === "1,hi,2,3");
            }
        },
        numberBetween: {
            method: (number, min, max) => number > min && number < max,
            description: `
                determines if [\`number\`] falls between [\`min\`] and [\`max\`]
                Example
                <ex>let num = 15;
                numberBetween(num, 12, 16); //=> true
                numberBetween(num, 16, 20); //=> false</ex>
                Returns \`Boolean\``,
            tests() {
                Tester.Test(
                    `numberBetween(10212, 10, 100)`,
                    () => this.method(10212, 10, 100),
                    false);
                Tester.Test(
                    `numberBetween(10212, 10, 20000)`,
                    () => this.method(10212, 10, 20000),
                    true);
            }
        },
        padLeft: {
            method: (number, base = 10, char = "0") => {
                const len = (String(base).length - String(number).length) + 1;
                return len > 0 ? new Array(len).join(char) + number : number;
            },
            description: `
                left-pads a [\`number\`] with [\`base\`] - [\`number\`].length [\`char\`] 
                Examples: 
                <ex>padLeft(15, 1000, "-"); //-> "--15"
                padLeft(15, 1000);      //-> "0015"</ex>
                Returns \`String\`
            `,
            tests() {
                Tester.Test(`padLeft(3, 100)`, () => this.method(3, 100), "003");
                Tester.Test(`padLeft(3, 100, "-")`, () => this.method(3, 100, "-"), "--3");
                Tester.Test(`padLeft(3)`, () => this.method(3), "03");
                Tester.Test(`padLeft(23000, 10000000)`, () => this.method(23000, 10000000), "00023000");
                Tester.Test(`padLeft(50)`, () => this.method(50), "50");
            }
        },
        interpolate: {
            method: (string2Interpolate, tokens) => {
                if (!(tokens instanceof Array) && tokens instanceof Object) {
                    tokens = [tokens];
                } else if (!(tokens instanceof Object)) {
                    return string2Interpolate;
                }
                let replacer = token => (t, t1, t2) => token[t2] === '' ? String.fromCharCode(0) : token[t2] || t;
                let str = string2Interpolate;
                return tokens.map(function (token) {
                    return str.replace(/(\{?)([a-z_0-9]+)(\})/gi, replacer(token));
                })
                .join('')
                .replace(RegExp(String.fromCharCode(0), "g"), '');
            },
            description: `
                 is a string templating method, using {[someproperty]} in string and a(n array of) token object(s) to replace [someproperty]
                 Example: 
                 <ex>interpolate("Hello {world}", {world: "folks"}); //-> "Hello folks"
                 interpolate("# Hello {world} ", [{world: "folks"}, {world: "Pete"}]); //-> "# Hello folks # Hello Pete "</ex>
                 You can use it to extend String.prototype:
                 <ex>String.prototype.interpolate = function (tokens) { return interpolate(this, tokens); };</ex>
                 Example usage: 
                 <ex>"Hello {world} # ".interpolate([{world: "folks"}, {world: "Pete"}]); //-> "Hello folks # Hello Pete"</ex>
                 Returns \`String\``,
            tests() {
                Tester.Test(
                    `interpolate("Hello {world}", {world: "folks"})`,
                    () => this.method("Hello {world}", {world: "folks"}),
                    "Hello folks");
                Tester.Test(
                    `interpolate("<td>{val}</td>", [{val: 1}, {val: 2}])`,
                    () => this.method("<td>{val}</td>", [{val: 1}, {val: 2}]),
                    "<td>1</td><td>2</td>");
                Tester.Test(
                    `interpolate("<td>{val}</td>", [{val: 1}, {val: ""}, {val: "empty values too"}])`,
                    () => this.method("<td>{val}</td>", [{val: 1}, {val: ""}, {val: "empty values too"}]),
                    "<td>1</td><td></td><td>empty values too</td>");
            }
        },
        tryParseDate: {
            method: (dateStringCandidateValue, format = "dmy") => {
                if (!dateStringCandidateValue) { return null; }
                let mapFormat = format.split("").reduce(function (a, b, i) { a[b] = i; return a;}, {});
                const dateStr2Array = dateStringCandidateValue.split(/[ :\-\/]/g);
                const datePart = dateStr2Array.slice(0, 3);
                let datePartFormatted = [
                        +datePart[mapFormat.y],
                        +datePart[mapFormat.m]-1,
                        +datePart[mapFormat.d] ];
                if (dateStr2Array.length > 3) {
                    dateStr2Array.slice(3).forEach(t => datePartFormatted.push(+t));
                }
                const dateTrial = new Date(Date.UTC.apply(null, datePartFormatted));
                return dateTrial && dateTrial.getFullYear() === datePartFormatted[0] &&
                       dateTrial.getMonth() === datePartFormatted[1] &&
                       dateTrial.getDate() === datePartFormatted[2]
                        ? dateTrial :
                        null;
            },
            description: `
                tries to parse string [\`dateStringCandidateValue\`] into a Date instance using [\`format\`] 
                [\`format\`] "dmy" = [d]ate, [m]onth, [y]ear
                Example: 
                <ex>tryParseDate("07/02/2015", "mdy"); //-> (Date)2015-07-01</ex>
                Returns a \`Date\` instance or \`null\` if parsing fails`,
            tests() {
                Tester.Test(
                    `tryParseDate("15/04/2001"), "dmy")`,
                    () => this.method("15/04/2001", "dmy"),
                    val => val instanceof Date &&
                        val.getFullYear() == 2001 &&
                        val.getDate() == 15 &&
                        val.getMonth()+1 == 4);
                Tester.Test(
                   `tryParseDate("04/03/1945 01:43"), "mdy")`,
                   () => this.method("04/03/1945 01:43", "mdy"),
                   val => val instanceof Date &&
                       val.getFullYear() == 1945 &&
                       val.getDate() == 3 &&
                       val.getMonth()+1 == 4);
                Tester.Test(
                    `tryParseDate("04/03/1945"), "ymd")`,
                    () => this.method("04/03/1945", "ymd"),
                    null);
            }
        },
        // region importMethods
        doImport (fns, into) {
            fns.forEach(fn => {
                fn = fn.trim();
                if (this[fn]) {
                    into[fn] = this[fn];
                } else {
                    into[fn] = () => `[${fn.trim()}] is not a known method in this namespace, sorry`;
                }
            });
            return into;
        },
        import(methods2Import, intoNamespace = {}) {
            methods2Import = methods2Import instanceof Object && !methods2Import.length
                ? Object.keys(methods2Import)
                : methods2Import;
            return this.doImport(methods2Import, intoNamespace);
        }
        // endregion importMethods
    };
}
// endregion methods

// region exporteer methods naar PureHelpers.js
function exportToHelpers() {
    const helperMethods = getMethods();
    const cleanup = helperMethods.cleanupWhitespace.method;
    let helperFileString = "const methods = {";

    for (let helper in helperMethods) {
        if (helperMethods[helper].method) {
            helperFileString += `${helper}: ${helperMethods[helper].method.toString()},`;
        } else {
            helperFileString += `${helperMethods[helper].toString()},`;
        }
    }
    const fs = require("fs");
    const beautify = require("js-beautify").js_beautify;
    const currFile = beautify(`${helperFileString}};module.exports = { import: methods.import.bind(methods) };`);
    fs.writeFileSync("./PureHelpers.js", currFile, "utf-8");
    console.log("New version written to ./PureHelpers.js");
}
// endregion exporteer methods naar PureHelpers.js

// region API2Readme
function CreateREADME() {
    const methods = getMethods();
    const repeater = methods.repeatString.method;
    const api2Readme = function () {
        const fs = require("fs");
        const rmLines = getHeaderLines() +
            this.methodInfo.map(m =>
                `## ${m.name}
                                 
                 **Parameters** \`${ m.info.methodLine.trim() }\`
                 
                 **It** ${ m.info.it }
                 
                 ${ (m.info.moreInfo.length && '\n' + m.info.moreInfo || "") }
                `).join('\n\n')
                .replace(/^ +/gm, '')
                .replace( /\|x\d+\|/gi, t => repeater(" ", +t.match(/\d+/)[0]));
        fs.writeFileSync("./README.md", rmLines, "utf-8");
        console.log("README.md written ...");
    };

    const methodInfos = Object.keys(methods)
        .filter( key => !methods[key].notImportable && methods[key].method )
        .map( key => { return { name: key, info: cleanup(methods[key].description, methods[key].method) } } );

    return {
        methodInfo: methodInfos,
        stringify2Readme: api2Readme
    }
}

function str2JsExample(str) {
    return `\`\`\`javascript\n${str}\n\`\`\``;
}

function getHeaderLines() {
    return ["# PureHelpers",
        "Importable mostly 'pure' ES helper methods.",
        "",
        "## Usage",
        "Use `npm install purehelpers`.",
        "Or download files to your computer. After downloading ",
        "within the download directory, open a cmd window and start `npm install`.",
        "\n\nNow the file `PureHelpers.js` is the main file to use. For example:\n",
        str2JsExample(
            "const helpers = require(\"[path.to]PureHelpers\").import(\"randomString, numberBetween\".split(\",\"), {});\n" +
            "helpers.randomString();\n" +
            "Number.prototype.between = function (min, max) { return helpers.numberBetween(this, min, max); }\n" +
            "// etc."),
        "\nNote: a non existing method will translate to a method returning an error string.\n",
        "\n## Build.js builder file usage\n",
        "\nBuild.js contains:\n",
        " - Tests for all methods",
        " - A method to export only the methods to PureHelpers.js (the entry point of this library)",
        " - A method to create a README.md from the description property in each method object",
        "\nUse `node build test` to test, `node build createjs` to (re)build PureHelpers.js ",
        ",`node build readme` to (re)create README.md and `node build all` to do it all.\n",
        "\n**Note**: in case of building the js-file the tests are run first. ",
        "If one or more of the tests fail, PureHelpers.js will *not* be created.\n",
        "\n# Available methods\n"
    ].join("\n");
}

function cleanup(description, method) {
    let code = method.toString();
    let mLine = code.split(/\n/)[0].replace(/\n|\r|\r\n/g, '');
    //code = code.replace(fat_arrows, '');
    description = description.replace(/^\s+/gm, "" );
    const docString = description.split(/\n/);
    //const mLine = code.split(/\n/)[0].replace(/\n|\r|\r\n/g, '');
    return {
        methodLine: mLine
                        .substr(0, mLine.lastIndexOf('=>'))
                        .replace(/\(|\).+$/g, ''),
        it: docString ? docString[0] : "Not (yet) documented",
        moreInfo: docString
            ? docString.slice(1)
            .join('\n\n')
            .replace(/<ex>([^<]*)<\/ex>/gm,
                (a, b) => `\`\`\`javascript\n${b.replace(/\n+/g, '\n')}\n\`\`\``)
            : ""
    };
}
// endregion API2Readme

// region Build
function BuildAll(what2Build) {
    const tests = what2Build.test ? testAll() : {failed: 0};

    if (tests.failed > 0) {
        console.log(`CAN NOT BUILD, you should fix ${tests.failed} test(s) first`);
        return;
    }
    if (what2Build.createjs) {
        console.log("\nCreating (or recreating) PureHelpers.js ...");
        exportToHelpers();
    }
    if (what2Build.readme) {
        console.log("\nCreating (or recreating) README.md ...");
        CreateREADME().stringify2Readme();
    }
}
// endregion Build

// region Tests
function testAll() {
    global.Tester = TestSimple();
    const meths = getMethods();
    for (let meth in meths) {
        if ("tests" in meths[meth]) {
            meths[meth].tests();
        }
    }
    console.log(`Failed tests: ${Tester.nFailed}, successful tests: ${Tester.nSuccess}`);
    return {failed: Tester.nFailed, success: Tester.nSuccess};
}

function TestSimple() {
    let nFailed = 0;
    let nSuccess = 0;

    const runExpression = (str, testMethod, expectedValue, comment = "") => {
        const val = testMethod();
        const expectedIsMethod = expectedValue instanceof Function;
        const check = expectedValue instanceof Function
            ? expectedValue(val)
            : val === expectedValue;
        nFailed += check ? 0 : 1;
        nSuccess += check ? 1 : 0;
        console.log(`Testing: ${str}${(comment ? ` (${comment})` : "")} ${
            check 
                ? `Success (observed value [${val}])` 
                : 'FAIL (observed [' + val + '], expected: [' + 
                  (expectedIsMethod ? expectedValue(val) : expectedValue) + '])'}`);
    };

    return {
        get nFailed() {return nFailed;},
        get nSuccess() {return nSuccess;},
        Test: runExpression };
}
// endregion Tests