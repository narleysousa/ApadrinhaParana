/** Gera um ID único. Usa crypto.randomUUID quando disponível. */
export function gerarId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36)
}

/** Gera iniciais a partir do nome (até 2 letras) */
export function gerarIniciais(nome: string): string {
  const palavras = nome.trim().split(/\s+/)
  if (palavras.length === 1) {
    return palavras[0].slice(0, 2).toUpperCase()
  }
  return (palavras[0][0] + palavras[palavras.length - 1][0]).toUpperCase()
}

/** Formata data para exibição em pt-BR */
export function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
