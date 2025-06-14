// app/api/region/route.ts

import { type NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import dbConnect from '@/lib/dbConnect';
import RegionModel from '@/models/RegionConfig'; // Import the new Region Model
import type { LocaleData, RegionFormState } from '../../../../types/locale';

// Helper to get admin password from locale file (reused from locations route)
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

// --- GET Method (Fetches region data - PUBLICLY ACCESSIBLE) ---
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        // There should ideally be only one region configuration document.
        // We fetch the first one found.
        const regionData = await RegionModel.findOne({}).lean().exec();

        if (!regionData) {
            // If no region data exists, return an empty object or a default structure
            // This is handled client-side in admin/page.tsx by checking for a 404
            return NextResponse.json({}, { status: 404 });
        }

        // Convert _id to string for consistent client-side typing if needed, though not directly used by form
        const cleanRegionData: LocaleData = {
            _id: regionData._id.toString(),
            region_name: regionData.region_name || '',
            meta_description: regionData.meta_description || '',
            hero_title: regionData.hero_title || '',
            hero_subtitle: regionData.hero_subtitle || '',
            region_city: regionData.region_city || '',
            region_state: regionData.region_state || '',
            region_facebook: regionData.region_facebook || '',
            region_map_lat: regionData.region_map_lat || 0,
            region_map_lon: regionData.region_map_lon || 0,
            region_map_zoom: regionData.region_map_zoom || 12,
            region_map_embed_link: regionData.region_map_embed_link || '',
            region_instagram: regionData.region_instagram || '',
            region_linkedin: regionData.region_linkedin || '',
            region_x_twitter: regionData.region_x_twitter || '',
        };

        return NextResponse.json(cleanRegionData);
    } catch (error) {
        console.error('API GET Error fetching region data:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ message: `Error: Failed to fetch region data. ${errorMessage}` }, { status: 500 });
    }
}

// --- PUT Method (Updates or Creates region data - PROTECTED) ---
export async function PUT(request: NextRequest) {
    let localeAdminPassword: string;
    try {
        localeAdminPassword = await getAdminPasswordFromLocale();
    } catch (error: any) {
        console.error('Error in PUT trying to get admin password:', error);
        return NextResponse.json({ message: `Error: ${error.message}` }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const providedPassword = searchParams.get('pw');

    if (providedPassword !== localeAdminPassword) {
        return NextResponse.json({ message: 'Error: Access Denied. Invalid password.' }, { status: 403 });
    }

    await dbConnect();

    try {
        const regionData: RegionFormState = await request.json();

        if (!regionData || typeof regionData !== 'object' || !regionData.region_name) {
            return NextResponse.json({ message: 'Error: Invalid data format. Region Name is required.' }, { status: 400 });
        }

        // Find the existing region document, or prepare to create if it doesn't exist.
        // We use an empty query object {} to find the *first* document in the collection.
        // With `upsert: true`, if no document matches, a new one will be created.
        const result = await RegionModel.updateOne(
            {}, // Query to find the document (finds the first one, suitable for a single config doc)
            { $set: regionData }, // Data to set/update
            { upsert: true, new: true, runValidators: true } // upsert: create if not exists, new: return updated doc
        );

        if (result.upsertedCount > 0) {
            return NextResponse.json({ message: 'Success: Region configuration created successfully!' }, { status: 201 });
        } else {
            return NextResponse.json({ message: 'Success: Region configuration updated successfully.' }, { status: 200 });
        }

    } catch (error: any) {
        console.error('API Error saving/updating region:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ message: `Error: Failed to save/update region. ${errorMessage}` }, { status: 500 });
    }
}
