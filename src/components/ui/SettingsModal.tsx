import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Settings, User, Bell, Shield, Palette, Globe, Key } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/apiClient';
import { toast } from 'sonner';

export const SettingsModal: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    notifications: {
      email: true,
      push: true,
      grades: true,
      attendance: true,
      schedule: false,
    },
    privacy: {
      profile_visible: true,
      show_online_status: true,
      share_progress: false,
    },
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [passwordLoading, setPasswordLoading] = useState(false);

  // Load settings when modal opens
  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const response = await api.get('/api/user/settings');
      const settings = response.data;
      
      setFormData(prev => ({
        ...prev,
        theme: settings.theme || 'light',
        language: settings.language || 'en',
        timezone: settings.timezone || 'UTC',
        dateFormat: settings.date_format || 'MM/DD/YYYY',
        notifications: settings.notifications || prev.notifications,
        privacy: settings.privacy || prev.privacy,
      }));
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'security', label: 'Security', icon: Key },
    { id: 'general', label: 'General', icon: Settings },
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value,
      },
    }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePasswordReset = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New password and confirmation do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }

    try {
      setPasswordLoading(true);
      
      await api.put('/api/user/change-password', {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
        confirm_password: passwordData.confirmPassword,
      });
      
      toast.success('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Save profile data if changed
      const profileChanged = 
        formData.firstName !== user?.first_name ||
        formData.lastName !== user?.last_name ||
        formData.email !== user?.email;
      
      if (profileChanged) {
        await api.put(`/api/users/${user?.id}`, {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
        });
      }
      
      // Save settings data
      const settingsData = {
        theme: formData.theme,
        language: formData.language,
        timezone: formData.timezone,
        date_format: formData.dateFormat,
        notifications: formData.notifications,
        privacy: formData.privacy,
      };

      await api.put('/api/user/settings', settingsData);
      
      // Refresh user data to update sidebar name
      await refreshUser();
      
      toast.success('Settings saved successfully!');
      setIsOpen(false);
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="userId">
          {user?.role === 'admin' || user?.role === 'administrator' ? 'Admin ID' : 
           user?.role === 'instructor' ? 'Instructor ID' : 'Student ID'}
        </Label>
        <Input
          id="userId"
          value={user?.id ? `${
            user?.role === 'admin' || user?.role === 'administrator' ? 'AD' : 
            user?.role === 'instructor' ? 'IN' : 'ST'
          }${user.id.toString().padStart(3, '0')}` : ''}
          disabled
          className="bg-muted"
        />
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Email Notifications</p>
          <p className="text-sm text-muted-foreground">Receive notifications via email</p>
        </div>
        <Switch
          checked={formData.notifications.email}
          onCheckedChange={(checked) => handleNotificationChange('email', checked)}
        />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Push Notifications</p>
          <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
        </div>
        <Switch
          checked={formData.notifications.push}
          onCheckedChange={(checked) => handleNotificationChange('push', checked)}
        />
      </div>
      <div className="border-t pt-4">
        <p className="font-medium mb-3">Notification Types</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span>Grade Updates</span>
            <Switch
              checked={formData.notifications.grades}
              onCheckedChange={(checked) => handleNotificationChange('grades', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <span>Attendance Updates</span>
            <Switch
              checked={formData.notifications.attendance}
              onCheckedChange={(checked) => handleNotificationChange('attendance', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <span>Schedule Changes</span>
            <Switch
              checked={formData.notifications.schedule}
              onCheckedChange={(checked) => handleNotificationChange('schedule', checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="theme">Theme</Label>
        <Select value={formData.theme} onValueChange={(value) => handleInputChange('theme', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="language">Language</Label>
        <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Spanish</SelectItem>
            <SelectItem value="fr">French</SelectItem>
            <SelectItem value="de">German</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Profile Visibility</p>
          <p className="text-sm text-muted-foreground">Make your profile visible to other students</p>
        </div>
        <Switch
          checked={formData.privacy.profile_visible}
          onCheckedChange={(checked) => setFormData(prev => ({
            ...prev,
            privacy: { ...prev.privacy, profile_visible: checked }
          }))}
        />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Show Online Status</p>
          <p className="text-sm text-muted-foreground">Let others see when you're online</p>
        </div>
        <Switch
          checked={formData.privacy.show_online_status}
          onCheckedChange={(checked) => setFormData(prev => ({
            ...prev,
            privacy: { ...prev.privacy, show_online_status: checked }
          }))}
        />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Share Academic Progress</p>
          <p className="text-sm text-muted-foreground">Allow others to see your achievements</p>
        </div>
        <Switch
          checked={formData.privacy.share_progress}
          onCheckedChange={(checked) => setFormData(prev => ({
            ...prev,
            privacy: { ...prev.privacy, share_progress: checked }
          }))}
        />
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Change Password</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
              placeholder="Enter your current password"
            />
          </div>
          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
              placeholder="Enter your new password (min. 8 characters)"
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
              placeholder="Confirm your new password"
            />
          </div>
          <Button 
            onClick={handlePasswordReset}
            disabled={passwordLoading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
            className="w-full"
          >
            {passwordLoading ? 'Changing Password...' : 'Change Password'}
          </Button>
        </div>
      </div>
      
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-2">Password Requirements</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• At least 8 characters long</li>
          <li>• Include both uppercase and lowercase letters</li>
          <li>• Include at least one number</li>
          <li>• Include at least one special character</li>
        </ul>
      </div>
    </div>
  );

  const renderGeneralTab = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="timezone">Timezone</Label>
        <Select value={formData.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="UTC">UTC</SelectItem>
            <SelectItem value="EST">Eastern Time</SelectItem>
            <SelectItem value="PST">Pacific Time</SelectItem>
            <SelectItem value="CST">Central Time</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="dateFormat">Date Format</Label>
        <Select value={formData.dateFormat} onValueChange={(value) => handleInputChange('dateFormat', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'appearance':
        return renderAppearanceTab();
      case 'privacy':
        return renderPrivacyTab();
      case 'security':
        return renderSecurityTab();
      case 'general':
        return renderGeneralTab();
      default:
        return renderProfileTab();
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
      >
        <Settings className="w-5 h-5" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>

          <div className="flex gap-6">
            {/* Sidebar */}
            <div className="w-48 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </Button>
                );
              })}
            </div>

            {/* Content */}
            <div className="flex-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {tabs.find(t => t.id === activeTab)?.icon && (
                      React.createElement(tabs.find(t => t.id === activeTab)!.icon, { className: "w-5 h-5" })
                    )}
                    {tabs.find(t => t.id === activeTab)?.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderTabContent()}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
