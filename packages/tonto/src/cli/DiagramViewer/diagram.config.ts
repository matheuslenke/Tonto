import { Uri } from "vscode";

export const setHTML = (nomnomlContent: string, jsUri: Uri, cssUri: Uri) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Diagram</title>
    <link rel="stylesheet" href="${cssUri}">
</head>
<body>
    <div class="content">
        ${nomnomlContent}
    </div>
    <script src="${jsUri}"></scripttype=>
</body>
</html>
`
}