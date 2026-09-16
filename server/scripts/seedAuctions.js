import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import mongoose from "mongoose";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import { connectDB, disconnectDB } from "../config/db.config.js";
import { generateTextEmbedding } from "../services/gemini.service.js";

const SEED_AUCTIONS = [
  // --- Electronics ---
  {
    itemName: 'Sony Alpha A7 IV Full-Frame Mirrorless Camera with 28-70mm Lens',
    itemCategory: 'Electronics',
    startingPrice: 145000,
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80',
    itemDescription: 'Professional 33MP full-frame Exmor R CMOS sensor camera, capable of 4K 60p 10-bit recording. Barely used with less than 2,500 shutter actuations. Comes in original packaging with strap, battery, charger, and warranty documentation.',
    hoursUntilEnd: 2.5, // Ending soon!
    bidCount: 7, // 🔥 Hot
  },
  {
    itemName: 'Apple MacBook Pro 16" (M3 Max, 36GB RAM, 1TB SSD) Space Black',
    itemCategory: 'Electronics',
    startingPrice: 210000,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80',
    itemDescription: 'Flagship workstation with 14-core CPU and 30-core GPU. Liquid Retina XDR display with pristine screen. Battery health is at 99%. Includes original MagSafe charger and black braided cable.',
    hoursUntilEnd: 72, // 3 days
    bidCount: 5, // 🔥 Hot
  },
  {
    itemName: 'DJI Mavic 3 Pro Cine Combo Drone with Hasselblad Triple-Camera',
    itemCategory: 'Electronics',
    startingPrice: 185000,
    imageUrl: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1000&q=80',
    itemDescription: 'Apple ProRes 422 HQ supported cine quadcopter with omnidirectional obstacle sensing and 43-minute flight time. Includes DJI RC Pro controller, 3 intelligent flight batteries, ND filter set, and rugged carrying case.',
    hoursUntilEnd: 120, // 5 days
    bidCount: 3,
  },

  // --- Antiques ---
  {
    itemName: '19th Century French Empire Ormolu Gilt Bronze Mantel Clock',
    itemCategory: 'Antiques',
    startingPrice: 65000,
    imageUrl: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=1000&q=80',
    itemDescription: 'Exquisite early 1800s French mantel clock featuring intricate classical mythological figures cast in heavy fire-gilded bronze. Features an 8-day bell striking movement, recently serviced and keeping accurate time. Includes original winding key.',
    hoursUntilEnd: 14, // Ending soon!
    bidCount: 6, // 🔥 Hot
  },
  {
    itemName: 'Victorian Brass Nautical Maritime Telescope on Mahogany Tripod',
    itemCategory: 'Antiques',
    startingPrice: 32000,
    imageUrl: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=1000&q=80',
    itemDescription: "Authentic mid-Victorian harbor master's brass telescope engraved with British Admiralty markings. Optics are clean and functional with clear magnification. Mounted on a hand-carved mahogany extension tripod with polished brass fittings.",
    hoursUntilEnd: 96, // 4 days
    bidCount: 2,
  },
  {
    itemName: 'Edwardian Solid Mahogany Slant-Front Bureau Writing Desk',
    itemCategory: 'Antiques',
    startingPrice: 48000,
    imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1000&q=80',
    itemDescription: 'Circa 1905 British Edwardian secretary desk featuring flame mahogany drawer fronts, hand-cut dovetail joints, secret interior compartments, and green tooled leather writing surface with gilded borders.',
    hoursUntilEnd: 168, // 7 days
    bidCount: 1,
  },

  // --- Art ---
  {
    itemName: 'Original Oil Painting "Sunset Radiance Along Amalfi Coast" (36x48")',
    itemCategory: 'Art',
    startingPrice: 55000,
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1000&q=80',
    itemDescription: 'Spectacular heavy impasto oil on Belgian linen canvas portraying glowing Mediterranean cliffs bathed in sunset warmth. Signed by European artist in lower right corner. Gallery-wrapped and presented in a custom floating frame.',
    hoursUntilEnd: 8, // Ending soon!
    bidCount: 8, // 🔥 Hot
  },
  {
    itemName: 'Katsushika Hokusai "The Great Wave off Kanagawa" Showa Woodblock',
    itemCategory: 'Art',
    startingPrice: 42000,
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80',
    itemDescription: 'Authentic Japanese polychrome woodblock print produced from hand-carved cherry wood blocks using traditional mineral pigments on handmade washi paper. Preserved in museum-grade UV-filtering museum glass.',
    hoursUntilEnd: 144, // 6 days
    bidCount: 4,
  },
  {
    itemName: 'Modernist Patinated Bronze Sculptural Figure "Solitude"',
    itemCategory: 'Art',
    startingPrice: 78000,
    imageUrl: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1000&q=80',
    itemDescription: 'Numbered limited edition lost-wax bronze sculpture (4 of 12) standing 22 inches tall on a solid black Nero Marquina marble plinth. Features a rich dual-tone verde and chocolate patina with certificate of authenticity.',
    hoursUntilEnd: 216, // 9 days
    bidCount: 0,
  },

  // --- Books ---
  {
    itemName: 'J.R.R. Tolkien "The Lord of the Rings" 1954 First Edition 3-Vol Set',
    itemCategory: 'Books',
    startingPrice: 195000,
    imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=1000&q=80',
    itemDescription: 'True George Allen & Unwin first UK editions of The Fellowship of the Ring, The Two Towers, and The Return of the King. Fold-out Middle-earth maps are intact without tears. Includes custom cloth-bound slipcase.',
    hoursUntilEnd: 180, // 7.5 days
    bidCount: 6, // 🔥 Hot
  },
  {
    itemName: 'William Shakespeare "Complete Works" 1890 Imperial Leather Folio',
    itemCategory: 'Books',
    startingPrice: 28000,
    imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1000&q=80',
    itemDescription: 'Monumental two-volume folio set bound in full crushed crimson Morocco leather with elaborate gilt tooling on spines and boards. Features 50 steel engraved plates by renowned British artists with gilded page edges.',
    hoursUntilEnd: 110, // 4.5 days
    bidCount: 2,
  },
  {
    itemName: 'Illuminated Book of Hours Parchment Leaf with Gold Leaf (c. 1485)',
    itemCategory: 'Books',
    startingPrice: 35000,
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1000&q=80',
    itemDescription: 'Original 15th-century French medieval manuscript folio hand-inscribed in Latin gothic rotunda script on vellum. Decorated with burnished raised 22k gold leaf, acanthus leaves, and floral borders.',
    hoursUntilEnd: 260, // ~11 days
    bidCount: 1,
  },

  // --- Clothing ---
  {
    itemName: 'Vintage 1980s Yves Saint Laurent Double-Breasted Leather Trench',
    itemCategory: 'Clothing',
    startingPrice: 38000,
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=80',
    itemDescription: 'Iconic archive piece from Paris Atelier crafted in supple full-grain lambskin leather. Features horn buttons, belted waist, storm flap, and immaculate satin jacquard lining. Size EU 48 in exceptional vintage condition.',
    hoursUntilEnd: 18, // Ending soon!
    bidCount: 5, // 🔥 Hot
  },
  {
    itemName: 'Savile Row Bespoke Three-Piece Pure Cashmere & Tweed Suit',
    itemCategory: 'Clothing',
    startingPrice: 85000,
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80',
    itemDescription: 'Master-tailored single-button silhouette with peak lapels, matching double-breasted waistcoat, and side-adjuster trousers. Cut from Scottish estate tweed with horn buttons and silk interior lining.',
    hoursUntilEnd: 84, // 3.5 days
    bidCount: 3,
  },
  {
    itemName: 'Hermès Paris "Grand Apparat" Vintage Silk Twill Carré 90 Scarf',
    itemCategory: 'Clothing',
    startingPrice: 22000,
    imageUrl: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1000&q=80',
    itemDescription: 'Classic equestrian ceremonial design by Jacques Eudel in iconic royal blue and gold colorway. Hand-rolled plump hems, 100% heavy mulberry silk twill, presented in original orange Hermès hatbox.',
    hoursUntilEnd: 156, // 6.5 days
    bidCount: 4,
  },

  // --- Collectibles ---
  {
    itemName: '1968 Omega Speedmaster Professional "Pre-Moon" Calibre 321',
    itemCategory: 'Collectibles',
    startingPrice: 480000,
    imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80',
    itemDescription: 'Rare reference 145.012-67 featuring the legendary column-wheel Calibre 321 movement that accompanied Apollo astronauts. Stepped dial with warm pumpkin patina on tritium indices and Dot-Over-90 bezel.',
    hoursUntilEnd: 60, // 2.5 days
    bidCount: 9, // 🔥 Hot
  },
  {
    itemName: '1999 Pokemon 1st Edition Shadowless Charizard Holo PSA 8 NM-MT',
    itemCategory: 'Collectibles',
    startingPrice: 650000,
    imageUrl: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?auto=format&fit=crop&w=1000&q=80',
    itemDescription: 'The holy grail of trading card games. Authenticated and sealed in tamper-proof PSA slab with subgrades. Superb centering, pristine foil reflection, and sharp corners on this iconic Base Set Charizard.',
    hoursUntilEnd: 90, // ~3.7 days
    bidCount: 12, // 🔥 Hot
  },
  {
    itemName: '1954 Leica M3 Rangefinder Camera with 50mm f/2 Summicron Lens',
    itemCategory: 'Collectibles',
    startingPrice: 165000,
    imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1000&q=80',
    itemDescription: 'Early double-stroke serial number 700k series manufactured in Wetzlar, Germany. Fully mechanical shutter is crisp across all speeds. Includes collapsible Summicron 5cm f/2 lens with clear glass and original leather case.',
    hoursUntilEnd: 192, // 8 days
    bidCount: 4,
  },

  // --- Home & Garden ---
  {
    itemName: 'Authentic Herman Miller Eames Lounge Chair & Ottoman (Santos Palisander)',
    itemCategory: 'Home & Garden',
    startingPrice: 290000,
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80',
    itemDescription: 'Design icon created by Charles and Ray Eames. Features book-matched Santos Palisander molded wood shells and buttery black MCL semi-aniline leather. Embossed Herman Miller medallion and certificate included.',
    hoursUntilEnd: 48, // 2 days
    bidCount: 7, // 🔥 Hot
  },
  {
    itemName: 'Antique Persian Silk Tabriz Masterpiece Carpet (9x12 ft, 800 KPSI)',
    itemCategory: 'Home & Garden',
    startingPrice: 320000,
    imageUrl: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1000&q=80',
    itemDescription: 'Hand-knotted with pure mulberry silk warp and weft over a span of 3 years in Northwest Persia. Features intricate hunting scenes and medallion motifs with natural vegetable dyes that shimmer under warm lighting.',
    hoursUntilEnd: 140, // ~5.8 days
    bidCount: 3,
  },
  {
    itemName: 'Danish Mid-Century Modern Teak Tambour-Door Credenza',
    itemCategory: 'Home & Garden',
    startingPrice: 95000,
    imageUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1000&q=80',
    itemDescription: 'Stunning 1960s sideboard featuring smooth curved sliding tambour doors, sculpted colored drawer fronts, and solid conical teak legs. Finished with natural Danish oil to reveal deep golden honey grain.',
    hoursUntilEnd: 240, // 10 days
    bidCount: 2,
  },

  // --- Jewelry ---
  {
    itemName: '4.25 Carat GIA Certified VVS1 Cushion Cut Diamond Platinum Ring',
    itemCategory: 'Jewelry',
    startingPrice: 750000,
    imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80',
    itemDescription: 'GIA certified natural diamond featuring exceptional F color and VVS1 clarity grade. Set in custom handmade 950 platinum with micro-pave diamond band and hidden halo detailing. GIA dossier included.',
    hoursUntilEnd: 21, // Ending soon!
    bidCount: 11, // 🔥 Hot
  },
  {
    itemName: 'Art Deco Natural Colombian Emerald & Diamond Drop Earrings',
    itemCategory: 'Jewelry',
    startingPrice: 240000,
    imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80',
    itemDescription: 'Circa 1925 heirloom earrings showcasing 5.80 carats total of Muzo mine untreated vivid green emeralds framed by old European cut and baguette diamonds totaling 3.20 carats.',
    hoursUntilEnd: 78, // 3.25 days
    bidCount: 4,
  },
  {
    itemName: 'Cartier 18K Yellow Gold & Pavé Diamond Love Bracelet (Size 18)',
    itemCategory: 'Jewelry',
    startingPrice: 380000,
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80',
    itemDescription: 'Iconic Cartier Love cuff studded with 10 brilliant-cut diamonds totaling 0.96 carats. Complete with original Cartier red presentation box, screwdriver, and certificate of origin.',
    hoursUntilEnd: 130, // ~5.4 days
    bidCount: 6, // 🔥 Hot
  },

  // --- Musical Instruments ---
  {
    itemName: '1959 Gibson Les Paul Standard "59 Burst" Custom Shop Reissue',
    itemCategory: 'Musical Instruments',
    startingPrice: 340000,
    imageUrl: 'https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=1000&q=80',
    itemDescription: 'Murphy Lab Ultra Light Aged cherry sunburst with flame maple top, hide glue construction, and unpotted Custombucker Alnico III pickups. Weighs an ideal 8.4 lbs. Includes Lifton brown case and COA.',
    hoursUntilEnd: 105, // ~4.3 days
    bidCount: 8, // 🔥 Hot
  },
  {
    itemName: '1965 Fender Precision Bass Vintage Original in Olympic White',
    itemCategory: 'Musical Instruments',
    startingPrice: 280000,
    imageUrl: 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&w=1000&q=80',
    itemDescription: 'Original transitional era pre-CBS specification P-bass with Brazilian rosewood fretboard, clay dots, tortoiseshell pickguard, and gray-bottom split coil pickup with warm, punchy vintage growl.',
    hoursUntilEnd: 170, // 7 days
    bidCount: 3,
  },
  {
    itemName: 'Yamaha Custom Z YAS-82Z Professional Alto Saxophone (Black Lacquer)',
    itemCategory: 'Musical Instruments',
    startingPrice: 160000,
    imageUrl: 'https://images.unsplash.com/photo-1520523839898-507128fc543a?auto=format&fit=crop&w=1000&q=80',
    itemDescription: 'Handcrafted one-piece bell with intricate floral engraving. Custom V1 neck allows maximum tonal flexibility. Includes mother of pearl key touches, hard touring case, and Meyer 6M ebonite mouthpiece.',
    hoursUntilEnd: 220, // 9.1 days
    bidCount: 1,
  },

  // --- Sports ---
  {
    itemName: 'Michael Jordan Signed 1998 NBA Finals "Last Dance" Bulls Jersey',
    itemCategory: 'Sports',
    startingPrice: 450000,
    imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1000&q=80',
    itemDescription: 'Official red Chicago Bulls Nike pro-cut jersey autographed boldly in silver paint pen on the number 23. Certified authentic by Upper Deck Authenticated (UDA) with tamper-proof hologram.',
    hoursUntilEnd: 55, // 2.3 days
    bidCount: 10, // 🔥 Hot
  },
  {
    itemName: '1985 Nike Air Jordan 1 High OG "Chicago" Original Deadstock (US 10.5)',
    itemCategory: 'Sports',
    startingPrice: 380000,
    imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=80',
    itemDescription: 'Museum-quality holy grail sneaker from the inaugural 1985 release. Untouched collar padding, vibrant varsity red leather, and crisp black wing logo. Comes with original black & red box and extra black laces.',
    hoursUntilEnd: 88, // 3.6 days
    bidCount: 7, // 🔥 Hot
  },
  {
    itemName: 'Pinarello Dogma F12 Carbon Dura-Ace Di2 Aero Racing Bike',
    itemCategory: 'Sports',
    startingPrice: 420000,
    imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1000&q=80',
    itemDescription: 'Grand Tour winning aerodynamic superbike equipped with Shimano Dura-Ace R9270 12-speed wireless electronic groupset, Lightweight Meilenstein carbon wheels, and integrated Most Talon Ultra cockpit.',
    hoursUntilEnd: 195, // 8.1 days
    bidCount: 2,
  },

  // --- Toys ---
  {
    itemName: '1979 Kenner Star Wars Vintage Boba Fett Action Figure (AFA 85 Graded)',
    itemCategory: 'Toys',
    startingPrice: 110000,
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1000&q=80',
    itemDescription: 'Unpunched 21-back carded bounty hunter figure with blaster pistol in crystal-clear archival acrylic AFA case. Subgrades: Card 85, Bubble 85, Figure 90. One of the highest preserved specimens known.',
    hoursUntilEnd: 115, // 4.8 days
    bidCount: 4,
  },
  {
    itemName: 'LEGO Star Wars UCS Millennium Falcon #75192 (Factory Sealed, 7541 pcs)',
    itemCategory: 'Toys',
    startingPrice: 75000,
    imageUrl: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=1000&q=80',
    itemDescription: 'The largest, most detailed LEGO Millennium Falcon model ever released. Brand new in factory tape-sealed retail shipper box. Features extensive interior compartments, deflector dishes, and 8 minifigures.',
    hoursUntilEnd: 65, // ~2.7 days
    bidCount: 5, // 🔥 Hot
  },
  {
    itemName: '1982 Bandai Godaikin Tetsujin 28 Die-Cast Robot in Original Box',
    itemCategory: 'Toys',
    startingPrice: 52000,
    imageUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=1000&q=80',
    itemDescription: 'Iconic 12-inch heavy die-cast metal classic Japanese super-robot featuring spring-loaded firing fists, rocket boosters, and chrome accessories. Styrofoam tray and vibrant outer box are well-preserved.',
    hoursUntilEnd: 280, // ~11.6 days
    bidCount: 1,
  },

  // --- Vehicles ---
  {
    itemName: '1967 Ford Mustang Fastback GTA 390 V8 "Eleanor Tribute" Restomod',
    itemCategory: 'Vehicles',
    startingPrice: 850000,
    imageUrl: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=1000&q=80',
    itemDescription: 'Show-stopping frame-off restoration finished in Pepper Gray with black Le Mans stripes. Powered by a built 390ci big block paired with Tremec 5-speed manual transmission, Wilwood disc brakes, and side exhaust.',
    hoursUntilEnd: 160, // 6.6 days
    bidCount: 8, // 🔥 Hot
  },
  {
    itemName: '1973 Porsche 911 Carrera RS 2.7 Lightweight Tribute Coupe',
    itemCategory: 'Vehicles',
    startingPrice: 950000,
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80',
    itemDescription: 'Exact nut-and-bolt RS lightweight tribute finished in Grand Prix White with blue Carrera script. Fitted with mechanical fuel injected 2.7L flat-six, lightweight ducktail spoiler, Fuchs forged wheels, and sport bucket seats.',
    hoursUntilEnd: 70, // 2.9 days
    bidCount: 6, // 🔥 Hot
  },
  {
    itemName: '1965 Vespa 150 Sprint Veloce Vintage Italian Classic Scooter',
    itemCategory: 'Vehicles',
    startingPrice: 120000,
    imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1000&q=80',
    itemDescription: 'Fully restored in Rome with period-correct Celeste Aquamarine paint. Rebuilt 150cc 2-stroke engine, 4-speed hand twist shifter, spare tire rack, and brown stitched leather dual saddles. Registered and road-ready.',
    hoursUntilEnd: 185, // 7.7 days
    bidCount: 3,
  },

  // --- Other ---
  {
    itemName: 'Montblanc Meisterstück 149 Gold-Coated Fountain Pen with 18K Nib',
    itemCategory: 'Other',
    startingPrice: 45000,
    imageUrl: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=1000&q=80',
    itemDescription: 'The definitive luxury writing instrument. Handcrafted deep black precious resin with gold-coated clip and rings. Bi-color 18k gold nib with rhodium inlay (Medium). Includes presentation gift box and ink bottle.',
    hoursUntilEnd: 135, // 5.6 days
    bidCount: 3,
  },
  {
    itemName: 'Hand-Forged 240mm Japanese Damascus Steel Gyuto Chef Knife',
    itemCategory: 'Other',
    startingPrice: 28000,
    imageUrl: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=1000&q=80',
    itemDescription: 'Forged by Echizen master smith with SG2 powdered steel core clad in 64 layers of suminagashi Damascus. Rockwell hardness 63 HRC. Handle crafted from octagonal stabilized burl wood and buffalo horn ferrule.',
    hoursUntilEnd: 50, // ~2.1 days
    bidCount: 4,
  },
  {
    itemName: '18th Century Brass Planispheric Astrolabe with Celestial Map',
    itemCategory: 'Other',
    startingPrice: 58000,
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80',
    itemDescription: 'Scientific antique navigation astronomical instrument crafted in heavy engraved brass. Features rete with star pointers, altitude plates for varied latitudes, and calendar scales inscribed with Arabic numerals.',
    hoursUntilEnd: 210, // 8.75 days
    bidCount: 2,
  },
];

const seed = async () => {
  try {
    console.log("==========================================");
    console.log("   ONLINE AUCTION SYSTEM - SEED SCRIPT    ");
    console.log("==========================================\n");

    console.log("Connecting to MongoDB...");
    await connectDB();

    // Fetch existing users to use as sellers and bidders
    const users = await User.find().select("_id name email");
    if (users.length === 0) {
      throw new Error(
        "No users found in database. Please register at least one user first.",
      );
    }
    console.log(`Found ${users.length} users in database to assign as sellers/bidders.\n`);

    const cleanFlag = process.argv.includes("--clean");
    const withEmbeddings = !process.argv.includes("--no-embeddings");

    if (cleanFlag) {
      console.log("Cleaning previously seeded auctions...");
      const deleteResult = await Product.deleteMany({
        "itemImage.public_id": { $regex: /^seed_auctions\// },
      });
      console.log(`Removed ${deleteResult.deletedCount} existing seed auctions.\n`);
    }

    const now = new Date();
    let createdCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < SEED_AUCTIONS.length; i++) {
      const item = SEED_AUCTIONS[i];

      // Check if item already exists by name to avoid accidental duplicates
      const existing = await Product.findOne({ itemName: item.itemName });
      if (existing && !cleanFlag) {
        console.log(`[${i + 1}/${SEED_AUCTIONS.length}] Skipped (already exists): "${item.itemName}"`);
        skippedCount++;
        continue;
      }

      // Pick a random seller from users
      const seller = users[Math.floor(Math.random() * users.length)];

      // Compute dates
      const startDate = new Date(
        now.getTime() - Math.floor(Math.random() * 3 + 1) * 24 * 60 * 60 * 1000,
      );
      const endDate = new Date(now.getTime() + item.hoursUntilEnd * 60 * 60 * 1000);

      // Generate bids
      const otherUsers = users.filter((u) => u._id.toString() !== seller._id.toString());
      const bidderPool = otherUsers.length > 0 ? otherUsers : users;

      const bids = [];
      let currentPrice = item.startingPrice;

      if (item.bidCount > 0 && bidderPool.length > 0) {
        const timeWindow = now.getTime() - startDate.getTime();
        const interval = Math.floor(timeWindow / (item.bidCount + 1));

        for (let b = 1; b <= item.bidCount; b++) {
          const bidder = bidderPool[Math.floor(Math.random() * bidderPool.length)];
          // Increment price by 3% to 8% per bid (minimum Rs 200)
          const increment = Math.max(200, Math.round(currentPrice * (0.03 + Math.random() * 0.05)));
          currentPrice += increment;

          const bidTime = new Date(startDate.getTime() + interval * b + Math.floor(Math.random() * 60000));

          bids.push({
            bidder: bidder._id,
            bidAmount: currentPrice,
            bidTime: bidTime > now ? now : bidTime,
          });
        }
      }

      // Optional embedding generation
      let embedding = [];
      if (withEmbeddings) {
        try {
          const textToEmbed = `${item.itemName}. Category: ${item.itemCategory}. ${item.itemDescription}`;
          embedding = await generateTextEmbedding(textToEmbed);
        } catch {
          embedding = [];
        }
      }

      const slug = item.itemName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .slice(0, 30);

      const product = new Product({
        itemName: item.itemName,
        itemDescription: item.itemDescription,
        itemCategory: item.itemCategory,
        itemImage: {
          public_id: `seed_auctions/${slug}`,
          url: item.imageUrl,
        },
        startingPrice: item.startingPrice,
        currentPrice: currentPrice,
        itemStartDate: startDate,
        itemEndDate: endDate,
        seller: seller._id,
        bids: bids,
        isSold: false,
        winner: null,
        embedding: embedding,
      });

      await product.save();
      createdCount++;
      console.log(
        `[${i + 1}/${SEED_AUCTIONS.length}] Created: "${item.itemName}" (${item.itemCategory}) - Rs ${currentPrice.toLocaleString()} [${bids.length} bids]`,
      );

      if (withEmbeddings && embedding.length > 0) {
        // Small throttle to stay safely within Gemini rate limits
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }

    console.log("\n==========================================");
    console.log(`Seeding finished!`);
    console.log(`Successfully created: ${createdCount} auctions`);
    console.log(`Skipped: ${skippedCount} auctions`);
    console.log(`Total auctions in DB: ${await Product.countDocuments()}`);
    console.log("==========================================\n");
  } catch (error) {
    console.error("Seeding failed with error:", error);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

seed();
