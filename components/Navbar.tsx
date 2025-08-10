"use client";

import Link from "next/link";
import { Nav } from "react-day-picker";
import { Button } from "./ui/button";
import { useState } from "react";
import { is } from "date-fns/locale";
import { Menu, X } from "lucide-react";
import { NavItems } from "./NavItems";
import { SignInButton,SignUpButton, SignedIn ,SignedOut,UserButton } from "@clerk/nextjs";

export default function Navbar(){
  const [isOpen,setIsOpen]=useState(false);
  return(
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-primary">
            TuitTrack
          </Link>
          <div className="hidden md:flex space-x-4">
            <NavItems />
           <SignedOut>
            <div className="flex items-center gap-2">
              <SignInButton/>
              <SignUpButton/>
            </div>
           </SignedOut>
           <SignedIn>
            <UserButton afterSignOutUrl="/" />
           </SignedIn>
            
        </div>
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ?<X className="h-5 w-5"/> :<Menu className="h-5 w-5/"/>}
            </Button>

        </div>
      </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-background border-t border-border">
          <div className="p-2">
            <NavItems onClick={() => setIsOpen(false)} />
               <SignedOut>
            <div className="flex items-center gap-2">
              <SignInButton/>
              <SignUpButton/>
            </div>
           </SignedOut>
           <SignedIn>
            <UserButton afterSignOutUrl="/" />
           </SignedIn>
          </div>
        </div>
      )}

    </nav>
  )
}









// // nav.tsx
// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { Menu, X } from "lucide-react";
// import { NavItems } from "./NavItems";
// import { Button } from "@/components/ui/button";

// export default function Navbar() {
//   const [isOpen, setIsOpen] = useState(false);

//   return (
//     <nav className="bg-background border-b border-border sticky top-0 z-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex items-center justify-between h-16">
          
//           {/* Logo */}
//           <Link href="/" className="text-xl font-bold text-primary">
//             TuitTrack
//           </Link>

//           {/* Desktop Menu */}
//           <div className="hidden md:flex space-x-4">
//             <NavItems />
//           </div>

//           {/* Mobile Menu Button */}
//           <div className="md:hidden">
//             <Button
//               variant="ghost"
//               size="icon"
//               onClick={() => setIsOpen(!isOpen)}
//             >
//               {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* Mobile Menu Dropdown */}
//       {isOpen && (
//         <div className="md:hidden bg-background border-t border-border">
//           <div className="p-2">
//             <NavItems onClick={() => setIsOpen(false)} />
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// }
