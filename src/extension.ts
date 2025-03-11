import * as vscode from 'vscode';



// Define the ConflictBlock type
interface ConflictBlock {
    startLine: number;
    endLine: number;
    side: 'current' | 'incoming';  // side of the conflict
    current: string;               // the current side of the conflict
    incoming: string;              // the incoming side of the conflict
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Abraham Extension activated!');

    // Command to accept the conflict side containing the selection
    let acceptConflictSide = vscode.commands.registerCommand('merge-resolver.acceptConflictSide', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const selection = editor.selection;
        const document = editor.document;
        const conflictBlock = findConflictBlock(document, selection);
        if (conflictBlock) {
            const { startLine, endLine, side } = conflictBlock;
            const newText = side === 'current' ? conflictBlock.current : conflictBlock.incoming;
            editor.edit(editBuilder => {
                editBuilder.replace(new vscode.Range(startLine, 0, endLine, document.lineAt(endLine).text.length), newText);
            });
        }
    });

    // Command to accept both sides of the conflict
    let acceptBothSides = vscode.commands.registerCommand('merge-resolver.acceptBothSides', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const selection = editor.selection;
        const document = editor.document;
        const conflictBlock = findConflictBlock(document, selection);
        if (conflictBlock) {
            const mergedText = conflictBlock.current + "\n" + conflictBlock.incoming;
            editor.edit(editBuilder => {
                editBuilder.replace(new vscode.Range(conflictBlock.startLine, 0, conflictBlock.endLine, document.lineAt(conflictBlock.endLine).text.length), mergedText);
            });
        }
    });

    // Command to accept neither side of the conflict
    let acceptNeitherSide = vscode.commands.registerCommand('merge-resolver.acceptNeitherSide', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const selection = editor.selection;
        const document = editor.document;
        const conflictBlock = findConflictBlock(document, selection);
        if (conflictBlock) {
            editor.edit(editBuilder => {
                editBuilder.delete(new vscode.Range(conflictBlock.startLine, 0, conflictBlock.endLine, document.lineAt(conflictBlock.endLine).text.length));
            });
        }
    });

    // Command to navigate to the next conflict
    let gotoNextConflict = vscode.commands.registerCommand('merge-resolver.gotoNextConflict', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const document = editor.document;
        const conflicts = findConflictsInDocument(document);
        const currentConflict = findConflictBlock(document, editor.selection);

        // Use the next conflict logic, and ensure it's type-safe
        const nextConflict = findNextConflict(conflicts, currentConflict);

        if (nextConflict) {
            editor.selection = new vscode.Selection(nextConflict.startLine, 0, nextConflict.startLine, 0);
            editor.revealRange(new vscode.Range(nextConflict.startLine, 0, nextConflict.startLine, 0), vscode.TextEditorRevealType.InCenter);
        }
    });

    context.subscriptions.push(acceptConflictSide, acceptBothSides, acceptNeitherSide, gotoNextConflict);
}

export function deactivate() {}

// Function to find the conflict block surrounding the selection
function findConflictBlock(document: vscode.TextDocument, selection: vscode.Selection): ConflictBlock | undefined {
    const startLine = selection.start.line;
    const endLine = selection.end.line;

    // Simple example condition (you need to replace this with actual conflict detection logic)
    if (startLine < 10 && endLine > 5) {  // Replace with your conflict detection logic
        return {
            startLine: 5,       // The starting line of the conflict
            endLine: 10,        // The ending line of the conflict
            side: 'current',    // Which side of the conflict to preserve ('current' or 'incoming')
            current: 'Current version text here...',  // The current side text of the conflict
            incoming: 'Incoming version text here...' // The incoming side text of the conflict
        };
    }

    return undefined; // Return undefined if no conflict is found
}

// Function to find all conflicts in the document
function findConflictsInDocument(document: vscode.TextDocument): ConflictBlock[] {
    // Implement the logic to find all conflicts in the document and return them as an array
    return [];
}

// Function to find the next conflict block in the document
function findNextConflict(conflicts: ConflictBlock[], currentConflict: ConflictBlock | undefined): ConflictBlock | undefined {
    if (!currentConflict) return undefined;

    const currentIndex = conflicts.findIndex(conflict => conflict.startLine === currentConflict.startLine);
    if (currentIndex === -1 || currentIndex + 1 >= conflicts.length) {
        return undefined;
    }

    return conflicts[currentIndex + 1];
}
