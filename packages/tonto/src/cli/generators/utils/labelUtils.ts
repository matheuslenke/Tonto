import { MultilingualText } from "ontouml-js";
import { Description, Label } from "../../../language/generated/ast.js";

export function getMultilingualText(label: Label | undefined, defaultText: string): MultilingualText {
    if (!label || !label.labels || label.labels.length === 0) {
        return new MultilingualText(defaultText);
    }

    const multilingualText = new MultilingualText();
    label.labels.forEach((labelItem) => {
        console.log(`Processing label: '${labelItem.label}', lang: '${labelItem.language}'`);
        if (labelItem.language) {
            multilingualText.addText(labelItem.label, labelItem.language);
        } else {
            // If no language is specified, we might want to use a default or just add it.
            // MultilingualText usually requires a language code.
            // Let's assume 'en' if not specified, or check if the API supports default.
            // Looking at ontouml-js, putText(lang, text).
            // If language is missing in Tonto, it might be an empty string or undefined depending on grammar.
            // The grammar says `language: string`.
            const lang = labelItem.language || "en";
            multilingualText.addText(labelItem.label, lang);
        }
    });
    console.log(`MultilingualText created. Default Text: '${multilingualText.getText()}'`);
    return multilingualText;
}

export function getDescription(description: Description | undefined): MultilingualText | undefined {
    if (!description || !description.descriptions || description.descriptions.length === 0) {
        return undefined;
    }

    const multilingualText = new MultilingualText();
    description.descriptions.forEach((descItem) => {
        const lang = descItem.language || "en";
        multilingualText.addText(descItem.label, lang);
    });

    return multilingualText;
}
