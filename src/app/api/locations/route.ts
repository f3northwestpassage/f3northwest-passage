// app/api/locations/route.ts

import { type NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

import dbConnect from '@/lib/dbConnect';
import LocationModel from '@/models/Location';
import WorkoutModel from '@/models/Workout';
import type { LocationClean } from '../../../../types/workout';

// Helper to get admin password from locale file
async function getAdminPasswordFromLocale(): Promise<string> {
    const localeFilePath = path.join(process.cwd(), 'src', 'locales', 'en.json');
    try {
        const fileContents = fs.readFileSync(localeFilePath, 'utf-8');
        const localeData = JSON.parse(fileContents);
        const adminPassword = localeData.admin_password;

        if (!adminPassword) {
            console.error('Admin password not found in src/locales/en.json or is empty.');
            throw new Error('Server configuration error: Admin password missing.');
        }
        return adminPassword;
    } catch (error) {
        console.error('Error reading or parsing src/locales/en.json for admin password:', error);
        return Promise.reject(new Error('Server configuration error: Cannot read admin password.'));
    }
}

// --- GET Method (Fetches all locations - NOW PUBLICLY ACCESSIBLE) ---
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const rawLocations = await LocationModel.find({}).lean().exec();

        // Explicitly map to LocationClean to ensure _id is typed as string
        const locations: LocationClean[] = rawLocations.map(loc => ({
            _id: loc._id.toString(), // Ensure _id is string
            name: loc.name,
            mapLink: loc.mapLink,
            address: loc.address,
            description: loc.description,
            q: loc.q, // Include 'q' field when mapping
            embedMapLink: loc.embedMapLink, // Ensure embedMapLink is included
            imageUrl: loc.imageUrl, // Ensure imageUrl is included
            paxImageUrl: loc.paxImageUrl, // <--- ADD THIS LINE to include paxImageUrl
        }));

        return NextResponse.json(locations);
    } catch (error) {
        console.error('API GET Error fetching locations:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ message: `Error: Failed to fetch locations. ${errorMessage}` }, { status: 500 });
    }
}

// --- POST Method (Adds new location or Updates existing location - REMAINS PROTECTED) ---
export async function POST(request: NextRequest) {
    let localeAdminPassword: string;
    try {
        localeAdminPassword = await getAdminPasswordFromLocale();
    } catch (error: any) {
        console.error('Error in POST trying to get admin password:', error);
        return NextResponse.json({ message: `Error: ${error.message}` }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const providedPassword = searchParams.get('pw');

    if (providedPassword !== localeAdminPassword) {
        return NextResponse.json({ message: 'Error: Access Denied. Invalid password.' }, { status: 403 });
    }

    await dbConnect();

    try {
        const locationData: LocationClean = await request.json();

        // Ensure these fields are explicitly allowed in your Mongoose schema!
        // MongoDB will ignore fields not defined in the schema for 'create' and 'update'.
        if (!locationData || typeof locationData !== 'object' || !locationData.name || !locationData.mapLink) {
            return NextResponse.json({ message: 'Error: Invalid data format. Location Name and Map Link are required.' }, { status: 400 });
        }

        // Prepare fields to be updated/created, ensuring all relevant fields are captured.
        const fieldsToSave = {
            name: locationData.name,
            mapLink: locationData.mapLink,
            address: locationData.address,
            description: locationData.description,
            q: locationData.q, // Crucial: ensure 'q' is part of the data being saved
            embedMapLink: locationData.embedMapLink, // Crucial: ensure 'embedMapLink' is part of the data being saved
            imageUrl: locationData.imageUrl, // Crucial: ensure 'imageUrl' is part of the data being saved
            paxImageUrl: locationData.paxImageUrl, // <--- ADD THIS LINE to ensure paxImageUrl is saved/updated
        };

        if (locationData._id) {
            // Update existing location
            const updatedLocation = await LocationModel.findByIdAndUpdate(
                locationData._id,
                fieldsToSave, // Use the carefully prepared fields
                { new: true, runValidators: true }
            ).lean().exec();

            if (!updatedLocation) {
                return NextResponse.json({ message: 'Error: Location not found for update.' }, { status: 404 });
            }
            return NextResponse.json({ message: 'Success: Location updated successfully.', location: updatedLocation }, { status: 200 });
        } else {
            // Add new location
            const newLocation = await LocationModel.create(fieldsToSave); // Use the carefully prepared fields
            return NextResponse.json({ message: 'Success: Location added successfully.', location: newLocation.toObject() }, { status: 201 });
        }

    } catch (error: any) {
        console.error('API Error saving/updating location:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        if (error.code === 11000) { // Duplicate key error (e.g., if name is unique)
            return NextResponse.json({ message: `Error: A location with this name already exists.` }, { status: 409 });
        }
        return NextResponse.json({ message: `Error: Failed to save/update location. ${errorMessage}` }, { status: 500 });
    }
}

// --- DELETE Method (Deletes a location and its associated workouts - REMAINS PROTECTED) ---
export async function DELETE(request: NextRequest) {
    let localeAdminPassword: string;
    try {
        localeAdminPassword = await getAdminPasswordFromLocale();
    } catch (error: any) {
        console.error('Error in DELETE trying to get admin password:', error);
        return NextResponse.json({ message: `Error: ${error.message}` }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const providedPassword = searchParams.get('pw');
    const locationId = searchParams.get('id'); // Expect location ID in 'id' query param

    if (providedPassword !== localeAdminPassword) {
        return NextResponse.json({ message: 'Error: Access Denied. Invalid password.' }, { status: 403 });
    }

    if (!locationId) {
        return NextResponse.json({ message: 'Error: Location ID is required for deletion.' }, { status: 400 });
    }

    await dbConnect();

    try {
        // Start a Mongoose session for transaction to ensure atomicity
        const session = await mongoose.connection.startSession();
        session.startTransaction();

        try {
            // 1. Delete associated workouts first
            await WorkoutModel.deleteMany({ locationId: locationId }, { session });
            console.log(`Deleted workouts associated with locationId: ${locationId}`);

            // 2. Then delete the location itself
            const result = await LocationModel.findByIdAndDelete(locationId, { session }).exec();

            if (!result) {
                await session.abortTransaction();
                session.endSession();
                return NextResponse.json({ message: 'Error: Location not found for deletion.' }, { status: 404 });
            }

            await session.commitTransaction();
            session.endSession();

            return NextResponse.json({ message: 'Success: Location and its associated workouts deleted successfully.' }, { status: 200 });

        } catch (transactionError) {
            await session.abortTransaction();
            session.endSession();
            console.error('Transaction failed during location deletion:', transactionError);
            throw transactionError; // Re-throw to be caught by outer catch block
        }

    } catch (error) {
        console.error('API Error deleting location:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ message: `Error: Failed to delete location. ${errorMessage}` }, { status: 500 });
    }
}
