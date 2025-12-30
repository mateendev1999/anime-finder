import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load dubbed MAL IDs
const dubData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/dubinfo.json'), 'utf-8'))
const DUBBED_MAL_IDS = dubData.dubbed

console.log(`📋 Loaded ${DUBBED_MAL_IDS.length} dubbed anime IDs\n`)

const API_URL = 'https://graphql.anilist.co'

const QUERY = `
query ($page: Int, $perPage: Int, $idMal_in: [Int]) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { hasNextPage }
    media(type: ANIME, idMal_in: $idMal_in, sort: POPULARITY_DESC, isAdult: false) {
      id
      idMal
      title { romaji english }
      coverImage { large color }
      startDate { year }
      episodes
      averageScore
      popularity
      genres
      description(asHtml: false)
      format
      relations {
        edges {
          relationType
          node { id idMal type title { romaji english } coverImage { large } startDate { year } episodes averageScore popularity }
        }
      }
    }
  }
}
`

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let errorCount = 0
let successCount = 0

async function fetchChunk(chunk, chunkIdx, retries = 5) {
  const variables = { page: 1, perPage: 50, idMal_in: chunk }

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ query: QUERY, variables })
      })

      if (response.status === 429) {
        const waitTime = 5000 + (attempt * 2000)
        console.log(`\n⚠️  Rate limit chunk ${chunkIdx} - waiting ${waitTime/1000}s...`)
        await delay(waitTime)
        continue
      }

      if (!response.ok) {
        console.log(`\n❌ HTTP ${response.status} chunk ${chunkIdx}`)
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      if (data.errors) {
        console.log(`\n❌ GraphQL Error chunk ${chunkIdx}: ${data.errors[0].message}`)
        errorCount++
        return []
      }

      successCount++
      return data.data.Page.media
    } catch (err) {
      if (attempt === retries - 1) {
        console.log(`\n❌ Failed chunk ${chunkIdx}: ${err.message}`)
        errorCount++
      }
      await delay(2000)
    }
  }
  return []
}

async function fetchAllAnime() {
  console.log('🚀 Fetching anime from AniList API...\n')

  const chunkSize = 50
  const chunks = []
  for (let i = 0; i < DUBBED_MAL_IDS.length; i += chunkSize) {
    chunks.push(DUBBED_MAL_IDS.slice(i, i + chunkSize))
  }

  console.log(`📦 ${chunks.length} chunks to fetch\n`)

  let allAnime = []
  const PARALLEL = 3 // 3 parallel requests

  for (let i = 0; i < chunks.length; i += PARALLEL) {
    const batch = chunks.slice(i, i + PARALLEL)

    const promises = batch.map((chunk, idx) => fetchChunk(chunk, i + idx))
    const results = await Promise.all(promises)

    for (const result of results) {
      if (result) allAnime = [...allAnime, ...result]
    }

    const progress = Math.min(100, ((i + batch.length) / chunks.length * 100)).toFixed(0)
    process.stdout.write(`\r⚡ ${progress}% | ${allAnime.length} anime`)

    await delay(350) // Delay between batches to avoid rate limiting
  }

  console.log(`\n\n✅ Fetched ${allAnime.length} anime`)

  const uniqueAnime = [...new Map(allAnime.map(a => [a.id, a])).values()]
  console.log(`🧹 Unique: ${uniqueAnime.length}`)

  uniqueAnime.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))

  const outputPath = path.join(__dirname, '../src/animeData.json')
  fs.writeFileSync(outputPath, JSON.stringify({
    lastUpdated: new Date().toISOString(),
    count: uniqueAnime.length,
    anime: uniqueAnime
  }))

  console.log(`💾 Saved: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`)
  console.log(`\n📊 Stats: ${successCount} success, ${errorCount} errors`)
}

fetchAllAnime().catch(console.error)
