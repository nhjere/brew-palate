import React, { use, useEffect, useState } from 'react';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// supabase auth config
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function ReviewModal({ beerId, onClose}) {
    const [beer, setBeer] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    
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
        axios.get(`http://localhost:8080/api/brewer/beers/${beerId}`)
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
                        <h2 className="text-2xl font-bold mb-2">{beer.name}</h2>
                        <p className="mb-1">Style: {beer.style}</p>
                        <p className="mb-1">Tags: {beer.flavorTags.join(', ')}</p>
                        <p className="mb-4">From: {beer.breweryName}</p>

                        <button className="absolute top-2 right-2 text-gray-500 hover:text-red-500" onClick={onClose} > ✕ </button>
                    </>
                ) : (
                    <p>Loading beer info...</p>
                )}

                <div className = 'font-bold'> Post a Review! </div>

                <form className="space-y-4 mt-4">
                    {/* Sliders for Ratings */}
                    {['flavorBalance', 'mouthfeelQuality', 'aromaIntensity', 'finishQuality', 'overallEnjoyment'].map((field) => (
                        <div key={field}>
                            <label className="block text-sm font-medium capitalize mb-1">
                                {field.replace(/([A-Z])/g, ' $1')}
                            </label>
                            <input
                                type="range"
                                className="appearance-none w-full h-2 bg-white border border-black rounded"
                                min="1"
                                max="5"
                                value={reviewFormData[field]}
                                onChange={(e) => handleRatingChange(field, parseInt(e.target.value))}
                            />
                            <div className="text-sm text-gray-600">Rating: {reviewFormData[field]}</div>
                        </div>
                    ))}

                    {/* Flavor Tags */}
                    <div>
                        <label className="block text-sm font-medium mb-1"> How would you describe it? </label>
                        <div className="flex flex-wrap gap-2">
                        {['Citrusy', 'Malty', 'Roasty', 'Fruity', 'Hoppy', "Light", "Refreshing" ,"Bitter" ,"Sweet" ,"Carbonated", "Clean"].map((tag) => (
                            <label key={tag} className="flex items-center space-x-2 text-sm">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 border-2 border-black rounded checked:bg-white checked:border-black focus:ring-0"
                                    checked={reviewFormData.flavorTags.includes(tag)}
                                    onChange={() => handleTagToggle(tag)}
                                />
                            <span>{tag}</span>
                            </label>
                        ))}
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