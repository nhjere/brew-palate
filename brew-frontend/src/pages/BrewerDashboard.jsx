import Header from '../components/header'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SearchBar from '../components/SearchBar';

export default function BrewerDashboard() {
    
    const [breweries, setBreweries] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:8080/api/brewer/breweries')
        .then(res => setBreweries(res.data))
        .catch(err => console.error(err));
    }, []);

    return (
        <div className="min-h-screen bg-amber-50 flex flex-col w-full">

              <div className="flex items-center justify-between bg-amber-100 p-4 shadow-md">
                    <Header />
                    <SearchBar />
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                Discover Breweries
              </h1>
        
              <table border="1" cellPadding="8" cellSpacing="0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>City</th>
                    <th>State</th>
                    <th>Type</th>
                    <th>Website</th>
                  </tr>
                </thead>
                <tbody>
                  {breweries.slice(0, 20).map((brewery) => (
                    <tr key={brewery.breweryId}>
                      <td>{brewery.breweryName}</td>
                      <td>{brewery.city}</td>
                      <td>{brewery.state}</td>
                      <td>{brewery.breweryType}</td>
                      <td>
                        {brewery.websiteUrl ? (
                          <a href={brewery.websiteUrl} target="_blank" rel="noopener noreferrer">
                            Visit Site
                          </a>
                        ) : (
                          'N/A'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
    )
}