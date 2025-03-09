# GRC20 Hackathon

This code is used for the [GRC20 Hackathon](https://thegraph.com/grc20-hackathon/) to get data to be published using the GRC20 standard.

## Proposal

For the hackathon, we were assigned the academic fields of Economics and Finance: Course, Lesson, Paper, School, and Topic.

We chose to work with Economic and Finance papers and decided to use Arxiv.org to get the papers.

Arxiv is a curated research-sharing platform that provides an API and has the paper's metadata well-structured and organized in its categories.

## Data structure

With the papers as the main entity to track, we think the entry point would be to identify its main characteristics, they would be part of spaces related to their categories or academic fields (focusing on economics and finances, but we could track other categories associated to the same papers), and have one or more authors associated with them.

For the authors, we have only their names, but that would serve to identify it as a node and possibly associate different papers with the same author.

For the academic field spaces, it is important to check for already existing ones, since it's the one with more chances to be already used by someone else. We ended up deciding to use the already existing academic fields and relate it to the paper with the academic fields property, but also, if that academic field has an associated space, link it in the related spaces.

The papers have some categories associated with them in arXiv, so we decided to map those categories to tags.

The papers will have a title, an abstract, authors, academic fields, related spaces, tags, a published date, a web URL, and a download URL.

![image](https://github.com/user-attachments/assets/bc80a554-4267-42b7-a194-c58e63d4be5f)

## How to use the code

The code in this repository includes different scripts with the final goal of having well-structured data available using the GRC20 standard.

We are using the code to upload the previously mentioned areas, but it could be easily adapted to get other categories.

### Steps:

1. Querying arxiv metadata: the `queryArxiv.ts` file includes the scripts necessary to download the paper's metadata using the API, transform it to JSON, and download it locally.

2. Modeling into a DB: the `arxivToMongo.ts` file makes use of the download JSON files and some Mongo db schemas to save the info into a database, trying to assemble the data into "entities" that should be as close as possible to the types we will be using to upload to GRC20.

3. Make the info available in GRC20:

### Run instructions:

1. Create an `.env` file based on the `.env.template` and fill in the variables.
2. Open a terminal at the root of the project and run `npm install`.
3. Check the `index.ts` file and comment out the steps you are not interested in running, you can run all of them at the same time, or one at a time by editing that file.
4. (Optional) Run `docker compose up` to start a local MongoDB instance, you can choose to use another service or instance, and replace the link in the `.env` file.
5. Run `npm run dev` in the terminal to run the index file.

> NOTE: the current index file is meant to show the steps needed to use the entire code, I suggest running step by step and ensure each step works properly.

6. You could also run each file inside operations separately using `npx tsx src/operations/*.ts` to create the entities.
