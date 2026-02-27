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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="w-full max-w-md bg-slate-800/50 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border border-slate-700/50">
        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 animate-pulse">Prijavljivanje...</p>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-white mb-2">
                Dobrodošli nazad
              </h1>
              <p className="text-slate-400">Ulogujte se u svoj nalog</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300 ml-1">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 text-white placeholder-slate-500 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300 ml-1">Šifra</label>
                <div className="relative">
                  <input
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-11 rounded-xl bg-slate-900/50 text-white placeholder-slate-500 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-900/20 transition-all duration-200 active:scale-[0.98]"
              >
                Prijavi se
              </button>

              {error && (
                <div className="bg-red-500/10 text-red-400 text-sm py-3 px-4 rounded-xl border border-red-500/20 animate-in fade-in slide-in-from-top-1">
                  <div className="font-medium">{error}</div>
                  {showSendEmailLink && (
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        className="text-blue-400 hover:text-blue-300 underline underline-offset-4 transition-colors"
                      >
                        Pošalji ponovo verifikacioni mejl
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="text-sm text-center text-slate-400 mt-2">
                Nemate nalog?{" "}
                <Link href="/register" prefetch={true} className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
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