"use client";

import { FiEye, FiEyeOff } from "react-icons/fi";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {postRequest} from "../src/app/api/serverRequests/methods"

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (!name || !email || !password || !confirmPassword) {
      setError("Sva polja su neophodna!");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Lozinke se ne podudaraju!");
      setIsLoading(false);
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\S]{10,}$/;
    //(?=.*[A-Z]) – bar jedno veliko slovo
    //(?=.*\d) – bar jedan broj
    //(?=.*[^A-Za-z\d]) – bar jedan specijalni karakter
    // {10,} – najmanje 10 karaktera
    
    if (!passwordRegex.test(password)) {
      setError("The password must be at least 10 characters long and include one uppercase letter, one number, and one special character.");
      setIsLoading(false);
      return;
    }

try {
  const data = {
    username: name,
    email,
    password,
  };

  //nova ruta
  const res = await postRequest("users/create", data);
  const ans = await res.json();
  const ansUser = ans?.data;
  console.log(ansUser);

  if (!res.ok) {
    setIsLoading(false);
    setError(ansUser?.message ?? "Registracija nije uspela.");
    return;
  }

  const rootDirData = {
    name: `${ansUser.username}'s root directory`,
    owner: ansUser._id,
    parents: [], // neka ga
    children: [],
    files: [],
    collaborators: [],
  };

  // 
  const userRootDirectory = await postRequest("directories/create", rootDirData);
  const ansRootDir = await userRootDirectory.json(); //

  if (userRootDirectory.ok) {
    console.log("Registracija uspela.");
    (e.target as HTMLFormElement).reset();
    router.push("/");
  } else {
    setIsLoading(false);
    setError((ansRootDir?.message ?? "Greška pri kreiranju root direktorijuma. ->" + ansRootDir?.message));
  }
} catch (error) {
      console.log("Greška prilikom registracije: ", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="w-full max-w-md bg-slate-800/50 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border border-slate-700/50">
        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 animate-pulse">Kreiranje naloga...</p>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-white mb-2">
                Napravi nalog
              </h1>
              <p className="text-slate-400">Pridružite se našoj zajednici</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300 ml-1">Korisničko ime</label>
                <input
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  placeholder="npr. jovan_jovanovic"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 text-white placeholder-slate-500 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300 ml-1">Email</label>
                <input
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

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300 ml-1">Potvrdi šifru</label>
                <div className="relative">
                  <input
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-11 rounded-xl bg-slate-900/50 text-white placeholder-slate-500 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                    onClick={() => setShowConfirm((prev) => !prev)}
                  >
                    {showConfirm ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-900/20 transition-all duration-200 active:scale-[0.98]"
              >
                Registruj se
              </button>

              {error && (
                <div className="bg-red-500/10 text-red-400 text-sm py-3 px-4 rounded-xl border border-red-500/20 animate-in fade-in slide-in-from-top-1">
                  {error}
                </div>
              )}

              <div className="text-sm text-center text-slate-400 mt-2">
                Već imate nalog?{" "}
                <Link href="/" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  Prijavite se
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}