'use client'

/**
 * Profile Settings Component
 * Manages user profile information and avatar
 */

import { useState, useEffect } from 'react'
import { SettingsSection, SettingsFormGroup } from './settings-section'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useSettings } from '@/hooks/use-settings'
import { useUser } from '@/hooks/use-user'

interface ProfileSettingsProps {
  className?: string
}

export function ProfileSettings({ className }: ProfileSettingsProps) {
  const { user } = useUser()
  const { profile, updateProfile, isUpdatingProfile } = useSettings()
  
  const [fullName, setFullName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Update local state when profile changes
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setAvatarUrl(profile.avatar_url || '')
      setHasUnsavedChanges(false)
    }
  }, [profile])

  // Track changes
  useEffect(() => {
    if (!profile) return
    
    const hasChanges = 
      fullName !== (profile.full_name || '') ||
      avatarUrl !== (profile.avatar_url || '')

    setHasUnsavedChanges(hasChanges)
  }, [fullName, avatarUrl, profile])

  const handleSaveChanges = async () => {
    try {
      await updateProfile({
        fullName: fullName.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
      })
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Failed to save profile:', error)
    }
  }

  const handleResetChanges = () => {
    if (!profile) return
    
    setFullName(profile.full_name || '')
    setAvatarUrl(profile.avatar_url || '')
    setHasUnsavedChanges(false)
  }

  const userInitials = fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || user?.email?.[0]?.toUpperCase() || '?'

  return (
    <SettingsSection
      title="Profile & Account"
      description="Manage your personal information and account details"
      icon="👤"
      gradient="blue"
      className={className}
      footerActions={
        hasUnsavedChanges ? (
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleResetChanges}
              disabled={isUpdatingProfile}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveChanges}
              disabled={isUpdatingProfile}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        ) : null
      }
    >
      <div className="space-y-8">
        {/* Profile Picture */}
        <SettingsFormGroup
          title="Profile Picture"
          description="Upload or update your profile picture"
        >
          <div className="flex items-center space-x-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl} alt={fullName || 'Profile'} />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-3">
              <div>
                <Label htmlFor="avatar-url">Avatar URL</Label>
                <Input
                  id="avatar-url"
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="mt-2"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Enter a URL to an image file (JPG, PNG, GIF)
                </p>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Upload Image
                  <span className="text-xs ml-2">(Coming Soon)</span>
                </Button>
                {avatarUrl && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setAvatarUrl('')}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>
        </SettingsFormGroup>

        {/* Personal Information */}
        <SettingsFormGroup
          title="Personal Information"
          description="Update your name and contact details"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="full-name">Full Name</Label>
              <Input
                id="full-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="mt-2 bg-gray-50"
              />
              <p className="text-sm text-gray-600 mt-1">
                Email cannot be changed here. Contact support if needed.
              </p>
            </div>
          </div>
        </SettingsFormGroup>

        {/* Account Information */}
        <SettingsFormGroup
          title="Account Information"
          description="View your account details and status"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <Label className="text-sm text-gray-600">User ID</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg font-mono text-sm">
                  {user?.id}
                </div>
              </div>
              
              <div>
                <Label className="text-sm text-gray-600">Account Created</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm">
                  {profile?.created_at ? 
                    new Date(profile.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                    : 'Unknown'
                  }
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label className="text-sm text-gray-600">Last Updated</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm">
                  {profile?.updated_at ? 
                    new Date(profile.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                    : 'Never'
                  }
                </div>
              </div>
              
              <div>
                <Label className="text-sm text-gray-600">Email Verified</Label>
                <div className="mt-1 p-3 bg-green-50 rounded-lg text-sm flex items-center">
                  <span className="text-green-600">✓</span>
                  <span className="ml-2">Verified</span>
                </div>
              </div>
            </div>
          </div>
        </SettingsFormGroup>

        {/* Quick Actions */}
        <SettingsFormGroup
          title="Quick Actions"
          description="Common account management tasks"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" disabled>
              Change Password
              <span className="text-xs ml-2">(Coming Soon)</span>
            </Button>
            
            <Button variant="outline" disabled>
              Download Profile Data
              <span className="text-xs ml-2">(Coming Soon)</span>
            </Button>
            
            <Button variant="outline" disabled>
              Manage Notifications
              <span className="text-xs ml-2">(Coming Soon)</span>
            </Button>
          </div>
        </SettingsFormGroup>
      </div>
    </SettingsSection>
  )
}