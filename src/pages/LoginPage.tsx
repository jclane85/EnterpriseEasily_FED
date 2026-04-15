import { useAuth0 } from '@auth0/auth0-react'

export default function LoginPage() {
  const { loginWithRedirect, isAuthenticated } = useAuth0()

  if (isAuthenticated) {
    window.location.href = '/'
    return null
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">EnterpriseEasily</h1>
        <p className="login-subtitle">Guitar Tabs at Your Fingertips</p>
        <button className="btn btn-primary btn-lg" onClick={() => loginWithRedirect()}>
          Log In to Get Started
        </button>
      </div>
    </div>
  )
}
