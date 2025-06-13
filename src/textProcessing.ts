import * as vscode from "vscode";

export function toggleCheckmark(editor: vscode.TextEditor) {
  const document = editor.document;
  const selection = editor.selection;

  // Get the line where the cursor or selection is
  const line = document.lineAt(selection.active.line);
  const text = line.text;

  // Define simple ordered replacements
  const replacements: [string, string][] = [
    ['[x]', '[ ]'],
    ['[]', '[x]'],
    ['[ ]', '[x]'],
  ];

  let newText = text;
  let found = false;

  for (const [from, to] of replacements) {
    const idx = newText.indexOf(from);
    if (idx !== -1) {
      const range = new vscode.Range(
        line.lineNumber,
        idx,
        line.lineNumber,
        idx + from.length
      );
      editor.edit(editBuilder => {
        editBuilder.replace(range, to);
      });
      found = true;
      break; // only replace the first match
    }
  }

  if (!found) {
    vscode.window.showInformationMessage('No checkmark found in this line.');
  }
}
