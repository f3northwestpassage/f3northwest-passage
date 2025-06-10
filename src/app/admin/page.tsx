'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
// Import other components like Header, Footer, but they won't be used in the simplified JSX.
// This is to keep the surrounding code structure for when we revert.
import Header from '../_components/Header';
import Footer from '../_components/Footer';
import { fetchWorkoutsData } from '../../utils/fetchWorkoutsData';
import type { Workout } from '../../utils/fetchWorkoutsData';
import { useState, useEffect } from 'react';

const ADMIN_PASSWORD = 'f3northwestpassgeslt'; // Or your actual hardcoded page access password

export default function AdminPage() {
  const searchParams = useSearchParams();
  const providedPassword = searchParams.get('pw');

  // State initializations (keep them, useEffect refers to them)
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [editingWorkoutIndex, setEditingWorkoutIndex] = useState<number | null>(null);
  const [currentEditData, setCurrentEditData] = useState<Workout | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    console.log("AdminPage: useEffect triggered."); // Key diagnostic log

    const data = fetchWorkoutsData();

    console.log("AdminPage: Fetched data in useEffect:", JSON.stringify(data, null, 2));

    if (!Array.isArray(data)) {
      console.error('AdminPage: ERROR - Fetched data is not an array! Received:', data);
      setWorkouts([]); // Ensure workouts is always an array
      return;
    }

    if (data.length > 0) {
      const firstItem = data[0];
      if (typeof firstItem.ao === 'undefined' || typeof firstItem.location === 'undefined') {
        console.error('AdminPage: ERROR - First workout object in fetched data is missing expected properties (e.g., ao or location). First item:', JSON.stringify(firstItem, null, 2));
      }
      if (firstItem.location && (typeof firstItem.location.text === 'undefined' || typeof firstItem.location.href === 'undefined')) {
         console.error('AdminPage: ERROR - First workout object has a location object, but it is missing text or href. Location:', JSON.stringify(firstItem.location, null, 2));
      }
    }
    setWorkouts(data);
  }, []); // Empty dependency array means this runs once after initial mount

  // Event handlers (definitions kept for when JSX is restored)
  const handleEdit = (index: number) => {
    setEditingWorkoutIndex(index);
    const workoutToEdit = workouts[index];
    setCurrentEditData({
      ao: workoutToEdit.ao ?? '',
      style: workoutToEdit.style ?? '',
      location: {
        href: workoutToEdit.location?.href ?? '',
        text: workoutToEdit.location?.text ?? '',
      },
      day: workoutToEdit.day ?? '',
      time: workoutToEdit.time ?? '',
    });
  };

  const handleCancelEdit = () => {
    setEditingWorkoutIndex(null);
    setCurrentEditData(null);
  };

  const handleSaveEdit = async () => {
    if (!currentEditData || editingWorkoutIndex === null) {
      setMessage('Error: No data to save or invalid index.');
      return;
    }
    setIsLoading(true);
    setMessage(null);
    const updatedWorkouts = [...workouts];
    updatedWorkouts[editingWorkoutIndex] = currentEditData;
    try {
      const password = searchParams.get('pw');
      if (!password) {
          setMessage('Error: Admin password not found in URL for API call.');
          setIsLoading(false);
          return;
      }
      const response = await fetch(`/api/workouts?pw=${password}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedWorkouts),
      });
      const result = await response.json();
      if (!response.ok) { throw new Error(result.message || `API Error: ${response.status}`); }
      setWorkouts(updatedWorkouts);
      setMessage(result.message || 'Workout saved successfully!');
      setEditingWorkoutIndex(null);
      setCurrentEditData(null);
    } catch (error) {
      console.error('Failed to save workout:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while saving.';
      setMessage(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentEditData) return;
    const { name, value } = event.target;
    if (name.startsWith('location.')) {
      const key = name.split('.')[1] as keyof Workout['location'];
      setCurrentEditData({ ...currentEditData, location: { ...currentEditData.location, [key]: value } });
    } else {
      setCurrentEditData({ ...currentEditData, [name]: value });
    }
  };

  // Simplified Password check and JSX returns
  if (providedPassword !== ADMIN_PASSWORD) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h1 style={{ color: 'red', fontSize: '24px', fontWeight: 'bold' }}>Access Denied</h1>
        <p style={{ marginTop: '16px' }}>
          You have not provided the correct password to access this page.
        </p>
        {/* Ensure Link is imported from next/link */}
        <Link href="/" style={{ marginTop: '24px', display: 'inline-block', backgroundColor: '#3b82f6', color: 'white', padding: '8px 16px', borderRadius: '4px', textDecoration: 'none' }}>
          Go to Homepage
        </Link>
      </div>
    );
  }

  // Drastically Simplified Authenticated View
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center' }}>Admin Access OK</h1>
      <p style={{ marginTop: '16px', textAlign: 'center' }}>Page content would normally be here.</p>
      <p style={{ marginTop: '8px', textAlign: 'center', fontSize: '12px', color: 'gray' }}>
        {`(This is a simplified view for debugging. Check console for 'AdminPage: useEffect triggered.' log.)`}
      </p>
    </div>
  );
}
