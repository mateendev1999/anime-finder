import { useState, useMemo } from 'react'
import animeData from './animeData.json'

const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Ecchi', 'Fantasy', 'Horror',
  'Mecha', 'Music', 'Mystery', 'Psychological', 'Romance', 'Sci-Fi',
  'Slice of Life', 'Sports', 'Supernatural', 'Thriller'
]

// Compact card for mobile
function CompactAnimeCard({ anime, onHide }) {
  const borderColor = anime.coverImage?.color || '#8b5cf6'

  return (
    <div
      className="bg-slate-800/80 rounded-lg overflow-hidden flex gap-3 p-2"
      style={{ borderLeft: `3px solid ${borderColor}` }}
    >
      <img
        src={anime.coverImage?.large}
        alt={anime.title?.english || anime.title?.romaji}
        className="w-16 h-24 object-cover rounded flex-shrink-0"
      />
      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
        <div>
          <h3 className="text-sm font-bold text-white line-clamp-2 leading-tight">
            {anime.title?.english || anime.title?.romaji}
          </h3>
          <div className="flex gap-2 mt-1 text-xs text-slate-400">
            <span>{anime.startDate?.year}</span>
            <span>•</span>
            <span>{anime.episodes || '?'} eps</span>
            <span>•</span>
            <span>⭐ {anime.averageScore ? (anime.averageScore / 10).toFixed(1) : 'N/A'}</span>
          </div>
        </div>
        <div className="flex gap-1 mt-1">
          {anime.genres?.slice(0, 2).map(genre => (
            <span key={genre} className="text-[10px] bg-purple-900/50 text-purple-300 px-1.5 py-0.5 rounded">
              {genre}
            </span>
          ))}
        </div>
      </div>
      <button
        onClick={() => onHide(anime.id)}
        className="self-start p-1.5 bg-red-600/80 hover:bg-red-500 rounded text-xs"
        title="Hide"
      >
        🗑️
      </button>
    </div>
  )
}

// Full card for desktop
function AnimeCard({ anime, isExpanded, onToggleExpand, relatedAnime, onHide }) {
  const [showDescription, setShowDescription] = useState(false)
  const borderColor = anime.coverImage?.color || '#8b5cf6'

  const cleanDescription = (desc) => {
    if (!desc) return 'No description available.'
    return desc.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]*>/g, '').substring(0, 300) + (desc.length > 300 ? '...' : '')
  }

  return (
    <div className="flex flex-col">
      <div
        className="bg-slate-800/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
        style={{ borderLeft: `4px solid ${borderColor}` }}
      >
        <div className="relative">
          <img
            src={anime.coverImage?.large}
            alt={anime.title?.english || anime.title?.romaji}
            className="w-full h-64 object-cover"
          />
          <div className="absolute top-2 right-2 flex gap-1">
            <div className="bg-purple-600/90 backdrop-blur-sm px-2 py-1 rounded-lg text-sm font-bold">
              ⭐ {anime.averageScore ? (anime.averageScore / 10).toFixed(1) : 'N/A'}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onHide(anime.id); }}
              className="bg-red-600/90 hover:bg-red-500 backdrop-blur-sm px-2 py-1 rounded-lg text-sm transition-colors"
              title="Hide (already watched)"
            >
              🗑️
            </button>
          </div>
          <div className="absolute top-2 left-2 bg-green-600/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold">
            🎙️ DUB
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">
            {anime.title?.english || anime.title?.romaji}
          </h3>
          {anime.title?.english && anime.title?.romaji && anime.title.english !== anime.title.romaji && (
            <p className="text-sm text-slate-400 mb-2 line-clamp-1">{anime.title.romaji}</p>
          )}

          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-xs bg-slate-700 px-2 py-1 rounded-full text-slate-300">
              📅 {anime.startDate?.year || 'TBA'}
            </span>
            <span className="text-xs bg-slate-700 px-2 py-1 rounded-full text-slate-300">
              📺 {anime.episodes || '?'} eps
            </span>
            <span className="text-xs bg-slate-700 px-2 py-1 rounded-full text-slate-300">
              👥 {anime.popularity ? (anime.popularity / 1000).toFixed(0) + 'k' : '?'}
            </span>
          </div>

          <div className="flex flex-wrap gap-1 mb-3">
            {anime.genres?.slice(0, 3).map(genre => (
              <span
                key={genre}
                className="text-xs bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded-full"
              >
                {genre}
              </span>
            ))}
          </div>

          <button
            onClick={() => setShowDescription(!showDescription)}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            {showDescription ? '▲ Hide description' : '▼ Show description'}
          </button>

          {showDescription && (
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              {cleanDescription(anime.description)}
            </p>
          )}

          {relatedAnime && relatedAnime.length > 0 && (
            <button
              onClick={onToggleExpand}
              className="mt-3 w-full py-2 bg-purple-700/50 hover:bg-purple-600/50 rounded-lg text-sm font-medium transition-colors"
            >
              {isExpanded ? '▲ Hide' : '▼ Show'} {relatedAnime.length} related season{relatedAnime.length > 1 ? 's' : ''}
            </button>
          )}
        </div>
      </div>

      {isExpanded && relatedAnime && relatedAnime.length > 0 && (
        <div className="ml-4 mt-2 space-y-2 border-l-2 border-purple-600/50 pl-4">
          {relatedAnime.map(related => (
            <div
              key={related.id}
              className="bg-slate-800/60 rounded-lg p-3 flex gap-3 items-center"
            >
              <img
                src={related.coverImage?.large}
                alt={related.title?.english || related.title?.romaji}
                className="w-16 h-20 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-white line-clamp-2">
                  {related.title?.english || related.title?.romaji}
                </h4>
                <div className="flex flex-wrap gap-2 mt-1 text-xs text-slate-400">
                  <span>📅 {related.startDate?.year || 'TBA'}</span>
                  <span>📺 {related.episodes || '?'} eps</span>
                  <span>⭐ {related.averageScore ? (related.averageScore / 10).toFixed(1) : 'N/A'}</span>
                  <span>👥 {related.popularity ? (related.popularity / 1000).toFixed(0) + 'k' : '?'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const HIDDEN_ANIME_KEY = 'anime-finder-hidden'

function App() {
  const [selectedGenres, setSelectedGenres] = useState([])
  const [selectedYears, setSelectedYears] = useState([])
  const [selectedScore, setSelectedScore] = useState(0)
  const [groupByFranchise, setGroupByFranchise] = useState(false)
  const [expandedFranchises, setExpandedFranchises] = useState(new Set())
  const [hiddenAnime, setHiddenAnime] = useState(() => {
    const saved = localStorage.getItem(HIDDEN_ANIME_KEY)
    return saved ? new Set(JSON.parse(saved)) : new Set()
  })

  const hideAnime = (id) => {
    setHiddenAnime(prev => {
      const newSet = new Set(prev)
      newSet.add(id)
      localStorage.setItem(HIDDEN_ANIME_KEY, JSON.stringify([...newSet]))
      return newSet
    })
  }

  const clearHidden = () => {
    setHiddenAnime(new Set())
    localStorage.removeItem(HIDDEN_ANIME_KEY)
  }

  const animeList = animeData.anime
  const lastUpdated = animeData.lastUpdated

  const toggleFranchise = (animeId) => {
    setExpandedFranchises(prev => {
      const newSet = new Set(prev)
      if (newSet.has(animeId)) {
        newSet.delete(animeId)
      } else {
        newSet.add(animeId)
      }
      return newSet
    })
  }

  const toggleGenre = (genre) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    )
  }

  const toggleYear = (year) => {
    setSelectedYears(prev =>
      prev.includes(year)
        ? prev.filter(y => y !== year)
        : [...prev, year]
    )
  }

  const displayedAnime = useMemo(() => {
    let filtered = [...animeList]

    // Filter out hidden anime
    filtered = filtered.filter(anime => !hiddenAnime.has(anime.id))

    // Filter by year (default: 2010+)
    if (selectedYears.length > 0) {
      filtered = filtered.filter(anime =>
        selectedYears.includes(anime.startDate?.year)
      )
    } else {
      // Default: only show anime from 2010+
      filtered = filtered.filter(anime =>
        (anime.startDate?.year || 0) >= 2010
      )
    }

    // Filter by score range (6=6-6.9, 7=7-7.9, etc)
    if (selectedScore > 0) {
      filtered = filtered.filter(anime => {
        const score = anime.averageScore || 0
        return score >= selectedScore && score < selectedScore + 10
      })
    }

    // Filter by selected genres
    if (selectedGenres.length > 0) {
      filtered = filtered.filter(anime =>
        selectedGenres.every(genre => anime.genres?.includes(genre))
      )
    }

    if (groupByFranchise) {
      const seenFranchises = new Set()
      const franchiseMap = new Map()

      filtered.forEach(anime => {
        const relatedIds = new Set([anime.id])
        const relatedAnime = []

        anime.relations?.edges?.forEach(edge => {
          if (
            edge.node.type === 'ANIME' &&
            ['SEQUEL', 'PREQUEL', 'PARENT', 'SIDE_STORY', 'ALTERNATIVE'].includes(edge.relationType)
          ) {
            relatedIds.add(edge.node.id)
            relatedAnime.push(edge.node)
          }
        })

        let franchiseId = anime.id
        for (const id of relatedIds) {
          if (seenFranchises.has(id)) {
            franchiseId = id
            break
          }
        }

        if (!seenFranchises.has(franchiseId)) {
          relatedIds.forEach(id => seenFranchises.add(id))
          franchiseMap.set(anime.id, {
            anime,
            related: relatedAnime.sort((a, b) => (a.startDate?.year || 9999) - (b.startDate?.year || 9999))
          })
        }
      })

      return Array.from(franchiseMap.values())
    }

    return filtered.map(anime => ({ anime, related: [] }))
  }, [animeList, hiddenAnime, selectedYears, selectedScore, selectedGenres, groupByFranchise])

  return (
    <div className="min-h-screen text-white">
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-purple-800/30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-start mb-1">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                🎌 Anime Finder
              </h1>
              <p className="text-sm text-green-400">🎙️ English Dubbed Only • <span className="text-yellow-400 font-bold">{displayedAnime.length}</span> / {animeList.length} anime</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">
                Last update: {new Date(lastUpdated).toLocaleDateString()}
              </p>
              <p className="text-xs text-slate-600">
                Run: npm run fetch-anime
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-slate-400">Year:</span>
              {selectedYears.length > 0 && (
                <button
                  onClick={() => setSelectedYears([])}
                  className="px-2 py-0.5 text-xs bg-red-600/80 hover:bg-red-500 rounded-full text-white transition-colors"
                >
                  Clear
                </button>
              )}
              {Array.from({ length: 16 }, (_, i) => 2025 - i).map(year => (
                <button
                  key={year}
                  onClick={() => toggleYear(year)}
                  className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
                    selectedYears.includes(year)
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Score:</span>
              {[0, 60, 70, 80, 90].map(score => (
                <button
                  key={score}
                  onClick={() => setSelectedScore(score === selectedScore ? 0 : score)}
                  className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
                    selectedScore === score
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {score === 0 ? 'All' : `${score/10}`}
                </button>
              ))}
            </div>

            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={groupByFranchise}
                  onChange={(e) => setGroupByFranchise(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                <span className="ml-2 text-sm text-slate-300">Group by Franchise</span>
              </label>
            </div>

            {hiddenAnime.size > 0 && (
              <button
                onClick={clearHidden}
                className="px-3 py-1 text-xs bg-orange-600/80 hover:bg-orange-500 rounded-full text-white transition-colors"
              >
                Restore {hiddenAnime.size} hidden
              </button>
            )}
          </div>

          {/* Genre Filters */}
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedGenres.length > 0 && (
              <button
                onClick={() => setSelectedGenres([])}
                className="px-3 py-1 text-xs bg-red-600/80 hover:bg-red-500 rounded-full text-white transition-colors"
              >
                Clear All
              </button>
            )}
            {GENRES.map(genre => (
              <button
                key={genre}
                onClick={() => toggleGenre(genre)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  selectedGenres.includes(genre)
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
        {/* Compact mobile view */}
        <div className="sm:hidden flex flex-col gap-2">
          {displayedAnime.map(({ anime }) => (
            <CompactAnimeCard
              key={anime.id}
              anime={anime}
              onHide={hideAnime}
            />
          ))}
        </div>

        {/* Full desktop view */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedAnime.map(({ anime, related }) => (
            <AnimeCard
              key={anime.id}
              anime={anime}
              relatedAnime={related}
              isExpanded={expandedFranchises.has(anime.id)}
              onToggleExpand={() => toggleFranchise(anime.id)}
              onHide={hideAnime}
            />
          ))}
        </div>

        {displayedAnime.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-slate-400">No anime found matching your criteria.</p>
            <p className="text-sm text-slate-500 mt-2">Try adjusting your filters.</p>
          </div>
        )}

        {displayedAnime.length > 0 && (
          <div className="text-center py-6">
            <p className="text-slate-500">
              Showing {displayedAnime.length} anime
              {displayedAnime.length !== animeList.length && ` (filtered from ${animeList.length} total)`}
            </p>
          </div>
        )}
      </main>

      <footer className="text-center py-6 text-slate-500 text-sm border-t border-slate-800">
        Powered by AniList API • Built with React + Vite + Tailwind
      </footer>
    </div>
  )
}

export default App
