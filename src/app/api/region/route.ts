import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import F3RegionModel from '@/models/F3Region';
import mongoose from 'mongoose';

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

// --- PUT: Update or Insert Region Config (Protected) ---
export async function PUT(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const password = searchParams.get('pw');

        if (!password || password !== ADMIN_PASSWORD) {
            console.warn('Unauthorized PUT /api/region attempt');
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const body = await request.json();
        console.log('Received body for region update:', body);

        const existing = await F3RegionModel.findOne().exec();

        if (existing) {
            await F3RegionModel.updateOne({ _id: existing._id }, { $set: body });
            return NextResponse.json({ message: 'Region configuration updated successfully' }, { status: 200 });
        } else {
            const created = await F3RegionModel.create(body);
            return NextResponse.json({ id: (created._id as mongoose.Types.ObjectId).toString() });
        }
    } catch (error: any) {
        console.error('Error in PUT /api/region:', error);
        return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

// --- GET: Fetch Region Config or Fallback to Mock (Public) ---
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const region = await F3RegionModel.findOne().lean().exec();

        if (!region) {
            console.warn('No region found, returning mock region');
            return NextResponse.json({
                _id: 'mock-id',
                region_name: 'Mock Region',
                meta_description: 'This is a mock region.',
                hero_title: 'Mock Hero Title',
                hero_subtitle: 'Mock Hero Subtitle',
                region_city: 'Mockville',
                region_state: 'MS',
                region_facebook: '#',
                region_instagram: '',
                region_linkedin: '',
                region_x_twitter: '',
                region_map_lat: 30.0,
                region_map_lon: -90.0,
                region_map_zoom: 10,
                region_map_embed_link: '',
            });
        }

        return NextResponse.json(region, { status: 200 });
    } catch (error: any) {
        console.error('Error in GET /api/region:', error);
        return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
