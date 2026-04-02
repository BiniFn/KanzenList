# ⚡ KanzenList - The Ultimate Anime Hub

![KanzenList Banner](https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-bbBWj4pEFseh.jpg)

**KanzenList** is a beautiful, deeply optimized, and heavily expanded browser-based application designed for discovering, tracking, and ranking anime and manga. Driven by **AniList GraphQL** and the **Jikan REST API**, the application dynamically queries data on the fly, remaining entirely localized and serverless!

This architecture ensures it is incredibly lightweight, perfectly compatible natively with Vercel's zero-config Free Tier, and visually striking due to its glassmorphism arrays and premium mesh-gradient dark mode.

---

## ✨ Key Features
- 🚀 **Zero Build Step:** Written purely in Native HTML, CSS, and structural JavaScript modules (`app.js` and `api.js`). Just serve the project folder!
- 🎨 **Premium Aesthetic:** Curated dark-mode aesthetic featuring Apple-quality micro animations and glass overlays instead of traditional flat-box designs.
- 📺 **Dynamic Discover Hub:** Explore Anime, Manga, and Isekai specific genres.
- 🗃️ **Advanced Database Filtering:** Rapidly sort titles by Highest Rated, Most Popular, Airing constraints, or filter specifically through nested genres.
- 🌍 **Community Boards:** Real-time retrieval of active community discussion forums from AniList.
- 📅 **Schedule & News (The "Drip" Tracker):** A specialized dashboard to view exactly *what minute* new Anime episodes are dropping in the next 24 hours.
- 👤 **Characters Subnet:** Global tracking of top anime characters powered seamlessly by API aggregations.
- 📝 **Details Viewer:** In-app dedicated media pages displaying synopsis data, score averages, native Japanese titles, release configurations, and banners without opening new tabs.

## 📥 Setup & Deployment
Running KanzenList locally or globally is phenomenally easy.

### Local Development
Thanks to its native structure, you can launch KanzenList by simply jumping into the directory and firing up a local server.
```bash
# Using Python
python3 -m http.server 8000

# OR using Node (if installed)
npx serve .
```

### Vercel Deployment (Production)
The project comes pre-configured with a highly optimized `vercel.json` manifest. You can deploy it instantly:
1. Push this repository to GitHub.
2. Log in to [Vercel](https://vercel.com/new).
3. Import the repository and click **Deploy**.
4. *(Vercel handles the Edge delivery routes instantly for free).*

## 🛠️ Architecture Overview
* `index.html`: The multi-tab layout infrastructure. Contains the logic for the complex responsive navigation.
* `style.css`: The massive premium stylesheet handling all animations, color variables, and media-queries.
* `app.js`: The central routing system bridging user interactions with the DOM inputs safely.
* `api.js`: An exported service module isolating raw `fetch()` calls to AniList's GraphQL and Jikan API.

## 🤝 Roadmap / V3 (Future Expansion)
- [ ] Incorporate comprehensive OAuth2 functionality to unlock User Tracking metrics natively.
- [ ] Add real-time push-notifications directly in the browser using WebWorkers.
- [ ] Cross-compare MAL profiles with AniList profiles efficiently.

---

> Created intuitively as a lightweight, supreme alternative to monolithic native applications. All Data provided by [AniList](https://anilist.co) and [Jikan](https://jikan.moe/).
