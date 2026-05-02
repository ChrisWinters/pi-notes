#!/usr/bin/env bash
set -euo pipefail

ACTIVE_ROOT=".pi/tasks/active"

err() {
  echo "ERROR: $*" >&2
}

pick_plan_slug() {
  local provided="${1:-}"

  if [[ -n "$provided" ]]; then
    echo "$provided"
    return 0
  fi

  if [[ ! -d "$ACTIVE_ROOT" ]]; then
    err "Missing active plans directory: $ACTIVE_ROOT"
    return 1
  fi

  mapfile -t plans < <(find "$ACTIVE_ROOT" -mindepth 1 -maxdepth 1 -type d -printf "%f\n" | sort)

  if [[ ${#plans[@]} -eq 0 ]]; then
    err "No active plans found in $ACTIVE_ROOT"
    return 1
  fi

  if [[ ${#plans[@]} -gt 1 ]]; then
    err "Multiple active plans found. Pass a plan slug explicitly."
    printf 'Found:\n' >&2
    printf '  - %s\n' "${plans[@]}" >&2
    return 1
  fi

  echo "${plans[0]}"
}

validate_required_files() {
  local plan_dir="$1"
  local missing=0
  local required=("spec.md" "README.md" "prd.md" "stories.md" "tickets.md")

  for file in "${required[@]}"; do
    if [[ ! -f "$plan_dir/$file" ]]; then
      err "Missing required file: $plan_dir/$file"
      missing=1
    fi
  done

  return $missing
}

extract_ticket_ids() {
  local tickets_file="$1"
  grep -Eo 'tkt-[0-9]{3}' "$tickets_file" | awk '!seen[$0]++'
}

validate_ticket_folders() {
  local plan_dir="$1"
  local tickets_file="$plan_dir/tickets.md"

  if [[ ! -f "$tickets_file" ]]; then
    err "Cannot validate ticket folders without: $tickets_file"
    return 1
  fi

  local missing=0
  mapfile -t ticket_ids < <(extract_ticket_ids "$tickets_file" || true)

  if [[ ${#ticket_ids[@]} -eq 0 ]]; then
    err "No ticket IDs (tkt-###) found in $tickets_file"
    return 1
  fi

  for ticket_id in "${ticket_ids[@]}"; do
    local ticket_dir="$plan_dir/$ticket_id"

    if [[ ! -d "$ticket_dir" ]]; then
      err "Missing ticket folder: $ticket_dir"
      missing=1
      continue
    fi

    if [[ ! -f "$ticket_dir/notes.md" ]]; then
      err "Missing ticket file: $ticket_dir/notes.md"
      missing=1
    fi

    if [[ ! -f "$ticket_dir/evidence.md" ]]; then
      err "Missing ticket file: $ticket_dir/evidence.md"
      missing=1
    fi
  done

  return $missing
}

main() {
  local slug
  slug="$(pick_plan_slug "${1:-}")"

  local plan_dir="$ACTIVE_ROOT/$slug"
  if [[ ! -d "$plan_dir" ]]; then
    err "Active plan not found: $plan_dir"
    exit 1
  fi

  echo "Validating active plan: $plan_dir"

  local failed=0

  if ! validate_required_files "$plan_dir"; then
    failed=1
  fi

  if ! validate_ticket_folders "$plan_dir"; then
    failed=1
  fi

  if [[ $failed -ne 0 ]]; then
    err "Validation failed for plan: $slug"
    exit 1
  fi

  echo "OK: Plan structure is valid for $slug"
}

main "$@"
