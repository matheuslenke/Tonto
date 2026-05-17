import { NodeFileSystem } from 'langium/node';
import { createTontoServices, generatePlantUML, getModelContextModules, getPrimaryContextModuleOrThrow, Model } from 'tonto-cli';
import * as vscode from 'vscode';
import { URI } from 'vscode-uri';
import { PlantUMLPanel } from '../diagram/plantuml-webview.js';

type TontoServices = ReturnType<typeof createTontoServices>["Tonto"];
type PlantUMLLayoutVariant =
    | 'default'
    | 'top-to-bottom'
    | 'left-to-right'
    | 'polyline'
    | 'orthogonal'
    | 'smetana'
    | 'elk';

const plantUMLLayoutOptions: Array<{ value: PlantUMLLayoutVariant; label: string }> = [
    { value: 'default', label: 'Default' },
    { value: 'top-to-bottom', label: 'Top to bottom' },
    { value: 'left-to-right', label: 'Left to right' },
    { value: 'polyline', label: 'Polyline' },
    { value: 'orthogonal', label: 'Orthogonal' },
    { value: 'smetana', label: 'Smetana' },
    { value: 'elk', label: 'ELK' },
];

export function registerPlantUMLCommands(context: vscode.ExtensionContext) {
    let showExternalReferences = true;
    let layoutVariant: PlantUMLLayoutVariant = 'default';

    const getPanelState = () => ({
        showExternalReferences,
        layoutVariant,
        layoutOptions: plantUMLLayoutOptions,
    });

    const updateDiagram = async (documentUri: vscode.Uri) => {
        if (PlantUMLPanel.currentPanel && PlantUMLPanel.currentPanel.documentUri.toString() === documentUri.toString()) {
            const document = await vscode.workspace.openTextDocument(documentUri);
            try {
                const plantuml = await buildPlantUmlForDocument(document, {
                    showExternalReferences,
                    layoutVariant,
                });
                if (plantuml) {
                    PlantUMLPanel.currentPanel.update(plantuml, getPanelState());
                }
            } catch (e) {
                console.error('Error updating diagram:', e);
            }
        }
    };

    context.subscriptions.push(
        vscode.commands.registerCommand('tonto.diagram.plantuml.open', async () => {
            const document = getActiveTontoDocument();
            if (!document) {
                return;
            }

            try {
                const plantuml = await buildPlantUmlForDocument(document, {
                    showExternalReferences,
                    layoutVariant,
                });
                if (!plantuml) {
                    vscode.window.showErrorMessage('Please fix syntax errors before generating diagram.');
                    return;
                }

                PlantUMLPanel.createOrShow(context.extensionUri, plantuml, document.uri, getPanelState());
            } catch (e) {
                console.error(e);
                vscode.window.showErrorMessage('Error generating diagram: ' + e);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('tonto.diagram.plantuml.toggleOrthogonalLines', async () => {
            layoutVariant = layoutVariant === 'orthogonal' ? 'default' : 'orthogonal';
            if (PlantUMLPanel.currentPanel) {
                await updateDiagram(PlantUMLPanel.currentPanel.documentUri);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('tonto.diagram.plantuml.setLayoutVariant', async (nextLayoutVariant: PlantUMLLayoutVariant) => {
            if (!isPlantUMLLayoutVariant(nextLayoutVariant)) {
                return;
            }

            layoutVariant = nextLayoutVariant;
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
            const document = getActiveTontoDocument();
            if (!document) {
                return;
            }

            try {
                const plantuml = await buildPlantUmlForDocument(document);
                if (!plantuml) {
                    vscode.window.showErrorMessage('Please fix syntax errors before exporting.');
                    return;
                }

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

function getActiveTontoDocument(): vscode.TextDocument | undefined {
    const document = vscode.window.activeTextEditor?.document;
    if (!document) {
        vscode.window.showErrorMessage('No active Tonto editor found.');
        return undefined;
    }

    if (document.languageId !== 'tonto') {
        vscode.window.showErrorMessage('Active file is not a Tonto file.');
        return undefined;
    }

    return document;
}

async function buildPlantUmlForDocument(
    document: vscode.TextDocument,
    options: { showExternalReferences?: boolean; layoutVariant?: PlantUMLLayoutVariant } = {}
): Promise<string | undefined> {
    const services = createTontoServices(NodeFileSystem).Tonto;
    const langiumDocuments = services.shared.workspace.LangiumDocuments;
    const documentBuilder = services.shared.workspace.DocumentBuilder;
    const currentUri = URI.parse(document.uri.toString());
    const langiumDoc = await services.shared.workspace.LangiumDocumentFactory.fromString(
        document.getText(),
        currentUri
    );
    langiumDocuments.addDocument(langiumDoc);

    await loadWorkspaceTontoDocuments(services, currentUri);
    await documentBuilder.build(langiumDocuments.all.toArray());

    if (langiumDoc.parseResult.parserErrors.length > 0) {
        return undefined;
    }

    const externalReferenceModules = langiumDocuments.all
        .flatMap((workspaceDocument) => getModelContextModules(workspaceDocument.parseResult.value as Model))
        .toArray();
    const plantUmlOptions = {
        showExternalReferences: options.showExternalReferences ?? true,
        layout: options.layoutVariant ?? 'default',
        externalReferenceModules,
    };
    const currentModule = getPrimaryContextModuleOrThrow(langiumDoc.parseResult.value as Model);

    return generatePlantUML(currentModule, plantUmlOptions);
}

function isPlantUMLLayoutVariant(value: unknown): value is PlantUMLLayoutVariant {
    return typeof value === 'string' && plantUMLLayoutOptions.some((option) => option.value === value);
}

async function loadWorkspaceTontoDocuments(
    services: TontoServices,
    currentUri: URI
): Promise<void> {
    const tontoFiles = await vscode.workspace.findFiles(
        '**/*.tonto',
        '**/{node_modules,out,dist,pack,build}/**'
    );
    for (const file of tontoFiles) {
        const fileUri = URI.parse(file.toString());
        if (fileUri.toString() === currentUri.toString()) {
            continue;
        }

        const bytes = await vscode.workspace.fs.readFile(file);
        const workspaceDocument = services.shared.workspace.LangiumDocumentFactory.fromString(
            Buffer.from(bytes).toString("utf8"),
            fileUri
        );
        services.shared.workspace.LangiumDocuments.addDocument(workspaceDocument);
    }
}
