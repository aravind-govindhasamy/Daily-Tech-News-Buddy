export interface CommunityPost {
  id: string;
  category: 'marvel' | 'riders' | 'travel' | 'ngo' | 'volunteering' | 'local';
  subcategory?: string;
  authorName: string;
  authorAvatar: string;
  authorReputation: string;
  content: string;
  likes: number;
  commentsCount: number;
  shares: number;
  imageUrl?: string;
  reelsUrl?: string; // For Shorts/Reels video simulation
  isLikedByUser?: boolean;
  isSavedByUser?: boolean;
  createdAt: string;
  location?: string;
}

export interface PostComment {
  id: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
}

export interface EventItem {
  id: string;
  category: 'riders' | 'travel' | 'ngo' | 'volunteering' | 'local';
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  lat: number;   // for SVG Map plotting (0 to 100 on canvas grid)
  lng: number;   // for SVG Map plotting (0 to 100 on canvas grid)
  attendeeCount: number;
  userRsvp: boolean;
  isCheckedIn: boolean;
  organizer: string;
  rewardPoints: number;
  isFeatured?: boolean; // Monetization: Event sponsor options
  imageUrl?: string;
}

export interface NGOItem {
  id: string;
  name: string;
  focus: string;
  description: string;
  officeLocation: string;
  logo: string;
  donationGoal: number;
  donationRaised: number;
  activeCampaign?: string;
  volunteersNeeded: number;
  lat: number;
  lng: number;
}

export interface RiderRoute {
  id: string;
  routeName: string;
  difficulty: 'Easy' | 'Intermediate' | 'Challenging' | 'Expert';
  lengthKm: number;
  elevationM: number;
  startPoint: string;
  endPoint: string;
  waypoints: { x: number; y: number; label: string }[];
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  avatar: string;
  points: number;
  volunteerHours: number;
  reputation: string;
  badges: string[];
}

export interface MarvelCharacter {
  name: string;
  alias: string;
  description: string;
  imageUrl: string;
  powers: string[];
  stats: {
    strength: number;      // 1-7 (Official Marvel scale)
    intelligence: number;  
    speed: number;
    durability: number;
    energy: number;
    combat: number;
  };
}

export interface TriviaQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}
