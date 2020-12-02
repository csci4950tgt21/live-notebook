import { APIStrategy } from "./api_strategy";
import axios from 'axios';
import { CommonDataModel } from "./api_calls";
import { Console } from "console";
const FormData = require('form-data');

/**
 * The VirusTotalStrategy is a special implementation
 * specifically designed for the VirusTotal API, due to
 * its unique calling method, which requires GET and POST
 * calls. As well as the usage of form data for post.
 */
export default class VirusTotalStrategy extends APIStrategy {
    protected async getRawResponse(token: string): Promise<any> {
        // Get values out of loaded config data
        let api_url = this.apiJSON.url;

        var formData = new FormData();
        formData.append("url", token);
        let virus_total_header = {
            headers: {
                ...formData.getHeaders(),
                ...this.apiJSON.data.headers
            },
        };
        let post_resp = {
            data: {
                id: -1,
            },
        };
        let resolve = async (resp: any) => {
            post_resp.data = resp.data.data;
            let url_id = post_resp.data.id;
            if (url_id != undefined) {
                let new_api_url = this.apiJSON.vturl2 + url_id;
                let resolve = (resp: any) => {
                    return resp.data.data;
                };
                return await axios
                    .get(new_api_url, virus_total_header)
                    .then(resolve);
            } else {
                return undefined;
            }
        }

        return axios
            .post(api_url, formData, virus_total_header).then(resolve, (err: any) => {
            console.error(err);
            return err.message;
            });
    }

    // protected normalize(mapping: object | string, response: any): CommonDataModel {
    //     const date: Date = new Date(0);
    //     date.setUTCSeconds(response.data.data.attributes.date)
    //     const normalizedResponse: CommonDataModel = {
    //         ...response.data.data.attributes,
    //         api_name: "VirusTotal URL",
    //         last_modification_date: date.toLocaleDateString(),
    //         type: response.data.data.type,
    //         links: response.data.data.links
    //     };
    //     return normalizedResponse
    // }
}