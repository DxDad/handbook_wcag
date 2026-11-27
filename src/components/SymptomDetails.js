import React, {useRef, useState} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {symptomPath} from '../data/symptom-path';
import styles from '../pages/index.module.css';

export const CAT = {
  teclado: 'Teclado e foco',
  'leitor-de-tela': 'Leitor de tela',
  formulario: 'Formulário',
  visual: 'Visual e contraste',
  movimento: 'Conteúdo em movimento',
};

export const COMP = {
  botao: 'Botão',
  link: 'Link',
  formulario: 'Formulário',
  modal: 'Modal',
  imagem: 'Imagem',
  tabela: 'Tabela',
  menu: 'Menu',
  carrossel: 'Carrossel',
};

const ROLE = {dev: 'Dev', qa: 'QA', ux: 'UX', conteudo: 'Conteúdo'};
const IMP_LABEL = {alto: 'Impacto alto', medio: 'Impacto médio', baixo: 'Impacto baixo'};

export function SymptomMetadata({item, id}) {
  return (
    <span className={styles.pills} id={id}>
      <span className={`${styles.pill} ${styles.pillCat}`}>
        {CAT[item.categoria] || item.categoria}
      </span>
      {item.componentes.map((component) => (
        <span key={component} className={`${styles.pill} ${styles.pillComp}`}>
          {COMP[component] || component}
        </span>
      ))}
      <span className={`${styles.pill} ${styles['imp-' + item.impacto]}`}>
        {IMP_LABEL[item.impacto] || item.impacto}
      </span>
      {(item.responsaveis || []).map((role) => (
        <span key={role} className={`${styles.pill} ${styles.pillRole}`}>
          {ROLE[role] || role}
        </span>
      ))}
      {(item.wcag || []).map((criterion) => (
        <span key={criterion} className={`${styles.pill} ${styles.pillWcag}`}>
          WCAG {criterion}
        </span>
      ))}
    </span>
  );
}

function SymptomUrl({item}) {
  const {siteConfig} = useDocusaurusContext();
  const url = new URL(symptomPath(siteConfig.baseUrl, item.id), siteConfig.url).href;
  const [message, setMessage] = useState('');
  const addressRef = useRef(null);

  async function copyUrl() {
    setMessage('');
    try {
      await navigator.clipboard.writeText(url);
      setMessage('URL copiada.');
    } catch {
      const selection = window.getSelection();
      if (selection && addressRef.current) {
        const range = document.createRange();
        range.selectNodeContents(addressRef.current);
        selection.removeAllRanges();
        selection.addRange(range);
        setMessage('Não foi possível copiar automaticamente. A URL foi selecionada para cópia manual.');
      } else {
        setMessage('Não foi possível copiar automaticamente. Selecione o endereço acima.');
      }
    }
  }

  return (
    <div className={styles.symptomUrl}>
      <p className={styles.symptomAddress}>
        <strong>URL deste sintoma</strong>
        <span ref={addressRef}>{url}</span>
      </p>
      <button
        type="button"
        className={styles.clear}
        aria-label={`Copiar URL: ${item.sintoma}`}
        onClick={copyUrl}>
        Copiar URL
      </button>
      <div role="status" className={styles.copyStatus}>{message}</div>
    </div>
  );
}

export function SymptomDetails({item, headingLevel: Heading}) {
  return (
    <>
      {item.descricao_curta && (
        <p className={styles.bodyIntro}>{item.descricao_curta}</p>
      )}
      <div className={styles.boxes}>
        <div className={styles.box}>
          <Heading className={styles.boxH}>Causa provável</Heading>
          <ul className={styles.boxList}>
            {item.causas_provaveis.map((cause, index) => <li key={index}>{cause}</li>)}
          </ul>
        </div>
        <div className={styles.box}>
          <Heading className={styles.boxH}>Solução mínima</Heading>
          <ol className={styles.boxList}>
            {item.solucao_minima.map((step, index) => <li key={index}>{step}</li>)}
          </ol>
        </div>
        <div className={styles.box}>
          <Heading className={styles.boxH}>Como validar</Heading>
          <ul className={styles.boxList}>
            {item.validacao.map((check, index) => <li key={index}>{check}</li>)}
          </ul>
        </div>
      </div>
      {item.exemplo_codigo && (
        <pre className={styles.code}><code>{item.exemplo_codigo}</code></pre>
      )}
      {!item.wcag?.length && (
        <p className={styles.wcagPend}>Critério WCAG: a definir.</p>
      )}
      <SymptomUrl item={item} />
    </>
  );
}
