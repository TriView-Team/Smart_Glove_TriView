# Triview Smart Glove — Raspberry Pi Runtime

Complete runtime for the Raspberry Pi side of the Triview Smart Glove.
Reads sensors (AS7341 + AS7263) + NFC, runs MLP models, and streams
results to the Triview mobile app over BLE (Nordic UART Service).

## Folder layout

```
pi_runtime/
├── README.md
├── requirements.txt
├── main.py                  # entry point — main loop
└── src/
    ├── __init__.py
    ├── ble_server.py        # Nordic UART BLE server (matches mobile app)
    ├── nfc_reader.py        # Global PN532 NFC reader (lazy init)
    ├── sensors.py           # AS7341 + AS7263 placeholders
    ├── speaker.py           # espeak-ng wrapper
    └── payload.py           # JSON payload builder (matches blePayloadSchema.ts)
```

## Install on Raspberry Pi

```bash
sudo apt update
sudo apt install -y python3-pip python3-dbus bluez espeak-ng
sudo pip3 install -r requirements.txt
```

Make sure Bluetooth is on:
```bash
sudo systemctl enable bluetooth
sudo systemctl start bluetooth
```

## Run

```bash
sudo python3 main.py
```

`sudo` is required because BlueZ peripheral mode needs root.

## Mobile app pairing

The app scans for devices whose name starts with `Triview` and connects
to the Nordic UART Service:

- Service: `6e400001-b5a3-f393-e0a9-e50e24dcca9e`
- TX (notify, Pi → app): `6e400003-b5a3-f393-e0a9-e50e24dcca9e`

Each notification is one UTF-8 JSON object matching
`src/lib/blePayloadSchema.ts` in the app:
```json
{ "fabric": "cotton", "color": "red", "pattern": "solid",
  "texture": "smooth", "confidence": 0.95 }
```

## Copying your trained models

Copy your trained MLP artifacts from the Windows training machine into:
```
pi_runtime/models/color/
pi_runtime/models/fabric/
```
Then point `COLOR_MODEL_DIR` / `FABRIC_MODEL_DIR` in `main.py` to them.
