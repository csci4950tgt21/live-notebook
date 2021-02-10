import * as vscode from 'vscode';
import { TokenMatcher } from "./token_matcher";
import { APICalls, CommonDataModel } from "./api_calls";
import {SidePanels} from "./side_panels";

class NotebookHoverProvider implements vscode.HoverProvider {
    tokenMatcher: TokenMatcher;
    apiCalls: APICalls;
    sidePanels: SidePanels;

    constructor(tokenMatcher: TokenMatcher, apiCalls: APICalls) {
        this.tokenMatcher = tokenMatcher;
        this.apiCalls = apiCalls;
        this.sidePanels = new SidePanels(apiCalls);
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

            //this.sidePanels.onHoverFocus(token, response);
            // return a formatted common data model response
            // TODO Change to a dynamic configuration driven response
            return response.then((resArr: PromiseSettledResult<CommonDataModel>[]) => {
                var mdString = resArr.filter(res => res.status == "fulfilled").map(res => (<PromiseFulfilledResult<CommonDataModel>>res).value)
                    .map((cdm) => `### ${cdm.api_name}\n`
                        + (cdm.last_modification_date != undefined ? (`**Last Modified**: ${cdm.last_modification_date}  \n`) : "")
                        + (cdm.harmful != undefined ? (`**Harmful**: ${cdm.harmful}  \n`) : "")
                        + (cdm.reputation != undefined ? (`**Reputation**: ${cdm.reputation}  \n`) : "")
                        + (cdm.tags != undefined ? (`**Tags**: ${cdm.tags.map(tag => `\`${tag}\``).join(' ')}  \n`) : "")
                        + (cdm.whois != undefined ? (`**Whois**: ${cdm.whois}  \n`) : "")
                        + (cdm.link_self != undefined ? (`**Link.self**: ${cdm.link_self}  \n`) : "")
                        + (cdm.type != undefined ? (`**Type**: ${cdm.type}  \n`) : "")
                        + ((cdm.total_votes?.harmless || cdm.total_votes?.malicious) != undefined ? ("\n#### **Total Votes**:\n|Harmless|Malicious|\n|:-|:-|\n" +
                            `|${cdm.total_votes?.harmless}|${cdm.total_votes?.malicious}|  \n`) : "")
                        + ((cdm.last_analysis_stats?.harmless || cdm.last_analysis_stats?.malicious || cdm.last_analysis_stats?.suspicious || cdm.last_analysis_stats?.timeout
                            || cdm.last_analysis_stats?.undetected) != undefined ? ("\n#### **Last Analysis Stats**:\n|Harmless|Malicious|Suspicious|Timeout|Undetected|\n|:-|:-|:-|:-|:-|\n" +
                            `|${cdm.last_analysis_stats?.harmless}|${cdm.last_analysis_stats?.malicious}|${cdm.last_analysis_stats?.suspicious}|${cdm.last_analysis_stats?.timeout}|${cdm.last_analysis_stats?.undetected}|\n`) : "")
                    ).join("\n");
                return new vscode.Hover(new vscode.MarkdownString(mdString));
            });
        }
    }
}

export default NotebookHoverProvider;