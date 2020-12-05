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
            var response: Promise<PromiseSettledResult<CommonDataModel>[]>;
            if (type !== undefined) response = this.apiCalls.getResponse(type, token);
            else return null;

            //return 
            return response.then((resArr: PromiseSettledResult<CommonDataModel>[]) => {
                var mdString = resArr.filter(res => res.status == "fulfilled").map(res => (<PromiseFulfilledResult<CommonDataModel>>res).value)
                    .map((cdm) => `### ${cdm.api_name}\n`
                        + (cdm.last_modification_date != undefined ? (`#### Last Modified\n ${cdm.last_modification_date}\n`) : "")
                        + (cdm.reputation != undefined ? (`#### Last Analysis Stats\n ${cdm.reputation}\n`) : "")
                        + (cdm.harmful != undefined ? (`#### Harmful\n ${cdm.harmful}\n`) : "")
                        + (cdm.reputation != undefined ? (`#### Reputation\n ${cdm.reputation}\n`) : "")
                        + (cdm.tags != undefined ? (`#### Tags\n ${cdm.tags.map(tag => `\`${tag}\``).join(' ')}\n`) : "")
                        + (cdm.whois != undefined ? (`#### Whois\n ${cdm.whois}\n`) : "")
                        + (cdm.link_self != undefined ? (`#### Link.self\n ${cdm.link_self}\n`) : "")
                        + (cdm.type != undefined ? (`#### Type\n ${cdm.type}\n`) : "")
                        + (cdm.total_votes != undefined ? ("#### Total Votes\n|Harmless|Malicious|\n|-|-|\n" +
                            `|${cdm.total_votes.harmless}|${cdm.total_votes.malicious}|\n`) : "")
                        + (cdm.last_analysis_stats != undefined ? ("#### Last Analysis Stats\n|Harmless|Malicious|Suspicious|Timeout|Undetected|\n|-|-|-|-|-|\n" +
                            `|${cdm.last_analysis_stats.harmless}|${cdm.last_analysis_stats.malicious}|${cdm.last_analysis_stats.suspicious}|${cdm.last_analysis_stats.timeout}|${cdm.last_analysis_stats.undetected}|\n`) : "")
                    ).join("\n");
                return new vscode.Hover(new vscode.MarkdownString(mdString));
            });
        }
    }
}

export default NotebookHoverProvider;