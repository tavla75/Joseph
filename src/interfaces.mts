interface oneChallenge {
    "id": number,
    "type": string,
    "title": string,
    "description": string,
    "minParticipants": number,
    "maxParticipants": number,
    "rating": number,
    "image": string,
    "labels": Array<string>
}

interface multipleChallenges {
    "challenges": Array<oneChallenge>
}

export type {oneChallenge, multipleChallenges};