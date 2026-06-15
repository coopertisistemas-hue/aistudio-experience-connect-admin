import { useState } from 'react';
import { AlertTriangle, Camera, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface IncidentFormProps {
  bookingId: string;
  onClose: () => void;
}

export function IncidentForm({ bookingId, onClose }: IncidentFormProps) {
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no maximo 5MB.');
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setSending(true);
    setError(null);

    try {
      let photoPath: string | null = null;

      if (file) {
        const ext = file.name.split('.').pop() ?? 'jpg';
        const fileName = `${bookingId}_${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('driver-incidents')
          .upload(fileName, file);

        if (uploadError) throw uploadError;
        photoPath = fileName;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client = supabase as any;
      const { error: insertError } = await client
        .from('trip_incidents')
        .insert({
          booking_id: bookingId,
          description,
          photo_path: photoPath,
        });

      if (insertError) {
        if (insertError.code === '42P01') {
          setError('Tabela trip_incidents nao encontrada. Contate o administrador.');
        } else {
          throw insertError;
        }
        setSending(false);
        return;
      }

      setSent(true);
      setTimeout(onClose, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar ocorrencia.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 pb-8">
        <div className="mx-4 w-full max-w-sm rounded-2xl bg-slate-900 p-6 text-center border border-emerald-500/20">
          <CheckIcon />
          <p className="mt-2 font-medium text-white">Ocorrencia registrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" onClick={onClose}>
      <div
        className="mx-4 mb-4 w-full max-w-sm animate-fade-in rounded-2xl bg-slate-900 border border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <h2 className="flex items-center gap-2 font-semibold text-white">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            Registrar Ocorrencia
          </h2>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div>
            <label htmlFor="desc" className="mb-1 block text-sm font-medium text-slate-300">
              Descricao
            </label>
            <textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              placeholder="Descreva o ocorrido..."
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              Foto (opcional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="incident-photo"
            />
            {preview ? (
              <div className="relative">
                <img src={preview} alt="Preview" className="w-full rounded-lg object-cover h-40" />
                <button
                  type="button"
                  onClick={() => { setFile(null); setPreview(null); }}
                  className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="incident-photo"
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-600 py-4 text-sm text-slate-400 transition-colors hover:border-slate-500 hover:text-slate-300"
              >
                <Camera className="h-5 w-5" />
                Adicionar foto
              </label>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={sending || !description.trim()}
            className="w-full rounded-lg bg-amber-600 px-4 py-3 font-medium text-white transition-colors hover:bg-amber-500 disabled:opacity-50"
          >
            {sending ? 'Enviando...' : 'Registrar ocorrencia'}
          </button>
        </form>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="mx-auto h-10 w-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
