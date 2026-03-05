import { useState, useEffect, useCallback, useRef } from "react";
import { createSocket, type DevChatSocket } from "../client/socket.js";
import type {
  ChatMessage,
  ActivityEntry,
  ConfirmRequest,
  FileChange,
  ConnectionState,
  DevChatConfig,
  DownstreamMessage,
} from "../types.js";

export interface DevChatState {
  connectionState: ConnectionState;
  messages: ChatMessage[];
  activities: ActivityEntry[];
  pendingConfirm: ConfirmRequest | null;
  fileChanges: FileChange[];
  sendMessage: (text: string) => void;
  cancelTask: (taskId: string) => void;
  respondToConfirm: (taskId: string, approved: boolean) => void;
}

let activityId = 0;

export function useDevChat(config: DevChatConfig): DevChatState {
  const socketRef = useRef<DevChatSocket | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [pendingConfirm, setPendingConfirm] = useState<ConfirmRequest | null>(null);
  const [fileChanges, setFileChanges] = useState<FileChange[]>([]);

  // Map messageId -> taskId (assigned by relay/openclaw)
  const taskMapRef = useRef(new Map<string, string>());

  useEffect(() => {
    const socket = createSocket(config.url, config.secret, config.appId);
    socketRef.current = socket;

    const unsubState = socket.onStateChange(setConnectionState);
    const unsubMsg = socket.onMessage((msg: DownstreamMessage) => {
      handleDownstream(msg);
    });

    socket.connect();

    return () => {
      unsubState();
      unsubMsg();
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.url, config.secret, config.appId]);

  function handleDownstream(msg: DownstreamMessage) {
    switch (msg.type) {
      case "status":
        setMessages((prev) =>
          prev.map((m) =>
            m.taskId === msg.taskId ? { ...m, status: msg.status } : m,
          ),
        );
        break;

      case "activity":
        setActivities((prev) => [
          ...prev.slice(-49),
          { id: `act_${++activityId}`, taskId: msg.taskId, text: msg.text, timestamp: Date.now() },
        ]);
        break;

      case "assistant": {
        setMessages((prev) => {
          const existing = prev.find(
            (m) => m.role === "assistant" && m.taskId === msg.taskId && m.streaming,
          );
          if (existing) {
            return prev.map((m) =>
              m === existing
                ? { ...m, text: m.text + msg.text, streaming: !msg.done }
                : m,
            );
          }
          return [
            ...prev,
            {
              id: `asst_${msg.taskId}`,
              role: "assistant" as const,
              text: msg.text,
              timestamp: Date.now(),
              taskId: msg.taskId,
              streaming: !msg.done,
            },
          ];
        });
        break;
      }

      case "files":
        setFileChanges((prev) => [...prev, { taskId: msg.taskId, changed: msg.changed }]);
        break;

      case "confirm":
        setPendingConfirm({
          taskId: msg.taskId,
          action: msg.action,
          description: msg.description,
        });
        break;

      case "error":
        setMessages((prev) =>
          prev.map((m) =>
            m.taskId === msg.taskId ? { ...m, status: "error" } : m,
          ),
        );
        setActivities((prev) => [
          ...prev.slice(-49),
          { id: `act_${++activityId}`, taskId: msg.taskId, text: `Error: ${msg.message}`, timestamp: Date.now() },
        ]);
        break;
    }
  }

  const sendMessage = useCallback(
    (text: string) => {
      if (!socketRef.current) return;
      const msgId = socketRef.current.sendMessage(text, config.agent);
      const taskId = msgId; // Use message ID as task ID until relay assigns one
      taskMapRef.current.set(msgId, taskId);

      setMessages((prev) => [
        ...prev,
        {
          id: msgId,
          role: "user",
          text,
          timestamp: Date.now(),
          taskId,
          status: "queued",
        },
      ]);
    },
    [config.agent],
  );

  const cancelTask = useCallback((taskId: string) => {
    socketRef.current?.cancelTask(taskId);
  }, []);

  const respondToConfirm = useCallback((taskId: string, approved: boolean) => {
    socketRef.current?.confirmResponse(taskId, approved);
    setPendingConfirm(null);
  }, []);

  return {
    connectionState,
    messages,
    activities,
    pendingConfirm,
    fileChanges,
    sendMessage,
    cancelTask,
    respondToConfirm,
  };
}
