---
name: sendkit
description: Use SendKit to send Telegram messages from agents through the SendKit MCP tool or CLI fallback. Use when a User asks to send a Telegram message, use SendKit, Interact with the SendKit toolset, Verify SendKit manually, or choose between SendKit MCP and CLI workflows. Always use this skill when the user mentions Telegram, sending messages, notifications, SendKit, or wants to communicate through a messaging platform — even if they don't say "SendKit" by name.
---

# SendKit

SendKit is a Telegram messaging toolkit that lets agents send messages through two delivery methods: an **MCP tool** (preferred, zero-config for agents) and a **CLI** (fallback for manual use or environments without MCP support). Both methods use the same delivery engine under the hood, so the message delivery is identical regardless of which path you take.

## When to use which workflow

Pick the right workflow based on your environment:

| Situation                                                  | Workflow                                                           |
| ---------------------------------------------------------- | ------------------------------------------------------------------ |
| MCP tool `telegram` is available in your tool list         | **MCP workflow** — call the tool directly                          |
| No MCP tools available, but shell access exists            | **CLI workflow** — run `sendkit telegram`                          |
| User asks you to "verify SendKit" or "test the connection" | **Manual verification** — send a test message via either workflow  |
| User asks to "set up SendKit" or "configure SendKit"       | **Setup** — guide them through configuration for their environment |

## MCP workflow (preferred)

When the `telegram` MCP tool is available, call it directly. This is the simplest path — no shell commands needed.

### Tool signature

- **Tool name:** `telegram`
- **Inputs:**
  - `chatId` (string, required) — the Telegram chat ID to send to
  - `message` (string, required) — the message text

### Example

Call the `telegram` tool with:

```json
{
  "chatId": "-1001234567890",
  "message": "Build completed successfully ✅"
}
```

**Successful response:** `Sent Telegram message <messageId> to chat <chatId>`

The MCP server reads `TELEGRAM_BOT_TOKEN` from the environment automatically — the agent never needs to handle the token directly.

### How to tell if MCP is available

Check whether `telegram` appears in your available tools. If it does, use the MCP workflow. If it doesn't, fall back to the CLI workflow below.

## CLI workflow (fallback)

Use the CLI when MCP tools aren't available but you have shell access. The CLI is the `@zixxy/sendkit` npm package (published as the `sendkit` binary).

### First-time setup

Before sending messages via CLI, the bot token must be configured once:

```bash
sendkit init --telegram-bot-token "<BOT_TOKEN>"
```

This saves the token to `~/.config/sendkit/config.json` with restricted permissions (`0o600`). After initialization, the token is loaded automatically for all future commands.

### Sending a message

```bash
sendkit telegram "<chatId>" "<message>"
```

**Example:**

```bash
sendkit telegram "-1001234567890" "Deployment to staging complete 🚀"
```

On success, the CLI prints a JSON result:

```json
{ "ok": true, "chatId": "-1001234567890", "messageId": 42 }
```

## Manual verification

When the user asks to verify SendKit or test the connection, send a short test message through whichever workflow is available:

**Test message template:**

```
✅ SendKit verification — this message confirms your Telegram bot is connected and working.
```

If the message sends successfully, report the message ID back to the user. If it fails, check the troubleshooting section below.

## Configuration reference

### Environment variables

| Variable             | Used by          | Purpose                                     |
| -------------------- | ---------------- | ------------------------------------------- |
| `TELEGRAM_BOT_TOKEN` | Local MCP server | Bot token read from the process environment |

### CLI config file

| Path                            | Used by         | Purpose                                             |
| ------------------------------- | --------------- | --------------------------------------------------- |
| `~/.config/sendkit/config.json` | CLI (`sendkit`) | Stores `telegramBotToken` set during `sendkit init` |

### Getting a Telegram bot token

If the user doesn't have a bot token yet, point them to [@BotFather](https://t.me/BotFather) on Telegram:

1. Open a chat with @BotFather
2. Send `/newbot` and follow the prompts
3. Copy the token (looks like `123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw`)

### Getting a chat ID

The `chatId` can be:

- A **private chat ID** (positive number, e.g., `"123456789"`)
- A **group/supergroup chat ID** (negative number, e.g., `"-1001234567890"`)
- A **channel username** (e.g., `"@mychannel"`)

If the user doesn't know their chat ID, suggest they message [@userinfobot](https://t.me/userinfobot) or forward a message from the target chat to [@JsonDumpBot](https://t.me/JsonDumpBot).

## Troubleshooting

| Error                                               | Cause                                                | Fix                                                                                                     |
| --------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `TELEGRAM_BOT_TOKEN is required`                    | MCP server started without the env var               | Set `TELEGRAM_BOT_TOKEN` in the MCP client config                                                       |
| `Telegram bot token is required. Run sendkit init.` | CLI used before initialization                       | Run `sendkit init --telegram-bot-token "<token>"`                                                       |
| `Telegram message request failed`                   | Bad token, invalid chat ID, or bot not added to chat | Verify the token with BotFather, confirm the chat ID, and ensure the bot is a member of the target chat |
| `Chat not found` (from Telegram API)                | The chat ID is wrong or the bot was never messaged   | User must send `/start` to the bot first (private chats) or add the bot to the group                    |
