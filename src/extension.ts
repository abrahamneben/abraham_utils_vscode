import * as vscode from 'vscode';
import {
  getConflictBlock,
  acceptOrRejectConflictSide,
  acceptBothConflictSides,
  rejectBothConflictSides,
  goNextConflict
} from './conflictUtils';
import {
  goBuildFile,
  toggleHeaderAndSourceFile
} from './workspaceNavigator';

export function activate(
  context: vscode.ExtensionContext) {
  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('abraham_talon_vscode.acceptConflictSide', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const selection = editor.selection;
      const conflictBlock = getConflictBlock(editor.document, selection.start);

      if (conflictBlock && !editor.selection.isEmpty) {
        acceptOrRejectConflictSide(editor, conflictBlock, selection, true);
      }

    }),

    vscode.commands.registerCommand('abraham_talon_vscode.rejectConflictSide', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const selection = editor.selection;
      const conflictBlock = getConflictBlock(editor.document, selection.start);

      if (conflictBlock && !editor.selection.isEmpty) {
        acceptOrRejectConflictSide(editor, conflictBlock, selection, false);
      }
    }),

    vscode.commands.registerCommand('abraham_talon_vscode.acceptBothSides', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const selection = editor.selection;
      const conflictBlock = getConflictBlock(editor.document, selection.start);

      if (conflictBlock && !editor.selection.isEmpty) {
        acceptBothConflictSides(editor, conflictBlock);
      }
    }),

    vscode.commands.registerCommand('abraham_talon_vscode.rejectBothSides', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const selection = editor.selection;
      const conflictBlock = getConflictBlock(editor.document, selection.start);

      if (conflictBlock && !editor.selection.isEmpty) {
        rejectBothConflictSides(editor, conflictBlock);
      }
    }),

    vscode.commands.registerCommand('abraham_talon_vscode.goNextConflict', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      goNextConflict(editor);
    }),

    vscode.commands.registerCommand('abraham_talon_vscode.goBuildFile', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      goBuildFile(editor);
    }),

    vscode.commands.registerCommand('abraham_talon_vscode.toggleHeaderAndSourceFile', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      toggleHeaderAndSourceFile(editor);
    })


  );
}

export function deactivate() {}
