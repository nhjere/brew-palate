import { Link } from 'react-router-dom';
import NewSearch from './NewSearch';
import bp_logo from '../assets/final_logo.png';
import avatar from "../assets/avatar.svg"; 

export default function NewHeader() {
    const userId = localStorage.getItem('user_id');

    return (
        <header className="w-full flex justify-between items-center bg-[#FFF6EB] px-6 py-4 ">
            {/* Logo + Title */}
            <Link to={`/user/dashboard/${userId}`} className="flex items-center space-x-3">
                <img
                    src={bp_logo}
                    alt="BrewPalate Logo"
                    className="h-20 w-20 object-contain"
                />
                <h1 className="text-4xl font-extrabold text-amber-900">BrewPalate</h1>
            </Link>

            {/* Nav + Search */}
            <div className="flex items-center space-x-6 flex-grow justify-center">
                <Link
                    to={`/brewery/dashboard`}
                    className="text-md font-medium !text-amber-900 hover:underline ml-10"
                >
                    Find Breweries
                </Link>
                <Link
                    to="/about"
                    className="text-md font-medium !text-amber-900 hover:underline ml-10`"
                >
                    About
                </Link>

                <NewSearch className='width-4/5'/>

            </div>

            {/* Avatar */}
            <Link to={`/user/profile/${userId}`} className="flex items-center mr-5 justify-center  space-x-3">
                <img
                    src={avatar}
                    alt="BrewPalate Logo"
                    className="h-10 w-10 object-contain"
                />
            </Link>
        </header>
    );
}
