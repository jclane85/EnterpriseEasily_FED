import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Navbar from '../components/Navbar'

const mockLoginWithRedirect = vi.fn()
const mockLogout = vi.fn()

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: vi.fn(),
}))

import { useAuth0 } from '@auth0/auth0-react'
const mockUseAuth0 = vi.mocked(useAuth0)

function renderNavbar() {
  return render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  )
}

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders brand link', () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: false,
      loginWithRedirect: mockLoginWithRedirect,
    } as ReturnType<typeof useAuth0>)

    renderNavbar()

    expect(screen.getByText('EnterpriseEasily')).toBeInTheDocument()
  })

  it('shows Log In button when not authenticated', () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: false,
      loginWithRedirect: mockLoginWithRedirect,
    } as ReturnType<typeof useAuth0>)

    renderNavbar()

    expect(screen.getByText('Log In')).toBeInTheDocument()
    expect(screen.queryByText('Log Out')).not.toBeInTheDocument()
  })

  it('calls loginWithRedirect when Log In is clicked', async () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: false,
      loginWithRedirect: mockLoginWithRedirect,
    } as ReturnType<typeof useAuth0>)
    const user = userEvent.setup()

    renderNavbar()

    await user.click(screen.getByText('Log In'))
    expect(mockLoginWithRedirect).toHaveBeenCalledTimes(1)
  })

  it('shows navigation links and user name when authenticated', () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: true,
      user: { name: 'John Doe', email: 'john@example.com' },
      logout: mockLogout,
    } as ReturnType<typeof useAuth0>)

    renderNavbar()

    expect(screen.getByText('Search')).toBeInTheDocument()
    expect(screen.getByText('Favorites')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Log Out')).toBeInTheDocument()
    expect(screen.queryByText('Log In')).not.toBeInTheDocument()
  })

  it('shows user email when name is not available', () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: true,
      user: { email: 'jane@example.com' },
      logout: mockLogout,
    } as ReturnType<typeof useAuth0>)

    renderNavbar()

    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
  })

  it('calls logout when Log Out is clicked', async () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: true,
      user: { name: 'John' },
      logout: mockLogout,
    } as ReturnType<typeof useAuth0>)
    const user = userEvent.setup()

    renderNavbar()

    await user.click(screen.getByText('Log Out'))
    expect(mockLogout).toHaveBeenCalledTimes(1)
  })
})
