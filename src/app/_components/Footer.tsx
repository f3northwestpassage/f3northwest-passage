'use client';

import Image from 'next/image';
import fb from '../../../public/fb.svg';
import instagram from '../../../public/instagram.svg';
import linkedin from '../../../public/linkedin.svg';
import xTwitter from '../../../public/x-twitter.svg';

interface FooterProps {
  regionName: string;
  regionFacebook?: string;
  regionInstagram?: string;
  regionLinkedin?: string;
  regionXTwitter?: string;
}

export default function Footer({
  regionName,
  regionFacebook,
  regionInstagram,
  regionLinkedin,
  regionXTwitter,
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="text-center py-10 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
      <address className="not-italic text-lg mb-4">
        &copy; {currentYear} | {regionName} | All Rights Reserved | Powered by the PAX
      </address>

      <nav aria-label="Social Media Links">
        <ul className="flex justify-center space-x-6 mt-4">
          {regionFacebook && (
            <li>
              <a
                href={regionFacebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="hover:opacity-80 transition-opacity duration-200"
              >
                <Image src={fb} alt="Facebook" width={35} height={35} />
              </a>
            </li>
          )}
          {regionInstagram && (
            <li>
              <a
                href={regionInstagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="hover:opacity-80 transition-opacity duration-200"
              >
                <Image src={instagram} alt="Instagram" width={35} height={35} />
              </a>
            </li>
          )}
          {regionLinkedin && (
            <li>
              <a
                href={regionLinkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="hover:opacity-80 transition-opacity duration-200"
              >
                <Image src={linkedin} alt="LinkedIn" width={35} height={35} />
              </a>
            </li>
          )}
          {regionXTwitter && (
            <li>
              <a
                href={regionXTwitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X/Twitter"
                className="hover:opacity-80 transition-opacity duration-200"
              >
                <Image src={xTwitter} alt="X/Twitter" width={35} height={35} />
              </a>
            </li>
          )}
        </ul>
      </nav>
    </footer>
  );
}
