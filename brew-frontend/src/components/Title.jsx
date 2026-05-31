import "../index.css"
import { Link } from 'react-router-dom';
import bp_logo from "../assets/final_logo.png";

export default function Header() {

    const userId = localStorage.getItem('user_id');

    return (
        <div className="flex items-center justify-center gap-2 md:gap-3">
            <img
                src={bp_logo}
                alt="BrewPalate Logo"
                className="h-14 w-14 md:h-27 md:w-27 object-contain rounded-md flex-shrink-0"
            />
            <h1 className="!text-3xl md:!text-6xl font-bold text-[#8C6F52] truncate">
                BrewPalate
            </h1>
        </div>
    );
}
