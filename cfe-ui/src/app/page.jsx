import LoginForm from "../../components/LoginForm";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../lib/authOptions";

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    console.log(`Sesija postoji ${session}`)
    redirect("/editor");
  } 

  return (
    <main>
      <LoginForm />
    </main>
  );
}