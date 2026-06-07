import Header from '../_components/Header';
import Footer from '../_components/Footer';
import Hero from '../_components/Hero';
import ContactForm from './ContactForm';
import { fetchLocaleData } from '@/utils/fetchLocaleData';

import contactHeroImg from '../../../public/f3-darkhorse-2023-11-04.jpg';

export const revalidate = 300; // ISR: revalidate every 5 minutes

export default async function ContactPage() {
  const localeData = await fetchLocaleData();

  const googleFormEmbedUrl = localeData?.region_google_form_url
    ? localeData.region_google_form_url.replace(/\/viewform$/, '/embed')
    : null;

  const href = '/contact';

  return (
    <>
      <Header href={href} regionName={localeData?.region_name} />
      <main className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <Hero
          title="CONTACT US"
          subtitle="We'd love to hear from you."
          imgUrl={contactHeroImg.src}
          imgAlt="People shaking hands"
        />

        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 text-center">
            Send us a message
          </h2>
          <p className="text-center text-gray-700 dark:text-gray-300 mb-8">
            Fill out the form below and {`we'll`} get back to you as soon as
            possible.
          </p>
          <ContactForm embedUrl={googleFormEmbedUrl} />
        </section>
      </main>
      <Footer
        regionName={localeData?.region_name ?? ''}
        regionFacebook={localeData?.region_facebook ?? ''}
        regionInstagram={localeData?.region_instagram ?? ''}
        regionLinkedin={localeData?.region_linkedin ?? ''}
        regionXTwitter={localeData?.region_x_twitter ?? ''}
      />
    </>
  );
}
