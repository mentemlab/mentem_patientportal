"use server";

import { prismaDB } from "@/lib/connect-db";
import { saltAndHashPassword } from "@/utils/saltAndHashPassword";

export const signupAction = async (
  formData: FormData
): Promise<{ success: boolean; message: string }> => {
  const fname = formData.get("fName") as string;
  const lname = formData.get("lName") as string;
  const zip = formData.get("zip") as string;
  const emergencyName = formData.get("emergencyName") as string;
  const emergencyPhone = formData.get("emergencyPhone") as string;
  const insuranceCompany = formData.get("insuranceCompany") as string;
  const servicePreference = formData.get("servicePreference") as string;
  const gender = formData.get("gender") as string;
  const dob = formData.get("dob") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!fname || !email || !password || !gender || !dob || !zip || !servicePreference) {
    return {
      success: false,
      message: "All fields are required..",
    };
  }

  const emailFound = await prismaDB.user.findUnique({ where: { email } });
  if (emailFound) {
    return {
      success: false,
      message: "Email already exists.",
    };
  }

  const hashPassword = await saltAndHashPassword(password);

  await prismaDB.user.create({
    data: {
      firstName: fname,
      lastName: lname,
      email,
      password: hashPassword,
      gender,
      dob,
      zipCode: zip,
      insuranceCompany,
      servicePreference,
      emergencyName,
      emergencyPhone,
    },
  });
  return {
    success: true,
    message: "Signup successfully",
  };
};
