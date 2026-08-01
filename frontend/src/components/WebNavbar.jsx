import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShieldAlert, Award, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const WebNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Courses', path: '/courses' },
    { name: 'Verify Certificate', path: '/verify' },
    { name: 'Contact Us', path: '/contact' }
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-50 bg-transparent backdrop-blur-md border-b border-[var(--border-color)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-emerald-500/20">
              SS
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-[var(--text-dark)] block leading-none">
                Slog Solutions
              </span>
              <span className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5 block leading-none">
                Training & Internship
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-xs font-semibold tracking-wide transition-colors duration-200 ${
                  isActive(link.path)
                    ? 'text-emerald-500 font-bold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-dark)]'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Right Panel Button */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-dark)] hover:bg-[var(--primary-subtle)] focus:outline-none transition-colors"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
            </button>
          </div>

          {/* Mobile Actions Panel */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-dark)] hover:bg-[var(--primary-subtle)] focus:outline-none transition-colors"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-dark)] hover:bg-[var(--primary-subtle)] focus:outline-none transition-colors"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="md:hidden bg-[var(--bg-card)] border-b border-[var(--border-color)] animate-in py-3 px-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-lg text-xs font-medium transition ${
                isActive(link.path)
                  ? 'bg-emerald-500/10 text-emerald-500 font-bold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-dark)] hover:bg-[var(--primary-subtle)]'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default WebNavbar;
