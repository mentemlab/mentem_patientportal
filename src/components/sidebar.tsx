"use client";

import { ArrowLeftToLineIcon } from "lucide-react";
import React, { useEffect } from "react";
import { Button } from "./ui/button";
import UserButton from "./user-btn";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { v4 as uuid4 } from "uuid";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { useAppContext } from "@/context/useAppContext";


const SidebarComponent = () => {
  const { sessionHistory, isSidebarOpen, toggleSidebar } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    const newSessionId = uuid4();
    router.replace(`/?sessionId=${newSessionId}`);
  }, [router]);

  return (
    <React.Fragment>
      <aside className="hidden sm:block h-screen fixed w-72 bg-[#EAEDEF] px-3 ">
        <div className="h-16 flex items-center justify-between mb-4">
          <h1 className="text-2xl font-normal">MENTEM</h1>
          <button className="h-8 w-8 flex items-center justify-center">
            <ArrowLeftToLineIcon size={20} />
          </button>
        </div>
        <Button
          variant={"outline"}
          className="rounded-xs w-full cursor-pointer bg-transparent border-black"
          onClick={() => {
            const newSessionId = uuid4();
            router.replace(`/?sessionId=${newSessionId}`);
          }}
        >
          Start a new conversation
        </Button>
        <div className="mt-10">
          <h4 className="text-sm font-semibold">Conversation history</h4>
          <ul className="text-sm  mt-5">
            {sessionHistory.length === 0 ? (
              <li>No conversation history available.</li>
            ) : (
              sessionHistory.map((el) => (
                <li
                  key={el.session_id}
                  className="py-2 ps-2 border-b border-gray-300 hover:bg-gray-200"
                >
                  <Link href={`/?sessionId=${el.session_id}`} className="block">
                    {format(new Date(el.timestamp), "MMMM d, yyyy")}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="border-t px-4 flex items-center w-full justify-center border-black/20 absolute left-0 right-0 bottom-0 h-20">
          <UserButton />
        </div>
      </aside>
      <Sheet open={isSidebarOpen} onOpenChange={toggleSidebar}>
        <SheetContent side="left" className="bg-[#EAEDEF] w-72 max-w-72">
          <SheetHeader hidden>
            <SheetTitle></SheetTitle>
            <SheetDescription></SheetDescription>
          </SheetHeader>
          <aside className="  px-3 ">
            <div className="h-16 flex items-center justify-between mb-4">
              <h1 className="text-2xl font-normal">MENTEM</h1>
            </div>
            <Button
              variant={"outline"}
              onClick={() => {
                const newSessionId = uuid4();
                router.replace(`/?sessionId=${newSessionId}`);
              }}
              className="rounded-xs w-full cursor-pointer bg-transparent border-black"
            >
              Start a new conversation
            </Button>
            <div className="mt-10">
              <h4 className="text-sm font-semibold">Conversation history</h4>
              <ul className="text-sm  mt-5">
                {sessionHistory.length === 0 ? (
                  <li>No conversation history available.</li>
                ) : (
                  sessionHistory.map((el) => (
                    <li
                      key={el.session_id}
                      className="py-2 ps-2 border-b border-gray-300 hover:bg-gray-200"
                    >
                      <Link
                        href={`/?sessionId=${el.session_id}`}
                        className="block"
                      >
                        {format(new Date(el.timestamp), "MMMM d, yyyy")}
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div className="border-t px-4 flex items-center w-full justify-center border-black/20 absolute left-0 right-0 bottom-0 h-20">
              <UserButton />
            </div>
          </aside>
        </SheetContent>
      </Sheet>
    </React.Fragment>
  );
};

export default SidebarComponent;
