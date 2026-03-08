import { GoogleAdSense } from "@/components/google-adsense";

const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {ADSENSE_ID && (
          <>
            <meta name="google-adsense-account" content={ADSENSE_ID} />
            <GoogleAdSense adsenseId={ADSENSE_ID} />
          </>
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
