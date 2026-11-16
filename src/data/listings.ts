import type { Listing } from "@/types/listing";

const HOUR = 60 * 60 * 1000;
const hoursAgo = (hours: number) =>
  new Date(Date.now() - hours * HOUR).toISOString();

const photo = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

export const listings: Listing[] = [
  {
    id: "1001",
    title: "iPhone 14 Pro 256GB – Space Black",
    description:
      "Unlocked and works on all major carriers. Battery health is 91%. Always used with a case and screen protector, so there are no scratches on the screen or frame. Includes the original box, a USB-C to Lightning cable and a clear case.",
    price: 780,
    category: "Electronics",
    seller_email: "maya.chen@example.com",
    image_url: photo("photo-1511707171634-5f897ff02aa9"),
    location: "Portland, OR",
    created_at: hoursAgo(3),
  },
  {
    id: "1002",
    title: 'MacBook Air 13" M2, 16GB RAM / 512GB',
    description:
      "Bought in 2023 and used mainly for coursework. Runs perfectly and has 112 battery cycles. Comes with the original charger. Factory reset and ready for a new owner. Pickup only, happy to meet at a public place.",
    price: 950,
    category: "Electronics",
    seller_email: "daniel.ortiz@example.com",
    image_url: photo("photo-1496181133206-80ce9b88a853"),
    images: [
      photo("photo-1496181133206-80ce9b88a853"),
      photo("photo-1593642632823-8f785ba67e45"),
    ],
    location: "Seattle, WA",
    created_at: hoursAgo(7),
  },
  {
    id: "1003",
    title: "Sony WH-1000XM4 Noise-Canceling Headphones",
    description:
      "Excellent sound and the best noise cancellation I have used. Ear pads were replaced earlier this year. Includes the hard carrying case, charging cable and audio cable. Selling because I upgraded.",
    price: 175,
    category: "Electronics",
    seller_email: "priya.nair@example.com",
    image_url: photo("photo-1505740420928-5e560c06d30e"),
    location: "Austin, TX",
    created_at: hoursAgo(26),
  },
  {
    id: "1004",
    title: "Canon EOS Rebel T7 with 18–55mm Lens",
    description:
      "A great first DSLR. Shutter count is around 6,000. Includes the kit lens, two batteries, a charger, a 32GB memory card and a padded camera bag. Lens and sensor are clean with no fungus or dust.",
    price: 320,
    category: "Electronics",
    seller_email: "tom.reyes@example.com",
    image_url: photo("photo-1516035069371-29a1b244cc32"),
    location: "Denver, CO",
    created_at: hoursAgo(52),
  },
  {
    id: "1005",
    title: "Mid-Century Three-Seat Fabric Sofa",
    description:
      "Comfortable grey sofa with solid wood legs. Measures 84 inches wide and 33 inches deep. Cushions are firm and the fabric has no stains or tears. From a smoke-free, pet-free home. Buyer must arrange pickup; it fits through standard doorways.",
    price: 540,
    category: "Furniture",
    seller_email: "hannah.lee@example.com",
    image_url: photo("photo-1555041469-a586c61ea9bc"),
    images: [
      photo("photo-1555041469-a586c61ea9bc"),
      photo("photo-1586023492125-27b2c045efd7"),
    ],
    location: "Chicago, IL",
    created_at: hoursAgo(10),
  },
  {
    id: "1006",
    title: "Solid Oak Writing Desk with Drawer",
    description:
      "Sturdy desk, 48 inches wide with one deep drawer. Light wear on the surface that adds character. Easily seats a monitor, laptop and desk lamp. Disassembles for transport.",
    price: 260,
    category: "Furniture",
    seller_email: "marcus.bell@example.com",
    image_url: photo("photo-1518455027359-f3f8164ba6bd"),
    location: "Minneapolis, MN",
    created_at: hoursAgo(78),
  },
  {
    id: "1007",
    title: "Brown Leather Jacket – Men's Medium",
    description:
      "Genuine leather jacket with a soft lining and four zip pockets. Worn only a handful of times. Fits true to size, with a 40 inch chest and 25 inch length. Cleaned and conditioned.",
    price: 85,
    category: "Clothing",
    seller_email: "jordan.walsh@example.com",
    image_url: photo("photo-1551028719-00167b16eac5"),
    location: "Brooklyn, NY",
    created_at: hoursAgo(30),
  },
  {
    id: "1008",
    title: "Women's Wool Crewneck Sweater – Size M",
    description:
      "Warm, soft merino wool blend in oatmeal. No pilling and no holes. Machine washable on a wool cycle. Relaxed fit, true to size.",
    price: 38,
    category: "Clothing",
    seller_email: "sofia.martin@example.com",
    image_url: photo("photo-1620799140408-edc6dcb6d633"),
    location: "San Diego, CA",
    created_at: hoursAgo(120),
  },
  {
    id: "1009",
    title: "Large Ceramic Planters – Set of Three",
    description:
      "Matte white planters with drainage holes and saucers. Sizes are 6, 8 and 10 inches. Great for herbs, succulents or a small indoor tree. No chips or cracks.",
    price: 45,
    category: "Home & Garden",
    seller_email: "elena.park@example.com",
    image_url: photo("photo-1485955900006-10f4d324d411"),
    location: "Portland, OR",
    created_at: hoursAgo(18),
  },
  {
    id: "1010",
    title: "Cordless Lawn Mower, 40V with Two Batteries",
    description:
      "Quiet and powerful, good for lawns up to a third of an acre. Includes two batteries and a fast charger. Folds flat for storage. Used for two summers and always stored indoors.",
    price: 190,
    category: "Home & Garden",
    seller_email: "greg.holmes@example.com",
    image_url: photo("photo-1558904541-efa843a96f01"),
    location: "Columbus, OH",
    created_at: hoursAgo(96),
  },
  {
    id: "1011",
    title: "Trek Hybrid Bike – 54cm Frame",
    description:
      "Lightweight aluminum hybrid, ideal for commuting and weekend rides. 21 speeds, recently tuned with new brake pads and a fresh chain. Includes a rear rack and a lock. Fits riders roughly 5'7\" to 5'11\".",
    price: 420,
    category: "Sports & Outdoors",
    seller_email: "aiden.brooks@example.com",
    image_url: photo("photo-1485965120184-e220f721d03e"),
    location: "Boulder, CO",
    created_at: hoursAgo(14),
  },
  {
    id: "1012",
    title: "Adjustable Dumbbell Set, 5–52 lb",
    description:
      "Pair of adjustable dumbbells with stands. Quick dial weight changes replace a whole rack. Used for one year, in very good condition. Heavy, so pickup only.",
    price: 230,
    category: "Sports & Outdoors",
    seller_email: "natalie.cruz@example.com",
    image_url: photo("photo-1517836357463-d25dfeac3438"),
    location: "Phoenix, AZ",
    created_at: hoursAgo(44),
  },
  {
    id: "1013",
    title: "2016 Honda Civic EX – 72,000 Miles",
    description:
      "One owner, clean title and full service records. Automatic transmission, backup camera, Apple CarPlay and a sunroof. New tires installed last year. Non-smoker. Happy for a pre-purchase inspection.",
    price: 12900,
    category: "Vehicles",
    seller_email: "robert.king@example.com",
    image_url: photo("photo-1503376780353-7e6692767b70"),
    location: "Nashville, TN",
    created_at: hoursAgo(60),
  },
  {
    id: "1014",
    title: "Vespa Primavera 150 Scooter",
    description:
      "Only 1,900 miles. Perfect for city commuting and easy to park. Recently serviced, with a new battery and fresh oil. Includes a helmet and a top case. Title in hand.",
    price: 3400,
    category: "Vehicles",
    seller_email: "lucia.romano@example.com",
    image_url: photo("photo-1558981806-ec527fa84c39"),
    location: "Miami, FL",
    created_at: hoursAgo(200),
  },
  {
    id: "1015",
    title: "Vintage Acoustic Guitar with Case",
    description:
      "Full-size dreadnought with a warm, rich tone. Solid spruce top and well-kept frets. Action was professionally set up last month. Includes a hard case and a strap.",
    price: 210,
    category: "Other",
    seller_email: "ben.turner@example.com",
    image_url: photo("photo-1510915361894-db8b60106cb1"),
    location: "Nashville, TN",
    created_at: hoursAgo(5),
  },
];
