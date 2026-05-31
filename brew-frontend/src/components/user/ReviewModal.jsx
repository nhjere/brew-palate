import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useBreweryMap } from '../../context/BreweryContext';
import beer_mug from '../../assets/beer_mug.png';
import supabase from '../../supabaseClient.js';

export default function ReviewModal({ beerId, onClose, onReviewSubmit, onRequestPostReview }) {
  const [beer, setBeer] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const breweryMap = useBreweryMap();
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const [reviewFormData, setReviewFormData] = useState({
    flavorBalance: 1,
    mouthfeelQuality: 1,
    aromaIntensity: 1,
    finishQuality: 1,
    overallEnjoyment: 1,
    flavorTags: [],
    comment: '',
  });

  const positiveTags = [
    'Balanced',
    'Smooth',
    'Refreshing',
    'Bold Flavor',
    'Light & Easy',
    'Clean Finish',
  ];
  const negativeTags = [
    'Too Bitter',
    'Too Sweet',
    'Watery',
    'Harsh Finish',
    'Off Taste',
    'Flat',
  ];

  useEffect(() => {
    if (!beerId) return;
    axios
      .get(`${BASE_URL}/api/import/beers/${beerId}`)
      .then((res) => setBeer(res.data))
      .catch((err) => console.error(err));
  }, [beerId]);

  const handleRatingChange = (field, value) => {
    setReviewFormData((prev) => ({
      ...prev,
      [field]: Number(value),
    }));
  };

  const handleCommentChange = (e) => {
    setReviewFormData((prev) => ({
      ...prev,
      comment: e.target.value,
    }));
  };

  const handleTagToggle = (tag) => {
    setReviewFormData((prev) => {
      const newTags = prev.flavorTags.includes(tag)
        ? prev.flavorTags.filter((t) => t !== tag)
        : [...prev.flavorTags, tag];
      return { ...prev, flavorTags: newTags };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) {
        console.error('User not authenticated.');
        return;
      }

      const reviewPayload = {
        userId,
        beerId,
        ...reviewFormData,
      };

      await axios.post(`${BASE_URL}/api/user/reviews`, reviewPayload);
      setSuccessMessage('Review submitted successfully!');
      setTimeout(() => {
        onReviewSubmit();
        if (onRequestPostReview) onRequestPostReview(beerId);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error submitting review:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex flex-col md:items-center md:justify-center">
      <div
        className="
          bg-[#f2f2f2] text-slate-900 relative w-full
          h-[100dvh] flex flex-col
          md:w-[720px] md:h-[80vh] md:rounded-2xl md:shadow-lg md:border md:border-slate-200
          overflow-hidden
        "
      >
        {/* Background overlay */}
        <div className="pointer-events-none absolute inset-0 z-0 opacity-7">
          <img
            src={beer_mug}
            alt=""
            className="w-full h-full object-cover scale-[1.3]"
          />
        </div>

        {/* Close button — always anchored to the modal corner */}
        <button
          className="absolute top-2 right-2 z-20 text-slate-400 hover:text-slate-700 text-xl p-2"
          onClick={onClose}
          aria-label="Close review"
        >
          ✕
        </button>

        {/* Scrollable content */}
        <div className="relative z-10 flex-1 overflow-y-auto px-4 pt-4 pb-6 md:px-6 md:pt-6">
          {beer ? (
            (() => {
              const brewery = breweryMap[beer.breweryUuid];
              return (
                <>
                  <h2 className="text-xl md:text-2xl font-bold mb-2 text-[#8C6F52] pr-8">
                    {beer.name}
                  </h2>
                  <p className="mb-1 text-sm md:text-base text-slate-700">
                    <span className="font-semibold">Style:</span>{' '}
                    {beer.style || 'N/A'}
                  </p>
                  {beer.flavorTags?.length > 0 && (
                    <p className="mb-1 text-sm md:text-base text-slate-600">
                      <span className="font-semibold">Tags:</span>{' '}
                      {beer.flavorTags
                        .map(
                          (tag) =>
                            tag.charAt(0).toUpperCase() +
                            tag.slice(1).toLowerCase()
                        )
                        .join(', ')}
                    </p>
                  )}
                  <p className="mb-1 text-sm md:text-base text-slate-700">
                    <span className="font-semibold">From:</span>{' '}
                    {brewery?.breweryName || 'Unknown Brewery'}
                  </p>
                  <p className="mb-1 text-sm md:text-base text-slate-600">
                    <span className="font-semibold">Address:</span>{' '}
                    {brewery
                      ? `${brewery.street}, ${brewery.city}, ${brewery.state}, ${brewery.postalCode}`
                      : '—'}
                  </p>
                </>
              );
            })()
          ) : (
            <p className="text-slate-600">Loading beer info...</p>
          )}

          <form className="space-y-4 mt-4">
            {/* Stars — label above on mobile, inline on desktop */}
            <div className="flex flex-col md:flex-row md:items-center md:space-x-6 gap-2">
              <label className="text-base md:text-lg font-semibold text-slate-800">
                Your Overall Enjoyment:
              </label>
              <div className="flex gap-3 md:gap-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => handleRatingChange('overallEnjoyment', star)}
                    className="star-button text-3xl md:text-4xl text-amber-400"
                  >
                    {reviewFormData.overallEnjoyment >= star ? '★' : '☆'}
                  </button>
                ))}
              </div>
            </div>

            {/* Flavor Tags */}
            <div>
              <label className="block text-sm font-bold mb-1 text-slate-700">
                Positives:
              </label>
              <div className="flex flex-wrap gap-2 mb-5">
                {positiveTags.map((tag) => {
                  const capitalTag =
                    tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase();
                  const selected = reviewFormData.flavorTags.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`
                        text-sm rounded-full px-3 py-1 border transition-colors
                        ${
                          selected
                            ? 'bg-[#3C547A] text-white border-[#3C547A]'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }
                      `}
                    >
                      {capitalTag}
                    </button>
                  );
                })}
              </div>

              <label className="block text-sm font-bold mb-1 text-slate-700">
                Negatives:
              </label>
              <div className="flex flex-wrap gap-2">
                {negativeTags.map((tag) => {
                  const capitalTag =
                    tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase();
                  const selected = reviewFormData.flavorTags.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`
                        text-sm rounded-full px-3 py-1 border transition-colors
                        ${
                          selected
                            ? 'bg-[#8C6F52] text-white border-[#8C6F52]'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }
                      `}
                    >
                      {capitalTag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comment Box */}
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">
                Comments
              </label>
              <textarea
                rows="3"
                value={reviewFormData.comment}
                onChange={handleCommentChange}
                placeholder="What did you think?"
                className="w-full border border-slate-300 rounded p-2 bg-white text-slate-800"
              />
            </div>
          </form>

          {successMessage && (
            <div className="text-green-600 font-semibold text-sm mt-3 text-center">
              {successMessage}
            </div>
          )}
        </div>

        {/* Sticky submit bar */}
        <div className="relative z-10 border-t border-slate-200 bg-[#f2f2f2] px-4 py-3 md:px-6 md:py-4 flex justify-end">
          <button
            type="submit"
            onClick={handleSubmit}
            className="
              w-full md:w-auto
              bg-[#3C547A] hover:bg-[#314466]
              transition text-white font-bold py-2.5 px-6 rounded-full
            "
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
