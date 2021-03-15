import { Console } from 'console';
import { type } from 'os';
import * as vscode from 'vscode';
import { ConfigManager } from './config_manager';

/**
 * The TypedRegex type holds both a regular expression, and the type
 * of the regular expression, such as "URL" or "EMAIL".
 */
export type TypedRegex = {
    type: string;
    regex: RegExp;
};

/**
 * The token matcher is meant to manage all regular expressions
 * used to identify types of strings, such as URL or email. It
 * loads regular expressions and their type in pairs from
 * the JSON settings file. (in package.json under "configuration")
 */
export class TokenMatcher {
    // The array of regex and type pairs.
    private regexes: Array<TypedRegex> = [];
    // The configuration the tokenmatcher uses for its regular expressions
    private configManager : ConfigManager;

    // The constructor initalizes the regexes array by loading data
    // from user settings.
    constructor(configManager : ConfigManager) {
        this.configManager = configManager;
        this.loadConfig();
    }

    /**
     * Load regexes and their types from user settings
     */
    public loadConfig() {
        if (this.configManager == null)
        {
            console.log("Null ConfigManager in tokenmatcher!");
            return;
        }
        // Load the regexes in the ConfigManager class
        this.regexes = this.configManager.getTypedRegexes();
        this.configManager.onDidUpdateConfiguration(() => this.regexes = this.configManager.getTypedRegexes());
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
}

export default TokenMatcher;