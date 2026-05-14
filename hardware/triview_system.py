import time
import sqlite3
import uuid

import board
import busio

from adafruit_pn532.i2c import PN532_I2C

import adafruit_ads1x15.ads1115 as ADS
from adafruit_ads1x15.analog_in import AnalogIn

from ble_server import TriviewBLE


DEVICE_ID = "TRIVIEW_" + hex(uuid.getnode())[2:].upper()

# ---------------- I2C ----------------

i2c = busio.I2C(board.SCL, board.SDA)

# ---------------- NFC ----------------

pn532 = PN532_I2C(i2c, debug=False)

# ---------------- FLEX SENSOR ----------------

ads = ADS.ADS1115(i2c)

flex1 = AnalogIn(ads, 0)
flex2 = AnalogIn(ads, 1)

# ---------------- SQLITE DATABASE ----------------

conn = sqlite3.connect("triview_clothes.db")
cursor = conn.cursor()

# ---------------- BLE ----------------

ble = TriviewBLE(local_name=DEVICE_ID)
ble.start()

print("Bluetooth name:", DEVICE_ID)
print("TriView System Ready...")


# ---------------- SETTINGS ----------------

FLEX1_THRESHOLD = 10000
FLEX2_THRESHOLD = 4500

SAVE_MODE_SECONDS = 8
NFC_TIMEOUT = 1

save_mode = False
save_mode_until = 0
last_flex_trigger = 0


# ---------------- MAIN LOOP ----------------

while True:
    now = time.time()

    # ---------------- NFC READ FIRST ----------------

    try:
        uid = pn532.read_passive_target(timeout=NFC_TIMEOUT)
    except OSError as e:
        print("NFC read error:", e)
        uid = None

    if uid is not None:
        uid_str = ":".join([hex(i)[2:].upper() for i in uid])

        cursor.execute(
            """
            SELECT item_name, color, fabric, description
            FROM clothes
            WHERE uid = ?
            """,
            (uid_str,),
        )

        item = cursor.fetchone()

        if item:
            item_name, color, fabric, description = item

            print("\n----------------")
            print(
                f"This is {item_name}. "
                f"Color {color}. "
                f"Fabric {fabric}. "
                f"{description}"
            )
            print("----------------")

            payload = {
                "device_id": DEVICE_ID,
                "type": "clothing_detected",
                "uid": uid_str,
                "item_name": item_name,
                "name": item_name,
                "color": color,
                "fabric": fabric,
                "pattern": "unknown",
                "texture": "unknown",
                "description": description,
                "save_mode": save_mode,
                "confidence": 1,
            }

            print("Payload ready:")
            print(payload)

            try:
                ble.send(payload)
                print(f"Sent with save_mode = {save_mode}")
            except Exception as e:
                print("BLE SEND ERROR:", e)

            if save_mode:
                save_mode = False
                save_mode_until = 0
                print("Save mode OFF.")

            time.sleep(1.2)

        else:
            print("Unknown clothing tag:", uid_str)
            time.sleep(0.5)

    # ---------------- FLEX READ ----------------

    try:
        flex1_value = flex1.value
        flex2_value = flex2.value

        if (
            flex1_value > FLEX1_THRESHOLD
            and flex2_value > FLEX2_THRESHOLD
            and now - last_flex_trigger > 1
        ):
            save_mode = True
            save_mode_until = time.time() + SAVE_MODE_SECONDS
            last_flex_trigger = time.time()

            print("Save mode ON. Touch NFC tag now.")
            print("Flex1:", flex1_value, "Flex2:", flex2_value)

    except OSError as e:
        print("Flex read error:", e)

    # ---------------- SAVE MODE TIMEOUT ----------------

    if save_mode and time.time() > save_mode_until:
        save_mode = False
        save_mode_until = 0
        print("Save mode timeout. Save mode OFF.")

    time.sleep(0.2)
