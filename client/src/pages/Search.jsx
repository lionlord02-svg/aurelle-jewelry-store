import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/products`)
      .then(r => r.json())
      .then(products => {
        const q = query.toLowerCase();
        const filtered = products.filter(p =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
        );
        setResults(filtered);
      })
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div style={{ padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', marginBottom: '0.5rem' }}>
        Search Results
      </h1>
      <p style={{ color: '#888', marginBottom: '2rem' }}>
        {loading ? 'Searching...' : `${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`}
      </p>
      {!loading && results.length === 0 && (
        <p style={{ color: '#555' }}>No products found for "{query}". Try a different search term.</p>
      )}
      {results.length > 0 && <ProductGrid products={results} />}
    </div>
  );
}
