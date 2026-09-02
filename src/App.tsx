/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TeamPhotoBanner } from './components/TeamPhotoBanner';
import { ModalitiesSection } from './components/ModalitiesSection';
import { ExploreHubSection } from './components/ExploreHubSection';
import { MiniAutoPhotoCarousel } from './components/MiniAutoPhotoCarousel';
import { CtaSection } from './components/CtaSection';
import { Footer } from './components/Footer';

// Full Dedicated Pages
import { AboutPage } from './pages/AboutPage';
import { TeamPage } from './pages/TeamPage';
import { CalendarPage } from './pages/CalendarPage';
import { GalleryPage } from './pages/GalleryPage';
import { FaqPage } from './pages/FaqPage';
import { CommunityPage } from './pages/CommunityPage';
import { AdminPage } from './pages/AdminPage';

// Action & Portal Modals
import { SupportModal } from './components/SupportModal';
import { ContactModal } from './components/ContactModal';
import { AthleteEnrollmentModal } from './components/AthleteEnrollmentModal';
import { MemberPortalModal } from './components/MemberPortalModal';
import { AdminCoachPortalModal } from './components/AdminCoachPortalModal';
import { CommunityNewsModal } from './components/CommunityNewsModal';

import { PhotosProvider } from './context/PhotosContext';
import { CommunityProvider } from './context/CommunityContext';

export type AppPage = 'home' | 'sobre' | 'equipe' | 'calendario' | 'galeria' | 'faq' | 'comunidade' | 'admin';

export default function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>(() => {
    if (typeof window === 'undefined') return 'home';
    const path = window.location.pathname.toLowerCase().replace(/^\//, '').replace(/\/$/, '');
    const hash = window.location.hash.toLowerCase().replace(/^#/, '');
    if (path === 'admin' || path === 'painel' || path === 'gestao' || hash === 'admin' || hash === 'painel') {
      return 'admin';
    }
    if (path === 'sobre' || path === 'sobre-nos' || hash === 'sobre' || hash === 'sobre-nos') return 'sobre';
    if (path === 'equipe' || hash === 'equipe') return 'equipe';
    if (path === 'calendario' || hash === 'calendario') return 'calendario';
    if (path === 'galeria' || hash === 'galeria') return 'galeria';
    if (path === 'faq' || hash === 'faq') return 'faq';
    if (path === 'comunidade' || hash === 'comunidade') return 'comunidade';
    return 'home';
  });

  // Action Modals
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [memberPortalOpen, setMemberPortalOpen] = useState(false);

  const handleNavigateToPage = (page: AppPage) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <PhotosProvider>
      <CommunityProvider>
        <div className="min-h-screen bg-[#060e1c] text-slate-100 selection:bg-[#d4af37] selection:text-[#060e1c]">
          {/* Header & Navbar */}
          <Navbar
            currentPage={currentPage}
            onNavigateToPage={handleNavigateToPage}
            onOpenSupportModal={() => setSupportModalOpen(true)}
            onOpenContactModal={() => setContactModalOpen(true)}
            onOpenMemberPortal={() => setMemberPortalOpen(true)}
          />

          {/* Main Content Area: Conditional rendering based on active Page */}
          <main>
            {currentPage === 'home' && (
              <>
                {/* 1. Hero Section */}
                <Hero
                  onOpenSupportModal={() => setSupportModalOpen(true)}
                  onOpenContactModal={() => setContactModalOpen(true)}
                  onOpenEnrollModal={() => setEnrollModalOpen(true)}
                />

                {/* 2. Team Photo Banner (Foto Oficial da Equipe na Home) */}
                <TeamPhotoBanner
                  onNavigateToAbout={() => handleNavigateToPage('sobre')}
                />

                {/* 3. Modalities & Training Programs (Natação S14 & Grade Horária) */}
                <ModalitiesSection onOpenEnrollModal={() => setEnrollModalOpen(true)} />

                {/* 4. Explore Hub Section (Links rápidos para equipe, calendário, galeria e faq) */}
                <ExploreHubSection
                  onNavigateToPage={handleNavigateToPage}
                  onOpenSupportModal={() => setSupportModalOpen(true)}
                />

                {/* 5. Mini Carrossel de Fotos Automático */}
                <MiniAutoPhotoCarousel
                  onOpenFullGallery={() => handleNavigateToPage('galeria')}
                />

                {/* 6. Call To Action */}
                <CtaSection
                  onOpenSupportModal={() => setSupportModalOpen(true)}
                  onOpenEnrollModal={() => setEnrollModalOpen(true)}
                />
              </>
            )}

            {currentPage === 'sobre' && (
              <AboutPage
                onBackToHome={() => handleNavigateToPage('home')}
                onOpenEnrollModal={() => setEnrollModalOpen(true)}
                onOpenSupportModal={() => setSupportModalOpen(true)}
                onNavigateToPage={handleNavigateToPage}
              />
            )}

            {currentPage === 'equipe' && (
              <TeamPage
                onBackToHome={() => handleNavigateToPage('home')}
                onOpenEnrollModal={() => setEnrollModalOpen(true)}
                onOpenSupportModal={() => setSupportModalOpen(true)}
                onNavigateToPage={handleNavigateToPage}
              />
            )}

            {currentPage === 'calendario' && (
              <CalendarPage
                onBackToHome={() => handleNavigateToPage('home')}
                onOpenEnrollModal={() => setEnrollModalOpen(true)}
                onNavigateToPage={handleNavigateToPage}
              />
            )}

            {currentPage === 'galeria' && (
              <GalleryPage
                onBackToHome={() => handleNavigateToPage('home')}
                onOpenSupportModal={() => setSupportModalOpen(true)}
                onNavigateToPage={handleNavigateToPage}
              />
            )}

            {currentPage === 'faq' && (
              <FaqPage
                onBackToHome={() => handleNavigateToPage('home')}
                onOpenContactModal={() => setContactModalOpen(true)}
                onOpenEnrollModal={() => setEnrollModalOpen(true)}
                onNavigateToPage={handleNavigateToPage}
              />
            )}

            {currentPage === 'comunidade' && (
              <CommunityPage
                onBackToHome={() => handleNavigateToPage('home')}
                onOpenSupportModal={() => setSupportModalOpen(true)}
                onNavigateToPage={handleNavigateToPage}
              />
            )}

            {currentPage === 'admin' && (
              <AdminPage
                onBackToHome={() => handleNavigateToPage('home')}
              />
            )}
          </main>

          {/* Footer */}
          <Footer
            onNavigateToPage={handleNavigateToPage}
            onOpenSupportModal={() => setSupportModalOpen(true)}
            onOpenContactModal={() => setContactModalOpen(true)}
            onOpenMemberPortal={() => setMemberPortalOpen(true)}
          />

          {/* Action Modals */}
          <SupportModal
            isOpen={supportModalOpen}
            onClose={() => setSupportModalOpen(false)}
          />

          <ContactModal
            isOpen={contactModalOpen}
            onClose={() => setContactModalOpen(false)}
          />

          <AthleteEnrollmentModal
            isOpen={enrollModalOpen}
            onClose={() => setEnrollModalOpen(false)}
          />

          <MemberPortalModal
            isOpen={memberPortalOpen}
            onClose={() => setMemberPortalOpen(false)}
          />

          <CommunityNewsModal />

          <AdminCoachPortalModal />
        </div>
      </CommunityProvider>
    </PhotosProvider>
  );
}