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
        repeatString: {
            description: `returns a \`String\` where [\`string2Repeat\`] is repeated [\`n2Repeat\`] times`,
            method: (string2Repeat, n2Repeat) => Array(n2Repeat).join(string2Repeat) + string2Repeat,
            tests() {
                Tester.Test(`repeatString("-", 5)`, () => this.method("-", 5), "-----" );
                Tester.Test(`repeatString("0", 3)`, () => this.method("0", 3), "000");
                Tester.Test(`repeatString("anyway", 2)`, () => this.method("anyway", 2), "anywayanyway");
            }
        },
        checkPostcode: {
            method: postcodeStringCandidate => {
                postcodeStringCandidate = postcodeStringCandidate.replace(/\s+/g, '');
                return /^(\d{4,4}[a-z]{2,2})$/i.test(postcodeStringCandidate);
            },
            description: `
                checks a dutch postal code to be valid
                Returns \`Boolean\``,
            tests() {
                Tester.Test("checkPostcode '9822 AA'", () => this.method("9822 AA"), true, "should be ok" );
                Tester.Test("checkPostcode '982234 N'", () => this.method("982234 N", 3), false, "should be false");
            }
        },
        cleanupWhitespace: {
            method: string2Cleanup =>
                string2Cleanup
                    .trim()
                    .replace(/\n|\r|\r\n/g, '')
                    .replace(/\s{2,}\W/g, ' ')
                    .replace(/(>\s+<)/g, '><')
                    .replace(/ {1,}>/g, '>')
                    .replace(/^\s|^\s+|\s$|\s+$/g, ''),
            description: `
                removes *all* extra whitespace from [\`string2Cleanup\`] 
                Example
                <ex>cleanupWhitespace(\`  
                |x5| free me of all      that
                |x5| whitespace here     
                |x12|    \`); //=> "free me of all that whitespace here"</ex>
                Returns \`String\`
            `,
            tests() {
                Tester.Test(`cleanupWhitespace("   9822     \\nAA   \\t ")`, () => this.method("   9822     \nAA   \t "),  "9822 AA");
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
                <ex>truncateString("this is too long", 10); //=> this is to...
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
            method: inputArray => inputArray.filter(
                function(a) {return !this[a] ? this[a] = true : false;}, {}
            ),
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
                 is a string templating method, using {[someproperty]} in string and a token object to replace [someproperty]
                 Example: 
                 <ex>interpolate("Hello {world}", {world: "folks"}); //-> "Hello folks"
                 interpolate("Hello {world} # ", [{world: "folks"}, {world: "Pete"}]); //-> "Hello folks # Hello Pete"</ex>
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
                if (!dateStringCandidateValue) {
                    return null;
                }
                let mapFormat = {};
                format.split("").map((e, i) => (mapFormat[e] = i) && e);
                const dateStr2Array = dateStringCandidateValue.split(/[ :\-\/]/g);
                let datePart = dateStr2Array.slice(0, 3);
                datePart = [datePart[mapFormat.y],
                            datePart[mapFormat.m],
                            datePart[mapFormat.d] ];

                // input string should confer strictly to [format]
                // otherwise result may not me reliable (locale settings)
                if (+datePart[0] < 1000) { return null; }
                else { datePart = datePart.join("/"); }

                const timepart = dateStr2Array.length > 3 && dateStr2Array.slice(3).join(":") || "";
                const tryDate = datePart.length > 3
                    ? new Date([datePart, /:$/.test(timepart) ? timepart : timepart + ":"].join(" "))
                    : new Date(datePart);
                return tryDate ? tryDate : null;
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
                    val => val.getTime() === new Date('2001/04/15').getTime());
                Tester.Test(
                   `tryParseDate("04/03/1945 01:43"), "mdy")`,
                   () => this.method("04/03/1945 01:43", "mdy"),
                   val => val.getTime() === new Date('1945/04/03 01:43').getTime());
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
            intoNamespace = intoNamespace || {};
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
                `**Method** \`${m.name}\`
                 
                 **Parameters** \`${m.info.methodLine.trim()}\`
                 
                 **It** ${m.info.it}
                 
                 ${ (m.info.moreInfo.length && '\n' + m.info.moreInfo || "") }
                     
                 
                 --
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
        "##Usage",
        "Download files to your computer. ",
        "Within the download directory, open a cmd window and start `npm install`.",
        "\n\nNow the file `PureHelpers.js` is the main file to use. For example:\n",
        str2JsExample(
            "const helpers = require(\"[path.to]PureHelpers\").import(\"randomString, numberBetween\".split(\",\"), {});\n" +
            "helpers.randomString();\n" +
            "Number.prototype.between = function (min, max) { return helpers.numberBetween(this, min, max); }\n" +
            "// etc."),
        "If you want to import methods in the *current* namespace directly, use",
        "",
        str2JsExample("[yourAlreadyRequiredPureHelperLib].import({numberBetween: 1, truncateString: 1}, function() { return this; }())"),
        "Now within your library file you can call\n",
        str2JsExample("numberBetween(15, 5, 20); //-> true"),
        "\nNote: a non existing method will translate to a method returning an error string.\n",
        "\n##Build.js Usage##\n",
        "\nBuild.js contains:\n",
        " - Tests for all methods",
        " - A method to export only the methods to PureHelpers.js (the entry point of this library)",
        " - A method to create a README.md from the description property in each method object",
        "\nUse `node build test` to test, `node build createjs` to (re)build PureHelpers.js ",
        ",`node build readme` to (re)create README.md and `node build all` to do it all.\n",
        "\n**Note**: in all cases the tests are run first. If testing fails, rebuild/README.md will not be created.\n",
        "\n#Available methods #\n"
    ].join("\n");
}

function cleanup(description, method) {
    const fat_arrows = /=>.*$/mg;
    const code = method.toString().replace(fat_arrows, '');
    description = description.replace(/^\s+/gm, "" );
    const docString = description.split(/\n/);
    const mLine = code.split(/\n/)[0].replace(/\n|\r|\r\n/g, '');
    return {
        methodLine: mLine.replace(/\(|\)/g, ''),
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