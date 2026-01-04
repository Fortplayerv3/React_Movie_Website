import React, {useEffect} from 'react';
import Search from "./components/Search.jsx";
import {useState} from "react";
import {useDebounce} from "react-use";
import MovieCard from "./components/MovieCard.jsx";

const API_BASE_URL= 'https://api.themoviedb.org/3';
const API_KEY= import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS=  {
    method: 'GET',
    headers:{
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
    }
}

const App = () => {
    const [search, setSearch] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [movieList, setMovieList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const[debouncedSearch, setDebouncedSearch] = useState('');

    //Debounce the search to stop making too many API requests
    useDebounce(() => setDebouncedSearch(search), 500, [search]);



    const fetchMovies = async (query = '') =>{
        setIsLoading(true);
        setErrorMessage('');
        try{
            const endpoint= query
                ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
                :`${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

            const response = await fetch(endpoint, API_OPTIONS);

            if(!response.ok){
                throw new Error('Failed to fetch movies');
            }

            const data = await response.json();
            if(data.Response==='False'){
                setErrorMessage(data.Error || 'Failed to fetch movies');
                setMovieList([]);
                return;
            }
            setMovieList(data.results || []);

        }
        catch(e){
            console.error('Error fetching movies:', e);
            setErrorMessage('Error fetching movies');
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchMovies(debouncedSearch);
    }, [debouncedSearch])

    return (
        <main>
            <div className="pattern" />
            <div className="wrapper">
               <header>
                   <img src="./Header-Poster.png" alt="Header Poster" />
                   <h1> Explore <span className="text-gradient">Movies</span> From Around The Globe</h1>
                   <Search search={search} setSearch={setSearch} />
               </header>

                <section className="all-movies">
                   <h2 className="mt-[40px]">All Movies</h2>
                    {isLoading ? (
                        <span className="loader"></span>
                    ): errorMessage ? (
                        <p className="text-red-500">{errorMessage}</p>
                    ):(
                        <ul>
                            {movieList.map((movie) => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </main>
    )}

export default App