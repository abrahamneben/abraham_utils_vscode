import * as vscode from 'vscode';

const CONFLICT_START_PATTERN = /^<<<<<<<\s*(.*)$/;
const CONFLICT_DIVIDER_PATTERN = /^=======\s*(.*)$/;
const CONFLICT_END_PATTERN = /^>>>>>>>\s*(.*)$/;
const CONFLICT_ANY_PATTERN = /^(<<<<<<<|=======|>>>>>>>)\s*(.*)$/;

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
    console.log(selection.start.line,selection.end.line);

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




export function navigateToNextConflict(editor: vscode.TextEditor) {
  // Find next conflict and move to it
  const document = editor.document;
  for (let i = editor.selection.active.line + 1; i < document.lineCount; i++) {
    if (CONFLICT_ANY_PATTERN.test(document.lineAt(i).text)) {
      editor.selection = new vscode.Selection(i, 0, i, 0);
      break;
    }
  }
}
