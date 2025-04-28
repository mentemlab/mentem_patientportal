"use client";

import { sendMessage } from "@/actions/chat";
import { ArrowUpIcon, LoaderCircleIcon, PlusIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useAppContext } from "@/context/useAppContext";

interface Message {
  id: number;
  sender: "user" | "bot";
  text: string;
}

interface ApiResponse {
  bot_response: string;
  user_message: string;
  timestamp: string;
}

const HomePage = () => {
  const { sessionHistory } = useAppContext();
  const searchParams = useSearchParams();
  const sessionIdParams = searchParams.get("sessionId") as string;
  const session = useSession();
  const [message, setMessage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isFetchedConversation, setIsFetchedConversation] = useState(false);
  const [isFetchedConversationLoading, setIsFetchedConversationLoading] =
    useState(false);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);
  const scrollTargetRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;

      if (textarea.scrollHeight > 120) {
        textarea.style.height = "120px";
        textarea.style.overflowY = "auto";
      } else {
        textarea.style.overflowY = "hidden";
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const scrollToBottom = () => {
    if (scrollTargetRef.current) {
      scrollTargetRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    if (textareaRef.current) {
      textareaRef.current.value = "";
      textareaRef.current.style.height = "auto";
      setMessage("");
    }

    setMessages((prev) => {
      const lastEl = prev.at(-1);
      return [
        ...prev,
        { id: lastEl ? lastEl?.id + 1 : 1, sender: "user", text: message },
      ];
    });
    setIsSubmitting(true);
    const response = await sendMessage(
      session.data?.user?.id ?? "definedId",
      message,
      sessionIdParams
    );
    setIsSubmitting(false);

    if (response.message) {
      setMessages((prev) => {
        const lastEl = prev.at(-1);
        return [
          ...prev,
          {
            id: lastEl ? lastEl?.id + 1 : 1,
            sender: "bot",
            text: response.message,
          },
        ];
      });
    }
  };

  const fetchConversation = async () => {
    const foundSession = sessionHistory.find(
      (session) => session.session_id === sessionIdParams
    );
    if (foundSession) {
      setMessages([]);
      setIsFetchedConversation(true);
      setIsFetchedConversationLoading(true);
      const res = await fetch(
        "https://hvk117oiij.execute-api.us-east-1.amazonaws.com/default/session_history",
        {
          method: "POST",
          body: JSON.stringify({
            user_id: session?.data?.user.id,
            session_id: foundSession.session_id,
          }),
        }
      );

      const response = await res.json();
      setIsFetchedConversationLoading(false);
      if (res.status === 200) {
        const responseData = response as ApiResponse[];

        let messageIdCounter = 1;
        const updatedData: Message[] = [];
        responseData.forEach((element) => {
          updatedData.push({
            id: messageIdCounter++,
            sender: "user",
            text: element.user_message,
          });
          updatedData.push({
            id: messageIdCounter++,
            sender: "bot",
            text: element.bot_response,
          });
        });
        setMessages(updatedData);
      }
    } else {
      setIsFetchedConversation(false);
      setMessages([]);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchConversation();
  }, [sessionIdParams, sessionHistory, session?.data?.user.id]);

  return (
    <div className="h-[calc(100vh_-_64px)] w-full flex flex-col">
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        <div className="p-3">
          <h2 className="text-2xl font-semibold">
            Hi {session.data?.user?.name},
          </h2>
          <div className="my-3 text-sm">
            I’m Gino...your provider’s screening assistant. It’s great to meet
            you, Jane D! Let’s start by getting to know each other.
            <br />
            <br />
            How have you been feeling recently?
          </div>
        </div>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-3 rounded-lg text-sm text-black max-w-[75%] ${
                msg.sender === "user" ? "bg-[#79D8FE]/20 " : "bg-white"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isFetchedConversationLoading && (
          <div className="animate-pulse flex space-x-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          </div>
        )}
        <div ref={scrollTargetRef} />
      </div>
      <div className="h-auto border-t bg-white flex flex-col p-2">
        <textarea
          disabled={isSubmitting || isFetchedConversation}
          ref={textareaRef}
          placeholder="Type here..."
          onKeyDown={handleKeyDown}
          onChange={handleInput}
          rows={1}
          className="p-2 focus:outline-0 resize-none w-full"
          style={{
            maxHeight: "120px",
          }}
        />
        <div className="flex justify-between items-center">
          <button className="rounded-full border flex items-center justify-center mt-1 h-9 w-9">
            <PlusIcon size={20} />
          </button>
          <button
            disabled={isSubmitting || isFetchedConversation}
            onClick={handleSubmit}
            className={`rounded-full border flex items-center justify-center mt-1 h-9 ${
              isFetchedConversation || isSubmitting
                ? "w-fit px-2 duration-300 bg-blue-500 text-white text-sm cursor-not-allowed"
                : "w-9 hover:cursor-pointer"
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <LoaderCircleIcon className="animate-spin mr-1" />
                Please wait...
              </span>
            ) : (
              <ArrowUpIcon size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
