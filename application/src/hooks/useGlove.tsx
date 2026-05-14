import { createContext, useContext, useState, useCallback, useRef, ReactNode, useEffect } from "react";
import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";
import { BleClient, numbersToDataView } from "@capacitor-community/bluetooth-le";

export type ConnectionState = "idle" | "scanning" | "connecting" | "connected" | "error";

interface GloveContextType {
  connected: boolean;
  scanning: boolean;
  state: ConnectionState;
  deviceName: string | null;
  error: string | null;
  supported: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  scan: () => Promise<void>;
  retry: () => Promise<void>;
  onData: (cb: (data: DataView) => void) => () => void;
}

const GloveContext = createContext<GloveContextType | null>(null);

// Nordic UART Service — common default for Pi/BLE-UART bridges.
const UART_SERVICE = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const UART_TX_CHAR = "6e400003-b5a3-f393-e0a9-e50e24dcca9e"; // notify (Pi -> app)
const DEVICE_NAME_PREFIX = "Triview";

const isNative = Capacitor.isNativePlatform();

export const GloveProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<ConnectionState>("idle");
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Web BLE refs
  const deviceRef = useRef<any>(null);
  const serverRef = useRef<any>(null);
  const notifyCharRef = useRef<any>(null);
  // Native BLE ref
  const nativeDeviceIdRef = useRef<string | null>(null);

  const listenersRef = useRef<Set<(data: DataView) => void>>(new Set());
  const wasConnected = useRef(false);

  const supported =
    isNative ||
    (typeof navigator !== "undefined" && !!(navigator as any).bluetooth);

  const connected = state === "connected";
  const scanning = state === "scanning" || state === "connecting";

  const handleDisconnected = useCallback(() => {
    setState("idle");
    setDeviceName(null);
    if (wasConnected.current) {
      toast.error("Connection lost with smart glove", { icon: "⚠️" });
      wasConnected.current = false;
    }
  }, []);

  const onWebNotify = useCallback((event: Event) => {
    const target = event.target as any;
    if (!target.value) return;
    listenersRef.current.forEach((cb) => cb(target.value!));
  }, []);

  const connectNative = useCallback(async () => {
    await BleClient.initialize({ androidNeverForLocation: true });
    setState("scanning");
    const device = await BleClient.requestDevice({
      namePrefix: DEVICE_NAME_PREFIX,
      optionalServices: [UART_SERVICE],
    });
    nativeDeviceIdRef.current = device.deviceId;
    setDeviceName(device.name ?? "Triview Device");

    setState("connecting");
    await BleClient.connect(device.deviceId, () => handleDisconnected());

    try {
      await BleClient.startNotifications(
        device.deviceId,
        UART_SERVICE,
        UART_TX_CHAR,
        (value) => {
          listenersRef.current.forEach((cb) => cb(value));
        },
      );
    } catch (svcErr) {
      console.warn("Triview UART service not found on native:", svcErr);
      toast.warning("Connected, but data service not found. Check Pi firmware UUIDs.");
    }

    setState("connected");
    wasConnected.current = true;
    toast.success(`Connected to ${device.name ?? "Triview"}`, { icon: "🧤" });
  }, [handleDisconnected]);

  const connectWeb = useCallback(async () => {
    setState("scanning");
    const device = await (navigator as any).bluetooth.requestDevice({
      filters: [
        { namePrefix: DEVICE_NAME_PREFIX },
        { services: [UART_SERVICE] },
      ],
      optionalServices: [UART_SERVICE],
    });

    deviceRef.current = device;
    setDeviceName(device.name ?? "Triview Device");
    device.addEventListener("gattserverdisconnected", handleDisconnected);

    setState("connecting");
    const server = await device.gatt!.connect();
    serverRef.current = server;

    try {
      const service = await server.getPrimaryService(UART_SERVICE);
      const notifyChar = await service.getCharacteristic(UART_TX_CHAR);
      await notifyChar.startNotifications();
      notifyChar.addEventListener("characteristicvaluechanged", onWebNotify);
      notifyCharRef.current = notifyChar;
    } catch (svcErr) {
      console.warn("Triview UART service not found; data stream unavailable.", svcErr);
      toast.warning("Connected, but data service not found. Check Pi firmware UUIDs.");
    }

    setState("connected");
    wasConnected.current = true;
    toast.success(`Connected to ${device.name ?? "Triview"}`, { icon: "🧤" });
  }, [handleDisconnected, onWebNotify]);

  const connect = useCallback(async () => {
    setError(null);

    if (!supported) {
      const msg = "Bluetooth is not supported on this device. Use the native iOS/Android build, or Chrome on Android/desktop.";
      setError(msg);
      setState("error");
      toast.error(msg);
      return;
    }

    try {
      if (isNative) {
        await connectNative();
      } else {
        await connectWeb();
      }
    } catch (e: any) {
      const msg = e?.message ?? "Failed to connect to device";
      if (e?.name === "NotFoundError" || /cancel/i.test(msg)) {
        setState("idle");
        setError(null);
        return;
      }
      console.error("BLE connect failed:", e);
      setError(msg);
      setState("error");
      toast.error(msg, { icon: "⚠️" });
    }
  }, [supported, connectNative, connectWeb]);

  const disconnect = useCallback(() => {
    try {
      if (isNative && nativeDeviceIdRef.current) {
        BleClient.stopNotifications(nativeDeviceIdRef.current, UART_SERVICE, UART_TX_CHAR).catch(() => {});
        BleClient.disconnect(nativeDeviceIdRef.current).catch(() => {});
        nativeDeviceIdRef.current = null;
      } else {
        notifyCharRef.current?.removeEventListener("characteristicvaluechanged", onWebNotify);
        if (serverRef.current?.connected) serverRef.current.disconnect();
        notifyCharRef.current = null;
        serverRef.current = null;
        deviceRef.current = null;
      }
    } catch (e) {
      console.warn("Disconnect error:", e);
    }
    setDeviceName(null);
    setState("idle");
    if (wasConnected.current) {
      toast.message("Disconnected from smart glove");
      wasConnected.current = false;
    }
  }, [onWebNotify]);

  const scan = useCallback(async () => {
    await connect();
  }, [connect]);

  const retry = useCallback(async () => {
    setError(null);
    await connect();
  }, [connect]);

  const onData = useCallback((cb: (data: DataView) => void) => {
    listenersRef.current.add(cb);
    return () => {
      listenersRef.current.delete(cb);
    };
  }, []);

  useEffect(() => {
    return () => {
      try {
        if (isNative && nativeDeviceIdRef.current) {
          BleClient.disconnect(nativeDeviceIdRef.current).catch(() => {});
        } else if (serverRef.current?.connected) {
          serverRef.current.disconnect();
        }
      } catch {}
    };
  }, []);

  return (
    <GloveContext.Provider
      value={{
        connected,
        scanning,
        state,
        deviceName,
        error,
        supported,
        connect,
        disconnect,
        scan,
        retry,
        onData,
      }}
    >
      {children}
    </GloveContext.Provider>
  );
};

export const useGlove = () => {
  const ctx = useContext(GloveContext);
  if (!ctx) throw new Error("useGlove must be used within GloveProvider");
  return ctx;
};
