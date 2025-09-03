export default function LoadingScreen({ message = "Loading..." }) {
    return (
        <div className="min-h-screen w-full bg-[#fff4e6] flex flex-col items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-900 border-t-transparent"></div>
                <div className="text-amber-900 font-semibold text-lg">{message}</div>
                <div className="text-amber-700 text-sm">BrewPalate</div>
            </div>
        </div>
    );
}