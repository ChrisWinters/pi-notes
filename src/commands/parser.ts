import type { ScopeSelection } from "../core/storage.js";

export interface ParsedNotesCommand {
  readonly subcommand: string | undefined;
  readonly args: readonly string[];
  readonly scopeSelection: ScopeSelection;
}

const SCOPE_FLAG_PROJECT = "--project";
const SCOPE_FLAG_GLOBAL = "--global";
const END_OF_OPTIONS = "--";

function isScopeFlag(token: string): boolean {
  return token === SCOPE_FLAG_PROJECT || token === SCOPE_FLAG_GLOBAL;
}

function parseQuotedArgs(input: string): readonly string[] {
  const matches = input.match(/"([^"]*)"|'([^']*)'|(\S+)/g);
  if (matches === null) {
    return [];
  }

  return matches.map((token) => {
    if (
      (token.startsWith('"') && token.endsWith('"')) ||
      (token.startsWith("'") && token.endsWith("'"))
    ) {
      return token.slice(1, -1);
    }

    return token;
  });
}

function applyScopeFlag(token: string, selection: ScopeSelection): ScopeSelection {
  if (token === SCOPE_FLAG_PROJECT) {
    return {
      ...selection,
      forceProject: true
    };
  }

  if (token === SCOPE_FLAG_GLOBAL) {
    return {
      ...selection,
      forceGlobal: true
    };
  }

  return selection;
}

function parseScopeFromEdges(
  tokens: readonly string[],
  initialSelection: ScopeSelection
): { selection: ScopeSelection; args: readonly string[] } {
  let selection = initialSelection;

  let start = 0;
  let end = tokens.length - 1;

  while (start <= end && isScopeFlag(tokens[start] ?? "")) {
    const token = tokens[start];
    if (token !== undefined) {
      selection = applyScopeFlag(token, selection);
    }
    start += 1;
  }

  while (end >= start && isScopeFlag(tokens[end] ?? "")) {
    const token = tokens[end];
    if (token !== undefined) {
      selection = applyScopeFlag(token, selection);
    }
    end -= 1;
  }

  return {
    selection,
    args: tokens.slice(start, end + 1)
  };
}

function parseSubcommandArgs(tokens: readonly string[], initialSelection: ScopeSelection): {
  selection: ScopeSelection;
  args: readonly string[];
} {
  const separatorIndex = tokens.indexOf(END_OF_OPTIONS);
  if (separatorIndex === -1) {
    return parseScopeFromEdges(tokens, initialSelection);
  }

  const beforeSeparator = tokens.slice(0, separatorIndex);
  const afterSeparator = tokens.slice(separatorIndex + 1);

  const parsed = parseScopeFromEdges(beforeSeparator, initialSelection);
  return {
    selection: parsed.selection,
    args: [...parsed.args, ...afterSeparator]
  };
}

export function parseNotesCommandInput(input: string): ParsedNotesCommand {
  const tokens = parseQuotedArgs(input.trim());

  if (tokens.length === 0) {
    return {
      subcommand: undefined,
      args: [],
      scopeSelection: {
        forceProject: false,
        forceGlobal: false
      }
    };
  }

  let selection: ScopeSelection = {
    forceProject: false,
    forceGlobal: false
  };

  let index = 0;
  while (index < tokens.length && isScopeFlag(tokens[index] ?? "")) {
    const token = tokens[index];
    if (token !== undefined) {
      selection = applyScopeFlag(token, selection);
    }
    index += 1;
  }

  const subcommand = tokens[index];
  if (subcommand === undefined) {
    return {
      subcommand: undefined,
      args: [],
      scopeSelection: selection
    };
  }

  const rawArgs = tokens.slice(index + 1);
  const parsedArgs = parseSubcommandArgs(rawArgs, selection);

  return {
    subcommand,
    args: parsedArgs.args,
    scopeSelection: parsedArgs.selection
  };
}
