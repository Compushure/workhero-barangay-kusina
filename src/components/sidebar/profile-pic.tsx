'use client';


import { User } from "lucide-react";
import { UserWithExtras } from "../admin/user-card";

interface ProfilePicProps {
   user: UserWithExtras; 
}

export function ProfilePic({ user }: ProfilePicProps) {
  return (
    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0">
      <User size={24} className="text-[#690003]" />
    </div>
  );
}
