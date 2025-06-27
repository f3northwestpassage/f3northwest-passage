import { type NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import LocationModel from '@/models/Location';
import WorkoutModel from '@/models/Workout';
import { getAdminPasswordFromEnv } from '@/utils/getAdminPassword';
import type { LocationClean } from '../../../../types/workout';

// helper to check admin password
async function checkAdminPassword(request: NextRequest) {
    const adminPassword = await getAdminPasswordFromEnv();
    const { searchParams } = new URL(request.url);
    const providedPassword = searchParams.get('pw');
    if (providedPassword !== adminPassword) {
        throw new Error('Invalid password');
    }
}

// --- GET Method (Fetches all locations) ---
export async function GET() {
    try {
        await dbConnect();
        const rawLocations = await LocationModel.find({}).lean().exec();

        const locations: LocationClean[] = rawLocations.map(loc => ({
            _id: loc._id.toString(),
            name: loc.name,
            mapLink: loc.mapLink,
            address: loc.address,
            description: loc.description,
            q: loc.q,
            embedMapLink: loc.embedMapLink,
            imageUrl: loc.imageUrl,
            paxImageUrl: loc.paxImageUrl,
        }));

        return NextResponse.json(locations);
    } catch (error) {
        console.error('API GET Error fetching locations:', error);
        return NextResponse.json(
            { message: `Error: Failed to fetch locations. ${error instanceof Error ? error.message : 'Unknown error'}` },
            { status: 500 }
        );
    }
}

// --- POST Method (Create a new Location) ---
export async function POST(request: NextRequest) {
    try {
        await checkAdminPassword(request);
        await dbConnect();
        const locationData: LocationClean = await request.json();

        if (!locationData || typeof locationData !== 'object' || !locationData.name || !locationData.mapLink) {
            return NextResponse.json(
                { message: 'Error: Invalid data format. Location Name and Map Link are required.' },
                { status: 400 }
            );
        }

        const created = await LocationModel.create(locationData);
        return NextResponse.json({ message: 'Success: Location created.', location: created.toObject() }, { status: 201 });
    } catch (error: any) {
        console.error('POST Location error:', error);
        if (error?.code === 11000) {
            return NextResponse.json({ message: 'Error: Location already exists.' }, { status: 409 });
        }
        if (error.message === 'Invalid password') {
            return NextResponse.json({ message: 'Error: Access Denied. Invalid password.' }, { status: 403 });
        }
        return NextResponse.json({ message: `Error: ${error.message || 'Unknown error'}` }, { status: 500 });
    }
}

// --- PUT Method (Update an existing Location) ---
export async function PUT(request: NextRequest) {
    try {
        await checkAdminPassword(request);
        await dbConnect();
        const locationData: LocationClean = await request.json();

        if (!locationData || typeof locationData !== 'object' || !locationData._id) {
            return NextResponse.json(
                { message: 'Error: Invalid data format. _id is required for updates.' },
                { status: 400 }
            );
        }

        const fieldsToSave = {
            name: locationData.name,
            mapLink: locationData.mapLink,
            address: locationData.address,
            description: locationData.description,
            q: locationData.q,
            embedMapLink: locationData.embedMapLink,
            imageUrl: locationData.imageUrl,
            paxImageUrl: locationData.paxImageUrl,
        };

        const updated = await LocationModel.findByIdAndUpdate(locationData._id, fieldsToSave, {
            new: true,
            runValidators: true,
        }).lean().exec();

        if (!updated) {
            return NextResponse.json({ message: 'Error: Location not found for update.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Success: Location updated.', location: updated }, { status: 200 });
    } catch (error: any) {
        console.error('PUT Location error:', error);
        if (error.message === 'Invalid password') {
            return NextResponse.json({ message: 'Error: Access Denied. Invalid password.' }, { status: 403 });
        }
        return NextResponse.json({ message: `Error: ${error.message || 'Unknown error'}` }, { status: 500 });
    }
}

// --- DELETE Method (Delete Location + Workouts) ---
export async function DELETE(request: NextRequest) {
    let session: mongoose.ClientSession | null = null;
    try {
        await checkAdminPassword(request);
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const locationId = searchParams.get('id');

        if (!locationId) {
            return NextResponse.json({ message: 'Error: Location ID required.' }, { status: 400 });
        }

        session = await mongoose.connection.startSession();
        session.startTransaction();

        await WorkoutModel.deleteMany({ locationId }, { session });
        const deletedLocation = await LocationModel.findByIdAndDelete(locationId, { session }).exec();

        if (!deletedLocation) {
            await session.abortTransaction();
            return NextResponse.json({ message: 'Error: Location not found.' }, { status: 404 });
        }

        await session.commitTransaction();
        return NextResponse.json({ message: 'Success: Location and workouts deleted.' }, { status: 200 });
    } catch (error: any) {
        if (session) {
            await session.abortTransaction();
        }
        console.error('DELETE Location error:', error);
        if (error.message === 'Invalid password') {
            return NextResponse.json({ message: 'Error: Access Denied. Invalid password.' }, { status: 403 });
        }
        return NextResponse.json({ message: `Error: ${error.message || 'Unknown error'}` }, { status: 500 });
    } finally {
        if (session) {
            session.endSession();
        }
    }
}
