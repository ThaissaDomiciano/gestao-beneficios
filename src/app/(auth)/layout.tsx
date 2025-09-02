export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen grid place-items-center bg-gradient-to-br from-[#065F46] to-[#057C58]">
            {children}
        </div>;
}
