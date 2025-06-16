'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import fb from '../../../public/fb.svg';
import { fetchLocaleData } from '@/utils/fetchLocaleData';
import { LocaleData } from '../../../types/locale';

interface FooterLocaleData {
  region_name: string;
  region_facebook: string;
}

const defaultLocales: FooterLocaleData = {
  region_name: 'F3 Region',
  region_facebook: '#',
};

export default function Footer() {
  const [locales, setLocales] = useState<FooterLocaleData>(defaultLocales);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchLocaleData();

        if (data && isMounted) {
          const { region_name, region_facebook } = data;

          setLocales({
            region_name: region_name || defaultLocales.region_name,
            region_facebook: region_facebook || defaultLocales.region_facebook,
          });
        }
      } catch (err) {
        console.error('Failed to fetch footer locale data:', err);
        if (isMounted) {
          setLocales(defaultLocales);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <footer className="text-center py-10 px-4">
        <p>Loading footer...</p>
      </footer>
    );
  }

  return (
    <footer className="text-center py-10 px-4">
      <address>
        &copy; {new Date().getFullYear()} | {locales.region_name} | All Rights Reserved | Powered by the PAX
      </address>
      <nav>
        <ul>
          <li>
            <a href={locales.region_facebook} target="_blank" rel="noopener noreferrer">
              <Image
                src={fb}
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
