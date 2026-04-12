"use client";

import React from 'react';
import { Bell, BellOff } from 'lucide-react';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const NotificationToggle = () => {
  const { isSupported, permission, subscribeUser } = usePushNotifications();

  if (!isSupported) return null;

  const handleToggle = async (checked: boolean) => {
    if (checked && permission !== 'granted') {
      await subscribeUser();
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-zinc-900/50 border border-white/5 rounded-xl">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-600/10 rounded-lg">
          {permission === 'granted' ? (
            <Bell className="text-red-600" size={20} />
          ) : (
            <BellOff className="text-gray-500" size={20} />
          )}
        </div>
        <div>
          <Label className="text-sm font-bold text-white">Notifiche Push</Label>
          <p className="text-xs text-gray-500">Ricevi aggiornamenti sui nuovi drop ed eventi</p>
        </div>
      </div>
      <Switch 
        checked={permission === 'granted'} 
        onCheckedChange={handleToggle}
      />
    </div>
  );
};

export default NotificationToggle;