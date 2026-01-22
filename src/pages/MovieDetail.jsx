import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Banner from "../components/Banner";
import CastRow from "../components/CastRow";
import Trailer from "../components/Trailer";
import "../Detail.css"


const API_BASE_URL= 'https://api.themoviedb.org/3';
const API_KEY= import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS=  {
    method: 'GET',
    headers:{
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
    }
}

export default function MovieDetail() {
    const {id} = useParams();
    const [movie, setMovie] = useState(null);

    useEffect(() => {
        async function fetchMovie() {
            try {
                const response = await fetch(
                    `${API_BASE_URL}/movie/${id}?append_to_response=videos,credits,recommendations`,
                    API_OPTIONS
                );

                if (!response.ok) {
                    throw new Error(`Failed to fetch movie details`);
                }

                const data = await response.json();
                setMovie(data);
            }catch (err){
                console.error("TMDB fetch error", err);
            }
        }

        fetchMovie();
    }, [id])

    if (!movie) return <span className="loader"></span>;

    return(
        <>
            <Banner movie={movie} />
            <section className="section">
                <h2 className="section-title">Overview</h2>
                <p className="overview-text">{movie.overview}</p>

                <Trailer videos={movie.videos?.results || []} />
                <CastRow cast={movie.credits?.cast || []} />
            </section>
        </>
    )
}
