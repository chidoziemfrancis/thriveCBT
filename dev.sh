#!/usr/bin/env bash
# Starts everything needed to try ThriveCBT on a phone: the database, the backend, and the
# Expo app. Run from the repo root: ./dev.sh   Stop with Ctrl + C (stops the backend too).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
PORT=3000
PG_DATA="/opt/homebrew/var/postgresql@14"
LOG="${TMPDIR:-/tmp}"; LOG="${LOG%/}/thrivecbt-backend.log"

say() { printf '\033[1;35m[dev]\033[0m %s\n' "$*"; }

# 1. Database
if ! pg_ctl -D "$PG_DATA" status >/dev/null 2>&1; then
  say "Starting the database…"
  pg_ctl -D "$PG_DATA" -l "$PG_DATA/server.log" start >/dev/null
fi

# 2. Point the app at this Mac's Wi-Fi address, which changes between networks.
IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)"
if [ -z "$IP" ]; then
  say "No Wi-Fi address found. Connect to Wi-Fi (the same one as your phone) and try again."
  exit 1
fi
printf "# Written by dev.sh: your Mac's Wi-Fi address, so the phone can reach the backend.\nEXPO_PUBLIC_API_URL=http://%s:%s/v1\n" "$IP" "$PORT" > "$ROOT/mobile/.env"
say "The app will talk to http://$IP:$PORT/v1"

# 3. Backend, in the background. Its full log goes to a file; email codes and errors are
#    shown here, since sign-up codes are printed instead of emailed while testing.
BACKEND_PID=""
WATCH_PID=""
cleanup() {
  [ -n "$WATCH_PID" ] && kill "$WATCH_PID" 2>/dev/null || true
  if [ -n "$BACKEND_PID" ]; then
    say "Stopping the backend…"
    pkill -P "$BACKEND_PID" 2>/dev/null || true
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

if curl -s "http://localhost:$PORT/v1/health" >/dev/null 2>&1; then
  say "The backend is already running; using it."
else
  say "Starting the backend (full log: $LOG)…"
  : > "$LOG"
  (cd "$ROOT" && npm run start:dev >"$LOG" 2>&1) &
  BACKEND_PID=$!
  for _ in $(seq 1 90); do
    curl -s "http://localhost:$PORT/v1/health" >/dev/null 2>&1 && break
    if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
      say "The backend stopped while starting. Last lines of its log:"
      tail -20 "$LOG"
      exit 1
    fi
    sleep 1
  done
  curl -s "http://localhost:$PORT/v1/health" >/dev/null 2>&1 || {
    say "The backend didn't start within 90 seconds. See $LOG"
    exit 1
  }
  say "Backend ready."
  tail -n 0 -F "$LOG" 2>/dev/null |
    grep --line-buffered -A3 -E 'Email \(not sent|ERROR|Error:' |
    sed -u 's/^/[server] /' &
  WATCH_PID=$!
fi

# 4. The app. Scan the QR code with your phone (Expo Go), on the same Wi-Fi as this Mac.
say "Starting the app. Scan the QR code with your phone."
cd "$ROOT/mobile"
npx expo start
