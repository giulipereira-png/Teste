import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, doc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot, collection, handleFirestoreError, OperationType } from '../lib/firebase';
import { AdminUser } from '../types';
import { INITIAL_ADMIN_USERS } from '../data/initialCommunityData';
import { optimizeImage } from '../lib/imageOptimizer';

export interface SitePhotoData {
  id: string;
  title: string;
  category: string;
  url: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface GalleryPhotoItem {
  id: string;
  title: string;
  category: string;
  url: string;
  date?: string;
  createdAt: string;
}

export const DEFAULT_PHOTOS: Record<string, { title: string; category: string; defaultUrl: string; fallbackList: string[] }> = {
  about_team: {
    title: 'Sobre a ACEDEP (Foto Oficial da Equipe 1)',
    category: 'Quem Somos',
    defaultUrl: '/IMG_4378.jpeg',
    fallbackList: ['/IMG_4378.jpeg', 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=1200&q=85'],
  },
  about_team_2: {
    title: 'Sobre a ACEDEP (Treinos & Piscinas 2)',
    category: 'Quem Somos',
    defaultUrl: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=1200&q=80',
    fallbackList: ['https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=1200&q=80', '/IMG_4378.jpeg'],
  },
  about_team_3: {
    title: 'Sobre a ACEDEP (Pódios & Premiações 3)',
    category: 'Quem Somos',
    defaultUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=80',
    fallbackList: ['https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=80', '/IMG_4378.jpeg'],
  },
  modality_iniciacao: {
    title: 'Iniciação Esportiva (Aperfeiçoamento)',
    category: 'Modalidades & Treinos',
    defaultUrl: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=800&q=80',
    fallbackList: ['https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=800&q=80', '/IMG_4378.jpeg'],
  },
  modality_alto_rendimento: {
    title: 'Natação - Alto Rendimento (Competição S14/S21)',
    category: 'Modalidades & Treinos',
    defaultUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80',
    fallbackList: ['https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80', '/IMG_4378.jpeg'],
  },
  staff_enio: {
    title: 'Prof. Enio Salvador Sanches (Coordenador Técnico)',
    category: 'Equipe Técnica',
    defaultUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
    fallbackList: ['https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80'],
  },
  staff_giuliana: {
    title: 'Profª. Giuliana Sousa (Técnica de Natação)',
    category: 'Equipe Técnica',
    defaultUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    fallbackList: ['https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80'],
  },
  staff_tatiana: {
    title: 'Profª. Tatiana Farias (Técnica Iniciação Esportiva)',
    category: 'Equipe Técnica',
    defaultUrl: 'https://images.unsplash.com/photo-1580894732488-874ff095f9c4?auto=format&fit=crop&w=600&q=80',
    fallbackList: ['https://images.unsplash.com/photo-1580894732488-874ff095f9c4?auto=format&fit=crop&w=600&q=80'],
  },
  carousel_1: {
    title: 'Carrossel Foto 1 (Equipe ACEDEP)',
    category: 'Carrossel de Fotos (Rodapé)',
    defaultUrl: '/IMG_4378.jpeg',
    fallbackList: ['/IMG_4378.jpeg', 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=800&q=80'],
  },
  carousel_2: {
    title: 'Carrossel Foto 2 (Treinos CPB)',
    category: 'Carrossel de Fotos (Rodapé)',
    defaultUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80',
    fallbackList: ['https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80', '/IMG_4378.jpeg'],
  },
  carousel_3: {
    title: 'Carrossel Foto 3 (Conquistas & Pódios)',
    category: 'Carrossel de Fotos (Rodapé)',
    defaultUrl: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=800&q=80',
    fallbackList: ['https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=800&q=80', '/IMG_4378.jpeg'],
  },
  carousel_4: {
    title: 'Carrossel Foto 4 (Piscina Olímpica 50m)',
    category: 'Carrossel de Fotos (Rodapé)',
    defaultUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80',
    fallbackList: ['https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80', '/IMG_4378.jpeg'],
  },
  carousel_5: {
    title: 'Carrossel Foto 5 (Superação & Inclusão)',
    category: 'Carrossel de Fotos (Rodapé)',
    defaultUrl: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=800&q=80',
    fallbackList: ['https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=800&q=80', '/IMG_4378.jpeg'],
  },
  carousel_6: {
    title: 'Carrossel Foto 6 (Espírito Esportivo)',
    category: 'Carrossel de Fotos (Rodapé)',
    defaultUrl: '/IMG_4378.jpeg',
    fallbackList: ['/IMG_4378.jpeg', 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80'],
  },
};

export const INITIAL_GALLERY_PHOTOS: GalleryPhotoItem[] = [
  {
    id: 'gal-1',
    title: 'Equipe ACEDEP Reunida',
    category: 'Equipe Oficial',
    url: '/IMG_4378.jpeg',
    date: 'Campeonatos & Conquistas',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'gal-2',
    title: 'Iniciação Esportiva e Aperfeiçoamento',
    category: 'Iniciação Esportiva',
    url: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=1200&q=85',
    date: 'Treinos Técnicos',
    createdAt: '2026-01-02T00:00:00.000Z',
  },
  {
    id: 'gal-3',
    title: 'Alto Rendimento e Foco na Performance',
    category: 'Alto Rendimento',
    url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=85',
    date: 'Classes S14 & S21',
    createdAt: '2026-01-03T00:00:00.000Z',
  },
  {
    id: 'gal-4',
    title: 'Superação e Disciplina nas Piscinas',
    category: 'Treinamento',
    url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=85',
    date: 'Piscina Olímpica',
    createdAt: '2026-01-04T00:00:00.000Z',
  },
  {
    id: 'gal-5',
    title: 'Conquista da Autonomia e Técnica',
    category: 'Iniciação Esportiva',
    url: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=1200&q=85',
    date: 'Formação Contínua',
    createdAt: '2026-01-05T00:00:00.000Z',
  },
];

interface PhotosContextType {
  photos: Record<string, string>;
  galleryPhotos: GalleryPhotoItem[];
  adminUsers: AdminUser[];
  currentAdminProfile: AdminUser | null;
  isLoading: boolean;
  isFirebaseConnected: boolean;
  isAdminAuthenticated: boolean;
  adminModalOpen: boolean;
  openAdminModal: () => void;
  closeAdminModal: () => void;
  loginAdmin: (pin: string, email?: string) => Promise<boolean>;
  logoutAdmin: () => void;
  savePhotoToDatabase: (photoId: string, dataUrl: string, title?: string) => Promise<boolean>;
  resetPhotoToDefault: (photoId: string) => Promise<boolean>;
  getPhotoUrl: (photoId: string) => string;
  addGalleryPhoto: (data: { title: string; category: string; url: string; date?: string }) => Promise<boolean>;
  deleteGalleryPhoto: (photoId: string) => Promise<boolean>;
  updateAdminPin: (newPin: string) => Promise<boolean>;
  addAdminUser: (admin: Omit<AdminUser, 'id' | 'createdAt'>) => Promise<boolean>;
  updateAdminUser: (id: string, updates: Partial<AdminUser>) => Promise<boolean>;
  deleteAdminUser: (id: string) => Promise<boolean>;
}

const PhotosContext = createContext<PhotosContextType | undefined>(undefined);

export const PhotosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [photos, setPhotos] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    Object.keys(DEFAULT_PHOTOS).forEach((k) => {
      try {
        const cached = localStorage.getItem('acedep_photo_' + k);
        initial[k] = cached || DEFAULT_PHOTOS[k].defaultUrl;
      } catch {
        initial[k] = DEFAULT_PHOTOS[k].defaultUrl;
      }
    });
    return initial;
  });

  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhotoItem[]>(INITIAL_GALLERY_PHOTOS);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(INITIAL_ADMIN_USERS);
  const [currentAdminProfile, setCurrentAdminProfile] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('acedep_admin_profile') || sessionStorage.getItem('acedep_admin_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    try {
      return localStorage.getItem('acedep_admin_auth') === 'true' || sessionStorage.getItem('acedep_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  // Subscribe to real-time updates from Firestore collection `site_photos`
  useEffect(() => {
    let unsubscribeSitePhotos = () => {};
    let unsubscribeGallery = () => {};

    try {
      // 1. Site photos
      const photosCollection = collection(db, 'site_photos');
      const sitePhotosInitDocRef = doc(db, 'settings', 'site_photos_init');

      getDoc(sitePhotosInitDocRef)
        .then(async (initSnap) => {
          if (!initSnap.exists()) {
            try {
              for (const [photoKey, photoInfo] of Object.entries(DEFAULT_PHOTOS)) {
                const existingSnap = await getDoc(doc(db, 'site_photos', photoKey));
                if (!existingSnap.exists()) {
                  await setDoc(doc(db, 'site_photos', photoKey), {
                    id: photoKey,
                    title: photoInfo.title,
                    category: photoInfo.category,
                    url: photoInfo.defaultUrl,
                    updatedAt: new Date().toISOString(),
                    updatedBy: 'Sistema ACEDEP',
                  });
                }
              }
              await setDoc(sitePhotosInitDocRef, { initialized: true, seededAt: new Date().toISOString() });
            } catch (seedErr) {
              handleFirestoreError(seedErr, OperationType.WRITE, 'site_photos_seed');
            }
          }
        })
        .catch((err) => {
          handleFirestoreError(err, OperationType.GET, 'settings/site_photos_init');
        });

      unsubscribeSitePhotos = onSnapshot(
        photosCollection,
        (snapshot) => {
          setIsFirebaseConnected(true);
          setIsLoading(false);
          const updated: Record<string, string> = {};

          Object.keys(DEFAULT_PHOTOS).forEach((k) => {
            try {
              const cached = localStorage.getItem('acedep_photo_' + k);
              updated[k] = cached || DEFAULT_PHOTOS[k].defaultUrl;
            } catch {
              updated[k] = DEFAULT_PHOTOS[k].defaultUrl;
            }
          });

          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as SitePhotoData;
            if (data && data.url) {
              updated[docSnap.id] = data.url;
              try {
                localStorage.setItem('acedep_photo_' + docSnap.id, data.url);
              } catch {}
            }
          });

          setPhotos(updated);
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'site_photos');
          setIsFirebaseConnected(false);
          setIsLoading(false);
        }
      );

      // 2. Gallery photos
      const galleryCollection = collection(db, 'gallery');
      const galleryInitDocRef = doc(db, 'settings', 'gallery_init');

      // Check if initialization has occurred; if not, seed initial photos to Firestore
      getDoc(galleryInitDocRef)
        .then(async (initSnap) => {
          if (!initSnap.exists()) {
            try {
              for (const photo of INITIAL_GALLERY_PHOTOS) {
                await setDoc(doc(db, 'gallery', photo.id), photo);
              }
              await setDoc(galleryInitDocRef, { initialized: true, seededAt: new Date().toISOString() });
            } catch (seedErr) {
              handleFirestoreError(seedErr, OperationType.WRITE, 'gallery_seed');
            }
          }
        })
        .catch((err) => {
          handleFirestoreError(err, OperationType.GET, 'settings/gallery_init');
        });

      unsubscribeGallery = onSnapshot(
        galleryCollection,
        (snapshot) => {
          const list: GalleryPhotoItem[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as GalleryPhotoItem;
            if (data && data.url) {
              list.push({
                ...data,
                id: docSnap.id,
              });
            }
          });

          // Sort by createdAt descending
          list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

          if (list.length > 0) {
            setGalleryPhotos(list);
          } else {
            // Check if user has explicitly deleted all photos or if it's unseeded
            getDoc(galleryInitDocRef)
              .then((initSnap) => {
                if (initSnap.exists()) {
                  setGalleryPhotos([]); // Empty because user deleted all photos
                } else {
                  setGalleryPhotos(INITIAL_GALLERY_PHOTOS);
                }
              })
              .catch(() => {
                setGalleryPhotos([]);
              });
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'gallery');
        }
      );

      // 3. Admin Users
      let unsubscribeAdminUsers = () => {};
      const adminsCollection = collection(db, 'admin_users');
      const adminInitDocRef = doc(db, 'settings', 'admin_users_init');

      getDoc(adminInitDocRef)
        .then(async (initSnap) => {
          if (!initSnap.exists()) {
            try {
              for (const adm of INITIAL_ADMIN_USERS) {
                await setDoc(doc(db, 'admin_users', adm.id), adm);
              }
              await setDoc(adminInitDocRef, { initialized: true, seededAt: new Date().toISOString() });
            } catch (seedErr) {
              handleFirestoreError(seedErr, OperationType.WRITE, 'admin_users_seed');
            }
          }
        })
        .catch((err) => {
          handleFirestoreError(err, OperationType.GET, 'settings/admin_users_init');
        });

      unsubscribeAdminUsers = onSnapshot(
        adminsCollection,
        (snapshot) => {
          const list: AdminUser[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as AdminUser;
            if (data && data.name) {
              list.push({
                ...data,
                id: docSnap.id,
              });
            }
          });

          if (list.length > 0) {
            setAdminUsers(list);
          } else {
            setAdminUsers(INITIAL_ADMIN_USERS);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'admin_users');
        }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'firestore_init');
      setIsLoading(false);
    }

    return () => {
      unsubscribeSitePhotos();
      unsubscribeGallery();
    };
  }, []);

  // Secret triggers: URL pathname (/admin, /painel), URL Hash (#admin), query params (?admin=true), and keyboard shortcut (Ctrl+Shift+A)
  useEffect(() => {
    // 1. Check URL on mount and popstate/hash changes
    const checkUrlTrigger = () => {
      if (typeof window === 'undefined') return;
      const pathname = (window.location.pathname || '').toLowerCase();
      const hash = (window.location.hash || '').toLowerCase();
      const params = new URLSearchParams(window.location.search);
      
      const isAdminPath = pathname === '/admin' || pathname === '/painel' || pathname === '/gestao' || pathname.startsWith('/admin/');
      const isAdminHash = hash === '#admin' || hash === '#gestao' || hash === '#painel';
      const isAdminQuery = params.get('admin') === 'true' || params.get('admin') === '1' || params.get('painel') === 'true';

      if (isAdminPath || isAdminHash || isAdminQuery) {
        setAdminModalOpen(true);
      }
    };

    checkUrlTrigger();
    window.addEventListener('hashchange', checkUrlTrigger);
    window.addEventListener('popstate', checkUrlTrigger);

    // 2. Keyboard shortcut: Ctrl + Shift + A (or Cmd + Shift + A)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setAdminModalOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', checkUrlTrigger);
      window.removeEventListener('popstate', checkUrlTrigger);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const loginAdmin = async (pin: string, email?: string): Promise<boolean> => {
    const normalizedPin = pin.trim();
    const normalizedEmail = (email || '').trim().toLowerCase();
    if (!normalizedPin) return false;

    // 1. Check if matches any active admin in adminUsers collection
    const matchedAdmin = adminUsers.find(
      (a) => a.isActive && a.pin === normalizedPin && (!normalizedEmail || a.email.toLowerCase() === normalizedEmail)
    );

    if (matchedAdmin) {
      setIsAdminAuthenticated(true);
      setCurrentAdminProfile(matchedAdmin);
      try {
        localStorage.setItem('acedep_admin_auth', 'true');
        localStorage.setItem('acedep_admin_profile', JSON.stringify(matchedAdmin));
        sessionStorage.setItem('acedep_admin_auth', 'true');
        sessionStorage.setItem('acedep_admin_profile', JSON.stringify(matchedAdmin));
      } catch {}
      // update lastLogin in firestore non-blockingly
      updateDoc(doc(db, 'admin_users', matchedAdmin.id), {
        lastLogin: new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }).catch(() => {});
      return true;
    }

    // 2. Check remote master pin in settings/admin
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'admin'));
      if (settingsDoc.exists() && settingsDoc.data().adminPin) {
        const storedPin = settingsDoc.data().adminPin;
        if (storedPin === normalizedPin) {
          setIsAdminAuthenticated(true);
          const masterAdmin = adminUsers[0] || {
            id: 'admin-master',
            name: 'Super Admin ACEDEP',
            email: 'giuli.pereira@gmail.com',
            role: 'Super Admin',
            pin: storedPin,
            createdAt: new Date().toISOString(),
            isActive: true,
          };
          setCurrentAdminProfile(masterAdmin);
          try {
            localStorage.setItem('acedep_admin_auth', 'true');
            localStorage.setItem('acedep_admin_profile', JSON.stringify(masterAdmin));
            sessionStorage.setItem('acedep_admin_auth', 'true');
            sessionStorage.setItem('acedep_admin_profile', JSON.stringify(masterAdmin));
          } catch {}
          return true;
        }
        return false;
      }
    } catch (e) {
      console.warn('Could not verify remote admin pin from Firestore:', e);
    }

    // 3. Fallback PINs (initial bootstrap)
    if (['acedep1990', '1990', 'admin1990', '2026'].includes(normalizedPin)) {
      setIsAdminAuthenticated(true);
      const fallbackAdmin: AdminUser = {
        id: 'admin-master-1',
        name: 'Coordenação Geral ACEDEP',
        email: 'giuli.pereira@gmail.com',
        role: 'Super Admin',
        pin: normalizedPin,
        createdAt: new Date().toISOString(),
        isActive: true,
      };
      setCurrentAdminProfile(fallbackAdmin);
      try {
        localStorage.setItem('acedep_admin_auth', 'true');
        localStorage.setItem('acedep_admin_profile', JSON.stringify(fallbackAdmin));
        sessionStorage.setItem('acedep_admin_auth', 'true');
        sessionStorage.setItem('acedep_admin_profile', JSON.stringify(fallbackAdmin));
      } catch {}
      return true;
    }

    return false;
  };

  const addAdminUser = async (admin: Omit<AdminUser, 'id' | 'createdAt'>): Promise<boolean> => {
    try {
      const id = 'admin_' + Date.now();
      const newAdmin: AdminUser = {
        ...admin,
        id,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'admin_users', id), newAdmin);
      setAdminUsers((prev) => [...prev.filter((a) => a.id !== id), newAdmin]);
      return true;
    } catch (err) {
      console.error('Error adding admin user to Firestore:', err);
      return false;
    }
  };

  const updateAdminUser = async (id: string, updates: Partial<AdminUser>): Promise<boolean> => {
    try {
      await updateDoc(doc(db, 'admin_users', id), updates);
      setAdminUsers((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
      );
      if (currentAdminProfile?.id === id) {
        const updated = { ...currentAdminProfile, ...updates };
        setCurrentAdminProfile(updated);
        try {
          localStorage.setItem('acedep_admin_profile', JSON.stringify(updated));
          sessionStorage.setItem('acedep_admin_profile', JSON.stringify(updated));
        } catch {}
      }
      return true;
    } catch (err) {
      console.error('Error updating admin user:', err);
      return false;
    }
  };

  const deleteAdminUser = async (id: string): Promise<boolean> => {
    try {
      if (adminUsers.length <= 1) {
        alert('Não é permitido excluir o único administrador do sistema.');
        return false;
      }
      await deleteDoc(doc(db, 'admin_users', id));
      setAdminUsers((prev) => prev.filter((a) => a.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting admin user:', err);
      return false;
    }
  };

  const updateAdminPin = async (newPin: string): Promise<boolean> => {
    const cleanPin = newPin.trim();
    if (!cleanPin || cleanPin.length < 4) {
      return false;
    }

    try {
      await setDoc(
        doc(db, 'settings', 'admin'),
        {
          adminPin: cleanPin,
          updatedAt: new Date().toISOString(),
          updatedBy: 'Administrador ACEDEP',
        },
        { merge: true }
      );
      return true;
    } catch (err) {
      console.error('Error updating admin PIN in Firestore:', err);
      return false;
    }
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    setCurrentAdminProfile(null);
    try {
      localStorage.removeItem('acedep_admin_auth');
      localStorage.removeItem('acedep_admin_profile');
      sessionStorage.removeItem('acedep_admin_auth');
      sessionStorage.removeItem('acedep_admin_profile');
    } catch {}
  };

  const savePhotoToDatabase = async (
    photoId: string,
    dataUrl: string,
    title?: string
  ): Promise<boolean> => {
    try {
      const optimizedUrl = await optimizeImage(dataUrl, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.72,
        maxSizeBytes: 450 * 1024,
      });
      const photoMeta = DEFAULT_PHOTOS[photoId];

      const payload: SitePhotoData = {
        id: photoId,
        title: title || photoMeta?.title || photoId,
        category: photoMeta?.category || 'Geral',
        url: optimizedUrl,
        updatedAt: new Date().toISOString(),
        updatedBy: currentAdminProfile?.name || 'Administrador ACEDEP',
      };

      await setDoc(doc(db, 'site_photos', photoId), payload, { merge: true });

      setPhotos((prev) => ({
        ...prev,
        [photoId]: optimizedUrl,
      }));
      try {
        localStorage.setItem('acedep_photo_' + photoId, optimizedUrl);
      } catch {}

      return true;
    } catch (err) {
      console.error('Error saving photo to Firestore:', err);
      handleFirestoreError(err, OperationType.WRITE, `site_photos/${photoId}`);
      return false;
    }
  };

  const resetPhotoToDefault = async (photoId: string): Promise<boolean> => {
    try {
      const defaultUrl = DEFAULT_PHOTOS[photoId]?.defaultUrl || '';
      if (!defaultUrl) return false;

      await setDoc(
        doc(db, 'site_photos', photoId),
        {
          id: photoId,
          url: defaultUrl,
          updatedAt: new Date().toISOString(),
          updatedBy: 'Reset Padrão',
        },
        { merge: true }
      );

      setPhotos((prev) => ({
        ...prev,
        [photoId]: defaultUrl,
      }));
      try {
        localStorage.removeItem('acedep_photo_' + photoId);
      } catch {}

      return true;
    } catch (err) {
      console.error('Error resetting photo in Firestore:', err);
      handleFirestoreError(err, OperationType.WRITE, `site_photos/${photoId}`);
      return false;
    }
  };

  const addGalleryPhoto = async (data: {
    title: string;
    category: string;
    url: string;
    date?: string;
  }): Promise<boolean> => {
    try {
      const optimizedUrl = await optimizeImage(data.url, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.72,
        maxSizeBytes: 450 * 1024,
      });
      const photoId = 'photo_' + Date.now();
      const payload: GalleryPhotoItem = {
        id: photoId,
        title: data.title || 'Foto ACEDEP',
        category: data.category || 'Geral',
        url: optimizedUrl,
        date: data.date || new Date().toLocaleDateString('pt-BR'),
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'gallery', photoId), payload);

      setGalleryPhotos((prev) => [payload, ...prev.filter((p) => p.id !== photoId)]);
      return true;
    } catch (err) {
      console.error('Error adding photo to gallery Firestore:', err);
      handleFirestoreError(err, OperationType.CREATE, 'gallery');
      return false;
    }
  };

  const deleteGalleryPhoto = async (photoId: string): Promise<boolean> => {
    try {
      // Mark init as true so empty state doesn't reset to defaults
      const galleryInitDocRef = doc(db, 'settings', 'gallery_init');
      setDoc(galleryInitDocRef, { initialized: true }, { merge: true }).catch(() => {});

      await deleteDoc(doc(db, 'gallery', photoId));
      setGalleryPhotos((prev) => prev.filter((p) => p.id !== photoId));
      return true;
    } catch (err) {
      console.error('Error deleting photo from gallery Firestore:', err);
      // Still remove from local state to ensure UI responsiveness
      setGalleryPhotos((prev) => prev.filter((p) => p.id !== photoId));
      return true;
    }
  };

  const getPhotoUrl = (photoId: string): string => {
    return photos[photoId] || DEFAULT_PHOTOS[photoId]?.defaultUrl || '';
  };

  return (
    <PhotosContext.Provider
      value={{
        photos,
        galleryPhotos,
        adminUsers,
        currentAdminProfile,
        isLoading,
        isFirebaseConnected,
        isAdminAuthenticated,
        adminModalOpen,
        openAdminModal: () => setAdminModalOpen(true),
        closeAdminModal: () => setAdminModalOpen(false),
        loginAdmin,
        logoutAdmin,
        savePhotoToDatabase,
        resetPhotoToDefault,
        getPhotoUrl,
        addGalleryPhoto,
        deleteGalleryPhoto,
        updateAdminPin,
        addAdminUser,
        updateAdminUser,
        deleteAdminUser,
      }}
    >
      {children}
    </PhotosContext.Provider>
  );
};

export const usePhotos = () => {
  const context = useContext(PhotosContext);
  if (!context) {
    throw new Error('usePhotos must be used within a PhotosProvider');
  }
  return context;
};
