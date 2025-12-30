import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useSettings } from '@/contexts/SettingsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSleepHistory } from '@/contexts/SleepHistoryContext';
import { requestNotificationPermission } from '@/utils/notificationUtils';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { Settings as SettingsIcon, Moon, Bell, Globe, Trash2, Save } from 'lucide-react';

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

  useEffect(() => {
    setCycleLength(settings.cycleLength);
    setSleepLatency(settings.sleepLatency);
    setLanguage(settings.language);
    setNotificationsEnabled(settings.notificationsEnabled);
  }, [settings]);

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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold uppercase tracking-tight mb-2">
            {t('settings.title')}
          </h1>
          <p className="text-muted-foreground">Customize your sleep experience</p>
        </div>

        {/* Sleep Preferences */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" strokeWidth={2.5} />
              {t('settings.sleep_preferences.title')}
            </CardTitle>
            <CardDescription>
              {t('settings.sleep_preferences.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label htmlFor="cycleLength" className="font-bold uppercase">
                  {t('settings.sleep_preferences.cycle_length')}
                </Label>
                <Badge variant="default" className="text-lg px-4">
                  {cycleLength} min
                </Badge>
              </div>
              <Slider
                id="cycleLength"
                value={[cycleLength]}
                min={80}
                max={110}
                step={5}
                onValueChange={(values) => setCycleLength(values[0])}
                className="py-2"
              />
              <p className="text-sm text-muted-foreground">
                {t('settings.sleep_preferences.cycle_info')}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label htmlFor="sleepLatency" className="font-bold uppercase">
                  {t('settings.sleep_preferences.latency')}
                </Label>
                <Badge variant="secondary" className="text-lg px-4">
                  {sleepLatency} min
                </Badge>
              </div>
              <Slider
                id="sleepLatency"
                value={[sleepLatency]}
                min={0}
                max={60}
                step={5}
                onValueChange={(values) => setSleepLatency(values[0])}
                className="py-2"
              />
              <p className="text-sm text-muted-foreground">
                {t('settings.sleep_preferences.latency_info')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* App Preferences */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="w-5 h-5" strokeWidth={2.5} />
              {t('settings.app_preferences.title')}
            </CardTitle>
            <CardDescription>
              {t('settings.app_preferences.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between p-4 rounded-base border-base border-bw bg-secondary">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5" strokeWidth={2.5} />
                <div>
                  <Label htmlFor="theme" className="text-base font-bold">
                    {t('settings.app_preferences.dark_mode')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.app_preferences.theme_info')}
                  </p>
                </div>
              </div>
              <Switch
                id="theme"
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
              />
            </div>

            {/* Notifications Toggle */}
            <div className="flex items-center justify-between p-4 rounded-base border-base border-bw bg-secondary">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5" strokeWidth={2.5} />
                <div>
                  <Label htmlFor="notifications" className="text-base font-bold">
                    {t('settings.app_preferences.reminders')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.app_preferences.reminders_info')}
                  </p>
                </div>
              </div>
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={handleToggleNotifications}
              />
            </div>

            {/* Language Select */}
            <div className="space-y-3">
              <Label htmlFor="language" className="flex items-center gap-2 font-bold uppercase">
                <Globe className="w-4 h-4" strokeWidth={2.5} />
                {t('settings.app_preferences.language')}
              </Label>
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

        {/* Data Management */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5" strokeWidth={2.5} />
              {t('settings.data_management.title')}
            </CardTitle>
            <CardDescription>
              {t('settings.data_management.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleClearHistory}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t('settings.data_management.clear_history')}
            </Button>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button className="w-full h-14 text-lg" onClick={handleSaveSettings}>
          <Save className="w-5 h-5 mr-2" />
          {t('settings.save_button')}
        </Button>
      </div>
    </div>
  );
};

export default Settings;
