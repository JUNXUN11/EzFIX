import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button, IconButton, Typography } from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenConfigurator } from "@/context";

export function AIChatBot() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { openConfigurator } = controller;
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState([]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newConversation = [
        ...conversation,
        { type: "user", text: message },
      ];
      setConversation(newConversation);
      setMessage("");
    }
  };

  return (
    <>
      <aside
        className={`fixed bottom-8 right-4 z-50 h-[60vh] w-80 bg-white px-4 py-6 shadow-xl rounded-lg transition-transform duration-300 ${
          openConfigurator ? "translate-x-0" : "translate-x-96"
        }`}
        style={{ zIndex: 1000, overflow: "hidden" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <img
            src="/img/ezfixlogo.png"
            alt="Logo"
            className="h-8 w-8 rounded-full"
          />
          <Typography variant="h5" color="blue-gray" className="ml-2">
            AI Assistant
          </Typography>
          <IconButton
            variant="text"
            color="blue-gray"
            onClick={() => setOpenConfigurator(dispatch, false)}
          >
            <XMarkIcon strokeWidth={2.5} className="h-5 w-5" />
          </IconButton>
        </div>

        {/* Main Content */}
        <div className="flex flex-col h-full">
          {/* Conversation Area */}
          <div
            className="flex-grow overflow-y-auto mb-4 border rounded-lg p-3 bg-gradient-to-br from-gray-50 via-white to-blue-100"
          >
            {conversation.length === 0 ? (
              <div className="text-center text-gray-500">
                No messages yet. Start a conversation!
              </div>
            ) : (
              conversation.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-2 p-2 rounded-lg ${
                    msg.type === "user"
                      ? "bg-blue-100 text-right"
                      : "bg-green-100 text-left"
                  }`}
                >
                  {msg.text}
                </div>
              ))
            )}
          </div>

          {/* Input Area */}
          <div
            className="flex items-center pt-2 mb-10 "
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow mb-4 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button
              color="black"
              onClick={handleSendMessage}
              className="rounded-lg mb-4 ml-2 px-4"
            >
              Send
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}

AIChatBot.displayName = "/src/widgets/layout/ai-chat-bot.jsx";

export default AIChatBot;
