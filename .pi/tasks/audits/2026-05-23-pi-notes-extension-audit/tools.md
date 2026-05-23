# Tool contract findings

## Finding 1: notes tools return normal tool results for command errors

### Affected paths

- `src/index.ts`
- `src/commands/notes.ts`
- `tests/tools.test.ts`

### Observed behavior

`handleParsedNotesCommand()` catches domain `NotesError` values and emits an error notification through `ctx.ui.notify(..., "error")` instead of throwing.

The custom tool adapter in `src/index.ts` captures those notifications and returns a normal tool result:

```ts
const ok = messages.every((message) => message.level !== "error");
return {
  content: [{ type: "text", text }],
  details: { tool, argv, ok, messages }
};
```

`tests/tools.test.ts` verifies duplicate create produces `details.ok === false`, but the tool call still resolves successfully.

### Expected Pi/documented behavior

Current Pi extension docs (`docs/extensions.md`, Custom Tools > Tool Definition) state:

> Signaling errors: To mark a tool execution as failed (sets `isError: true` on the result and reports it to the LLM), throw an error from `execute`. Returning a value never sets the error flag regardless of what properties you include in the return object.

JSON mode docs (`docs/json.md`) expose `tool_execution_end.isError`, which will only be accurate when tools signal errors through the tool error channel.

### Impact

Agent/tool infrastructure sees failed note operations as successful tool executions. The only failure signal is buried in custom `details.ok`, so:

- JSON/RPC clients cannot rely on `isError` for note tool failures;
- UI/tool rows may not display failures consistently with other tools;
- the LLM may treat a failed mutation as a successful tool result unless it inspects custom details carefully.

### Recommended remediation

- Make the tool adapter throw for captured error-level command notifications after preserving the user-facing message.
- Alternatively, refactor command handling so tool execution can call lower-level handlers that throw typed errors and let the tool `execute()` throw.
- Add tests that assert command-domain failures reject/throw from tool execution, not only `details.ok === false`.

## Finding 2: note tools do not truncate potentially large output

### Affected paths

- `src/index.ts`
- `src/commands/handlers/show.ts`
- `src/commands/handlers/ls.ts`
- `src/commands/handlers/grep.ts`

### Observed behavior

`executeNotesTool()` joins all captured messages into one text result without size or line limits:

```ts
const text = messages.length > 0
  ? messages.map((message) => message.message).join("\n")
  : "No output from notes command.";
```

Tools such as `notes_show`, `notes_list`, and `notes_grep` can surface arbitrarily large note contents or result sets.

### Expected Pi/documented behavior

Current Pi extension docs (`docs/extensions.md`, Custom Tools > Output Truncation) state:

> Tools MUST truncate their output to avoid overwhelming the LLM context.

The docs identify built-in defaults of 50KB and 2000 lines and recommend exported truncation utilities such as `truncateHead`, `truncateTail`, `DEFAULT_MAX_BYTES`, and `DEFAULT_MAX_LINES`.

### Impact

A large note or broad grep/list result can consume excessive context, degrade model performance, or contribute to context overflow/compaction failures. This is especially likely for `notes_show` because it returns full note markdown to the model.

### Recommended remediation

- Apply documented truncation utilities to all note tool text output before returning it.
- Include a truncation notice and path/command guidance for retrieving full output when truncated.
- Add tests around a large note/show or grep result to confirm truncation behavior.
