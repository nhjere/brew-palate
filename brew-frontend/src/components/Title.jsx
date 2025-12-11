import "../index.css"
import { Link } from 'react-router-dom';
import bp_logo from "../assets/final_logo.png";

export default function Header() {

    const userId = localStorage.getItem('user_id');

    return (
        <div className="flex items-center ">
            <img
                src={bp_logo}
                alt="BrewPalate Logo"
                className="h-27 w-27 object-contain rounded-md"
            />
            <h1 className="!text-6xl font-bold text-[#8C6F52]"> 
                BrewPalate
            </h1>
        </div>
    );
}
