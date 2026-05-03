#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
TASK_STATE="$SCRIPT_DIR/task-state.sh"

fail() {
  echo "ERROR: $*" >&2
  exit 1
}

assert_file_equals() {
  local file="$1"
  local expected="$2"
  local actual

  actual="$(cat "$file")"
  if [[ "$actual" != "$expected" ]]; then
    echo "Expected:" >&2
    printf '%s\n' "$expected" >&2
    echo "Actual:" >&2
    printf '%s\n' "$actual" >&2
    fail "Unexpected file content: $file"
  fi
}

assert_contains_once() {
  local file="$1"
  local slug="$2"
  local count

  count="$(grep -Ec "^[[:space:]]*-[[:space:]]*$slug$" "$file" || true)"
  if [[ "$count" != "1" ]]; then
    fail "Expected slug '$slug' exactly once in $file; found $count"
  fi
}

run_in_project() {
  local project_dir="$1"
  shift
  (cd "$project_dir" && "$TASK_STATE" "$@")
}

validate_basic_lifecycle() {
  local project_dir="$1/basic"
  mkdir -p "$project_dir/.pi/tasks"

  run_in_project "$project_dir" add alpha >/dev/null
  run_in_project "$project_dir" add alpha >/dev/null
  run_in_project "$project_dir" add beta >/dev/null
  assert_file_equals "$project_dir/.pi/tasks/tasks.yaml" $'active:\n  - alpha\n  - beta'

  run_in_project "$project_dir" complete alpha >/dev/null
  run_in_project "$project_dir" complete alpha >/dev/null
  assert_file_equals "$project_dir/.pi/tasks/tasks.yaml" $'active:\n  - beta'
}

validate_existing_slug_preservation() {
  local project_dir="$1/preserve"
  mkdir -p "$project_dir/.pi/tasks"
  cat > "$project_dir/.pi/tasks/tasks.yaml" <<'YAML'
active:
  - first
  - second
YAML

  run_in_project "$project_dir" add third >/dev/null
  run_in_project "$project_dir" complete second >/dev/null
  assert_file_equals "$project_dir/.pi/tasks/tasks.yaml" $'active:\n  - first\n  - third'
}

validate_invalid_input_no_mutation() {
  local project_dir="$1/invalid"
  mkdir -p "$project_dir/.pi/tasks"
  cat > "$project_dir/.pi/tasks/tasks.yaml" <<'YAML'
active:
  - stable
YAML

  if run_in_project "$project_dir" add '../bad' >/dev/null 2>&1; then
    fail "Invalid slug unexpectedly succeeded"
  fi

  assert_file_equals "$project_dir/.pi/tasks/tasks.yaml" $'active:\n  - stable'
}

validate_missing_tasks_file() {
  local project_dir="$1/missing-file"
  mkdir -p "$project_dir/.pi/tasks"

  run_in_project "$project_dir" add created >/dev/null
  assert_file_equals "$project_dir/.pi/tasks/tasks.yaml" $'active:\n  - created'
}

validate_concurrent_adds() {
  local project_dir="$1/concurrent"
  mkdir -p "$project_dir/.pi/tasks"
  printf 'active: []\n' > "$project_dir/.pi/tasks/tasks.yaml"

  local pids=()
  local slug
  for i in $(seq 1 25); do
    slug="task-$i"
    (run_in_project "$project_dir" add "$slug" >/dev/null) &
    pids+=("$!")
  done

  local pid
  for pid in "${pids[@]}"; do
    wait "$pid"
  done

  for i in $(seq 1 25); do
    assert_contains_once "$project_dir/.pi/tasks/tasks.yaml" "task-$i"
  done

  local count
  count="$(grep -Ec '^[[:space:]]*-[[:space:]]*task-[0-9]+$' "$project_dir/.pi/tasks/tasks.yaml" || true)"
  if [[ "$count" != "25" ]]; then
    fail "Expected 25 concurrent task entries; found $count"
  fi
}

main() {
  [[ -x "$TASK_STATE" ]] || fail "Missing executable helper: $TASK_STATE"

  local tmp_dir
  tmp_dir="$(mktemp -d)"
  trap '[[ -n "${tmp_dir:-}" ]] && rm -rf "$tmp_dir"' EXIT

  validate_basic_lifecycle "$tmp_dir"
  validate_existing_slug_preservation "$tmp_dir"
  validate_invalid_input_no_mutation "$tmp_dir"
  validate_missing_tasks_file "$tmp_dir"
  validate_concurrent_adds "$tmp_dir"

  echo "OK: task-state lifecycle validation passed"
}

main "$@"
