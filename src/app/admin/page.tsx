
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { LocationClean, WorkoutClean } from '../../../types/workout'; // Assuming 
import Header from '../_components/Header';


type RegionFormState = { // Re-defining here for self-containment of the example
  region_name: string;
  meta_description: string;
  hero_title: string;
  hero_subtitle: string;
  region_logo_url?: string;
  region_hero_img_url?: string;
  region_city: string;
  region_state: string;
  region_facebook: string;
  region_map_lat: string;
  region_map_lon: string;
  region_map_zoom: number;
  region_map_embed_link: string;
  region_google_form_url: string,
  region_fng_form_url: string,
};

type LocaleData = {
  _id?: string;
  region_name?: string;
  meta_description?: string;
  hero_title?: string;
  hero_subtitle?: string;
  region_logo_url?: string;
  region_hero_img_url?: string;
  region_city?: string;
  region_state?: string;
  region_facebook?: string;
  region_map_lat?: string;
  region_map_lon?: string;
  region_map_zoom?: number;
  region_map_embed_link?: string;
  region_google_form_url?: string,
  region_fng_form_url?: string,
};


const initialRegionFormState: RegionFormState = {
  region_name: '',
  meta_description: '',
  hero_title: '',
  hero_subtitle: '',
  region_logo_url: '',
  region_hero_img_url: '',
  region_city: '',
  region_state: '',
  region_facebook: '',
  region_map_lat: '',
  region_map_lon: '',
  region_map_zoom: 12, // Default zoom level
  region_map_embed_link: '',
  region_google_form_url: '',
  region_fng_form_url: '',
};

const initialNewLocationFormState: Partial<LocationClean> = {
  name: '',
  mapLink: '',
  address: '',
  description: '',
  q: '',
  embedMapLink: '',
  imageUrl: '',
  paxImageUrl: '',
};

const initialNewWorkoutFormState: Partial<WorkoutClean> = {
  locationId: '',
  startTime: '',
  endTime: '',
  days: [],
  types: [],
  frequencyPrefix: '', // NEW
  comments: '' // NEW
};


// Toast Component for better feedback
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const bgColor = type === 'success'
    ? 'bg-green-100 border-green-400 text-green-700 dark:bg-green-800 dark:border-green-600 dark:text-green-100'
    : type === 'error'
      ? 'bg-red-100 border-red-400 text-red-700 dark:bg-red-800 dark:border-red-600 dark:text-red-100'
      : 'bg-blue-100 border-blue-400 text-blue-700 dark:bg-blue-800 dark:border-blue-600 dark:text-blue-100';

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-dismiss after 5 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg border-l-4 ${bgColor} flex items-center justify-between z-50`}>
      <p className="text-sm font-medium">{message}</p>
      <button onClick={onClose} className="ml-4 text-lg font-bold">
        ×
      </button>
    </div>
  );
};


export default function AdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const password = searchParams.get('pw');

  // General loading/error/success for Location/Workout actions (re-used for simplicity)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // State for Locations
  const [locations, setLocations] = useState<LocationClean[]>([]);
  const [newLocationForm, setNewLocationForm] = useState<Partial<LocationClean>>(initialNewLocationFormState);
  const [editLocationId, setEditLocationId] = useState<string | null>(null);
  const [showLocationAddEditForm, setShowLocationAddEditForm] = useState(false);

  // State for Workouts (NEW)
  const [workouts, setWorkouts] = useState<WorkoutClean[]>([]);
  const [newWorkoutForm, setNewWorkoutForm] = useState<Partial<WorkoutClean>>(initialNewWorkoutFormState);
  const [editWorkoutId, setEditWorkoutId] = useState<string | null>(null);
  const [showWorkoutAddEditForm, setShowWorkoutAddEditForm] = useState(false);

  // State for Region Config
  const [regionForm, setRegionForm] = useState<RegionFormState>(initialRegionFormState);
  const [regionLoading, setRegionLoading] = useState(false);
  const [regionError, setRegionError] = useState<string | null>(null);
  const [regionSuccess, setRegionSuccess] = useState<string | null>(null);
  const [showRegionConfigForm, setShowRegionConfigForm] = useState(false);
  const [regionConfigExists, setRegionConfigExists] = useState(false);

  // State for tab navigation
  const [activeTab, setActiveTab] = useState<'region' | 'locations' | 'workouts'>('region');

  // State for Dark Mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  // Effect to apply dark mode class and save preference
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };


  // --- Fetch Region Data ---
  const fetchRegionData = useCallback(async () => {
    setRegionLoading(true);
    setRegionError(null);
    setRegionSuccess(null);
    try {
      const response = await fetch('/api/region');
      if (!response.ok) {
        if (response.status === 404) {
          console.warn('Region configuration not found, initializing empty form.');
          setRegionForm(initialRegionFormState);
          setRegionSuccess('Region configuration is not set up. Please create it below.');
          setRegionConfigExists(false);
          setShowRegionConfigForm(true);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: LocaleData = await response.json();
      setRegionForm({
        region_name: data.region_name || '',
        meta_description: data.meta_description || '',
        hero_title: data.hero_title || '',
        hero_subtitle: data.hero_subtitle || '',
        region_logo_url: data.region_logo_url || '',
        region_hero_img_url: data.region_hero_img_url || '',
        region_city: data.region_city || '',
        region_state: data.region_state || '',
        region_facebook: data.region_facebook || '',
        region_map_lat: data.region_map_lat || '',
        region_map_lon: data.region_map_lon || '',
        region_map_zoom: data.region_map_zoom || 12,
        region_map_embed_link: data.region_map_embed_link || '',
        region_google_form_url: data.region_google_form_url || '',
        region_fng_form_url: data.region_fng_form_url || '',
      });
      setRegionConfigExists(true);
      setShowRegionConfigForm(false);
    } catch (e: any) {
      setRegionError(`Failed to fetch region data: ${e.message}`);
      console.error("Failed to fetch region data:", e);
      setRegionConfigExists(false);
    } finally {
      setRegionLoading(false);
    }
  }, []);

  // --- Fetch Locations Data ---
  const fetchLocations = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(`/api/locations?pw=${password}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: LocationClean[] = await response.json();
      setLocations(data);
    } catch (e: any) {
      setError(`Failed to fetch locations: ${e.message}`);
      console.error("Failed to fetch locations:", e);
    } finally {
      setLoading(false);
    }
  }, [password]);

  // --- Fetch Workouts Data (NEW) ---
  const fetchWorkouts = useCallback(async () => {
    setLoading(true); // Re-use general loading state
    setError(null); // Re-use general error state
    setSuccess(null); // Re-use general success state
    try {
      const response = await fetch(`/api/workouts?pw=${password}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: WorkoutClean[] = await response.json();
      setWorkouts(data);
    } catch (e: any) {
      setError(`Failed to fetch workouts: ${e.message}`);
      console.error("Failed to fetch workouts:", e);
    } finally {
      setLoading(false);
    }
  }, [password]);

  // Initial data fetch on component mount
  useEffect(() => {
    if (!password) {
      setError('Admin password is required to access this page. Please append ?pw=YOUR_PASSWORD to the URL.');
      return;
    }
    fetchRegionData();
    fetchLocations();
    fetchWorkouts(); // Fetch workouts on initial load
  }, [password, fetchRegionData, fetchLocations, fetchWorkouts]);


  // --- Handlers for Region Form ---
  const handleRegionFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRegionForm((prev: any) => ({
      ...prev,
      [name]: (name.startsWith('region_map_lat') || name.startsWith('region_map_lon') || name.startsWith('region_map_zoom')) ? parseFloat(value) || 0 : value,
    }));
  };

  const handleRegionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setRegionError('Admin password is required to update region info.');
      return;
    }
    setRegionLoading(true);
    setRegionError(null);
    setRegionSuccess(null);

    try {
      const response = await fetch(`/api/region?pw=${password}`, {
        method: 'PUT', // Assuming your API route has a PUT handler
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(regionForm),
      });

      // --- FIX: Read response text once, then try parsing as JSON ---
      const responseText = await response.text(); // Read the body stream ONCE as text 
      let data;
      try {
        data = JSON.parse(responseText); // Attempt to parse the text as JSON
      } catch (jsonError) {
        // If parsing fails, it means the response was not valid JSON (e.g., HTML error page)
        console.error("Non-JSON response received:", responseText);
        throw new Error(`Server returned non-JSON response. Status: ${response.status}. Response: ${responseText.substring(0, 200)}...`);
      }

      if (!response.ok) {
        // If data parsing was successful but response.ok is false,
        // use the message from the parsed JSON data.
        throw new Error(data.message || 'Failed to update region configuration (unknown server error).');
      }

      setRegionSuccess(data.message || 'Region configuration updated successfully!');
      setRegionConfigExists(true);
      setShowRegionConfigForm(false);
    } catch (e: any) {
      setRegionError(`Error updating region: ${e.message}`);
      console.error("Error updating region:", e);
    } finally {
      setRegionLoading(false);
    }
  };

  const handleCancelRegionEdit = () => {
    setShowRegionConfigForm(false);
    setRegionError(null);
    setRegionSuccess(null);
    if (regionConfigExists) {
      fetchRegionData(); // Re-fetch to revert unsaved changes if config exists
    } else {
      setRegionForm(initialRegionFormState); // Reset to initial empty state if no config existed
      setRegionSuccess('Region configuration is not set up. Please create it below.');
    }
  };


  // --- Location related Handlers ---
  const handleNewLocationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewLocationForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditLocation = (location: LocationClean) => {
    setEditLocationId(location._id);
    setNewLocationForm(location);
    setSuccess(null);
    setError(null);
    setShowLocationAddEditForm(true);
    setActiveTab('locations');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddLocationClick = () => {
    setEditLocationId(null); // Ensure no ID is set for new
    setNewLocationForm(initialNewLocationFormState); // Clear form
    setError(null);
    setSuccess(null);
    setShowLocationAddEditForm(true); // Explicitly show the form for adding
    setActiveTab('locations');
  };

  const handleCancelLocationEdit = () => {
    setEditLocationId(null);
    setNewLocationForm(initialNewLocationFormState);
    setError(null);
    setSuccess(null);
    setShowLocationAddEditForm(false);
  };

  const handleSubmitLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Password is required to submit changes.');
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const method = editLocationId ? 'PUT' : 'POST';
      // Note: Your current API for locations uses POST for both, with _id determining update.
      // This is generally okay, but PUT is semantically more correct for updates.
      // If your backend logic for PUT expects the ID in the URL, you'll need to adjust.
      // For now, sticking to your provided POST logic.
      const url = `/api/locations?pw=${password}${editLocationId ? `&id=${editLocationId}` : ''}`; // Added ID for clarity if backend was PUT, but POST body takes it.

      const body = newLocationForm;

      const response = await fetch(url, {
        method: method, // Could be POST for both add/update based on your current route.ts, or PUT for updates.
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Non-JSON response received while submitting location:", text);
        throw new Error(`Server returned non-JSON response with status ${response.status}`);
      }

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${editLocationId ? 'update' : 'add'} location.`);
      }

      setSuccess(data.message || `Location ${editLocationId ? 'updated' : 'added'} successfully!`);
      fetchLocations();
      handleCancelLocationEdit();
    } catch (e: any) {
      setError(`Error: ${e.message}`);
      console.error("Error submitting location:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (!password) {
      setError('Password is required to delete locations.');
      return;
    }
    if (!confirm('Are you sure you want to delete this location and all its associated workouts? This action cannot be undone.')) {
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch(`/api/locations?pw=${password}&id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete location.');
      }

      setSuccess(data.message || 'Location deleted successfully!');
      fetchLocations(); // Refresh locations
      fetchWorkouts(); // Also refresh workouts, as locations might be linked
    } catch (e: any) {
      setError(`Error: ${e.message}`);
      console.error("Error deleting location:", e);
    } finally {
      setLoading(false);
    }
  };

  // --- Workout related Handlers (NEW) ---
  const handleNewWorkoutChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement; // Cast to HTMLInputElement for 'checked'

    if (name === 'days' || name === 'types') {
      setNewWorkoutForm(prev => {
        const currentArray = (prev[name as keyof Partial<WorkoutClean>] as string[] || []);
        if (checked) {
          // Add the value if checked and not already in the array
          return {
            ...prev,
            [name]: [...currentArray, value],
          };
        } else {
          // Remove the value if unchecked
          return {
            ...prev,
            [name]: currentArray.filter(item => item !== value),
          };
        }
      });
    } else {
      setNewWorkoutForm(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleEditWorkout = (workout: WorkoutClean) => {
    setEditWorkoutId(workout._id || null);
    setNewWorkoutForm(workout);
    setSuccess(null);
    setError(null);
    setShowWorkoutAddEditForm(true);
    setActiveTab('workouts');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddWorkoutClick = () => {
    setEditWorkoutId(null);
    setNewWorkoutForm(initialNewWorkoutFormState); // Clear form
    setError(null);
    setSuccess(null);
    setShowWorkoutAddEditForm(true);
    setActiveTab('workouts');
  };

  const handleCancelWorkoutEdit = () => {
    setEditWorkoutId(null);
    setNewWorkoutForm(initialNewWorkoutFormState);
    setError(null);
    setSuccess(null);
    setShowWorkoutAddEditForm(false);
  };

  const handleSubmitWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Password is required to submit changes.');
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const url = `/api/workouts?pw=${password}`;
      // Your workout POST API handles both add and update based on `_id` in body
      const method = 'POST'; // Always POST to /api/workouts

      // Ensure locationId is set and valid
      if (!newWorkoutForm.locationId) {
        throw new Error('Please select a location for the workout.');
      }
      // Ensure days and types are arrays
      if (!Array.isArray(newWorkoutForm.days) || newWorkoutForm.days.length === 0) {
        throw new Error('Please select at least one day for the workout.');
      }
      if (!Array.isArray(newWorkoutForm.types) || newWorkoutForm.types.length === 0) {
        throw new Error('Please select at least one workout type.');
      }


      const body = {
        ...newWorkoutForm,
        _id: editWorkoutId || undefined, // Include _id if editing
      };

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${editWorkoutId ? 'update' : 'add'} workout.`);
      }

      setSuccess(data.message || `Workout ${editWorkoutId ? 'updated' : 'added'} successfully!`);
      fetchWorkouts();
      handleCancelWorkoutEdit();
    } catch (e: any) {
      setError(`Error: ${e.message}`);
      console.error("Error submitting workout:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkout = async (id: string) => {
    if (!password) {
      setError('Password is required to delete workouts.');
      return;
    }
    if (!confirm('Are you sure you want to delete this workout?')) {
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch(`/api/workouts?pw=${password}&id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete workout.');
      }

      setSuccess(data.message || 'Workout deleted successfully!');
      fetchWorkouts(); // Refresh workouts
    } catch (e: any) {
      setError(`Error: ${e.message}`);
      console.error("Error deleting workout:", e);
    } finally {
      setLoading(false);
    }
  };


  // Base styling for common components to adapt to dark mode
  const baseClasses = "bg-white text-gray-900 dark:bg-gray-800 dark:text-white";
  // Adjusted sectionClasses to reduce padding on small screens for better use of space
  const sectionClasses = "mb-8 p-4 sm:p-6 bg-white rounded-lg shadow-xl dark:bg-gray-900 dark:shadow-2xl";
  const inputClasses = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400";
  const selectClasses = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white";
  const buttonPrimaryClasses = "w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 dark:bg-indigo-700 dark:hover:bg-indigo-800 dark:focus:ring-indigo-400";
  const buttonSecondaryClasses = "py-2 px-5 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:ring-indigo-400";


  if (!password) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${baseClasses}`}>
        <div className="container mx-auto p-8 bg-white rounded-lg shadow-xl max-w-md text-center dark:bg-gray-900 dark:text-white">
          <h1 className="text-3xl font-extrabold mb-6 text-gray-800 dark:text-gray-100">Admin Access Required</h1>
          <p className="text-red-600 mb-4 font-semibold">
            Please provide the admin password in the URL.
          </p>
          <p className="text-gray-700 mb-6 dark:text-gray-300">
            Example: <code className="bg-gray-200 p-1 rounded dark:bg-gray-700 dark:text-gray-200">/admin?pw=yourpassword</code>
          </p>
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 dark:bg-yellow-800 dark:border-yellow-600 dark:text-yellow-100" role="alert">
            <p className="font-bold">Security Warning:</p>
            <p className="text-sm">
              This method of password protection is **highly insecure** for production environments.
              For a real application, consider implementing a robust authentication system (e.g., NextAuth.js, Auth0, Clerk).
            </p>
          </div>
        </div>
      </div>
    );
  }

  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const allWorkoutTypes = ['Bootcamp', 'Ruck', 'Run', 'CrossFit', 'Strength', 'Yoga', 'Cycling', 'Hybrid', 'Sandbags', 'Discussion']; // Example types
  const frequencyPrefixOptions = [
    'Every', '1st', '2nd', '3rd', '4th', '5th',
    '1st and 3rd', '2nd and 4th', '1st, 3rd, and 5th', 'Monthly'
  ];


  // Helper to map locationId to AO name
  const getLocationName = (locationId: string | undefined) => {
    const location = locations.find(loc => loc._id === locationId);
    return location ? location.name : 'Unknown Location';
  };

  const href = "/admin"
  return (
    <>
      <Header href={href} />{/* Adjusted page padding */}
      <div className={`min-h-screen ${baseClasses} mx-auto p-4 sm:p-6 lg:p-8`}>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white text-2xl sm:text-3xl lg:text-4xl">Admin Dashboard</h1> {/* Responsive heading */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-200"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h1M4 12H3m15.364 6.364l-.707.707M6.343 6.343l-.707-.707m12.728 0l-.707-.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>


        {/* Global Toast Notifications */}
        {error && <Toast message={error} type="error" onClose={() => setError(null)} />}
        {success && <Toast message={success} type="success" onClose={() => setSuccess(null)} />}
        {regionError && <Toast message={regionError} type="error" onClose={() => setRegionError(null)} />}
        {regionSuccess && <Toast message={regionSuccess} type="success" onClose={() => setRegionSuccess(null)} />}


        {/* --- Tab Navigation --- */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto"> {/* Added overflow-x-auto here for very small screens */}
          <nav className="-mb-px flex space-x-4 sm:space-x-8" aria-label="Tabs"> {/* Adjusted space-x for tabs */}
            <button
              onClick={() => setActiveTab('region')}
              className={`${activeTab === 'region'
                ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-300'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base sm:text-lg focus:outline-none transition-colors duration-200`}
            >
              Region Config
            </button>
            <button
              onClick={() => setActiveTab('locations')}
              className={`${activeTab === 'locations'
                ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-300'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base sm:text-lg focus:outline-none transition-colors duration-200`}
            >
              Locations
            </button>
            <button
              onClick={() => setActiveTab('workouts')}
              className={`${activeTab === 'workouts'
                ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-300'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base sm:text-lg focus:outline-none transition-colors duration-200`}
            >
              Workouts
            </button>
          </nav>
        </div>

        {/* --- Tab Content: Region --- */}
        {activeTab === 'region' && (
          <section className={sectionClasses}>
            <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-2xl sm:text-3xl">Region Configuration</h2> {/* Responsive heading */}

            {regionLoading && <p className="text-center py-4 text-gray-600 dark:text-gray-400">Loading region data...</p>}

            {!regionLoading && !showRegionConfigForm && (
              <div className="text-center">
                <p className="text-gray-700 mb-4 dark:text-gray-300">
                  {regionConfigExists
                    ? "Manage the overall settings and information for your F3 region."
                    : "It looks like your region configuration hasn't been set up yet. Click below to create it!"
                  }
                </p>
                <button
                  onClick={() => setShowRegionConfigForm(true)}
                  className={buttonPrimaryClasses}
                >
                  {regionConfigExists ? 'Edit Region Configuration' : 'Create Region Configuration'}
                </button>
              </div>
            )}

            {!regionLoading && showRegionConfigForm && (
              <form onSubmit={handleRegionSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="region_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Region Name</label>
                  <input
                    type="text"
                    id="region_name"
                    name="region_name"
                    value={regionForm.region_name || ''}
                    onChange={handleRegionFormChange}
                    className={inputClasses}
                    placeholder="e.g., F3 Houston"
                  />
                </div>
                <div>
                  <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Meta Description</label>
                  <input
                    type="text"
                    id="meta_description"
                    name="meta_description"
                    value={regionForm.meta_description || ''}
                    onChange={handleRegionFormChange}
                    className={inputClasses}
                    placeholder="Short description for SEO"
                  />
                </div>
                <div>
                  <label htmlFor="hero_title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hero Title</label>
                  <input
                    type="text"
                    id="hero_title"
                    name="hero_title"
                    value={regionForm.hero_title || ''}
                    onChange={handleRegionFormChange}
                    className={inputClasses}
                    placeholder="Catchy headline for homepage"
                  />
                </div>
                <div>
                  <label htmlFor="hero_subtitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hero Subtitle</label>
                  <input
                    type="text"
                    id="hero_subtitle"
                    name="hero_subtitle"
                    value={regionForm.hero_subtitle || ''}
                    onChange={handleRegionFormChange}
                    className={inputClasses}
                    placeholder="Supporting text for headline"
                  />
                </div>

                <div>
                  <label htmlFor="region_logo_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Region Logo URL</label>
                  <input
                    type="url"
                    id="region_logo_url"
                    name="region_logo_url"
                    value={regionForm.region_logo_url || ''}
                    onChange={handleRegionFormChange}
                    className={inputClasses}
                    placeholder="https://example.com/region-logo.png"
                  />
                </div>
                <div>
                  <label htmlFor="region_hero_img_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Region Hero Image URL</label>
                  <input
                    type="url"
                    id="region_hero_img_url"
                    name="region_hero_img_url"
                    value={regionForm.region_hero_img_url || ''}
                    onChange={handleRegionFormChange}
                    className={inputClasses}
                    placeholder="https://example.com/region-hero-image.jpg"
                  />
                </div>

                <div>
                  <label htmlFor="region_city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Region City</label>
                  <input
                    type="text"
                    id="region_city"
                    name="region_city"
                    value={regionForm.region_city || ''}
                    onChange={handleRegionFormChange}
                    className={inputClasses}
                    placeholder="e.g., Houston"
                  />
                </div>
                <div>
                  <label htmlFor="region_state" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Region State</label>
                  <input
                    type="text"
                    id="region_state"
                    name="region_state"
                    value={regionForm.region_state || ''}
                    onChange={handleRegionFormChange}
                    className={inputClasses}
                    placeholder="e.g., TX"
                  />
                </div>
                <div>
                  <label htmlFor="region_facebook" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Facebook Group URL</label>
                  <input
                    type="url"
                    id="region_facebook"
                    name="region_facebook"
                    value={regionForm.region_facebook || ''}
                    onChange={handleRegionFormChange}
                    className={inputClasses}
                    placeholder="https://www.facebook.com/groups/F3Houston"
                  />
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Map Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label htmlFor="region_map_lat" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Map Latitude</label>
                      <input
                        type="text"
                        id="region_map_lat"
                        name="region_map_lat"
                        value={regionForm.region_map_lat || 0}
                        onChange={handleRegionFormChange}
                        className={inputClasses}
                        step="any"
                      />
                    </div>
                    <div>
                      <label htmlFor="region_map_lon" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Map Longitude</label>
                      <input
                        type="text"
                        id="region_map_lon"
                        name="region_map_lon"
                        value={regionForm.region_map_lon || 0}
                        onChange={handleRegionFormChange}
                        className={inputClasses}
                        step="any"
                      />
                    </div>
                    <div>
                      <label htmlFor="region_map_zoom" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Map Zoom Level</label>
                      <input
                        type="number"
                        id="region_map_zoom"
                        name="region_map_zoom"
                        value={regionForm.region_map_zoom || 12}
                        onChange={handleRegionFormChange}
                        className={inputClasses}

                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label htmlFor="region_map_embed_link" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Map Embed Link (iframe src)</label>
                    <textarea
                      id="region_map_embed_link"
                      name="region_map_embed_link"
                      value={regionForm.region_map_embed_link || ''}
                      onChange={handleRegionFormChange}
                      rows={3}
                      className={`${inputClasses} resize-y`}
                      placeholder="Paste the full iframe src URL for your region's custom map (e.g., from Google My Maps embed)"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Find this in Google My Maps: {`"Share" >`}  {`"Embed on my site" > `} Copy the {`"src"`} attribute from the iframe code.
                    </p>
                  </div>
                </div>
                <div className="md:col-span-2"> {/* This div likely spans two columns on medium screens */}
                  <label htmlFor="region_google_form_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Google FNG Form URL</label>
                  <input
                    type="url"
                    id="region_fng_form_url"
                    name="region_fng_form_url"
                    value={regionForm.region_fng_form_url || ''}
                    onChange={handleRegionFormChange}
                    className={inputClasses} // Use your defined inputClasses
                    placeholder="https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    This is the public URL of your Google Form, not the embed code.
                  </p>
                </div>
                <div className="md:col-span-2"> {/* This div likely spans two columns on medium screens */}
                  <label htmlFor="region_google_form_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Google Contact Form URL</label>
                  <input
                    type="url"
                    id="region_google_form_url"
                    name="region_google_form_url"
                    value={regionForm.region_google_form_url || ''}
                    onChange={handleRegionFormChange}
                    className={inputClasses} // Use your defined inputClasses
                    placeholder="https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    This is the public URL of your Google Form, not the embed code.
                  </p>
                </div>
                <div className="md:col-span-2 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 mt-6"> {/* Responsive buttons */}
                  <button
                    type="button"
                    onClick={handleCancelRegionEdit}
                    className={buttonSecondaryClasses}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={buttonPrimaryClasses}
                    disabled={regionLoading}
                  >
                    {regionLoading ? 'Saving...' : (regionConfigExists ? 'Update Configuration' : 'Create Configuration')}
                  </button>
                </div>
              </form>
            )}
          </section>
        )}

        {/* --- Tab Content: Locations --- */}
        {activeTab === 'locations' && (
          <section className={sectionClasses}>
            <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-2xl sm:text-3xl">Location Management (AOs)</h2>

            {!showLocationAddEditForm && (
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleAddLocationClick}
                  className={buttonPrimaryClasses + " !w-auto px-6 py-2"}
                >
                  + Add New Location
                </button>
              </div>
            )}

            {loading && <p className="text-center py-4 text-gray-600 dark:text-gray-400">Loading locations...</p>}

            {showLocationAddEditForm && (
              <form onSubmit={handleSubmitLocation} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 border border-gray-200 rounded-lg dark:border-gray-700">
                <h3 className="md:col-span-2 text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                  {editLocationId ? 'Edit Location' : 'Add New Location'}
                </h3>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location Name (AO)</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newLocationForm.name || ''}
                    onChange={handleNewLocationChange}
                    className={inputClasses}
                    placeholder="e.g., The Mothership"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={newLocationForm.address || ''}
                    onChange={handleNewLocationChange}
                    className={inputClasses}
                    placeholder="e.g., 123 Main St, Anytown, TX"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="mapLink" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Google Maps Link</label>
                  <input
                    type="url"
                    id="mapLink"
                    name="mapLink"
                    value={newLocationForm.mapLink || ''}
                    onChange={handleNewLocationChange}
                    className={inputClasses}
                    placeholder="https://maps.app.goo.gl/..."
                  />
                </div>
                <div>
                  <label htmlFor="embedMapLink" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Embed Map Link (iframe src)</label>
                  <textarea
                    id="embedMapLink"
                    name="embedMapLink"
                    value={newLocationForm.embedMapLink || ''}
                    onChange={handleNewLocationChange}
                    rows={2}
                    className={`${inputClasses} resize-y`}
                    placeholder="Paste the full iframe src URL from Google Maps embed"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {`Find this in Google Maps: Share > Embed a map > Copy the "src" attribute from the iframe code.`}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={newLocationForm.description || ''}
                    onChange={handleNewLocationChange}
                    rows={3}
                    className={`${inputClasses} resize-y`}
                    placeholder="Brief description of the AO, parking, etc."
                  />
                </div>
                <div>
                  <label htmlFor="q" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Q (Site Q for this AO)</label>
                  <input
                    type="text"
                    id="q"
                    name="q"
                    value={newLocationForm.q || ''}
                    onChange={handleNewLocationChange}
                    className={inputClasses}
                    placeholder="e.g., Dredd, Hardhat"
                  />
                </div>
                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image URL</label>
                  <input
                    type="url"
                    id="imageUrl"
                    name="imageUrl"
                    value={newLocationForm.imageUrl || ''}
                    onChange={handleNewLocationChange}
                    className={inputClasses}
                    placeholder="https://example.com/location-photo.jpg"
                  />
                </div>
                <div>
                  <label htmlFor="paxImageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pax Image URL</label>
                  <input
                    type="url"
                    id="paxImageUrl"
                    name="paxImageUrl"
                    value={newLocationForm.paxImageUrl || ''}
                    onChange={handleNewLocationChange}
                    className={inputClasses}
                    placeholder="https://example.com/pax-photo.jpg (e.g., site Q pic)"
                  />
                </div>

                <div className="md:col-span-2 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 mt-6"> {/* Responsive buttons */}
                  <button
                    type="button"
                    onClick={handleCancelLocationEdit}
                    className={buttonSecondaryClasses}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={buttonPrimaryClasses}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : (editLocationId ? 'Update Location' : 'Add Location')}
                  </button>
                </div>
              </form>
            )}

            {!showLocationAddEditForm && (
              <>
                {locations.length === 0 && !loading && (
                  <p className="text-center py-4 text-gray-600 dark:text-gray-400">No locations found. Add one above!</p>
                )}
                {locations.length > 0 && (
                  <div className="overflow-x-auto rounded-lg shadow-md"> {/* Added overflow-x-auto here */}
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Name</th>
                          <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Address</th>
                          <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 hidden sm:table-cell">Q</th> {/* Hide Q on extra small screens */}
                          <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                        {locations.map((location) => (
                          <tr key={location._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{location.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{location.address}</td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 hidden sm:table-cell">{location.q}</td> {/* Hide Q on extra small screens */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleEditLocation(location)}
                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteLocation(location._id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {/* --- Tab Content: Workouts --- */}
        {activeTab === 'workouts' && (
          <section className={sectionClasses}>
            <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-2xl sm:text-3xl">Workout Management</h2>

            {!showWorkoutAddEditForm && (
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleAddWorkoutClick}
                  className={buttonPrimaryClasses + " !w-auto px-6 py-2"}
                >
                  + Add New Workout
                </button>
              </div>
            )}

            {loading && <p className="text-center py-4 text-gray-600 dark:text-gray-400">Loading workouts...</p>}

            {showWorkoutAddEditForm && (
              <form onSubmit={handleSubmitWorkout} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 border border-gray-200 rounded-lg dark:border-gray-700">
                <h3 className="md:col-span-2 text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                  {editWorkoutId ? 'Edit Workout' : 'Add New Workout'}
                </h3>
                <div>
                  <label htmlFor="locationId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Associated Location (AO)</label>
                  <select
                    id="locationId"
                    name="locationId"
                    value={newWorkoutForm.locationId || ''}
                    onChange={handleNewWorkoutChange}
                    className={selectClasses}
                    required
                  >
                    <option value="">Select a location</option>
                    {locations.map(loc => (
                      <option key={loc._id} value={loc._id}>{loc.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Time</label>
                    <input
                      type="time"
                      id="startTime"
                      name="startTime"
                      value={newWorkoutForm.startTime || ''}
                      onChange={handleNewWorkoutChange}
                      className={inputClasses}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Time (Optional)</label>
                    <input
                      type="time"
                      id="endTime"
                      name="endTime"
                      value={newWorkoutForm.endTime || ''}
                      onChange={handleNewWorkoutChange}
                      className={inputClasses}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Days of the Week</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {allDays.map(day => (
                      <div key={day} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`day-${day}`}
                          name="days"
                          value={day}
                          checked={newWorkoutForm.days?.includes(day) || false}
                          onChange={handleNewWorkoutChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:checked:bg-indigo-500"
                        />
                        <label htmlFor={`day-${day}`} className="ml-2 text-sm text-gray-900 dark:text-gray-300">{day}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Workout Types</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {allWorkoutTypes.map(type => (
                      <div key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`type-${type}`}
                          name="types"
                          value={type}
                          checked={newWorkoutForm.types?.includes(type) || false}
                          onChange={handleNewWorkoutChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:checked:bg-indigo-500"
                        />
                        <label htmlFor={`type-${type}`} className="ml-2 text-sm text-gray-900 dark:text-gray-300">{type}</label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* NEW FIELDS */}
                <div>
                  <label htmlFor="frequencyPrefix" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Frequency Prefix</label>
                  <select
                    id="frequencyPrefix"
                    name="frequencyPrefix"
                    value={newWorkoutForm.frequencyPrefix || ''}
                    onChange={handleNewWorkoutChange}
                    className={selectClasses}
                  >
                    <option value="">None (e.g., Every)</option>
                    {frequencyPrefixOptions.map(prefix => (
                      <option key={prefix} value={prefix}>{prefix}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    e.g., {`"Every" Monday, "1st Saturday", "Monthly"`}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="comments" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Comments</label>
                  <textarea
                    id="comments"
                    name="comments"
                    value={newWorkoutForm.comments || ''}
                    onChange={handleNewWorkoutChange}
                    rows={3}
                    className={`${inputClasses} resize-y`}
                    placeholder="Any specific notes for this workout (e.g., 'Bring coupons', 'Child friendly', 'Ruck optional')"
                  />
                </div>

                <div className="md:col-span-2 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 mt-6"> {/* Responsive buttons */}
                  <button
                    type="button"
                    onClick={handleCancelWorkoutEdit}
                    className={buttonSecondaryClasses}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={buttonPrimaryClasses}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : (editWorkoutId ? 'Update Workout' : 'Add Workout')}
                  </button>
                </div>
              </form>
            )}

            {!showWorkoutAddEditForm && (
              <>
                {workouts.length === 0 && !loading && (
                  <p className="text-center py-4 text-gray-600 dark:text-gray-400">No workouts found. Add one above!</p>
                )}
                {workouts.length > 0 && (
                  <div className="overflow-x-auto rounded-lg shadow-md"> {/* Added overflow-x-auto here */}
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Location (AO)</th>
                          <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 whitespace-nowrap">Time</th>
                          <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 hidden sm:table-cell">Days</th> {/* Hide on extra small screens */}
                          <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 hidden md:table-cell">Types</th> {/* Hide on small screens */}
                          <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 hidden lg:table-cell whitespace-nowrap">Frequency Prefix</th> {/* Hide on medium/small screens */}
                          <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 hidden xl:table-cell">Comments</th> {/* Hide on large/medium/small screens */}
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                        {workouts.map((workout) => (
                          <tr key={workout._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{getLocationName(workout.locationId)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{workout.startTime}{workout.endTime ? ` - ${workout.endTime}` : ''}</td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 hidden sm:table-cell">{workout.days.join(', ')}</td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 hidden md:table-cell">{workout.types.join(', ')}</td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 hidden lg:table-cell">{workout.frequencyPrefix || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 hidden xl:table-cell">{workout.comments || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleEditWorkout(workout)}
                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteWorkout(workout._id || '')}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </section>
        )}
      </div>
    </>
  );
}
