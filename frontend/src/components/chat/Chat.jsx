import React, { useEffect } from "react";

const Chat = ({ messages, newMessage, onMessageChange, onSendMessage }) => {
  const username = sessionStorage.getItem("username");

  useEffect(() => {
    const chatWindow = document.getElementById("chat-window");
    if (chatWindow) {
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div
        id="chat-window"
        className="flex-1 overflow-y-auto p-2 bg-gray-100 rounded-md"
      >
        {messages.length === 0 ? (
          <div>No messages yet</div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-2 text-[10px] max-w-[80%] break-words whitespace-pre-wrap px-2 py-1 rounded-md ${
                msg.user === username
                  ? "bg-purple-500 text-white ml-auto"
                  : "bg-gray-800 text-white mr-auto"
              }`}
            >
              <span className="mr-1 font-semibold">
                {msg.user === username ? "You" : msg.user}:
              </span>
              {msg.text}
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="mt-2 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="Type a message"
          className="flex-1 border text-[10px] rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          onClick={onSendMessage}
          className="px-3 py-1 bg-indigo-600 text-white text-[10px] rounded-md hover:bg-indigo-700"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
