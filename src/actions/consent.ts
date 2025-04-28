"use server";

import { prismaDB } from "@/lib/connect-db";

export const consentSubmit = async (userId: string) => {
  try {
    const user = await prismaDB.user.findUnique({
      where: { id: userId },
    });

    if (user) {
      await prismaDB.user.update({
        where: { id: userId },
        data: { iConsent: true },
      });
      return { success: true, message: `Consent updated for user: ${userId}` };
    } else {
      return { success: false, message: `User not found: ${userId}` };
    }
  } catch (error) {
    console.error("Error updating consent:", error);
    return { success: false, message: `Error updating consent: ${error}` };
  }
};
