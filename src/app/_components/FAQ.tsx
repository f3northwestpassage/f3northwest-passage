interface FAQProps {
  city?: string;
  regionName?: string;
}

export default function FAQ({ city = 'Cypress and Houston', regionName = 'F3 Northwest Passage' }: FAQProps) {
  const faqs = [
    {
      question: `Are the workouts in ${city} really free?`,
      answer: `Yes! All ${regionName} workouts are 100% free. There are no membership fees, no sign-up costs, and no hidden charges. Just show up and work out with us.`,
    },
    {
      question: `Where do you hold outdoor workouts in ${city}?`,
      answer: `We hold free outdoor workouts at multiple locations across ${city} and Northwest Houston, including parks and public spaces. Check our workout locations page to find the nearest workout spot.`,
    },
    {
      question: 'What types of workouts do you offer?',
      answer: 'We offer a variety of outdoor fitness workouts including bootcamp-style training, running clubs, strength training, and high-intensity interval training (HIIT). Our Cypress and Houston fitness groups provide peer-led workouts adaptable to any fitness level.',
    },
    {
      question: 'Do I need experience to join the men\'s workouts?',
      answer: 'No experience needed! Our free workouts welcome men of all fitness levels, from beginners to advanced athletes. Modify exercises as needed and work at your own pace.',
    },
    {
      question: `When do the ${city} workouts happen?`,
      answer: 'We meet for outdoor workouts Monday through Saturday mornings. Weekday workouts are typically 45 minutes starting around 5:30 AM, and Saturday workouts are 60 minutes. Check specific location times on our workout schedule.',
    },
    {
      question: 'What should I bring to my first workout?',
      answer: 'Just bring yourself, workout clothes, water, and a positive attitude. We recommend gloves for some exercises. All workouts are held rain or shine, so dress appropriately for the weather.',
    },
    {
      question: `Is F3 Northwest only in ${city}?`,
      answer: `F3 Northwest Passage serves ${city}, Cypress, Northwest Houston, and surrounding areas in Texas. We\'re the premier free fitness group in the Houston area and part of F3 Nation, a nationwide network of free men\'s workout groups.`,
    },
    {
      question: 'How is F3 Northwest different from other Cypress or Houston run clubs?',
      answer: 'While run clubs focus mainly on running, F3 Northwest Passage is a complete fitness program. We combine running, boot camp workouts, strength training, and functional fitness. Plus, we emphasize fellowship and community leadership - not just physical fitness. And unlike paid fitness groups, we\'re 100% free.',
    },
    {
      question: 'Why are the workouts only for men?',
      answer: 'F3 focuses on building authentic male community and leadership. We believe men need a dedicated space to support each other in fitness, fellowship, and faith. (F3 stands for Fitness, Fellowship, and Faith.)',
    },
  ];

  return (
    <section className="bg-gray-100 dark:bg-gray-800 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-10 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {faq.question}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
