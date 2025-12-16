import { Link } from 'react-router-dom';
import Search from '../user/Search';
import bp_logo from '../../assets/final_logo.png';
import avatar from "../../assets/avatar.svg";

export default function BrewerHeader({ searchQ, setSearchQ }) {
    const brewerId = localStorage.getItem('brewer_id');

    return (
        <header className="w-full flex justify-between items-center bg-white px-6 py-4 ">
            
            {/* Logo + Title */}
            <Link to={`/brewer/dashboard/${brewerId}`} className="flex items-center space-x-3">
                <img
                    src={bp_logo}
                    alt="BrewPalate Logo"
                    className="h-23 w-23 object-contain"
                />
                <h1 className="text-4xl font-extrabold !text-[#8C6F52]">BrewPalate</h1>
            </Link>

            {/* Pages (MATCH user header exact spacing) */}
            <div className="flex items-center space-x-6 flex-grow justify-right">

                <Link
                    to={`/brewer/analytics/${brewerId}`}
                    className="text-md font-medium !text-[#8C6F52] hover:underline ml-10"
                >
                    Analytics
                </Link>

                <Link
                    to="/about"
                    state={{ from: "brewer" }}
                    className="text-md font-medium !text-[#8C6F52] hover:underline ml-10"
                >
                    About
                </Link>
            </div>

            {/* Search */}
            <div className="mr-4">
                <Search value={searchQ} onSearch={setSearchQ} />
            </div>

            {/* Avatar */}
            <Link
                to={`/brewer/profile/${brewerId}`}
                className="flex items-center mr-5 justify-center space-x-3"
            >
                <img
                    src={avatar}
                    alt="BrewPalate Logo"
                    className="h-10 w-10 object-contain"
                />
            </Link>
        </header>
    );
}
