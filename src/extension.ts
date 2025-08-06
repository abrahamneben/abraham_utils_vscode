import * as vscode from 'vscode';
import {
  getConflictBlock,
  acceptOrRejectConflictSide,
  acceptBothConflictSides,
  rejectBothConflictSides,
  goNextConflict
} from './conflictUtils';
import {
  toggleCheckmark
} from './textProcessing';
import {
  goBuildFile,
  toggleHeaderAndSourceFile
} from './workspaceNavigator';

export function activate(
  context: vscode.ExtensionContext) {

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('abraham_utils.acceptConflictSide', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const selection = editor.selection;
      const conflictBlock = getConflictBlock(editor.document, selection.start);

      if (conflictBlock && !editor.selection.isEmpty) {
        acceptOrRejectConflictSide(editor, conflictBlock, selection, true);
      }

    }),

    vscode.commands.registerCommand('abraham_utils.rejectConflictSide', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const selection = editor.selection;
      const conflictBlock = getConflictBlock(editor.document, selection.start);

      if (conflictBlock && !editor.selection.isEmpty) {
        acceptOrRejectConflictSide(editor, conflictBlock, selection, false);
      }
    }),

    vscode.commands.registerCommand('abraham_utils.acceptBothSides', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const selection = editor.selection;
      const conflictBlock = getConflictBlock(editor.document, selection.start);

      if (conflictBlock && !editor.selection.isEmpty) {
        acceptBothConflictSides(editor, conflictBlock);
      }
    }),

    vscode.commands.registerCommand('abraham_utils.rejectBothSides', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const selection = editor.selection;
      const conflictBlock = getConflictBlock(editor.document, selection.start);

      if (conflictBlock && !editor.selection.isEmpty) {
        rejectBothConflictSides(editor, conflictBlock);
      }
    }),

    vscode.commands.registerCommand('abraham_utils.goNextConflict', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      goNextConflict(editor);
    }),

    vscode.commands.registerCommand('abraham_utils.goBuildFile', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      goBuildFile(editor);
    }),

    vscode.commands.registerCommand('abraham_utils.toggleHeaderAndSourceFile', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      toggleHeaderAndSourceFile(editor);
    }),

    vscode.commands.registerCommand('abraham_utils.toggleCheckmark', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      toggleCheckmark(editor);
    }),

  // Command to open active notebook as text editor
    vscode.commands.registerCommand('extension.openNotebookAsText', async () => {
      const notebookEditor = vscode.window.activeNotebookEditor;
      if (!notebookEditor) {
        vscode.window.showErrorMessage('No active notebook editor found.');
        return;
      }

      const notebookUri = notebookEditor.notebook.uri;

      try {
        await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
        const textDoc = await vscode.workspace.openTextDocument(notebookUri);
        await vscode.window.showTextDocument(textDoc, { preview: false });
      } catch (err) {
        vscode.window.showErrorMessage(`Failed to open notebook as text: ${err}`);
      }
    }),

    vscode.commands.registerCommand('extension.openTextAsNotebook', async () => {
      const textEditor = vscode.window.activeTextEditor;
      if (!textEditor) {
        vscode.window.showErrorMessage('No active text editor found.');
        return;
      }

      const notebookUri = textEditor.document.uri;

    try {
      await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
      await vscode.commands.executeCommand('vscode.openWith', notebookUri, 'jupyter-notebook', vscode.ViewColumn.Active);
    }
    catch (err){
      vscode.window.showErrorMessage(`Failed to open text as notebook: ${err}`);
    }
    }),

  vscode.commands.registerCommand('extension.openTerminalHere', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor');
      return;
    }

    const fileUri = editor.document.uri;
    if (fileUri.scheme !== 'file') {
      vscode.window.showErrorMessage('File is not on disk');
      return;
    }

    const filePath = fileUri.fsPath;
    const dirPath = require('path').dirname(filePath);

    // Create a new terminal with cwd set to the directory of the active file
    const terminal = vscode.window.createTerminal({ cwd: dirPath, name: `Terminal: ${dirPath}` });
    terminal.show();
  })


  );
}

export function deactivate() {}
