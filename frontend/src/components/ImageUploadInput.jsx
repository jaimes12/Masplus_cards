import { useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'
import { api } from '../lib/api.js'
import { Button } from './ui.jsx'

export default function ImageUploadInput({ value, onChange }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const { url } = await api.upload('/api/imagenes/upload', formData)
      onChange(url)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="flex items-center gap-3">
          <img src={value} alt="" className="h-12 w-12 rounded-md border border-border object-cover" />
          <Button type="button" variant="outline" className="gap-2" onClick={() => onChange('')}>
            <X className="h-4 w-4" /> Quitar
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-4 w-4" /> {uploading ? 'Subiendo...' : 'Subir imagen'}
        </Button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFile}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
