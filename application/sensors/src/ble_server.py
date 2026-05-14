"""
Nordic UART BLE peripheral server for the Triview Smart Glove.

The mobile app (src/hooks/useGlove.tsx) scans for a device whose name starts
with "Triview" and subscribes to notifications on the UART TX characteristic.
We chunk JSON payloads into BLE-MTU sized notifications. The app reassembles
each line and validates it against blePayloadSchema.ts.
"""

from __future__ import annotations

import json
import threading
from typing import Optional

try:
    from bluezero import adapter, peripheral
except Exception as e:  # pragma: no cover
    adapter = None
    peripheral = None
    _IMPORT_ERROR = e
else:
    _IMPORT_ERROR = None

# Nordic UART Service UUIDs — must match useGlove.tsx
UART_SERVICE = "6e400001-b5a3-f393-e0a9-e50e24dcca9e"
RX_CHAR      = "6e400002-b5a3-f393-e0a9-e50e24dcca9e"  # App -> Pi (write)
TX_CHAR      = "6e400003-b5a3-f393-e0a9-e50e24dcca9e"  # Pi  -> App (notify)

DEFAULT_NAME = "Triview-Glove"
CHUNK_SIZE = 20  # safe default BLE MTU payload


class TriviewBLE:
    """
    Lightweight wrapper around bluezero.peripheral for the Triview UART.
    Run .start() once at boot, then call .send(payload_dict) per detection.
    """

    def __init__(self, local_name: str = DEFAULT_NAME):
        if _IMPORT_ERROR is not None:
            raise RuntimeError(
                f"bluezero not available ({_IMPORT_ERROR}). "
                "Install with: sudo pip3 install bluezero"
            )
        self.local_name = local_name
        self._tx_char = None
        self._peripheral: Optional["peripheral.Peripheral"] = None
        self._thread: Optional[threading.Thread] = None
        self._started = False

    # ---------- lifecycle ----------
    def start(self) -> None:
        if self._started:
            return

        adapters = list(adapter.Adapter.available())
        if not adapters:
            raise RuntimeError("No Bluetooth adapter found. Is bluetoothd running?")
        addr = adapters[0].address

        p = peripheral.Peripheral(addr, local_name=self.local_name)
        p.add_service(srv_id=1, uuid=UART_SERVICE, primary=True)

        # TX (notify): Pi -> App
        p.add_characteristic(
            srv_id=1,
            chr_id=1,
            uuid=TX_CHAR,
            value=[],
            notifying=False,
            flags=["notify"],
        )
        # RX (write): App -> Pi (placeholder, e.g. future commands)
        p.add_characteristic(
            srv_id=1,
            chr_id=2,
            uuid=RX_CHAR,
            value=[],
            notifying=False,
            flags=["write", "write-without-response"],
            write_callback=self._on_write,
        )

        self._peripheral = p
        # bluezero's publish() blocks on the GLib mainloop; run it in a thread.
        self._thread = threading.Thread(target=p.publish, daemon=True)
        self._thread.start()
        self._started = True
        print(f"[BLE] Advertising as '{self.local_name}' (UART {UART_SERVICE})")

    # ---------- send ----------
    def send(self, payload: dict) -> None:
        """Serialize payload to JSON + newline and notify in 20-byte chunks."""
        if not self._started or self._peripheral is None:
            print("[BLE] not started; dropping payload")
            return

        try:
            data = (json.dumps(payload, separators=(",", ":")) + "\n").encode("utf-8")
        except (TypeError, ValueError) as e:
            print(f"[BLE] serialization failed: {e}")
            return

        try:
            tx = self._peripheral.characteristics[0]  # TX added first
            for i in range(0, len(data), CHUNK_SIZE):
                tx.set_value(list(data[i : i + CHUNK_SIZE]))
        except Exception as e:
            print(f"[BLE] notify failed: {e}")

    # ---------- callbacks ----------
    def _on_write(self, value, options):
        try:
            text = bytes(value).decode("utf-8", errors="replace")
            print(f"[BLE] RX from app: {text}")
        except Exception as e:
            print(f"[BLE] RX decode failed: {e}")
