import { APIStrategy } from "./api_strategy";
import axios from 'axios';
import { URLSearchParams } from "url";
const FormData = require('form-data');

/**
 * The API Strategy for post calls
 */
export class PostStrategy extends APIStrategy {

    getRawResponse(token: string) {
        var withToken = JSON.parse(JSON.stringify(this.apiJSON).replace("{live-notebook.stringOfInterest}", token));
        var formData = new FormData();
        var config = {
            ...withToken.header,
            headers: {
                ...formData.getHeaders(),
            },
        };
        return axios.post(withToken.url + "?" + new URLSearchParams(withToken.query), withToken.request, config);
    }
}