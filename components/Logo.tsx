'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center"
      aria-label="IoT Centre"
    >
      <Image
        src="/iot-centre-logo.jpg"
        alt="IoT Centre"
        width={210}
        height={195}
        priority
        className="h-16 w-auto object-contain"
      />
    </Link>
  );
}
