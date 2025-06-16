"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import fb from '../../../public/fb.svg';
// Make sure this path is correct and fetchLocaleData actually returns LocaleData or null
import { fetchLocaleData } from '@/utils/fetchLocaleData'; // Import LocaleData if it's defined there, or from '../../types/locale'
import { LocaleData } from '../../../types/locale';

// Define an interface for the structure of locales, including a default state
interface FooterLocaleData {
  region_name: string;
  region_facebook: string;
  // If your LocaleData has pax_count, but FooterLocaleData does not,
  // ensure the extraction below handles this.
}

const defaultLocales: FooterLocaleData = {
  region_name: "F3 Region", // Placeholder
  region_facebook: "#",      // Placeholder
};

export default function Footer() {
  const [locales, setLocales] = useState<FooterLocaleData>(defaultLocales);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const fetchedData: LocaleData | null = await fetchLocaleData(); // Explicitly type fetchedData here

        if (fetchedData) {
          setLocales({
            region_name: fetchedData.region_name || defaultLocales.region_name,
            region_facebook: fetchedData.region_facebook || defaultLocales.region_facebook,
            // Only assign properties that are part of FooterLocaleData
            // If LocaleData has more fields (like pax_count, meta_description, etc.)
            // and FooterLocaleData does not, this mapping is crucial.
          });
        } else {
          // If fetchedData is null (e.g., no region config in DB), use defaults
          setLocales(defaultLocales);
        }
      } catch (error) {
        console.error("Failed to fetch locale data for footer:", error);
        setLocales(defaultLocales); // Keep defaultLocales on error
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []); // Empty dependency array, runs once on mount

  if (isLoading) {
    return <footer className="text-center py-10 px-4"><p>Loading footer...</p></footer>;
  }

  return (
    <footer className="text-center py-10 px-4">
      <address>
        &copy; Copyright {new Date().getFullYear()} | {locales.region_name} | All Rights
        Reserved | Powered by the PAX
      </address>
      <nav>
        <ul>
          <li>
            <a href={locales.region_facebook} target="_blank" rel="noopener noreferrer">
              <Image
                src={fb.src}
                alt="Facebook"
                width={35}
                height={35}
                className="my-0 mx-auto mt-5"
              />
            </a>
          </li>
        </ul>
      </nav>
    </footer>
  );
}
