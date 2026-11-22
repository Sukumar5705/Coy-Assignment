
import { PrismaClient } from "@prisma/client";
import { encodeInterests } from "../src/lib/interests";

const prisma = new PrismaClient();

type SeedGender = "male" | "female";

interface SeedProfile {
  name: string;
  age: number;
  gender: SeedGender;
  bio: string;
  location: string;
  interests: string[];
  /** Internal demo property: whether this profile already likes the demo user. */
  likesYou: boolean;
}

/**
 * Curated Pexels photo IDs.
 * Male profiles receive male portraits.
 * Female profiles receive female portraits.
 *
 * Each profile gets a different, deterministic image.
 */
const PHOTO_IDS: Record<SeedGender, number[]> = {
  male: [
    33261969,
    7276141,
    35542192,
    16157080,
    18848085,
    8663574,
    17153392,
    11772165,
    10005578,
    7828828,
    18548585,
    16671612,
    12596735,
    14037245,
    20244051,
    31623365,
  ],
  female: [
    15602469,
    38796372,
    37319355,
    26970914,
    19877827,
    27254849,
    37470684,
    40815450,
    34602398,
    34719537,
    30641142,
    13685232,
    16499147,
    5402550,
    20541488,
  ],
};

const PROFILES: SeedProfile[] = [
  {
    name: "Arjun",
    age: 22,
    gender: "male",
    bio: "Building products, exploring tech.",
    location: "Hyderabad · MGIT",
    interests: ["Technology", "Travel", "Music"],
    likesYou: true,
  },
  {
    name: "Ananya",
    age: 21,
    gender: "female",
    bio: "Bookworm with a weakness for filter coffee.",
    location: "Bengaluru · RV College",
    interests: ["Reading", "Coffee", "Photography"],
    likesYou: false,
  },
  {
    name: "Rohan",
    age: 23,
    gender: "male",
    bio: "Weekend trekker, weekday spreadsheet nerd.",
    location: "Pune · COEP",
    interests: ["Trekking", "Finance", "Cricket", "Podcasts"],
    likesYou: true,
  },
  {
    name: "Meera",
    age: 20,
    gender: "female",
    bio: "Classical dancer who also loves lo-fi beats.",
    location: "Chennai · SRM",
    interests: ["Dance", "Music", "Art"],
    likesYou: false,
  },
  {
    name: "Karthik",
    age: 24,
    gender: "male",
    bio: "Guitar in one hand, debugger in the other.",
    location: "Hyderabad · IIIT-H",
    interests: ["Guitar", "Open Source", "Gaming"],
    likesYou: false,
  },
  {
    name: "Priya",
    age: 22,
    gender: "female",
    bio: "Foodie on a mission to find the best biryani.",
    location: "Hyderabad · Osmania University",
    interests: ["Food", "Travel", "Cooking", "Vlogging"],
    likesYou: true,
  },
  {
    name: "Aditya",
    age: 25,
    gender: "male",
    bio: "Startup intern, part-time chess hustler.",
    location: "Mumbai · NMIMS",
    interests: ["Chess", "Startups", "Running"],
    likesYou: false,
  },
  {
    name: "Sneha",
    age: 21,
    gender: "female",
    bio: "Sketchbook always in my bag.",
    location: "Delhi · Miranda House",
    interests: ["Drawing", "Cinema", "Poetry"],
    likesYou: true,
  },
  {
    name: "Vikram",
    age: 23,
    gender: "male",
    bio: "Gym by morning, gigs by night.",
    location: "Bengaluru · PES University",
    interests: ["Fitness", "Live Music", "Cars"],
    likesYou: false,
  },
  {
    name: "Diya",
    age: 20,
    gender: "female",
    bio: "Psychology major who overthinks playlists.",
    location: "Kolkata · Presidency University",
    interests: ["Psychology", "Music", "Journaling"],
    likesYou: false,
  },
  {
    name: "Siddharth",
    age: 24,
    gender: "male",
    bio: "Film buff, aspiring screenwriter.",
    location: "Mumbai · St. Xavier's",
    interests: ["Cinema", "Writing", "Theatre", "Coffee"],
    likesYou: true,
  },
  {
    name: "Isha",
    age: 22,
    gender: "female",
    bio: "Marathon runner and amateur baker.",
    location: "Pune · Symbiosis",
    interests: ["Running", "Baking", "Wellness"],
    likesYou: false,
  },
  {
    name: "Nikhil",
    age: 26,
    gender: "male",
    bio: "Data engineer who plays tabla on weekends.",
    location: "Hyderabad · ISB",
    interests: ["Data", "Tabla", "Hiking"],
    likesYou: false,
  },
  {
    name: "Kavya",
    age: 21,
    gender: "female",
    bio: "Plant parent and sunrise chaser.",
    location: "Mysuru · JSS",
    interests: ["Plants", "Photography", "Yoga"],
    likesYou: true,
  },
  {
    name: "Rahul",
    age: 23,
    gender: "male",
    bio: "Football fanatic, FIFA champion in my hostel.",
    location: "Delhi · DTU",
    interests: ["Football", "Gaming", "Memes"],
    likesYou: false,
  },
  {
    name: "Tanvi",
    age: 20,
    gender: "female",
    bio: "Fashion design student with thrift-store obsession.",
    location: "Mumbai · NIFT",
    interests: ["Fashion", "Thrifting", "Art", "Travel"],
    likesYou: false,
  },
  {
    name: "Aarav",
    age: 22,
    gender: "male",
    bio: "Robotics club lead who still believes in sunsets.",
    location: "Chennai · IIT Madras",
    interests: ["Robotics", "Astronomy", "Cycling"],
    likesYou: true,
  },
  {
    name: "Riya",
    age: 24,
    gender: "female",
    bio: "Law student, debate champion, dog person.",
    location: "Bengaluru · NLSIU",
    interests: ["Debate", "Dogs", "Reading"],
    likesYou: false,
  },
  {
    name: "Manish",
    age: 25,
    gender: "male",
    bio: "Stand-up open mic regular. Come heckle me.",
    location: "Delhi · Hansraj College",
    interests: ["Comedy", "Writing", "Street Food"],
    likesYou: false,
  },
  {
    name: "Pooja",
    age: 21,
    gender: "female",
    bio: "Yoga teacher in training, chai evangelist.",
    location: "Rishikesh · Dev Sanskriti",
    interests: ["Yoga", "Chai", "Meditation"],
    likesYou: true,
  },
  {
    name: "Harsh",
    age: 23,
    gender: "male",
    bio: "Product designer obsessed with tiny interactions.",
    location: "Ahmedabad · NID",
    interests: ["Design", "Typography", "Coffee", "Cycling"],
    likesYou: false,
  },
  {
    name: "Nandini",
    age: 22,
    gender: "female",
    bio: "Marine biology nerd, scuba certified.",
    location: "Goa · Goa University",
    interests: ["Diving", "Oceans", "Travel"],
    likesYou: false,
  },
  {
    name: "Yash",
    age: 24,
    gender: "male",
    bio: "Cricket commentator in my own head.",
    location: "Jaipur · MNIT",
    interests: ["Cricket", "Stats", "Road Trips"],
    likesYou: true,
  },
  {
    name: "Shreya",
    age: 20,
    gender: "female",
    bio: "Indie music, bad puns, good company.",
    location: "Hyderabad · Mahindra University",
    interests: ["Indie Music", "Puns", "Cafes"],
    likesYou: false,
  },
  {
    name: "Dev",
    age: 26,
    gender: "male",
    bio: "Climbing walls and the corporate ladder.",
    location: "Gurugram · IMT",
    interests: ["Climbing", "Consulting", "Podcasts"],
    likesYou: false,
  },
  {
    name: "Lakshmi",
    age: 22,
    gender: "female",
    bio: "Carnatic vocalist with a soft spot for K-dramas.",
    location: "Chennai · Stella Maris",
    interests: ["Carnatic Music", "K-Dramas", "Cooking"],
    likesYou: true,
  },
  {
    name: "Omkar",
    age: 23,
    gender: "male",
    bio: "Amateur astrophotographer chasing dark skies.",
    location: "Pune · IISER",
    interests: ["Astrophotography", "Physics", "Trekking"],
    likesYou: false,
  },
  {
    name: "Zoya",
    age: 21,
    gender: "female",
    bio: "Journalism student, collector of vintage postcards.",
    location: "Delhi · Jamia Millia Islamia",
    interests: ["Journalism", "Postcards", "Cinema", "Poetry"],
    likesYou: false,
  },
  {
    name: "Tarun",
    age: 25,
    gender: "male",
    bio: "Barista turned backend dev. Still makes great lattes.",
    location: "Bengaluru · BMS College of Engineering",
    interests: ["Coffee", "Backend", "Board Games"],
    likesYou: false,
  },
  {
    name: "Bhavna",
    age: 22,
    gender: "female",
    bio: "Board games, bubble tea, and late-night walks.",
    location: "Hyderabad · University of Hyderabad",
    interests: ["Board Games", "Bubble Tea", "Walking"],
    likesYou: true,
  },
  {
    name: "Aman",
    age: 24,
    gender: "male",
    bio: "Cyclist exploring every lane of the city.",
    location: "Kochi · CUSAT",
    interests: ["Cycling", "Street Photography", "Seafood"],
    likesYou: false,
  },
];

/**
 * Generate a stable Pexels CDN photo URL.
 */
function photoFor(gender: SeedGender, index: number): string {
  const gallery = PHOTO_IDS[gender];
  const photoId = gallery[index];

  if (!photoId) {
    throw new Error(
      `Missing ${gender} photo for profile index ${index}.`
    );
  }

  return `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&w=800`;
}

/**
 * Validate seed data before touching the database.
 */
function validateProfiles(): void {
  const names = new Set<string>();

  for (const profile of PROFILES) {
    if (profile.age < 18 || profile.age > 100) {
      throw new Error(`Invalid age for ${profile.name}: ${profile.age}`);
    }

    if (names.has(profile.name)) {
      throw new Error(`Duplicate profile name: ${profile.name}`);
    }

    names.add(profile.name);
  }

  for (const gender of ["male", "female"] as const) {
    const required = PROFILES.filter(
      (profile) => profile.gender === gender
    ).length;

    const available = PHOTO_IDS[gender].length;

    if (required > available) {
      throw new Error(
        `Not enough ${gender} photos. Required: ${required}, available: ${available}`
      );
    }
  }
}

async function main(): Promise<void> {
  validateProfiles();

  const photoIndexes: Record<SeedGender, number> = {
    male: 0,
    female: 0,
  };

  // Sequential upserts preserve the original deterministic seed behavior.
  // Existing profiles and user swipe data are never deleted.
  for (const profile of PROFILES) {
    const id = `profile_${String(PROFILES.indexOf(profile) + 1).padStart(3, "0")}`;

    const photoIndex = photoIndexes[profile.gender]++;

    const data = {
      name: profile.name,
      age: profile.age,
      photo: photoFor(profile.gender, photoIndex),
      bio: profile.bio,
      location: profile.location,
      interests: encodeInterests(profile.interests),
      hasLikedUser: profile.likesYou,
    };

    await prisma.profile.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });
  }

  const total = await prisma.profile.count();

  const likers = await prisma.profile.count({
    where: { hasLikedUser: true },
  });

  console.log("==================================");
  console.log("       COY DISCOVER SEED");
  console.log("==================================");
  console.log(`Total profiles : ${total}`);
  console.log(`Male profiles  : ${photoIndexes.male}`);
  console.log(`Female profiles: ${photoIndexes.female}`);
  console.log(`Already like you: ${likers}`);
  console.log("==================================");
  console.log("Profile seeding completed!");
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
