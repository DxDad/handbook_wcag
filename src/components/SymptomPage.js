import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {SymptomDetails, SymptomMetadata} from './SymptomDetails';
import styles from '../pages/index.module.css';

export default function SymptomPage({item}) {
  const homeUrl = useBaseUrl('/');

  return (
    <Layout title={item.sintoma} description={item.descricao_curta || item.sintoma}>
      <main className={`${styles.main} ${styles.symptomPage}`}>
        <p><Link to={homeUrl} className={styles.backLink}>Voltar ao catálogo de sintomas</Link></p>
        <article className={styles.card}>
          <header className={styles.symptomHeader}>
            <h1>{item.sintoma}</h1>
            <SymptomMetadata item={item} />
          </header>
          <div className={styles.body}>
            <SymptomDetails item={item} headingLevel="h2" />
          </div>
        </article>
      </main>
    </Layout>
  );
}
