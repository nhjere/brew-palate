import BrewerHeader from '../components/brewer/BrewerHeader'


export default function BrewerDashboard() {

    return (
        <div className="min-h-screen w-full overflow-x-hidden bg-[#fff4e6] flex flex-col
                        pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
            <BrewerHeader />

            <main className="flex flex-col gap-5 w-full flex-grow">
                <h2 className="text-2xl font-bold p-4 text-amber-900">Claim Brewery </h2>

            </main>
    

        </div>
    );

}