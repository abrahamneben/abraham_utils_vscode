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
    })


  );
}

export function deactivate() {}
