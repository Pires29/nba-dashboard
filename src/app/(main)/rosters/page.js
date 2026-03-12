// src/app/rosters/page.js
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import Rosters from "./Rosters"; 

export default async function RostersPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  return <Rosters />;
}