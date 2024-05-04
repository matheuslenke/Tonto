import getEditorServiceOverride from "@codingame/monaco-vscode-editor-service-override";
import getKeybindingsServiceOverride from "@codingame/monaco-vscode-keybindings-service-override";
import { MonacoEditorLanguageClientWrapper } from "monaco-editor-wrapper";
import { addMonacoStyles } from "monaco-editor-wrapper/styles";
import { useOpenEditorStub } from "monaco-languageclient";

export const defineUserServices = () => {
    return {
        userServices: {
            ...getEditorServiceOverride(useOpenEditorStub),
            ...getKeybindingsServiceOverride()
        },
        debugLogging: true
    };
};
export {
    MonacoEditorLanguageClientWrapper, addMonacoStyles, getEditorServiceOverride,
    getKeybindingsServiceOverride
};

