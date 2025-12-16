import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import UserHeader from '../components/user/UserHeader';
import BrewerHeader from '../components/brewer/BrewerHeader';
import BreweryBarrel from '../assets/brewery_barrel.png';

export default function About() {
  const location = useLocation();
  const [searchQ, setSearchQ] = useState('');

  // Default to user header if opened directly
  const from = location.state?.from;
  const isBrewer = from === 'brewer';

  const HeaderComponent = isBrewer ? BrewerHeader : UserHeader;

  return (
    <div
      className="
        min-h-screen w-full
        bg-white
        flex flex-col
        overflow-x-hidden overflow-y-visible
        pt-[env(safe-area-inset-top)]
        pb-[env(safe-area-inset-bottom)]
      "
    >
      {/* Conditional header */}
      <HeaderComponent searchQ={searchQ} setSearchQ={setSearchQ} />

      <main className="w-full max-w-screen-xl mx-auto flex flex-col gap-4">
        {/* Contact Founder Card */}
        <section
          className="
            relative
            bg-[#f2f2f2]
            border border-[#d7d7d7]
            shadow-md
            px-6 md:px-10
            py-6 md:py-7
            text-[#8C6F52]
          "
        >
          {/* Background image */}
          <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
            <img
              src={BreweryBarrel}
              alt=""
              className="h-full w-auto opacity-10 object-contain scale-140 mt-50"
            />
          </div>

          {/* Content on top of overlay */}
          <div className="relative z-10">
            <section className="text-lg md:text-xl mb-6">
              <h2 className='text-3xl font-bold mb-2'> About </h2>
              <p>
                BrewPalate is a full-stack beer discovery platform
                enabling users to find, review, and receive personalized
                recommendations for craft beers using ML-powered taste profiling.
                Our goal is to build a connected craft beer community where users share
                authentic feedback and breweries grow through real-time insights and
                meaningful engagement.
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section>
                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <span className="inline-block h-5 w-1 bg-[#8C6F52] rounded-full" />
                  Features
                </h2>
                <ul className="list-disc list-inside space-y-1 text-sm md:text-base">
                  <li>Browse curated beer listings with style, ABV, and flavor tag details</li>
                  <li>Submit reviews with ratings, tasting notes, and selectable flavor tags</li>
                  <li>Receive personalized recommendations using machine learning</li>
                  <li>Filter discoveries based on selected flavor preferences</li>
                  <li>Explore local breweries using geolocation</li>
                  <li>Create secure user accounts and track past reviews via dashboard</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <span className="inline-block h-5 w-1 bg-[#8C6F52] rounded-full" />
                  Coming Soon
                </h2>
                <ul className="list-disc list-inside space-y-1 text-sm md:text-base">
                  <li>Flavor profile onboarding surveys to personalize recommendations faster</li>
                  <li>
                    <em>BrewLog</em>, a personal journal of reviews and brewery visits
                  </li>
                  <li>Batch-level feedback analytics for breweries</li>
                  <li>Brewery dashboards for managing beer listings and viewing feedback</li>
                  <li>Expanded recommender engine with improved user review training</li>
                </ul>
              </section>
            </div>

            <div className="border-t border-[#8C6F52] pt-4 mt-4 text-center w-full"></div>

            <h2 className="text-xl md:text-2xl font-bold mb-3">
              Contact the Founder
            </h2>

            <p className="text-sm md:text-base mb-4">
              Have questions, feedback, or want to discuss how BrewPalate could work
              with your brewery, event, or team? Reach out and I&apos;ll get back to you
              as soon as possible.
            </p>

            <div className="mb-4 text-sm md:text-base space-y-1">
              <p>
                <span className="font-semibold">Name:</span> Neal Jere
              </p>
              <p>
                <span className="font-semibold">Company Email:</span>{' '}
                <a
                  href="mailto:brewpalate@gmail.com"
                  className="underline underline-offset-2 text-[#3C547A]"
                >
                  brewpalate@gmail.com
                </a>
              </p>
              <p>
                <span className="font-semibold">Personal Email:</span>{' '}
                <a
                  href="mailto:nhjere@gmail.com"
                  className="underline underline-offset-2 text-[#3C547A]"
                >
                  nhjere@gmail.com
                </a>
              </p>
              <p>
                <span className="font-semibold">Location:</span> Austin / DFW, Texas
              </p>
            </div>

            <form className="space-y-3 max-w-xl">
              <div>
                <label className="block text-sm font-medium mb-1">Your Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Your Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none"
                  placeholder="Tell me a bit about your question or idea..."
                />
              </div>

              <button
                type="button"
                className="
                  inline-flex items-center justify-center
                  px-5 py-2.5
                  bg-[#3C547A]
                  hover:bg-[#314466]
                  text-white text-sm font-semibold
                  rounded-md
                  transition-colors
                "
              >
                Send Inquiry
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
