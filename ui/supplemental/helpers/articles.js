'use strict'

const { posix: path } = require('path')

const TAG_STRIP = /<[^>]+>/g
const WS_NORMALIZE = /\s+/g

module.exports = function articles (site) {
  const posts = []
  if (!site) return posts

  const baseUrl = this && this.page && this.page.url
  if (Array.isArray(site.posts) && site.posts.length) return sortPosts(site.posts.slice())

  const pages = collectPages(site)
  const pageIndex = indexPagesByUrl(pages)

  const components = site.components || []
  const componentList = Array.isArray(components) ? components : Object.values(components)
  componentList.forEach((component) => {
    ;(component.versions || []).forEach((version) => {
      if (Array.isArray(version.navigation)) collectFromNav(version.navigation, posts, pageIndex, baseUrl)
    })
  })

  if (!posts.length) {
    if (pages.length) collectFromPages(pages, posts, baseUrl)
  }

  if (!posts.length) {
    const contentCatalog = this && this.contentCatalog
    if (contentCatalog && typeof contentCatalog.getPages === 'function') {
      collectFromCatalog(contentCatalog.getPages((page) => page.out), posts, baseUrl)
    }
  }

  return sortPosts(posts)
}

/**
 * Collects articles from navigation items into the shared posts array.
 * @param {Array} items navigation items
 * @param {Array} posts accumulator array for articles
 */
function collectFromNav (items, posts, pageIndex, baseUrl) {
  items.forEach((item) => {
    const page = (item.page || (item.url && pageIndex[item.url])) || {}
    const attrs =
      (item.asciidoc && item.asciidoc.attributes) ||
      (page.asciidoc && page.asciidoc.attributes) ||
      page.attributes ||
      item.attributes ||
      {}
    const role = attrs['page-role'] || attrs.role || item.role || page.role
    if (role === 'article') {
      const summary = normalizeSummary(
        item.contents ||
          (item.asciidoc && item.asciidoc.contents) ||
          (page.asciidoc && page.asciidoc.contents) ||
          page.description ||
          attrs.description ||
          attrs['page-description'] ||
          ''
      )
      posts.push({
        title: item.content || item.title || page.title || attrs.title || '',
        url: relativizeUrl(baseUrl, item.url || page.url),
        summary: summary.slice(0, 100),
        date: parseDate(attrs.revdate || attrs.date || attrs['page-date'] || item.date || page.pubdate || page.date)
      })
    }
    if (Array.isArray(item.items)) collectFromNav(item.items, posts, pageIndex, baseUrl)
  })
}

/**
 * Collects pages from the UI model when navigation entries don't expose page data.
 * @param {object} site site UI model
 * @param {Array} components normalized component list
 * @returns {Array} pages
 */
function collectPages (site) {
  if (Array.isArray(site.pages)) return site.pages
  const pages = []
  const components = site.components || []
  const componentList = Array.isArray(components) ? components : Object.values(components)
  componentList.forEach((component) => {
    ;(component.versions || []).forEach((version) => {
      if (Array.isArray(version.pages)) pages.push(...version.pages)
    })
  })
  return pages
}

/**
 * Collects articles from page entries into the shared posts array.
 * @param {Array} pages page items
 * @param {Array} posts accumulator array for articles
 */
function collectFromPages (pages, posts, baseUrl) {
  pages.forEach((page) => {
    const attrs = (page.asciidoc && page.asciidoc.attributes) || page.attributes || {}
    const role = attrs['page-role'] || attrs.role || page.role
    if (role === 'article') {
      const summary = normalizeSummary(
        page.contents ||
          (page.asciidoc && page.asciidoc.contents) ||
          attrs.description ||
          attrs['page-description'] ||
          ''
      )
      posts.push({
        title: page.title || attrs.title || '',
        url: relativizeUrl(baseUrl, page.url),
        summary: summary.slice(0, 100),
        date: parseDate(attrs.revdate || attrs.date || attrs['page-date'] || page.pubdate || page.date)
      })
    }
  })
}

/**
 * Collects articles from the content catalog pages.
 * @param {Array} pages page files from the content catalog
 * @param {Array} posts accumulator array for articles
 */
function collectFromCatalog (pages, posts, baseUrl) {
  pages.forEach((page) => {
    const attrs = (page.asciidoc && page.asciidoc.attributes) || {}
    const role = attrs['page-role'] || attrs.role
    if (role === 'article') {
      const summary = normalizeSummary(
        (page.asciidoc && page.asciidoc.contents) ||
          attrs.description ||
          attrs['page-description'] ||
          ''
      )
      posts.push({
        title: page.title || (page.asciidoc && page.asciidoc.doctitle) || attrs.title || '',
        url: relativizeUrl(baseUrl, page.pub && page.pub.url),
        summary: summary.slice(0, 100),
        date: parseDate(attrs.revdate || attrs.date || attrs['page-date'])
      })
    }
  })
}

/**
 * Builds a lookup table for pages by URL.
 * @param {Array} pages page items
 * @returns {Object} url -> page
 */
function indexPagesByUrl (pages) {
  const index = {}
  pages.forEach((page) => {
    if (page && page.url) index[page.url] = page
  })
  return index
}

function relativizeUrl (baseUrl, targetUrl) {
  if (!targetUrl || !baseUrl || targetUrl.charAt() !== '/') return targetUrl
  const baseDir = baseUrl.replace(/[^/]*$/, '')
  return path.relative(baseDir, targetUrl) || './'
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

/**
 * Sorts posts newest-first based on parsed dates.
 * @param {Array<{date: Date|null}>} posts
 * @returns {Array} sorted posts
 */
function sortPosts (posts) {
  return posts.sort((a, b) => {
    const timeA = (a.date instanceof Date && !isNaN(a.date)) ? a.date.getTime() : 0
    const timeB = (b.date instanceof Date && !isNaN(b.date)) ? b.date.getTime() : 0
    return timeB - timeA
  })
}
