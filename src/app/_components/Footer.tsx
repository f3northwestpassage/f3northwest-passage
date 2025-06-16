'use client';

import Image from 'next/image';
import fb from '../../../public/fb.svg';
import instagram from '../../../public/instagram.svg';
import linkedin from '../../../public/linkedin.svg';
import xTwitter from '../../../public/x-twitter.svg'; // Assuming you have an icon for X/Twitter

// Define the props interface for the Footer component
interface FooterProps {
  regionName: string;
  regionFacebook: string;
  regionInstagram: string;
  regionLinkedin: string;
  regionXTwitter: string; // Add the new prop for X/Twitter
}

export default function Footer({ regionName, regionFacebook, regionInstagram, regionLinkedin, regionXTwitter }: FooterProps) {
  return (
    <footer className="text-center py-10 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
      <address className="not-italic text-lg mb-4">
        &copy; {new Date().getFullYear()} | {regionName} | All Rights Reserved | Powered by the PAX
      </address>
      <nav>
        <ul className="flex justify-center space-x-6 mt-4">
          {/* Facebook Link */}
          <li>
            <a href={regionFacebook} target="_blank" rel="noopener noreferrer" className="inline-block hover:opacity-80 transition-opacity duration-200">
              <Image
                src={fb}
                alt="Facebook"
                width={35}
                height={35}
                className="my-0 mx-auto"
              />
            </a>
          </li>

          {/* Instagram Link */}
          {regionInstagram && (
            <li>
              <a href={regionInstagram} target="_blank" rel="noopener noreferrer" className="inline-block hover:opacity-80 transition-opacity duration-200">
                <Image
                  src={instagram}
                  alt="Instagram"
                  width={35}
                  height={35}
                  className="my-0 mx-auto"
                />
              </a>
            </li>
          )}

          {/* LinkedIn Link */}
          {regionLinkedin && (
            <li>
              <a href={regionLinkedin} target="_blank" rel="noopener noreferrer" className="inline-block hover:opacity-80 transition-opacity duration-200">
                <Image
                  src={linkedin}
                  alt="LinkedIn"
                  width={35}
                  height={35}
                  className="my-0 mx-auto"
                />
              </a>
            </li>
          )}

          {/* X/Twitter Link (conditionally displayed) */}
          {regionXTwitter && ( // Only render if regionXTwitter is not an empty string
            <li>
              <a href={regionXTwitter} target="_blank" rel="noopener noreferrer" className="inline-block hover:opacity-80 transition-opacity duration-200">
                <Image
                  src={xTwitter} // Use your X/Twitter icon path
                  alt="X/Twitter"
                  width={35}
                  height={35}
                  className="my-0 mx-auto"
                />
              </a>
            </li>
          )}
        </ul>
      </nav>
    </footer>
  );
}
