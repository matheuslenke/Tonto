import { IToken, TokenType } from "chevrotain";
import { LangiumParserErrorMessageProvider } from "langium";

export class TontoParserErrorMessageProvider extends LangiumParserErrorMessageProvider {

    override buildMismatchTokenMessage({ expected, actual }: {
        expected: TokenType,
        actual: IToken,
        previous: IToken,
        ruleName: string
    }): string {
        console.log(expected, actual);
        if (expected.name === "CAPITALIZED_ID") {
            const expectedMsg = "This Identifier needs to have its first letter capitalized.";
            return expectedMsg;
        }
        if (expected.name === "CAMEL_CASE_ID") {
            const expectedMsg = "This Identifier needs to have its first letter in lower case.";
            return expectedMsg;
        }
        const expectedMsg = expected.LABEL
            ? "`" + expected.LABEL + "`"
            : expected.name.endsWith(":KW")
                ? `keyword '${expected.name.substring(0, expected.name.length - 3)}'`
                : `token of type '${expected.name}'`;
        return `Expecting ${expectedMsg} but found \`${actual.image}\`.`;
    }
}