
import { firestore, storage } from './firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  serverTimestamp, 
  increment 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { 
  ref, 
  uploadString, 
  getDownloadURL 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';
import { Product, Order, CartItem } from './types';

const COLLECTIONS = {
  PRODUCTS: 'products',
  ORDERS: 'orders',
};

export const db = {
  init: async () => {},

  getProducts: async (): Promise<Product[]> => {
    try {
      const q = query(collection(firestore, COLLECTIONS.PRODUCTS), orderBy('name'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(d => ({ ...d.data(), id: d.id } as Product));
    } catch (error) {
      console.error("Error fetching products:", error);
      throw new Error("Could not load products from cloud.");
    }
  },

  getOrders: async (): Promise<Order[]> => {
    try {
      const q = query(collection(firestore, COLLECTIONS.ORDERS), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(d => {
        const data = d.data();
        return { 
          ...data, 
          id: d.id,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()
        } as Order;
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
  },

  createOrder: async (cartItems: CartItem[]): Promise<Order> => {
    try {
      const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const orderIdShort = `IPH-${Math.floor(1000 + Math.random() * 9000)}`;

      const orderData = {
        orderNumber: orderIdShort,
        items: cartItems.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          size: item.selectedSize || 'Standard',
          color: item.selectedColor || 'N/A'
        })),
        total,
        status: 'Pending',
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(firestore, COLLECTIONS.ORDERS), orderData);

      for (const item of cartItems) {
        try {
          const productRef = doc(firestore, COLLECTIONS.PRODUCTS, item.product.id);
          await updateDoc(productRef, {
            stock: increment(-item.quantity)
          });
        } catch (e) {
          console.warn(`Failed to update stock for ${item.product.id}`);
        }
      }

      return { ...orderData, id: docRef.id, createdAt: new Date().toISOString() } as unknown as Order;
    } catch (error: any) {
      throw new Error(`Order Creation Failed: ${error.message}`);
    }
  },

  addProduct: async (product: Omit<Product, 'id'>): Promise<Product> => {
    try {
      // 1. Upload Images to Storage
      const imageUrls = [];
      for (let i = 0; i < product.images.length; i++) {
        const img = product.images[i];
        if (img.startsWith('data:')) {
          const fileName = `products/${Date.now()}_${i}.jpg`;
          const storageRef = ref(storage, fileName);
          const uploadResult = await uploadString(storageRef, img, 'data_url');
          const url = await getDownloadURL(uploadResult.ref);
          imageUrls.push(url);
        } else {
          imageUrls.push(img);
        }
      }

      // 2. Prepare Firestore Document (Ensuring no 'id' is present for addDoc)
      const { images, ...rest } = product;
      const docData = {
        ...rest,
        images: imageUrls,
        createdAt: serverTimestamp(),
        // Ensure arrays exist even if empty
        sizes: Array.isArray(rest.sizes) ? rest.sizes : [],
        colors: Array.isArray(rest.colors) ? rest.colors : []
      };

      // 3. Save to Firestore
      const docRef = await addDoc(collection(firestore, COLLECTIONS.PRODUCTS), docData);
      return { ...docData, id: docRef.id } as unknown as Product;
    } catch (error: any) {
      console.error("Firebase AddProduct Error:", error);
      throw new Error(`Product Save Failed: ${error.message}. Ensure Firestore & Storage rules allow writes.`);
    }
  },

  updateProduct: async (product: Product): Promise<Product> => {
    try {
      const productRef = doc(firestore, COLLECTIONS.PRODUCTS, product.id);
      
      const finalImageUrls = [];
      for (let i = 0; i < product.images.length; i++) {
        const img = product.images[i];
        if (img.startsWith('data:')) {
          const fileName = `products/${Date.now()}_${i}.jpg`;
          const storageRef = ref(storage, fileName);
          const uploadResult = await uploadString(storageRef, img, 'data_url');
          const url = await getDownloadURL(uploadResult.ref);
          finalImageUrls.push(url);
        } else {
          finalImageUrls.push(img);
        }
      }

      // Sanitize object for update (cannot update document with 'id' in the body)
      const updateData: any = { ...product, images: finalImageUrls };
      delete updateData.id;

      await updateDoc(productRef, updateData);
      return { ...updateData, id: product.id } as Product;
    } catch (error: any) {
      throw new Error(`Cloud Update Failed: ${error.message}`);
    }
  },

  deleteProduct: async (id: string): Promise<void> => {
    try {
      const productRef = doc(firestore, COLLECTIONS.PRODUCTS, id);
      await deleteDoc(productRef);
    } catch (error: any) {
      throw new Error(`Cloud Delete Failed: ${error.message}`);
    }
  },

  updateOrderStatus: async (orderId: string, status: Order['status']): Promise<void> => {
    try {
      const orderRef = doc(firestore, COLLECTIONS.ORDERS, orderId);
      await updateDoc(orderRef, { status });
    } catch (error: any) {
      throw new Error(`Status Update Failed: ${error.message}`);
    }
  }
};
