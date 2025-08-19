import "../index.css"
import { Link } from 'react-router-dom';
import bp_logo from "../assets/final_logo.png";

export default function Header() {

    const userId = localStorage.getItem('user_id');

    return (
        <div className="flex items-center space-x-4">
            <img
                src={bp_logo}
                alt="BrewPalate Logo"
                className="h-22 w-22 mr-0 object-contain rounded-md"
            />
            <h1 className="text-4xl font-bold text-amber-900">BrewPalate</h1>
        </div>
    )
}