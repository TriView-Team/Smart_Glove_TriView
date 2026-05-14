import sqlite3
import board
import busio
from adafruit_pn532.i2c import PN532_I2C

# تشغيل NFC
i2c = busio.I2C(board.SCL, board.SDA)
pn532 = PN532_I2C(i2c, debug=False)

# قاعدة البيانات
conn = sqlite3.connect("triview_clothes.db")
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS clothes (
    uid TEXT PRIMARY KEY,
    item_name TEXT,
    color TEXT,
    fabric TEXT,
    description TEXT
)
""")

print("Place NFC tag...")

# قراءة التاق
uid = pn532.read_passive_target(timeout=10)

if uid is not None:

    uid_str = ":".join([hex(i)[2:].upper() for i in uid])

    print("UID:", uid_str)

    item_name = input("Item name: ")
    color = input("Color: ")
    fabric = input("Fabric: ")
    description = input("Description: ")

    cursor.execute("""
    INSERT OR REPLACE INTO clothes
    (uid, item_name, color, fabric, description)
    VALUES (?, ?, ?, ?, ?)
    """, (uid_str, item_name, color, fabric, description))

    conn.commit()

    print("Clothing data saved!")

else:
    print("No tag detected.")

conn.close()
