import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type UserRole =
  | "castodia_owner"
  | "castodia_admin"
  | "manager"
  | "support";

const portalHome: Record<UserRole, string> = {
  support: "/support/dashboard",
  manager: "/manager/dashboard",
  castodia_admin: "/platform/dashboard",
  castodia_owner: "/platform/dashboard",
};

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const isSupportRoute = pathname.startsWith("/support");
  const isManagerRoute = pathname.startsWith("/manager");
  const isPlatformRoute = pathname.startsWith("/platform");

  const isProtectedRoute =
    isSupportRoute || isManagerRoute || isPlatformRoute;

  if (!user && isProtectedRoute) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";

    return NextResponse.redirect(loginUrl);
  }

  if (!user) {
    return response;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

console.log("Middleware profile result:", {
  userId: user.id,
  profile,
  profileError,
});

  if (profileError || !profile) {
    await supabase.auth.signOut();

    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("error", "profile_not_found");

    return NextResponse.redirect(loginUrl);
  }

  const role = profile.role as UserRole;

  const isKnownRole =
    role === "support" ||
    role === "manager" ||
    role === "castodia_admin" ||
    role === "castodia_owner";

  if (!isKnownRole) {
    await supabase.auth.signOut();

    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("error", "invalid_role");

    return NextResponse.redirect(loginUrl);
  }

  let hasAccess = true;

  if (isSupportRoute) {
    hasAccess = role === "support" || role === "manager";
  }

  if (isManagerRoute) {
    hasAccess = role === "manager";
  }

  if (isPlatformRoute) {
    hasAccess =
      role === "castodia_admin" || role === "castodia_owner";
  }

  if (isProtectedRoute && !hasAccess) {
    const authorisedHomeUrl = request.nextUrl.clone();
    authorisedHomeUrl.pathname = portalHome[role];
    authorisedHomeUrl.search = "";

    return NextResponse.redirect(authorisedHomeUrl);
  }

  return response;
}