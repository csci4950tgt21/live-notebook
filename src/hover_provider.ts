import * as vscode from 'vscode';
import { RegexManager } from "./regex_manager";
import { APICalls } from "./api_calls";

class NotebookHoverProvider implements vscode.HoverProvider {
    regexManager: RegexManager;
    apiCalls: APICalls;

    constructor(regexManager: RegexManager, apiCalls: APICalls) {
        this.regexManager = regexManager;
        this.apiCalls = apiCalls;
    }

    provideHover(doc: vscode.TextDocument, pos: vscode.Position, tok: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {

        var matchRange: vscode.Range | undefined = doc.getWordRangeAtPosition(pos, /\S+/);
        // Does not match spaces in the middle of tokens

        if (matchRange !== undefined) {
            var stringOfInterest: string = doc.getText(matchRange);
            var type: string | undefined = this.regexManager.matchToken(stringOfInterest);

            var response = "";
            if (type == "URL") {
                response = this.apiCalls.getURLdata(stringOfInterest) ?? "undefined";
            }
            else if (type == "IP") {
                response = this.apiCalls.getIPdata(stringOfInterest) ?? "undefined";
            }

            return new vscode.Hover(new vscode.MarkdownString(response));
        }
        return null;
    }
}

export default NotebookHoverProvider;