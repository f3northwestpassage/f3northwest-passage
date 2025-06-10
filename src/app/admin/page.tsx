'use client'; // Required for using hooks like useSearchParams

import { useSearchParams } from 'next/navigation';
import Link from 'next/link'; // Optional: if you want to link back to home, etc.
import Header from '../_components/Header'; // Assuming a common Header
import Footer from '../_components/Footer'; // Assuming a common Footer
import { fetchWorkoutsData } from '../../utils/fetchWorkoutsData';
import type { Workout } from '../../utils/fetchWorkoutsData';

const ADMIN_PASSWORD = 'f3northwestpassageslt'; // Store the password

export default function AdminPage() {
  const searchParams = useSearchParams();
  const providedPassword = searchParams.get('pw');

  if (providedPassword !== ADMIN_PASSWORD) {
    return (
      <>
        <Header href="/admin" /> {/* Or some other relevant href */}
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

  // If password is correct, show the admin content
  const workouts = fetchWorkoutsData(); // Fetch data

  return (
    <>
      <Header href="/admin" />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Admin Dashboard - Manage Workouts
        </h1>

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
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {workouts.map((workout, index) => (
                  <tr key={index} className="hover:bg-gray-100 border-b border-gray-200">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500">No workouts found.</p>
        )}
      </main>
      <Footer />
    </>
  );
}
