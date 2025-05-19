
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useSettings } from '@/contexts/SettingsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSleepHistory } from '@/contexts/SleepHistoryContext';
import { requestNotificationPermission } from '@/utils/notificationUtils';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

const Settings = () => {
  const { settings, updateSettings } = useSettings();
  const { theme, toggleTheme } = useTheme();
  const { clearHistory } = useSleepHistory();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const [cycleLength, setCycleLength] = useState(settings.cycleLength);
  const [sleepLatency, setSleepLatency] = useState(settings.sleepLatency);
  const [language, setLanguage] = useState(settings.language);
  const [notificationsEnabled, setNotificationsEnabled] = useState(settings.notificationsEnabled);
  
  // Update local state when settings change
  useEffect(() => {
    setCycleLength(settings.cycleLength);
    setSleepLatency(settings.sleepLatency);
    setLanguage(settings.language);
    setNotificationsEnabled(settings.notificationsEnabled);
  }, [settings]);
  
  // Handle enabling notifications
  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      const permissionGranted = await requestNotificationPermission();
      if (permissionGranted) {
        setNotificationsEnabled(true);
        updateSettings({ notificationsEnabled: true });
        toast({
          title: t('settings.notifications.enabled'),
          description: t('settings.notifications.enabled_description'),
        });
      } else {
        toast({
          title: t('settings.notifications.permission_denied'),
          description: t('settings.notifications.permission_denied_description'),
          variant: "destructive"
        });
      }
    } else {
      setNotificationsEnabled(false);
      updateSettings({ notificationsEnabled: false });
      toast({
        title: t('settings.notifications.disabled'),
        description: t('settings.notifications.disabled_description'),
      });
    }
  };
  
  // Handle saving settings
  const handleSaveSettings = () => {
    updateSettings({
      cycleLength,
      sleepLatency,
      language,
      notificationsEnabled
    });
    toast({
      title: t('settings.notifications.settings_saved'),
      description: t('settings.notifications.settings_saved_description'),
    });
  };
  
  // Handle clearing history
  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear your sleep history? This action cannot be undone.")) {
      clearHistory();
      toast({
        title: t('settings.notifications.history_cleared'),
        description: t('settings.notifications.history_cleared_description'),
      });
    }
  };
  
  return (
    <div className="page-container">
      <div className="w-full max-w-md px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-primary">{t('settings.title')}</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('settings.sleep_preferences.title')}</CardTitle>
            <CardDescription>
              {t('settings.sleep_preferences.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="cycleLength">{t('settings.sleep_preferences.cycle_length')}</Label>
                <span className="text-sm font-medium">{t('settings.sleep_preferences.minutes', { count: cycleLength })}</span>
              </div>
              <Slider
                id="cycleLength"
                value={[cycleLength]}
                min={80}
                max={110}
                step={5}
                onValueChange={(values) => setCycleLength(values[0])}
                className="py-4"
              />
              <p className="text-sm text-muted-foreground">
                {t('settings.sleep_preferences.cycle_info')}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="sleepLatency">{t('settings.sleep_preferences.latency')}</Label>
                <span className="text-sm font-medium">{t('settings.sleep_preferences.minutes', { count: sleepLatency })}</span>
              </div>
              <Slider
                id="sleepLatency"
                value={[sleepLatency]}
                min={0}
                max={60}
                step={5}
                onValueChange={(values) => setSleepLatency(values[0])}
                className="py-4"
              />
              <p className="text-sm text-muted-foreground">
                {t('settings.sleep_preferences.latency_info')}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('settings.app_preferences.title')}</CardTitle>
            <CardDescription>
              {t('settings.app_preferences.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="theme" className="text-base">{t('settings.app_preferences.dark_mode')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('settings.app_preferences.theme_info')}
                </p>
              </div>
              <Switch
                id="theme"
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications" className="text-base">{t('settings.app_preferences.reminders')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('settings.app_preferences.reminders_info')}
                </p>
              </div>
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={handleToggleNotifications}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="language">{t('settings.app_preferences.language')}</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('settings.data_management.title')}</CardTitle>
            <CardDescription>
              {t('settings.data_management.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleClearHistory}
            >
              {t('settings.data_management.clear_history')}
            </Button>
          </CardContent>
        </Card>
        
        <Button className="w-full" onClick={handleSaveSettings}>
          {t('settings.save_button')}
        </Button>
      </div>
    </div>
  );
};

export default Settings;
