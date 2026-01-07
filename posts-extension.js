'use strict'

/**
 * Posts Extension for TLDR UI Theme
 *
 * This extension collects articles from your Antora site and makes them
 * available to the UI theme for displaying article listings and featured content.
 *
 * The extension looks for pages with the attribute `page-role: article` and
 * collects them into a sorted list by date.
 *
 * Usage in antora-playbook.yml:
 *   antora:
 *     extensions:
 *       - ./extensions/posts-extension.js
 *
 * In your content files, mark articles with:
 *   :page-role: article
 *   :page-date: 2026-01-07
 *   :description: Your article summary
 *   :featured: true  (optional, for featured articles)
 *   :image: path/to/image.jpg  (optional, for article thumbnail)
 */

const TAG_STRIP = /<[^>]+>/g
const WS_NORMALIZE = /\s+/g

module.exports.register = function ({ config = {} }) {
  const logger = this.getLogger('posts-extension')

  let collectedPosts = []

  this.on('pagesComposed', ({ contentCatalog }) => {
    logger.info('Collecting articles for site.posts')

    const posts = []
    const allPages = contentCatalog.findBy({ family: 'page' })
    logger.info(`Total pages in catalog: ${allPages.length}`)

    // Find all pages marked with page-role="article"
    allPages.forEach((page) => {
      const attrs = page.asciidoc?.attributes || {}
      const role = attrs['page-role']

      logger.debug(`Page: ${page.src?.relative}, role: ${role}, attrs: ${Object.keys(attrs).join(', ')}`)

      if (role === 'article') {
        const summary = normalizeSummary(
          attrs.description ||
            attrs['page-description'] ||
            page.asciidoc?.doctitle ||
            ''
        )

        posts.push({
          title: attrs.navtitle || page.asciidoc?.doctitle || attrs.title || '',
          url: page.pub?.url || '',
          summary: summary.slice(0, 100),
          date: parseDate(attrs.revdate || attrs.date || attrs['page-date']),
          featured: attrs.featured === 'true' || attrs.featured === true,
          image: attrs.image || attrs['page-image'] || null,
        })
      }
    })

    // Sort posts by date (newest first)
    collectedPosts = posts.sort((a, b) => {
      const timeA = a.date instanceof Date && !isNaN(a.date) ? a.date.getTime() : 0
      const timeB = b.date instanceof Date && !isNaN(b.date) ? b.date.getTime() : 0
      return timeB - timeA
    })

    logger.info(`Found ${collectedPosts.length} article(s)`)
  })

  // Inject posts into the site model
  this.on('beforePublish', ({ siteCatalog }) => {
    logger.info('Injecting posts into site model')

    // Access site object from siteCatalog
    // The site object is stored as a property, not via a getter method
    if (siteCatalog.site && !siteCatalog.site.posts) {
      siteCatalog.site.posts = collectedPosts
      logger.info(`Injected ${collectedPosts.length} posts into site.posts`)
    }
  })
}

/**
 * Normalizes free-form text into a compact summary.
 * @param {string} text raw text
 * @returns {string}
 */
function normalizeSummary (text) {
  if (!text) return ''
  return String(text).replace(TAG_STRIP, ' ').replace(WS_NORMALIZE, ' ').trim()
}

/**
 * Parses dates from strings and returns a Date or null on failure.
 * @param {string|number|Date} value
 * @returns {Date|null}
 */
function parseDate (value) {
  if (!value) return null
  const parsed = new Date(value)
  return isNaN(parsed) ? null : parsed
}
