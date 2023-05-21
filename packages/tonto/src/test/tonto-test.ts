import { AstNode, LangiumDocument } from "langium";
import { Diagnostic } from "vscode-languageserver";
import { URI } from "vscode-uri";
import { TontoServices } from "../language-server/tonto-module";

/**
 * @param services: The Tonto Services
 * @returns a LangiumDocument containing the input contents and it's parsing results
 * This function uses the Tonto Services and parse a "False file" as a string input,
 * helping to test
 */
export function parseHelper<T extends AstNode = AstNode>(
  services: TontoServices
): (input: string) => Promise<LangiumDocument<T>> {
  const metaData = services.LanguageMetaData;
  const documentBuilder = services.shared.workspace.DocumentBuilder;
  return async (input) => {
    const randomNumber = Math.floor(Math.random() * 10000000) + 1000000;
    const uri = URI.parse(
      `file:///${randomNumber}${metaData.fileExtensions[0]}`
    );
    const document =
      services.shared.workspace.LangiumDocumentFactory.fromString<T>(
        input,
        uri
      );
    services.shared.workspace.LangiumDocuments.addDocument(document);
    await documentBuilder.build([document]);
    return document;
  };
}

export interface ValidationResult<T extends AstNode = AstNode> {
  diagnostics: Diagnostic[];
  document: LangiumDocument<T>;
}

/**
 *
 * @param services: Tonto services
 * @returns a ValidationResult containing the results of the validations that the
 * TontoServices did
 */
export function validationHelper<T extends AstNode = AstNode>(
  services: TontoServices
): (input: string) => Promise<ValidationResult<T>> {
  const parse = parseHelper<T>(services);
  return async (input) => {
    const document = await parse(input);
    return {
      document,
      diagnostics: await services.validation.DocumentValidator.validateDocument(
        document
      ),
    };
  };
}
