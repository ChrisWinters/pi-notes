import { NotesError } from "./errors.js";

export type FileMutationQueue = <T>(path: string, operation: () => Promise<T>) => Promise<T>;

export interface MutationCoordinator {
  withMutations<T>(
    paths: readonly string[],
    operation: () => Promise<T>,
    signal?: AbortSignal
  ): Promise<T>;
}

export function throwIfNotesAborted(signal: AbortSignal | undefined): void {
  if (signal?.aborted === true) {
    throw new NotesError("Notes operation cancelled.");
  }
}

function uniqueSortedPaths(paths: readonly string[]): readonly string[] {
  return [...new Set(paths)].sort();
}

export function createQueuedMutationCoordinator(queue: FileMutationQueue): MutationCoordinator {
  return {
    async withMutations<T>(paths: readonly string[], operation: () => Promise<T>, signal?: AbortSignal): Promise<T> {
      throwIfNotesAborted(signal);
      const guardedOperation = async (): Promise<T> => {
        throwIfNotesAborted(signal);
        return operation();
      };

      return uniqueSortedPaths(paths).reduceRight<() => Promise<T>>(
        (next, path) => () => queue(path, next),
        guardedOperation
      )();
    }
  };
}

const localQueueTails = new Map<string, Promise<void>>();

async function withLocalFileMutationQueue<T>(path: string, operation: () => Promise<T>): Promise<T> {
  const previous = localQueueTails.get(path) ?? Promise.resolve();
  const run = previous.then(operation, operation);
  const tail = run.then(
    () => undefined,
    () => undefined
  );
  localQueueTails.set(path, tail);

  try {
    return await run;
  } finally {
    if (localQueueTails.get(path) === tail) {
      localQueueTails.delete(path);
    }
  }
}

export const localMutationCoordinator: MutationCoordinator = createQueuedMutationCoordinator(withLocalFileMutationQueue);
