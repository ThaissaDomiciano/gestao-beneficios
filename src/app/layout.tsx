import './globals.css';
import type { Metadata } from 'next';
import Providers from './providers'


export const metadata: Metadata = {title: 'Gestão de Benefícios'}

export default function RootLayout({children}: { children: React.ReactNode }) {
  return (
    <html lang='pt-BR'  className="h-dvh">
      <body className="h-full overflow-x-hidden [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full">
        <Providers>
          {children}
        </Providers>
        </body>   
    </html>
    
  )
}