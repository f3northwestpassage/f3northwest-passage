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

      <>
        <Header href="/admin" />
        <main className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-4">
            You have not provided the correct password to access this page.
          </p>
          <Link href="/" className="mt-6 inline-block bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
            Go to Homepage
          </Link>
        </main>
        <Footer />
      </>

    );
  }

  // Drastically Simplified Authenticated View
  return (
    <>
      <Header href="/admin" />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-2">
          Admin Dashboard - Manage Workouts
        </h1>
        {isLoading && <p className="text-center text-blue-500">Saving...</p>}
        {message && (
          <p className={`text-center p-2 mb-4 ${message.startsWith('Error:') ? 'text-red-500 bg-red-100' : 'text-green-500 bg-green-100'}`}>
            {message}
          </p>
        )}
        {/* This is where the workout table is. */}
        {workouts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="py-3 px-4 uppercase font-semibold text-sm text-left">AO</th>
                  <th className="py-3 px-4 uppercase font-semibold text-sm text-left">Style</th>
                  <th className="py-3 px-4 uppercase font-semibold text-sm text-left">Location Text</th>
                  <th className="py-3 px-4 uppercase font-semibold text-sm text-left">Location Link</th>
                  <th className="py-3 px-4 uppercase font-semibold text-sm text-left">Day</th>
                  <th className="py-3 px-4 uppercase font-semibold text-sm text-left">Time</th>
                  <th className="py-3 px-4 uppercase font-semibold text-sm text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {workouts.map((workout, index) => (
                  <tr key={index} className="hover:bg-gray-100 border-b border-gray-200">
                    {editingWorkoutIndex === index && currentEditData ? (
                      <>
                        <td><input type="text" name="ao" value={currentEditData.ao ?? ''} onChange={handleInputChange} className="border p-1 w-full"/></td>
                        <td><input type="text" name="style" value={currentEditData.style ?? ''} onChange={handleInputChange} className="border p-1 w-full"/></td>
                        <td><input type="text" name="location.text" value={currentEditData.location?.text ?? ''} onChange={handleInputChange} className="border p-1 w-full"/></td>
                        <td><input type="text" name="location.href" value={currentEditData.location?.href ?? ''} onChange={handleInputChange} className="border p-1 w-full"/></td>
                        <td><input type="text" name="day" value={currentEditData.day ?? ''} onChange={handleInputChange} className="border p-1 w-full"/></td>
                        <td><input type="text" name="time" value={currentEditData.time ?? ''} onChange={handleInputChange} className="border p-1 w-full"/></td>
                        <td className="py-3 px-4">
                          <button onClick={handleSaveEdit} className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600">Save</button>
                          <button onClick={handleCancelEdit} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Cancel</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 px-4">{workout.ao}</td>
                        <td className="py-3 px-4">{workout.style}</td>
                        <td className="py-3 px-4">{workout.location.text}</td>
                        <td className="py-3 px-4">
                          <a href={workout.location.href} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                            View Map
                          </a>
                        </td>
                        <td className="py-3 px-4">{workout.day}</td>
                        <td className="py-3 px-4">{workout.time}</td>
                        <td className="py-3 px-4">
                          <button onClick={() => handleEdit(index)} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Edit</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500">No workouts found. Or loading...</p>
        )}
      </main>
      <Footer />
    </>
  );
}
