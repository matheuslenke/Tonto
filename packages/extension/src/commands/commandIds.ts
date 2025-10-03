export enum CommandIds {
    generateJsonFromButton = "tonto.generateJSONFromButton",
    generateJson = "tonto.generateJSON",
    generateTontoFromButton = "tonto.generateTontoFromButton",
    generateTonto = "tonto.generateTonto",
    generateDiagramFromButton = "tonto.generateDiagramFromButton",
    generateDiagram = "tonto.generateDiagram",
    validateTontoFromButton = "tonto.validateModelFromButton",
    validateTonto = "tonto.validateModel",
    transformTontoFromButton = "tonto.transformModelFromButton",
    transformTonto = "tonto.transformModel",
    tpmInstall = "tonto.tpm.install",
    tpmInstallFromButton = "tonto.tpm.installFromButton",
    configuration = "tonto.openSettings",
    initProject = "tonto.initProject"
}

export const commandPalletteIds = [
    CommandIds.generateJson,
    CommandIds.generateTonto,
    CommandIds.generateDiagram,
    CommandIds.transformTonto,
    CommandIds.validateTonto,
    CommandIds.tpmInstall,
    CommandIds.tpmInstallFromButton,
    CommandIds.configuration,
    CommandIds.initProject,
];
