
import FullHeader from '../components/user/UserHeader';

export default function About() {    
    return (
        <div className=" min-h-screen bg-[#fff4e6] flex flex-col">

            <FullHeader />


            <div className="flex flex-row w-full h-full text-left max-w-screen-xl mx-auto min-h-[500px]">
                <main className="flex-1  max-w bg-white rounded-2xl overflow-hidden border shadow-md transition-all p-6">
                
                    <section className='text-xl mb-5 '>

                        <p>
                            <strong >BrewPalate</strong> is a full-stack beer discovery platform enabling users to find, review, and receive personalized recommendations for craft beers using ML-powered taste profiling.
                        </p>
                        
                    </section>

                    <section className='mb-5'>
                        <h2 className="text-xl font-semibold mb-2">Features</h2>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Browse curated beer listings with style, ABV, and flavor tag details</li>
                            <li>Submit reviews with ratings, tasting notes, and selectable flavor tags</li>
                            <li>Receive personalized recommendations using machine learning</li>
                            <li>Filter discoveries based on selected flavor preferences</li>
                            <li>Explore local breweries using geolocation</li>
                            <li>Create secure user accounts and track past reviews via dashboard</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Flavor profile onboarding surveys to personalize recommendations faster</li>
                            <li><em>BrewLog</em>, a personal journal of reviews and brewery visits</li>
                            <li>Batch-level feedback analytics for breweries</li>
                            <li>Brewery dashboards for managing beer listings and viewing feedback</li>
                            <li>Expanded recommender engine with improved user review training</li>
                        </ul>
                        <p className=" text-xl font-semibold mt-5">
                            Our goal is to build a connected craft beer community where users share authentic feedback and breweries grow through real-time insights and meaningful engagement.
                        </p>
                    </section>

                </main>
            </div>
        </div>
    );
}
