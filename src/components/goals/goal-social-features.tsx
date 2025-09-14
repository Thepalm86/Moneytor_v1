'use client'

import { useState } from 'react'
import {
  Share2,
  Users,
  Heart,
  MessageCircle,
  Lock,
  Globe,
  UserCheck,
  Trophy,
  TrendingUp,
  Target,
  Copy,
  Bell,
} from 'lucide-react'
import { format } from 'date-fns'

import { cn } from '@/lib/utils'
import type { GoalWithProgress } from '@/lib/validations/goal'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

interface GoalSocialFeaturesProps {
  goal: GoalWithProgress
  onShare: (goal: GoalWithProgress, options: ShareOptions) => void
  className?: string
}

interface ShareOptions {
  privacy: 'public' | 'friends' | 'private'
  includeProgress: boolean
  includeAmount: boolean
  customMessage?: string
}

interface SocialPost {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  goalId: string
  goalName: string
  type: 'milestone' | 'update' | 'completion' | 'support'
  message: string
  progress?: number
  amount?: number
  createdAt: Date
  likes: number
  comments: number
  hasLiked: boolean
}

interface AccountabilityPartner {
  id: string
  name: string
  avatar?: string
  status: 'pending' | 'active' | 'inactive'
  goals: number
  completedGoals: number
  encouragementSent: number
  encouragementReceived: number
}

interface CommunityChallenge {
  id: string
  title: string
  description: string
  participants: number
  totalGoal: number
  currentProgress: number
  endDate: Date
  prize: string
  category: string
  isJoined: boolean
}

const privacyOptions = [
  { value: 'public', label: 'Public', icon: Globe, description: 'Visible to everyone' },
  { value: 'friends', label: 'Friends Only', icon: Users, description: 'Only your connections' },
  { value: 'private', label: 'Private', icon: Lock, description: 'Only visible to you' },
]

export function GoalSocialFeatures({ goal, onShare, className }: GoalSocialFeaturesProps) {
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [shareOptions, setShareOptions] = useState<ShareOptions>({
    privacy: 'friends',
    includeProgress: true,
    includeAmount: false,
  })

  // No social features implemented yet - these would need backend integration
  // Remove mock data and show appropriate empty states

  const handleShare = () => {
    onShare(goal, shareOptions)
    setShareModalOpen(false)
    toast.success('Goal shared successfully!')
  }

  const handleLike = (postId: string) => {
    setSocialPosts(posts => posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            hasLiked: !post.hasLiked,
            likes: post.hasLiked ? post.likes - 1 : post.likes + 1 
          }
        : post
    ))
  }

  const generateShareLink = () => {
    const link = `${window.location.origin}/goals/shared/${goal.id}`
    navigator.clipboard.writeText(link)
    toast.success('Share link copied to clipboard!')
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Social Features Header */}
      <Card className="border-0 bg-gradient-to-br from-pink-50 to-purple-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm" />
        <CardContent className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                <Share2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Social Goals</h3>
                <p className="text-sm text-gray-600">Share progress and get support</p>
              </div>
            </div>
            <Button
              onClick={() => setShareModalOpen(true)}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Goal
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-pink-600">0</div>
              <div className="text-xs text-gray-600">Partners</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">0</div>
              <div className="text-xs text-gray-600">Encouragement</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">0</div>
              <div className="text-xs text-gray-600">Challenges</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Tabs */}
      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="feed">Activity Feed</TabsTrigger>
          <TabsTrigger value="partners">Partners</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="share">Share & Privacy</TabsTrigger>
        </TabsList>

        {/* Activity Feed */}
        <TabsContent value="feed" className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">No Activity Yet</h3>
              <p className="text-gray-600 mb-4">
                Social features are coming soon! Share your goals and get encouragement from friends.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accountability Partners */}
        <TabsContent value="partners" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Accountability Partners
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Find Accountability Partners
                </h3>
                <p className="text-gray-600 mb-4">
                  Connect with friends to stay motivated and support each other. Feature coming soon!
                </p>
                <Button variant="outline" disabled>
                  Invite Friends (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Community Challenges */}
        <TabsContent value="challenges" className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center">
              <Trophy className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Community Challenges Coming Soon</h3>
              <p className="text-gray-600">
                Join savings challenges with other users and compete for rewards. This feature is under development.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Share & Privacy */}
        <TabsContent value="share" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Goal Privacy Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Public Goal</h4>
                    <p className="text-sm text-gray-600">Allow others to see this goal</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Show Progress</h4>
                    <p className="text-sm text-gray-600">Display completion percentage</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Show Amount</h4>
                    <p className="text-sm text-gray-600">Display target and current amounts</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Allow Encouragement</h4>
                    <p className="text-sm text-gray-600">Let others send motivational messages</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="border-t pt-4">
                <Button onClick={generateShareLink} variant="outline" className="w-full">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Share Link
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Share Modal */}
      <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Your Goal</DialogTitle>
            <DialogDescription>
              Share "{goal.name}" with your network for support and accountability
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Privacy Level</label>
              <Select
                value={shareOptions.privacy}
                onValueChange={(value: 'public' | 'friends' | 'private') => 
                  setShareOptions(prev => ({ ...prev, privacy: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {privacyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="w-4 h-4" />
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-gray-500">{option.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Include Progress</label>
                <Switch
                  checked={shareOptions.includeProgress}
                  onCheckedChange={(checked) =>
                    setShareOptions(prev => ({ ...prev, includeProgress: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Include Amount</label>
                <Switch
                  checked={shareOptions.includeAmount}
                  onCheckedChange={(checked) =>
                    setShareOptions(prev => ({ ...prev, includeAmount: checked }))
                  }
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Custom Message (Optional)</label>
              <Textarea
                placeholder="Add a personal message about your goal..."
                value={shareOptions.customMessage || ''}
                onChange={(e) =>
                  setShareOptions(prev => ({ ...prev, customMessage: e.target.value }))
                }
                className="min-h-[80px]"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleShare} className="flex-1">
                Share Goal
              </Button>
              <Button
                variant="outline"
                onClick={() => setShareModalOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Social features component functions removed since they used mock data
// These would be implemented when backend social features are added

// Social features would require backend integration to store:
// - User relationships (partners)
// - Social posts and interactions
// - Community challenges and participation
// These are placeholder interfaces for future implementation