import React, { use, useEffect, useState } from 'react';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { useBreweryMap } from '../context/BreweryContext';

// supabase auth config
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function ReviewModal({ beerId, onClose, onReviewSubmit}) {
    const [beer, setBeer] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const breweryMap = useBreweryMap();
    
    // useState to manage review form data
    const [reviewFormData, setReviewFormData] = useState({
        flavorBalance: 1,
        mouthfeelQuality: 1,
        aromaIntensity: 1,
        finishQuality: 1,
        overallEnjoyment: 1,
        flavorTags: [],
        comment: ''
    });


    // fetches beer metadata associated with beer id
    useEffect(() => {
        if (!beerId) return;
        axios.get(`http://localhost:8080/api/import/beers/${beerId}`)
            .then(res => setBeer(res.data))
            .catch(err => console.error(err));
    }, [beerId]);

    // handler for slider rating changes
    const handleRatingChange = (field, value) => {
        setReviewFormData(prev => ({
            ...prev,
            [field]: Number(value) // any field with a number
        }));
    };

    // handler for comment change
    const handleCommentChange = (e) => {
        setReviewFormData(prev => ({
            ...prev,
            comment: e.target.value
        }));
    };

    // handler for flavor tags
    const handleTagToggle = (tag) => {
        setReviewFormData(prev => {
            const newTags = prev.flavorTags.includes(tag)
            ? prev.flavorTags.filter(t => t !== tag)
            : [...prev.flavorTags, tag];
            return { ...prev, flavorTags: newTags };
        });
    };

    // sends review payload to backend upon submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            const userId = user?.id;

            if (!userId) {
                console.error("User not authenticated.");
                return;
            }

            const reviewPayload = {
                userId,
                beerId,
                ...reviewFormData,
            };

            const BASE_URL = import.meta.env.VITE_BACKEND_URL;
            await axios.post(`${BASE_URL}/api/user/reviews`, reviewPayload);
            setSuccessMessage('Review submitted successfully!');
            setTimeout(() => {
                onReviewSubmit();
                onClose();
            }, 1500);

        } catch (err) {
            console.error("Error submitting review:", err);
        }

    }

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg text-amber-800 relative text-left h-3/4 overflow-y-auto">
                {beer ? (
                    <>
                    {(() => { 
                        console.log(beer)      
                        const brewery = breweryMap[beer.breweryUuid];

                        return(
                            <>
                                <h2 className="text-2xl font-bold mb-2">{beer.name}</h2>
                                <p className="mb-1">Style: {beer.style}</p>
                                <p className="mb-1">
                                    Tags: {beer.flavorTags.map(tag => tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase()).join(', ')}
                                </p>
                                <p className="mb-1">From: {brewery?.breweryName || 'Unknown Brewery'}</p>
                                <p className="mb-1">Address: {brewery?.street}, {brewery?.city}, {brewery?.state}, {brewery?.postalCode} </p>
                            </>
                        );
                    })()}
                    <button className="absolute top-2 right-2 text-gray-500 hover:text-red-500" onClick={onClose} > ✕ </button>
                
                    </>
                ) : (
                    <p>Loading beer info...</p>
                )}

                <div className = 'font-bold'> Post a Review! </div>

                <form className="space-y-4 mt-4">

                    {/* Stars */}
                    <div className="flex items-center space-x-6">
                        <label className="text-sm font-medium whitespace-nowrap">Overall Enjoyment:</label>
                        <div className="flex gap-6">
                            {[1, 2, 3, 4, 5].map((star) => (
                            <button
                            type="button"
                            key={star}
                            onClick={() => handleRatingChange('overallEnjoyment', star)}
                            className="star-button text-4xl text-yellow-600"
                            >
                            {reviewFormData.overallEnjoyment >= star ? '★' : '☆'}
                            </button>
                            ))}
                        </div>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">Rating: {reviewFormData.overallEnjoyment}</div>


                    {/* Flavor Tags */}
                    <div>
                        <label className="block text-sm font-bold mb-1"> Positives: </label>
                        <div className="flex flex-wrap gap-2">
                        {[ "Balanced","Smooth","Refreshing","Bold Flavor","Light & Easy","Clean Finish"].map((tag) => {
                            const capitalTag = tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase();
                            return (
                                <label key={tag} className="flex items-center space-x-2 text-sm">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 border-2 border-black rounded checked:bg-white checked:border-black focus:ring-0"
                                        checked={reviewFormData.flavorTags.includes(tag)}
                                        onChange={() => handleTagToggle(tag)}
                                    />
                                    <span>{capitalTag}</span>
                                </label>
                            );
                        })}
                        </div>

                        <label className="block text-sm font-bold mb-1"> Negatives: </label>
                        <div className="flex flex-wrap gap-2">
                        {["Too Bitter","Too Sweet","Watery","Harsh Finish","Off Taste","Flat"].map((tag) => {
                            const capitalTag = tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase();
                            return (
                                <label key={tag} className="flex items-center space-x-2 text-sm">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 border-2 border-black rounded checked:bg-white checked:border-black focus:ring-0"
                                        checked={reviewFormData.flavorTags.includes(tag)}
                                        onChange={() => handleTagToggle(tag)}
                                    />
                                    <span>{capitalTag}</span>
                                </label>
                            );
                        })}
                        </div>
                    </div>

                    {/* Comment Box */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Comments</label>
                            <textarea
                            rows="3"
                            value={reviewFormData.comment}
                            onChange={handleCommentChange}
                            placeholder="What did you think?"
                            className="w-full border border-gray-300 rounded p-2"
                            />
                    </div>

                    
                </form>

                {/* Buttons */}
                <div className="flex justify-end space-x-4 pt-4">
                    <button
                    type="submit"
                    onClick={handleSubmit}
                    className= "  bg-blue-200 hover:bg-blue-300 transition text-black font-bold py-2 px-4 rounded-md"
                    >
                    Submit
                    </button>
                </div>

                {successMessage && (
                <div className="text-green-600 font-semibold text-sm mb-2 text-center flex-row">
                    {successMessage}
                </div>
                )}

            </div>
        </div>
    );
}