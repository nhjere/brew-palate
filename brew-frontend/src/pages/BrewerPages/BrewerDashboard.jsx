import BrewerHeader from '../../components/brewer/BrewerHeader'
import BeerModal from '../../components/brewer/BeerModal'
import { useEffect, useState } from 'react';


export default function BrewerDashboard() {

    const [showBeerModal, setShowBeerModal] = useState(false);
    const [refreshBeers, setRefreshBeers] = useState(false);

    return (
        <div className="min-h-screen w-full overflow-x-hidden bg-[#fff4e6] flex flex-col
                        pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
            <BrewerHeader />


            <div className="flex flex-col gap-5 w-full p-5">

                <header className="text-4xl font-bold p-4 text-amber-900">Your Brewery </header>

                <main className="flex flex-row gap-5 w-full ">

                    <button
                        className="bg-blue-200 hover:bg-blue-300 w-1/5 text-black px-4 py-1 rounded-full font-semibold"
                        onClick={() => {}}
                        >
                        Claim Brewery
                    </button>

                    
                    <button
                        className="bg-blue-200 hover:bg-blue-300 w-1/5 text-black px-4 py-1 rounded-full font-semibold"
                        onClick={() => {setShowBeerModal(true)}}
                        >
                        Add a Beer 
                    </button>

                </main>

                <h2 className="text-2xl font-bold p-4 text-amber-900">Beer Catalog </h2>

            </div>

            {showBeerModal && (
                <BeerModal
                    onClose={() => setShowBeerModal(false)}
                    onBeerSubmit={() => setRefreshBeers((prev) => !prev)}
                />
            )}
    

        </div>


    );

}