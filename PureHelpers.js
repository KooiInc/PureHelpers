const methods = {
    randomString: (prefix = "", minRandomNumberValue = 10000, maxRandomNumberValue = 10000000) => {
                return prefix +
                    (Math.floor(Math.random() *
                        (maxRandomNumberValue - minRandomNumberValue || 1)) +
                    minRandomNumberValue || 1)
                    .toString(16);
            },
    repeatString: (string2Repeat, n2Repeat) => {
                return Array(n2Repeat).join(string2Repeat);
            },
    checkPostcode: postcodeStringCandidate => {
                postcodeStringCandidate = postcodeStringCandidate.replace(/\s+/g, '');
                return /^(\d{4,4}[a-z]{2,2})$/i.test(postcodeStringCandidate);
            },
    cleanupWhitespace: string2Cleanup => {
                return string2Cleanup
                .replace(/\n|\r|\r\n/g, '')
                .replace(/\s+\B/g, ' ')
                .replace(/(>\s+<)/g, '><')
                .replace(/ {1,}>/g, '>')
                .replace(/^\s|^\s+|\s$|\s+$/g, '');
            },
    charAtIsUpperCase: (inputString, atpos) =>{
                const chr = inputString.charAt(atpos);
                return /[A-Z]|[\u0080-\u024F]/.test(chr) && chr === chr.toUpperCase();
            },
    charAtIsLowerCase: (inputString, atpos) =>{
                const chr = inputString.charAt(atpos);
                return /[A-Z]|[\u0080-\u024F]/.test(chr) && chr === chr.toLowerCase();
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
    splitAndClean: (string2Split, splitter) => {
                return string2Split.split(splitter)
                .map( e => e && String(e).trim().length);
            },
    isPrime: number => {
                let start = 2;
                while (start <= Math.sqrt(number)) {
                    if (number % start++ < 1) return false;
                }
                return number > 1;
            },
    hash2Object: hashInput => {
                        return hashInput
                        .split("&")
                        .map(el => el.split("="))
                        .reduce((pre, cur) => {
                            pre[cur[0]] = cur[1];
                            return pre;
                        }, {});
            },
    uniqueValuesFromArray: inputArray => inputArray.filter(a => !this[a] ? this[a] = true : false, {}),
    numberBetween: (number, min, max) => {
                return number > min && number < max;
            },
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
                return tokens.map(function (token) {
                    return str.replace(/(\{?)([a-z_0-9]+)(\})/gi, replacer(token));
                })
                .join('')
                .replace(RegExp(String.fromCharCode(0), "g"), '');
            },
    tryParseDate: (dateStringCandidateValue, format = "dmy") => {
                if (!dateStringCandidateValue) {
                    return null;
                }
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
    import(methods2Import, intoNamespace = {}) {
            intoNamespace = intoNamespace || {};
            methods2Import = methods2Import instanceof Object && !methods2Import.length
                ? Object.keys(methods2Import)
                : methods2Import;
            return this.doImport(methods2Import, intoNamespace);
        },
};
module.exports = { import: methods.import.bind(methods) };