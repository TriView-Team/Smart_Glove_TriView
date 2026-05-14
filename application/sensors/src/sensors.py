"""
Sensor wrappers for AS7341 (visible/NIR color, 11 channels) and
AS7263 (NIR fabric, 6 channels).

Both sensors are read over I2C. On a Raspberry Pi this requires:
    sudo raspi-config           # enable I2C
    sudo apt install -y python3-smbus i2c-tools
    sudo pip3 install adafruit-circuitpython-as7341 \
                      adafruit-circuitpython-as726x

The readers below talk to the real hardware. If the drivers or the bus
are unavailable (e.g. running on a dev machine), they fall back to
zero-filled dictionaries so the rest of the pipeline can still run.

The dictionary keys MUST match the feature order used during MLP
training — see `feature_order.json` in each model directory.
"""

from __future__ import annotations

from typing import Dict

# ---- Feature order (must match training) -------------------------------------
COLOR_FEATURES = (
    "F1_415", "F2_445", "F3_480", "F4_515",
    "F5_555", "F6_590", "F7_630", "F8_680",
    "Clear", "NIR", "Flicker",
)

FABRIC_FEATURES = ("R", "S", "T", "U", "V", "W")


# ---- Lazy I2C bus + driver singletons ----------------------------------------
_i2c = None
_as7341 = None
_as7263 = None


def _get_i2c():
    """Open the default I2C bus once and reuse it."""
    global _i2c
    if _i2c is None:
        import board  # type: ignore
        import busio  # type: ignore
        _i2c = busio.I2C(board.SCL, board.SDA)
    return _i2c


def _get_as7341():
    """Initialise the AS7341 once with sensible defaults for fabric capture."""
    global _as7341
    if _as7341 is None:
        from adafruit_as7341 import AS7341  # type: ignore
        sensor = AS7341(_get_i2c())
        # ATIME/ASTEP set integration ~50 ms; gain x256 for low-light fabric.
        sensor.atime = 100
        sensor.astep = 999
        sensor.gain = 8  # AS7341_GAIN_256X
        # Enable the on-board white LED so the spectrum is repeatable.
        try:
            sensor.led_current = 25  # mA
            sensor.led = True
        except Exception:
            pass
        _as7341 = sensor
    return _as7341


def _get_as7263():
    """Initialise the AS7263 NIR sensor once."""
    global _as7263
    if _as7263 is None:
        from adafruit_as726x import AS726x_I2C  # type: ignore
        sensor = AS726x_I2C(_get_i2c())
        sensor.conversion_mode = sensor.MODE_2  # continuous read of all 6 ch
        sensor.gain = 64
        sensor.integration_time = 140  # ms
        try:
            sensor.driver_led = True
        except Exception:
            pass
        _as7263 = sensor
    return _as7263


# ---- Public readers ----------------------------------------------------------
def read_as7341_features() -> Dict[str, float]:
    """
    Read all 11 channels of the AS7341 and return them in COLOR_FEATURES order.

    F1_415..F8_680 are the eight visible channels, plus Clear, NIR and the
    Flicker detection channel (Hz). Returns zeros if the hardware is missing.
    """
    try:
        s = _get_as7341()
        readings = {
            "F1_415": float(s.channel_415nm),
            "F2_445": float(s.channel_445nm),
            "F3_480": float(s.channel_480nm),
            "F4_515": float(s.channel_515nm),
            "F5_555": float(s.channel_555nm),
            "F6_590": float(s.channel_590nm),
            "F7_630": float(s.channel_630nm),
            "F8_680": float(s.channel_680nm),
            "Clear":  float(s.channel_clear),
            "NIR":    float(s.channel_nir),
            "Flicker": float(getattr(s, "flicker_detected", 0) or 0),
        }
        # Re-key in the canonical training order.
        return {name: readings[name] for name in COLOR_FEATURES}
    except Exception as e:
        print(f"[AS7341] read failed ({e}); returning zeros")
        return {name: 0.0 for name in COLOR_FEATURES}


def read_as7263_features() -> Dict[str, float]:
    """
    Read all 6 NIR channels (R, S, T, U, V, W) of the AS7263.
    Returns zeros if the hardware is missing.
    """
    try:
        s = _get_as7263()
        # Wait until a fresh sample is ready (continuous mode still toggles this).
        if hasattr(s, "data_ready"):
            for _ in range(50):
                if s.data_ready:
                    break
        readings = {
            "R": float(s.red),
            "S": float(s.orange),
            "T": float(s.yellow),
            "U": float(s.green),
            "V": float(s.blue),
            "W": float(s.violet),
        }
        return {name: readings[name] for name in FABRIC_FEATURES}
    except Exception as e:
        print(f"[AS7263] read failed ({e}); returning zeros")
        return {name: 0.0 for name in FABRIC_FEATURES}
