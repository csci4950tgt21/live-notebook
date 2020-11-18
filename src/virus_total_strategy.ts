import { APIStrategy } from "./api_strategy";
import axios from 'axios';
const FormData = require('form-data');

/**
 * The VirusTotalStrategy is a special implementation
 * specifically designed for the VirusTotal API, due to
 * its unique calling method, which requires GET and POST
 * calls.
 */
export default class VirusTotalStrategy extends APIStrategy {
    protected async getRawResponse(token: string): Promise<any> {
        // Get values out of loaded config data
        let api_url = this.apiJSON.url;
        var vt_key = this.apiJSON.query.key;

        // Check that the key is defined
        if (vt_key == undefined) return Promise.reject("VirusTotal API Key Undefined");

        var formData = new FormData();
        formData.append("url", token);
        let virus_total_header = {
            headers: {
                ...formData.getHeaders(),
                "x-apikey": vt_key, //the token is a variable which holds the token
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
            // console.log(url_id);
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
}