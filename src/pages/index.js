import React, {useEffect, useMemo, useRef, useState} from 'react';
import Layout from '@theme/Layout';
import DATA from '@site/src/data/data.json';
import {CAT, COMP, SymptomDetails, SymptomMetadata} from '@site/src/components/SymptomDetails';
import styles from './index.module.css';

// Só oferece nos selects as categorias/componentes que existem de fato em
// data.json — evita opções "fantasma" que sempre retornam zero resultados.
const AVAILABLE_CATS = new Set(DATA.map((item) => item.categoria));
const AVAILABLE_COMPS = new Set(DATA.flatMap((item) => item.componentes || []));

if (process.env.NODE_ENV !== 'production') {
  const seen = new Set();
  DATA.forEach((item) => {
    if (seen.has(item.id)) {
      // eslint-disable-next-line no-console
      console.error('Handbook A11Y: id duplicado em data.json:', item.id);
    }
    seen.add(item.id);
  });
}

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
      <h3 id={hId} className={styles.cardHWrap}>
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
            <SymptomMetadata item={item} id={mId} />
          </span>
          <span className={styles.chev} aria-hidden="true">
            {open ? '▴' : '▾'}
          </span>
        </button>
      </h3>
      <div id={bId} hidden={!open} className={styles.body}>
        <SymptomDetails item={item} headingLevel="h4" />
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

  const dirty = Boolean(q.trim() || cat !== 'todos' || comp !== 'todos');
  const allOpen = list.length > 0 && list.every((item) => openIds.has(item.id));

  const countMsg =
    list.length === DATA.length
      ? DATA.length + ' sintomas disponíveis'
      : list.length + ' de ' + DATA.length + ' sintomas' +
        (list.length === 0 ? '. Tente outro termo ou remova um filtro.' : '');

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

  const toggleAll = () => {
    setOpenIds(allOpen ? new Set() : new Set(list.map((item) => item.id)));
  };

  return (
    <Layout
      title="Sintoma, causa, solução"
      description="Busque um problema de acessibilidade e encontre causas prováveis, passos de correção e orientações de teste.">

      <header className={styles.header}>
        <div className={styles.hInner}>
          <p className={styles.eyebrow}>Handbook de Acessibilidade</p>
          <h1 className={styles.h1}>
            Encontre soluções para problemas de acessibilidade
          </h1>
          <p className={styles.lead}>
            Busque pelo que você percebeu. Use os filtros para indicar o tipo
            de problema e em qual elemento da interface ele aparece.
          </p>
          <ol className={styles.steps} aria-label="Como usar o Handbook A11Y">
            <li className={styles.step}>
              <b className={styles.sNum} aria-hidden="true">01</b>
              <strong>Descreva o sintoma</strong>
              <span>Comece com um termo como foco, contraste ou leitor de tela.</span>
            </li>
            <li className={styles.step}>
              <b className={styles.sNum} aria-hidden="true">02</b>
              <strong>Refine a busca</strong>
              <span>Use a categoria e o componente juntos ou separadamente.</span>
            </li>
            <li className={styles.step}>
              <b className={styles.sNum} aria-hidden="true">03</b>
              <strong>Abra o card</strong>
              <span>Veja as causas prováveis, como corrigir e como testar a correção.</span>
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
                {Object.entries(CAT).filter(([v]) => AVAILABLE_CATS.has(v)).map(([v, l]) => (
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
                {Object.entries(COMP).filter(([v]) => AVAILABLE_COMPS.has(v)).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles.legend}>
            <span><b className={styles.lCat}>Categoria</b> = natureza do problema</span>
            <span><b className={styles.lComp}>Componente</b> = elemento da interface afetado</span>
          </div>
        </section>

        {(cat !== 'todos' || comp !== 'todos') && (
          <div className={styles.chips} aria-label="Filtros ativos">
            {cat !== 'todos' && (
              <button
                type="button"
                className={styles.chip}
                onClick={() => setCat('todos')}
                aria-label={'Remover filtro de categoria: ' + (CAT[cat] || cat)}>
                Categoria: {CAT[cat] || cat}
                <span aria-hidden="true"> ×</span>
              </button>
            )}
            {comp !== 'todos' && (
              <button
                type="button"
                className={styles.chip}
                onClick={() => setComp('todos')}
                aria-label={'Remover filtro de componente: ' + (COMP[comp] || comp)}>
                Componente: {COMP[comp] || comp}
                <span aria-hidden="true"> ×</span>
              </button>
            )}
          </div>
        )}

        <div className={styles.bar}>
          <p className={styles.count}>{countMsg}</p>
          <span className={styles.srOnly} aria-live="polite" aria-atomic="true">
            {announceMsg}
          </span>
          <div className={styles.barActions}>
            {list.length >= 6 && (
              <button
                type="button"
                className={styles.clear}
                aria-pressed={allOpen}
                onClick={toggleAll}>
                {allOpen ? 'Fechar todos' : 'Abrir todos'}
              </button>
            )}
            <button
              type="button"
              className={styles.clear}
              onClick={clearFilters}
              disabled={!dirty}>
              Limpar filtros
            </button>
          </div>
        </div>

        <h2 className={styles.srOnly}>Sintomas encontrados</h2>
        <div id="sintomas" className={styles.list}>
          {list.map((item) => (
            <Card key={item.id} item={item} open={openIds.has(item.id)} onToggle={toggle} />
          ))}
        </div>
      </main>
    </Layout>
  );
}
