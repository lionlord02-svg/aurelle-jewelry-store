import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div className="site-footer__brand">
          <span className="brand__name">Aurelle &amp; Co.</span>
          <p>Fine jewelry, watches, and leather goods.</p>
        </div>
        <div className="site-footer__links">
          <Link to="/shop/jewelry">Jewelry</Link>
          <Link to="/shop/watches">Watches</Link>
          <Link to="/shop/bags">Bags</Link>
          <Link to="/shop/wallets">Wallets</Link>
        </div>
        <p className="site-footer__copy">&copy; {new Date().getFullYear()} Aurelle &amp; Co.</p>
      </div>
    </footer>
  );
}
