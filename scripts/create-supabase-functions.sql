-- Funciones RPC para Supabase
-- Ejecutar este script en el SQL Editor de Supabase

-- Función para incrementar vistas de videos
CREATE OR REPLACE FUNCTION increment_video_views(video_id INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE videos SET views = views + 1 WHERE id = video_id;
END;
$$ LANGUAGE plpgsql;

-- Función para incrementar descargas de documentos
CREATE OR REPLACE FUNCTION increment_document_downloads(document_id INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE documents SET downloads = downloads + 1 WHERE id = document_id;
END;
$$ LANGUAGE plpgsql;

SELECT 'Funciones RPC creadas exitosamente' AS status;
