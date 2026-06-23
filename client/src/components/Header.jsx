import { Link, NavLink } from 'react-router-dom';
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

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="brand">
          <span className="brand__mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
              <path
                d="M12 2L4 8l8 14 8-14-8-6z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
              <path d="M4 8h16M8 8l4 14M16 8l-4 14" stroke="currentColor" strokeWidth="0.8" />
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

        <Link to="/cart" className="cart-link" aria-label={`Cart, ${itemCount} items`}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
            <path
              d="M6 8h12l-1.2 11.2a1 1 0 01-1 .8H8.2a1 1 0 01-1-.8L6 8z"
              stroke="currentColor"
              strokeWidth="1.3"
            />
            <path d="M9 8V6a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.3" />
          </svg>
          {itemCount > 0 && <span className="cart-link__badge">{itemCount}</span>}
        </Link>
      </div>
    </header>
  );
}
