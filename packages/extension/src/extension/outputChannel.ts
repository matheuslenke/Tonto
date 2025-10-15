import * as vscode from 'vscode';

let channel: vscode.OutputChannel | undefined;

export function getOutputChannel(): vscode.OutputChannel {
    if (!channel) {
        channel = vscode.window.createOutputChannel('Tonto');
    }
    return channel;
}

export function setOutputChannel(ch: vscode.OutputChannel): void {
    channel = ch;
}
