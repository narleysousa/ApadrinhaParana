interface LoadingScreenProps {
    mensagem?: string
}

export function LoadingScreen({ mensagem = 'Carregando...' }: LoadingScreenProps) {
    return (
        <div className="loading-screen">
            <div className="loading-screen-spinner" aria-hidden />
            <p className="loading-screen-text">{mensagem}</p>
        </div>
    )
}
