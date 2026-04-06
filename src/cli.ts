#!/usr/bin/env node

import { createInterface } from "node:readline/promises";

import type { NotesCommandContext, NotesNotifyLevel } from "./commands/context.js";
import { handleNotesCommandArgv } from "./commands/notes.js";
import { NOTES_USAGE } from "./commands/shared.js";

interface CliFlags {
  readonly forceYes: boolean;
  readonly showHelp: boolean;
  readonly commandTokens: readonly string[];
}

export interface CliRunOptions {
  readonly cwd?: string;
  readonly interactive?: boolean;
  readonly onStdout?: (message: string) => void;
  readonly onStderr?: (message: string) => void;
}

function parseCliFlags(argv: readonly string[]): CliFlags {
  const tokens = [...argv];
  let forceYes = false;
  let showHelp = false;

  while (tokens[0] === "--yes" || tokens[0] === "-y" || tokens[0] === "--help" || tokens[0] === "-h") {
    const token = tokens.shift();
    if (token === "--yes" || token === "-y") {
      forceYes = true;
    }

    if (token === "--help" || token === "-h") {
      showHelp = true;
    }
  }

  while (tokens.length > 0) {
    const last = tokens.at(-1);
    if (last !== "--yes" && last !== "-y") {
      break;
    }

    forceYes = true;
    tokens.pop();
  }

  return {
    forceYes,
    showHelp,
    commandTokens: tokens
  };
}

async function promptConfirm(title: string, message: string): Promise<boolean> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  try {
    process.stdout.write(`${title}\n${message}\n`);
    const answer = await rl.question("Proceed? [y/N] ");
    const normalized = answer.trim().toLowerCase();
    return normalized === "y" || normalized === "yes";
  } finally {
    rl.close();
  }
}

export async function runCli(argv: readonly string[], options: CliRunOptions = {}): Promise<number> {
  const parsed = parseCliFlags(argv);
  const stdout = options.onStdout ?? ((message: string) => process.stdout.write(message));
  const stderr = options.onStderr ?? ((message: string) => process.stderr.write(message));

  const [firstToken] = parsed.commandTokens;
  if (
    parsed.showHelp ||
    firstToken === undefined ||
    firstToken === "help" ||
    firstToken === "commands"
  ) {
    stdout(`${NOTES_USAGE}\n\nCLI options:\n  --yes, -y   auto-confirm destructive prompts\n`);
    return 0;
  }

  const interactive = options.interactive ?? (process.stdin.isTTY === true && process.stdout.isTTY === true);
  const hasUI = interactive || parsed.forceYes;

  let hadError = false;
  const notify = (message: string, level: NotesNotifyLevel): void => {
    if (level === "error") {
      hadError = true;
      stderr(`${message}\n`);
      return;
    }

    stdout(`${message}\n`);
  };

  const context: NotesCommandContext = {
    cwd: options.cwd ?? process.cwd(),
    hasUI,
    ui: {
      notify,
      confirm: async (title: string, message: string) => {
        if (parsed.forceYes) {
          return true;
        }

        if (!interactive) {
          return false;
        }

        return promptConfirm(title, message);
      },
      editor: () => {
        notify("CLI editor flow is not available. Use /notes edit in interactive Pi.", "error");
        return Promise.resolve(undefined);
      }
    }
  };

  await handleNotesCommandArgv(parsed.commandTokens, context);
  return hadError ? 1 : 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const code = await runCli(process.argv.slice(2));
  process.exitCode = code;
}
