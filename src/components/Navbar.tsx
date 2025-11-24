"use client";

import React, { useState } from 'react'
import Link from "next/link"
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowBigLeft, Menu, X } from 'lucide-react'

const navigation = [
    { name: 'Find Talent', href: '/find' },
    { name: 'Post a Job', href: '/post' },
    { name: 'My Orders', href: '/dashboard' },
]

const Navbar = () => {
    // 1. Wallet State
    const [btnText, setBtnText] = useState("Connect Wallet");
    
    // 2. Mobile Menu State (Open/Closed)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Wallet Logic
    const handleWalletClick = () => {
        if (btnText === "Connect Wallet") {
            setBtnText("8hzyf...gyhs"); 
        } else {
            setBtnText("Connect Wallet");
        }
    };

    // Menu Toggle Logic
    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <nav className='border-b border-white/10 bg-[#0f1014] text-white sticky top-0 z-50 backdrop-blur-md'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex h-16 items-center justify-between'>
                    
                    {/* Logo Section */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <Link href={'/'} className="flex items-center gap-2">
                            <div className="relative w-8 h-8">

                                {/* <Image 
                                    src={'/icon.png'}
                                    alt='middlemint logo'
                                    width={32}
                                    height={32}
                                     className="w-8 h-8 bg-gradient-to-br from-purple-600 to-green-400 rounded-lg flex items-center justify-center font-bold text-white"
                                /> */}
                            </div>
                            <h2 className="font-bold text-xl tracking-tight hidden sm:block">Middlemint</h2>
                        </Link>
                    </div>

                    {/* Desktop Navigation (Hidden on Mobile) */}
                    <div className='hidden md:block'>
                        <div className="flex items-baseline space-x-4">
                            {navigation.map((item) => (
                                <Link 
                                    key={item.name}
                                    href={item.href}
                                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right Side: Wallet & Mobile Toggle */}
                    <div className="flex items-center gap-4">
                        
                        {/* Wallet Button (Visible on both) */}
                        <Button 
                            variant="default" 
                            size="default" // Smaller on mobile if needed
                            onClick={handleWalletClick}
                            className="bg-[#512da8] hover:bg-[#452690] text-white font-semibold transition-all text-xs sm:text-sm"
                        >
                            {btnText}
                        </Button>

                        {/* Mobile Menu Button (Hidden on Desktop) */}
                        <div className="md:hidden">
                            <button
                                onClick={toggleMenu}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 focus:outline-none"
                            >
                                {isMobileMenuOpen ? (
                                    <X className="block h-6 w-6" aria-hidden="true" />
                                ) : (
                                    <Menu className="block h-6 w-6" aria-hidden="true" />
                                )}
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* Mobile Menu Dropdown (Only visible when open) */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-white/10 bg-[#0f1014]">
                    <a href='/' className='text-gray-300 hover:text-white hover:bg-white/10 block px-3 py-2 rounded-md text-base font-medium' >Home</a>
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="text-gray-300 hover:text-white hover:bg-white/10 block px-3 py-2 rounded-md text-base font-medium"
                                onClick={() => setIsMobileMenuOpen(false)} // Close menu on click
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    )
}

export default Navbar;