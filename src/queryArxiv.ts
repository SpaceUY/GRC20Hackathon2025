import xml2js from 'xml2js';

async function getAllPapers() {
  const batchSize = 100;
  let papers: any[] = [];
  let start = 0;
  let totalResults = 0;

  try {
    const firstBatch = await fetchArxivPapers('cat:econ.*', start, batchSize);
    totalResults = firstBatch.totalResults;
    papers = papers.concat(firstBatch.papers);

    start += batchSize;

    while (start < totalResults) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(
        `Fetching papers ${start} to ${Math.min(start + batchSize, totalResults)} of ${totalResults}`
      );

      const batch = await fetchArxivPapers('cat:econ.*', start, batchSize);
      papers = papers.concat(batch.papers);
      start += batchSize;
    }

    return papers;
  } catch (error) {
    console.error('Error fetching first batch of papers:', error);
    return [];
  }
}

async function fetchArxivPapers(
  query = 'cat:econ.*',
  start = 0,
  maxResults = 100
): Promise<{ papers: any[]; totalResults: number }> {
  const baseUrl = 'http://export.arxiv.org/api/query';
  const queryParams = new URLSearchParams({
    search_query: query,
    start: '0',
    max_results: maxResults.toString(),
    sortBy: 'lastUpdatedDate',
    sortOrder: 'descending'
  });

  try {
    const response = await fetch(`${baseUrl}?${queryParams}`);
    const xmlText = await response.text();
    return parseArxivResponse(xmlText);
  } catch (error) {
    console.error('Error fetching arXiv papers:', error);
    return { papers: [], totalResults: 0 };
  }
}

async function parseArxivResponse(
  xmlText
): Promise<{ papers: any[]; totalResults: number }> {
  try {
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(xmlText);

    // Handle case where no entries are found
    if (!result.feed.entry) {
      return { papers: [], totalResults: 0 };
    }

    // Convert to array if single entry
    const entries = Array.isArray(result.feed.entry)
      ? result.feed.entry
      : [result.feed.entry];

    const totalResults = parseInt(result.feed['opensearch:totalResults']._, 10);

    const papers = entries.map((entry) => {
      // Handle authors - could be single author or array
      const authors = Array.isArray(entry.author)
        ? entry.author.map((author) => author.name)
        : [entry.author.name];

      // Handle categories - could be single category or array
      const categories = Array.isArray(entry.category)
        ? entry.category.map((cat) => cat.$.term)
        : [entry.category.$.term];

      // Get PDF link
      const links = Array.isArray(entry.link) ? entry.link : [entry.link];
      const pdfLink =
        links.find((link) => link.$.title === 'pdf')?.$.href || '';
      const arxivLink =
        links.find((link) => link.$.rel === 'alternate')?.$.href || '';

      return {
        id: entry.id || '',
        title: entry.title?.trim() || '',
        abstract: entry.summary?.trim() || '',
        authors: authors,
        categories: categories,
        published: new Date(entry.published).toISOString(),
        updated: new Date(entry.updated).toISOString(),
        pdfLink: pdfLink,
        arxivLink: arxivLink
      };
    });

    return { papers, totalResults };
  } catch (error) {
    console.error('Error parsing arXiv response:', error);
    return { papers: [], totalResults: 0 };
  }
}

async function savePapersToFile(papers, filename) {
  const fs = require('fs').promises;
  try {
    await fs.writeFile(filename, JSON.stringify(papers, null, 2));
    console.log(`Successfully saved ${papers.length} papers to ${filename}`);
  } catch (error) {
    console.error('Error saving papers to file:', error);
  }
}

export async function saveEconPapers() {
  try {
    // Fetch papers from the quantitative finance category
    const econPapers = await getAllPapers();
    await savePapersToFile(econPapers, 'econ_papers.json');
  } catch (error) {
    console.error('Error getting econ papers:', error);
  }
}
