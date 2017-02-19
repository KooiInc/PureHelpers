"use strict";
const methods = {
    randomString: (prefix = "", minRandomNumberValue = 10000, maxRandomNumberValue = 10000000) => {
        /*<DESCRIPTION>
         It creates a random (hex) number string, possibly preceded with a prefix
         Returns string
         </DESCRIPTION>*/
        return prefix + (Math.floor(Math.random() * (maxRandomNumberValue - minRandomNumberValue || 1)) + minRandomNumberValue || 1).toString(16)
    },
    repeatString: (string2Repeat, n2Repeat) => {
        /*<DESCRIPTION>
         It returns a string where [string2Repeat] is repeated [n2Repeat] times
         </DESCRIPTION>*/
        return Array(n2Repeat).join(string2Repeat);
    },
    checkPostcode: (postcodeStringCandidate) => {
        /*<DESCRIPTION>
         It checks a dutch postal code to be valid
         Returns boolean
         </DESCRIPTION>*/
        postcodeStringCandidate = postcodeStringCandidate.replace(/\s+/g, '');
        return /^(\d{4,4}[a-z]{2,2})$/i.test(postcodeStringCandidate);
    },
    truncateString: (string2Truncate, truncateAtPosition, truncateOnWholeWordsOnly) => {
        /*<DESCRIPTION>
         It truncates [string2Truncate] @ position [truncateAtPosition]
         if [truncateOnWholeWordsOnly] is true, string2Truncate will be truncated right after the last word in the truncated string
         Returns string
         </DESCRIPTION>*/
        if (truncateAtPosition >= string2Truncate.length) { return string2Truncate; }
        const truncatedRaw = string2Truncate.slice(0, truncateAtPosition);
        return (truncateOnWholeWordsOnly && /[a-z]/gi.test(string2Truncate.substr(truncateAtPosition, 1)) ?
                truncatedRaw.slice(0, truncatedRaw.lastIndexOf(' ')) :
                truncatedRaw) + '\u2026';
    },
    numberBetween: (number, min, max) => {
        /*<DESCRIPTION>
         It determines if [number] falls between [min] and [max]
         Returns boolean
         </DESCRIPTION>*/
        return number > min && number < max;
    },
    padLeft: (number, base = 10, char = "0") => {
        /*<DESCRIPTION>
         It left-pads a [number] with [base] - [number].length [char]
         Example:
         #> padLeft(15, 1000, "-");
         #> "0015""
         Returns string
         </DESCRIPTION>*/
        const  len = (String(base).length - String(number).length)+1;
        return len > 0 ? new Array(len).join('0')+number : number;
    },
    interpolate: (string2Interpolate, tokens) => {
        /*<DESCRIPTION>
         It is a string templating method, using {[someproperty]} in string and a
         token object to replace [someproperty]
         Example:
         #> interpolate("Hello {world}", {world: "folks"});
         #> "Hello folks"
         Example:
         #> interpolate("Hello {world}\n", [{world: "folks"}, {world: "Pete"}]);
         #> "Hello folks\nHello Pete"
         You can use it to extend String.prototype:
         #> String.prototype.interpolate = function (tokens) { return interpolate(this, tokens); };
         Example usage:
         #> "Hello {world}\n".interpolate([{world: "folks"}, {world: "Pete"}]);
         #> "Hello folks\nHello Pete"
         Returns string
         </DESCRIPTION>*/
        if (!(tokens instanceof Array) && tokens instanceof Object) {
            tokens = [tokens];
        } else if (!(tokens instanceof Object)) {
            return string2Interpolate;
        }

        // empty strings temporary become String.fromCharCode(0)
        let replacer = token => (t, t1, t2) => token[t2] === '' ? String.fromCharCode(0) : token[t2] || t;
        let str = string2Interpolate;
        return tokens.map( function (token) {
            return str.replace(/(\{?)([a-z_0-9]+)(\})/gi, replacer(token));
        } )
        .join('')
        .replace(RegExp(String.fromCharCode(0), "g"), '');
        // String.fromCharCode(0) back to empty string
    },
    tryParseDate: (dateStringCandidateValue, format = "dmy") => {
        /*<DESCRIPTION>
         It tries to parse string [dateStringCandidateValue] into a Date instance using [format]
         [format] "dmy" = [d]ate, [m]onth, [y]ear
         Example:
         #> tryParseDate("07/02/2015", "mdy")
         #> (Date)2015-07-01
         Returns a Date instance or [null] if parsing fails
         </DESCRIPTION>*/
        if (!dateStringCandidateValue) { return null; }
        const minYear2Parse = 1920;
        const maxYear2Parse = 2017;
        let mapFormat = {};
        format.split("").map((e, i) => (mapFormat[e] = i) && e);
        const dateStr2Array = dateStringCandidateValue.split(/[ :\-\/]/g);
        let datePart = dateStr2Array.slice(0, 3);
        datePart = [datePart[mapFormat.y],
            datePart[mapFormat.m],
            datePart[mapFormat.d]
        ].join('/');
        var timepart = dateStr2Array.length > 3 && dateStr2Array.slice(3).join(":") || "";
        var trydate = datePart.length > 3 &&
            new Date([
                    datePart,
                    /:$/.test(timepart) && timepart || timepart + ":"
                ].join(" ") || new Date(datePart));
        var fullYear = trydate && trydate.getFullYear();
        return fullYear && fullYear >= minYear2Parse && fullYear <= maxYear2Parse ? trydate : null;
    }
};

function importA(fns, into) {
    fns.forEach(fn => {
        fn = fn.trim();
        if (methods[fn]) {
            into[fn] = methods[fn];
        } else {
            into[fn] = () => `[${fn.trim()}] is not a known method in this namespace, sorry`;
        }
    });
    return into;
}

module.exports = {
    getAPI: ApiGetter,
    import: (methods2Import, intoNamespace = {}) => {
        /*
         <DESCRIPTION>
         It imports [methods2Import] (array or object) from [methods] (this lib)
         into namespace [intoNamespace]
         [methods2Import] May be an array of strings, e.g.  ["methoda", "methodb"],
         or an object with method names as keys, e.g. {methoda: 1, methodb: 2}
         Example:
         #> const importedMethods = [lib].import({numberBetween: 1, truncateString: 1}, {});
         #> importedMethods.numberBetween(15, 5, 20);
         #> true
         If you want to import methods in the *current* namespace directly, use
         #> [lib].import({numberBetween: 1, truncateString: 1}, function() { return this; }());
         Now within your library file you can call
         #> numberBetween(15, 5, 20);
         #> true
         Note: a non existing method will translate to a method returning an error string
         Returns [intoNamespace]
         </DESCRIPTION>
         */
        intoNamespace = intoNamespace || {};
        methods2Import = methods2Import instanceof Object && !methods2Import.length
            ? Object.keys(methods2Import)
            : methods2Import;
        return importA(methods2Import, intoNamespace);
    }
};

function ApiGetter() {
    /*<DESCRIPTION>
     It shows the methods and descriptions (if existing) within this library
     Returns object {methodInfo: ..., stringify: ...} where methodInfo is an object
     with description properties.
     </DESCRIPTION>*/
    const api2String = function() {
        return `\nImportable methods. Note: all methods are pure.\n` +
            methods.repeatString("-", 80) +
            this.methodInfo.map(m =>
                `\n-- ${m.name} ${m.info.methodLine}\n=> ${m.info.it}${m.info.moreInfo.length && '\n   ' + m.info.moreInfo.replace(/\n/g, '\n   ') || ''}`)
            .join('\n');
    };
    const methodInfos = Object.keys(methods).map(key => {
        return { name: key, info: getMethodParamsAndDocumentation(methods[key]) };
    });
    methodInfos.push({ name: "(this module) import", info: getMethodParamsAndDocumentation(module.exports.import) });
    return {
        methodInfo: methodInfos,
        stringify: api2String
    }
}

function getMethodParamsAndDocumentation(method) {
    const APIXMLDOC = /(<DESCRIPTION>)([^<]+)(<\/DESCRIPTION>)/mi;
    const FAT_ARROWS = /=>.*$/mg;
    const code = method.toString().replace(FAT_ARROWS, '');
    const docu = code.match(APIXMLDOC);
    const docString = docu && docu.length
        ? docu[2].split(/\n/).map(e => e.trim()).filter(e => e.length)
        : "";
    let result = {
        methodLine: code.split(/\n/)[0],
        it: docString ? docString[0] : "Not (yet) documented",
        moreInfo: docString ? docString.slice(1).join('\n').replace(/#>/g, " >") : "",
    };

    return result;
}
