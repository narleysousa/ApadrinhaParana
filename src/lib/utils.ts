/** Gera um ID único. Usa crypto.randomUUID quando disponível. */
export function gerarId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36)
}

/** Gera iniciais a partir do nome (até 2 letras) */
export function gerarIniciais(nome: string): string {
  const palavras = nome.trim().split(/\s+/).filter(Boolean)
  if (palavras.length === 0) return '?'
  if (palavras.length === 1) {
    const s = palavras[0].slice(0, 2).toUpperCase()
    return s || '?'
  }
  const primeira = palavras[0][0]
  const ultima = palavras[palavras.length - 1][0]
  const iniciais = (primeira ?? '') + (ultima ?? '')
  return iniciais ? iniciais.toUpperCase() : '?'
}

/** Formata data para exibição em pt-BR. Retorna '-' se a data for inválida. */
export function formatarData(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
