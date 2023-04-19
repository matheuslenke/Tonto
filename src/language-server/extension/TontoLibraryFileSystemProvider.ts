import * as vscode from "vscode";
import { basicDataTypes } from "../workspace/builtins/basicDataTypes";

export class TontoLibraryFileSystemProvider
  implements vscode.FileSystemProvider
{
  context: vscode.ExtensionContext;
  basicDataTypes: string;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.basicDataTypes = basicDataTypes;
  }

  static register(context: vscode.ExtensionContext) {
    context.subscriptions.push(
      vscode.workspace.registerFileSystemProvider(
        "builtin",
        new TontoLibraryFileSystemProvider(context),
        {
          isReadonly: true,
          isCaseSensitive: false,
        }
      )
    );
  }

  stat(_: vscode.Uri): vscode.FileStat {
    const date = Date.now();
    return {
      ctime: date,
      mtime: date,
      size: this.basicDataTypes.length,
      type: vscode.FileType.File,
    };
  }

  readFile(_: vscode.Uri): Uint8Array {
    // We could return different libraries based on the URI
    // We have only one, so we always return the same
    return new Uint8Array(Buffer.from(this.basicDataTypes));
  }

  // The following class members only serve to satisfy the interface

  private readonly didChangeFile = new vscode.EventEmitter<
    vscode.FileChangeEvent[]
  >();
  onDidChangeFile = this.didChangeFile.event;

  watch() {
    return {
      dispose: () => {
        console.log("Disposed");
      },
    };
  }

  readDirectory(): [] {
    throw vscode.FileSystemError.NoPermissions();
  }

  createDirectory() {
    throw vscode.FileSystemError.NoPermissions();
  }

  writeFile() {
    throw vscode.FileSystemError.NoPermissions();
  }

  delete() {
    throw vscode.FileSystemError.NoPermissions();
  }

  rename() {
    throw vscode.FileSystemError.NoPermissions();
  }
}
