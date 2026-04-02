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
        query ($page: Int, $perPage: Int, $sort: [MediaSort], $type: MediaType, $genre: String) {
            Page(page: $page, perPage: $perPage) {
                media(sort: $sort, type: $type, genre: $genre, isAdult: false) {
                    ${MEDIA_FIELDS}
                }
            }
        }
    `,
    DATABASE: `
        query ($page: Int, $perPage: Int, $type: MediaType, $sort: [MediaSort], $genre_in: [String]) {
            Page(page: $page, perPage: $perPage) {
                pageInfo { total hasNextPage }
                media(type: $type, sort: $sort, genre_in: $genre_in, isAdult: false) {
                    ${MEDIA_FIELDS}
                    description(asHtml: true)
                }
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
