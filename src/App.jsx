import { useState, useMemo } from 'react'
import animeData from './animeData.json'

const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Ecchi', 'Fantasy', 'Horror',
  'Mecha', 'Music', 'Mystery', 'Psychological', 'Romance', 'Sci-Fi',
  'Slice of Life', 'Sports', 'Supernatural', 'Thriller'
]

const getAnikaiUrl = (anime) => {
  const name = anime.title?.english || anime.title?.romaji || ''
  return `https://anikai.to/browser?keyword=${encodeURIComponent(name)}&sort=most_relevance&language%5B%5D=dub`
}

// Extract base franchise name by removing season/part indicators
const getBaseFranchiseName = (anime) => {
  const title = (anime.title?.english || anime.title?.romaji || '').toLowerCase()
  return title
    .replace(/\s*(season|part|cour)\s*\d+/gi, '')
    .replace(/\s*(2nd|3rd|4th|5th|6th)\s*(season|part|cour)?/gi, '')
    .replace(/\s*(ii|iii|iv|v|vi)(\s|$)/gi, ' ')
    .replace(/\s*:\s*[^:]+$/, '') // Remove subtitle after colon
    .replace(/\s*(the\s*)?(final|last)\s*(season|part|chapter)?/gi, '')
    .replace(/\s*(ova|ona|special|movie|film)s?/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// Compact card for mobile
function CompactAnimeCard({ anime, onHide, relatedAnime, isExpanded, onToggleExpand }) {
  const borderColor = anime.coverImage?.color || '#8b5cf6'
  const hasRelated = relatedAnime && relatedAnime.length > 0

  return (
    <div className="flex flex-col">
      <div
        className="bg-slate-800/80 rounded-lg overflow-hidden flex gap-3 p-2"
        style={{ borderLeft: `3px solid ${borderColor}` }}
        onClick={hasRelated ? onToggleExpand : undefined}
      >
        <img
          src={anime.coverImage?.large}
          alt={anime.title?.english || anime.title?.romaji}
          className="w-16 h-24 object-cover rounded flex-shrink-0"
        />
        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
          <div>
            <a
              href={getAnikaiUrl(anime)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-sm font-bold text-white line-clamp-2 leading-tight hover:text-purple-400 transition-colors"
            >
              {anime.title?.english || anime.title?.romaji}
            </a>
            <div className="flex gap-2 mt-1 text-xs text-slate-400">
              <span>{anime.startDate?.year}</span>
              <span>•</span>
              <span>{anime.episodes || '?'} eps</span>
              <span>•</span>
              <span>⭐ {anime.averageScore ? (anime.averageScore / 10).toFixed(1) : 'N/A'}</span>
              <span>•</span>
              <span>👥 {anime.popularity ? (anime.popularity / 1000).toFixed(0) + 'k' : '?'}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1 mt-1 items-center">
            {anime.genres?.map(genre => (
              <span key={genre} className="text-[10px] bg-purple-900/50 text-purple-300 px-1.5 py-0.5 rounded">
                {genre}
              </span>
            ))}
            {hasRelated && (
              <span className="text-[10px] text-purple-400 ml-auto flex-shrink-0">
                {isExpanded ? '▲' : '▼'} {relatedAnime.length}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onHide(anime.id); }}
          className="self-start p-1.5 bg-red-600/80 hover:bg-red-500 rounded text-xs"
          title="Hide"
        >
          🗑️
        </button>
      </div>

      {/* Related anime for mobile */}
      {isExpanded && hasRelated && (
        <div className="ml-4 mt-1 space-y-1 border-l-2 border-purple-600/50 pl-2">
          {relatedAnime.map(related => (
            <div
              key={related.id}
              className="bg-slate-800/60 rounded p-2 flex gap-2 items-center"
            >
              <img
                src={related.coverImage?.large}
                alt={related.title?.english || related.title?.romaji}
                className="w-10 h-14 object-cover rounded flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <a
                  href={getAnikaiUrl(related)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-white line-clamp-1 hover:text-purple-400 transition-colors"
                >
                  {related.title?.english || related.title?.romaji}
                </a>
                <div className="flex gap-2 text-[10px] text-slate-400">
                  <span>{related.startDate?.year}</span>
                  <span>•</span>
                  <span>{related.episodes || '?'} eps</span>
                  <span>•</span>
                  <span>⭐ {related.averageScore ? (related.averageScore / 10).toFixed(1) : 'N/A'}</span>
                  <span>•</span>
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
          <a
            href={getAnikaiUrl(anime)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-bold text-white mb-1 line-clamp-2 block hover:text-purple-400 transition-colors"
          >
            {anime.title?.english || anime.title?.romaji}
          </a>
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
            {anime.genres?.map(genre => (
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
                <a
                  href={getAnikaiUrl(related)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-white line-clamp-2 hover:text-purple-400 transition-colors"
                >
                  {related.title?.english || related.title?.romaji}
                </a>
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
  const [includeGenres, setIncludeGenres] = useState([])
  const [excludeGenres, setExcludeGenres] = useState([])
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

  // Cycle: neutral -> include (+) -> exclude (-) -> neutral
  const toggleGenre = (genre) => {
    if (includeGenres.includes(genre)) {
      // Was include, now exclude
      setIncludeGenres(prev => prev.filter(g => g !== genre))
      setExcludeGenres(prev => [...prev, genre])
    } else if (excludeGenres.includes(genre)) {
      // Was exclude, now neutral
      setExcludeGenres(prev => prev.filter(g => g !== genre))
    } else {
      // Was neutral, now include
      setIncludeGenres(prev => [...prev, genre])
    }
  }

  const clearGenres = () => {
    setIncludeGenres([])
    setExcludeGenres([])
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

    // Filter by included genres (must have all)
    if (includeGenres.length > 0) {
      filtered = filtered.filter(anime =>
        includeGenres.every(genre => anime.genres?.includes(genre))
      )
    }

    // Filter by excluded genres (must not have any)
    if (excludeGenres.length > 0) {
      filtered = filtered.filter(anime =>
        !excludeGenres.some(genre => anime.genres?.includes(genre))
      )
    }

    if (groupByFranchise) {
      // Group by base franchise name
      const franchiseGroups = new Map()

      filtered.forEach(anime => {
        const baseName = getBaseFranchiseName(anime)
        if (!franchiseGroups.has(baseName)) {
          franchiseGroups.set(baseName, [])
        }
        franchiseGroups.get(baseName).push(anime)
      })

      // Also add API relations to groups
      filtered.forEach(anime => {
        const baseName = getBaseFranchiseName(anime)
        anime.relations?.edges?.forEach(edge => {
          if (
            edge.node.type === 'ANIME' &&
            ['SEQUEL', 'PREQUEL', 'PARENT', 'SIDE_STORY', 'ALTERNATIVE'].includes(edge.relationType)
          ) {
            // Check if this related anime exists in our filtered list
            const relatedInList = filtered.find(a => a.id === edge.node.id)
            if (relatedInList) {
              const relatedBaseName = getBaseFranchiseName(relatedInList)
              // Merge groups if they have different base names
              if (relatedBaseName !== baseName && franchiseGroups.has(relatedBaseName)) {
                const toMerge = franchiseGroups.get(relatedBaseName)
                franchiseGroups.get(baseName).push(...toMerge.filter(a =>
                  !franchiseGroups.get(baseName).some(existing => existing.id === a.id)
                ))
                franchiseGroups.delete(relatedBaseName)
              }
            }
          }
        })
      })

      // Convert groups to display format
      const result = []
      const seenIds = new Set()

      franchiseGroups.forEach(group => {
        // Sort by year, then by popularity
        group.sort((a, b) => {
          const yearA = a.startDate?.year || 9999
          const yearB = b.startDate?.year || 9999
          if (yearA !== yearB) return yearA - yearB
          return (b.popularity || 0) - (a.popularity || 0)
        })

        // Main anime is the most popular one
        const mainAnime = [...group].sort((a, b) => (b.popularity || 0) - (a.popularity || 0))[0]

        if (!seenIds.has(mainAnime.id)) {
          const related = group
            .filter(a => a.id !== mainAnime.id)
            .sort((a, b) => (a.startDate?.year || 9999) - (b.startDate?.year || 9999))

          group.forEach(a => seenIds.add(a.id))
          result.push({ anime: mainAnime, related })
        }
      })

      // Sort final result by popularity
      result.sort((a, b) => (b.anime.popularity || 0) - (a.anime.popularity || 0))
      return result
    }

    return filtered.map(anime => ({ anime, related: [] }))
  }, [animeList, hiddenAnime, selectedYears, selectedScore, includeGenres, excludeGenres, groupByFranchise])

  return (
    <div className="min-h-screen text-white">
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-purple-800/30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-2 sm:py-4">
          <div className="flex justify-between items-center mb-1">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                🎌 Anime Finder
              </h1>
              <p className="text-xs sm:text-sm text-green-400">🎙️ DUB • <span className="text-yellow-400 font-bold">{displayedAnime.length}</span>/{animeList.length}</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Group by Franchise toggle - compact on mobile */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={groupByFranchise}
                  onChange={(e) => setGroupByFranchise(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 sm:w-11 sm:h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                <span className="ml-1 text-xs sm:text-sm text-slate-300 hidden sm:inline">Franchise</span>
              </label>
              {hiddenAnime.size > 0 && (
                <button
                  onClick={clearHidden}
                  className="px-2 py-0.5 text-xs bg-orange-600/80 hover:bg-orange-500 rounded-full text-white"
                >
                  +{hiddenAnime.size}
                </button>
              )}
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
          </div>

          {/* Genre Filters */}
          <div className="mt-3 flex flex-wrap gap-2">
            {(includeGenres.length > 0 || excludeGenres.length > 0) && (
              <button
                onClick={clearGenres}
                className="px-3 py-1 text-xs bg-red-600/80 hover:bg-red-500 rounded-full text-white transition-colors"
              >
                Clear
              </button>
            )}
            {GENRES.map(genre => {
              const isIncluded = includeGenres.includes(genre)
              const isExcluded = excludeGenres.includes(genre)
              return (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    isIncluded
                      ? 'bg-green-600 text-white'
                      : isExcluded
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {isIncluded ? '+' : isExcluded ? '-' : ''}{genre}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
        {/* Compact mobile view */}
        <div className="sm:hidden flex flex-col gap-2">
          {displayedAnime.map(({ anime, related }) => (
            <CompactAnimeCard
              key={anime.id}
              anime={anime}
              onHide={hideAnime}
              relatedAnime={related}
              isExpanded={expandedFranchises.has(anime.id)}
              onToggleExpand={() => toggleFranchise(anime.id)}
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
