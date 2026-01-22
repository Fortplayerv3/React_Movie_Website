export default function CastRow({ cast }) {
    return (
        <section className="section page-container">
            <h2 className="section-title">Top Cast</h2>
            <div className="horizontal-row">
                {cast.slice(0, 12).map(actor => (
                    <div key={actor.id} className="cast-card">
                        <img
                            src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                            alt={actor.name}
                        />
                        <p className="cast-name">{actor.name}</p>
                        <p className="cast-role">{actor.character}</p>
                        <span>{actor.character}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}
