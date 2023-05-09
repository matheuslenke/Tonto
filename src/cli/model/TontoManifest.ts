export interface TontoManifest {
  name: string;
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
}
