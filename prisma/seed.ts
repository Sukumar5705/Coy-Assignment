import { PrismaClient } from "@prisma/client";
import { encodeInterests } from "../src/lib/interests";

const prisma = new PrismaClient();

interface SeedProfile {
  name: string;
  age: number;
  bio: string;
  location: string;
  interests: string[];
  /** True if this profile already likes the demo user (internal, never exposed). */
  likesYou: boolean;
}

const PROFILES: SeedProfile[] = [
  { name: "Arjun", age: 22, bio: "Building products, exploring tech.", location: "Hyderabad · MGIT", interests: ["Technology", "Travel", "Music"], likesYou: true },
  { name: "Ananya", age: 21, bio: "Bookworm with a weakness for filter coffee.", location: "Bengaluru · RV College", interests: ["Reading", "Coffee", "Photography"], likesYou: false },
  { name: "Rohan", age: 23, bio: "Weekend trekker, weekday spreadsheet nerd.", location: "Pune · COEP", interests: ["Trekking", "Finance", "Cricket", "Podcasts"], likesYou: true },
  { name: "Meera", age: 20, bio: "Classical dancer who also loves lo-fi beats.", location: "Chennai · SRM", interests: ["Dance", "Music", "Art"], likesYou: false },
  { name: "Karthik", age: 24, bio: "Guitar in one hand, debugger in the other.", location: "Hyderabad · IIIT-H", interests: ["Guitar", "Open Source", "Gaming"], likesYou: false },
  { name: "Priya", age: 22, bio: "Foodie on a mission to find the best biryani.", location: "Hyderabad · Osmania University", interests: ["Food", "Travel", "Cooking", "Vlogging"], likesYou: true },
  { name: "Aditya", age: 25, bio: "Startup intern, part-time chess hustler.", location: "Mumbai · NMIMS", interests: ["Chess", "Startups", "Running"], likesYou: false },
  { name: "Sneha", age: 21, bio: "Sketchbook always in my bag.", location: "Delhi · Miranda House", interests: ["Drawing", "Cinema", "Poetry"], likesYou: true },
  { name: "Vikram", age: 23, bio: "Gym by morning, gigs by night.", location: "Bengaluru · PES University", interests: ["Fitness", "Live Music", "Cars"], likesYou: false },
  { name: "Diya", age: 20, bio: "Psychology major who overthinks playlists.", location: "Kolkata · Presidency University", interests: ["Psychology", "Music", "Journaling"], likesYou: false },
  { name: "Siddharth", age: 24, bio: "Film buff, aspiring screenwriter.", location: "Mumbai · St. Xavier's", interests: ["Cinema", "Writing", "Theatre", "Coffee"], likesYou: true },
  { name: "Isha", age: 22, bio: "Marathon runner and amateur baker.", location: "Pune · Symbiosis", interests: ["Running", "Baking", "Wellness"], likesYou: false },
  { name: "Nikhil", age: 26, bio: "Data engineer who plays tabla on weekends.", location: "Hyderabad · ISB", interests: ["Data", "Tabla", "Hiking"], likesYou: false },
  { name: "Kavya", age: 21, bio: "Plant parent and sunrise chaser.", location: "Mysuru · JSS", interests: ["Plants", "Photography", "Yoga"], likesYou: true },
  { name: "Rahul", age: 23, bio: "Football fanatic, FIFA champion in my hostel.", location: "Delhi · DTU", interests: ["Football", "Gaming", "Memes"], likesYou: false },
  { name: "Tanvi", age: 20, bio: "Fashion design student with thrift-store obsession.", location: "Mumbai · NIFT", interests: ["Fashion", "Thrifting", "Art", "Travel"], likesYou: false },
  { name: "Aarav", age: 22, bio: "Robotics club lead who still believes in sunsets.", location: "Chennai · IIT Madras", interests: ["Robotics", "Astronomy", "Cycling"], likesYou: true },
  { name: "Riya", age: 24, bio: "Law student, debate champion, dog person.", location: "Bengaluru · NLSIU", interests: ["Debate", "Dogs", "Reading"], likesYou: false },
  { name: "Manish", age: 25, bio: "Stand-up open mic regular. Come heckle me.", location: "Delhi · Hansraj College", interests: ["Comedy", "Writing", "Street Food"], likesYou: false },
  { name: "Pooja", age: 21, bio: "Yoga teacher in training, chai evangelist.", location: "Rishikesh · Dev Sanskriti", interests: ["Yoga", "Chai", "Meditation"], likesYou: true },
  { name: "Harsh", age: 23, bio: "Product designer obsessed with tiny interactions.", location: "Ahmedabad · NID", interests: ["Design", "Typography", "Coffee", "Cycling"], likesYou: false },
  { name: "Nandini", age: 22, bio: "Marine biology nerd, scuba certified.", location: "Goa · Goa University", interests: ["Diving", "Oceans", "Travel"], likesYou: false },
  { name: "Yash", age: 24, bio: "Cricket commentator in my own head.", location: "Jaipur · MNIT", interests: ["Cricket", "Stats", "Road Trips"], likesYou: true },
  { name: "Shreya", age: 20, bio: "Indie music, bad puns, good company.", location: "Hyderabad · Mahindra University", interests: ["Indie Music", "Puns", "Cafes"], likesYou: false },
  { name: "Dev", age: 26, bio: "Climbing walls and the corporate ladder.", location: "Gurugram · IMT", interests: ["Climbing", "Consulting", "Podcasts"], likesYou: false },
  { name: "Lakshmi", age: 22, bio: "Carnatic vocalist with a soft spot for K-dramas.", location: "Chennai · Stella Maris", interests: ["Carnatic Music", "K-Dramas", "Cooking"], likesYou: true },
  { name: "Omkar", age: 23, bio: "Amateur astrophotographer chasing dark skies.", location: "Pune · IISER", interests: ["Astrophotography", "Physics", "Trekking"], likesYou: false },
  { name: "Zoya", age: 21, bio: "Journalism student, collector of vintage postcards.", location: "Delhi · Jamia Millia Islamia", interests: ["Journalism", "Postcards", "Cinema", "Poetry"], likesYou: false },
  { name: "Tarun", age: 25, bio: "Barista turned backend dev. Still makes great lattes.", location: "Bengaluru · BITS Hyderabad Alumni", interests: ["Coffee", "Backend", "Board Games"], likesYou: false },
  { name: "Bhavna", age: 22, bio: "Board games, bubble tea, and late-night walks.", location: "Hyderabad · University of Hyderabad", interests: ["Board Games", "Bubble Tea", "Walking"], likesYou: true },
  { name: "Aman", age: 24, bio: "Cyclist exploring every lane of the city.", location: "Kochi · CUSAT", interests: ["Cycling", "Street Photography", "Seafood"], likesYou: false },
];

function photoFor(index: number): string {
  // Deterministic placeholder avatars (pravatar supports ids 1-70).
  return `https://i.pravatar.cc/600?img=${(index % 70) + 1}`;
}

async function main() {
  // Idempotent: stable ids + upsert. Never deletes profiles or swipes, so re-running
  // the seed cannot erase an existing user's data or create duplicates.
  // Sequential writes keep createdAt ordering stable, so the feed order is deterministic.
  for (const [index, p] of PROFILES.entries()) {
    const id = `profile_${String(index + 1).padStart(3, "0")}`;
    const data = {
      name: p.name,
      age: p.age,
      photo: photoFor(index),
      bio: p.bio,
      location: p.location,
      interests: encodeInterests(p.interests),
      hasLikedUser: p.likesYou,
    };
    await prisma.profile.upsert({ where: { id }, update: data, create: { id, ...data } });
  }

  const total = await prisma.profile.count();
  const likers = await prisma.profile.count({ where: { hasLikedUser: true } });
  console.log(`Seeded ${total} profiles (${likers} already like the demo user).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
