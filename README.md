# GRC20 Hackathon

This code is used for the [GRC20 Hackathon](https://thegraph.com/grc20-hackathon/) to get data to be published using the GRC20 standard.

## Proposal

For the hackathon we were assigned the academic fields Economics and Finance, with types Course, Lesson, Paper, School, and Topic.

We choose to work with Economic and Finance papers and choose to use Arxiv.org to get the papers.

Arxiv is a curated research-sharing platform, that provides an API and has the paper's metadata well structured and organized in its categories.

## Data structure

With the papers as the main entity to track, we think the entry point would be to identify its main characteristics, they would be part of spaces related to their categories or fields (focusing on economics and finances, but we could track other categories associated to the same papers), and have one or more authors associated with them.

For the author, we have only its name, but that would serve to identify it as a node and possibly associate different papers with the same author.

For the academic field spaces, it is important to check for already existing ones, since it's the one with more chances to be already in use by someone else.

The papers will have a title, an abstract, authors, categories, published date, last update date, a download link, and an arxiv id or link so anyone can track its source.

## How to use the code

The code in this repository include different scripts with the final goal to have well structured data available using the GRC20 standard.

We are using the code to upload the previously mentioned areas, but it could be easily adapted to get other categories.

### Steps:

1. Querying arxiv metadata: the `queryArxiv.ts` file includes the scripts necessary to download the paper's metadata using the API, transform it to JSON and download it locally.

2. Modeling into a DB: the `arxivToMongo.ts` file make use of the download JSON files and some mongo db schemas to save the info into a database, trying to assemble the data into "entities" that should be as close as possible to the types we will be using to upload to GRC20.

3. Make the info available in GRC20:

### Run instructions:

1. Create an `.env` file based on the `.env.template` and fill in the variables.
2. Open a terminal at the root of the project and run `npm install`.
3. Check the `index.ts` file and comment out the steps you are not interested in running, you can run all of it at the same time, or one at a time by editing that file.
4. Run `npm run dev` in the terminal.
