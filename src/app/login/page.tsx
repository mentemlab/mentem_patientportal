"use client";

import type React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { getSession, signIn, useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { signupAction } from "@/actions/signup";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { consentSubmit } from "@/actions/consent";

const signupSchema = z.object({
  fName: z.string().min(1, { message: "First name is required" }),
  lName: z.string().min(1, { message: "Last name is required" }),
  dob: z.string().min(1, { message: "Date of birth is required" }),
  zip: z.string().min(1, { message: "Zip code is required" }),
  insuranceCompany: z
    .string()
    .min(1, { message: "Insurance company is required" }),
  emergencyName: z
    .string()
    .min(1, { message: "Emergency contact name is required" }),
  emergencyPhone: z.string().refine((val) => /^\+?[1-9]\d{1,14}$/.test(val), {
    message: "Invalid phone number",
  }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});

interface SignupFormData {
  fName: string;
  lName: string;
  dob: string;
  zip: string;
  insuranceCompany: string;
  emergencyName: string;
  emergencyPhone: string;
  email: string;
  password: string;
}


export default function LoginPage() {
  const { data: session,  update } = useSession();
  const router = useRouter();
  const methods = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = methods;
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [servicePreference, setServicePreference] = useState<
    "online" | "in-person"
  >("online");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showConsentForm, setShowConsentForm] = useState(false);
  const [consentChecked, setConsentChecked] = useState<boolean>(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const loginRes = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    toast[loginRes?.error ? "error" : "success"](
      loginRes?.error ? "Login failed. Try again." : "Login successful!"
    );

    const updatedSession = await getSession();
    if (updatedSession?.user.iConsent) {
      router.replace("/");
    } else {
      setShowConsentForm(true);
    }
  };

  const signupSubmit = async (data: SignupFormData) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    formData.append("gender", gender);
    formData.append("servicePreference", servicePreference);

    const response = await signupAction(formData);

    if (response.success) {
      toast.success(response.message);
      clearForm();
    } else {
      toast.error(response.message);
    }
  };
  const clearForm = () => {
    reset({
      fName: "",
      lName: "",
      dob: "",
      zip: "",
      insuranceCompany: "",
      emergencyName: "",
      emergencyPhone: "",
      email: "",
      password: "",
    });
    setGender("male");
    setServicePreference("online");
  };

  const submitConsent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const iConsent = formData.get("iConsent");
    if (iConsent) {
      const res = await consentSubmit(session?.user.id ?? "defaultId");
      if (res && res.success) {
        await update({
          ...session,
        });
      }
    }
  };

  useEffect(() => {
    if (session?.user.iConsent) {
      router.replace("/");
    }
  }, [session, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative ">
      <div className="w-full h-[55vh] bg-gradient-to-b from-blue-700 to-blue-400 flex justify-center">
        <h1 className="text-4xl font-light text-white mt-30">MENTEM</h1>
      </div>

      <div className="w-full min-h-[45vh] max-h-screen flex items-center justify-center"></div>

      <div className="w-full max-w-xl absolute top-1/4 left-1/2 transform -translate-x-1/2 bg-transparent">
        <div className="rounded-lg bg-white m-3 p-6 shadow-lg ">
          <h1 className="font-semibold text-xl mb-4">
            {showConsentForm ? "Consent" : "Welcome,"}
          </h1>
          {showConsentForm ? (
            <div>
              <p>
                Gino is committed to protecting your privacy. To proceed, we
                need your consent to do a screening using our software. None of
                your data will be shared with any third parties.
              </p>
              <form onSubmit={submitConsent}>
                <div className="inline-flex items-center gap-2 mt-8">
                  <Checkbox
                    onCheckedChange={(checked: boolean) =>
                      setConsentChecked(checked)
                    }
                    id="i-consent"
                    className="border-black"
                    name="iConsent"
                  />
                  <Label htmlFor="i-consent">
                    I consent the use of my data during screening purposes only
                  </Label>
                </div>
                <Button
                  type="submit"
                  disabled={!consentChecked}
                  className="w-full mt-5 bg-[#49c9fc] hover:bg-[#49c9fc]/90 text-black"
                >
                  Continue
                </Button>
              </form>
            </div>
          ) : (
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Log In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email">Email</label>
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password">Password</label>
                    <Input
                      id="password"
                      type="password"
                      name="password"
                      placeholder="•••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full"
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) =>
                        setRememberMe(checked as boolean)
                      }
                    />
                    <label
                      htmlFor="remember"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Remember me
                    </label>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Link
                      href="#"
                      className="text-sm text-blue-500 hover:underline"
                    >
                      Forgot Password?
                    </Link>
                    <Button
                      type="submit"
                      className="bg-blue-400 hover:bg-blue-500"
                    >
                      Log In
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <FormProvider {...methods}>
                  <form
                    onSubmit={handleSubmit(signupSubmit)}
                    className="space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-2"
                  >
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="f-name">First Name</Label>
                      <Controller
                        name="fName"
                        control={control}
                        // rules={{ required: "First name is required" }}
                        render={({ field }) => (
                          <div>
                            <Input
                              id="f-name"
                              {...field}
                              className={cn(
                                "w-full",
                                errors.fName && "border-red-500"
                              )}
                            />
                            {errors.fName && (
                              <p className="text-red-500 text-sm">
                                {errors.fName.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="l-name">Last Name</Label>
                      <Controller
                        name="lName"
                        control={control}
                        rules={{ required: "Last name is required" }}
                        render={({ field }) => (
                          <div>
                            <Input id="l-name" {...field} className="w-full" />
                            {errors.lName && (
                              <p className="text-red-500 text-sm">
                                {errors.lName.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={gender}
                        onValueChange={(val: "male" | "female" | "other") =>
                          setGender(val)
                        }
                      >
                        <SelectTrigger className="w-full" id="gender">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dob">Date of Birth</Label>
                      <Controller
                        name="dob"
                        control={control}
                        rules={{ required: "Date of birth is required" }}
                        render={({ field }) => (
                          <div>
                            <Input
                              id="dob"
                              type="date"
                              {...field}
                              className="w-full"
                            />
                            {errors.dob && (
                              <p className="text-red-500 text-sm">
                                {errors.dob.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">Zip Code</Label>
                      <Controller
                        name="zip"
                        control={control}
                        rules={{ required: "Zip code is required" }}
                        render={({ field }) => (
                          <div>
                            <Input id="zip" {...field} className="w-full" />
                            {errors.zip && (
                              <p className="text-red-500 text-sm">
                                {errors.zip.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="insuranceCompany">
                        Insurance Company
                      </Label>
                      <Controller
                        name="insuranceCompany"
                        control={control}
                        rules={{ required: "Insurance company is required" }}
                        render={({ field }) => (
                          <div>
                            <Input
                              id="insuranceCompany"
                              {...field}
                              className="w-full"
                            />
                            {errors.insuranceCompany && (
                              <p className="text-red-500 text-sm">
                                {errors.insuranceCompany.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="service">Service Preference</Label>
                      <RadioGroup
                        defaultValue="online"
                        className="flex pt-1"
                        value={servicePreference}
                        onValueChange={(val: "online" | "in-person") =>
                          setServicePreference(val)
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="online" id="online" />
                          <Label htmlFor="online">Online</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="in-person" id="in-person" />
                          <Label htmlFor="in-person">In Person</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="sm:col-span-2">
                      <h4 className="text-lg font-semibold">
                        Emergency Contact
                      </h4>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergency-name ">Name</Label>
                      <Controller
                        name="emergencyName"
                        control={control}
                        rules={{
                          required: "Emergency contact name is required",
                        }}
                        render={({ field }) => (
                          <div>
                            <Input
                              id="emergency-name"
                              {...field}
                              className="w-full"
                            />
                            {errors.emergencyName && (
                              <p className="text-red-500 text-sm">
                                {errors.emergencyName.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>
                    <div className="space-y-2 ">
                      <Label htmlFor="emergency-phone">Phone</Label>
                      <Controller
                        name="emergencyPhone"
                        control={control}
                        rules={{
                          required: "Emergency contact phone is required",
                        }}
                        render={({ field }) => (
                          <div>
                            <Input
                              id="emergency-phone"
                              {...field}
                              className="w-full"
                            />
                            {errors.emergencyPhone && (
                              <p className="text-red-500 text-sm">
                                {errors.emergencyPhone.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <h4 className="text-lg font-semibold">Authentication</h4>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Controller
                        name="email"
                        control={control}
                        rules={{
                          required: "Email is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email",
                          },
                        }}
                        render={({ field }) => (
                          <div>
                            <Input
                              id="email"
                              {...field}
                              className="w-full"
                              autoComplete="email"
                            />
                            {errors.email && (
                              <p className="text-red-500 text-sm">
                                {errors.email.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Controller
                        name="password"
                        control={control}
                        rules={{ required: "Password is required" }}
                        render={({ field }) => (
                          <div>
                            <Input
                              id="password"
                              type="password"
                              {...field}
                              className="w-full"
                              autoComplete="new-password"
                            />
                            {errors.password && (
                              <p className="text-red-500 text-sm">
                                {errors.password.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <Button
                        type="submit"
                        className="bg-blue-400 hover:bg-blue-500"
                      >
                        Sign Up
                      </Button>
                    </div>
                  </form>
                </FormProvider>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}
