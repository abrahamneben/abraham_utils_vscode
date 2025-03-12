## Intent

My usual workflow for resolving git conflicts is to edit the conflicted file directly. I might manually update the "current" block with the changes from the "incoming" block. Then I will simply delete the "incoming" block. In contrast, the VSCode git conflict viewer is read only, so it does not allow this workflow.

This VSCode extension adds several commands to make it easy to accept/reject either or both sides of a conflict region. The commands are designed to be connected to spoken activation phrases in Talon, with a cursorless target specified to indicate the conflict region and the side to accept/reject.

## Demo



## Talon rules

Add to `cursorless.talon`
```
(except | accept) <user.cursorless_target>:
    user.cursorless_vscode_command("merge_resolver.acceptConflictSide", cursorless_target)

reject <user.cursorless_target>:
    user.cursorless_vscode_command("merge_resolver.rejectConflictSide", cursorless_target)

(except | accept) both <user.cursorless_target>:
    user.cursorless_vscode_command("merge_resolver.acceptBothSides", cursorless_target)

reject both <user.cursorless_target>:
    user.cursorless_vscode_command("merge_resolver.rejectBothSides", cursorless_target)
```

## Development
Open Command Palette (Cmd-Shift-P or View > Command Palette), and open `Debug: Start Debugging`.

## Manual Installation
1. `vsce package`
2. `code --install-extension merge-resolver-0.0.1.vsix`
