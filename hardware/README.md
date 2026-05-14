# Hardware System 

This folder contains all hardware-related components and scripts for the TriView Smart Glove project.

The hardware system is responsible for collecting real-time sensor data, processing user interactions, and communicating with the AI and mobile application.

---

#  Hardware Features

- Color Detection
- Fabric Recognition
- Gesture Detection
- NFC Tag Reading
- Audio Feedback
- BLE Communication
- Real-Time Sensor Processing

---

# 🛠️ Hardware Components

| Component | Function |
|------|------|
| Raspberry Pi 5 | Main controller |
| AS7341 | Color sensor |
| AS7263 | Spectral/Fabric sensor |
| Flex Sensors | Gesture recognition |
| MCP3008 ADC | Analog signal conversion |
| NFC Module | Clothing identification |
| Speaker | Voice feedback |

---

# Folder Structure

```bash
hardware/
│
├── sensors/          # Sensor reading scripts
├── bluetooth/        # BLE communication
├── nfc/              # NFC reader modules
├── audio/            # Audio output system
├── ai_processing/    # AI inference & preprocessing
├── database/         # Local/cloud database connection
├── scripts/          # Startup & installation scripts
├── tests/            # Hardware testing scripts
├── config/           # Configuration files
│
├── main.py           # Main hardware system entry
└── requirements.txt  # Python dependencies
