"use server";

export const sendMessage = async (
  userId: string,
  message: string,
  sessionId: string
) => {
  const response = await fetch(
    "https://od9p3fgre8.execute-api.us-east-1.amazonaws.com/postMessage",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pass: "oariest9w8t94ht943hd7t98dar9std9r7sdt",
        message: message,
        sessionId: sessionId,
        userId, // "ea5a7486-d787-4033-903f-86b7aa687d1f",
      }),
    }
  );
  const responseData = await response.json();
  return responseData;
};
