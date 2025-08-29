import { useEffect, useRef, useState } from "react";
import supabase from "../supabaseClient";

const HAD_SESSION_KEY = "bp_had_session";
const SHOW_ON_RELOAD_FLAG = "bp_showLogoutModal";
const AUTH_ROUTES = ["/login", "/register", "/about"];
const isAuthRoute = () => AUTH_ROUTES.some(p => window.location.pathname.startsWith(p));

export default function LogOut({ loginPath = "/login" }) {
  const [show, setShow] = useState(false);
  const timerRef = useRef(null);

  // Never render the modal on auth routes
  if (isAuthRoute()) return null;

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const showModal = () => {
    clearTimer();
    setShow(true);
  };

  const scheduleExpiry = (session) => {
    clearTimer();
    if (!session?.expires_at) return;
    const msLeft = session.expires_at * 1000 - Date.now();
    const delay = Math.max(0, msLeft - 1000);
    timerRef.current = setTimeout(() => showModal(), delay);
  };

  useEffect(() => {
    let unsub = null;

    (async () => {
      // Only show the "reload-triggered" modal on non-auth pages
      if (!isAuthRoute() && sessionStorage.getItem(SHOW_ON_RELOAD_FLAG) === "1") {
        sessionStorage.removeItem(SHOW_ON_RELOAD_FLAG);
        showModal();
        return;
      }

      const { data } = await supabase.auth.getSession();
      const session = data?.session;

      if (session) {
        localStorage.setItem(HAD_SESSION_KEY, "1");
        scheduleExpiry(session);
      } else if (localStorage.getItem(HAD_SESSION_KEY) === "1" && !isAuthRoute()) {
        // Session used to exist -> expired on a protected route
        showModal();
      }

      const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
        switch (event) {
          case "INITIAL_SESSION":
          case "SIGNED_IN":
            if (newSession) {
              localStorage.setItem(HAD_SESSION_KEY, "1");
              scheduleExpiry(newSession);
            }
            break;
          case "TOKEN_REFRESHED":
            scheduleExpiry(newSession);
            break;
          case "TOKEN_REFRESH_FAILED":
            if (!isAuthRoute()) {
              sessionStorage.setItem(SHOW_ON_RELOAD_FLAG, "1");
              window.location.reload();
            }
            break;
          case "SIGNED_OUT": {
            // Don’t show modal if the user explicitly clicked "Log out"
            const userInitiated = sessionStorage.getItem("bp_user_logout") === "1";
            sessionStorage.removeItem("bp_user_logout");
            if (!userInitiated && !isAuthRoute()) showModal();
            break;
          }
          default:
            if (newSession) scheduleExpiry(newSession);
            break;
        }
      });

      unsub = () => listener?.subscription?.unsubscribe?.();
    })();

    return () => {
      clearTimer();
      unsub?.();
    };
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="text-center flex flex-col items-center">
          <h2 className="text-xl font-semibold text-amber-900">Session Expired</h2>
          <p className="mt-2 text-sm text-amber-900 max-w-xs">
            For your security, your session has ended. Please sign in again to continue.
          </p>
          <div className="mt-6 flex justify-center w-full">
            <button
              onClick={() => window.location.assign(loginPath)}
              className="rounded-xl bg-amber-900 px-6 py-2 text-white hover:bg-amber-800"
            >
              Go to login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
