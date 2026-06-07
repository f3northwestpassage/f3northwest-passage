'use client';

export default function ContactForm({ embedUrl }: { embedUrl: string | null }) {
  if (!embedUrl) {
    return (
      <div
        className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded dark:bg-yellow-800 dark:border-yellow-600 dark:text-yellow-100"
        role="alert"
      >
        <p className="font-bold">Form Unavailable:</p>
        <p className="text-sm">
          The contact form URL is not configured by the admin or is invalid.
        </p>
      </div>
    );
  }

  return (
    <iframe
      src={embedUrl}
      frameBorder="0"
      className="w-full min-h-[600px] md:min-h-[700px] lg:min-h-[800px] rounded-lg shadow-md"
      title="Google Contact Form"
      allowFullScreen
    >
      Loading Google Form...
    </iframe>
  );
}
