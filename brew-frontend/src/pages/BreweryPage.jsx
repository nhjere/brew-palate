import Header from '../components/header'
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function BreweryPage() {
    // User clicks on a brewery link and takes them to an informative page about the brewery

    const [breweries, setBreweries] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:8080/api/brewer/breweries/{}')
        .then(res => setBreweries(res.data))
        .catch(err => console.error(err));
    }, []);

}