import { cache } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// Layouts and pages render in parallel. Cache the session lookup so a single
// request does not run the NextAuth database callback more than once.
export const getCurrentSession = cache(() => getServerSession(authOptions));
