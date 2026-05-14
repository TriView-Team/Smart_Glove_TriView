from bless import BlessServer
from bless.backends.characteristic import (
    GATTCharacteristicProperties,
    GATTAttributePermissions,
)

import asyncio
import json
import threading

SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e"
TX_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e"


class TriviewBLE:
    def __init__(self, local_name="TRIVIEW_PI"):
        self.local_name = local_name
        self.server = None
        self.loop = None
        self.ready = False

    async def setup(self):
        self.server = BlessServer(name=self.local_name)

        await self.server.add_new_service(SERVICE_UUID)

        await self.server.add_new_characteristic(
            SERVICE_UUID,
            TX_UUID,
            GATTCharacteristicProperties.read
            | GATTCharacteristicProperties.notify,
            bytearray(b"ready"),
            GATTAttributePermissions.readable,
        )

        await self.server.start()

        self.ready = True

        print("BLE advertising started")

    def start(self):
        def runner():
            self.loop = asyncio.new_event_loop()

            asyncio.set_event_loop(self.loop)

            self.loop.run_until_complete(self.setup())

            self.loop.run_forever()

        threading.Thread(target=runner, daemon=True).start()

    def send(self, payload):
        if not self.ready or self.server is None or self.loop is None:
            print("BLE not ready")
            return

        data = json.dumps(
            payload,
            ensure_ascii=True
        ).encode("utf-8")

        async def _send():
            char = self.server.get_characteristic(TX_UUID)

            if char is None:
                print("Characteristic not found")
                return

            char.value = bytearray(data)

            # بدون await
            self.server.update_value(
                SERVICE_UUID,
                TX_UUID
            )

            print(
                "BLE NOTIFY SENT:",
                data.decode("utf-8")
            )

        future = asyncio.run_coroutine_threadsafe(
            _send(),
            self.loop
        )

        try:
            future.result(timeout=3)

        except Exception as e:
            print("BLE SEND ERROR:", e)
