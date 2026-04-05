import type { ScopeSelection } from "../core/storage.js";

export interface MoveSelection {
  readonly toProject: boolean;
  readonly toGlobal: boolean;
  readonly overwrite: boolean;
}

export interface ParsedNotesCommand {
  readonly subcommand: string | undefined;
  readonly args: readonly string[];
  readonly scopeSelection: ScopeSelection;
  readonly moveSelection: MoveSelection;
}

const SCOPE_FLAG_PROJECT = "--project";
const SCOPE_FLAG_GLOBAL = "--global";
const MOVE_FLAG_TO_PROJECT = "--to-project";
const MOVE_FLAG_TO_GLOBAL = "--to-global";
const MOVE_FLAG_OVERWRITE = "--overwrite";
const END_OF_OPTIONS = "--";

function isScopeFlag(token: string): boolean {
  return token === SCOPE_FLAG_PROJECT || token === SCOPE_FLAG_GLOBAL;
}

function isMoveFlag(token: string): boolean {
  return (
    token === MOVE_FLAG_TO_PROJECT || token === MOVE_FLAG_TO_GLOBAL || token === MOVE_FLAG_OVERWRITE
  );
}

function isEdgeFlagForSubcommand(token: string, subcommand: string): boolean {
  if (isScopeFlag(token)) {
    return true;
  }

  if (subcommand === "move") {
    return isMoveFlag(token);
  }

  return false;
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

function applyMoveFlag(token: string, selection: MoveSelection): MoveSelection {
  if (token === MOVE_FLAG_TO_PROJECT) {
    return {
      ...selection,
      toProject: true
    };
  }

  if (token === MOVE_FLAG_TO_GLOBAL) {
    return {
      ...selection,
      toGlobal: true
    };
  }

  if (token === MOVE_FLAG_OVERWRITE) {
    return {
      ...selection,
      overwrite: true
    };
  }

  return selection;
}

function parseFlagsFromEdges(
  tokens: readonly string[],
  subcommand: string,
  initialScopeSelection: ScopeSelection,
  initialMoveSelection: MoveSelection
): { scopeSelection: ScopeSelection; moveSelection: MoveSelection; args: readonly string[] } {
  let scopeSelection = initialScopeSelection;
  let moveSelection = initialMoveSelection;

  let start = 0;
  let end = tokens.length - 1;

  while (start <= end && isEdgeFlagForSubcommand(tokens[start] ?? "", subcommand)) {
    const token = tokens[start];
    if (token !== undefined) {
      scopeSelection = applyScopeFlag(token, scopeSelection);
      moveSelection = applyMoveFlag(token, moveSelection);
    }
    start += 1;
  }

  while (end >= start && isEdgeFlagForSubcommand(tokens[end] ?? "", subcommand)) {
    const token = tokens[end];
    if (token !== undefined) {
      scopeSelection = applyScopeFlag(token, scopeSelection);
      moveSelection = applyMoveFlag(token, moveSelection);
    }
    end -= 1;
  }

  return {
    scopeSelection,
    moveSelection,
    args: tokens.slice(start, end + 1)
  };
}

function parseSubcommandArgs(
  tokens: readonly string[],
  subcommand: string,
  initialScopeSelection: ScopeSelection,
  initialMoveSelection: MoveSelection
): { scopeSelection: ScopeSelection; moveSelection: MoveSelection; args: readonly string[] } {
  const separatorIndex = tokens.indexOf(END_OF_OPTIONS);
  if (separatorIndex === -1) {
    return parseFlagsFromEdges(tokens, subcommand, initialScopeSelection, initialMoveSelection);
  }

  const beforeSeparator = tokens.slice(0, separatorIndex);
  const afterSeparator = tokens.slice(separatorIndex + 1);

  const parsed = parseFlagsFromEdges(
    beforeSeparator,
    subcommand,
    initialScopeSelection,
    initialMoveSelection
  );

  return {
    scopeSelection: parsed.scopeSelection,
    moveSelection: parsed.moveSelection,
    args: [...parsed.args, ...afterSeparator]
  };
}

function initialMoveSelection(): MoveSelection {
  return {
    toProject: false,
    toGlobal: false,
    overwrite: false
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
      },
      moveSelection: initialMoveSelection()
    };
  }

  let scopeSelection: ScopeSelection = {
    forceProject: false,
    forceGlobal: false
  };

  let index = 0;
  while (index < tokens.length && isScopeFlag(tokens[index] ?? "")) {
    const token = tokens[index];
    if (token !== undefined) {
      scopeSelection = applyScopeFlag(token, scopeSelection);
    }
    index += 1;
  }

  const subcommand = tokens[index];
  if (subcommand === undefined) {
    return {
      subcommand: undefined,
      args: [],
      scopeSelection,
      moveSelection: initialMoveSelection()
    };
  }

  const rawArgs = tokens.slice(index + 1);
  const parsedArgs = parseSubcommandArgs(rawArgs, subcommand, scopeSelection, initialMoveSelection());

  return {
    subcommand,
    args: parsedArgs.args,
    scopeSelection: parsedArgs.scopeSelection,
    moveSelection: parsedArgs.moveSelection
  };
}
