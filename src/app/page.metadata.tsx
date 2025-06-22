import { fetchLocaleData } from '../utils/fetchLocaleData';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
    const localeData = await fetchLocaleData();

    return {
        title: localeData?.region_name,
        description: localeData?.meta_description,
    };
}
