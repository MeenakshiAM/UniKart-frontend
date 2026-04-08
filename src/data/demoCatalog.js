const localImage = (path) => [{ url: path, public_id: path.replaceAll("/", "-") }];

export const demoProducts = [
  {
    _id: "66a100000000000000000001",
    title: "Chocolate Truffle Celebration Cake",
    description:
      "A rich Belgian chocolate cake with a smooth truffle finish, baked to order for birthdays, hostel celebrations, and campus events.",
    type: "PRODUCT",
    category: "FOOD",
    subCategory: "cakes",
    price: {
      basePrice: 410,
      commissionPercent: 10,
      finalPrice: 450,
    },
    quantity: 12,
    images: localImage("/images/chocolate-truffle-cake.jpg"),
    sellerId: null,
    status: "ACTIVE",
    averageRating: 4.8,
    reviewCount: 24,
  },
  {
    _id: "66a100000000000000000002",
    title: "Handmade Scrunchies Set",
    description:
      "A five-piece set of soft fabric scrunchies in colorful patterns, designed for everyday wear without pulling or damaging hair.",
    type: "PRODUCT",
    category: "CLOTHING",
    subCategory: "handmade-accessories",
    price: {
      basePrice: 135,
      commissionPercent: 10,
      finalPrice: 150,
    },
    quantity: 30,
    images: localImage("/images/handmade-scrunchies.jpg"),
    sellerId: null,
    status: "ACTIVE",
    averageRating: 4.9,
    reviewCount: 45,
  },
];

export const demoServices = [
  {
    _id: "77b200000000000000000001",
    title: "Math Tutoring",
    description:
      "One-on-one support for calculus, algebra, and exam prep with flexible online and on-campus sessions tailored to college students.",
    category: "tuition",
    subCategory: "mathematics",
    providerId: "77b200000000000000000011",
    serviceType: "both",
    location: {
      venue: "Campus or online",
      building: "Student learning spaces",
      room: "",
    },
    pricing: {
      basePrice: 300,
      currency: "INR",
      pricingType: "per_session",
      duration: {
        value: 1,
        unit: "hours",
      },
    },
    requirements: ["Share your syllabus or topic list before the session"],
    tags: ["math", "calculus", "algebra", "exam-prep"],
    ratings: {
      average: 5,
      count: 32,
    },
    status: "active",
    images: localImage("/images/math-tutoring.jpg"),
  },
  {
    _id: "77b200000000000000000002",
    title: "Custom Portrait Art",
    description:
      "Commission a hand-drawn digital portrait in realistic, cartoon, or watercolor style for gifts, profile pictures, or keepsakes.",
    category: "designing",
    subCategory: "digital-art",
    providerId: "77b200000000000000000012",
    serviceType: "online",
    location: {
      venue: "Delivered digitally",
      building: "",
      room: "",
    },
    pricing: {
      basePrice: 800,
      currency: "INR",
      pricingType: "fixed",
      duration: {
        value: 7,
        unit: "days",
      },
    },
    requirements: ["Reference photo", "Preferred art style", "Delivery deadline"],
    tags: ["portrait", "digital-art", "gift", "illustration"],
    ratings: {
      average: 4.7,
      count: 18,
    },
    status: "active",
    images: localImage("/images/custom-portraits.jpg"),
  },
];

export function findDemoProductById(id) {
  return demoProducts.find((product) => product._id === id) || null;
}

export function findDemoServiceById(id) {
  return demoServices.find((service) => service._id === id) || null;
}

export function mergeCatalogItems(primaryItems = [], demoItems = []) {
  const seen = new Set(primaryItems.map((item) => item?._id).filter(Boolean));
  return [...primaryItems, ...demoItems.filter((item) => !seen.has(item._id))];
}
