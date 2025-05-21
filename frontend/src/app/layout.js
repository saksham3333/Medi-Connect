import { Providers } from './providers';
import './globals.scss';

export const metadata = {
  title: 'Medi Connect',
  description: 'HB Web Studio Major Project',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          href="/icons/medical-symbol.ico"
          type="image/svg+xml"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
