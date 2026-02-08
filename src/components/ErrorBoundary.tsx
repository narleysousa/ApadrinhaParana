import { Component, type ReactNode, type ErrorInfo } from 'react'

interface ErrorBoundaryProps {
    children: ReactNode
}

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Erro capturado pelo ErrorBoundary:', error, errorInfo)
    }

    handleReload = () => {
        window.location.reload()
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null })
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <div className="error-boundary-content">
                        <span className="error-boundary-icon" aria-hidden>⚠️</span>
                        <h1 className="error-boundary-title">Algo deu errado</h1>
                        <p className="error-boundary-message">
                            Ocorreu um erro inesperado. Tente recarregar a página.
                        </p>
                        {this.state.error && (
                            <details className="error-boundary-details">
                                <summary>Detalhes técnicos</summary>
                                <pre>{this.state.error.message}</pre>
                            </details>
                        )}
                        <div className="error-boundary-actions">
                            <button
                                type="button"
                                className="error-boundary-btn error-boundary-btn-primary"
                                onClick={this.handleReload}
                            >
                                Recarregar página
                            </button>
                            <button
                                type="button"
                                className="error-boundary-btn"
                                onClick={this.handleReset}
                            >
                                Tentar novamente
                            </button>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
