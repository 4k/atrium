import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Person } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PersonBadgeProps {
  person: Person;
  showName?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function PersonBadge({ person, showName = true, size = 'md' }: PersonBadgeProps) {
  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base',
  };

  if (showName) {
    return (
      <div className="flex items-center gap-2">
        <Avatar className={sizeClasses[size]}>
          <AvatarFallback className={cn('text-white font-medium', person.color)}>
            {person.avatar}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">{person.name}</span>
      </div>
    );
  }

  return (
    <Avatar className={sizeClasses[size]}>
      <AvatarFallback className={cn('text-white font-medium', person.color)}>
        {person.avatar}
      </AvatarFallback>
    </Avatar>
  );
}

export function SharedBadge() {
  return (
    <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800">
      Shared
    </Badge>
  );
}
