import { APIStrategy } from "./api_strategy";

/**
 * The API Strategy for post calls
 */
export class PostStrategy extends APIStrategy {
    getRawResponse(token: string) {
        // TODO POST SPECIFIC CODE
        return Promise.reject(undefined);
    }
}