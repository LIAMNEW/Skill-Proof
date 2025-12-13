import { Users, BookOpen, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileCardProps {
  username: string;
  name: string;
  avatar: string;
  bio: string;
  repos: number;
  followers: number;
  location?: string;
}

export default function ProfileCard({ 
  username, 
  name, 
  avatar, 
  bio, 
  repos, 
  followers,
  location 
}: ProfileCardProps) {
  return (
    <div className="bg-white/5 backdrop-blur-lg border border-amber-500/20 rounded-2xl p-6" data-testid="profile-card">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <Avatar className="w-20 h-20 border-2 border-amber-400/50">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className="bg-amber-600 text-slate-900 text-xl font-bold">
            {name?.charAt(0) || username?.charAt(0) || "?"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-xl font-bold text-white" data-testid="text-profile-name">{name || username}</h2>
          <p className="text-gray-400 text-sm mb-2" data-testid="text-profile-username">@{username}</p>
          {bio && <p className="text-gray-300 text-sm mb-3" data-testid="text-profile-bio">{bio}</p>}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span data-testid="text-repo-count">{repos} repos</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span data-testid="text-follower-count">{followers.toLocaleString()} followers</span>
            </div>
            {location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{location}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
