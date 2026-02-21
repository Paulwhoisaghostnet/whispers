## Packages
@taquito/taquito | Tezos interaction library
@taquito/beacon-wallet | Tezos wallet connection (Beacon – primary until sunset)
@temple-wallet/dapp | Tezos wallet connection (Temple – direct, no Beacon dependency)
@tezos-x/octez.connect-sdk | Tezos wallet connection (Octez Connect – backup when Beacon fails/sunsets)
framer-motion | Smooth animations for chat bubbles and UI transitions
lucide-react | Icons for the UI (already in base, but good to note)
date-fns | Date formatting for chat timestamps

## Notes
The app is designed to be embedded (iframe/extension).
It reads `?pageUrl=` from the URL to determine the chat room.
It uses polling (e.g., every 3s) to fetch new messages since no WebSocket is provided in the schema.
Tezos wallet connection happens client-side.
