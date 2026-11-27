import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {symptomPath} from '../../src/data/symptom-path';

export default function handbookSymptoms({siteDir, baseUrl}) {
  const catalogPath = join(siteDir, 'src', 'data', 'data.json');

  return {
    name: 'handbook-symptoms',
    getPathsToWatch() {
      return [catalogPath];
    },
    async loadContent() {
      return JSON.parse(await readFile(catalogPath, 'utf8'));
    },
    async contentLoaded({content, actions}) {
      await Promise.all(content.map(async (item) => {
        const itemModule = await actions.createData(`${item.id}.json`, JSON.stringify(item));
        actions.addRoute({
          path: symptomPath(baseUrl, item.id),
          component: '@site/src/components/SymptomPage.js',
          exact: true,
          modules: {item: itemModule},
        });
      }));
    },
  };
}
