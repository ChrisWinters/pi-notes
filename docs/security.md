# Security (Draft)

Core safety requirements:

- Reject path traversal and absolute path note names
- Confirm destructive actions (`/notes rm`)
- Require explicit approval before rewrite apply
- Avoid silent destructive overwrites

Non-interactive behavior rules will be finalized using Pi extension mode constraints (`ctx.hasUI`).
