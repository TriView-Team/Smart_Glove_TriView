"""
PN532 NFC reader, initialized once globally for performance.

If the PN532 libraries or hardware are missing, read_garment_type() falls
back to a safe default ("T-Shirt") so the rest of the glove keeps running.
"""

from __future__ import annotations

from typing import Dict, Optional

_pn532 = None
_init_failed = False

# Customize this map with the UIDs of your real NFC-tagged garments.
UID_TO_GARMENT: Dict[str, str] = {
    # "04AABBCCDD11": "T-Shirt",
    # "04EEFF001122": "Jacket",
    # "04112233AABB": "Trousers",
}

DEFAULT_GARMENT = "T-Shirt"


def _get_pn532():
    """Lazy-initialize the PN532 over I2C exactly once."""
    global _pn532, _init_failed
    if _pn532 is not None or _init_failed:
        return _pn532
    try:
        import board
        import busio
        from adafruit_pn532.i2c import PN532_I2C

        i2c = busio.I2C(board.SCL, board.SDA)
        pn = PN532_I2C(i2c, debug=False)
        pn.SAM_configuration()
        _pn532 = pn
        print("[NFC] PN532 initialized")
    except Exception as e:
        _init_failed = True
        print(f"[NFC] init failed ({e}); using default garment '{DEFAULT_GARMENT}'")
    return _pn532


def read_garment_type(timeout: float = 0.2) -> str:
    """Return a garment label from the current NFC tag, or DEFAULT_GARMENT."""
    pn = _get_pn532()
    if pn is None:
        return DEFAULT_GARMENT
    try:
        uid = pn.read_passive_target(timeout=timeout)
    except Exception as e:
        print(f"[NFC] read error: {e}")
        return DEFAULT_GARMENT
    if uid is None:
        return DEFAULT_GARMENT
    uid_hex = "".join(f"{b:02X}" for b in uid)
    return UID_TO_GARMENT.get(uid_hex, DEFAULT_GARMENT)


def read_uid_hex(timeout: float = 0.2) -> Optional[str]:
    """Helper for tag enrollment: print the UID of any tag you tap."""
    pn = _get_pn532()
    if pn is None:
        return None
    uid = pn.read_passive_target(timeout=timeout)
    if uid is None:
        return None
    return "".join(f"{b:02X}" for b in uid)
