import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
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

  // Public pages
  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return response;
  }

  // Dashboard pages require login
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role;

    // Faculty dashboard: faculty + admin only
    if (pathname.startsWith('/dashboard/faculty')) {
      if (role !== 'faculty' && role !== 'admin') {
        return NextResponse.redirect(
          new URL('/dashboard/student', request.url)
        );
      }
    }

    // Student dashboard: student only
    if (pathname.startsWith('/dashboard/student')) {
      if (role !== 'student') {
        return NextResponse.redirect(
          new URL('/dashboard/faculty', request.url)
        );
      }
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
