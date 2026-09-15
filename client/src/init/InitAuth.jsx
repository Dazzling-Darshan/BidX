import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "../store/auth/authSlice";
import LoadingScreen from "../components/LoadingScreen";
import { connectSocket } from "../config/socket.js";
import toast from "react-hot-toast";

const InitAuth = ({ children }) => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const didRun = useRef(false);

  useEffect(() => {
    if (!didRun.current) {
      dispatch(checkAuth());
      didRun.current = true;
    }
  }, [dispatch]);

  // Global Real-time Outbid Alert Listener
  useEffect(() => {
    const currentUserId = user?.user?._id;
    if (!currentUserId) return;

    const socket = connectSocket();

    const handleOutbid = ({ auctionId, itemName, newAmount, outbidBy }) => {
      toast(
        (t) => (
          <div className="flex items-start gap-3 py-0.5">
            <span className="text-xl shrink-0">⚠️</span>
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-900">
                You&apos;ve been outbid!
              </p>
              <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">
                <span className="font-semibold text-gray-800">{outbidBy}</span>{" "}
                placed a bid of{" "}
                <span className="font-bold text-indigo-600 tabular-nums">
                  Rs {newAmount}
                </span>{" "}
                on <span className="font-medium text-gray-900">&ldquo;{itemName}&rdquo;</span>.
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <a
                  href={`/auction/${auctionId}`}
                  onClick={() => toast.dismiss(t.id)}
                  className="px-3 py-1 bg-indigo-600 text-white text-[11px] font-bold rounded-lg hover:bg-indigo-700 transition inline-flex items-center gap-1 shadow-sm"
                >
                  Bid Again &rarr;
                </a>
                <button
                  type="button"
                  onClick={() => toast.dismiss(t.id)}
                  className="text-[11px] text-gray-400 hover:text-gray-600 px-2 py-1 font-medium cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        ),
        {
          duration: 9000,
          style: {
            border: "1px solid #fecdd3",
            background: "#fff1f2",
            maxWidth: "380px",
          },
        },
      );
    };

    socket.on("auction:outbid", handleOutbid);

    return () => {
      socket.off("auction:outbid", handleOutbid);
    };
  }, [user?.user?._id]);

  if (loading && !didRun.current) return <LoadingScreen />;

  return children;
};

export default InitAuth;
