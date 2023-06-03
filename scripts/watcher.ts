import WebSocket, { RawData } from "ws";

const MIN_PORT = 6463;
const MAX_PORT = 6472;

function random(): string {
  return Math.random().toString(16).slice(2);
}

let ws: WebSocket | undefined;
let failed = false;
let connectingPromise: Promise<WebSocket | undefined> | undefined;

/**
 * Try to connect to RPC on a specific port and handle the READY event as well as errors and close events
 * @param {number} port
 */
function tryPort(port: number): Promise<WebSocket | undefined> {
  ws = new WebSocket(`ws://127.0.0.1:${port}/?v=1&client_id=REPLUGGED-${random()}`);
  return new Promise((resolve, reject) => {
    let didFinish = false;
    ws?.on("message", (data) => {
      if (didFinish) {
        return;
      }

      const message = JSON.parse(data.toString());
      if (message.evt !== "READY") {
        return;
      }

      didFinish = true;

      resolve(ws);
    });
    ws?.on("error", () => {
      if (didFinish) {
        return;
      }

      didFinish = true;

      reject(new Error("WebSocket error"));
    });
    ws?.on("close", () => {
      ws = undefined;

      if (didFinish) {
        return;
      }

      didFinish = true;

      reject(new Error("WebSocket closed"));
    });
  });
}

/**
 * Get an active websocket connection to Discord. If one is already open, it will be returned. Otherwise, a new connection will be made.
 * If a connection cannot be made or failed previously, none will be made and undefined will be returned.
 */
async function connectWebsocket(): Promise<WebSocket | undefined> {
  if (ws && ws.readyState === WebSocket.OPEN) {
    return ws;
  }
  if (failed) return undefined;
  if (connectingPromise) return await connectingPromise;

  connectingPromise = (async () => {
    for (let port = MIN_PORT; port <= MAX_PORT; port++) {
      try {
        ws = await tryPort(port);
        return ws;
      } catch {}
    }
    return undefined;
  })();

  const result = await connectingPromise;
  connectingPromise = undefined;
  if (result) {
    return result;
  }

  console.error("Could not connect to Discord websocket");
  failed = true;
  return undefined;
}

let reloading = false;
let reloadAgain = false;

/**
 * Send WS request to reload an addon
 */
export async function reload(id: string): Promise<void> {
  const ws = await connectWebsocket();
  if (!ws) return;

  if (reloading) {
    reloadAgain = true;
    return;
  }

  const nonce = random();

  ws.send(
    JSON.stringify({
      cmd: "REPLUGGED_ADDON_WATCHER",
      args: {
        id,
      },
      nonce,
    }),
  );

  reloading = true;

  await new Promise((resolve) => {
    const onMessage = async (data: RawData): Promise<void> => {
      const message = JSON.parse(data.toString());
      if (message.nonce !== nonce) {
        return;
      }
      ws.off("message", onMessage);

      reloading = false;
      if (reloadAgain) {
        reloadAgain = false;
        resolve(await reload(id));
        return;
      }

      if (message.data.success) {
        console.log("Reloaded addon");
        resolve(undefined);
      } else {
        const errorCode = message.data.error;
        let error = "Unknown error";
        switch (errorCode) {
          case "ADDON_NOT_FOUND":
            error = "Addon not found";
            break;
          case "ADDON_DISABLED":
            error = "Addon disabled";
            break;
          case "RELOAD_FAILED":
            error = "Reload failed";
            break;
        }
        console.error(`Failed to reload addon: ${error}`);
        resolve(undefined);
      }
    };

    ws.on("message", onMessage);
  });
}
