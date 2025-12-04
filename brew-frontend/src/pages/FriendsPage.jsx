// src/pages/FriendsPage.jsx
import { useParams } from "react-router-dom";
import Friends from "../components/user/Friends";
import SuggestedFriends from "../components/user/SuggestedFriends";
import NewHeader from "../components/user/UserHeader.jsx";

export default function FriendsPage() {
  const { userId } = useParams();   // 👈 grabs it from /user/friends/:userId
  console.log("FriendsPage userId:", userId); // sanity check

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#fff4e6] flex flex-col">
    < NewHeader /> 
      {/* <h1 className="text-4xl font-bold text-amber-900 mb-6">Friends</h1> */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side: mutuals (your existing component) */}
        {/* <div className="lg:col-span-1">
          <Friends withShell={false} userId={userId} />
        </div> */}

        {/* Right side: suggested friends */}
        <div className="lg:col-span-2 p-4">
          <SuggestedFriends withShell={true} userId={userId} />
        </div>
      </div>
    </div>
  );
}


