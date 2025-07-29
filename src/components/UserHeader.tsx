import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { logout } from '../store/authSlice';
import { LogOut, User } from 'lucide-react';

const UserHeader = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: any) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <div className="flex items-center gap-3 p-4 border-b bg-background">
      <Avatar>
        <AvatarFallback className="bg-primary text-primary-foreground">
          {user?.username ? getInitials(user.username) : <User className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="text-sm font-medium">{user?.username || 'User'}</p>
        {user?.email && (
          <p className="text-xs text-muted-foreground">{user.email}</p>
        )}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleLogout}
        className="flex items-center gap-2"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </div>
  );
};

export default UserHeader;