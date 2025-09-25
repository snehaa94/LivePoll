import React, { useState, useEffect, useRef } from "react";
import { Tab } from "@headlessui/react";
import { io } from "socket.io-client";
import Chat from "./Chat";
import chatIcon from "../../assets/chat.svg";

let apiUrl =
  import.meta.env.VITE_NODE_ENV === "production"
    ? import.meta.env.VITE_API_BASE_URL
    : "http://localhost:5000"; // <-- backend port
const socket = io(apiUrl);

const ChatPopover = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [participants, setParticipants] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const chatWindowRef = useRef(null);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
    const username = sessionStorage.getItem("username");
    socket.emit("joinChat", { username });

    socket.on("chatMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
    socket.on("participantsUpdate", (participantsList) => {
      setParticipants(participantsList);
    });

    return () => {
      socket.off("participantsUpdate");
      socket.off("chatMessage");
    };
  }, []);

  const username = sessionStorage.getItem("username");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = { user: username, text: newMessage };
      socket.emit("chatMessage", message);
      setNewMessage("");
    }
  };

  const handleKickOut = (participant) => {
    socket.emit("kickOut", participant);
  };

  return (
    <div className="fixed bottom-5 right-5">
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 flex items-center justify-center bg-indigo-600 rounded-full shadow-md hover:bg-indigo-700 transition"
      >
        <img src={chatIcon} alt="chat" className="w-7 h-7" />
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-96 h-96 bg-white rounded-lg shadow-lg text-xs flex flex-col z-50">
          <Tab.Group>
            <Tab.List className="flex border-b">
              <Tab
                className={({ selected }) =>
                  `px-3 py-2 focus:outline-none ${
                    selected
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "text-gray-600"
                  }`
                }
              >
                Chat
              </Tab>
              <Tab
                className={({ selected }) =>
                  `px-3 py-2 focus:outline-none ${
                    selected
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "text-gray-600"
                  }`
                }
              >
                Participants
              </Tab>
            </Tab.List>

            <Tab.Panels className="flex-1 overflow-y-auto p-3">
              <Tab.Panel>
                <Chat
                  messages={messages}
                  newMessage={newMessage}
                  onMessageChange={setNewMessage}
                  onSendMessage={handleSendMessage}
                />
              </Tab.Panel>

              <Tab.Panel>
                <div className="max-h-64 overflow-y-auto">
                  {participants.length === 0 ? (
                    <div>No participants connected</div>
                  ) : (
                    <table className="w-full text-xs">
                      <thead>
                        <tr>
                          <th className="text-left py-1">Name</th>
                          {username?.startsWith("teacher") && (
                            <th className="text-left py-1">Actions</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {participants.map((participant, index) => (
                          <tr key={index}>
                            <td className="py-1">{participant}</td>
                            {username?.startsWith("teacher") && (
                              <td className="py-1">
                                <button
                                  onClick={() => handleKickOut(participant)}
                                  className="text-red-500 text-[10px] hover:underline"
                                >
                                  Kick Out
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      )}
    </div>
  );
};

export default ChatPopover;
