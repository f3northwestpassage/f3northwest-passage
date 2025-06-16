'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { LocationClean } from '../../../types/workout'; // Assuming this path is correct
// IMPORTANT: You need to manually update your types/workout.ts file:
// - Remove 'pax_count: number;' from both LocaleData and RegionFormState interfaces.
// - ADD 'region_logo_url?: string;' and 'region_hero_img_url?: string;' to both LocaleData and RegionFormState interfaces.
type RegionFormState = { // Re-defining here for self-containment of the example
  region_name: string;
  meta_description: string;
  hero_title: string;
  hero_subtitle: string;
  region_logo_url?: string; // ADDED
  region_hero_img_url?: string; // ADDED
  region_city: string;
  region_state: string;
  region_facebook: string;
  region_map_lat: number;
  region_map_lon: number;
  region_map_zoom: number;
  region_map_embed_link: string;
};

type LocaleData = { // Re-defining here for self-containment of the example
  _id?: string;
  region_name?: string;
  meta_description?: string;
  hero_title?: string;
  hero_subtitle?: string;
  region_logo_url?: string; // ADDED
  region_hero_img_url?: string; // ADDED
  region_city?: string;
  region_state?: string;
  region_facebook?: string;
  region_map_lat?: number;
  region_map_lon?: number;
  region_map_zoom?: number;
  region_map_embed_link?: string;
};


// Define the initial state for the region form (pax_count removed, new URLs added)
const initialRegionFormState: RegionFormState = {
  region_name: '',
  meta_description: '',
  hero_title: '',
  hero_subtitle: '',
  region_logo_url: '', // Added
  region_hero_img_url: '', // Added
  region_city: '',
  region_state: '',
  region_facebook: '',
  region_map_lat: 0,
  region_map_lon: 0,
  region_map_zoom: 12, // Default zoom level
  region_map_embed_link: '',
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

  // General loading/error/success for Location actions
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // State for Locations
  const [locations, setLocations] = useState<LocationClean[]>([]);
  const [newLocationForm, setNewLocationForm] = useState<Partial<LocationClean>>({
    name: '',
    mapLink: '',
    address: '',
    description: '',
    q: '',
    embedMapLink: '',
    imageUrl: '',
    paxImageUrl: '',
  });
  const [editLocationId, setEditLocationId] = useState<string | null>(null);
  const [showLocationAddEditForm, setShowLocationAddEditForm] = useState(false);

  // State for Region Config
  const [regionForm, setRegionForm] = useState<RegionFormState>(initialRegionFormState);
  const [regionLoading, setRegionLoading] = useState(false);
  const [regionError, setRegionError] = useState<string | null>(null);
  const [regionSuccess, setRegionSuccess] = useState<string | null>(null);
  const [showRegionConfigForm, setShowRegionConfigForm] = useState(false);
  const [regionConfigExists, setRegionConfigExists] = useState(false);

  // State for tab navigation
  const [activeTab, setActiveTab] = useState<'region' | 'locations'>('region');

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
        region_logo_url: data.region_logo_url || '', // ADDED
        region_hero_img_url: data.region_hero_img_url || '', // ADDED
        region_city: data.region_city || '',
        region_state: data.region_state || '',
        region_facebook: data.region_facebook || '',
        region_map_lat: data.region_map_lat || 0,
        region_map_lon: data.region_map_lon || 0,
        region_map_zoom: data.region_map_zoom || 12,
        region_map_embed_link: data.region_map_embed_link || '',
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

  // Initial data fetch on component mount
  useEffect(() => {
    if (!password) {
      setError('Admin password is required to access this page. Please append ?pw=YOUR_PASSWORD to the URL.');
      return;
    }
    fetchRegionData();
    fetchLocations();
  }, [password, fetchRegionData, fetchLocations]);


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
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(regionForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update region configuration.');
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
    handleCancelEdit(); // Clears form, edit ID, and hides form
    setShowLocationAddEditForm(true); // Explicitly show the form for adding
    setActiveTab('locations');
  };


  const handleCancelEdit = () => {
    setEditLocationId(null);
    setNewLocationForm({
      name: '',
      mapLink: '',
      address: '',
      description: '',
      q: '',
      embedMapLink: '',
      imageUrl: '',
      paxImageUrl: '',
    });
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
      const url = editLocationId
        ? `/api/locations?pw=${password}&id=${editLocationId}`
        : `/api/locations?pw=${password}`;

      const body = newLocationForm;

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${editLocationId ? 'update' : 'add'} location.`);
      }

      setSuccess(data.message || `Location ${editLocationId ? 'updated' : 'added'} successfully!`);
      fetchLocations();
      handleCancelEdit();
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
      setLocations(prev => prev.filter(loc => loc._id !== id));
    } catch (e: any) {
      setError(`Error: ${e.message}`);
      console.error("Error deleting location:", e);
    } finally {
      setLoading(false);
    }
  };

  // Base styling for common components to adapt to dark mode
  const baseClasses = "bg-white text-gray-900 dark:bg-gray-800 dark:text-white";
  const sectionClasses = "mb-8 p-6 bg-white rounded-lg shadow-xl dark:bg-gray-900 dark:shadow-2xl";
  const inputClasses = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400";
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

  return (
    <div className={`min-h-screen ${baseClasses} container mx-auto p-4 sm:p-6 lg:p-8`}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Admin Dashboard</h1>
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
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('region')}
            className={`${activeTab === 'region'
              ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-300'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg focus:outline-none transition-colors duration-200`}
          >
            Region Configuration
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={`${activeTab === 'locations'
              ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-300'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg focus:outline-none transition-colors duration-200`}
          >
            Location Management
          </button>
        </nav>
      </div>

      {/* --- Tab Content --- */}
      {activeTab === 'region' && (
        <section className={sectionClasses}>
          <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">Region Configuration</h2>

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

              {/* NEW FIELDS: Region Logo URL and Hero Image URL */}
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
              {/* END NEW FIELDS */}

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
                <label htmlFor="region_state" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Region State (Abbreviation)</label>
                <input
                  type="text"
                  id="region_state"
                  name="region_state"
                  value={regionForm.region_state || ''}
                  onChange={handleRegionFormChange}
                  className={inputClasses}
                  placeholder="e.g., TX"
                  maxLength={2}
                />
              </div>
              <div>
                <label htmlFor="region_facebook" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Facebook URL</label>
                <input
                  type="url"
                  id="region_facebook"
                  name="region_facebook"
                  value={regionForm.region_facebook || ''}
                  onChange={handleRegionFormChange}
                  className={inputClasses}
                  placeholder="https://facebook.com/your-page"
                />
              </div>
              <div>
                <label htmlFor="region_map_lat" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Map Latitude</label>
                <input
                  type="number"
                  step="any"
                  id="region_map_lat"
                  name="region_map_lat"
                  value={regionForm.region_map_lat || 0}
                  onChange={handleRegionFormChange}
                  className={inputClasses}
                  placeholder="e.g., 29.7604"
                />
              </div>
              <div>
                <label htmlFor="region_map_lon" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Map Longitude</label>
                <input
                  type="number"
                  step="any"
                  id="region_map_lon"
                  name="region_map_lon"
                  value={regionForm.region_map_lon || 0}
                  onChange={handleRegionFormChange}
                  className={inputClasses}
                  placeholder="e.g., -95.3698"
                />
              </div>
              <div>
                <label htmlFor="region_map_zoom" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Map Zoom Level</label>
                <input
                  type="number"
                  id="region_map_zoom"
                  name="region_map_zoom"
                  value={regionForm.region_map_zoom || 0}
                  onChange={handleRegionFormChange}
                  className={inputClasses}
                  placeholder="e.g., 12"
                  min="1"
                  max="20"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="region_map_embed_link" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Google Maps Embed Link (iframe src)</label>
                <textarea
                  id="region_map_embed_link"
                  name="region_map_embed_link"
                  rows={3}
                  value={regionForm.region_map_embed_link || ''}
                  onChange={handleRegionFormChange}
                  className={inputClasses}
                  placeholder="Paste the 'src' value from a Google Maps embed iframe"
                ></textarea>
              </div>

              <div className="md:col-span-2 mt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancelRegionEdit}
                  className={buttonSecondaryClasses}
                  disabled={regionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={buttonPrimaryClasses}
                  disabled={regionLoading}
                >
                  {regionLoading ? 'Saving Region Config...' : 'Save Region Configuration'}
                </button>
              </div>
            </form>
          )}
        </section>
      )}

      {activeTab === 'locations' && (
        <>
          {/* --- Location Add/Edit Form Toggle Section --- */}
          {!showLocationAddEditForm && (
            <section className={sectionClasses + " text-center"}>
              <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">Location Management</h2>
              <p className="text-gray-700 mb-4 dark:text-gray-300">Add, edit, or delete workout locations (AOs) for your region.</p>
              <button
                onClick={handleAddLocationClick}
                className={buttonPrimaryClasses + " w-auto"}
              >
                Add New Location
              </button>
            </section>
          )}


          {/* --- Location Add/Edit Form --- */}
          {showLocationAddEditForm && (
            <section className={sectionClasses}>
              <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">{editLocationId ? 'Edit Existing Location' : 'Add New Location'}</h2>

              <form onSubmit={handleSubmitLocation} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location Name</label>
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
                  <label htmlFor="mapLink" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Google Maps Link</label>
                  <input
                    type="url"
                    id="mapLink"
                    name="mapLink"
                    value={newLocationForm.mapLink || ''}
                    onChange={handleNewLocationChange}
                    className={inputClasses}
                    placeholder="https://maps.app.goo.gl/..."
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
                    placeholder="123 Main St, Anytown, USA"
                  />
                </div>
                <div>
                  <label htmlFor="q" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Permanent Q Name</label>
                  <input
                    type="text"
                    id="q"
                    name="q"
                    value={newLocationForm.q || ''}
                    onChange={handleNewLocationChange}
                    className={inputClasses}
                    placeholder="e.g., Dredd"
                  />
                </div>
                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">AO Logo Image URL</label>
                  <input
                    type="url"
                    id="imageUrl"
                    name="imageUrl"
                    value={newLocationForm.imageUrl || ''}
                    onChange={handleNewLocationChange}
                    className={inputClasses}
                    placeholder="https://example.com/ao-logo.png"
                  />
                </div>
                <div>
                  <label htmlFor="paxImageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">PAX Image URL</label>
                  <input
                    type="url"
                    id="paxImageUrl"
                    name="paxImageUrl"
                    value={newLocationForm.paxImageUrl || ''}
                    onChange={handleNewLocationChange}
                    className={inputClasses}
                    placeholder="https://example.com/pax-image.png"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="embedMapLink" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Embed Map Link (iframe src)</label>
                  <textarea
                    id="embedMapLink"
                    name="embedMapLink"
                    rows={3}
                    value={newLocationForm.embedMapLink || ''}
                    onChange={handleNewLocationChange}
                    className={inputClasses}
                    placeholder="Paste the 'src' value from a Google Maps embed iframe"
                  ></textarea>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={newLocationForm.description || ''}
                    onChange={handleNewLocationChange}
                    className={inputClasses}
                    placeholder="Brief description of the AO, parking info, etc."
                  ></textarea>
                </div>
                <div className="md:col-span-2 mt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className={buttonSecondaryClasses}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={buttonPrimaryClasses}
                    disabled={loading}
                  >
                    {loading ? (editLocationId ? 'Updating...' : 'Adding...') : (editLocationId ? 'Update Location' : 'Add Location')}
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* --- Existing Location List --- */}
          <section className={sectionClasses}>
            <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">Existing Locations</h2>
            {loading && locations.length === 0 && <p className="text-center py-4 text-gray-600 dark:text-gray-400">Loading locations...</p>}
            {!loading && locations.length === 0 && !showLocationAddEditForm && <p className="text-center py-4 text-gray-600 dark:text-gray-400">No locations added yet. Click "Add New Location" to get started!</p>}
            <ul className="space-y-4">
              {locations.map((loc) => (
                <li key={loc._id} className="p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center dark:bg-gray-800 dark:border-gray-700">
                  <div className="mb-2 sm:mb-0">
                    <p className="font-semibold text-xl text-gray-900 dark:text-white">{loc.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{loc.address}</p>
                    <p className="text-sm text-gray-600 mt-1 dark:text-gray-400">Permanent Q: <span className="font-medium">{loc.q || 'N/A'}</span></p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditLocation(loc)}
                      className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition-colors duration-200 dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-300"
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteLocation(loc._id)}
                      className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 dark:bg-red-700 dark:hover:bg-red-800 dark:focus:ring-red-400"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
