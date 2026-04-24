import { UploadForm } from './UploadForm';

export default function UploadPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Subir logo</h1>
        <p className="text-sm text-zinc-500">
          Suelta todas las variantes (fondo claro, oscuro, color, distintos formatos).
          El sistema detecta formato y fondo automáticamente e indexa en Elasticsearch.
        </p>
      </div>
      <UploadForm />
    </div>
  );
}
