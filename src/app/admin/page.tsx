// app/admin/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../_components/Header';
import Footer from '../_components/Footer';
import type { LocationClean, WorkoutClean } from '../../../types/workout';
import { useState, useEffect, useMemo, useCallback } from 'react';

// For icons
import { TrashIcon, PlusCircleIcon, PencilIcon } from '@heroicons/react/24/solid';

// Define interfaces for form states (for modals)
interface NewLocationFormState extends Omit<LocationClean, '_id'> {
  _id?: string; // Optional for new location
  q?: string; // Permanent Q for the location
  embedMapLink?: string; // Optional embed map link
  imageUrl?: string; // This will store the URL from Cloudinary (for initial population/display)
}

// Corrected WorkoutFormState: Reflects new fields, removed 'q' and 'ao'
interface WorkoutFormState extends Omit<WorkoutClean, '_id' | 'locationId' | 'ao'> {
  _id?: string; // Optional for new workout
  locationId: string; // Mandatory when creating/editing a workout, derived from selected location
}

// Define type for grouped workouts (for display)
interface WorkoutsByLocation {
  [locationId: string]: WorkoutClean[];
}

// Predefined lists for checkboxes
const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
  'Every Third Friday', // Special schedule
  'All Saturdays Except the Last of the Month' // Special schedule
];

const WORKOUT_TYPES = [
  'Bootcamp', 'Ruck', 'Running', 'Mobility', 'CrossFit', 'Strength', 'Yoga', 'HIIT', 'Cycling', 'Swimming'
  // Add/remove as needed for your specific workout types
];

export default function AdminPage() {
  const searchParams = useSearchParams();
  const providedPassword = searchParams.get('pw');

  const [locations, setLocations] = useState<LocationClean[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutClean[]>([]);

  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // State for Add/Edit Location Modal
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [editingLocationData, setEditingLocationData] = useState<NewLocationFormState | null>(null);

  // NEW: State for handling image file and its preview
  const [currentLocationImageFile, setCurrentLocationImageFile] = useState<File | null>(null);
  const [currentLocationImageUrl, setCurrentLocationImageUrl] = useState<string | null>(null); // For displaying preview (local object URL or existing Cloudinary URL)


  // State for Add/Edit Workout Modal
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [currentWorkoutLocationId, setCurrentWorkoutLocationId] = useState<string | null>(null);
  const [editingWorkoutData, setEditingWorkoutData] = useState<WorkoutFormState | null>(null);

  // New location form state - includes 'q', 'embedMapLink' fields (imageUrl will be handled by file state)
  const [newLocationData, setNewLocationData] = useState<NewLocationFormState>({
    name: '',
    mapLink: '',
    address: '',
    description: '',
    q: '',
    embedMapLink: '',
    imageUrl: '', // Initialize here for consistency, but file input will override/manage.
  });

  // Corrected newWorkoutData state type: Reflects new fields, removed 'q'
  const [newWorkoutData, setNewWorkoutData] = useState<Omit<WorkoutClean, '_id' | 'locationId' | 'ao'>>({
    startTime: '',
    endTime: '',
    days: [], // Initialize as empty array
    types: [], // Initialize as empty array
  });

  const CLIENT_ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

  // --- Data Fetching ---
  const refreshAllData = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const password = providedPassword;
      if (!password) {
        setMessage('Error: Admin password not found in URL.');
        setIsLoading(false);
        return;
      }

      // Fetch locations
      const locationsResponse = await fetch(`/api/locations?pw=${password}`);
      const locationsData = await locationsResponse.json();
      if (!locationsResponse.ok) {
        throw new Error(locationsData.message || `API Error fetching locations: ${locationsResponse.status}`);
      }
      if (!Array.isArray(locationsData)) {
        console.error('AdminPage: ERROR - Fetched locations data is not an array! Received:', locationsData);
        setLocations([]);
        setMessage('Error: Locations data from server was not in expected format.');
        return;
      }
      setLocations(locationsData);

      // Fetch workouts
      const workoutsResponse = await fetch(`/api/workouts?pw=${password}`);
      const workoutsData = await workoutsResponse.json();
      if (!workoutsResponse.ok) {
        throw new Error(workoutsData.message || `API Error fetching workouts: ${workoutsResponse.status}`);
      }
      if (!Array.isArray(workoutsData)) {
        console.error('AdminPage: ERROR - Fetched workouts data is not an array! Received:', workoutsData);
        setWorkouts([]);
        setMessage('Error: Workouts data from server was not in expected format.');
        return;
      }
      setWorkouts(workoutsData);

      console.log("AdminPage: All data fetched successfully.");
    } catch (error) {
      console.error('AdminPage: Error in refreshAllData:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while refreshing data.';
      setMessage(`Error refreshing data: ${errorMessage}`);
      setLocations([]);
      setWorkouts([]);
    } finally {
      setIsLoading(false);
    }
  }, [providedPassword]);

  useEffect(() => {
    if (providedPassword && providedPassword === CLIENT_ADMIN_PASSWORD) {
      refreshAllData();
    } else if (providedPassword && providedPassword !== CLIENT_ADMIN_PASSWORD) {
      setMessage('Access Denied: Invalid password in URL.');
    }
  }, [providedPassword, CLIENT_ADMIN_PASSWORD, refreshAllData]);

  // --- Grouping Workouts by Location ---
  const workoutsGroupedByLocation = useMemo(() => {
    const grouped: WorkoutsByLocation = {};
    workouts.forEach(workout => {
      if (workout.locationId) {
        if (!grouped[workout.locationId]) {
          grouped[workout.locationId] = [];
        }
        grouped[workout.locationId].push(workout);
      }
    });

    // Sort workouts within each location by first Day in days array, then Start Time, then first Type in types array
    for (const locId in grouped) {
      grouped[locId].sort((a, b) => {
        const daysOrder = DAYS_OF_WEEK; // Use the predefined order
        const dayA = a.days.length > 0 ? daysOrder.indexOf(a.days[0]) : -1;
        const dayB = b.days.length > 0 ? daysOrder.indexOf(b.days[0]) : -1;

        if (dayA !== dayB) return dayA - dayB;

        // Compare start times directly as strings if they are in 'HH:MM' format
        if (a.startTime && b.startTime) {
          const timeComparison = a.startTime.localeCompare(b.startTime);
          if (timeComparison !== 0) return timeComparison;
        }

        // Compare first type in types array
        if (a.types.length > 0 && b.types.length > 0) {
          return a.types[0].localeCompare(b.types[0]);
        }
        return 0;
      });
    }

    return grouped;
  }, [workouts]);

  // --- Location Management Handlers ---
  const handleOpenAddLocationModal = () => {
    setEditingLocationData(null);
    setNewLocationData({ name: '', mapLink: '', address: '', description: '', q: '', embedMapLink: '', imageUrl: '' });
    setCurrentLocationImageFile(null); // Clear file input
    if (currentLocationImageUrl) {
      URL.revokeObjectURL(currentLocationImageUrl); // Clean up previous preview URL
    }
    setCurrentLocationImageUrl(null); // Clear image preview
    setShowLocationModal(true);
  };

  const handleOpenEditLocationModal = (location: LocationClean) => {
    setEditingLocationData({
      ...location,
      q: location.q || '',
      embedMapLink: location.embedMapLink || '',
      imageUrl: location.imageUrl || '', // Ensure imageUrl is propagated for display
    });
    setCurrentLocationImageFile(null); // Clear file input, a new file will be selected if desired
    if (currentLocationImageUrl) {
      URL.revokeObjectURL(currentLocationImageUrl); // Clean up previous preview URL
    }
    setCurrentLocationImageUrl(location.imageUrl || null); // Set existing image for preview
    setShowLocationModal(true);
  };

  const handleCloseLocationModal = () => {
    setShowLocationModal(false);
    setEditingLocationData(null);
    setNewLocationData({ name: '', mapLink: '', address: '', description: '', q: '', embedMapLink: '', imageUrl: '' });
    setCurrentLocationImageFile(null);
    if (currentLocationImageUrl) {
      URL.revokeObjectURL(currentLocationImageUrl); // Clean up object URL on close
    }
    setCurrentLocationImageUrl(null);
    setMessage(null);
  };

  const handleLocationInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (editingLocationData) {
      setEditingLocationData(prev => ({ ...prev!, [name]: value }));
    } else {
      setNewLocationData(prev => ({ ...prev, [name]: value }));
    }
  };

  // NEW: Handler for image file input
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCurrentLocationImageFile(file);

      // Create an object URL for preview
      if (currentLocationImageUrl) {
        URL.revokeObjectURL(currentLocationImageUrl); // Clean up previous URL if exists
      }
      setCurrentLocationImageUrl(URL.createObjectURL(file));
    } else {
      setCurrentLocationImageFile(null);
      if (currentLocationImageUrl) {
        URL.revokeObjectURL(currentLocationImageUrl); // Clean up URL if file is deselected
      }
      setCurrentLocationImageUrl(null);
    }
  };

  const handleAddEditLocation = async () => {
    setIsLoading(true);
    setMessage(null);

    const dataToProcess = editingLocationData || newLocationData;

    // Basic validation
    if (!dataToProcess.name.trim() || !dataToProcess.mapLink.trim()) {
      setMessage('Error: Location Name and Map Link are required.');
      setIsLoading(false);
      return;
    }

    const formData = new FormData();

    // Append text fields
    formData.append('name', dataToProcess.name);
    formData.append('mapLink', dataToProcess.mapLink);
    if (dataToProcess.address) formData.append('address', dataToProcess.address);
    if (dataToProcess.description) formData.append('description', dataToProcess.description);
    if (dataToProcess.q) formData.append('q', dataToProcess.q);
    if (dataToProcess.embedMapLink) formData.append('embedMapLink', dataToProcess.embedMapLink);

    // Append _id if editing
    if (editingLocationData && editingLocationData._id) {
      formData.append('_id', editingLocationData._id);
    }

    // Append image file if selected
    if (currentLocationImageFile) {
      formData.append('imageFile', currentLocationImageFile);
    } else if (editingLocationData && editingLocationData.imageUrl) {
      // If editing and no new file is selected, but an existing image URL exists,
      // send the existing URL back to preserve it.
      formData.append('imageUrl', editingLocationData.imageUrl);
    } else if (!currentLocationImageFile && !editingLocationData?.imageUrl && editingLocationData) {
      // If editing and image was removed (or never existed and none selected), send an empty string
      formData.append('imageUrl', '');
    }

    const url = `/api/locations?pw=${providedPassword}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        // No 'Content-Type' header needed for FormData; browser sets it automatically
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || `API Error: ${response.status}`);
      }

      setMessage(result.message || (editingLocationData ? 'Location updated successfully!' : 'Location added successfully!'));
      handleCloseLocationModal();
      refreshAllData();
    } catch (error) {
      console.error('Failed to add/edit location:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setMessage(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLocation = async (locationId: string, locationName: string) => {
    if (!confirm(`Are you sure you want to delete "${locationName}" and all its associated workouts? This action cannot be undone.`)) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/locations?pw=${providedPassword}&id=${locationId}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || `API Error: ${response.status}`);
      }
      setMessage(result.message || 'Location and its workouts deleted successfully!');
      refreshAllData();
    } catch (error) {
      console.error('Failed to delete location:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setMessage(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Workout Management Handlers (within a location card) ---
  const handleOpenAddWorkoutModal = (locationId: string) => {
    setCurrentWorkoutLocationId(locationId);
    setEditingWorkoutData(null);
    setNewWorkoutData({ startTime: '', endTime: '', days: [], types: [] }); // Reset to new workout defaults
    setShowWorkoutModal(true);
  };

  const handleOpenEditWorkoutModal = (workout: WorkoutClean) => {
    setCurrentWorkoutLocationId(workout.locationId);
    setEditingWorkoutData({
      _id: workout._id,
      locationId: workout.locationId,
      startTime: workout.startTime ?? '',
      endTime: workout.endTime ?? '',
      days: workout.days ?? [],
      types: workout.types ?? [],
    });
    setShowWorkoutModal(true);
  };

  const handleCloseWorkoutModal = () => {
    setShowWorkoutModal(false);
    setCurrentWorkoutLocationId(null);
    setEditingWorkoutData(null);
    setNewWorkoutData({ startTime: '', endTime: '', days: [], types: [] }); // Reset for next add
    setMessage(null);
  };

  // Handler for checkbox lists (days, types)
  const handleWorkoutCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;

    const isEditing = editingWorkoutData !== null;

    type WorkoutArrayField = 'days' | 'types';
    const fieldName = name as WorkoutArrayField;

    if (checked) {
      if (isEditing) {
        setEditingWorkoutData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            [fieldName]: [...((prev[fieldName] as string[]) || []), value]
          };
        });
      } else {
        setNewWorkoutData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            [fieldName]: [...((prev[fieldName] as string[]) || []), value]
          };
        });
      }
    } else { // if unchecked
      if (isEditing) {
        setEditingWorkoutData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            [fieldName]: ((prev[fieldName] as string[]) || []).filter((item: string) => item !== value)
          };
        });
      } else {
        setNewWorkoutData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            [fieldName]: ((prev[fieldName] as string[]) || []).filter((item: string) => item !== value)
          };
        });
      }
    }
  };

  // Handler for time inputs (startTime, endTime)
  const handleWorkoutTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editingWorkoutData) {
      setEditingWorkoutData(prev => ({ ...prev!, [name]: value }));
    } else {
      setNewWorkoutData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddEditWorkout = async () => {
    setIsLoading(true);
    setMessage(null);

    type WorkoutPayload = Omit<WorkoutClean, '_id' | 'ao'> & { _id?: string };

    let dataToSend: WorkoutPayload;

    const workoutFormState = editingWorkoutData || newWorkoutData;

    // Basic validation
    if (!workoutFormState.startTime.trim() || !workoutFormState.endTime.trim()) {
      setMessage('Error: Start Time and End Time are required for workouts.');
      setIsLoading(false);
      return;
    }
    if (workoutFormState.days.length === 0) {
      setMessage('Error: At least one Day must be selected.');
      setIsLoading(false);
      return;
    }
    if (workoutFormState.types.length === 0) {
      setMessage('Error: At least one Workout Type must be selected.');
      setIsLoading(false);
      return;
    }

    // Determine if adding or editing
    if (editingWorkoutData) {
      dataToSend = {
        _id: editingWorkoutData._id,
        locationId: currentWorkoutLocationId!,
        startTime: workoutFormState.startTime,
        endTime: workoutFormState.endTime,
        days: workoutFormState.days,
        types: workoutFormState.types,
      };
    } else {
      if (!currentWorkoutLocationId) {
        setMessage('Error: Workout must be associated with a location.');
        setIsLoading(false);
        return;
      }
      dataToSend = {
        locationId: currentWorkoutLocationId,
        startTime: workoutFormState.startTime,
        endTime: workoutFormState.endTime,
        days: workoutFormState.days,
        types: workoutFormState.types,
      };
    }

    const url = `/api/workouts?pw=${providedPassword}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || `API Error: ${response.status}`);
      }

      setMessage(result.message || (editingWorkoutData ? 'Workout updated successfully!' : 'Workout added successfully!'));
      handleCloseWorkoutModal();
      refreshAllData();
    } catch (error) {
      console.error('Failed to add/edit workout:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setMessage(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    if (!confirm('Are you sure you want to delete this workout?')) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/workouts?pw=${providedPassword}&id=${workoutId}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || `API Error: ${response.status}`);
      }
      setMessage(result.message || 'Workout deleted successfully!');
      refreshAllData();
    } catch (error) {
      console.error('Failed to delete workout:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setMessage(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Access Denied / Main Render ---
  if (providedPassword !== CLIENT_ADMIN_PASSWORD) {
    return (
      <>
        <Header href="/admin" />
        <main className="container mx-auto px-4 py-8 text-center bg-gray-50 min-h-screen">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-700 text-lg">
            You have not provided the correct password to access this page.
            {message && <span className="block text-sm text-red-500 mt-2">{message}</span>}
          </p>
          <Link href="/" className="mt-8 inline-block bg-blue-600 text-white px-8 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200">
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
      <main className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
        <h1 className="text-4xl font-extrabold text-center mb-10 text-gray-800">
          Admin Dashboard
        </h1>

        {isLoading && (
          <div className="text-center text-blue-500 py-4">
            <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2">Loading/Saving data...</p>
          </div>
        )}
        {message && (
          <p className={`text-center p-3 mb-6 rounded-md font-medium ${message.startsWith('Error:') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </p>
        )}

        {/* Add New Location Button */}
        <div className="mb-10 text-center">
          <button
            onClick={handleOpenAddLocationModal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-xl flex items-center justify-center mx-auto transition duration-300 ease-in-out text-lg"
          >
            <PlusCircleIcon className="h-7 w-7 mr-2" /> Add New Location
          </button>
        </div>

        {/* Locations Grid */}
        <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 pb-3 border-gray-200">Manage Locations & Workouts</h2>
        {locations.length === 0 && !isLoading ? (
          <p className="text-center text-gray-600 text-lg p-6 bg-white rounded-lg shadow-md">No locations found. Click <span className="font-semibold">{`"Add New Location"`}</span> to get started!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {locations.map(location => (
              <div key={location._id} className="bg-white rounded-lg shadow-xl p-6 border border-gray-100 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-extrabold text-gray-900 leading-tight pr-4">{location.name}</h3>
                  <div className="flex space-x-2 flex-shrink-0">
                    <button
                      onClick={() => handleOpenEditLocationModal(location)}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition duration-200"
                      title="Edit Location"
                    >
                      <PencilIcon className="h-6 w-6" />
                    </button>
                    <button
                      onClick={() => handleDeleteLocation(location._id, location.name)}
                      className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition duration-200"
                      title="Delete Location"
                    >
                      <TrashIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {location.q && (
                  <p className="text-gray-700 text-base mb-2">
                    <span className="font-semibold">Permanent Q:</span> {location.q}
                  </p>
                )}
                {location.address && (
                  <p className="text-gray-700 text-base mb-2">
                    <span className="font-semibold">Address:</span> {location.address}
                  </p>
                )}
                <p className="text-gray-700 text-sm mb-2">
                  <span className="font-semibold">Map Link:</span>{' '}
                  <a href={location.mapLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">
                    {location.mapLink}
                  </a>
                </p>
                {/* Display embed map link */}
                {location.embedMapLink && (
                  <p className="text-gray-700 text-sm mb-2">
                    <span className="font-semibold">Embed Map Link:</span>{' '}
                    <a href={location.embedMapLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">
                      {location.embedMapLink}
                    </a>
                  </p>
                )}
                {/* Display image URL and the image itself */}
                {location.imageUrl && (
                  <div className="text-gray-700 text-sm mb-4">
                    <p className="font-semibold">Logo URL:</p>{' '}
                    <a href={location.imageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">
                      {location.imageUrl}
                    </a>
                    <img src={location.imageUrl} alt={`Logo for ${location.name}`} className="mt-2 w-20 h-20 object-cover rounded-full border border-gray-200" />
                  </div>
                )}

                {location.description && <p className="text-gray-600 text-sm mb-4 leading-relaxed">{location.description}</p>}

                <div className="mt-auto pt-6 border-t border-gray-200 flex-grow">
                  <h4 className="text-xl font-bold mb-4 text-gray-800">Scheduled Workouts:</h4>
                  {workoutsGroupedByLocation[location._id] && workoutsGroupedByLocation[location._id].length > 0 ? (
                    <div className="space-y-4">
                      {workoutsGroupedByLocation[location._id].map(workout => (
                        <div key={workout._id} className="bg-gray-50 p-4 rounded-md shadow-sm border border-gray-100 text-sm flex justify-between items-center transition-colors duration-200 hover:bg-gray-100">
                          <div className="flex-grow">
                            <p className="font-bold text-gray-900 text-base">
                              {workout.days.join(', ')} from {workout.startTime} to {workout.endTime}
                            </p>
                            <p className="text-gray-700">Types: <span className="font-medium">{workout.types.join(', ') || 'N/A'}</span></p>
                          </div>
                          <div className="flex space-x-2 flex-shrink-0 ml-4">
                            <button
                              onClick={() => handleOpenEditWorkoutModal(workout)}
                              className="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-50 transition duration-200"
                              title="Edit Workout"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteWorkout(workout._id)}
                              className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition duration-200"
                              title="Delete Workout"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic p-4 bg-gray-50 rounded-md">No workouts for this location yet. Click{` "Add Workout"`} below.</p>
                  )}
                  <button
                    onClick={() => handleOpenAddWorkoutModal(location._id)}
                    className="mt-6 bg-purple-600 hover:bg-purple-700 text-white text-base py-3 px-6 rounded-lg flex items-center justify-center transition duration-300 ease-in-out w-full"
                  >
                    <PlusCircleIcon className="h-6 w-6 mr-2" /> Add Workout
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* --- Modals --- */}
      {/* Location Add/Edit Modal (updated with new fields) */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md transform scale-95 animate-scale-in">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
              {editingLocationData ? 'Edit Location' : 'Add New Location'}
            </h2>
            <form onSubmit={(e) => { e.preventDefault(); handleAddEditLocation(); }}>
              <div className="mb-4">
                <label htmlFor="location-name" className="block text-gray-700 text-sm font-bold mb-2">
                  Location Name (AO)<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="location-name"
                  name="name"
                  value={editingLocationData?.name ?? newLocationData.name}
                  onChange={handleLocationInputChange}
                  className="shadow-sm appearance-none border border-gray-300 rounded-md w-full py-2.5 px-4 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="e.g., The Pit"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="location-mapLink" className="block text-gray-700 text-sm font-bold mb-2">
                  Map Link<span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  id="location-mapLink"
                  name="mapLink"
                  value={editingLocationData?.mapLink ?? newLocationData.mapLink}
                  onChange={handleLocationInputChange}
                  className="shadow-sm appearance-none border border-gray-300 rounded-md w-full py-2.5 px-4 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="e.g., https://goo.gl/maps/..."
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="location-embedMapLink" className="block text-gray-700 text-sm font-bold mb-2">
                  Embed Map Link (iframe src)
                </label>
                <input
                  type="url"
                  id="location-embedMapLink"
                  name="embedMapLink"
                  value={editingLocationData?.embedMapLink ?? newLocationData.embedMapLink}
                  onChange={handleLocationInputChange}
                  className="shadow-sm appearance-none border border-gray-300 rounded-md w-full py-2.5 px-4 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="e.g., https://www.google.com/maps/embed?pb=..."
                />
              </div>
              {/* NEW: File input for image upload */}
              <div className="mb-4">
                <label htmlFor="location-imageFile" className="block text-gray-700 text-sm font-bold mb-2">
                  Upload Location Logo Image
                </label>
                <input
                  type="file"
                  id="location-imageFile"
                  name="imageFile"
                  accept="image/*" // Restrict to image files
                  onChange={handleImageFileChange}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {(currentLocationImageUrl) && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
                    <img src={currentLocationImageUrl} alt="Logo Preview" className="max-h-32 max-w-32 object-contain rounded-full mx-auto border border-gray-200 shadow-md" />
                    {currentLocationImageFile && (
                      <p className="text-xs text-gray-500 mt-1">New file selected: {currentLocationImageFile.name}</p>
                    )}
                    {!currentLocationImageFile && editingLocationData?.imageUrl && (
                      <p className="text-xs text-gray-500 mt-1">Current saved image</p>
                    )}
                  </div>
                )}
                {/* Option to clear existing image if editing and no new file is selected */}
                {editingLocationData && editingLocationData.imageUrl && !currentLocationImageFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingLocationData(prev => ({ ...prev!, imageUrl: '' }));
                      if (currentLocationImageUrl) URL.revokeObjectURL(currentLocationImageUrl);
                      setCurrentLocationImageUrl(null);
                      setCurrentLocationImageFile(null);
                      setMessage('Existing image will be removed on save.');
                    }}
                    className="mt-2 text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove Existing Image
                  </button>
                )}
              </div>
              <div className="mb-4">
                <label htmlFor="location-address" className="block text-gray-700 text-sm font-bold mb-2">
                  Address
                </label>
                <input
                  type="text"
                  id="location-address"
                  name="address"
                  value={editingLocationData?.address ?? newLocationData.address}
                  onChange={handleLocationInputChange}
                  className="shadow-sm appearance-none border border-gray-300 rounded-md w-full py-2.5 px-4 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="e.g., 123 Main St, City, State ZIP"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="location-description" className="block text-gray-700 text-sm font-bold mb-2">
                  Description
                </label>
                <textarea
                  id="location-description"
                  name="description"
                  rows={3}
                  value={editingLocationData?.description ?? newLocationData.description}
                  onChange={handleLocationInputChange}
                  className="shadow-sm appearance-none border border-gray-300 rounded-md w-full py-2.5 px-4 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="A brief description of the AO, its history, or special notes..."
                ></textarea>
              </div>
              <div className="mb-6">
                <label htmlFor="location-q" className="block text-gray-700 text-sm font-bold mb-2">
                  Permanent Q (Optional)
                </label>
                <input
                  type="text"
                  id="location-q"
                  name="q"
                  value={editingLocationData?.q ?? newLocationData.q}
                  onChange={handleLocationInputChange}
                  className="shadow-sm appearance-none border border-gray-300 rounded-md w-full py-2.5 px-4 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="F3 Name of the permanent Q"
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handleCloseLocationModal}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2.5 px-6 rounded-lg transition duration-200 flex-grow"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg transition duration-200 flex-grow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Saving...' : (editingLocationData ? 'Update Location' : 'Add Location')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Workout Add/Edit Modal */}
      {showWorkoutModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md transform scale-95 animate-scale-in">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
              {editingWorkoutData ? 'Edit Workout' : 'Add New Workout'}
            </h2>
            <form onSubmit={(e) => { e.preventDefault(); handleAddEditWorkout(); }}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="workout-startTime" className="block text-gray-700 text-sm font-bold mb-2">
                    Start Time<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    id="workout-startTime"
                    name="startTime"
                    value={editingWorkoutData?.startTime ?? newWorkoutData.startTime}
                    onChange={handleWorkoutTimeInputChange}
                    className="shadow-sm appearance-none border border-gray-300 rounded-md w-full py-2.5 px-4 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="workout-endTime" className="block text-gray-700 text-sm font-bold mb-2">
                    End Time<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    id="workout-endTime"
                    name="endTime"
                    value={editingWorkoutData?.endTime ?? newWorkoutData.endTime}
                    onChange={handleWorkoutTimeInputChange}
                    className="shadow-sm appearance-none border border-gray-300 rounded-md w-full py-2.5 px-4 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Days<span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DAYS_OF_WEEK.map(day => (
                    <div key={day} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`day-${day}`}
                        name="days"
                        value={day}
                        checked={(editingWorkoutData?.days ?? newWorkoutData.days).includes(day)}
                        onChange={handleWorkoutCheckboxChange}
                        className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <label htmlFor={`day-${day}`} className="ml-2 text-gray-700 text-sm">
                        {day}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Workout Types<span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {WORKOUT_TYPES.map(type => (
                    <div key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`type-${type}`}
                        name="types"
                        value={type}
                        checked={(editingWorkoutData?.types ?? newWorkoutData.types).includes(type)}
                        onChange={handleWorkoutCheckboxChange}
                        className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <label htmlFor={`type-${type}`} className="ml-2 text-gray-700 text-sm">
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handleCloseWorkoutModal}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2.5 px-6 rounded-lg transition duration-200 flex-grow"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-6 rounded-lg transition duration-200 flex-grow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Saving...' : (editingWorkoutData ? 'Update Workout' : 'Add Workout')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
