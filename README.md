## Resolving merge conflicts

My usual workflow for resolving git conflicts is to edit the conflicted file directly. I might manually update the "current" block with the changes from the "incoming" block. Then I will simply delete the "incoming" block. In contrast, the VSCode git conflict viewer is read only, so it does not allow this workflow.

This VSCode extension adds several commands to make it easy to accept/reject either or both sides of a conflict region. The commands are designed to be connected to spoken activation phrases in Talon, with a cursorless target specified to indicate the conflict region and the side to accept/reject.


```
# cursorless.talon

(except | accept) <user.cursorless_target>:
    user.cursorless_vscode_command(
        "abraham_talon_vscode.acceptConflictSide",
        cursorless_target
    )

reject <user.cursorless_target>:
    user.cursorless_vscode_command(
        "abraham_talon_vscode.rejectConflictSide",
        cursorless_target
    )

(except | accept) both <user.cursorless_target>:
    user.cursorless_vscode_command(
        "abraham_talon_vscode.acceptBothSides",
        cursorless_target
    )

reject both <user.cursorless_target>:
    user.cursorless_vscode_command(
        "abraham_talon_vscode.rejectBothSides",
        cursorless_target
    )
```

```
# vscode.talon

go conflict:
    user.vscode("abraham_talon_vscode.gotoNextConflict")
```

## File jumping

```
# vscode.talon

# Jump to the nearest BUILD file in the current directory or above
go build:
    user.vscode("abraham_talon_vscode.goBuildFile")

# If we are currently viewing a C/C++ implementation file, jump header file (and vice versa).
go sister:
    user.vscode("abraham_talon_vscode.toggleHeaderAndSourceFile")
```

## Development
Open Command Palette (Cmd-Shift-P or View > Command Palette), and open `Debug: Start Debugging`.

## Manual Installation
1. `vsce package`
2. `code --install-extension conflict-resolver-0.0.1.vsix`
