import path from 'path';
import fs from 'fs';
import xml2js from 'xml2js';

const localPath = path.join(__dirname, '../downloads/arxiv');

async function saveAllPapersByPage(categories = 'cat:econ.*') {
  const batchSize = 100;
  let start = 0;
  let totalResults = 0;

  let pageRetries = 0;
  const maxPageRetries = 3;

  try {
    const firstBatch = await fetchArxivPapers(categories, start, batchSize);
    totalResults = firstBatch.totalResults;
    await savePapersToFile(
      firstBatch.papers,
      `arxiv_papers_${start}_to${start + batchSize}.json`
    );

    start += batchSize;

    while (start < totalResults) {
      await new Promise((resolve) => setTimeout(resolve, 1100));
      console.log(
        `Fetching papers ${start} to ${Math.min(start + batchSize, totalResults)} of ${totalResults}`
      );

      const batch = await fetchArxivPapers(categories, start, batchSize);
      if (batch.papers.length === 0 && pageRetries < maxPageRetries) {
        console.log(
          `Page from ${start} to ${start + batchSize} is empty. Retrying...`
        );
        pageRetries++;
        continue;
      }

      pageRetries = 0;

      await savePapersToFile(
        batch.papers,
        `arxiv_papers_${start}_to_${start + batchSize}.json`
      );

      start += batchSize;
    }
  } catch (error) {
    console.error('Error fetching first batch of papers:', error);
    return [];
  }
}

async function fetchArxivPapers(
  query,
  start = 0,
  maxResults = 100
): Promise<{ papers: any[]; totalResults: number }> {
  if (!fs.existsSync(localPath)) {
    fs.mkdirSync(localPath, { recursive: true });
  }

  const baseUrl = 'http://export.arxiv.org/api/query';
  const queryParams = new URLSearchParams({
    search_query: query,
    start: start.toString(),
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
  try {
    await fs.promises.writeFile(
      path.join(localPath, filename),
      JSON.stringify(papers, null, 2)
    );
    console.log(`Successfully saved ${papers.length} papers to ${filename}`);
  } catch (error) {
    console.error('Error saving papers to file:', error);
  }
}

export async function saveEconAndFinancePapers() {
  try {
    await saveAllPapersByPage('cat:econ.* OR cat:q-fin.*');
  } catch (error) {
    console.error('Error getting econ papers:', error);
  }
}
