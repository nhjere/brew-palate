export default function NewSearch() {
    return (
        <div className="w-2/3 mx-auto text-amber-800">
            <input
                type="text"
                placeholder="Search for a beer, brewery, or flavor..."
                className="w-full px-5 py-3 rounded-full bg-gray-100 placeholder:text-[#6F6F6F] shadow-inner focus:outline-none"
            />
        </div>
    );
}
