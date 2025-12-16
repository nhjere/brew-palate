export default function LoadingScreen({ message = "Loading..." }) {
    return (
        <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center">
            <div className="flex flex-col items-center space-y-4">

                {/* Spinner */}
                <div className="
                    animate-spin 
                    rounded-full 
                    h-16 w-16 
                    border-[3px] 
                    border-[#8C6F52]/40 
                    border-t-[#8C6F52] 
                    shadow-md
                "></div>

                {/* Message */}
                <div className="text-[#3F4C5F] font-semibold text-lg tracking-wide">
                    {message}
                </div>

                {/* Subtle brand label */}
                <div className="text-[#8C6F52] text-sm font-medium opacity-80">
                    BrewPalate
                </div>
            </div>
        </div>
    );
}
