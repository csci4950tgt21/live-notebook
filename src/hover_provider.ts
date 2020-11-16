import * as vscode from 'vscode';
import { RegexManager } from "./regex_manager";
import { APICalls, CommonDataModel } from "./api_calls";

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
            var token: string = doc.getText(matchRange);
            var type: string | undefined = this.regexManager.matchToken(token);
            var response: Promise<CommonDataModel[]>;
            if (type !== undefined) response = this.apiCalls.getResponse(type, token);
            else return null;
            return response.then((value) => {
                return new vscode.Hover(new vscode.MarkdownString(
                    JSON.stringify(value)));
            });
        }
    }
}

export default NotebookHoverProvider;