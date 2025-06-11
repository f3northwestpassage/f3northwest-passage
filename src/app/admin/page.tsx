'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
// Import other components like Header, Footer, but they won't be used in the simplified JSX.
// This is to keep the surrounding code structure for when we revert.
import Header from '../_components/Header';
import Footer from '../_components/Footer';
import { fetchWorkoutsData } from '../../utils/fetchWorkoutsData';
import type { WorkoutClean } from '../../../types/workout' // Changed Workout to WorkoutClean
import { useState, useEffect } from 'react';

const ADMIN_PASSWORD = 'changeme';

export default function AdminPage() {
  const searchParams = useSearchParams();
  const providedPassword = searchParams.get('pw');

  // State initializations (keep them, useEffect refers to them)
  const [workouts, setWorkouts] = useState<WorkoutClean[]>([]); // Changed Workout to WorkoutClean
  const [editingWorkoutIndex, setEditingWorkoutIndex] = useState<number | null>(null);
  const [currentEditData, setCurrentEditData] = useState<WorkoutClean | null>(null); // Changed Workout to WorkoutClean
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    console.log("AdminPage: useEffect triggered.");

    async function loadAdminWorkouts() {
      console.log("AdminPage: Calling fetchWorkoutsData (async)...");
      try {
        const data = await fetchWorkoutsData(); // Correctly await the async function

        console.log("AdminPage: Fetched data in useEffect:", JSON.stringify(data, null, 2));

        if (!Array.isArray(data)) {
          console.error('AdminPage: ERROR - Fetched data is not an array! Received:', data);
          setWorkouts([]);
          return;
        }

        if (data.length > 0) {
          const firstItem = data[0];
          // Note: The Workout type from fetchWorkoutsData is WorkoutClean, which might not have WorkoutClean[]
          // This check should be adjusted if Workout type is different.
          // Assuming WorkoutClean interface is used by fetchWorkoutsData:
          if (typeof firstItem.ao === 'undefined' || typeof firstItem.location === 'undefined') {
            console.error('AdminPage: ERROR - First workout object in fetched data is missing expected properties (e.g., ao or location). First item:', JSON.stringify(firstItem, null, 2));
          }
          if (firstItem.location && (typeof firstItem.location.text === 'undefined' || typeof firstItem.location.href === 'undefined')) {
            console.error('AdminPage: ERROR - First workout object has a location object, but it is missing text or href. Location:', JSON.stringify(firstItem.location, null, 2));
          }
        }
        setWorkouts(data); // Removed 'as Workout[]' cast
      } catch (error) {
        console.error('AdminPage: Error in loadAdminWorkouts:', error);
        setWorkouts([]); // Set to empty or handle error state appropriately
      }
    }

    loadAdminWorkouts();
  }, []); // Empty dependency array ensures this runs once on mount

  // Event handlers (definitions kept for when JSX is restored)
  const handleEdit = (index: number) => {
    setEditingWorkoutIndex(index);
    const workoutToEdit = workouts[index]; // workoutToEdit is now WorkoutClean
    setCurrentEditData({
      _id: workoutToEdit._id, // Preserve _id if it exists
      ao: workoutToEdit.ao ?? '',
      style: workoutToEdit.style ?? '',
      location: {
        href: workoutToEdit.location?.href ?? '',
        text: workoutToEdit.location?.text ?? '',
      },
      day: workoutToEdit.day ?? '',
      time: workoutToEdit.time ?? '',
      q: workoutToEdit.q ?? '', // Assuming q and avgAttendance are part of WorkoutClean
      avgAttendance: workoutToEdit.avgAttendance ?? '',
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
      // Assuming WorkoutClean has a location structure compatible with this logic
      const locKey = name.split('.')[1] as keyof WorkoutClean['location'];
      setCurrentEditData({
        ...currentEditData,
        location: {
          ...currentEditData.location,
          [locKey]: value,
        },
      });
    } else {
      setCurrentEditData({
        ...currentEditData,
        [name]: value,
      });
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
        {/* workouts.length > 0 ? ( ... ) : ( ... ) block restored below */}
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
                        <td><input type="text" name="ao" value={currentEditData.ao ?? ''} onChange={handleInputChange} className="border p-1 w-full" /></td>
                        <td><input type="text" name="style" value={currentEditData.style ?? ''} onChange={handleInputChange} className="border p-1 w-full" /></td>
                        <td><input type="text" name="location.text" value={currentEditData.location?.text ?? ''} onChange={handleInputChange} className="border p-1 w-full" /></td>
                        <td><input type="text" name="location.href" value={currentEditData.location?.href ?? ''} onChange={handleInputChange} className="border p-1 w-full" /></td>
                        <td><input type="text" name="day" value={currentEditData.day ?? ''} onChange={handleInputChange} className="border p-1 w-full" /></td>
                        <td><input type="text" name="time" value={currentEditData.time ?? ''} onChange={handleInputChange} className="border p-1 w-full" /></td>
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
