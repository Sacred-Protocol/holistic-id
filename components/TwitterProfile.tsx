import React, { useEffect, useState } from 'react';
import { Twitter, Users, UserPlus, MessageSquare } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { getBalance, getUserAddress } from '@/app/services/tipjoy';

interface TwitterProfileProps {
    followers_count: number;
    following_count: number;
    image: string;
    name: string;
    profile_image_url: string;
    tweet_count: number;
    username: string;
}

const formatNumber = (num: number) => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
};

const TwitterProfile: React.FC<TwitterProfileProps> = ({
    followers_count,
    following_count,
    image,
    name,
    profile_image_url,
    tweet_count,
    username,
}) => {
    const [joyAddress, setJoyAddress] = useState('');
    const [joyBalance, setJoyBalance] = useState(0);

    useEffect(() => {
        getUserAddress(username).then((address) => {
            if (address) {
                setJoyAddress(address);
                getBalance(address).then((balance) => {
                    setJoyBalance(balance);
                });
            }
        });
    }, [username]);
    return (
        <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-md rounded-lg p-3 shadow-lg">
            <Avatar className="w-16 h-16 border-2 border-white">
                <AvatarImage src={profile_image_url} alt={name} />
                <AvatarFallback>{name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
                <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-bold text-white">{name}</h3>
                    <Twitter className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-sm text-gray-300">@{username}</p>
                <div className="flex space-x-4 mt-2 text-sm text-gray-200">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center">
                                    <Users className="w-4 h-4 mr-1" />
                                    <span>{formatNumber(followers_count)}</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>
                                    {followers_count.toLocaleString()} Followers
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center">
                                    <UserPlus className="w-4 h-4 mr-1" />
                                    <span>{formatNumber(following_count)}</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>
                                    {following_count.toLocaleString()} Following
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center">
                                    <MessageSquare className="w-4 h-4 mr-1" />
                                    <span>{formatNumber(tweet_count)}</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{tweet_count.toLocaleString()} Tweets</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        </div>
    );
};

export default TwitterProfile;
