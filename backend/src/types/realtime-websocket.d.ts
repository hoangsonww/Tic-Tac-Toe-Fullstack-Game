declare module "../realtime/websocket" {
  import { Server as HTTPServer, IncomingMessage } from "http";
  import { Socket } from "net";

  export const WEBSOCKET_PATH: string;
  export function attachWebsocketServer(server: HTTPServer): void;
  export function handleUpgrade(
    request: IncomingMessage,
    socket: Socket,
    head?: Buffer,
  ): void;
  export function getWebsocketServer(): unknown;
  export function getPresenceSnapshot(
    usernames?: string[],
  ): Record<string, any>;
}
