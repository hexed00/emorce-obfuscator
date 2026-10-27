# EmorceHub — Script Protection

Dark void + crimson Emorce-branded host for Lua scripts.

## What it does (same model as obfuscatorhub.lol)

1. Paste Lua → set password (5–20 chars) → optional custom path  
2. Get a **public loadstring**:
   ```lua
   loadstring(game:HttpGet("https://YOUR-DOMAIN/api/KEY"))()
   ```
3. Anyone can **run** that loadstring (no password).  
4. Opening `/script/KEY` in the browser **requires the password** to view / edit / download / delete the source.

So the password is not a Roblox key system — it gates the **management page**. The loadstring itself is open.

## Stack

- Next.js 14 App Router  
- In-memory store (demo / single instance). Wire Vercel KV for production.  
- bcrypt password hash  
- Optional custom path becomes `/api/your-name`

## Run

```bash
npm i && npm run dev
```
