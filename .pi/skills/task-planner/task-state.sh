#!/usr/bin/env bash
set -euo pipefail

TASKS_DIR=".pi/tasks"
TASKS_FILE="$TASKS_DIR/tasks.yaml"
LOCK_FILE="$TASKS_DIR/.tasks.yaml.lock"

usage() {
  cat <<'USAGE'
Task state lifecycle helper

Usage:
  .pi/skills/task-planner/task-state.sh add <task-slug>
  .pi/skills/task-planner/task-state.sh complete <task-slug>
  .pi/skills/task-planner/task-state.sh help

Updates the current project's .pi/tasks/tasks.yaml active task list with
an exclusive lock and atomic rename.
USAGE
}

err() {
  echo "ERROR: $*" >&2
}

require_project_tasks_dir() {
  if [[ ! -d "$TASKS_DIR" ]]; then
    err "Missing project tasks directory: $TASKS_DIR"
    err "Run this command from a project root that contains .pi/tasks/."
    exit 1
  fi
}

validate_slug() {
  local slug="$1"

  if [[ -z "$slug" ]]; then
    err "Missing task slug."
    usage >&2
    exit 1
  fi

  if [[ ! "$slug" =~ ^[A-Za-z0-9._-]+$ ]]; then
    err "Invalid task slug: $slug"
    err "Task slugs may contain only letters, numbers, dots, underscores, and hyphens."
    exit 1
  fi
}

parse_active_slugs() {
  local file="$1"

  if [[ ! -f "$file" ]]; then
    return 0
  fi

  awk '
    function trim(value) {
      gsub(/^[[:space:]]+|[[:space:]]+$/, "", value)
      gsub(/^['\''\"]|['\''\"]$/, "", value)
      return value
    }

    /^active:[[:space:]]*\[/ {
      line = $0
      sub(/^active:[[:space:]]*\[/, "", line)
      sub(/\][[:space:]]*(#.*)?$/, "", line)
      n = split(line, values, ",")
      for (i = 1; i <= n; i++) {
        value = trim(values[i])
        if (value != "") print value
      }
      in_active = 0
      next
    }

    /^active:[[:space:]]*($|#)/ {
      in_active = 1
      next
    }

    /^[A-Za-z0-9_-]+:[[:space:]]*/ {
      in_active = 0
    }

    in_active && /^[[:space:]]*-[[:space:]]*/ {
      value = $0
      sub(/^[[:space:]]*-[[:space:]]*/, "", value)
      sub(/[[:space:]]*#.*$/, "", value)
      value = trim(value)
      if (value != "") print value
    }
  ' "$file"
}

format_tasks_yaml() {
  local -n slugs_ref="$1"

  if [[ ${#slugs_ref[@]} -eq 0 ]]; then
    printf 'active: []\n'
    return 0
  fi

  printf 'active:\n'
  local slug
  for slug in "${slugs_ref[@]}"; do
    printf '  - %s\n' "$slug"
  done
}

read_unique_slugs() {
  local file="$1"
  local -n out_ref="$2"
  local slug

  out_ref=()
  while IFS= read -r slug; do
    [[ -z "$slug" ]] && continue
    if [[ ! "$slug" =~ ^[A-Za-z0-9._-]+$ ]]; then
      err "Unsupported active task slug in $file: $slug"
      exit 1
    fi
    if ! contains_slug "$slug" "${out_ref[@]}"; then
      out_ref+=("$slug")
    fi
  done < <(parse_active_slugs "$file")
}

contains_slug() {
  local needle="$1"
  shift || true
  local item
  for item in "$@"; do
    if [[ "$item" == "$needle" ]]; then
      return 0
    fi
  done
  return 1
}

write_tasks_yaml() {
  local slugs_var="$1"
  local temp_file

  temp_file="$(mktemp "$TASKS_DIR/tasks.yaml.tmp.XXXXXX")"
  format_tasks_yaml "$slugs_var" > "$temp_file"
  mv "$temp_file" "$TASKS_FILE"
}

apply_add() {
  local slug="$1"
  local slugs=()

  read_unique_slugs "$TASKS_FILE" slugs
  if contains_slug "$slug" "${slugs[@]}"; then
    write_tasks_yaml slugs
    echo "Active task already present: $slug"
    return 0
  fi

  slugs+=("$slug")
  write_tasks_yaml slugs
  echo "Added active task: $slug"
}

apply_complete() {
  local slug="$1"
  local slugs=()
  local next_slugs=()
  local item
  local removed=0

  read_unique_slugs "$TASKS_FILE" slugs
  for item in "${slugs[@]}"; do
    if [[ "$item" == "$slug" ]]; then
      removed=1
      continue
    fi
    next_slugs+=("$item")
  done

  write_tasks_yaml next_slugs

  if [[ $removed -eq 1 ]]; then
    echo "Completed active task: $slug"
  else
    echo "Active task not present: $slug"
  fi
}

main() {
  local command="${1:-}"
  local slug="${2:-}"

  case "$command" in
    help|-h|--help)
      usage
      exit 0
      ;;
    add|complete)
      if [[ $# -ne 2 ]]; then
        err "Command '$command' requires exactly one task slug."
        usage >&2
        exit 1
      fi
      ;;
    *)
      err "Unknown command: ${command:-<missing>}"
      usage >&2
      exit 1
      ;;
  esac

  validate_slug "$slug"
  require_project_tasks_dir

  if ! command -v flock >/dev/null 2>&1; then
    err "Missing required command: flock"
    exit 1
  fi

  exec 9>"$LOCK_FILE"
  flock 9

  case "$command" in
    add) apply_add "$slug" ;;
    complete) apply_complete "$slug" ;;
  esac
}

main "$@"
