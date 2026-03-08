import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { GoogleAnalytics } from "@/components/google-analytics";
import { Footer } from "@/components/footer";
import { generateMetadata as generateSEOMetadata, HreflangLinks, PerformancePreconnects } from "@/components/seo/seo-head";
import React from "react";
import "../globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID;

/**
 * Generate SEO-optimized metadata for each locale
 */
export async function generateMetadata({params}: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const {locale} = await params;

    return {
        icons: {
            icon: [
                {url: "/favicon.svg", sizes: "512x512", type: "image/png"},
            ],
            apple: [{url: "/favicon.svg", sizes: "180x180", type: "image/png"}],
        },
        other: {
            ...(ADSENSE_ID && {'google-adsense-account': ADSENSE_ID}),
        },
        ...generateSEOMetadata({locale})
    };
}

type Props = {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
    return [{locale: 'en'}, {locale: 'zh'}];
}

export default async function LocaleLayout({
  children,
  params
}: Props) {
  const { locale } = await params;
  const messages = await getMessages();

    return (
        <>
            <PerformancePreconnects/>
            <HreflangLinks locale={locale}/>
            <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <GoogleAnalytics gaId={GA_ID || ''}/>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    <NextIntlClientProvider messages={messages}>
                        <div className="flex min-h-screen flex-col">
                            <div className="flex-1">
                                {children}
                            </div>
                            <Footer/>
                        </div>
                        <Toaster richColors position="top-center"/>
                    </NextIntlClientProvider>
                </ThemeProvider>
            </div>
        </>
    );
}
