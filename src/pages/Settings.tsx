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
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { Settings as SettingsIcon, Moon, Bell, Globe, Trash2, Save, Loader2, Send, AlarmClock, Plus, X, Cloud, CloudOff } from 'lucide-react';
import { useReminders } from '@/hooks/useReminders';
import { Input } from '@/components/ui/input';

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const Settings = () => {
  const { settings, updateSettings } = useSettings();
  const { theme, toggleTheme } = useTheme();
  const { clearHistory } = useSleepHistory();
  const { toast } = useToast();
  const { t } = useTranslation();
  const {
    isSupported: isPushSupported,
    isEnabled: isPushEnabled,
    isLoading: isPushLoading,
    enableNotifications,
    disableNotifications
  } = usePushNotifications();
  const { reminders, nextBedtime, addReminder, updateReminder, removeReminder, calculateBedtime, isSyncing } = useReminders();

  const [cycleLength, setCycleLength] = useState(settings.cycleLength);
  const [sleepLatency, setSleepLatency] = useState(settings.sleepLatency);
  const [language, setLanguage] = useState(settings.language);
  const [notificationsEnabled, setNotificationsEnabled] = useState(settings.notificationsEnabled);

  // Reminder form state
  const [newWakeTime, setNewWakeTime] = useState('07:00');
  const [newWindDown, setNewWindDown] = useState(30);
  const [newDays, setNewDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri

  useEffect(() => {
    setCycleLength(settings.cycleLength);
    setSleepLatency(settings.sleepLatency);
    setLanguage(settings.language);
    setNotificationsEnabled(settings.notificationsEnabled);
  }, [settings]);

  const handleToggleNotifications = async () => {
    if (!isPushEnabled) {
      const success = await enableNotifications();
      if (success) {
        setNotificationsEnabled(true);
        updateSettings({ notificationsEnabled: true });
      }
    } else {
      disableNotifications();
      setNotificationsEnabled(false);
      updateSettings({ notificationsEnabled: false });
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

  const handleTestNotification = () => {
    // Show a local notification for testing
    if (Notification.permission === 'granted') {
      new Notification('SleepCycle - Teste', {
        body: 'Notificações estão funcionando!',
        icon: '/android/android-launchericon-192-192.png',
        badge: '/android/android-launchericon-96-96.png',
      });
      toast({
        title: 'Notificação enviada!',
        description: 'Verifique se a notificação apareceu no seu dispositivo.',
      });
    } else {
      toast({
        title: 'Permissão necessária',
        description: 'Ative as notificações primeiro.',
        variant: 'destructive',
      });
    }
  };

  const handleAddReminder = () => {
    if (!isPushEnabled) {
      toast({
        title: 'Ative as notificações primeiro',
        description: 'Você precisa permitir notificações para criar lembretes.',
        variant: 'destructive',
      });
      return;
    }

    addReminder({
      wakeUpTime: newWakeTime,
      enabled: true,
      daysOfWeek: newDays,
      windDownMinutes: newWindDown,
    });

    const bedtime = calculateBedtime(newWakeTime, 5);
    toast({
      title: 'Lembrete criado!',
      description: `Você será notificado ${newWindDown}min antes de ${bedtime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
    });
  };

  const toggleDay = (day: number) => {
    setNewDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    );
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
                {isPushLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.5} />
                ) : (
                  <Bell className="w-5 h-5" strokeWidth={2.5} />
                )}
                <div>
                  <Label htmlFor="notifications" className="text-base font-bold">
                    {t('settings.app_preferences.reminders')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {isPushSupported
                      ? t('settings.app_preferences.reminders_info')
                      : 'Push notifications not supported'}
                  </p>
                </div>
              </div>
              <Switch
                id="notifications"
                checked={isPushEnabled}
                onCheckedChange={handleToggleNotifications}
                disabled={!isPushSupported || isPushLoading}
              />
            </div>

            {/* Test Notification Button */}
            {isPushEnabled && (
              <Button
                variant="secondary"
                className="w-full"
                onClick={handleTestNotification}
              >
                <Send className="w-4 h-4 mr-2" />
                Testar Notificação
              </Button>
            )}

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

        {/* Sleep Reminders */}
        {isPushEnabled && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlarmClock className="w-5 h-5" strokeWidth={2.5} />
                Lembretes de Sono
                {isSyncing ? (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                ) : (
                  <Cloud className="w-4 h-4 text-green-500" />
                )}
              </CardTitle>
              <CardDescription>
                Receba notificações para dormir no horário ideal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Next bedtime info */}
              {nextBedtime && (
                <div className="p-4 rounded-base border-base border-bw bg-main/10">
                  <p className="text-sm font-bold uppercase mb-1">Próximo lembrete</p>
                  <p className="text-2xl font-bold">
                    {nextBedtime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}

              {/* Existing reminders */}
              {reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between p-4 rounded-base border-base border-bw bg-secondary"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">Acordar às {reminder.wakeUpTime}</span>
                      <Badge variant={reminder.enabled ? 'default' : 'secondary'}>
                        {reminder.enabled ? 'Ativo' : 'Pausado'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {reminder.daysOfWeek.map(d => DAYS_OF_WEEK[d]).join(', ')} • {reminder.windDownMinutes}min antes
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={reminder.enabled}
                      onCheckedChange={(checked) => updateReminder(reminder.id, { enabled: checked })}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeReminder(reminder.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Add new reminder form */}
              <div className="space-y-4 p-4 rounded-base border-base border-bw border-dashed">
                <Label className="font-bold uppercase">Novo Lembrete</Label>

                <div className="space-y-2">
                  <Label htmlFor="wakeTime" className="text-sm">Horário de acordar</Label>
                  <Input
                    id="wakeTime"
                    type="time"
                    value={newWakeTime}
                    onChange={(e) => setNewWakeTime(e.target.value)}
                    className="text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Dias da semana</Label>
                  <div className="flex gap-1 flex-wrap">
                    {DAYS_OF_WEEK.map((day, index) => (
                      <Button
                        key={day}
                        variant={newDays.includes(index) ? 'default' : 'secondary'}
                        size="sm"
                        onClick={() => toggleDay(index)}
                        className="w-10 h-10 p-0"
                      >
                        {day[0]}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm">Avisar antes</Label>
                    <Badge variant="secondary">{newWindDown} min</Badge>
                  </div>
                  <Slider
                    value={[newWindDown]}
                    min={15}
                    max={60}
                    step={15}
                    onValueChange={(values) => setNewWindDown(values[0] ?? 30)}
                  />
                </div>

                <Button className="w-full" onClick={handleAddReminder}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Lembrete
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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
