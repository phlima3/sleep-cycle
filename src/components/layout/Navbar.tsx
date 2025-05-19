
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Home, Settings, History, Info, Lightbulb } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { path: '/', label: t('navbar.home'), icon: Home },
    { path: '/history', label: t('navbar.history'), icon: History },
    { path: '/about', label: t('navbar.about'), icon: Info },
    { path: '/tips', label: t('navbar.sleep_tips'), icon: Lightbulb },
    { path: '/settings', label: t('navbar.settings'), icon: Settings },
  ];

  return (
    <nav className="border-b shadow-sm bg-background">
      <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center space-x-2 mb-4 md:mb-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sleep-deep to-sleep-dream flex items-center justify-center">
            <Moon className="text-white h-6 w-6" />
          </div>
          <span className="text-xl font-bold">{t('app.name')}</span>
        </div>
        
        <div className="flex items-center space-x-1 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          {navItems.map(item => (
            <Link 
              key={item.path} 
              to={item.path}
              className={cn(
                "px-3 py-2 rounded-md text-sm flex items-center space-x-1 whitespace-nowrap",
                location.pathname === item.path 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-secondary"
              )}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          ))}
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="ml-2"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </nav>
  );
};
