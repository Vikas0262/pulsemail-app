import "./globals.css";

export const metadata = {
  title: "PulseMail",
  description: "Email Campaign Manager",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}