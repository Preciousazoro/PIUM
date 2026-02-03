import React from 'react';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  user: {
    name: string;
    avatarUrl?: string | null;
    email?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function UserAvatar({ user, size = 'md', className }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  const getInitials = (name: string) => {
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
    }
    return name[0]?.toUpperCase() || '?';
  };

  const getAvatarColor = (email: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500'
    ];
    
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  if (user.avatarUrl) {
    return (
      <div className={cn(
        'relative rounded-full overflow-hidden flex-shrink-0',
        sizeClasses[size],
        className
      )}>
        <img
          src={user.avatarUrl}
          alt={user.name}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className={cn(
      'relative rounded-full flex items-center justify-center text-white font-medium flex-shrink-0',
      sizeClasses[size],
      getAvatarColor(user.email || user.name),
      className
    )}>
      {getInitials(user.name)}
    </div>
  );
}
