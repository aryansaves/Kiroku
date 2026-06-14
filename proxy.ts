import { NextResponse, type NextRequest } from "next/server";

const ROOT_DOMAIN =
  process.env.NEXT_PUBLIC_ROOT_DOMAIN?.replace(/^https?:\/\//, "") ??
  "kiroku.com";

const reservedSubdomains = new Set(["www", "api", "app", "admin"]);

export function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0] ?? "";
  const pathname = request.nextUrl.pathname;

  if (
    host.endsWith(`.${ROOT_DOMAIN}`) &&
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/api")
  ) {
    const username = host.slice(0, -ROOT_DOMAIN.length - 1);

    if (username && !reservedSubdomains.has(username)) {
      const url = request.nextUrl.clone();
      url.pathname = `/u/${username}${pathname === "/" ? "" : pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
