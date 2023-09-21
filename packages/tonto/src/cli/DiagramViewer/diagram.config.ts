import { Uri } from "vscode";

export const setHTML = (nomnomlContent: string, domToImgUri: Uri, jsUri: Uri, cssUri: Uri, csp: string, title: string) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="${cssUri}">
    <meta
        http-equiv="Content-Security-Policy"
        content="default-src 'none'; img-src data: vscode-webview: ; script-src ${csp}; style-src ${csp};"
    />
</head>
<body>
    <div class="content">
        ${nomnomlContent}
    </div>

    <div class="download">
        <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM216 232V334.1l31-31c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-72 72c-9.4 9.4-24.6 9.4-33.9 0l-72-72c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l31 31V232c0-13.3 10.7-24 24-24s24 10.7 24 24z"/></svg>
    </div>

    <script src="${domToImgUri}"></script>
    <script src="${jsUri}"></script>
</body>
</html>
`
}