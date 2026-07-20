import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { ChevronRight, Calendar, Clock } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AppRouterProps } from '@/entities';

export default function EmailPage(props: AppRouterProps) {

  return (
    <div className="min-h-screen bg-background font-paragraph selection:bg-primary/20 selection:text-primary">
      <Header {...props}/>

      <main id="main-content">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Trang Email</h1>
            <p className="text-lg text-muted-foreground font-paragraph">
              Thông tin về dịch vụ email và đăng ký email
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-b from-transparent to-background" />
      </section>
      </main>
    </div>
  );
}
