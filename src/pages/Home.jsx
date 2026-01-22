import {useEffect, useState, useRef} from 'react';
import Search from "../components/Search.jsx";
import {useDebounce} from "react-use";
import MovieCard from "../components/MovieCard.jsx";

const API_BASE_URL= 'https://api.themoviedb.org/3';
const API_KEY= import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS=  {
    method: 'GET',
    headers:{
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
    }
}

const Home = () => {
    const [search, setSearch] = useState(() => sessionStorage.getItem('movieSearch') || '');
    const [errorMessage, setErrorMessage] = useState('');
    const [movieList, setMovieList] = useState([]);
    const [trending, setTrending] = useState([]);
    const [timeframe, setTimeframe] = useState('day');
    const [isLoading, setIsLoading] = useState(false);
    const [debouncedSearch, setDebouncedSearch] = useState(() => sessionStorage.getItem('movieSearch') || '');

    // Filter states
    const [page, setPage] = useState(() => parseInt(sessionStorage.getItem('moviePage')) || 1);
    const [genres, setGenres] = useState([]);
    const [filters, setFilters] = useState(() => {
        try {
            const saved = sessionStorage.getItem('movieFilters');
            return saved ? JSON.parse(saved) : {
                sortOrder: 'desc',
                rating: 1,
                year: '',
                genre: '',
                filterType: 'popularity'
            };
        } catch (e) {
            return {
                sortOrder: 'desc',
                rating: 1,
                year: '',
                genre: '',
                filterType: 'popularity'
            };
        }
    });
    const [showFilters, setShowFilters] = useState(false);
    
    // Debounce the year filter to avoid fetching while typing partial years
    const [debouncedYear, setDebouncedYear] = useState(() => {
        try {
            const saved = sessionStorage.getItem('movieFilters');
            return saved ? JSON.parse(saved).year : '';
        } catch {
            return '';
        }
    });

    // Save state to session storage
    useEffect(() => {
        sessionStorage.setItem('movieSearch', search);
    }, [search]);

    useEffect(() => {
        sessionStorage.setItem('moviePage', page);
    }, [page]);

    useEffect(() => {
        sessionStorage.setItem('movieFilters', JSON.stringify(filters));
    }, [filters]);

    useDebounce(() => {
        if (filters.year.length === 4 || filters.year === '') {
            setDebouncedYear(filters.year);
        }
    }, 500, [filters.year]);

    //Debounce the search to stop making too many API requests
    const isFirstRender = useRef(true);
    useDebounce(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            setDebouncedSearch(search);
            return;
        }
        setDebouncedSearch(search);
        setPage(1); // Reset page on new search
    }, 500, [search]);

    const fetchGenres = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/genre/movie/list?language=en-US`, API_OPTIONS);
            const data = await response.json();
            setGenres(data.genres || []);
        } catch (error) {
            console.error('Error fetching genres:', error);
        }
    };

    useEffect(() => {
        fetchGenres();
    }, []);

    const fetchMovies = async (query = '', pageNum = 1, currentFilters = filters) => {
        setIsLoading(true);
        setErrorMessage('');
        try {
            let endpoint;
            
            // Use debounced year instead of raw input
            const year = debouncedYear;
            
            if (query) {
                endpoint = `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${pageNum}`;
                if (year) endpoint += `&primary_release_year=${year}`;
            } else {
                const { sortOrder, genre, rating, filterType } = currentFilters;
                
                endpoint = `${API_BASE_URL}/discover/movie?sort_by=popularity.${sortOrder}&page=${pageNum}`;
                
                if (year) endpoint += `&primary_release_year=${year}`;
                if (genre) endpoint += `&with_genres=${genre}`;
                if (filterType === 'rating' && rating > 1) endpoint += `&vote_average.gte=${rating}`;
            }

            const response = await fetch(endpoint, API_OPTIONS);

            if (!response.ok) {
                throw new Error('Failed to fetch movies');
            }

            const data = await response.json();
            if (data.Response === 'False') {
                setErrorMessage(data.Error || 'Failed to fetch movies');
                setMovieList([]);
                return;
            }
            setMovieList(data.results || []);

        } catch (e) {
            console.error('Error fetching movies:', e);
            setErrorMessage('Error fetching movies');
        } finally {
            setIsLoading(false);
        }
    }

    const handleFilterChange = (key, value) => {
        setFilters(prev => {
            const newFilters = { ...prev, [key]: value };
            // Reset page when filters change
            setPage(1);
            return newFilters;
        });
    };
    
    // Trigger fetch when filters or page changes
    useEffect(() => {
        fetchMovies(debouncedSearch, page, filters);
    }, [debouncedSearch, page, filters.sortOrder, filters.genre, filters.rating, filters.filterType, debouncedYear]); 
    
    const fetchTrendingMovies = async (timeframe) => {
        try {
            const response = await fetch(`${API_BASE_URL}/trending/movie/${timeframe}?language=en-US`, API_OPTIONS);

            if (!response.ok) {
                throw new Error('Failed to fetch trending movies');
            }

            const data = await response.json();
            setTrending(data.results.slice(0, 10));
        } catch (err) {
            console.error('Error fetching trending movies:', err);
        }
    };

    useEffect(() => {
        fetchTrendingMovies(timeframe);
    }, [timeframe]);

    return (
        <main>
            <div className="pattern" />
            <div className="px-5 py-12 xs:p-10 max-w-7xl mx-auto flex flex-col relative z-10">
                <header className="flex flex-col items-center justify-center text-center sm:mt-10 mt-5">
                    <img
                        src="/Header-Poster.png"
                        alt="Header Poster"
                        className="w-full max-w-lg h-auto object-contain mx-auto drop-shadow-md mb-8"
                    />
                    <h1 className="mx-auto max-w-4xl text-center text-5xl font-bold leading-tight tracking-[-1%] text-white sm:text-[64px] sm:leading-[76px]">
                        Explore <span className="text-gradient">Movies</span> From Around The Globe
                    </h1>
                    <Search search={search} setSearch={setSearch}/>
                </header>

                {trending.length > 0 && (
                    <section className="mt-10">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white sm:text-3xl">Trending Movies of The {timeframe}</h2>

                            <div className="flex gap-3">
                                <button
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition ${timeframe === 'day' ? 'bg-dark-100 text-white shadow-sm' : 'bg-white text-black hover:bg-gray-200'}`}
                                    onClick={() => setTimeframe('day')}
                                >
                                    Day
                                </button>

                                <button
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition ${timeframe === 'week' ? 'bg-dark-100 text-white shadow-sm' : 'bg-white text-black hover:bg-gray-200'}`}
                                    onClick={() => setTimeframe('week')}
                                >
                                    Week
                                </button>
                            </div>
                        </div>

                        <ul className="flex flex-row overflow-x-auto gap-5 -mt-10 w-full hide-scrollbar">
                            {trending.map((movie, index) => (
                                <li key={movie.id} className="min-w-[230px] flex flex-row items-center">
                                    <p className="fancy-text mt-[22px] text-nowrap">{index + 1}</p>
                                    <img
                                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                        alt={movie.title}
                                        className="w-[127px] h-[163px] rounded-lg object-cover -ml-3.5"
                                    />
                                </li>
                            ))}
                        </ul>
                    </section>
                )}


                <section className="mt-10 space-y-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-2xl font-bold text-white sm:text-3xl">
                            {debouncedSearch ? 'Search Results' : 'Popular Movies'}
                        </h2>
          
                        <div className="relative">
                            <button 
                                className="bg-dark-100 text-white px-4 py-2 rounded-lg flex items-center gap-2 border border-light-200/20 hover:bg-dark-100/80 transition"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <span>Filter</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/>
                                </svg>
                            </button>
                                
                            {showFilters && (
                                <div className="absolute right-0 mt-2 w-80 bg-dark-100 border border-light-200/20 rounded-xl shadow-xl p-4 z-50">
                                    <div className="space-y-4">
                                        <div className="mb-4">
                                            <p className="block text-sm text-gray-300 mb-1">Filter Type</p>
                                            <div className="flex gap-2 bg-primary p-1 rounded-lg border border-light-200/10">
                                                <button
                                                    className={`flex-1 py-1.5 px-3 rounded-md text-sm transition ${filters.filterType === 'popularity' ? 'bg-dark-100 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                                                    onClick={() => handleFilterChange('filterType', 'popularity')}
                                                >
                                                    Popularity
                                                </button>
                                                <button
                                                    className={`flex-1 py-1.5 px-3 rounded-md text-sm transition ${filters.filterType === 'rating' ? 'bg-dark-100 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                                                    onClick={() => handleFilterChange('filterType', 'rating')}
                                                >
                                                    Rating
                                                </button>
                                            </div>
                                        </div>

                                        {filters.filterType === 'popularity' && (
                                            <div className="mb-4">
                                                <p className="block text-sm text-gray-300 mb-1">Popularity Order</p>
                                                <div className="flex gap-2 bg-primary p-1 rounded-lg border border-light-200/10">
                                                    <button
                                                        className={`flex-1 py-1.5 px-3 rounded-md text-sm transition ${filters.sortOrder === 'desc' ? 'bg-dark-100 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                                                        onClick={() => handleFilterChange('sortOrder', 'desc')}
                                                    >
                                                        High to Low
                                                    </button>
                                                    <button
                                                        className={`flex-1 py-1.5 px-3 rounded-md text-sm transition ${filters.sortOrder === 'asc' ? 'bg-dark-100 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                                                        onClick={() => handleFilterChange('sortOrder', 'asc')}
                                                    >
                                                        Low to High
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {filters.filterType === 'rating' && (
                                            <div className="mb-4">
                                                <label className="block text-sm text-gray-300 mb-1" htmlFor="rating-slider">Rating ({filters.rating}+ Stars)</label>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-white text-sm">1</span>
                                                    <input
                                                        type="range"
                                                        min="1"
                                                        max="10"
                                                        step="1"
                                                        value={filters.rating}
                                                        onChange={(e) => handleFilterChange('rating', Number.parseInt(e.target.value))}
                                                        className="w-full h-2 bg-primary rounded-lg appearance-none cursor-pointer"
                                                        id="rating-slider"
                                                    />
                                                    <span className="text-white text-sm">10</span>
                                                </div>
                                            </div>
                                        )}
                                            
                                        <div className="mb-4">
                                            <label className="block text-sm text-gray-300 mb-1" htmlFor="release-year">Release Year</label>
                                            <input 
                                                type="number" 
                                                placeholder="Ex: 2024"
                                                className="w-full bg-primary text-white p-2 rounded-lg border border-light-200/10 focus:outline-none focus:border-light-100/50"
                                                value={filters.year}
                                                onChange={(e) => handleFilterChange('year', e.target.value)}
                                                id="release-year"
                                            />
                                        </div>
                                            
                                        <div className="mb-4">
                                            <label className="block text-sm text-gray-300 mb-1" htmlFor="genre-select">Genre</label>
                                            <select 
                                                className="w-full bg-primary text-white p-2 rounded-lg border border-light-200/10 focus:outline-none focus:border-light-100/50"
                                                value={filters.genre}
                                                onChange={(e) => handleFilterChange('genre', e.target.value)}
                                                id="genre-select"
                                            >
                                                <option value="">All Genres</option>
                                                {genres.map(g => (
                                                    <option key={g.id} value={g.id}>{g.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                            
                                        <button 
                                            className="w-full bg-white text-black font-medium py-2 rounded-lg hover:bg-gray-200 transition mt-2"
                                            onClick={() => {
                                                setFilters({
                                                    sortOrder: 'desc',
                                                    rating: 1,
                                                    year: '',
                                                    genre: '',
                                                    filterType: 'popularity'
                                                });
                                                setPage(1);
                                            }}
                                        >
                                            Reset Filters
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {(() => {
                        if (isLoading) {
                            return <span className="loader"></span>;
                        }
                        if (errorMessage) {
                            return <p className="text-red-500">{errorMessage}</p>;
                        }
                        return (
                            <>
                                <ul className="grid grid-cols-1 gap-5 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                    {movieList.map((movie) => (
                                        <MovieCard key={movie.id} movie={movie}/>
                                    ))}
                                </ul>
                                
                                {movieList.length > 0 && (
                                    <div className="flex justify-center items-center gap-4 mt-8">
                                        <button 
                                            className="bg-dark-100 text-white px-4 py-2 rounded-lg hover:bg-light-100/10 transition"
                                            disabled={page === 1}
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                        >
                                            Previous
                                        </button>
                                        <span className="text-white">Page {page}</span>
                                        <button 
                                            className="bg-dark-100 text-white px-4 py-2 rounded-lg hover:bg-light-100/10 transition"
                                            onClick={() => setPage(p => p + 1)}
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        );
                    })()}
                </section>
            </div>
        </main>
    )
}


export default Home
