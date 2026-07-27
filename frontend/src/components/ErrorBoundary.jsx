import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return this.props.fallback ?? <p className="text-sm text-destructive">Ocurrió un error inesperado.</p>
    }
    return this.props.children
  }
}
