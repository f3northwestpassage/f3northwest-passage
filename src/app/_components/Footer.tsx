'use client'; // Add this

import Image from 'next/image';
import { useState, useEffect } from 'react'; // Add useState, useEffect
import fb from '../../../public/fb.svg';
import { fetchLocaleData } from '@/utils/fetchLocaleData'; // fetchLocaleData is async

// Define an interface for the structure of locales, including a default state
interface FooterLocaleData {
  region_name: string;
  region_facebook: string;
}

const defaultLocales: FooterLocaleData = {
  region_name: "F3 Region", // Placeholder
  region_facebook: "#",      // Placeholder
};

export default function Footer() { // Remove async
  const [locales, setLocales] = useState<FooterLocaleData>(defaultLocales);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // fetchLocaleData returns more than just region_name and region_facebook
        // but we only need these for the footer.
        // Ensure the full type from fetchLocaleData is compatible or cast/map appropriately.
        // For simplicity, let's assume fetchLocaleData's return type is compatible enough
        // or that we can extract what we need.
        const fetchedData = await fetchLocaleData();
        // Update only the properties needed if fetchedData is larger
        setLocales({
            region_name: fetchedData.region_name || defaultLocales.region_name,
            region_facebook: fetchedData.region_facebook || defaultLocales.region_facebook,
        });
      } catch (error) {
        console.error("Failed to fetch locale data for footer:", error);
        // Keep defaultLocales on error
        setLocales(defaultLocales);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []); // Empty dependency array, runs once on mount

  if (isLoading) {
    // Optional: render a minimal loading state for the footer
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
                src={fb.src} // Assuming fb.src is correct
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
