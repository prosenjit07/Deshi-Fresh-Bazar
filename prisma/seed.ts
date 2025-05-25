// First, we need to create a category since products require a categoryId
import prismaClient from "../src/app/api/util";

const category = await prismaClient.category.create({
  data: {
    name: "Katimon",
    slug: "katimon",
    description: "Premium quality mangoes from Bangladesh"
  }
});

// Then create the products with their packages
const products = await prismaClient.product.createMany({
  data: [
    {
      name: "হিমসাগর আম (বিষমুক্ত) – প্রতি কেজি ১৬০ টাকা",
      slug: "himsagor-mango",
      description: "মিষ্টি স্বাদ ও রসালো গঠনের জন্য জনপ্রিয় এই আম সাতক্ষীরা ও রাজশাহী অঞ্চল থেকে সংগ্রহ করা হয়। প্রতি কেজিতে গড়ে ৪-৫টি মাঝারি আকৃতির আম থাকে। আমরা পরিপক্ক কাঁচা আম সরবরাহ করি, যা ঘরের উষ্ণ স্থানে রেখে প্রাকৃতিকভাবে পাকিয়ে খেতে হয়। কাঁচা অবস্থায় খেলে কিছুটা টক লাগতে পারে। ডেলিভারির জন্য আমরা স্টেডফাস্ট কুরিয়ার সার্ভিস ব্যবহার করি, যা দেশের যেকোনো জায়গায় (উপজেলাসহ) পৌঁছে দেয়। এখনই প্রি-বুক করুন এবং ঘরে বসে উপভোগ করুন মৌসুমি হিমসাগরের স্বাদ!",
      price: 1199,
      image: "/images/gopalvog.jpg", // You'll need to update this with actual image path
      categoryId: category.id,
      stock: 100
    },
    {
      name: "ল্যাংড়া আম (বিষমুক্ত) – প্রতি কেজি ১৬০ টাকা",
      slug: "langra-mango",
      description: "ল্যাংড়া আমের স্বাদ ও সুগন্ধের জন্য এটি বাংলাদেশের অন্যতম জনপ্রিয় আম। রাজশাহী অঞ্চলের বিশেষ যত্নে চাষ করা এই আম প্রাকৃতিক পদ্ধতিতে পাকানো হয়। আমাদের নিজস্ব বাগান থেকে সংগ্রহ করা এই আম সম্পূর্ণ বিষমুক্ত ও স্বাস্থ্যসম্মত।",
      price: 2299,
      image: "/images/gobindovog-mango.jpg", // You'll need to update this with actual image path
      categoryId: category.id,
      stock: 100
    },
    {
      name: "হাড়িভাঙ্গা আম (বিষমুক্ত) – প্রতি কেজি ১৫০ টাকা",
      slug: "haribhanga-mango",
      description: "হাড়িভাঙ্গা আম বাংলাদেশের ঐতিহ্যবাহী জাতের আম। এর মিষ্টি স্বাদ ও সুগন্ধ এটিকে অনন্য করে তুলেছে। আমাদের নিজস্ব বাগান থেকে সরাসরি সংগ্রহ করা এই আম কীটনাশকমুক্ত ও প্রাকৃতিকভাবে পাকানো হয়।",
      price: 4499,
      image: "/images/gopalvog.jpg", // You'll need to update this with actual image path
      categoryId: category.id,
      stock: 100
    },
    {
      name: "Gopalvhog– প্রতি কেজি ১৬০ টাকা",
      slug: "gopalvhog-mango",
      description: "গোপালভোগ আম তার মিষ্টি স্বাদ ও সুবাসের জন্য বিখ্যাত। বাংলাদেশের উত্তরাঞ্চলের বিশেষ যত্নে চাষ করা এই আম প্রাকৃতিক পদ্ধতিতে পাকানো হয়। আমাদের নিজস্ব বাগান থেকে সংগ্রহ করা এই আম সম্পূর্ণ বিষমুক্ত।",
      price: 9000,
      image: "/images/gopalvog.jpg", // You'll need to update this with actual image path
      categoryId: category.id,
      stock: 100
    }
  ]
});

// After creating products, we need to fetch them to get their IDs
const createdProducts = await prismaClient.product.findMany({
  where: {
    slug: {
      in: ["himsagor-mango", "langra-mango", "haribhanga-mango", "gopalvhog-mango"]
    }
  }
});

// Create packages for each product
const packages = await prismaClient.package.createMany({
  data: [
    // Himsagor Mango packages
    {
      name: "10 kg",
      price: 1199,
      productId: createdProducts[0].id
    },
    {
      name: "20 kg",
      price: 2158,
      productId: createdProducts[0].id
    },
    // Langra Mango packages
    {
      name: "10 kg",
      price: 2299,
      productId: createdProducts[1].id
    },
    {
      name: "20 kg",
      price: 4138,
      productId: createdProducts[1].id
    },
    // Haribhanga Mango packages
    {
      name: "10 kg",
      price: 4499,
      productId: createdProducts[2].id
    },
    {
      name: "20 kg",
      price: 8098,
      productId: createdProducts[2].id
    },
    // Gopalvhog Mango packages
    {
      name: "10 kg",
      price: 9000,
      productId: createdProducts[3].id
    },
    {
      name: "20 kg",
      price: 16200,
      productId: createdProducts[3].id
    }
  ]
});
