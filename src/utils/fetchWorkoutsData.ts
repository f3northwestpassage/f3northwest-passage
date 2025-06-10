interface Workout {
  ao: string;
  style: string;
  location: {
    href: string;
    text: string;
  };
  day: string;
  time: string;
}

const placeholderWorkouts: Workout[] = [
  {
    ao: "The Iron Yard",
    style: "Bootcamp",
    location: {
      href: "https://maps.app.goo.gl/placeholder1",
      text: "Community Park",
    },
    day: "Monday",
    time: "05:30",
  },
  {
    ao: "Valhalla",
    style: "Kettlebells",
    location: {
      href: "https://maps.app.goo.gl/placeholder2",
      text: "High School Track",
    },
    day: "Wednesday",
    time: "06:00",
  },
  {
    ao: "The Forge",
    style: "Ruck",
    location: {
      href: "https://maps.app.goo.gl/placeholder3",
      text: "Nature Trail Entrance",
    },
    day: "Friday",
    time: "05:15",
  },
];

export function fetchWorkoutsData(): Workout[] {
  return placeholderWorkouts;
}