import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export async function goBuildFile(editor: vscode.TextEditor) {
    if (!editor) {
        vscode.window.showWarningMessage('No active editor found.');
        return;
    }

    const currentFilePath = editor.document.uri.fsPath;
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showWarningMessage('No workspace is open.');
        return;
    }

    const workspaceRoot = workspaceFolders[0].uri.fsPath;
    let dir = path.dirname(currentFilePath);

    while (dir.startsWith(workspaceRoot)) {
        const buildFilePath = path.join(dir, 'BUILD');
        if (fs.existsSync(buildFilePath)) {
            const document = await vscode.workspace.openTextDocument(buildFilePath);
            await vscode.window.showTextDocument(document);
            return;
        }
        const parentDir = path.dirname(dir);
        if (parentDir === dir) break;
        dir = parentDir;
    }

    vscode.window.showWarningMessage('No BUILD file found in the search path.');
}

export async function toggleHeaderAndSourceFile(editor: vscode.TextEditor) {
    if (!editor) {
        vscode.window.showWarningMessage('No active editor found.');
        return;
    }

    const currentFilePath = editor.document.uri.fsPath;
    const currentDir = path.dirname(currentFilePath);
    const fileExt = path.extname(currentFilePath);
    const fileNameWithoutExt = path.basename(currentFilePath, fileExt);

    const headerExtensions = ['.h', '.hpp'];
    const sourceExtensions = ['.c', '.cc'];

    let targetExtensions: string[] = [];
    if (headerExtensions.includes(fileExt)) {
        targetExtensions = sourceExtensions;
    } else if (sourceExtensions.includes(fileExt)) {
        targetExtensions = headerExtensions;
    } else {
        vscode.window.showWarningMessage('Not a recognized C/C++ source or header file.');
        return;
    }

    const parentDir = path.dirname(currentDir);
    const siblingDirs = parentDir !== currentDir ? fs.readdirSync(parentDir)
        .map(dir => path.join(parentDir, dir))
        .filter(dir => fs.statSync(dir).isDirectory()) : [];

    // Prioritize current directory first
    const searchDirs = [currentDir, ...siblingDirs];

    for (const dir of searchDirs) {
        for (const ext of targetExtensions) {
            const candidatePath = path.join(dir, fileNameWithoutExt + ext);
            if (fs.existsSync(candidatePath)) {
                const document = await vscode.workspace.openTextDocument(candidatePath);
                await vscode.window.showTextDocument(document);
                return;
            }
        }
    }

    vscode.window.showWarningMessage('No corresponding file found.');
}