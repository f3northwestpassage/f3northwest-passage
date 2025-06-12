// app/admin/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../_components/Header';
import Footer from '../_components/Footer';
import type { WorkoutClean } from '../../../types/workout'
import { useState, useEffect, useMemo } from 'react';

// Define a type for the grouped workouts for clarity
interface GroupedWorkout {
  [ao: string]: { // e.g., "The Pit"
    [day: string]: { // e.g., "Monday"
      [time: string]: WorkoutClean[]; // e.g., "05:30": [workout1, workout2]
    };
  };
}


// This component expects to receive its password via URL query param e.g., /admin?pw=your_password
export default function AdminPage() {
  const searchParams = useSearchParams();
  const providedPassword = searchParams.get('pw');

  const [workouts, setWorkouts] = useState<WorkoutClean[]>([]);
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null); // Changed to store ID
  const [currentEditData, setCurrentEditData] = useState<WorkoutClean | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // State for adding a new workout
  const [newWorkoutData, setNewWorkoutData] = useState<Omit<WorkoutClean, '_id'> & { _id?: string }>({
    ao: '',
    style: '',
    location: { href: '', text: '' },
    day: '',
    time: '',
    q: '',
    avgAttendance: '',
  });


  // Client-side password for display/initial check only
  // This must match the admin_password in src/locales/en.json and your API route's check
  const CLIENT_ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD; // Ensure this is set in .env.local

  // Function to refresh workouts after an operation
  const refreshWorkouts = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      console.log("AdminPage: Calling API for workouts...");
      const response = await fetch(`/api/workouts?pw=${providedPassword}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `API Error: ${response.status}`);
      }
      if (!Array.isArray(data)) {
        console.error('AdminPage: ERROR - Fetched data is not an array! Received:', data);
        setWorkouts([]);
        setMessage('Error: Data received from server was not in expected format.');
        return;
      }
      setWorkouts(data);
      console.log("AdminPage: Workouts fetched successfully.");
    } catch (error) {
      console.error('AdminPage: Error in refreshWorkouts:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while refreshing workouts.';
      setMessage(`Error refreshing workouts: ${errorMessage}`);
      setWorkouts([]);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    console.log("AdminPage: useEffect triggered.");
    if (providedPassword && providedPassword === CLIENT_ADMIN_PASSWORD) { // Only attempt to load if password matches client-side expectation
      refreshWorkouts();
    } else if (providedPassword && providedPassword !== CLIENT_ADMIN_PASSWORD) {
      // If password is provided but incorrect on client side, set message
      setMessage('Access Denied: Invalid password in URL.');
    }
  }, [providedPassword, CLIENT_ADMIN_PASSWORD]); // Rerun if password changes in URL or client password loads


  // Group workouts by AO, then Day, then Time
  const groupedWorkouts = useMemo(() => {
    const groups: GroupedWorkout = {};
    workouts.forEach(workout => {
      if (!groups[workout.ao]) {
        groups[workout.ao] = {};
      }
      if (!groups[workout.ao][workout.day]) {
        groups[workout.ao][workout.day] = {};
      }
      if (!groups[workout.ao][workout.day][workout.time]) {
        groups[workout.ao][workout.day][workout.time] = [];
      }
      groups[workout.ao][workout.day][workout.time].push(workout);
    });
    // Sort AOs, Days, and Times for consistent display
    const sortedGroups: GroupedWorkout = {};
    Object.keys(groups).sort().forEach(ao => {
      sortedGroups[ao] = {};
      Object.keys(groups[ao]).sort((a, b) => {
        // Custom sort for days (Mon, Tue, Wed, ...)
        const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        return daysOrder.indexOf(a) - daysOrder.indexOf(b);
      }).forEach(day => {
        sortedGroups[ao][day] = {};
        Object.keys(groups[ao][day]).sort().forEach(time => { // Times can be sorted alphabetically, assuming "05:00" vs "10:00"
          sortedGroups[ao][day][time] = groups[ao][day][time].sort((a, b) => (a.style || '').localeCompare(b.style || '')); // Sort by style
        });
      });
    });
    return sortedGroups;
  }, [workouts]);


  // Handle Edit button click
  // Now takes the workout ID
  const handleEdit = (workoutId: string) => {
    const workoutToEdit = workouts.find(w => w._id === workoutId);
    if (!workoutToEdit) {
      setMessage('Error: Workout not found for editing.');
      return;
    }

    setEditingWorkoutId(workoutId); // Store the ID being edited
    setCurrentEditData({
      _id: workoutToEdit._id,
      ao: workoutToEdit.ao ?? '',
      style: workoutToEdit.style ?? '',
      location: {
        href: workoutToEdit.location?.href ?? '',
        text: workoutToEdit.location?.text ?? '',
      },
      day: workoutToEdit.day ?? '',
      time: workoutToEdit.time ?? '',
      q: workoutToEdit.q ?? '',
      avgAttendance: workoutToEdit.avgAttendance ?? '',
    });
  };

  // Handle Cancel Edit button click
  const handleCancelEdit = () => {
    setEditingWorkoutId(null);
    setCurrentEditData(null);
  };

  // Handle Save Edit button click
  const handleSaveEdit = async () => {
    if (!currentEditData || editingWorkoutId === null) {
      setMessage('Error: No data to save or invalid ID.');
      return;
    }
    setIsLoading(true);
    setMessage(null);

    // --- ADDED VALIDATION HERE FOR EDITING ---
    if (!currentEditData.ao.trim() || !currentEditData.day.trim() || !currentEditData.time.trim()) {
      setMessage('Error: AO, Day, and Time are required fields.');
      setIsLoading(false);
      return;
    }
    // --- END ADDED VALIDATION ---

    try {
      const password = searchParams.get('pw');
      if (!password) {
        setMessage('Error: Admin password not found in URL for API call.');
        setIsLoading(false);
        return;
      }
      // Send only the currentEditData to the POST API route
      const response = await fetch(`/api/workouts?pw=${password}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentEditData), // Sending just the edited object
      });
      const result = await response.json();
      if (!response.ok) { throw new Error(result.message || `API Error: ${response.status}`); }

      setMessage(result.message || 'Workout updated successfully!');
      setEditingWorkoutId(null); // Clear the editing ID
      setCurrentEditData(null);
      refreshWorkouts(); // Refresh the list to show the updated data
    } catch (error) {
      console.error('Failed to save workout:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while saving.';
      setMessage(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes for existing workout editing
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentEditData) return;
    const { name, value } = event.target;
    if (name.startsWith('location.')) {
      const locKey = name.split('.')[1] as keyof WorkoutClean['location'];
      setCurrentEditData(prev => ({
        ...prev!,
        location: {
          ...(prev!.location),
          [locKey]: value,
        },
      }));
    } else {
      setCurrentEditData(prev => ({
        ...prev!,
        [name]: value,
      }));
    }
  };

  // --- Handle input changes for adding new workout ---
  const handleNewInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name.startsWith('location.')) {
      const locKey = name.split('.')[1] as keyof typeof newWorkoutData['location'];
      setNewWorkoutData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locKey]: value,
        },
      }));
    } else {
      setNewWorkoutData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // --- Handle adding a new workout ---
  const handleAddWorkout = async () => {
    setIsLoading(true);
    setMessage(null);

    // --- ADDED VALIDATION HERE FOR NEW WORKOUT ---
    if (!newWorkoutData.ao.trim() || !newWorkoutData.day.trim() || !newWorkoutData.time.trim()) {
      setMessage('Error: AO, Day, and Time are required for new workout.');
      setIsLoading(false);
      return;
    }
    // --- END ADDED VALIDATION ---

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
        body: JSON.stringify(newWorkoutData), // Send the new workout object
      });
      const result = await response.json();
      if (!response.ok) { throw new Error(result.message || `API Error: ${response.status}`); }

      setMessage(result.message || 'New workout added successfully!');
      setNewWorkoutData({ // Reset form fields
        ao: '',
        style: '',
        location: { href: '', text: '' },
        day: '',
        time: '',
        q: '',
        avgAttendance: '',
      });
      refreshWorkouts(); // Refresh the list to show the newly added workout
    } catch (error) {
      console.error('Failed to add workout:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while adding.';
      setMessage(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Handle deleting a workout ---
  const handleDeleteWorkout = async (_id: string) => {
    if (!confirm('Are you sure you want to delete this workout? This action cannot be undone.')) {
      return; // User cancelled
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const password = searchParams.get('pw');
      if (!password) {
        setMessage('Error: Admin password not found in URL for API call.');
        setIsLoading(false);
        return;
      }
      // Send DELETE request with workout ID in query
      const response = await fetch(`/api/workouts?pw=${password}&id=${_id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      if (!response.ok) { throw new Error(result.message || `API Error: ${response.status}`); }

      setMessage(result.message || 'Workout deleted successfully!');
      refreshWorkouts(); // Refresh the list to reflect the deletion
    } catch (error) {
      console.error('Failed to delete workout:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while deleting.';
      setMessage(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };


  // Render Access Denied if password does not match
  if (providedPassword !== CLIENT_ADMIN_PASSWORD) {
    return (
      <>
        <Header href="/admin" />
        <main className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-4">
            You have not provided the correct password to access this page.
            {message && <span className="block text-sm text-red-500 mt-2">{message}</span>}
          </p>
          <Link href="/" className="mt-6 inline-block bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
            Go to Homepage
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  // Render Admin Dashboard
  return (
    <>
      <Header href="/admin" />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-2">
          Admin Dashboard - Manage Workouts
        </h1>
        {isLoading && <p className="text-center text-blue-500">Loading/Saving...</p>}
        {message && (
          <p className={`text-center p-2 mb-4 ${message.startsWith('Error:') ? 'text-red-500 bg-red-100' : 'text-green-500 bg-green-100'}`}>
            {message}
          </p>
        )}

        {/* --- Add New Workout Form --- */}
        <section className="bg-gray-100 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-4">Add New Workout</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label htmlFor="new-ao" className="block text-sm font-medium text-gray-700">AO (Area of Operations)<span className="text-red-500">*</span></label>
              <input type="text" id="new-ao" name="ao" value={newWorkoutData.ao} onChange={handleNewInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="e.g., The Pit" required />
            </div>
            <div>
              <label htmlFor="new-style" className="block text-sm font-medium text-gray-700">Style</label>
              <input type="text" id="new-style" name="style" value={newWorkoutData.style ?? ''} onChange={handleNewInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="e.g., Bootcamp" />
            </div>
            <div>
              <label htmlFor="new-location-text" className="block text-sm font-medium text-gray-700">Location Text</label>
              <input type="text" id="new-location-text" name="location.text" value={newWorkoutData.location.text} onChange={handleNewInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="e.g., Centennial Park" />
            </div>
            <div>
              <label htmlFor="new-location-href" className="block text-sm font-medium text-gray-700">Location Map Link</label>
              <input type="text" id="new-location-href" name="location.href" value={newWorkoutData.location.href} onChange={handleNewInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="e.g., https://goo.gl/maps/..." />
            </div>
            <div>
              <label htmlFor="new-day" className="block text-sm font-medium text-gray-700">Day<span className="text-red-500">*</span></label>
              <input type="text" id="new-day" name="day" value={newWorkoutData.day} onChange={handleNewInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="e.g., Monday" required />
            </div>
            <div>
              <label htmlFor="new-time" className="block text-sm font-medium text-gray-700">Time<span className="text-red-500">*</span></label>
              <input type="text" id="new-time" name="time" value={newWorkoutData.time} onChange={handleNewInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="e.g., 05:30" required />
            </div>
            <div>
              <label htmlFor="new-q" className="block text-sm font-medium text-gray-700">Q (Leader)</label>
              <input type="text" id="new-q" name="q" value={newWorkoutData.q ?? ''} onChange={handleNewInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="e.g., Dredd" />
            </div>
            <div>
              <label htmlFor="new-avg-attendance" className="block text-sm font-medium text-gray-700">Avg. Attendance</label>
              <input type="text" id="new-avg-attendance" name="avgAttendance" value={newWorkoutData.avgAttendance ?? ''} onChange={handleNewInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="e.g., 10" />
            </div>
          </div>
          <button onClick={handleAddWorkout} disabled={isLoading} className="mt-6 bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50">
            {isLoading ? 'Adding...' : 'Add New Workout'}
          </button>
        </section>


        {/* --- Existing Workouts Display (Grouped) --- */}
        <h2 className="text-2xl font-bold mb-4">Existing Workouts</h2>
        {Object.keys(groupedWorkouts).length === 0 && !isLoading ? (
          <p className="text-center text-gray-500">No workouts found. Add one above!</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedWorkouts).map(([aoName, days]) => (
              <details key={aoName} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                <summary className="cursor-pointer text-xl font-bold text-blue-800">
                  {aoName}
                  <span className="ml-2 text-gray-500 text-sm">({Object.keys(days).length} Day(s))</span>
                </summary>

                <div className="ml-4 mt-4 space-y-3">
                  {Object.entries(days).map(([dayName, times]) => (
                    <details key={dayName} className="bg-gray-50 p-3 rounded-lg shadow-sm border border-gray-100">
                      <summary className="cursor-pointer text-lg font-semibold text-gray-800">
                        {dayName}
                        <span className="ml-2 text-gray-500 text-sm">({Object.keys(times).length} Time Slot(s))</span>
                      </summary>

                      <div className="ml-4 mt-3 space-y-2">
                        {Object.entries(times).map(([timeName, workoutDetails]) => (
                          <details key={timeName} className="bg-gray-100 p-2 rounded-lg border border-gray-200">
                            <summary className="cursor-pointer font-medium text-md text-gray-700">
                              {timeName}
                              <span className="ml-2 text-gray-500 text-sm">({workoutDetails.length} Style(s))</span>
                            </summary>

                            <div className="ml-4 mt-2 space-y-1">
                              {workoutDetails.map(workout => (
                                <div key={workout._id} className="flex flex-col md:flex-row md:items-center justify-between p-2 bg-white rounded-md shadow-sm border border-gray-200 text-sm">
                                  {editingWorkoutId === workout._id && currentEditData ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 w-full">
                                      {/* Added required flags for client-side validation hints */}
                                      <input type="text" name="ao" value={currentEditData.ao} onChange={handleInputChange} placeholder="AO" className="border p-1 text-sm" required />
                                      <input type="text" name="style" value={currentEditData.style ?? ''} onChange={handleInputChange} placeholder="Style" className="border p-1 text-sm" />
                                      <input type="text" name="location.text" value={currentEditData.location.text} onChange={handleInputChange} placeholder="Location Text" className="border p-1 text-sm" />
                                      <input type="text" name="location.href" value={currentEditData.location.href} onChange={handleInputChange} placeholder="Location Link" className="border p-1 text-sm" />
                                      <input type="text" name="day" value={currentEditData.day} onChange={handleInputChange} placeholder="Day" className="border p-1 text-sm" required />
                                      <input type="text" name="time" value={currentEditData.time} onChange={handleInputChange} placeholder="Time" className="border p-1 text-sm" required />
                                      <input type="text" name="q" value={currentEditData.q ?? ''} onChange={handleInputChange} placeholder="Q" className="border p-1 text-sm" />
                                      <input type="text" name="avgAttendance" value={currentEditData.avgAttendance ?? ''} onChange={handleInputChange} placeholder="Avg. Att." className="border p-1 text-sm" />
                                      <div className="flex space-x-2 col-span-full">
                                        <button onClick={handleSaveEdit} disabled={isLoading} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:opacity-50">Save</button>
                                        <button onClick={handleCancelEdit} disabled={isLoading} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50">Cancel</button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="flex-grow grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-1">
                                        <p><span className="font-semibold">Style:</span> {workout.style}</p>
                                        <p><span className="font-semibold">Location:</span> <a href={workout.location.href} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{workout.location.text}</a></p>
                                        <p><span className="font-semibold">Q:</span> {workout.q}</p>
                                        <p><span className="font-semibold">Avg. Att.:</span> {workout.avgAttendance}</p>
                                        {/* Added AO, Day, Time here for visibility even though they are parents */}
                                        <p><span className="font-semibold">AO:</span> {workout.ao}</p>
                                        <p><span className="font-semibold">Day:</span> {workout.day}</p>
                                        <p><span className="font-semibold">Time:</span> {workout.time}</p>
                                        <p className="hidden md:block"></p> {/* Placeholder for alignment */}
                                      </div>
                                      <div className="flex space-x-2 mt-2 md:mt-0 md:ml-4 flex-shrink-0">
                                        <button onClick={() => handleEdit(workout._id||"")} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Edit</button>
                                        <button onClick={() => handleDeleteWorkout(workout._id||"")} className="bg-red-700 text-white px-3 py-1 rounded hover:bg-red-800">Delete</button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              ))}
                            </div>
                          </details>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </details>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}