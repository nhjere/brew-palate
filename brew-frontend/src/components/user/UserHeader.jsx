import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Search from './Search';
import bp_logo from '../../assets/final_logo.png';
import avatar from "../../assets/avatar.svg";

export default function NewHeader({ searchQ, setSearchQ }) {
    const userId = localStorage.getItem('user_id');
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="relative w-full bg-white px-4 md:px-6 py-3 md:py-4">
            <div className="flex justify-between items-center gap-2">
                {/* Logo + Title */}
                <Link
                    to={`/user/dashboard/${userId}`}
                    className="flex items-center space-x-2 md:space-x-3 min-w-0"
                >
                    <img
                        src={bp_logo}
                        alt="BrewPalate Logo"
                        className="h-12 w-12 md:h-23 md:w-23 object-contain flex-shrink-0"
                    />
                    <h1 className="text-2xl md:text-4xl font-extrabold !text-[#8C6F52] truncate">
                        BrewPalate
                    </h1>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center space-x-6 flex-grow justify-right">
                    <Link
                        to={`/user/find-breweries`}
                        className="text-md font-medium !text-[#8C6F52] hover:underline ml-10"
                    >
                        Find Breweries
                    </Link>
                    <Link
                        to="/about"
                        state={{ from: "user" }}
                        className="text-md font-medium !text-[#8C6F52] hover:underline ml-10"
                    >
                        About
                    </Link>
                </div>

                {/* Desktop Search */}
                <div className="hidden md:block mr-4">
                    <Search value={searchQ} onSearch={setSearchQ} />
                </div>

                {/* Desktop Avatar */}
                <Link
                    to={`/user/profile/${userId}`}
                    className="hidden md:flex items-center mr-5 justify-center space-x-3"
                >
                    <img
                        src={avatar}
                        alt="Profile"
                        className="h-10 w-10 object-contain"
                    />
                </Link>

                {/* Mobile: avatar + hamburger */}
                <div className="flex md:hidden items-center gap-1 flex-shrink-0">
                    <Link
                        to={`/user/profile/${userId}`}
                        className="flex items-center justify-center"
                    >
                        <img
                            src={avatar}
                            alt="Profile"
                            className="h-8 w-8 object-contain"
                        />
                    </Link>
                    <button
                        onClick={() => setMenuOpen((open) => !open)}
                        aria-label={menuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={menuOpen}
                        className="p-2 text-[#8C6F52]"
                    >
                        {menuOpen ? (
                            <XMarkIcon className="h-6 w-6" />
                        ) : (
                            <Bars3Icon className="h-6 w-6" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile dropdown panel */}
            {menuOpen && (
                <div className="md:hidden absolute left-0 right-0 top-full bg-white border-t border-[#E0D4C2] shadow-lg px-4 py-4 space-y-3 z-30">
                    <Search value={searchQ} onSearch={setSearchQ} />
                    <Link
                        to={`/user/find-breweries`}
                        onClick={() => setMenuOpen(false)}
                        className="block py-2 text-base font-medium !text-[#8C6F52]"
                    >
                        Find Breweries
                    </Link>
                    <Link
                        to="/about"
                        state={{ from: "user" }}
                        onClick={() => setMenuOpen(false)}
                        className="block py-2 text-base font-medium !text-[#8C6F52]"
                    >
                        About
                    </Link>
                </div>
            )}
        </header>
    );
}
