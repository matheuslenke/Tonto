export interface TontoManifest {
  projectName: string;
  displayName: string;
  publisher: string;
  version: string;
  license: string;
  dependencies: {
    [key: string]:
    | string
    | {
      url: string;
      version: string;
    };
  };
  outFolder: string;
}

export const manifestFileName = "tonto.json";

export function toJson(manifest: TontoManifest): string {
  return JSON.stringify(manifest, null, 3);
}