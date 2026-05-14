import time
import board
import busio
import statistics

import adafruit_ads1x15.ads1115 as ADS
from adafruit_ads1x15.analog_in import AnalogIn

# ---------------- I2C ----------------

i2c = busio.I2C(board.SCL, board.SDA)

# ---------------- ADS1115 ----------------

ads = ADS.ADS1115(i2c)

# ---------------- FLEX SENSORS ----------------

flex1 = AnalogIn(ads, 0)
flex2 = AnalogIn(ads, 1)

# ---------------- THRESHOLDS ----------------

FLEX1_THRESHOLD = 13000
FLEX2_THRESHOLD = 8000

print("Flex Unit Test Started...")
print("Straight fingers = IDLE")
print("Bend two fingers = PASS")

# ---------------- LOOP ----------------

while True:

    try:

        flex1_samples = []
        flex2_samples = []

        # أخذ متوسط 5 قراءات لتقليل الـ noise

        for _ in range(5):

            flex1_samples.append(flex1.value)
            flex2_samples.append(flex2.value)

            time.sleep(0.02)

        flex1_avg = int(statistics.mean(flex1_samples))
        flex2_avg = int(statistics.mean(flex2_samples))

        status = "IDLE"

        if (
            flex1_avg > FLEX1_THRESHOLD
            and flex2_avg > FLEX2_THRESHOLD
        ):

            status = "PASS - Two finger bend detected"

        print(
            f"Flex1 AVG: {flex1_avg} | "
            f"Flex2 AVG: {flex2_avg} | "
            f"{status}"
        )

    except Exception as e:

        print("FAIL:", e)

    time.sleep(0.3)
