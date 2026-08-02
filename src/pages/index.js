import React, {useEffect, useMemo, useRef, useState} from 'react';
import Layout from '@theme/Layout';
import DATA from '@site/src/data/data.json';
import styles from './index.module.css';

const CAT = {
  teclado: 'Teclado e foco',
  'leitor-de-tela': 'Leitor de tela',
  formulario: 'Formulário',
  visual: 'Visual e contraste',
  movimento: 'Conteúdo em movimento',
};

const COMP = {
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

const IMP_LABEL = {
  alto: 'Impacto alto',
  medio: 'Impacto médio',
  baixo: 'Impacto baixo',
};

function norm(t) {
  return (t || '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
}

function Card({item, open, onToggle}) {
  const hId = item.id + '-h';
  const bId = item.id + '-b';
  const sId = item.id + '-s';
  const mId = item.id + '-m';
  return (
    <article className={styles.card + (open ? ' ' + styles.cardOpen : '')}>
      <h2 id={hId} className={styles.cardHWrap}>
        <button
          type="button"
          className={styles.cardBtn}
          aria-expanded={open}
          aria-controls={bId}
          aria-labelledby={sId}
          aria-describedby={mId}
          onClick={() => onToggle(item.id)}>
          <span className={styles.cardLeft}>
            <span className={styles.sintoma} id={sId}>{item.sintoma}</span>
            <span className={styles.pills} id={mId}>
              <span className={styles.pill + ' ' + styles.pillCat}>
                {CAT[item.categoria] || item.categoria}
              </span>
              {item.componentes.map((c) => (
                <span key={c} className={styles.pill + ' ' + styles.pillComp}>
                  {COMP[c] || c}
                </span>
              ))}
              <span className={styles.pill + ' ' + styles['imp-' + item.impacto]}>
                {IMP_LABEL[item.impacto] || item.impacto}
              </span>
              {(item.responsaveis || []).map((r) => (
                <span key={r} className={styles.pill + ' ' + styles.pillRole}>
                  {ROLE[r] || r}
                </span>
              ))}
              {(item.wcag || []).map((w) => (
                <span key={w} className={styles.pill + ' ' + styles.pillWcag}>
                  {'WCAG ' + w}
                </span>
              ))}
            </span>
          </span>
          <span className={styles.chev} aria-hidden="true">
            {open ? '▴' : '▾'}
          </span>
        </button>
      </h2>
      <div id={bId} hidden={!open} className={styles.body}>
        {item.descricao_curta && (
          <p className={styles.bodyIntro}>{item.descricao_curta}</p>
        )}
        <div className={styles.boxes}>
          <div className={styles.box}>
            <h3 className={styles.boxH}>Causa provável</h3>
            <ul className={styles.boxList}>
              {item.causas_provaveis.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </div>
          <div className={styles.box}>
            <h3 className={styles.boxH}>Solução mínima</h3>
            <ol className={styles.boxList}>
              {item.solucao_minima.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          </div>
          <div className={styles.box}>
            <h3 className={styles.boxH}>Como validar</h3>
            <ul className={styles.boxList}>
              {item.validacao.map((v, i) => <li key={i}>{v}</li>)}
            </ul>
          </div>
        </div>
        {item.exemplo_codigo && (
          <pre className={styles.code}><code>{item.exemplo_codigo}</code></pre>
        )}
        {!(item.wcag && item.wcag.length) && (
          <p className={styles.wcagPend}>Critério WCAG: a definir.</p>
        )}
      </div>
    </article>
  );
}

export default function Home() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('todos');
  const [comp, setComp] = useState('todos');
  const [openIds, setOpenIds] = useState(() => new Set());
  const searchRef = useRef(null);

  const toggle = (id) => setOpenIds((p) => {
    const n = new Set(p);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const list = useMemo(() => {
    const term = norm(q.trim());
    return DATA.filter((item) => {
      const hay = norm(
        [item.sintoma, item.descricao_curta, (item.keywords || []).join(' ')].join(' '),
      );
      return (
        (!term || hay.includes(term)) &&
        (cat === 'todos' || item.categoria === cat) &&
        (comp === 'todos' || (item.componentes || []).includes(comp))
      );
    });
  }, [q, cat, comp]);

  const dirty = q.trim() || cat !== 'todos' || comp !== 'todos';

  const countMsg =
    list.length === DATA.length
      ? DATA.length + ' sintomas disponíveis'
      : list.length + ' de ' + DATA.length + ' sintomas' +
        (list.length === 0 ? ' — Nenhum resultado. Tente outro termo ou remova um filtro.' : '');

  // Contagem anunciada separadamente da visível, com debounce, para nao
  // interromper o leitor de tela a cada tecla digitada na busca.
  const [announceMsg, setAnnounceMsg] = useState(countMsg);
  useEffect(() => {
    const t = setTimeout(() => setAnnounceMsg(countMsg), 500);
    return () => clearTimeout(t);
  }, [countMsg]);

  const clearFilters = () => {
    setQ('');
    setCat('todos');
    setComp('todos');
    searchRef.current?.focus();
  };

  return (
    <Layout
      title="Sintoma, causa, solução"
      description="Encontre a causa e a correção para sintomas de acessibilidade, facetado por categoria e componente de UI.">

      <header className={styles.header}>
        <div className={styles.hInner}>
          <p className={styles.eyebrow}>Handbook de Acessibilidade</p>
          <h1 className={styles.h1}>
            Descreva o que você está vendo.{' '}
            A gente te diz o que fazer.
          </h1>
          <p className={styles.lead}>
            Cada item combina duas facetas:{' '}
            <strong>categoria</strong> (o tipo do problema) e{' '}
            <strong>componente</strong> (onde ele aparece na UI). Filtre pelo
            sintoma, encontre a causa provável e a correção mínima.
          </p>
          <ol className={styles.steps} aria-label="Como usar este handbook">
            <li className={styles.step}>
              <b className={styles.sNum} aria-hidden="true">01</b>
              <strong>Descreva o sintoma</strong>
              <span>Digite o que você percebeu na tela ou no teste de teclado.</span>
            </li>
            <li className={styles.step}>
              <b className={styles.sNum} aria-hidden="true">02</b>
              <strong>Filtre por faceta</strong>
              <span>Categoria e componente são independentes — combine os dois.</span>
            </li>
            <li className={styles.step}>
              <b className={styles.sNum} aria-hidden="true">03</b>
              <strong>Abra o card</strong>
              <span>Causa provável, correção mínima e validação em um só lugar.</span>
            </li>
          </ol>
        </div>
      </header>

      <main id="main-content" className={styles.main}>

        <h2 className={styles.srOnly}>Filtros de busca</h2>
        <section aria-label="Filtros de busca" className={styles.finder}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="q" className={styles.lbl}>Buscar sintoma</label>
              <input
                id="q"
                ref={searchRef}
                type="search"
                className={styles.inp}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Ex.: Tab, foco, botão, modal, contraste..."
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="cat" className={styles.lbl}>Categoria</label>
              <select
                id="cat"
                className={styles.sel}
                value={cat}
                onChange={(e) => setCat(e.target.value)}>
                <option value="todos">Todas as categorias</option>
                {Object.entries(CAT).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="comp" className={styles.lbl}>Componente</label>
              <select
                id="comp"
                className={styles.sel}
                value={comp}
                onChange={(e) => setComp(e.target.value)}>
                <option value="todos">Todos os componentes</option>
                {Object.entries(COMP).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles.legend}>
            <span><b className={styles.lCat}>Categoria</b> = natureza do problema</span>
            <span><b className={styles.lComp}>Componente</b> = onde ele aparece na UI</span>
          </div>
        </section>

        <div className={styles.bar}>
          <p className={styles.count}>{countMsg}</p>
          <span className={styles.srOnly} aria-live="polite" aria-atomic="true">
            {announceMsg}
          </span>
          {dirty && (
            <button
              type="button"
              className={styles.clear}
              onClick={clearFilters}>
              Limpar filtros
            </button>
          )}
        </div>

        <h2 className={styles.srOnly}>Sintomas encontrados</h2>
        <div id="sintomas" className={styles.list}>
          {list.map((item) => (
            <Card key={item.id} item={item} open={openIds.has(item.id)} onToggle={toggle} />
          ))}
        </div>

        <div className={styles.about}>
          <p>
            <strong>Sobre esta view:</strong> renderizada a partir de um schema
            canônico (<code>schema.json</code>) + dados (<code>data.json</code>). Os mesmos
            dados podem alimentar outras views ou uma API.
          </p>
        </div>

      </main>
    </Layout>
  );
}