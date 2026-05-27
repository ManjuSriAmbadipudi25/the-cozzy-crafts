import { db, isFirebaseReal, handleFirestoreError, OperationType } from './config';
import { Product, Category, Banner, Review, Order } from '../types';
import { 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  deleteDoc, 
  query, 
  where, 
  addDoc,
  updateDoc
} from 'firebase/firestore';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_CATEGORIES, 
  INITIAL_BANNERS, 
  INITIAL_REVIEWS 
} from '../mockData';

// --- LocalStorage Fallback Seeders ---
const LS_KEY_PRODUCTS = 'cozzyspace_products';
const LS_KEY_CATEGORIES = 'cozzyspace_categories';
const LS_KEY_BANNERS = 'cozzyspace_banners';
const LS_KEY_REVIEWS = 'cozzyspace_reviews';
const LS_KEY_ORDERS = 'cozzyspace_orders';

function getLocalStorageData<T>(key: string, seed: T[]): T[] {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return seed;
  }
}

function saveLocalStorageData<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// --- PRODUCTS ---
export async function getProducts(): Promise<Product[]> {
  if (isFirebaseReal) {
    const path = 'products';
    try {
      const q = collection(db, path);
      const querySnapshot = await getDocs(q);
      const list: Product[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ ...doc.data() } as Product);
      });
      return list;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  } else {
    return getLocalStorageData<Product>(LS_KEY_PRODUCTS, INITIAL_PRODUCTS);
  }
}

export async function saveProduct(product: Product): Promise<void> {
  if (isFirebaseReal) {
    const path = 'products';
    try {
      await setDoc(doc(db, path, product.id), { ...product });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${path}/${product.id}`);
    }
  } else {
    const list = getLocalStorageData<Product>(LS_KEY_PRODUCTS, INITIAL_PRODUCTS);
    const index = list.findIndex(p => p.id === product.id);
    if (index >= 0) {
      list[index] = product;
    } else {
      list.push(product);
    }
    saveLocalStorageData<Product>(LS_KEY_PRODUCTS, list);
  }
}

export async function deleteProduct(id: string): Promise<void> {
  if (isFirebaseReal) {
    const path = 'products';
    try {
      await deleteDoc(doc(db, path, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${path}/${id}`);
    }
  } else {
    let list = getLocalStorageData<Product>(LS_KEY_PRODUCTS, INITIAL_PRODUCTS);
    list = list.filter(p => p.id !== id);
    saveLocalStorageData<Product>(LS_KEY_PRODUCTS, list);
  }
}

// --- CATEGORIES ---
export async function getCategories(): Promise<Category[]> {
  if (isFirebaseReal) {
    const path = 'categories';
    try {
      const querySnapshot = await getDocs(collection(db, path));
      const list: Category[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ ...doc.data() } as Category);
      });
      return list;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  } else {
    return getLocalStorageData<Category>(LS_KEY_CATEGORIES, INITIAL_CATEGORIES);
  }
}

export async function saveCategory(category: Category): Promise<void> {
  if (isFirebaseReal) {
    const path = 'categories';
    try {
      await setDoc(doc(db, path, category.id), { ...category });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${path}/${category.id}`);
    }
  } else {
    const list = getLocalStorageData<Category>(LS_KEY_CATEGORIES, INITIAL_CATEGORIES);
    const index = list.findIndex(c => c.id === category.id);
    if (index >= 0) {
      list[index] = category;
    } else {
      list.push(category);
    }
    saveLocalStorageData<Category>(LS_KEY_CATEGORIES, list);
  }
}

// --- BANNERS ---
export async function getBanners(): Promise<Banner[]> {
  if (isFirebaseReal) {
    const path = 'banners';
    try {
      const querySnapshot = await getDocs(collection(db, path));
      const list: Banner[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ ...doc.data() } as Banner);
      });
      return list;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  } else {
    return getLocalStorageData<Banner>(LS_KEY_BANNERS, INITIAL_BANNERS);
  }
}

export async function saveBanner(banner: Banner): Promise<void> {
  if (isFirebaseReal) {
    const path = 'banners';
    try {
      await setDoc(doc(db, path, banner.id), { ...banner });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${path}/${banner.id}`);
    }
  } else {
    const list = getLocalStorageData<Banner>(LS_KEY_BANNERS, INITIAL_BANNERS);
    const index = list.findIndex(b => b.id === banner.id);
    if (index >= 0) {
      list[index] = banner;
    } else {
      list.push(banner);
    }
    saveLocalStorageData<Banner>(LS_KEY_BANNERS, list);
  }
}

// --- REVIEWS ---
export async function getReviews(productId: string): Promise<Review[]> {
  if (isFirebaseReal) {
    const path = 'reviews';
    try {
      const q = query(collection(db, path), where('productId', '==', productId));
      const querySnapshot = await getDocs(q);
      const list: Review[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ ...doc.data() } as Review);
      });
      return list;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  } else {
    const list = getLocalStorageData<Review>(LS_KEY_REVIEWS, INITIAL_REVIEWS);
    return list.filter(r => r.productId === productId);
  }
}

export async function addReview(review: Review): Promise<void> {
  if (isFirebaseReal) {
    const path = 'reviews';
    try {
      await setDoc(doc(db, path, review.id), { ...review });
      
      // Update the product rating (in background)
      try {
        const prodRef = doc(db, 'products', review.productId);
        const prodSnap = await getDocs(query(collection(db, 'products'), where('id', '==', review.productId)));
        if (!prodSnap.empty) {
          const productData = prodSnap.docs[0].data() as Product;
          const reviewsSnap = await getDocs(query(collection(db, 'reviews'), where('productId', '==', review.productId)));
          const reviewsList: Review[] = [];
          reviewsSnap.forEach(d => { reviewsList.push(d.data() as Review); });
          
          let totalRating = review.rating;
          reviewsList.forEach(r => { totalRating += r.rating; });
          const count = reviewsList.length + 1;
          const newRating = Number((totalRating / count).toFixed(1));
          
          await updateDoc(prodRef, {
            rating: newRating,
            reviewsCount: count
          });
        }
      } catch (e) {
        console.warn("Failed to update product rating on review insert:", e);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${path}/${review.id}`);
    }
  } else {
    // Local Update
    const list = getLocalStorageData<Review>(LS_KEY_REVIEWS, INITIAL_REVIEWS);
    list.push(review);
    saveLocalStorageData<Review>(LS_KEY_REVIEWS, list);

    // Update product rating
    const pList = getLocalStorageData<Product>(LS_KEY_PRODUCTS, INITIAL_PRODUCTS);
    const pIndex = pList.findIndex(p => p.id === review.productId);
    if (pIndex >= 0) {
      const prod = pList[pIndex];
      const pReviews = list.filter(r => r.productId === review.productId);
      const totalRating = pReviews.reduce((sum, r) => sum + r.rating, 0);
      prod.rating = Number((totalRating / pReviews.length).toFixed(1));
      prod.reviewsCount = pReviews.length;
      saveLocalStorageData<Product>(LS_KEY_PRODUCTS, pList);
    }
  }
}

// --- ORDERS ---
export async function getOrders(): Promise<Order[]> {
  if (isFirebaseReal) {
    const path = 'orders';
    try {
      const querySnapshot = await getDocs(collection(db, path));
      const list: Order[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ ...doc.data() } as Order);
      });
      return list;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  } else {
    return getLocalStorageData<Order>(LS_KEY_ORDERS, []);
  }
}

export async function createOrder(order: Order): Promise<void> {
  if (isFirebaseReal) {
    const path = 'orders';
    try {
      await setDoc(doc(db, path, order.id), { ...order });
      
      // Update products stock levels
      for (const item of order.items) {
        try {
          const prodRef = doc(db, 'products', item.productId);
          // Simple update logic
          await updateDoc(prodRef, {
            stock: Math.max(0, 10 - item.quantity) // fallback or read dynamic stock
          });
        } catch (e) {
          console.warn("Soft stock sync error:", e);
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${path}/${order.id}`);
    }
  } else {
    const list = getLocalStorageData<Order>(LS_KEY_ORDERS, []);
    list.push(order);
    saveLocalStorageData<Order>(LS_KEY_ORDERS, list);

    // Update stock levels
    const pList = getLocalStorageData<Product>(LS_KEY_PRODUCTS, INITIAL_PRODUCTS);
    order.items.forEach(item => {
      const pIndex = pList.findIndex(p => p.id === item.productId);
      if (pIndex >= 0) {
        pList[pIndex].stock = Math.max(0, pList[pIndex].stock - item.quantity);
      }
    });
    saveLocalStorageData<Product>(LS_KEY_PRODUCTS, pList);
  }
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
  if (isFirebaseReal) {
    const path = 'orders';
    try {
      await updateDoc(doc(db, path, orderId), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${path}/${orderId}`);
    }
  } else {
    const list = getLocalStorageData<Order>(LS_KEY_ORDERS, []);
    const index = list.findIndex(o => o.id === orderId);
    if (index >= 0) {
      list[index].status = status;
      saveLocalStorageData<Order>(LS_KEY_ORDERS, list);
    }
  }
}
