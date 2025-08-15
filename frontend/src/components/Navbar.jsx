import { NavLink } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import ThemeCustomizer from './ThemeCustomizer';
import { useRef, useEffect, useState } from "react";

const Navbar = () => {
  const [showPopover, setShowPopover] = useState(false);
  const popoverRef = useRef(null);

  // Close popover if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setShowPopover(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav
      className="navbar fixed-top navbar-expand-lg"
      style={{
        backgroundColor: '#fff',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      }}
    >
      <div className="container-fluid px-4">
        <NavLink
          to="/"
          className="navbar-brand"
          style={{
            fontWeight: '700',
            fontSize: '1.7rem',
            color: 'var(--bs-primary)',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            letterSpacing: '1.2px',
          }}
        >
          Roll with It
        </NavLink>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavAltMarkup"
          aria-controls="navbarNavAltMarkup"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{ filter: 'brightness(0) invert(0.5)' }}
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
          <div
            className="navbar-nav ms-auto"
            style={{ rowGap: '.5rem', columnGap: '1.6rem', fontSize: '1.1rem' }}
          >
            {[
              { path: '/', label: 'Home' },
              { path: '/about', label: 'About' },
            ].map(({ path, label }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  'nav-link' + (isActive ? ' active fw-semibold' : '')
                }
                style={({ isActive }) => ({
                  color: isActive ? 'var(--bs-primary)' : 'var(--bs-primary)',
                  borderRadius: '6px',
                  padding: '6px 15px',
                  transition: 'color 0.3s ease',
                })}
                onMouseEnter={(e) => {
                  if (!e.target.classList.contains('active'))
                    e.target.style.color = 'var(--bs-primary)';
                }}
                onMouseLeave={(e) => {
                  if (!e.target.classList.contains('active'))
                    e.target.style.color = 'var(--bs-secondary)';
                }}
              >
                {label}
              </NavLink>
            ))}

            {/* Theme Customizer Toggle */}
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setShowPopover(!showPopover)}
              style={{ position: 'relative' }}
            >
              Customize ⚙️
            </button>

            {/* Popover */}
            {showPopover && (
              <div
                ref={popoverRef}
                className="shadow border-0"
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: '15px',
                  zIndex: '1050',
                  marginTop: '0.5rem',
                  maxHeight: 'calc(100vh - 48px)',
                  maxWidth: '100%',
                  overflowY: 'scoll'
                }}
              >
                <ThemeCustomizer />
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );  
};

export default Navbar;
