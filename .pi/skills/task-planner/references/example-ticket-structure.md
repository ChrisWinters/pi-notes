# Example Ticket Structure

```text
.pi/tasks/active/2026-04-18-example-plan/
├── README.md
├── spec.md
├── prd.md
├── stories.md
├── tickets.md
├── tkt-001/
│   ├── notes.md
│   └── evidence.md
├── tkt-002/
│   ├── notes.md
│   ├── evidence.md
│   └── gaps.md
└── tkt-003/
    ├── notes.md
    └── evidence.md
```

## tickets.md excerpt (example)

```md
# Tickets

- [x] tkt-001 — Scaffold feature flag and config plumbing
- [x] tkt-002 — Implement API handler and validation
- [ ] tkt-003 — Add UI wiring, tests, and release notes
```

## Ticket file expectations

### notes.md

- what changed
- key decisions/tradeoffs
- follow-up notes

### evidence.md

- commands run
- pass/fail outcomes
- artifact links/paths (if any)

### gaps.md (optional)

- unresolved scope gaps
- reasons deferred
- suggested next tickets
