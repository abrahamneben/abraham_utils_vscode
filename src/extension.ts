import * as vscode from 'vscode';
import {
  getConflictBlock,
  acceptOrRejectConflictSide,
  acceptBothConflictSides,
  rejectBothConflictSides,
  navigateToNextConflict } from './conflictUtils';

export function activate(
  context: vscode.ExtensionContext) {
  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('merge_resolver.acceptConflictSide', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const selection = editor.selection;
      const conflictBlock = getConflictBlock(editor.document, selection.start);

      if (conflictBlock && !editor.selection.isEmpty) {
        acceptOrRejectConflictSide(editor, conflictBlock, selection, true);
      }

    }),

    vscode.commands.registerCommand('merge_resolver.rejectConflictSide', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const selection = editor.selection;
      const conflictBlock = getConflictBlock(editor.document, selection.start);

      if (conflictBlock && !editor.selection.isEmpty) {
        acceptOrRejectConflictSide(editor, conflictBlock, selection, false);
      }
    }),

    vscode.commands.registerCommand('merge_resolver.acceptBothSides', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const selection = editor.selection;
      const conflictBlock = getConflictBlock(editor.document, selection.start);

      if (conflictBlock && !editor.selection.isEmpty) {
        acceptBothConflictSides(editor, conflictBlock);
      }
    }),

    vscode.commands.registerCommand('merge_resolver.rejectBothSides', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const selection = editor.selection;
      const conflictBlock = getConflictBlock(editor.document, selection.start);

      if (conflictBlock && !editor.selection.isEmpty) {
        rejectBothConflictSides(editor, conflictBlock);
      }
    }),

    vscode.commands.registerCommand('merge_resolver.navigateToNextConflict', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      navigateToNextConflict(editor);
    })
  );
}

export function deactivate() {}
