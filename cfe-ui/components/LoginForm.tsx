"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff } from "react-icons/fi";
import {getRequestSingle} from "../src/app/api/serverRequests/methods"

export default function LoginForm() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [showSendEmailLink, setShowSendEmailLink] = useState<boolean>(false);
  const [emailToVerify, setEmailToVerify] = useState<string>("");


  const router = useRouter();

  // ni ovo ga ne ubrzava
  // useEffect(() => {
  //   router.prefetch("/register");
  // },[]);

  const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        if (res.error === "Email is not verified!") {
          setError("Nalog nije verifikovan. Proverite svoj mejl.");
          setEmailToVerify(email);
          setShowSendEmailLink(true);
        } else {
          setError("Nevalidni kredencijali!");
          setShowSendEmailLink(false);
        }

        setIsLoading(false);
        return;
      }
      const userRes = await getRequestSingle(`users/email/${encodeURIComponent(email)}`);
      //const userRes = await fetch("http://localhost:5000" + "/user/getUserByEmail" + `?email=${email}`);
      //const userRes = await fetch(`/api/user?email=${email}`);
      const userData = await userRes.json();

      router.replace("editor");
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const handleResendVerification = (e: React.MouseEvent<HTMLButtonElement>) => {
    // TODO 

    //e.preventDefault();
   // const verificationTokenNew = crypto.randomBytes(32).toString("hex");
    // pozvati api poziv koji handluje ovo...
    setEmailToVerify("");
    setShowSendEmailLink(false);
    setError("");
  };

  return (
  <div className="flex items-center justify-center min-h-screen bg-[#0f172a] px-4">
    <div className="w-full max-w-md bg-[#1e293b] shadow-xl rounded-xl p-8 border border-[#334155]">
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-semibold text-white mb-6 text-center">
            Ulogujte se
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="text"
              placeholder="Email"
              className="px-4 py-3 rounded-md bg-[#0f172a] text-white placeholder-gray-400 border border-[#334155] focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />

            <div className="relative">
              <input
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="Šifra"
                className="w-full px-4 py-3 pr-10 rounded-md bg-[#0f172a] text-white placeholder-gray-400 border border-[#334155] focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <div
                className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-400"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </div>
            </div>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition duration-200"
            >
              Prijavi se
            </button>

            {error && (
              <div className="bg-red-500/10 text-red-400 text-sm py-2 px-4 rounded-md border border-red-400/30">
                <div>{error}</div>
                {showSendEmailLink && (
                  <div className="text-sm mt-2 text-red-400">
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      className="text-blue-400 hover:underline ml-2"
                    >
                      Pošalji ponovo verifikacioni mejl
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="text-sm text-center text-gray-400 mt-4">
              Nemate nalog?{" "}
              <Link href="/register" prefetch={true} className="text-blue-400 hover:underline">
                Registrujte se
              </Link>
            </div>
          </form>
        </>
      )}
    </div>
  </div>
);
}