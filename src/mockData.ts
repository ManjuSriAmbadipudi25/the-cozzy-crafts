import { Product, Category, Banner, Review } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-ceramic',
    name: 'Ceramic & Clay',
    slug: 'ceramic-and-clay',
    description: 'Artisan hand-thrown stoneware with soft matte glazes.',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'cat-knits',
    name: 'Cozy Knits',
    slug: 'cozy-knits',
    description: 'Chunky merino wool hand-knitted blankets and premium throws.',
    image: 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'cat-scents',
    name: 'Aromatherapy',
    slug: 'aromatherapy',
    description: 'Clean hand-poured botanical soy wax candles with essential oils.',
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'cat-linens',
    name: 'Linen & Table',
    slug: 'linen-and-table',
    description: 'Soft crinkled table runners, organic weaves, and napkins.',
    image: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?q=80&w=400&auto=format&fit=crop',
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Artisan Hearth Ceramic Mug',
    slug: 'artisan-hearth-ceramic-mug',
    description: 'Individually thrown on a potter\'s wheel, this mug features a snug double-finger handle, soft ribbed base, and a dual-tone speckle oatmeal glaze. Perfect for your morning matcha or cozy chamomile teas.',
    price: 36.00,
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?q=80&w=600&auto=format&fit=crop'
    ],
    category: 'ceramic-and-clay',
    stock: 8,
    tags: ['Handthrown', 'Elegant', 'Tableware'],
    rating: 4.9,
    reviewsCount: 15,
    handmadeBy: 'Aurelia Dupont',
    createdAt: '2026-05-10T12:00:00Z'
  },
  {
    id: 'p2',
    name: 'Merino Cloud Chunky Throw',
    slug: 'merino-cloud-chunky-throw',
    description: 'An ultra-fine chunky throw knitted by hand using 100% organic unspun merino wool. It provides incredibly buttery softness, luxurious weight, and a gorgeous premium stitch profile.',
    price: 185.00,
    images: [
      'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1543294001-f7cbfe92237e?q=80&w=600&auto=format&fit=crop'
    ],
    category: 'cozy-knits',
    stock: 3,
    tags: ['Merino', 'Luxury Throw', 'Heavyweight'],
    rating: 5.0,
    reviewsCount: 22,
    handmadeBy: 'Eleanor Vance',
    createdAt: '2026-05-12T09:30:00Z'
  },
  {
    id: 'p3',
    name: 'Lavender & Wild Sage Soy Candle',
    slug: 'lavender-and-wild-sage-soy-candle',
    description: 'Hand-poured in small batches, our pure soy candles feature fresh French lavender, grounding crushed wild sage, and creamy sandalwood essential oils. Formulated with a natural clean-burning wooden crackle wick.',
    price: 28.00,
    images: [
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1596435764266-701211756540?q=80&w=600&auto=format&fit=crop'
    ],
    category: 'aromatherapy',
    stock: 25,
    tags: ['Soy Wax', 'Calming', 'Essential Oils'],
    rating: 4.8,
    reviewsCount: 38,
    handmadeBy: 'Sophie Martin',
    createdAt: '2026-05-15T08:00:00Z'
  },
  {
    id: 'p4',
    name: 'Washed Pastel Peach Clay Vase',
    slug: 'washed-pastel-peach-clay-vase',
    description: 'A beautiful decorative earthen vase displaying minimalist outlines and structured raw clay finish. Glazed internally for fresh botanical stems, featuring a textured exterior wash in warm peach-beige tone.',
    price: 64.00,
    images: [
      'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=600&auto=format&fit=crop'
    ],
    category: 'ceramic-and-clay',
    stock: 5,
    tags: ['Vase', 'Textured', 'Minimalist'],
    rating: 4.7,
    reviewsCount: 11,
    handmadeBy: 'Aurelia Dupont',
    createdAt: '2026-05-18T14:15:00Z'
  },
  {
    id: 'p5',
    name: 'Botanical Smudge & Smear Smudge Stick',
    slug: 'botanical-smudge-and-smear-smudge-stick',
    description: 'Locally harvested organic rose petals, sweet mountain sage, combined with fresh rosemary sprigs tied with 100% raw pastel pink cotton thread. Purges negatives while filling rooms with earthy blossom notes.',
    price: 19.50,
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=600&auto=format&fit=crop'
    ],
    category: 'aromatherapy',
    stock: 40,
    tags: ['Smudge Stick', 'Organic', 'Cleansing'],
    rating: 4.9,
    reviewsCount: 14,
    handmadeBy: 'Sophie Martin',
    createdAt: '2026-05-20T10:00:00Z'
  },
  {
    id: 'p6',
    name: 'Crinkled French Flax Linen Runner',
    slug: 'crinkled-french-flax-linen-runner',
    description: 'Luxuriously soft and casually elegant, this table runner is crafted from the finest sustainably-grown French flax. Pre-washed for a perfect relaxed texture, classic selvage borders, and visual richness.',
    price: 52.00,
    images: [
      'https://images.unsplash.com/photo-1604014237800-1c9102c219da?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=600&auto=format&fit=crop'
    ],
    category: 'linen-and-table',
    stock: 12,
    tags: ['Flax Linen', 'Soft Tableware', 'Sustained'],
    rating: 4.8,
    reviewsCount: 9,
    handmadeBy: 'Isabella Roux',
    createdAt: '2026-05-22T16:40:00Z'
  }
];

export const INITIAL_BANNERS: Banner[] = [
  {
    id: 'b1',
    title: 'The Soft Art of Cozy Living',
    subtitle: 'Premium handmade goods that turn any space into an elegant, soothing sanctuary.',
    badge: 'LUXURY HANDMADE',
    image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=1200&auto=format&fit=crop',
    link: 'ceramic-and-clay',
    isActive: true
  },
  {
    id: 'b2',
    title: 'Artisan Ceramics & Earthy Stoneware',
    subtitle: 'Meticulously shaped on potter wheels and wood-fired to capture pure tactile details.',
    badge: 'NEW COLLECTION',
    image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=1200&auto=format&fit=crop',
    link: 'ceramic-and-clay',
    isActive: true
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'r1',
    productId: 'p1',
    userName: 'Charlotte Bennett',
    rating: 5,
    comment: 'The grain of this ceramic is simply divine. It feels heavy, earthy, and retains heat perfectly. Highly recommended!',
    createdAt: '2026-05-18T10:30:00Z'
  },
  {
    id: 'r2',
    productId: 'p1',
    userName: 'Emma Watson',
    rating: 4,
    comment: 'Absolutely love the dual glaze finish. It fits my aesthetic perfectly.',
    createdAt: '2026-05-20T11:00:00Z'
  },
  {
    id: 'r3',
    productId: 'p2',
    userName: 'Sophia Laurent',
    rating: 5,
    comment: 'The softest blanket I have ever owned. It is sheer heavy-cloud perfection on my linen couch. Worth every single penny.',
    createdAt: '2026-05-19T14:24:00Z'
  }
];
