const methods = {
    randomString: (prefix = "", minRandomNumberValue = 10000, maxRandomNumberValue = 10000000) =>
        prefix +
        (Math.floor(Math.random() * (maxRandomNumberValue - minRandomNumberValue || 1)) +
            minRandomNumberValue || 1)
        .toString(16),
    getUniqueRandomValues: (nValues, maxRandomValue) => {
        let existing = {};
        maxRandomValue -= 1;
        const randomUnique = () => {
            const rndm = Math.floor(1 + Math.random() * maxRandomValue);
            const exists = existing[rndm];
            if (!exists) {
                existing[rndm] = 1;
            }
            return exists ? randomUnique() : rndm;
        };
        return Array(nValues).join(",").split(",")
            .map(() => randomUnique());
    },
    mapCollection: (collection = [], callback = el => el, shouldMutate = false) => {
        const mapNew = f => x => Array.prototype.map.call(x, f);
        const mapChange = f => c => Array.prototype.forEach.call(c, (el, i) => c[i] = f(c[i]));
        return shouldMutate ? mapChange(callback)(collection) : mapNew(callback)(collection);
    },
    regExForDiacriticals: modifiers => new RegExp(
        ['[\\.\\-a-z\\s]|', // [a-z, . - and space]
            '[\\300-\\306\\340-\\346]|', // all accented A, a
            '[\\310-\\313\\350-\\353]|', // all accented E, e
            '[\\314-\\317\\354-\\357]|', // all accented I, i
            '[\\322-\\330\\362-\\370]|', // all accented O, o
            '[\\331-\\334\\371-\\374]|', // all accented U, u
            '[\\321-\\361]|', // all accented N, n
            '[\\307-\\347]' // all accented C, c
        ].join(''), modifiers),
    repeatString: (string2Repeat, n2Repeat) => Array(n2Repeat).join(string2Repeat) + string2Repeat,
    checkPostalCode: (postcodeStringCandidate, postalCodeFormat = "nnnnaa") =>
        new RegExp(`^(${postalCodeFormat
                    .toLowerCase()
                    .split("")
                    .map(el => el === "n" ? "\\d" : "[a-z]").join("")})$`,
            "i").test(postcodeStringCandidate.replace(/\s+|\-+/g, '')),
    checkEmailValidity: emailValueCandidate =>
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
                '[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF])*([a-z]|[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF])))\\.?$'
            ]
            .join(''), 'i').test(emailValueCandidate.trim()),
    cleanupWhitespace: (string2Cleanup, keepCRLF = false) => {
        const cleanup = str => str
            .replace(/\r|\n|\r\n/g, keepCRLF ? "##" : "")
            .replace(/\s{2,}/g, ' ')
            .replace(/(>\s+<)/g, '><')
            .replace(/\s+>/g, '>')
            .replace(/##/gm, "\n");
        return keepCRLF ?
            string2Cleanup.split(/\r|\n|\r\n/g).map(s => cleanup(s)).join('\n').trim() :
            cleanup(string2Cleanup).trim();
    },
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
    uniqueValuesFromArray: inputArray => inputArray.filter(function(a) {
        return !this[a] ? this[a] = true : false;
    }, {}),
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
        let mapFormat = format.split("").reduce(function(a, b, i) {
            a[b] = i;
            return a;
        }, {});
        const dateStr2Array = dateStringCandidateValue.split(/[ :\-\/]/g);
        const datePart = dateStr2Array.slice(0, 3);
        let datePartFormatted = [+datePart[mapFormat.y], +datePart[mapFormat.m] - 1, +datePart[mapFormat.d]];
        if (dateStr2Array.length > 3) {
            dateStr2Array.slice(3).forEach(t => datePartFormatted.push(+t));
        }
        const dateTrial = new Date(Date.UTC.apply(null, datePartFormatted));
        return dateTrial && dateTrial.getFullYear() === datePartFormatted[0] &&
            dateTrial.getMonth() === datePartFormatted[1] &&
            dateTrial.getDate() === datePartFormatted[2] ?
            dateTrial :
            null;
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