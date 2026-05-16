export declare class UpdateProfileDto {
    nickname?: string;
    avatar?: string;
    gender?: 'male' | 'female' | 'unknown';
    birthday?: string;
    height?: number;
    weight?: number;
    hometown?: string;
    location?: string;
    education?: string;
    school?: string;
    schoolTier?: '985' | '211' | null;
    occupation?: string;
    jobLevel?: string;
    company?: string;
    income?: string;
    bio?: string;
    hobbies?: string[];
}
export declare class UpdateFiltersDto {
    ageRange?: {
        min: number;
        max: number;
    };
    zodiacMatch?: string[];
    distance?: number;
    education?: string[];
    incomeRange?: {
        min: string;
        max: string;
    };
}
export declare class ReportUserDto {
    reason: string;
    description?: string;
    evidence?: string[];
}
export declare class UserResponseDto {
    id: string;
    phone: string;
    nickname: string;
    avatar: string;
    gender: string;
    age: number;
    height: number;
    location: string;
    zodiac: string;
    zodiacSign: string;
    mbti: string;
    education: string;
    occupation: string;
    income: string;
    bio: string;
    hobbies: string[];
    isRealName: boolean;
    isFaceVerified: boolean;
    isVip: boolean;
    vipExpiry: Date;
    filterSettings: Record<string, any>;
    createdAt: Date;
}
export declare class UserCardDto {
    id: string;
    nickname: string;
    avatar: string;
    gender: string;
    age: number;
    height: number;
    weight?: number | null;
    hometown: string;
    location: string;
    zodiac: string;
    zodiacSign: string;
    mbti: string;
    riyuan: string;
    education: string;
    school?: string;
    schoolTier?: '985' | '211' | null;
    occupation: string;
    jobLevel?: string;
    company?: string;
    income: string;
    bio: string;
    hobbies: string[];
    isRealName: boolean;
    isFaceVerified: boolean;
    isVip: boolean;
    matchReason: string;
    matchTagline: string;
    matchScore: number;
}
