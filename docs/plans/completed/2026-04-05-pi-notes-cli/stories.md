# Stories: pi-notes CLI Surface

## Story 1 — Show a global note deterministically

As a user, I can run `pi-notes show npm --global` and reliably get the note content,
so I don’t need to know internal file paths.

### Acceptance criteria

- Command resolves global scope path correctly.
- Returns note content to stdout.
- Errors clearly if note does not exist.

## Story 2 — Update note content safely

As a user, I can append/update a note through CLI commands,
so I can automate note maintenance with deterministic behavior.

### Acceptance criteria

- Update command modifies only target note.
- Returns success output with resolved scope/path.
- Rejects unsafe note names/paths.

## Story 3 — Destructive actions are confirm-gated

As a user, deleting a note requires confirmation unless explicitly forced,
so accidental data loss is minimized.

### Acceptance criteria

- `rm` prompts for confirmation in interactive mode.
- non-interactive mode without force exits safely with clear error.
- force mode (`--yes`/`--force`, final flag choice TBD) works predictably.

## Story 4 — Scope conflict handling

As a user, if I pass both `--global` and `--project`,
I get a clear error and no action is taken.

### Acceptance criteria

- conflict detected before mutation.
- exit code non-zero with actionable message.

## Story 5 — Consistent behavior with extension commands

As a maintainer, CLI and `/notes` commands share core logic,
so behavior remains consistent across interfaces.

### Acceptance criteria

- common service layer is used for note operations.
- test coverage protects shared semantics.
