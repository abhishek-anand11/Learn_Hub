import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Menu,
  Bell,
  User as UserIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [location, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <svg className="h-8 w-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
              <span className="ml-2 text-xl font-semibold text-neutral-900">LearnHub</span>
            </Link>
            <nav className="hidden md:ml-6 md:flex md:space-x-6">
              <Link href="/courses" className={`px-3 py-2 text-sm font-medium ${
                location === "/courses" 
                  ? "text-primary hover:text-primary/90" 
                  : "text-neutral-500 hover:text-primary"
              }`}>
                Courses
              </Link>
              <Link href="/categories" className={`px-3 py-2 text-sm font-medium ${
                location === "/categories" 
                  ? "text-primary hover:text-primary/90" 
                  : "text-neutral-500 hover:text-primary"
              }`}>
                Categories
              </Link>
              <Link href="/about" className={`px-3 py-2 text-sm font-medium ${
                location === "/about" 
                  ? "text-primary hover:text-primary/90" 
                  : "text-neutral-500 hover:text-primary"
              }`}>
                About
              </Link>
            </nav>
          </div>
          <div className="flex items-center">
            <div className="hidden md:block">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="Search courses..."
                  className="w-64 pr-8 focus:ring-2 focus:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                  type="submit"
                  className="absolute right-0 top-0 mr-3 mt-2 text-neutral-400"
                  aria-label="Search"
                >
                  <Search size={16} />
                </button>
              </form>
            </div>
            
            {!user ? (
              <div className="hidden md:ml-4 md:flex md:items-center">
                <Link href="/auth">
                  <Button variant="ghost" className="font-medium text-primary">
                    Log in
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button className="ml-3">
                    Sign up
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="hidden md:ml-4 md:flex md:items-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative text-neutral-400 hover:text-neutral-500"
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-primary ring-2 ring-white"></span>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="ml-3 rounded-full"
                      aria-label="User menu"
                    >
                      <Avatar>
                        <AvatarImage src={user.avatar || undefined} alt={user.username} />
                        <AvatarFallback>
                          {user.firstName?.[0] || user.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <Link href="/dashboard">
                      <DropdownMenuItem>
                        Your Dashboard
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/my-courses">
                      <DropdownMenuItem>
                        My Courses
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/settings">
                      <DropdownMenuItem>
                        Settings
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem onSelect={handleLogout}>
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden ml-4"
                  aria-label="Menu"
                >
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="py-4">
                  <form onSubmit={handleSearch} className="px-4 mb-6">
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Search courses..."
                        className="w-full pr-8 focus:ring-2 focus:ring-primary"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <button 
                        type="submit"
                        className="absolute right-0 top-0 mr-3 mt-2 text-neutral-400"
                        aria-label="Search"
                      >
                        <Search size={16} />
                      </button>
                    </div>
                  </form>
                  
                  <div className="px-2 space-y-1">
                    <Link href="/courses">
                      <Button 
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Courses
                      </Button>
                    </Link>
                    <Link href="/categories">
                      <Button 
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Categories
                      </Button>
                    </Link>
                    <Link href="/about">
                      <Button 
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        About
                      </Button>
                    </Link>
                  </div>
                  
                  {!user ? (
                    <div className="mt-6 px-4 space-y-2">
                      <Link href="/auth">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Log in
                        </Button>
                      </Link>
                      <Link href="/auth">
                        <Button 
                          className="w-full"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Sign up
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="border-t border-neutral-200 mt-6 pt-6">
                        <div className="flex items-center px-4">
                          <Avatar>
                            <AvatarImage src={user.avatar || undefined} alt={user.username} />
                            <AvatarFallback>
                              {user.firstName?.[0] || user.username[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="ml-3">
                            <p className="text-base font-medium text-neutral-800">
                              {user.firstName && user.lastName 
                                ? `${user.firstName} ${user.lastName}` 
                                : user.username}
                            </p>
                            <p className="text-sm text-neutral-500">{user.email}</p>
                          </div>
                        </div>
                        
                        <div className="mt-6 px-2 space-y-1">
                          <Link href="/dashboard">
                            <Button 
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              Your Dashboard
                            </Button>
                          </Link>
                          <Link href="/my-courses">
                            <Button 
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              My Courses
                            </Button>
                          </Link>
                          <Link href="/settings">
                            <Button 
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              Settings
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => {
                              handleLogout();
                              setMobileMenuOpen(false);
                            }}
                          >
                            Sign out
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
