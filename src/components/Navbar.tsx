import { useAuth0 } from '@auth0/auth0-react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  const { isAuthenticated, user, loginWithRedirect, logout } = useAuth0()

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        EnterpriseEasily
      </Link>
      <div className="navbar-links">
        {isAuthenticated ? (
          <>
            <Link to="/" className="nav-link">Search</Link>
            <Link to="/favorites" className="nav-link">Favorites</Link>
            <span className="nav-user">
              {user?.name || user?.email}
            </span>
            <button
              className="btn btn-outline"
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            >
              Log Out
            </button>
          </>
        ) : (
          <button className="btn btn-primary" onClick={() => loginWithRedirect()}>
            Log In
          </button>
        )}
      </div>
    </nav>
  )
}
