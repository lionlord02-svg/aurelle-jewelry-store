import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext';
import './Header.css';

const CATEGORIES = [
  { slug: 'jewelry', label: 'Jewelry' },
  { slug: 'watches', label: 'Watches' },
  { slug: 'bags', label: 'Bags' },
  { slug: 'wallets', label: 'Wallets' },
];

export default function Header() {
  const { itemCount } = useCart();
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();

  const customer = JSON.parse(localStorage.getItem('customer_user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_user');
    navigate('/');
    window.location.reload();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setShowSearch(false);
    }
  };

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="brand">
          <span className="brand__mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
              <path d="M12 2L4 8l8 14 8-14z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M4 8h16M8 14l4 8 4-8" stroke="currentColor" strokeWidth="0.8" />
            </svg>
          </span>
          <span className="brand__name">Aurelle &amp; Co.</span>
        </Link>

        <nav className="site-nav" aria-label="Categories">
          {CATEGORIES.map((c) => (
            <NavLink
              key={c.slug}
              to={`/shop/${c.slug}`}
              className={({ isActive }) => `site-nav__link${isActive ? ' is-active' : ''}`}
            >
              {c.label}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          {/* Search */}
          {showSearch ? (
            <form onSubmit={handleSearch} className="search-form">
              <input
                autoFocus
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products..."
                className="search-input"
              />
              <button type="button" onClick={() => setShowSearch(false)} className="search-close">✕</button>
            </form>
          ) : (
            <button onClick={() => setShowSearch(true)} className="icon-btn" aria-label="Search">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}

          {/* Auth links */}
          {customer ? (
            <div className="auth-links">
              <span className="customer-name">Hi, {customer.name.split(' ')[0]}</span>
              <button onClick={handleLogout} className="auth-link-btn">Logout</button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="auth-link">Sign In</Link>
              <Link to="/register" className="auth-link auth-link--register">Register</Link>
            </div>
          )}

          {/* Cart */}
          <Link to="/cart" className="cart-link" aria-label={`Cart, ${itemCount} items`}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
              <path d="M6 8l21-1.2a1 1 0 01-1 .8H8.2a1 1 0 01-.8L6 8z" stroke="currentColor" strokeWidth="1.3" />
              <path d="M9 9V6a3 0 016 0v2" stroke="currentColor" strokeWidth="1.3" />
            </svg>
            {itemCount > 0 && <span className="cart-link__badge">{itemCount}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
}
