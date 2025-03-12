import * as vscode from 'vscode';
import * as path from 'path';

const simpleGit = require('simple-git');

const CONFLICT_START_PATTERN = /^<<<<<<<\s*(.*)$/;
const CONFLICT_DIVIDER_PATTERN = /^=======\s*(.*)$/;
const CONFLICT_END_PATTERN = /^>>>>>>>\s*(.*)$/;
const CONFLICT_ANY_PATTERN = /^(<<<<<<<|=======|>>>>>>>)\s*(.*)$/m;

type ConflictBlock = {
  start: number;
  divider: number;
  end: number;
};


export function getConflictBlock(document: vscode.TextDocument, position: vscode.Position) {
  // Line numbers
  const selectionline = position.line;
  let conflictStart: number | null = null;
  let conflictDivider: number | null = null;
  let conflictEnd: number | null = null;

  // Find conflict start
  for (let i = selectionline; i >= 0; i--) {
    const lineText = document.lineAt(i).text;
    if (CONFLICT_START_PATTERN.test(lineText)) {
      conflictStart = i;
      break;
    }
  }

  if (conflictStart === null) {
    return null;
  }

  // Find conflict end
  for (let i = selectionline; i < document.lineCount; i++) {
    const lineText = document.lineAt(i).text;
    if (CONFLICT_END_PATTERN.test(lineText)) {
      conflictEnd = i;
      break;
    }
  }

  if (conflictEnd === null) {
    return null;
  }

  // Find conflict divider
  for (let i = conflictStart; i <= conflictEnd; i++) {
    const lineText = document.lineAt(i).text;
    if (CONFLICT_DIVIDER_PATTERN.test(lineText)) {
      conflictDivider = i;
      break;
    }
  }

  if (conflictDivider === null) {
    return null;
  }

  let isValid = (conflictStart < conflictDivider) && (conflictDivider < conflictEnd);
  if (!isValid) {
    return null;
  }

  return { start: conflictStart, divider: conflictDivider, end: conflictEnd };
}

export function acceptOrRejectConflictSide(
  editor: vscode.TextEditor,
  conflictBlock: ConflictBlock,
  selection: vscode.Selection | null,
  shouldAccept: boolean = true) {

  let conflictStart = conflictBlock.start;
  let conflictDivider = conflictBlock.divider;
  let conflictEnd = conflictBlock.end;

  const document = editor.document;
  const edit = new vscode.WorkspaceEdit();




  if (selection) {

    let selectionStart = selection.start.line;
    let selectionEnd = selection.end.line;

    let choseCurrentBlock = (conflictStart <= selectionStart) && (selectionEnd < conflictDivider)
    let choseIncomingBlock = (conflictDivider < selectionStart) && (selectionEnd <= conflictEnd)

    // Keep current block
    if ((choseCurrentBlock && shouldAccept) || (choseIncomingBlock && !shouldAccept)) {

      edit.delete(
        document.uri,
        new vscode.Range(
          new vscode.Position(conflictDivider, 0),
          new vscode.Position(conflictEnd + 1, 0)
        )
      );

      edit.delete(
        document.uri,
        new vscode.Range(
          new vscode.Position(conflictStart, 0),
          new vscode.Position(conflictStart + 1, 0)
        )
      );

      vscode.workspace.applyEdit(edit);
      return;
    }

    // Keep incoming block
    if ((choseIncomingBlock && shouldAccept) || (choseCurrentBlock && !shouldAccept)) {

      edit.delete(
        document.uri,
        new vscode.Range(
          new vscode.Position(conflictStart, 0),
          new vscode.Position(conflictDivider + 1, 0)
        )
      );

      edit.delete(
        document.uri,
        new vscode.Range(
          new vscode.Position(conflictEnd, 0),
          new vscode.Position(conflictEnd + 1, 0)
        )
      );

      vscode.workspace.applyEdit(edit);
      return;
    }
  }

  vscode.window.showWarningMessage("Invalid selection.")

}

export function acceptBothConflictSides(
  editor: vscode.TextEditor,
  conflictBlock: ConflictBlock) {

  let conflictStart = conflictBlock.start;
  let conflictDivider = conflictBlock.divider;
  let conflictEnd = conflictBlock.end;

  const document = editor.document;
  const edit = new vscode.WorkspaceEdit();

  edit.delete(
    document.uri,
    new vscode.Range(
      new vscode.Position(conflictEnd, 0),
      new vscode.Position(conflictEnd + 1, 0)
    )
  );

  edit.delete(
    document.uri,
    new vscode.Range(
      new vscode.Position(conflictDivider, 0),
      new vscode.Position(conflictDivider + 1, 0)
    )
  );

  edit.delete(
    document.uri,
    new vscode.Range(
      new vscode.Position(conflictStart, 0),
      new vscode.Position(conflictStart + 1, 0)
    )
  );

  vscode.workspace.applyEdit(edit);

}

export function rejectBothConflictSides(
  editor: vscode.TextEditor,
  conflictBlock: ConflictBlock) {

  let conflictStart = conflictBlock.start;
  let conflictDivider = conflictBlock.divider;
  let conflictEnd = conflictBlock.end;

  const document = editor.document;
  const edit = new vscode.WorkspaceEdit();

  edit.delete(
    document.uri,
    new vscode.Range(
      new vscode.Position(conflictStart, 0),
      new vscode.Position(conflictEnd + 1, 0)
    )
  );

  vscode.workspace.applyEdit(edit);

}


export async function goNextConflict(editor: vscode.TextEditor) {
  try {

    const workspaceFolder = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : null;

    if (!workspaceFolder) {
      vscode.window.showErrorMessage('No workspace folder open.');
      return;
    }

    const git = simpleGit(workspaceFolder)
    const status = await git.status();
    const conflictedFiles = status.conflicted;

    // If there are no conflicted files, show a message and return
    if (conflictedFiles.length === 0) {
      vscode.window.showInformationMessage("No conflicts found.");
      return;
    }

      // Open the first conflicted file
      const filePath = path.join(workspaceFolder, conflictedFiles[0]);
      await openFileAndScrollToConflict(filePath);
    } catch (error) {
      vscode.window.showErrorMessage("Error finding conflicts.");
      console.error(error);
    }
  }

async function openFileAndScrollToConflict(filePath: string) {
  try {
    // Open the conflicted file
    const uri = vscode.Uri.file(filePath);
    const document = await vscode.workspace.openTextDocument(uri);
    const editor = await vscode.window.showTextDocument(document);

    // Find the first conflict marker in the file
    const text = document.getText();
    const match = text.match(CONFLICT_ANY_PATTERN);

    if (match) {

      // Get the position of the conflict marker
      const position = document.positionAt(text.indexOf(match[0]));
      const range = new vscode.Range(position, position);

      // Set the selection to the conflict marker
      editor.selection = new vscode.Selection(range.start, range.end);

      // Scroll to the conflict marker (center it in the editor window)
      editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
    } else {
      vscode.window.showInformationMessage("No conflict markers found in the file.");
    }
  } catch (error) {
    vscode.window.showErrorMessage("Error opening file or finding conflict.");
    console.error(error);
  }
}
