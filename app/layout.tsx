import type { Metadata } from 'next';
import './globals.css';
import './ponpon.css';
import './storybook.css';
import './refinements.css';
import './handdrawn.css';
export const metadata:Metadata={title:'Study Burger — Flashcards & review',description:'Turn study material into flashcards. Build lasting knowledge with active recall and spaced repetition.',icons:{icon:'/favicon.svg'},verification:{google:'qIQSeGylOL35T281pU_HW6NUQ5BrWcdjdqUlYAie5CQ'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
