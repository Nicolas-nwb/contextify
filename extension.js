// @ts-check

/**
 * @file extension.js
 * @description VS Code extension that appends selected files' content to the clipboard context or resets it.
 */

/**
 * @param {import('vscode').Uri|import('vscode').Uri[]} args
 * @returns {Promise<void>}
 * Ajoute le contenu des fichiers sélectionnés au presse-papiers.
 */
async function appendContext(args) {
    const vscode = require('vscode');
    if (!args) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;
        args = editor.document.uri;
    }

    const uris = Array.isArray(args) ? args : [args];
    if (uris.length === 0) return;

    const oldContent = await vscode.env.clipboard.readText();

    let parts = [];
    for (const uri of uris) {
        // Forcer le second paramètre à false pour éviter l'inclusion du nom de l'espace de travail
        const filePath = vscode.workspace.asRelativePath(uri.fsPath, false);
        const fileData = await vscode.workspace.fs.readFile(uri);
        const fileContent = fileData.toString();
        const trimmedContent = fileContent.replace(/^(\r\n|\n|\r)+|(\r\n|\n|\r)+$/g, '');
        parts.push(`${filePath}: """\n${trimmedContent}\n"""`);
    }

    const newContent = parts.join('\n\n');
    const finalContent = oldContent ? `${oldContent}\n\n${newContent}` : newContent;
    await vscode.env.clipboard.writeText(finalContent);
}

/**
 * @returns {Promise<void>}
 * Réinitialise le presse-papiers.
 */
async function resetContext() {
    const vscode = require('vscode');
    await vscode.env.clipboard.writeText('');
}

/**
 * @param {import('vscode').ExtensionContext} context
 * Initialise l'extension.
 */
function activate(context) {
    const vscode = require('vscode');
    const disposableAdd = vscode.commands.registerCommand('contextify.extract', appendContext);
    const disposableReset = vscode.commands.registerCommand('contextify.reset', resetContext);
    context.subscriptions.push(disposableAdd, disposableReset);
}

/**
 * Désactive l'extension.
 */
function deactivate() { }

module.exports = {
    activate,
    deactivate
};