'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../_components/Header';
import Footer from '../_components/Footer';
import { fetchWorkoutsData } from '../../utils/fetchWorkoutsData';
import type { Workout } from '../../utils/fetchWorkoutsData'; // Ensure Workout is exported and imported
import { useState, useEffect } from 'react'; // Import useState, useEffect

const ADMIN_PASSWORD = 'f3northwestpassageslt';

export default function AdminPage() {
  const searchParams = useSearchParams();
  const providedPassword = searchParams.get('pw');

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [editingWorkoutIndex, setEditingWorkoutIndex] = useState<number | null>(null);
  const [currentEditData, setCurrentEditData] = useState<Workout | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch initial data
  useEffect(() => {
    const data = fetchWorkoutsData();
    setWorkouts(data);
  }, []);

  const handleEdit = (index: number) => {
    setEditingWorkoutIndex(index);
    setCurrentEditData({ ...workouts[index] }); // Make a copy for editing
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
    setMessage(null); // Clear previous messages

    // Create a new array with the updated workout
    const updatedWorkouts = [...workouts];
    updatedWorkouts[editingWorkoutIndex] = currentEditData;

    try {
      // Get password from searchParams for the API call
      const password = searchParams.get('pw');
      if (!password) {
          setMessage('Error: Admin password not found in URL for API call.');
          setIsLoading(false);
          return;
      }

      const response = await fetch(`/api/workouts?pw=${password}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedWorkouts),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `API Error: ${response.status}`);
      }

      // On successful save to backend, update local state
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
      setCurrentEditData({
        ...currentEditData,
        location: {
          ...currentEditData.location,
          [key]: value,
        },
      });
    } else {
      setCurrentEditData({
        ...currentEditData,
        [name]: value,
      });
    }
  };

  if (providedPassword !== ADMIN_PASSWORD) {
    // ... (access denied JSX remains the same)
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

  return (
    <>
      <Header href="/admin" />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-2"> {/* Reduced mb from 8 to 2 */}
          Admin Dashboard - Manage Workouts
        </h1>
        {isLoading && <p className="text-center text-blue-500">Saving...</p>}
        {message && (
          <p className={`text-center p-2 mb-4 ${message.startsWith('Error:') ? 'text-red-500 bg-red-100' : 'text-green-500 bg-green-100'}`}>
            {message}
          </p>
        )}
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
                        <td><input type="text" name="ao" value={currentEditData.ao} onChange={handleInputChange} className="border p-1 w-full"/></td>
                        <td><input type="text" name="style" value={currentEditData.style} onChange={handleInputChange} className="border p-1 w-full"/></td>
                        <td><input type="text" name="location.text" value={currentEditData.location.text} onChange={handleInputChange} className="border p-1 w-full"/></td>
                        <td><input type="text" name="location.href" value={currentEditData.location.href} onChange={handleInputChange} className="border p-1 w-full"/></td>
                        <td><input type="text" name="day" value={currentEditData.day} onChange={handleInputChange} className="border p-1 w-full"/></td>
                        <td><input type="text" name="time" value={currentEditData.time} onChange={handleInputChange} className="border p-1 w-full"/></td>
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
