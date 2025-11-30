import { NodeFileSystem } from 'langium/node';
import { createTontoServices, generatePlantUML, Model } from 'tonto-cli';
import * as vscode from 'vscode';
import { URI } from 'vscode-uri';
import { PlantUMLPanel } from '../diagram/plantuml-webview.js';

export function registerPlantUMLCommands(context: vscode.ExtensionContext) {
    let showExternalReferences = true;
    let useOrthogonalLines = false;

    const updateDiagram = async (documentUri: vscode.Uri) => {
        if (PlantUMLPanel.currentPanel && PlantUMLPanel.currentPanel.documentUri.toString() === documentUri.toString()) {
            const document = await vscode.workspace.openTextDocument(documentUri);
            const text = document.getText();
            const uri = URI.parse(document.uri.toString());

            try {
                const services = createTontoServices(NodeFileSystem).Tonto;
                const langiumDoc = await services.shared.workspace.LangiumDocumentFactory.fromString(text, uri);
                await services.shared.workspace.DocumentBuilder.build([langiumDoc]);

                const parseResult = langiumDoc.parseResult;
                if (parseResult.parserErrors.length > 0) {
                    return;
                }

                const tontoModel = parseResult.value as Model;
                const plantuml = generatePlantUML(tontoModel, { showExternalReferences, orthogonal: useOrthogonalLines });
                PlantUMLPanel.currentPanel.update(plantuml);
            } catch (e) {
                console.error('Error updating diagram:', e);
            }
        }
    };

    context.subscriptions.push(
        vscode.commands.registerCommand('tonto.diagram.plantuml.open', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('No active Tonto editor found.');
                return;
            }

            const document = editor.document;
            if (document.languageId !== 'tonto') {
                vscode.window.showErrorMessage('Active file is not a Tonto file.');
                return;
            }

            const text = document.getText();
            const uri = URI.parse(document.uri.toString());

            try {
                const services = createTontoServices(NodeFileSystem).Tonto;
                const langiumDoc = await services.shared.workspace.LangiumDocumentFactory.fromString(text, uri);
                await services.shared.workspace.DocumentBuilder.build([langiumDoc]);

                const parseResult = langiumDoc.parseResult;
                if (parseResult.parserErrors.length > 0) {
                    vscode.window.showErrorMessage('Please fix syntax errors before generating diagram.');
                    return;
                }

                const tontoModel = parseResult.value as Model;
                const plantuml = generatePlantUML(tontoModel, { showExternalReferences, orthogonal: useOrthogonalLines });
                PlantUMLPanel.createOrShow(context.extensionUri, plantuml, document.uri);
            } catch (e) {
                console.error(e);
                vscode.window.showErrorMessage('Error generating diagram: ' + e);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('tonto.diagram.plantuml.toggleOrthogonalLines', async () => {
            useOrthogonalLines = !useOrthogonalLines;
            if (PlantUMLPanel.currentPanel) {
                await updateDiagram(PlantUMLPanel.currentPanel.documentUri);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('tonto.diagram.plantuml.toggleExternalRefs', async () => {
            showExternalReferences = !showExternalReferences;
            if (PlantUMLPanel.currentPanel) {
                await updateDiagram(PlantUMLPanel.currentPanel.documentUri);
            }
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument(async (document) => {
            if (document.languageId === 'tonto' && PlantUMLPanel.currentPanel && PlantUMLPanel.currentPanel.documentUri.toString() === document.uri.toString()) {
                await updateDiagram(document.uri);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('tonto.diagram.plantuml.export', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('No active Tonto editor found.');
                return;
            }

            const document = editor.document;
            if (document.languageId !== 'tonto') {
                vscode.window.showErrorMessage('Active file is not a Tonto file.');
                return;
            }

            const text = document.getText();
            const uri = URI.parse(document.uri.toString());

            try {
                const services = createTontoServices(NodeFileSystem).Tonto;
                const langiumDoc = await services.shared.workspace.LangiumDocumentFactory.fromString(text, uri);
                await services.shared.workspace.DocumentBuilder.build([langiumDoc]);

                const parseResult = langiumDoc.parseResult;
                if (parseResult.parserErrors.length > 0) {
                    vscode.window.showErrorMessage('Please fix syntax errors before exporting.');
                    return;
                }

                const tontoModel = parseResult.value as Model;
                const plantuml = generatePlantUML(tontoModel);

                const fileUri = await vscode.window.showSaveDialog({
                    defaultUri: vscode.Uri.file(document.uri.fsPath.replace('.tonto', '.puml')),
                    filters: {
                        'PlantUML': ['puml']
                    }
                });

                if (fileUri) {
                    await vscode.workspace.fs.writeFile(fileUri, Buffer.from(plantuml, 'utf8'));
                    vscode.window.showInformationMessage(`Exported PlantUML to ${fileUri.fsPath}`);
                }
            } catch (e) {
                console.error(e);
                vscode.window.showErrorMessage('Error exporting diagram: ' + e);
            }
        })
    );
}
