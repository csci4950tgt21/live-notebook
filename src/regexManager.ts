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
class RegexManager {
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
        this.regexes = [ { name: "email", regex: /(?<=\s|^)\w+@\w+\.\w+/g } ];
    }

    /**
     * 
     * @param token 
     * @param name 
     */
    public matchToken(token: string, name: string) {
        this.regexes.forEach(element => {
            if (element.name === name) {
                return token.match(element.regex) != null;
            }
        });
        return false;
    }
}