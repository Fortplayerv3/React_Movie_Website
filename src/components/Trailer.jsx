export default function Trailer({ videos }) {
    const trailer = videos.find(v => v.type === "Trailer");

    if (!trailer) return null;

    return (
        <section className="trailer-frame">
            <h2>Trailer</h2>
            <iframe
                width="100%"
                height="500"
                src={`https://www.youtube.com/embed/${trailer.key}`}
                allowFullScreen
            />
        </section>
    );
}
