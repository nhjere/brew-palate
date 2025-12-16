import { useEffect, useRef, useState } from "react";
import supabase from "../supabaseClient";

const HAD_SESSION_KEY = "bp_had_session";
const SHOW_ON_RELOAD_FLAG = "bp_showLogoutModal";
const AUTH_ROUTES = ["/login", "/register", "/about"];
const isAuthRoute = () => AUTH_ROUTES.some(p => window.location.pathname.startsWith(p));

export default function LogOut({ loginPath = "/login" }) {
  const [show, setShow] = useState(false);
  const timerRef = useRef(null);
  const skip = isAuthRoute();

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
    timerRef.current = setTimeout(showModal, delay);
  };

  useEffect(() => {
    // If we’re on an auth route, don’t wire up listeners or timers.
    if (skip) return;

    let unsub = null;

    (async () => {
      // Only show "reload-triggered" modal on non-auth pages
      if (sessionStorage.getItem(SHOW_ON_RELOAD_FLAG) === "1") {
        sessionStorage.removeItem(SHOW_ON_RELOAD_FLAG);
        showModal();
        return;
      }

      const { data } = await supabase.auth.getSession();
      const session = data?.session;

      if (session) {
        localStorage.setItem(HAD_SESSION_KEY, "1");
        scheduleExpiry(session);
      } else if (localStorage.getItem(HAD_SESSION_KEY) === "1") {
        // Session used to exist -> expired on a protected route
        showModal();
      }

      const { data: listener } = supabase.auth.onAuthStateChange(
        (event, newSession) => {
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
              // Token is bad: trigger a refresh; show modal after reload
              sessionStorage.setItem(SHOW_ON_RELOAD_FLAG, "1");
              window.location.reload();
              break;
            case "SIGNED_OUT": {
              // Don’t show modal if the user explicitly clicked "Log out"
              const userInitiated =
                sessionStorage.getItem("bp_user_logout") === "1";
              sessionStorage.removeItem("bp_user_logout");
              if (userInitiated) {
                window.location.assign(loginPath);
              } else {
                showModal();
              }
              break;
            }
            default:
              if (newSession) scheduleExpiry(newSession);
              break;
          }
        }
      );

      unsub = () => listener?.subscription?.unsubscribe?.();
    })();

    return () => {
      clearTimer();
      unsub?.();
    };
  }, [skip, loginPath]);

  // On auth routes or if not showing, render nothing
  if (skip || !show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        <div className="text-center flex flex-col items-center">
          <h2 className="text-xl font-bold text-[#8C6F52]">
            Session Expired
          </h2>
          <p className="mt-2 text-sm text-slate-600 max-w-xs">
            Your session has ended. Please log back in to continue using BrewPalate.
          </p>
          <div className="mt-6 flex justify-center w-full">
            <button
              onClick={() => window.location.assign(loginPath)}
              className="
                rounded-full px-6 py-2
                bg-[#3C547A] text-white text-sm font-semibold
                hover:bg-[#314466] transition-colors
              "
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
