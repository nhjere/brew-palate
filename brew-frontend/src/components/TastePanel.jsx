import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../index.css"

export default function TastePanel({tags, setTags, onRefresh}) {

    const [beers, setBeers] = useState([]);

    // Fetch beers
    useEffect(() => {
        axios.get('http://localhost:8080/api/brewer/beers')
        .then(res => setBeers(res.data))
        .catch(err => console.error(err));
    }, []);

    // handle check box state change
    const handleTagChange = (tag) => {
        setTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    // saves current selected tags to local storage
    const handleRefresh = () => {
        localStorage.setItem('userFlavorTags', JSON.stringify(tags));
        console.log('Saved tags:', tags);
        onRefresh();
      };
    
    // seperate unique flavor tags given to beers and add to "your taste" selection
    const allTags = beers.flatMap(beer => beer.flavorTags); 
    const uniqueTags = [...new Set(allTags)];

    return (
        <section className="bg-red-50 border border-gray-300 rounded-lg p-4 shadow-sm">
              <h2 className="text-2xl font-bold mb-2">Your Taste</h2>
              <p className="text-sm mb-2"> Which flavors do you enjoy? </p>
              <ul className="list-disc list-outside pl-5 space-y-1 text-sm font-medium">
                
                {uniqueTags.map((tag) => (
                    <label key={tag} className="flex items-center space-x-2 text-sm"> 

                        <input
                            type="checkbox"
                            className="w-4 h-4 border-2 border-black rounded checked:bg-white checked:border-black focus:ring-0"
                            checked={tags.includes(tag)}
                            onChange={() => handleTagChange(tag)}
                        />
                        <span>{tag.charAt(0).toUpperCase() + tag.slice(1)}</span>
                    </label>
                 ))}
              </ul>
              <div className="flex justify-center items-center space-x-4 pt-4">
                    <button 
                    type="submit" 
                    onClick={handleRefresh}
                    className= " bg-blue-200 hover:bg-blue-300 transition text-black font-bold py-8 px-4 rounded-md"
                    >

                    Refresh
                    </button>
                </div>
        </section>
    )
}