import { Client } from 'basic-ftp';
import path from 'path';
import fs from 'fs';

const dir = '/RePEc/all/';
const localPath = path.join(__dirname, '../downloads');

export async function downloadRePEcData() {
  if (!fs.existsSync(localPath)) {
    fs.mkdirSync(localPath);
  }

  const client = new Client();
  try {
    await client.access({
      host: 'all.repec.org',
      secure: false
    });

    const files = await client.list(dir);

    for (const file of files) {
      if (!file.name.endsWith('.rdf') && !file.name.endsWith('.redif')) {
        console.log(`Skipping non-RDF file: ${file.name}`);
        continue;
      }

      if (file.name.startsWith('.') || file.name.includes('..')) {
        console.log(`Skipping special file: ${file.name}`);
        continue;
      }

      const remoteFilePath = `${dir}/${file.name}`;
      const localFilePath = path.join(localPath, file.name);
      if (fs.existsSync(localFilePath)) {
        console.log(`File already exists: ${file.name}`);
        continue;
      }

      if (!file.isDirectory) {
        console.log(`Downloading: ${file.name}`);
        await client.downloadTo(localFilePath, remoteFilePath);
      }
    }

    console.log('Download completed successfully!');
  } catch (err) {
    console.error(err);
  }
}
