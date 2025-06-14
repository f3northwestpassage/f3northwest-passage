// src/app/admin/page.tsx
'use client'; // This is a Client Component

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { LocationClean } from '../../../types/workout'; // Assuming this path is correct
import type { LocaleData, RegionFormState } from '../../../types/locale'; // Import LocaleData and RegionFormState

// Define the initial state for the region form
const initialRegionFormState: RegionFormState = {
  region_name: '',
  meta_description: '',
  hero_title: '',
  hero_subtitle: '',
  region_city: '',
  region_state: '',
  region_facebook: '',
  region_map_lat: 0,
  region_map_lon: 0,
  region_map_zoom: 12, // Default zoom level
  region_map_embed_link: '',
  region_instagram: '',
  region_linkedin: '',
  region_x_twitter: '',
};

// Reusable Input Field Component - **NOW CORRECTLY APPLIES PLACEHOLDER**
const FormInput = ({ label, id, name, type = 'text', value, onChange, required = false, step, rows, placeholder }: {
  label: string;
  id: string;
  name: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  step?: string;
  rows?: number;
  placeholder?: string;
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {type === 'textarea' ? (
      <textarea
        id={id}
        name={name}
        rows={rows}
        value={value}
        onChange={onChange}
        // --- ADDED THIS LINE ---
        placeholder={placeholder}
        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
        required={required}
      />
    ) : (
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        // --- ADDED THIS LINE ---
        placeholder={placeholder}
        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
        required={required}
        step={step}
      />
    )}
  </div>
);


export default function AdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const password = searchParams.get('pw');

  const [activeTab, setActiveTab] = useState<'region' | 'locations'>('region');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [locations, setLocations] = useState<LocationClean[]>([]);
  const [newLocationForm, setNewLocationForm] = useState<Partial<LocationClean>>({
    name: '', mapLink: '', address: '', description: '', q: '', embedMapLink: '', imageUrl: '', paxImageUrl: '',
  });
  const [editLocationId, setEditLocationId] = useState<string | null>(null);

  const [regionForm, setRegionForm] = useState<RegionFormState>(initialRegionFormState);
  const [regionLoading, setRegionLoading] = useState(true);
  const [regionError, setRegionError] = useState<string | null>(null);
  const [regionSuccess, setRegionSuccess] = useState<string | null>(null);


  // --- Global Password Check ---
  useEffect(() => {
    if (!password) {
      setError('Admin password is required to access the dashboard.');
      setLoading(false);
      setRegionLoading(false);
    }
  }, [password]);


  // --- Effect to fetch region data on component mount (or password change) ---
  useEffect(() => {
    if (!password) return;

    async function fetchRegionData() {
      setRegionLoading(true);
      setRegionError(null);
      try {
        const response = await fetch('/api/region');
        if (!response.ok) {
          if (response.status === 404) {
            console.warn('Region configuration not found, initializing empty form. Please create it.');
            setRegionForm(initialRegionFormState);
            setRegionSuccess('Region configuration is not set up. Please save to create it.');
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
          region_city: data.region_city || '',
          region_state: data.region_state || '',
          region_facebook: data.region_facebook || '',
          region_map_lat: data.region_map_lat || 0,
          region_map_lon: data.region_map_lon || 0,
          region_map_zoom: data.region_map_zoom || 12,
          region_map_embed_link: data.region_map_embed_link || '',
          region_instagram: data.region_instagram || '',
          region_linkedin: data.region_linkedin || '',
          region_x_twitter: data.region_x_twitter || '',
        });
      } catch (e: any) {
        setRegionError(`Failed to fetch region data: ${e.message}`);
        console.error("Failed to fetch region data:", e);
      } finally {
        setRegionLoading(false);
      }
    }
    fetchRegionData();
  }, [password]);


  // --- Handlers for Region Form ---
  const handleRegionFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRegionForm((prev: any) => ({
      ...prev,
      [name]: name.startsWith('region_map_') ? parseFloat(value) || 0 : value,
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
    } catch (e: any) {
      setRegionError(`Error updating region: ${e.message}`);
      console.error("Error updating region:", e);
    } finally {
      setRegionLoading(false);
    }
  };


  // --- Location related Handlers (unchanged) ---
  useEffect(() => {
    if (!password) return;

    async function fetchLocations() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/locations?pw=${password}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: LocationClean[] = await response.json();
        setLocations(data);
      } catch (e: any) {
        setError(`Failed to fetch locations: ${e.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchLocations();
  }, [password]);

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
    setActiveTab('locations');
    setSuccess(null);
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditLocationId(null);
    setNewLocationForm({
      name: '', mapLink: '', address: '', description: '', q: '', embedMapLink: '', imageUrl: '', paxImageUrl: '',
    });
    setError(null);
    setSuccess(null);
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
      const method = 'POST';
      const body = { ...newLocationForm, _id: editLocationId || undefined };

      const response = await fetch(`/api/locations?pw=${password}`, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to process location.');
      }

      setSuccess(data.message);
      const updatedLocationsResponse = await fetch(`/api/locations?pw=${password}`);
      const updatedLocationsData: LocationClean[] = await updatedLocationsResponse.json();
      setLocations(updatedLocationsData);

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

      setSuccess(data.message);
      setLocations(prev => prev.filter(loc => loc._id !== id));
    } catch (e: any) {
      setError(`Error: ${e.message}`);
      console.error("Error deleting location:", e);
    } finally {
      setLoading(false);
    }
  };


  if (!password) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 p-10 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center">Admin Access Required</h1>
          <p className="mt-2 text-center text-sm text-red-600 dark:text-red-400">
            Please provide the admin password in the URL.
          </p>
          <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
            **Security Warning:** This method of password protection is highly insecure for production environments.
            Please consider implementing a robust authentication system like NextAuth.js.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white text-center mb-8">Admin Dashboard</h1>

        {/* Global Messages */}
        {error && <p className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded relative mb-4 text-center">{error}</p>}
        {success && <p className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-200 px-4 py-3 rounded relative mb-4 text-center">{success}</p>}

        {/* Tab Navigation */}
        <div className="mb-8 border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('region')}
              className={`${activeTab === 'region'
                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg`}
            >
              Edit Region Info
            </button>
            <button
              onClick={() => setActiveTab('locations')}
              className={`${activeTab === 'locations'
                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg`}
            >
              Manage Locations
            </button>
          </nav>
        </div>

        {/* --- Region Configuration Section --- */}
        {activeTab === 'region' && (
          <section className="mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white border-b pb-3 dark:border-gray-700">Region Settings</h2>
            {regionLoading && <p className="text-center text-gray-600 dark:text-gray-400">Loading region data...</p>}
            {regionError && <p className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded relative mb-4 text-center">{regionError}</p>}
            {regionSuccess && <p className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-200 px-4 py-3 rounded relative mb-4 text-center">{regionSuccess}</p>}

            {!regionLoading && (
              <form onSubmit={handleRegionSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput label="Region Name" id="region_name" name="region_name" value={regionForm.region_name || ''} onChange={handleRegionFormChange} placeholder="e.g., F3 Houston" />
                <FormInput label="Meta Description" id="meta_description" name="meta_description" value={regionForm.meta_description || ''} onChange={handleRegionFormChange} placeholder="A brief description for search engines" />
                <FormInput label="Hero Title" id="hero_title" name="hero_title" value={regionForm.hero_title || ''} onChange={handleRegionFormChange} placeholder="e.g., Iron Sharpens Iron" />
                <FormInput label="Hero Subtitle" id="hero_subtitle" name="hero_subtitle" value={regionForm.hero_subtitle || ''} onChange={handleRegionFormChange} placeholder="e.g., F3: Fitness, Fellowship, Faith" />
                <FormInput label="Region City" id="region_city" name="region_city" value={regionForm.region_city || ''} onChange={handleRegionFormChange} placeholder="e.g., Houston" />
                <FormInput label="Region State" id="region_state" name="region_state" value={regionForm.region_state || ''} onChange={handleRegionFormChange} placeholder="e.g., TX" />
                <FormInput label="Facebook URL" id="region_facebook" name="region_facebook" type="url" value={regionForm.region_facebook || ''} onChange={handleRegionFormChange} placeholder="https://facebook.com/f3houston" />
                <FormInput label="Map Latitude" id="region_map_lat" name="region_map_lat" type="number" step="any" value={regionForm.region_map_lat || 0} onChange={handleRegionFormChange} placeholder="e.g., 29.7604" />
                <FormInput label="Map Longitude" id="region_map_lon" name="region_map_lon" type="number" step="any" value={regionForm.region_map_lon || 0} onChange={handleRegionFormChange} placeholder="e.g., -95.3698" />
                <FormInput label="Map Zoom" id="region_map_zoom" name="region_map_zoom" type="number" value={regionForm.region_map_zoom || 0} onChange={handleRegionFormChange} placeholder="e.g., 12" />
                <div className="md:col-span-2">
                  <FormInput label="Map Embed Link (iframe src)" id="region_map_embed_link" name="region_map_embed_link" type="url" value={regionForm.region_map_embed_link || ''} onChange={handleRegionFormChange} placeholder="https://www.google.com/maps/embed?pb=!1m18!..." />
                </div>

                {/* Social Media Inputs */}
                <div className="md:col-span-2 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Social Media Links (Optional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput label="Instagram URL" id="region_instagram" name="region_instagram" type="url" value={regionForm.region_instagram || ''} onChange={handleRegionFormChange} placeholder="https://instagram.com/f3houston" />
                    <FormInput label="LinkedIn URL" id="region_linkedin" name="region_linkedin" type="url" value={regionForm.region_linkedin || ''} onChange={handleRegionFormChange} placeholder="https://linkedin.com/company/f3houston" />
                    <FormInput label="X (Twitter) URL" id="region_x_twitter" name="region_x_twitter" type="url" value={regionForm.region_x_twitter || ''} onChange={handleRegionFormChange} placeholder="https://x.com/f3houston" />
                  </div>
                </div>

                <div className="md:col-span-2 mt-4">
                  <button
                    type="submit"
                    className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out
                               dark:bg-blue-700 dark:hover:bg-blue-600 dark:focus:ring-blue-400"
                    disabled={regionLoading}
                  >
                    {regionLoading ? 'Saving...' : 'Save Region Configuration'}
                  </button>
                </div>
              </form>
            )}
          </section>
        )}

        {/* --- Location Management Section --- */}
        {activeTab === 'locations' && (
          <section className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white border-b pb-3 dark:border-gray-700">{editLocationId ? 'Edit Location' : 'Add New Location'}</h2>
            {loading && <p className="text-center text-gray-600 dark:text-gray-400">Loading locations...</p>}
            {error && <p className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded relative mb-4 text-center">{error}</p>}
            {success && <p className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-200 px-4 py-3 rounded relative mb-4 text-center">{success}</p>}

            <form onSubmit={handleSubmitLocation} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput label="Location Name" id="name" name="name" value={newLocationForm.name || ''} onChange={handleNewLocationChange} required placeholder="e.g., The Mothership" />
              <FormInput label="Google Maps Link" id="mapLink" name="mapLink" type="url" value={newLocationForm.mapLink || ''} onChange={handleNewLocationChange} required placeholder="https://maps.app.goo.gl/..." />
              <FormInput label="Address" id="address" name="address" value={newLocationForm.address || ''} onChange={handleNewLocationChange} placeholder="e.g., 123 Main St, Anytown, ST 12345" />
              <FormInput label="Permanent Q Name" id="q" name="q" value={newLocationForm.q || ''} onChange={handleNewLocationChange} placeholder="e.g., Dredd" />
              <FormInput label="Embed Map Link (iframe src)" id="embedMapLink" name="embedMapLink" type="url" value={newLocationForm.embedMapLink || ''} onChange={handleNewLocationChange} placeholder="https://www.google.com/maps/embed?pb=..." />
              <FormInput label="AO Logo Image URL" id="imageUrl" name="imageUrl" type="url" value={newLocationForm.imageUrl || ''} onChange={handleNewLocationChange} placeholder="https://example.com/logo.png" />
              <FormInput label="PAX Image URL" id="paxImageUrl" name="paxImageUrl" type="url" value={newLocationForm.paxImageUrl || ''} onChange={handleNewLocationChange} placeholder="https://example.com/pax_image.png" />
              <div className="md:col-span-2">
                <FormInput label="Description" id="description" name="description" type="textarea" rows={3} value={newLocationForm.description || ''} onChange={handleNewLocationChange} placeholder="Brief description of the workout location." />
              </div>
              <div className="md:col-span-2 mt-4 space-x-3">
                <button
                  type="submit"
                  className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-lg font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out
                             dark:bg-indigo-700 dark:hover:bg-indigo-600 dark:focus:ring-indigo-400"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (editLocationId ? 'Update Location' : 'Add Location')}
                </button>
                {editLocationId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="inline-flex justify-center py-3 px-6 border border-gray-300 shadow-sm text-lg font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out
                               dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 dark:focus:ring-gray-500"
                    disabled={loading}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>

            <h3 className="text-xl font-semibold mt-10 mb-4 text-gray-800 dark:text-white border-b pb-2 dark:border-gray-700">Existing Locations</h3>
            {locations.length === 0 && !loading && <p className="text-gray-600 dark:text-gray-400">No locations added yet. Use the form above to add one.</p>}
            <ul className="space-y-4">
              {locations.map((loc) => (
                <li key={loc._id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="mb-2 sm:mb-0">
                    <p className="font-semibold text-lg text-gray-900 dark:text-white">{loc.name}</p>
                    {loc.address && <p className="text-sm text-gray-600 dark:text-gray-300">{loc.address}</p>}
                    {loc.q && <p className="text-sm text-gray-600 dark:text-gray-300">Q: {loc.q}</p>}
                    {loc.mapLink && <a href={loc.mapLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 dark:text-blue-400 hover:underline">View Map</a>}
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <button
                      onClick={() => handleEditLocation(loc)}
                      className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition duration-150 ease-in-out
                                 dark:bg-yellow-600 dark:hover:bg-yellow-500 dark:focus:ring-yellow-300"
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteLocation(loc._id)}
                      className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400 transition duration-150 ease-in-out
                                 dark:bg-red-600 dark:hover:bg-red-500 dark:focus:ring-red-300"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
