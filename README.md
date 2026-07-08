# Release Card

Today this app does one small thing well. It gives release notes a home on Base. A user can publishing a launch marker, and the result is a release card instead of a vague promise.

I kept the identity trail visible:

| Field | Value |
| --- | --- |
| Base Developer Dashboard | Registered |
| Build ID / Base App ID | `6a085298bc175abcdd56520c` |
| Builder Wallet | `0xE09103f0DaadD0cF7D692a013C37310ca586954E` |
| Builder Code | `bc_1cwozz4r` |
| Live Demo | https://release-card.vercel.app |
| GitHub Repository | https://github.com/lackfox9623/release-card-base-dapp |
| Network | Base |
| Deployment | Vercel |

The app can be run with:

```bash
npm install
npm run dev
```

Built using React app router, wallet hooks, Base network config, Vercel deployment.

Note to future maintainers: Do not commit `.env`, private keys, seed phrases, RPC keys, GitHub tokens, or Vercel tokens. Use `.env.example` only for placeholders.
