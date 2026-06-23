import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import ProductGrid from '../components/ProductGrid';
import './Home.css';

const CATEGORIES = [
  {
    slug: 'jewelry',
    label: 'Jewelry',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
  },
  {
    slug: 'watches',
    label: 'Watches',
    image: 'https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=600&q=80',
  },
  {
    slug: 'bags',
    label: 'Bags',
    image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&q=80',
  },
  {
    slug: 'wallets',
    label: 'Wallets',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80',
  },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getProducts({ featured: 'true' })
      .then(setFeatured)
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="hero">
        <div className="container hero__inner">
          <p className="eyebrow">Est. for those who notice the details</p>
          <h1 className="hero__title">
            Held closer,
            <br />
            looked at longer.
          </h1>
          <p className="hero__sub">
            Jewelry, watches, and leather goods chosen the way a jeweler chooses a
            stone — for what holds up under a closer look.
          </p>
          <Link to="/shop/jewelry" className="btn btn-primary">
            Explore the collection
          </Link>
        </div>
        <div className="hero__loupe" aria-hidden="true">
          <svg viewBox="0 0 200 200" width="100%" height="100%">
            <circle cx="85" cy="85" r="60" fill="none" stroke="var(--brass)" strokeWidth="1.5" />
            <circle cx="85" cy="85" r="50" fill="none" stroke="var(--brass)" strokeWidth="0.5" opacity="0.5" />
            <line x1="128" y1="128" x2="175" y2="175" stroke="var(--brass)" strokeWidth="6" strokeLinecap="round" />
          </svg>
        </div>
      </section>

      <section className="categories">
        <div className="container">
          <div className="categories__grid">
            {CATEGORIES.map((c, i) => (
              <Link key={c.slug} to={`/shop/${c.slug}`} className="category-tile">
                <span className="category-tile__plaque">0{i + 1}</span>
                <img src={c.image} alt={c.label} loading="lazy" />
                <span className="category-tile__label">{c.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="featured">
        <div className="container">
          <div className="featured__heading">
            <p className="eyebrow">Under the loupe</p>
            <h2>Featured pieces</h2>
          </div>
          {loading ? (
            <p className="featured__loading">Loading…</p>
          ) : (
            <ProductGrid products={featured} />
          )}
        </div>
      </section>
    </div>
  );
}
