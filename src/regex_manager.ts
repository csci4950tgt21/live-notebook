import * as vscode from 'vscode';

/**
 * The NamedRegex type holds both a regular expression, and the name
 * of the regular expression's type, such as "URL" or "EMAIL".
 */
type NamedRegex = {
    name: string;
    regex: RegExp;
};

/**
 * The regex manager is meant to manage all regular expressions
 * used to identify types of strings, such as URL or email. It
 * loads regular expressions and their types "name" in pairs from
 * the JSON settings file. (in package.json under "configuration")
 */
export class RegexManager {
    // The array of regex and type name pairs.
    private regexes: Array<NamedRegex> = [];

    // The constructor initalizes the regexes array by loading data
    // from user settings.
    constructor() {
        this.loadConfig();
    }

    /**
     * Load names and regexes from user settings
     */
    public loadConfig() {
        // TODO PLACEHOLDER CODE, waiting on final schema of user settings to be decided!
        // DO NOT COPY THESE REGEXES INTO CONFIG FILE, WE SHOULD FIND STANDARDIZED VERSIONS ONLINE, AND CITE SOURCES!
        this.regexes = [ { name: "EMAIL", regex: /(?<=\s|^)\w+@\w+\.\w+(?=\s|$)/ },
                         { name: "URL", regex: /(?<=\s|^)https?:\/\/[\S]+|(?<=\s|^)\w+\.[a-zA-Z]+[\S]*(?=\s|$)/},
                         { name: "IP", regex: /(?<=\s|^)(\d{1,3}\.){3}\d{1,3}(?=\s|$)|(?<=\s|^)(\w{1,4}\:){7}\w{1,4}(?=\s|$)|(?<=\s|^)\w{1,4}\:(\w{0,4}\:){5}\w{1,4}(?=\s|$)/}
                       ];
    }

    /**
     * Check if a token matches with a named regular expression pattern,
     * such as email, URL, IP, etc. Meant to be used when checking if a token
     * can be called by an API.
     * @param token The text token to be matched.
     * @returns The type of token if matched, undefined otherwise.
     */
    public matchToken(token: string) : string | undefined {
        for (let i = 0; i < this.regexes.length; i++) {
            if (token.match(this.regexes[i].regex)) {
                return this.regexes[i].name;
            }
        }
        return undefined;
    }

    /**
     * The concatenated regular expression consisting of all
     * regular expressions in the configuration file.
     */
    public concatRegex() : RegExp {
        var newRegex: string = "/";
        var i = 0;
        var end = this.regexes.length;
        this.regexes.forEach(element => {
            // Add in the | character between each regex
            if (i !== 0 && i < end) {
                newRegex+="|";
            }
            i++;
            // regex.source will remove the surrounding // from the regex
            newRegex += element.regex.source;
        });
        // When finished, add the last / to the new regex,
        // if no regexes exist this will return //
        newRegex += "/";
        return new RegExp(newRegex);
    }
}

export default RegexManager;