import time
import board
import busio
from adafruit_pn532.i2c import PN532_I2C

i2c = busio.I2C(board.SCL, board.SDA)
pn532 = PN532_I2C(i2c, debug=False)

print("NFC Unit Test Started...")
print("Place NFC tag near the reader.")

while True:
    try:
        uid = pn532.read_passive_target(timeout=1)

        if uid is not None:
            uid_str = ":".join([hex(i)[2:].upper() for i in uid])
            print("PASS - NFC tag detected:", uid_str)
            time.sleep(1)
        else:
            print("Waiting for NFC tag...")

    except Exception as e:
        print("FAIL - NFC error:", e)
        time.sleep(1)
