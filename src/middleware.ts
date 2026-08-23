import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Guard all paths except static assets, api routes, and public files
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
