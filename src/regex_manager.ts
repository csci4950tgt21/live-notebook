import { type } from 'os';
import * as vscode from 'vscode';
import { TypedRegex, ConfigManager } from './config_manager';

/**
 * The regex manager is meant to manage all regular expressions
 * used to identify types of strings, such as URL or email. It
 * loads regular expressions and their type in pairs from
 * the JSON settings file. (in package.json under "configuration")
 */
export class RegexManager {
    // The array of regex and type pairs.
    private regexes: Array<TypedRegex> = [];

    // The constructor initalizes the regexes array by loading data
    // from user settings.
    constructor() {
        this.loadConfig();
    }

    /**
     * Load regexes and their types from user settings
     */
    public loadConfig() {
        // Load the regexes in the ConfigManager class
        this.regexes = ConfigManager.getConfigManager().getTypedRegexes();
    }

    /**
     * Check if a token matches with a regular expression pattern,
     * such as email, URL, IP, etc. Meant to be used when checking if a token
     * can be called by an API.
     * @param token The text token to be matched.
     * @returns The type of token if matched, undefined otherwise.
     */
    public matchToken(token: string): string | undefined {
        for (let i = 0; i < this.regexes.length; i++) {
            if (token.match(this.regexes[i].regex)) {
                return this.regexes[i].type;
            }
        }
        return undefined;
    }

    /**
     * The concatenated regular expression consisting of all
     * regular expressions in the configuration file.
     */
    public concatRegex(): RegExp {
        var newRegex: string = "/";
        var i = 0;
        var end = this.regexes.length;
        this.regexes.forEach(element => {
            // Add in the | character between each regex
            if (i !== 0 && i < end) {
                newRegex += "|";
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