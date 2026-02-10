import type { Demanda, Agent } from '../types'
import { formatarData } from './utils'

interface DemandaExcel {
    'Título': string
    'Projeto': string
    'Cidade': string
    'Responsáveis': string
    'Prioridade': string
    'Descrição': string
    'Progresso (%)': number
    'Status': string
    'Criada em': string
    'Comentários': number
}

function formatarDemandaParaExcel(demanda: Demanda, agents: Agent[]): DemandaExcel {
    const cidade = agents.find(a => a.id === demanda.agentId)?.nome ?? '-'
    const responsaveis = (Array.isArray(demanda.responsaveis) ? demanda.responsaveis : [])
        .map(r => r.nome)
        .join(', ') || '-'

    return {
        'Título': demanda.titulo,
        'Projeto': demanda.projeto?.nome ?? '-',
        'Cidade': cidade,
        'Responsáveis': responsaveis,
        'Prioridade': demanda.prioridade,
        'Descrição': demanda.descricao || '-',
        'Progresso (%)': demanda.progresso ?? 0,
        'Status': demanda.finalizada ? 'Finalizada' : 'Em andamento',
        'Criada em': formatarData(demanda.criadaEm),
        'Comentários': demanda.comentarios?.length ?? 0,
    }
}

export async function exportarDemandasExcel(
    demandas: Demanda[],
    agents: Agent[],
    nomeArquivo: string
): Promise<void> {
    if (demandas.length === 0) {
        alert('Não há demandas para exportar.')
        return
    }

    const XLSX = await import('xlsx')

    const dadosFormatados = demandas.map(d => formatarDemandaParaExcel(d, agents))

    const worksheet = XLSX.utils.json_to_sheet(dadosFormatados)

    // Ajustar largura das colunas
    const colWidths = [
        { wch: 40 }, // Título
        { wch: 25 }, // Projeto
        { wch: 20 }, // Cidade
        { wch: 30 }, // Responsáveis
        { wch: 12 }, // Prioridade
        { wch: 50 }, // Descrição
        { wch: 14 }, // Progresso
        { wch: 14 }, // Status
        { wch: 12 }, // Criada em
        { wch: 12 }, // Comentários
    ]
    worksheet['!cols'] = colWidths

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Demandas')

    // Gerar arquivo e baixar
    const dataAtual = new Date().toISOString().slice(0, 10)
    const fileName = `${nomeArquivo}_${dataAtual}.xlsx`

    XLSX.writeFile(workbook, fileName)
}
