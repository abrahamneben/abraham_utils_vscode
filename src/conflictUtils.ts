import * as vscode from "vscode";
import { execSync } from "child_process";

const CONFLICT_START_PATTERN = /^<<<<<<<\s*(.*)$/;
const CONFLICT_DIVIDER_PATTERN = /^=======$/;
const CONFLICT_END_PATTERN = /^>>>>>>>\s*(.*)$/;
const CONFLICT_ANY_PATTERN = "^(<{7} |={7}$|>{7} )";

type ConflictBlock = {
  start: number;
  divider: number;
  end: number;
};

export function getConflictBlock(
  document: vscode.TextDocument,
  position: vscode.Position
) {
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

  let isValid =
    conflictStart < conflictDivider && conflictDivider < conflictEnd;
  if (!isValid) {
    return null;
  }

  return { start: conflictStart, divider: conflictDivider, end: conflictEnd };
}

export function acceptOrRejectConflictSide(
  editor: vscode.TextEditor,
  conflictBlock: ConflictBlock,
  selection: vscode.Selection | null,
  shouldAccept: boolean = true
) {
  let conflictStart = conflictBlock.start;
  let conflictDivider = conflictBlock.divider;
  let conflictEnd = conflictBlock.end;

  const document = editor.document;
  const edit = new vscode.WorkspaceEdit();

  if (selection) {
    let selectionStart = selection.start.line;
    let selectionEnd = selection.end.line;

    let choseCurrentBlock =
      conflictStart <= selectionStart && selectionEnd < conflictDivider;
    let choseIncomingBlock =
      conflictDivider < selectionStart && selectionEnd <= conflictEnd;

    // Keep current block
    if (
      (choseCurrentBlock && shouldAccept) ||
      (choseIncomingBlock && !shouldAccept)
    ) {
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
    if (
      (choseIncomingBlock && shouldAccept) ||
      (choseCurrentBlock && !shouldAccept)
    ) {
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

  vscode.window.showWarningMessage("Invalid selection.");
}

export function acceptBothConflictSides(
  editor: vscode.TextEditor,
  conflictBlock: ConflictBlock
) {
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
  conflictBlock: ConflictBlock
) {
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
  const workspaceFolder = vscode.workspace.workspaceFolders
    ? vscode.workspace.workspaceFolders[0].uri.fsPath
    : null;

  if (!workspaceFolder) {
    vscode.window.showErrorMessage("No workspace folder open.");
    return;
  }

  const gitExtension = vscode.extensions.getExtension("vscode.git");

  if (!gitExtension || !gitExtension.isActive) {
    vscode.window.showErrorMessage("Git extension is not available");
    return;
  }

  const git = gitExtension.exports.getAPI(1);

  // Get the current repository
  const repos = git.repositories;
  if (!repos || repos.length === 0) {
    vscode.window.showErrorMessage("No Git repository found");
    return;
  }

  const repo = repos[0];

  try {
    // Use the Git extension's internal API to run commands
    // This is more reliable than trying to call exec directly
    const result = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Searching with git grep...",
        cancellable: false,
      },
      async () => {
        return execSync(`git grep -n -E "${CONFLICT_ANY_PATTERN}" | head -1`, {
          cwd: workspaceFolder,
          encoding: "utf-8",
        });
      }
    );

    if (!result || !result.trim()) {
      vscode.window.showInformationMessage(
        "No conflict markers found in the workspace."
      );
      return;
    }

    // Parse the first result - format is "filename:line:content"
    const lines = result.split("\n");
    const firstMatch = lines[0].split(":");

    if (firstMatch.length < 2) {
      return;
    }

    const filePath = firstMatch[0];
    const lineNumber = parseInt(firstMatch[1], 10) - 1; // VSCode uses 0-based line numbers

    console.log(filePath, lineNumber);

    // Open the file at the specified line
    const uri = vscode.Uri.file(`${repo.rootUri.fsPath}/${filePath}`);
    const document = await vscode.workspace.openTextDocument(uri);

    console.log("opening ", `${repo.rootUri.fsPath}/${filePath}`);

    await vscode.window.showTextDocument(document, {
      selection: new vscode.Selection(lineNumber, 0, lineNumber, 0),
      preview: true,
    });
  } catch (error) {
    vscode.window.showErrorMessage("Error finding conflicts.");
    console.error(error);
  }
}
