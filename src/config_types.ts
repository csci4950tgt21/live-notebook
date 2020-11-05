/**
 * The TypedRegex type holds both a regular expression, and the type
 * of the regular expression, such as "URL" or "EMAIL".
 */
type TypedRegex = {
    type: string;
    regex: RegExp;
};