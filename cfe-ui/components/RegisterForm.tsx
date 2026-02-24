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
  <div className="flex items-center justify-center min-h-screen bg-[#0f172a] px-4">
    <div className="w-full max-w-md bg-[#1e293b] shadow-xl rounded-xl p-8 border border-[#334155]">
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-semibold text-white mb-6 text-center">
            Napravi nalog
          </h1>
          {/*ime*/ }
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="Ime"
              className="px-4 py-3 rounded-md bg-[#0f172a] text-white placeholder-gray-400 border border-[#334155] focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />

            {/*email*/ }
            <input
              onChange={(e) => setEmail(e.target.value)}
              type="text"
              placeholder="Email"
              className="px-4 py-3 rounded-md bg-[#0f172a] text-white placeholder-gray-400 border border-[#334155] focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            {/*sifra*/ }
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
            {/*potvrdi sifru*/ }
            <div className="relative">
              <input
                onChange={(e) => setConfirmPassword(e.target.value)}
                type={showConfirm ? "text" : "password"}
                placeholder="Potvrdi šifru"
                className="w-full px-4 py-3 pr-10 rounded-md bg-[#0f172a] text-white placeholder-gray-400 border border-[#334155] focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <div
                className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-400"
                onClick={() => setShowConfirm((prev) => !prev)}
              >
                {showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </div>
            </div>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition duration-200"
            >
              Registruj se
            </button>

            {error && (
              <div className="bg-red-500/10 text-red-400 text-sm py-2 px-4 rounded-md border border-red-400/30">
                {error}
              </div>
            )}

            <div className="text-sm text-center text-gray-400 mt-4">
              Već imate nalog?{" "}
              <Link href="/" className="text-blue-400 hover:underline">
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