// @ts-check

/**
 * @file extension.js
 * @description VS Code extension that appends selected files' content to the clipboard context or resets it.
 */

const vscode = require('vscode');
const fs = require('fs');

/**
 * Append selected files' content to the current clipboard.
 * @param {vscode.Uri|vscode.Uri[]} args
 * @returns {Promise<void>}
 */
async function appendContext(args) {
    // Retour anticipé si pas d'arguments
    if (!args) return;
    const uris = Array.isArray(args) ? args : [args];
    if (uris.length === 0) return; // Retour anticipé si aucun fichier

    // Lire le presse-papiers actuel
    const oldContent = await vscode.env.clipboard.readText();

    // Construire le nouveau contenu
    let parts = [];
    for (const uri of uris) {
        const filePath = vscode.workspace.asRelativePath(uri.fsPath);
        const fileData = await vscode.workspace.fs.readFile(uri);
        const fileContent = fileData.toString();
        // Utiliser une expression régulière pour supprimer les retours à la ligne en début et fin
        const trimmedContent = fileContent.replace(/^(\r\n|\n|\r)+|(\r\n|\n|\r)+$/g, '');

        parts.push(`${filePath} :\n"""\n${trimmedContent}\n"""`);

    }

    const newContent = parts.join('\n\n');
    const finalContent = oldContent
        ? `${oldContent}\n\n${newContent}`
        : newContent;

    // Ecrire dans le presse-papiers
    await vscode.env.clipboard.writeText(finalContent);
}

/**
 * Reset the clipboard context.
 * @returns {Promise<void>}
 */
async function resetContext() {
    // Réinitialise complètement le contexte
    await vscode.env.clipboard.writeText('');
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    const disposableAdd = vscode.commands.registerCommand('contextify.extract', appendContext);
    const disposableReset = vscode.commands.registerCommand('contextify.reset', resetContext);
    context.subscriptions.push(disposableAdd, disposableReset);
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
};
