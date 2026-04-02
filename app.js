import { fetchAniList, fetchJikan } from './api.js';

let isDarkMode = true;

const views = {
    home: document.getElementById('view-home'),
    database: document.getElementById('view-database'),
    community: document.getElementById('view-community'),
    tracker: document.getElementById('view-tracker'),
    news: document.getElementById('view-news'),
    details: document.getElementById('view-details')
};

const navLinks = document.querySelectorAll('.nav-links a');
const toastContainer = document.getElementById('toast-container');

// State flags to prevent re-fetching unnecessarily
const loadedViews = {
    home: false, community: false, news: false
};

function init() {
    setupNavigation();
    
    document.getElementById('theme-toggle').addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    });

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        isDarkMode = false;
        document.documentElement.setAttribute('data-theme', 'light');
    }

    setupDatabaseFilters();
    
    // Load home automatically
    loadHomeData();
}

function setupNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.dataset.page;
            
            navLinks.forEach(l => l.classList.remove('active'));
            e.target.classList.add('active');
            
            Object.values(views).forEach(v => {
                if (v) v.classList.remove('active-view');
            });
            views[page].classList.add('active-view');
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Lazy Load tabs
            if(page === 'home' && !loadedViews.home) loadHomeData();
            if(page === 'community' && !loadedViews.community) loadCommunityData();
            if(page === 'news' && !loadedViews.news) loadNewsAndSchedule();
        });
    });
}

export function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    if(type === 'warning') toast.style.borderLeftColor = 'var(--warning)';
    if(type === 'success') toast.style.borderLeftColor = 'var(--success)';
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => { if(toast.parentElement) toast.remove(); }, 3000);
}

// ------ HOME / DISCOVER ------
async function loadHomeData() {
    loadedViews.home = true;
    const trendingData = await fetchAniList('DISCOVER', { page: 1, perPage: 24, sort: ['TRENDING_DESC'], type: 'ANIME' });
    renderMediaGrid(trendingData?.Page?.media, document.getElementById('trending-grid'));
}

// ------ DATABASE / SEARCH ------
function setupDatabaseFilters() {
    document.getElementById('db-search-btn').addEventListener('click', async () => {
        const type = document.getElementById('filter-type').value;
        const sort = document.getElementById('filter-sort').value;
        const genre = document.getElementById('filter-genre').value;
        
        let variables = { page: 1, perPage: 24, type, sort: [sort] };
        
        if (genre) {
            if (genre === 'Isekai') {
                variables.tag_in = ['Isekai'];
            } else {
                variables.genre_in = [genre];
            }
        }

        const container = document.getElementById('db-grid');
        container.innerHTML = '<div class="loader"></div>';
        
        const data = await fetchAniList('DATABASE', variables);
        renderMediaGrid(data?.Page?.media, container);
    });
}

// ------ COMMUNITY ------
async function loadCommunityData() {
    loadedViews.community = true;
    const data = await fetchAniList('THREADS', { page: 1 });
    renderThreads(data?.Page?.threads, document.getElementById('forum-list'));
}

function renderThreads(threads, container) {
    container.innerHTML = '';
    if(!threads || !threads.length) return container.innerHTML = 'No active forums.';

    threads.forEach(thread => {
        const avatar = thread.user?.avatar?.large || 'https://via.placeholder.com/50';
        const date = new Date(thread.createdAt * 1000).toLocaleDateString();
        
        container.innerHTML += `
            <div class="forum-thread">
                <img src="${avatar}" alt="user" style="width:50px; height:50px; border-radius:50%; object-fit:cover">
                <div>
                    <h3 style="font-size: 1.1rem; line-height: 1.3; margin-bottom: 0.3rem">${thread.title}</h3>
                    <div style="display:flex; gap: 0.5rem; flex-wrap:wrap">
                        ${thread.categories.map(c => `<span style="font-size: 0.75rem; background: var(--accent-glow); color:var(--text-primary); padding: 0.1rem 0.5rem; border-radius:10px">${c.name}</span>`).join('')}
                    </div>
                    <div class="thread-stats">
                        <span>💬 ${thread.replyCount} Replies</span>
                        <span>👁️ ${thread.viewCount} Views</span>
                        <span>📅 ${date}</span>
                    </div>
                </div>
            </div>
        `;
    });
}

// ------ NEWS & SCHEDULE ------
async function loadNewsAndSchedule() {
    loadedViews.news = true;
    
    // 1. Schedule (Next 24 Hours)
    const now = Math.floor(Date.now() / 1000);
    const tomorrow = now + 86400;
    const scheduleData = await fetchAniList('SCHEDULE', { page: 1, start: now, end: tomorrow });
    renderSchedule(scheduleData?.Page?.airingSchedules, document.getElementById('schedule-list'));

    // 2. News via Jikan Top Anime (Mocked as news highlights for now due to endpoints)
    const newsData = await fetchJikan('/top/anime?filter=upcoming&limit=5');
    renderNewsCards(newsData, document.getElementById('news-list'));
}

function renderSchedule(schedules, container) {
    container.innerHTML = '';
    if(!schedules || !schedules.length) return container.innerHTML = 'No upcoming episodes in 24 hours.';
    
    schedules.forEach(item => {
        const title = item.media.title.english || item.media.title.romaji;
        const time = new Date(item.airingAt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        container.innerHTML += `
            <div class="schedule-item">
                <div class="schedule-time">${time}</div>
                <img src="${item.media.coverImage.large}" style="width:40px; height:60px; border-radius:4px; object-fit:cover">
                <div>
                    <h4 style="margin-bottom:0.1rem">${title}</h4>
                    <span class="text-muted" style="font-size: 0.85rem">Episode ${item.episode}</span>
                </div>
            </div>
        `;
    });
}

function renderNewsCards(newsList, container) {
    container.innerHTML = '';
    if(!newsList || !newsList.length) return container.innerHTML = 'No news available.';

    newsList.forEach(news => {
        container.innerHTML += `
            <div class="news-card">
                <div style="display:flex;">
                    <img src="${news.images.jpg.image_url}" style="width: 100px; height: 100px; object-fit: cover">
                    <div class="news-content" style="padding: 1rem">
                        <h4 style="margin-bottom:0.3rem">${news.title}</h4>
                        <p class="text-muted" style="font-size: 0.85rem">Airing: ${news.aired?.string || 'TBA'}</p>
                    </div>
                </div>
            </div>
        `;
    });
}

// ------ UTILITY RENDERERS ------
window.openDetails = async function(id) {
    navLinks.forEach(l => l.classList.remove('active'));
    Object.values(views).forEach(v => v.classList.remove('active-view'));
    views.details.classList.add('active-view');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    document.getElementById('details-container').innerHTML = '<div class="loader"></div>';
    
    const data = await fetchAniList('DETAILS', { id });
    const media = data?.Media;
    
    if(!media) {
        document.getElementById('details-container').innerHTML = '<p class="text-center text-muted">Failed to load details.</p>';
        return;
    }

    const title = media.title.english || media.title.romaji;
    const color = media.coverImage.color || 'var(--accent-primary)';
    const banner = media.bannerImage || media.coverImage.extraLarge;
    
    let trailerHTML = '';
    if (media.trailer && media.trailer.site === 'youtube') {
        trailerHTML = `<button class="outline-btn mt-md" onclick="window.open('https://youtube.com/watch?v=${media.trailer.id}', '_blank')">▶ Watch Trailer</button>`;
    }

    document.getElementById('details-container').innerHTML = `
        <div class="details-header" style="background-image: url('${banner}');"></div>
        <div class="details-content">
            <img src="${media.coverImage.extraLarge}" class="details-poster">
            <div class="details-info">
                <h1 style="font-size:2.5rem; margin-bottom:0.5rem">${title}</h1>
                <div class="details-tags mb-md">
                    ${media.genres.map(g => `<span class="genre-tag" style="background: ${color}20; color: ${color}; border: 1px solid ${color}40">${g}</span>`).join('')}
                </div>
                <div class="details-stats mb-lg" style="display: flex; gap: 2rem;">
                    <div><strong style="color: var(--warning)">${media.averageScore || '?'}%</strong><br>Score</div>
                    <div><strong style="color: var(--accent-hover)">#${media.popularity.toLocaleString()}</strong><br>Popularity</div>
                </div>
                <div class="details-desc">${media.description || 'No description available for this series.'}</div>
                ${trailerHTML}
                <button class="primary-btn mt-md ml-sm" onclick="showToast('Added to your tracking list!', 'success')">Add to My List</button>
            </div>
        </div>
    `;
};

function renderMediaGrid(list, container) {
    if(!container) return;
    container.innerHTML = '';
    if(!list || !list.length) {
        container.innerHTML = '<p class="text-muted text-center" style="grid-column: 1/-1">No results matching filters.</p>';
        return;
    }
    
    list.forEach(media => {
        const title = media.title.english || media.title.romaji;
        const color = media.coverImage.color || 'var(--accent-primary)';
        
        container.innerHTML += `
            <div class="media-card" onclick="window.openDetails(${media.id})" style="border-bottom-color: ${color}">
                <div class="cover-wrapper">
                    <img src="${media.coverImage.large}" alt="${title}" loading="lazy">
                </div>
                <div class="card-content">
                    <h3 class="card-title" title="${title}">${title}</h3>
                    <p class="card-genres">${media.genres?.[0] || media.format}</p>
                </div>
            </div>
        `;
    });
}

function renderCharactersGrid(list, container) {
    if(!container) return;
    container.innerHTML = '';
    if(!list || !list.length) return container.innerHTML = 'No characters found.';
    
    list.forEach(char => {
        container.innerHTML += `
            <div class="character-card" style="position:relative; border-radius: var(--radius-md); overflow: hidden; box-shadow: var(--card-shadow); cursor:pointer" onclick="window.open('${char.url}')">
                <img src="${char.images.jpg.image_url}" style="width:100%; height:200px; object-fit:cover">
                <div style="position:absolute; bottom:0; padding:1.5rem 0.5rem 0.5rem; background:linear-gradient(transparent, rgba(0,0,0,0.9)); color:white; width: 100%">
                    <div style="font-weight:700">${char.name}</div>
                    <div style="font-size:0.8rem">❤️ ${char.favorites.toLocaleString()}</div>
                </div>
            </div>
        `;
    });
}

init();
