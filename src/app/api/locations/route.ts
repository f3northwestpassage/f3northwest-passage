// app/api/locations/route.ts

import { type NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import LocationModel from '@/models/Location';
import WorkoutModel from '@/models/Workout';
import { getAdminPasswordFromEnv } from '@/utils/getAdminPassword'; // <-- use your helper
import type { LocationClean } from '../../../../types/workout';

// --- GET Method (Fetches all locations - Publicly Accessible) ---
export async function GET(request: NextRequest) {
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

// --- POST Method (Add or Update a Location - Password Protected) ---
export async function POST(request: NextRequest) {
    try {
        const adminPassword = await getAdminPasswordFromEnv();

        const { searchParams } = new URL(request.url);
        const providedPassword = searchParams.get('pw');

        if (providedPassword !== adminPassword) {
            return NextResponse.json({ message: 'Error: Access Denied. Invalid password.' }, { status: 403 });
        }

        await dbConnect();
        const locationData: LocationClean = await request.json();

        if (!locationData || typeof locationData !== 'object' || !locationData.name || !locationData.mapLink) {
            return NextResponse.json({ message: 'Error: Invalid data format. Location Name and Map Link are required.' }, { status: 400 });
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

        if (locationData._id) {
            const updated = await LocationModel.findByIdAndUpdate(locationData._id, fieldsToSave, {
                new: true,
                runValidators: true,
            }).lean().exec();

            if (!updated) {
                return NextResponse.json({ message: 'Error: Location not found for update.' }, { status: 404 });
            }

            return NextResponse.json({ message: 'Success: Location updated.', location: updated }, { status: 200 });
        } else {
            const created = await LocationModel.create(fieldsToSave);
            return NextResponse.json({ message: 'Success: Location created.', location: created.toObject() }, { status: 201 });
        }
    } catch (error: any) {
        console.error('POST Location error:', error);
        if (error?.code === 11000) {
            return NextResponse.json({ message: 'Error: Location already exists.' }, { status: 409 });
        }
        return NextResponse.json({ message: `Error: ${error.message || 'Unknown error'}` }, { status: 500 });
    }
}

// --- DELETE Method (Delete Location + Associated Workouts - Password Protected) ---
export async function DELETE(request: NextRequest) {
    try {
        const adminPassword = await getAdminPasswordFromEnv();

        const { searchParams } = new URL(request.url);
        const providedPassword = searchParams.get('pw');
        const locationId = searchParams.get('id');

        if (providedPassword !== adminPassword) {
            return NextResponse.json({ message: 'Error: Access Denied. Invalid password.' }, { status: 403 });
        }

        if (!locationId) {
            return NextResponse.json({ message: 'Error: Location ID required.' }, { status: 400 });
        }

        await dbConnect();

        const session = await mongoose.connection.startSession();
        session.startTransaction();

        try {
            await WorkoutModel.deleteMany({ locationId }, { session });
            const deletedLocation = await LocationModel.findByIdAndDelete(locationId, { session }).exec();

            if (!deletedLocation) {
                await session.abortTransaction();
                session.endSession();
                return NextResponse.json({ message: 'Error: Location not found.' }, { status: 404 });
            }

            await session.commitTransaction();
            session.endSession();

            return NextResponse.json({ message: 'Success: Location and workouts deleted.' }, { status: 200 });
        } catch (txnErr) {
            await session.abortTransaction();
            session.endSession();
            console.error('Transaction error:', txnErr);
            throw txnErr;
        }
    } catch (error: any) {
        console.error('DELETE Location error:', error);
        return NextResponse.json({ message: `Error: ${error.message || 'Unknown error'}` }, { status: 500 });
    }
}
