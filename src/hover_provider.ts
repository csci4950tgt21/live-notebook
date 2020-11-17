import * as vscode from 'vscode';
import { TokenMatcher } from "./token_matcher";
import { APICalls, CommonDataModel } from "./api_calls";

class NotebookHoverProvider implements vscode.HoverProvider {
    tokenMatcher: TokenMatcher;
    apiCalls: APICalls;

    constructor(tokenMatcher: TokenMatcher, apiCalls: APICalls) {
        this.tokenMatcher = tokenMatcher;
        this.apiCalls = apiCalls;
    }

    provideHover(doc: vscode.TextDocument, pos: vscode.Position, tok: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {

        var matchRange: vscode.Range | undefined = doc.getWordRangeAtPosition(pos, /\S+/);
        // Does not match spaces in the middle of tokens

        if (matchRange !== undefined) {
            var token: string = doc.getText(matchRange);
            var type: string | undefined = this.tokenMatcher.matchToken(token);
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