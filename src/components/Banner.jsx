export default function Banner({ movie }) {
    return (
        <div
            className="banner"
            style={{
                backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
            }}
        >
            <div className="banner-overlay"></div>
            <div className="banner-content">
                <h1 className="banner-title">{movie.title}</h1>
                <p className="banner-description">
                    {movie.release_date?.split("-")[0]} • {movie.runtime} min •{" "}
                    {movie.genres.map(g => g.name).join(", ")}
                </p>
                <p className="banner-rating">⭐ {movie.vote_average.toFixed(1)}</p>
            </div>
        </div>
    );
}
