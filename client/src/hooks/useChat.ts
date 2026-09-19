import { useCallback, useState } from "react";
import { dummyInitialChatMessages } from "../assets/asset";

export const useChat = (_roomId, user) => {
  const [message, setMessage] = useState(dummyInitialChatMessages);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(true);

  const sendMessage = useCallback(
    (text) => {
      if (!text.trim() || !user) return;

      const message = {
        id: Date.now().toString(),
        text: text.trim(),
        senderName: user.name || user.fullName || "You",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessage((prev) => [...prev, message]);
    },
    [user],
  );

  const toggleChat = useCallback(() => {
    setIsChatOpen((prev) => {
      if (!prev) setUnreadCount(0);
      return !prev;
    });
  }, []);

  return {
    message,
    sendMessage,
    unreadCount,
    isChatOpen,
    toggleChat,
  };
};
