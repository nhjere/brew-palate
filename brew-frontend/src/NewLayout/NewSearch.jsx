export default function NewSearch() {
    return (
        <div className="w-3/5 mx-auto">
            <input
                type="text"
                placeholder="Search for a beer, brewery, or flavor..."
                className="w-full px-5 py-3 rounded-full bg-[#EDEDED] text-[#3C3C3C] placeholder:text-[#6F6F6F] shadow-inner focus:outline-none"
            />
        </div>
    );
}
