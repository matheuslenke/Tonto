export enum CommandIds {
  generateJsonFromButton = "tonto.generateJSONFromButton",
  generateJson = "tonto.generateJSON",
  generateTontoFromButton = "tonto.generateTontoFromButton",
  generateTonto = "tonto.generateTonto",
  validateTontoFromButton = "tonto.validateModelFromButton",
  validateTonto = "tonto.validateModel",
  transformTontoFromButton = "tonto.transformModelFromButton",
  transformTonto = "tonto.transformModel",
  tpmInstall = "tonto.tpm.install",
  tpmInstallFromButton = "tonto.tpm.installFromButton",
}

export const commandPalletteIds = [
  CommandIds.generateJson,
  CommandIds.generateTonto,
  CommandIds.transformTonto,
  CommandIds.validateTonto,
  CommandIds.tpmInstall,
  CommandIds.tpmInstallFromButton,
];
