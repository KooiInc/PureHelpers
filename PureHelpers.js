const methods = {
    randomString: (prefix = "", minRandomNumberValue = 10000, maxRandomNumberValue = 10000000) =>
        prefix +
        (Math.floor(Math.random() * (maxRandomNumberValue - minRandomNumberValue || 1)) +
            minRandomNumberValue || 1)
        .toString(16),
    repeatString: (string2Repeat, n2Repeat) => Array(n2Repeat).join(string2Repeat) + string2Repeat,
    checkPostcode: postcodeStringCandidate => {
        postcodeStringCandidate = postcodeStringCandidate.replace(/\s+/g, '');
        return /^(\d{4,4}[a-z]{2,2})$/i.test(postcodeStringCandidate);
    },
    cleanupWhitespace: string2Cleanup =>
        string2Cleanup
        .trim()
        .replace(/\n|\r|\r\n/g, '')
        .replace(/\s{2,}\W/g, ' ')
        .replace(/(>\s+<)/g, '><')
        .replace(/ {1,}>/g, '>')
        .replace(/^\s|^\s+|\s$|\s+$/g, ''),
    charAtIsUpperCase: (inputString, atpos) => {
        const chr = inputString.charAt(atpos);
        return /[A-Z]|[\u0080-\u024F]/.test(chr) && chr === chr.toUpperCase();
    },
    charAtIsLowerCase: (inputString, atpos) => {
        const chr = inputString.charAt(atpos);
        return /[A-Z]|[\u0080-\u024F]/i.test(chr) && chr === chr.toLowerCase();
    },
    truncateString: (string2Truncate, truncateAtPosition, truncateOnWholeWordsOnly) => {
        if (truncateAtPosition >= string2Truncate.length) {
            return string2Truncate;
        }
        const truncatedRaw = string2Truncate.slice(0, truncateAtPosition);
        return (truncateOnWholeWordsOnly && /[a-z]/gi.test(string2Truncate.substr(truncateAtPosition, 1)) ?
            truncatedRaw.slice(0, truncatedRaw.lastIndexOf(' ')) :
            truncatedRaw) + '\u2026';
    },
    splitAndClean: (string2Split, splitter) => string2Split.split(splitter).filter(e => e && String(e).trim().length),
    isPrime: number => {
        let start = 2;
        while (start <= Math.sqrt(number)) {
            if (number % start++ < 1) {
                return false;
            }
        }
        return number > 1;
    },
    hash2Object: hashInput =>
        hashInput
        .split("&")
        .map(el => el.split("="))
        .reduce((pre, cur) => {
            pre[cur[0]] = cur[1];
            return pre;
        }, {}),
    uniqueValuesFromArray: inputArray => inputArray.filter(
        function(a) {
            return !this[a] ? this[a] = true : false;
        }, {}
    ),
    numberBetween: (number, min, max) => number > min && number < max,
    padLeft: (number, base = 10, char = "0") => {
        const len = (String(base).length - String(number).length) + 1;
        return len > 0 ? new Array(len).join(char) + number : number;
    },
    interpolate: (string2Interpolate, tokens) => {
        if (!(tokens instanceof Array) && tokens instanceof Object) {
            tokens = [tokens];
        } else if (!(tokens instanceof Object)) {
            return string2Interpolate;
        }
        let replacer = token => (t, t1, t2) => token[t2] === '' ? String.fromCharCode(0) : token[t2] || t;
        let str = string2Interpolate;
        return tokens.map(function(token) {
                return str.replace(/(\{?)([a-z_0-9]+)(\})/gi, replacer(token));
            })
            .join('')
            .replace(RegExp(String.fromCharCode(0), "g"), '');
    },
    tryParseDate: (dateStringCandidateValue, format = "dmy") => {
        if (!dateStringCandidateValue) {
            return null;
        }
        let mapFormat = {};
        format.split("").map((e, i) => (mapFormat[e] = i) && e);
        const dateStr2Array = dateStringCandidateValue.split(/[ :\-\/]/g);
        let datePart = dateStr2Array.slice(0, 3);
        datePart = [datePart[mapFormat.y],
            datePart[mapFormat.m],
            datePart[mapFormat.d]
        ];

        // input string should confer strictly to [format]
        // otherwise result may not me reliable (locale settings)
        if (+datePart[0] < 1000) {
            return null;
        } else {
            datePart = datePart.join("/");
        }

        const timepart = dateStr2Array.length > 3 && dateStr2Array.slice(3).join(":") || "";
        const tryDate = datePart.length > 3 ?
            new Date([datePart, /:$/.test(timepart) ? timepart : timepart + ":"].join(" ")) :
            new Date(datePart);
        return tryDate ? tryDate : null;
    },
    doImport(fns, into) {
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
    import (methods2Import, intoNamespace = {}) {
        intoNamespace = intoNamespace || {};
        methods2Import = methods2Import instanceof Object && !methods2Import.length ?
            Object.keys(methods2Import) :
            methods2Import;
        return this.doImport(methods2Import, intoNamespace);
    },
};
module.exports = {
    import: methods.import.bind(methods)
};