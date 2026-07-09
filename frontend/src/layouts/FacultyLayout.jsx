import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import SharedLayout from './SharedLayout';
import { useTheme } from '../hooks/useTheme';

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
    <SharedLayout user={profileData} role="faculty" theme={theme} onCycleTheme={cycleTheme}>
      <Outlet />
    </SharedLayout>
  );
}
