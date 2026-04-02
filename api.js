/**
 * api.js
 * Centralized data fetching layer for AniList and Jikan APIs.
 */

const ANILIST_GRAPHQL_URL = 'https://graphql.anilist.co';
const JIKAN_API_URL = 'https://api.jikan.moe/v4';

const MEDIA_FIELDS = `
    id
    title { english romaji }
    coverImage { large color }
    averageScore
    genres
    format
    episodes
    chapters
`;

const QUERIES = {
    DISCOVER: `
        query ($page: Int, $perPage: Int, $sort: [MediaSort], $type: MediaType) {
            Page(page: $page, perPage: $perPage) {
                media(sort: $sort, type: $type, isAdult: false) {
                    ${MEDIA_FIELDS}
                }
            }
        }
    `,
    DATABASE: `
        query ($page: Int, $perPage: Int, $type: MediaType, $sort: [MediaSort], $genre_in: [String], $tag_in: [String]) {
            Page(page: $page, perPage: $perPage) {
                pageInfo { total hasNextPage }
                media(type: $type, sort: $sort, genre_in: $genre_in, tag_in: $tag_in, isAdult: false, format_not: MUSIC) {
                    ${MEDIA_FIELDS}
                    description(asHtml: true)
                }
            }
        }
    `,
    DETAILS: `
      query ($id: Int) {
        Media(id: $id) {
            id
            title { english romaji native }
            coverImage { extraLarge color }
            bannerImage
            description(asHtml: true)
            averageScore
            meanScore
            popularity
            genres
            format
            status
            episodes
            chapters
            seasonYear
            studios(isMain: true) { nodes { name } }
            trailer { id site thumbnail }
        }
      }
    `,
    THREADS: `
        query ($page: Int) {
            Page(page: $page, perPage: 15) {
                threads(sort: ID_DESC) {
                    id
                    title
                    replyCount
                    viewCount
                    categories { name }
                    user { name avatar { large } }
                    createdAt
                }
            }
        }
    `,
    SCHEDULE: `
        query ($page: Int, $start: Int, $end: Int) {
            Page(page: $page, perPage: 20) {
                airingSchedules(airingAt_greater: $start, airingAt_lesser: $end, sort: TIME) {
                    id
                    episode
                    airingAt
                    media {
                        id
                        title { english romaji }
                        coverImage { large color }
                        format
                    }
                }
            }
        }
    `,
    USER_STATS: `
        query ($name: String) {
            User(name: $name) {
                id
                name
                avatar { large }
                statistics {
                    anime { count episodesWatched minutesWatched }
                }
            }
        }
    `,
    USER_LIST: `
        query ($userId: Int) {
            MediaListCollection(userId: $userId, type: ANIME, sort: UPDATED_TIME_DESC, perChunk: 10) {
                lists {
                    entries {
                        media {
                            id
                            title { english romaji }
                            coverImage { large color }
                        }
                        progress
                    }
                }
            }
        }
    `
};

export async function fetchAniList(queryName, variables) {
    try {
        const response = await fetch(ANILIST_GRAPHQL_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ query: QUERIES[queryName], variables })
        });
        const data = await response.json();
        return data.data;
    } catch (e) {
        console.error("AniList API Error:", e);
        return null;
    }
}

export async function fetchJikan(endpoint) {
    try {
        const res = await fetch(`${JIKAN_API_URL}${endpoint}`);
        const result = await res.json();
        return result.data || [];
    } catch (e) {
        console.error("Jikan API Error:", e);
        return [];
    }
}
