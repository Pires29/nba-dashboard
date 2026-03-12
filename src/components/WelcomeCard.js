import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import React from "react";

export async function WelcomeCard() {
  const session = await getServerSession(authOptions);

  console.log("user session", session);
  return (
    <>
      {session ? (
        <div className="border border-solid border-blue-400 rounded-md p-6 w-fit">
          <p>Olá {session.user.name}</p>
        </div>
      ) : (
        <div>VAI TE LOGAR BOI</div>
      )}
    </>
  );
}
