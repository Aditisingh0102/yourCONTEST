import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import SharedLayout from './SharedLayout';
import { useTheme } from '../hooks/useTheme';

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null, info: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { this.setState({ info }); console.error(error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', background: '#fee', minHeight: '100vh' }}>
          <h1>Rendering Error</h1>
          <pre>{this.state.error?.toString()}</pre>
          <pre>{this.state.info?.componentStack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function FacultyLayout() {
  const [theme, cycleTheme] = useTheme();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(() => {
    const saved = sessionStorage.getItem('faculty_profile');
    if (saved) return JSON.parse(saved);
    return null;
  });

  useEffect(() => {
    if (!sessionStorage.getItem('faculty_profile')) {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    const handleUpdate = () => {
      const saved = sessionStorage.getItem('faculty_profile');
      if (saved) setProfileData(JSON.parse(saved));
    };
    window.addEventListener('profile-updated', handleUpdate);
    return () => window.removeEventListener('profile-updated', handleUpdate);
  }, []);

  if (!profileData) return null;

  return (
    <ErrorBoundary>
      <SharedLayout user={profileData} role="faculty" theme={theme} onCycleTheme={cycleTheme}>
        <Outlet />
      </SharedLayout>
    </ErrorBoundary>
  );
}
