import { APIStrategy } from "./api_strategy";

/**
 * The API Strategy for get calls
 */
export class GetStrategy extends APIStrategy {
    getRawResponse(token: string) {
        // TODO GET SPECIFIC CODE
        return Promise.reject(undefined);
    }
}