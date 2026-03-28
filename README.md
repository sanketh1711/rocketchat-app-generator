# Mention Tracker App

A Rocket.Chat application that tracks mentions and sends an ephemeral "Thank you for mentioning me" message back to whoever mentioned you.

## Features

- **`/sanketh1711 on`** – Enable mention tracking for yourself. Any time another user includes `@yourusername` in a message you will receive an ephemeral reply.
- **`/sanketh1711 off`** – Disable mention tracking.
- **Ephemeral responses** – The sender sees `Thank you for mentioning me, @sender!` (only visible to them) every time they mention the tracked user.

## Getting Started

Install dependencies and compile:

```bash
npm install
npm run compile   # tsc
```

Deploy to your Rocket.Chat server:

```bash
npm run deploy
```

Or package for manual upload:

```bash
npm run package
```

## Usage

1. In any Rocket.Chat channel run `/sanketh1711 on` to start tracking.
2. Ask a colleague to mention you (e.g. `Hey @yourusername, look at this!`).
3. The colleague will immediately receive an ephemeral message: *Thank you for mentioning me, @colleague!*
4. Run `/sanketh1711 off` to stop tracking at any time.

## Documentation

- [Rocket.Chat Apps TypeScript Definitions Documentation](https://rocketchat.github.io/Rocket.Chat.Apps-engine/)
- [Rocket.Chat Apps TypeScript Definitions Repository](https://github.com/RocketChat/Rocket.Chat.Apps-engine)
- [Example Rocket.Chat Apps](https://github.com/graywolf336/RocketChatApps)
