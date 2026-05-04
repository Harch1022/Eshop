import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ userName, onLogout, cartCount = 0, isAdmin = false }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Eshop
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* User info */}
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-400/20">
                <span className="text-indigo-300 font-semibold text-sm">
                  {userName?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <span className="font-medium text-white/80">{userName}</span>
              {isAdmin && (
                <span className="ml-1 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full font-medium border border-amber-500/30">
                  Admin
                </span>
              )}
            </div>

            {/* Admin dashboard link */}
            {isAdmin && (
              <Link
                to="/adminPage"
                className="text-sm px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all font-medium hidden sm:block"
              >
                Dashboard
              </Link>
            )}

            {/* My Orders link (user only) */}
            {!isAdmin && (
              <Link
                to="/orders"
                className="text-sm px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all font-medium"
              >
                <span className="hidden sm:inline">My Orders</span>
                <svg className="w-5 h-5 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </Link>
            )}

            {/* Cart link */}
            <Link
              to="/cart"
              className="relative p-2 text-white/60 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-lg shadow-indigo-500/30">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={handleLogout}
              className="text-sm px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/90 transition-all font-medium border border-white/10"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
