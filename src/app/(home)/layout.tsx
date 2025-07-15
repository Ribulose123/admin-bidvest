import NavbarAuth from "../admin content/NavbarAuth";
import "../globals.css"; // Import the global CSS file

export const metadata = {
  title: "Bidvest",
  description: "Authentication pages for login and signup",
  icons: [
    { rel: "icon", url: "/img/logo3.jpg" },
    { rel: "apple-touch-icon", url: "/img/logo3.jpg" },
    { rel: "shortcut icon", url: "/img/logo3.jpg" }
  ]
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="auth-layout">
            <NavbarAuth/>
          {children}
        </div>
      </body>
    </html>
  );
}