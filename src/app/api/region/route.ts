// src/app/api/region/route.ts

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import F3RegionModel from '@/models/F3Region';
import mongoose from 'mongoose';

// IMPORTANT: Use a regular environment variable for server-side secrets, NOT NEXT_PUBLIC_
// Ensure ADMIN_PASSWORD is set in your .env.local file (e.g., ADMIN_PASSWORD=your_secure_password)
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

// Helper to set CORS headers for all responses
const setCorsHeaders = (response: NextResponse): NextResponse => {
    // In production, consider being more restrictive by setting specific origins
    // For general purpose or same-domain API, allowing * is often used.
    // If you need to restrict, replace '*' with your specific production domain(s)
    // e.g., 'https://www.f3northwestpassage.com'
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
};

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
    const response = new NextResponse(null, { status: 204 }); // 204 No Content for preflight success
    return setCorsHeaders(response);
}


// --- PUT: Update or Insert Region Config (Protected) ---
export async function PUT(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const password = searchParams.get('pw');

        // Basic password validation for admin access
        if (!password || password !== ADMIN_PASSWORD) {
            console.warn('Unauthorized PUT /api/region attempt - Invalid or missing password');
            const response = NextResponse.json({ message: 'Unauthorized: Invalid or missing password.' }, { status: 401 });
            return setCorsHeaders(response);
        }

        await dbConnect(); // Ensure database connection is established

        const body = await request.json(); // Parse the JSON request body
        console.log('Received body for region update:', body);

        // Find the existing region configuration. Assuming there's only one.
        const existing = await F3RegionModel.findOne().exec();

        let response;
        if (existing) {
            // If config exists, update it
            await F3RegionModel.updateOne({ _id: existing._id }, { $set: body });
            console.log('Existing region configuration updated.');
            response = NextResponse.json({ message: 'Region configuration updated successfully.' }, { status: 200 });
        } else {
            // If no config exists, create a new one
            const created = await F3RegionModel.create(body);
            console.log('New region configuration created.');
            // Ensure _id is converted to string for consistent API response
            response = NextResponse.json({ message: 'Region configuration created successfully.', id: (created._id as mongoose.Types.ObjectId).toString() }, { status: 201 });
        }
        return setCorsHeaders(response);
    } catch (error: any) {
        console.error('Error in PUT /api/region:', error);
        const response = NextResponse.json({ message: error.message || 'Internal Server Error during region update.' }, { status: 500 });
        return setCorsHeaders(response);
    }
}

// --- GET: Fetch Region Config or Fallback to Mock (Public) ---
export async function GET(request: NextRequest) {
    try {
        await dbConnect(); // Ensure database connection is established

        const region = await F3RegionModel.findOne().lean().exec();

        let response;
        if (!region) {
            console.warn('No region found in DB, returning mock region data.');
            // Return a comprehensive mock object, including new fields
            response = NextResponse.json({
                _id: 'mock-id',
                region_name: 'Mock Region',
                meta_description: 'This is a mock region configuration for demonstration or when no actual config exists.',
                hero_title: 'Mock Hero Title',
                hero_subtitle: 'Welcome to Mock F3!',
                region_logo_url: '',
                region_hero_img_url: '',
                region_city: 'Mockville',
                region_state: 'MS',
                region_facebook: 'https://www.facebook.com/mockf3region',
                region_instagram: '',
                region_linkedin: '',
                region_x_twitter: '',
                region_map_lat: 30.0,
                region_map_lon: -90.0,
                region_map_zoom: 10,
                region_map_embed_link: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3463.5878401314945!2d-95.36980288488812!3d29.758938781989635!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8640c1a7d653a92b%3A0x6b4f7a7d4a0b3e5b!2sHouston%2C%20TX!5e0!3m2!1sen!2sus!4v1678901234567!5m2!1sen!2sus', // Example embed link
                region_google_form_url: 'https://docs.google.com/forms/d/e/1FAIpQLScqiwlrlx4n8WhK8VokVF-XGWXBbDhmLkgpZSeunbHy52dFHQ/viewform', // Example form URL
                region_fng_form_url: 'https://docs.google.com/forms/d/e/1FAIpQLScqiwlrlx4n8WhK8VokVF-XGWXBbDhmLkgpZSeunbHy52dFHQ/viewform', // Example FNG form URL
            }, { status: 404 }); // Indicate that resource was not found, but providing a default
        } else {
            response = NextResponse.json(region, { status: 200 });
        }
        return setCorsHeaders(response);
    } catch (error: any) {
        console.error('Error in GET /api/region:', error);
        const response = NextResponse.json({ message: error.message || 'Internal Server Error during region fetch.' }, { status: 500 });
        return setCorsHeaders(response);
    }
}
