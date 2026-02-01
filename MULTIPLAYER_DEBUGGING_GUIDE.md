# Multiplayer Debugging Guide

## How the Multiplayer Flow Works

### Expected Flow:
1. **Player 1**: Clicks "Multiplayer" → Shows game selection → Enters lobby
2. **Player 1**: Clicks "Auto-Match" OR enters a manual room ID
   - If "Auto-Match": Creates a new room (since none exist) → Gets Room ID
   - If "Manual ID": Tries to join that room
3. **Player 1**: Sees "Waiting for opponent..." with their Room ID shown
4. **Player 2**: Clicks "Multiplayer" → Shows game selection → Enters lobby  
5. **Player 2**: Either:
   - Clicks "Auto-Match" → Should find Player 1's room and join it
   - OR pastes Player 1's Room ID and clicks "Join Room"
6. **Both Players**: Should now see "Opponent found!" and a "Ready" button
7. **Both Players**: Click "Ready" button
8. **Game Starts**: Both players enter the actual game

## Debugging Steps

### Open Browser Console:
Press `F12` and go to the **Console** tab to see detailed logs.

### What to Look For:

#### Player 1's Console (Room Creator):
```
✅ Multiplayer socket connected, ID: socket123
✅ Room created: snake-1706814600000-abc123def
✋ Player ready status: false in room snake-1706814600000-abc123def
✋ Player ready status: true in room snake-1706814600000-abc123def
```

#### Player 2's Console (Joining):
```
✅ Multiplayer socket connected, ID: socket456
👤 Player joined. Room: snake-1706814600000-abc123def Players count: 2
```

#### Both Should See:
```
✅ Ready status: [{"userId":"...", "username":"Player1", "ready":true}, ...] allReady: true
🎮 Game starting...
```

### Common Issues & Fixes:

#### Issue 1: Both players see "Waiting for opponent..." but no ready button appears
**Symptom**: Player count shows "1/2" on both devices

**Cause**: Second player didn't join the room or `multiplayer:player-joined` event didn't broadcast

**Fix**:
1. Check console for errors in both devices
2. Verify room ID is exactly the same on both devices (case-sensitive!)
3. Try refreshing the page and reconnecting
4. Check server console for `❌ Room not found` error

#### Issue 2: "Room not found" error appears
**Symptom**: Error message shows when trying to join

**Causes**:
- Room ID is incorrect (typo or wrong format)
- Room was deleted (both players left)
- Room already has 2 players (try creating new one)

**Fix**:
- Verify room ID from Player 1's screen - copy/paste the FULL ID
- Create a new room if needed

#### Issue 3: Players can see each other but can't click Ready
**Symptom**: Ready button doesn't appear even though both players are shown

**Cause**: Client UI not recognizing `players.length === 2`

**Fix**:
1. Check console for `Player count: 2` in the log
2. Manually refresh the page
3. Try a different game mode

#### Issue 4: Both players ready, but game doesn't start
**Symptom**: Both see ready buttons, click them, but game doesn't load

**Cause**: `multiplayer:game-start` event not being emitted or received

**Fix**:
1. In server console, check for: `🎮 Game starting in room: ...`
2. In client console, check for: `🎮 Game starting...`
3. If only one appears, there's a socket communication issue
4. Restart the server and both client connections

## Server Console Logs to Check

### When Player Joins:
```
✅ Player joined room: snake-1706814600000-abc123def. Updated players: [
  {userId: "...", username: "Alice", ready: false},
  {userId: "...", username: "Bob", ready: false}
]
```

### When Ready is Clicked:
```
✋ Player ready status: true in room snake-1706814600000-abc123def. Players: [
  {user: "Alice", ready: true},
  {user: "Bob", ready: false}
]
```

### When Both Ready (Game Should Start):
```
🎮 Game starting in room: snake-1706814600000-abc123def with players: Alice, Bob
```

## Quick Testing Checklist

- [ ] Player 1 sees Room ID displayed
- [ ] Player 1 shares Room ID with Player 2
- [ ] Player 2 copies and pastes Room ID (exact match)
- [ ] Player 2 clicks "Join Room"
- [ ] Both players' player lists show 2 players
- [ ] Both players see usernames (not "Anonymous")
- [ ] Ready button appears for both
- [ ] Both click Ready in any order
- [ ] Game loads and starts

## Reset & Reconnect

If stuck:
1. **Player 2**: Click "Cancel" button
2. **Player 1**: Click "Cancel" button  
3. Wait 2 seconds
4. **Player 1**: Start over with "Auto-Match"
5. **Player 2**: Wait for rooms to load and join

## Still Not Working?

Check these in order:
1. Are both players on the SAME game type? (e.g., both playing "Snake")
2. Is the server running? Check terminal for errors
3. Are both devices on the SAME network?
4. Check browser console for network errors in the Network tab
5. Try a different game mode (e.g., switch from Snake to Pong)
6. Restart both browser tabs completely

---

**Key takeaway**: Watch the console logs - they tell you exactly where the connection breaks.
