"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Pusher from "pusher-js";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "https://www.cloudwa.net/api/v2/messages?session_uuid=9b6fcf1c-efbe-4c3d-925c-cb3b24131c67&chat_id=201228335760@c.us",
          {
            headers: {
              Authorization: `Bearer 579708|HVh31DQUyPinwidTw8tlOzhALIbtDi6ev8KqaKZO58dea664`,
            },
          }
        );

        setMessages(response.data || []);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
      debug: true,
      authEndpoint: "https://cloudwa.net/api/broadcasting/auth",
      auth: {
        headers: {
          Authorization: `Bearer 579708|HVh31DQUyPinwidTw8tlOzhALIbtDi6ev8KqaKZO58dea664`,
        },
      },
    });

    const channel = pusher.subscribe(
      `private-session.9b6fcf1c-efbe-4c3d-925c-cb3b24131c67`
    );

    channel.bind("wa_message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
      const newMessage = {
        body: data?.payload?.body,
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      console.log("Incoming message:", data);
    });

    return () => {
      pusher.unsubscribe(
        `private-session.9b6fcf1c-efbe-4c3d-925c-cb3b24131c67`
      );
    };
  }, []);

  const sendMessage = async () => {
    if (!message.trim()) {
      alert("Please enter a message.");
      return;
    }

    try {
      const response = await axios.post(
        "https://www.cloudwa.net/api/v2/messages/send-message",
        {
          session_uuid: "9b6fcf1c-efbe-4c3d-925c-cb3b24131c67",
          chat_id: "201228335760@c.us",
          message,
          schedule_at: "2022-09-24T12:00:17", // Set the appropriate schedule or remove if not needed
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer 579708|HVh31DQUyPinwidTw8tlOzhALIbtDi6ev8KqaKZO58dea664`,
          },
        }
      );

      setMessages((prevMessages) => [
        ...prevMessages,
        { body: message, sender: { formatted_name: "You" } },
      ]);
      setMessage(""); // Clear the message input field
      console.log("Message sent:", response.data);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Chat App</h1>

      <div className="w-full max-w-lg bg-white rounded-lg shadow p-4">
        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin w-8 h-8 border-4 border-t-transparent border-blue-500 rounded-full my-5"></div>
          </div>
        ) : (
          <div className="h-64 overflow-y-scroll border border-gray-300 p-2 rounded mb-4">
            {messages.map((msg, index) => (
              <div key={index} className="mb-2 flex flex-col space-y-1">
                <div
                  className={`p-3 rounded-md max-w-xs bg-gray-200 text-black self-start`}
                >
                  {msg?.body}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex">
          <input
            type="text"
            placeholder="Type a message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded mr-2"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
