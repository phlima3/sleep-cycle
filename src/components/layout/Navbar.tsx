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
    <nav className="border-b-base border-bw bg-blank shadow-shadow">
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 mb-4 md:mb-0 group">
          <div className="w-12 h-12 rounded-base border-base border-bw bg-main flex items-center justify-center shadow-shadow transition-all group-hover:translate-x-boxShadowX group-hover:translate-y-boxShadowY group-hover:shadow-none">
            <Moon className="text-main-foreground h-7 w-7" />
          </div>
          <span className="text-2xl font-bold uppercase tracking-tight">{t('app.name')}</span>
        </Link>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "px-4 py-2 rounded-base border-base border-bw text-sm font-bold uppercase tracking-wide flex items-center gap-2 whitespace-nowrap transition-all",
                location.pathname === item.path
                  ? "bg-main text-main-foreground shadow-shadow"
                  : "bg-blank hover:bg-secondary shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none"
              )}
            >
              <item.icon className="w-4 h-4" strokeWidth={2.5} />
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          ))}

          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="ml-2"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" strokeWidth={2.5} /> : <Sun className="h-5 w-5" strokeWidth={2.5} />}
          </Button>
        </div>
      </div>
    </nav>
  );
};
