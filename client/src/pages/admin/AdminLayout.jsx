import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import './AdminLayout.css';

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/admin/login');
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <p className="admin-sidebar__brand">Aurelle &amp; Co.</p>
        <p className="admin-sidebar__user">Signed in as {admin?.username}</p>
        <nav>
          <NavLink to="/admin" end className={({ isActive }) => isActive ? 'is-active' : ''}>
            Products
          </NavLink>
          <NavLink to="/admin/orders" className={({ isActive }) => isActive ? 'is-active' : ''}>
            Orders
          </NavLink>
        </nav>
        <button type="button" className="admin-sidebar__logout" onClick={handleLogout}>
          Log out
        </button>
        <a href="/" className="admin-sidebar__view-site">View live site →</a>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
