/*let cachedData = null;
let lastFetchTime = 0;
const CACHE_TIME = 15 * 60 * 1000;

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());

const API_BASE_URL= 'https://api.themoviedb.org/3';
const API_KEY = process.env.VITE_TMDB_API_KEY;

app.get('/api/trending', async (req, res) => {
    try{
        if(cachedData && Date.now() - lastFetchTime < CACHE_TIME){
            return res.status(200).json(cachedData);
        }

        const url = `${API_BASE_URL}/trending/movie/day?api_key=${API_KEY}`;


        const response = await fetch(url);
        const data = await response.json();

        cachedData=data.results.slice(0, 10);
        lastFetchTime= Date.now();

        res.json(cachedData);
    } catch(err){
        res.status(500).json({error: "Failed to fetch trending movies"});
    }
});

app.listen(5174, () => {
    console.log('Listening on port 5174');
});


*/
