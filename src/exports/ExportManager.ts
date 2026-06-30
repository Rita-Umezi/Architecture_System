// ─── Export Manager ────────────────────────────────────────────────────────
// Dispatches exports to the appropriate format adapter.

import type { IExportOptions, IExportJob } from '../../types/export.types'
import { generateId } from '../../utils/id'

// ─── PNG Exporter ─────────────────────────────────────────────────────────

export async function exportToPNG(
  stageRef: { toDataURL: (config?: { pixelRatio?: number }) => string },
  options: { dpi?: number } = {}
): Promise<string> {
  const ratio = (options.dpi ?? 150) / 96
  return stageRef.toDataURL({ pixelRatio: ratio })
}

// ─── SVG Exporter ─────────────────────────────────────────────────────────

export function exportToSVG(
  walls: Array<{ startPoint: {x:number;y:number}; endPoint: {x:number;y:number}; thickness: number }>,
  viewBox: { minX: number; minY: number; maxX: number; maxY: number }
): string {
  const { minX, minY, maxX, maxY } = viewBox
  const w = maxX - minX, h = maxY - minY
  const lines = walls.map(wall => {
    const { startPoint: s, endPoint: e } = wall
    return `<line x1="${s.x - minX}" y1="${s.y - minY}" x2="${e.x - minX}" y2="${e.y - minY}" stroke="#1e293b" stroke-width="${wall.thickness}" stroke-linecap="round"/>`
  })
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <rect width="${w}" height="${h}" fill="#f8fafc"/>
  ${lines.join('\n  ')}
</svg>`
}

// ─── PDF Exporter ─────────────────────────────────────────────────────────

export async function exportToPDF(
  stageRef: { toDataURL: (config?: { pixelRatio?: number }) => string },
  projectName: string,
  options: { paperSize?: string; orientation?: string } = {}
): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const format = options.paperSize ?? 'a4'
  const orientation = options.orientation ?? 'landscape'
  const doc = new jsPDF({ orientation: orientation as any, unit: 'mm', format })
  const dataUrl = stageRef.toDataURL({ pixelRatio: 2 })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()

  doc.setFontSize(14)
  doc.text(projectName, 10, 10)
  doc.setFontSize(8)
  doc.text(`Exported: ${new Date().toLocaleString()}`, 10, 16)
  doc.addImage(dataUrl, 'PNG', 5, 20, pageW - 10, pageH - 30)
  doc.save(`${projectName.replace(/\s+/g, '_')}_floor-plan.pdf`)
}

// ─── JSON Export ──────────────────────────────────────────────────────────

export function exportToJSON(data: unknown): string {
  return JSON.stringify(data, null, 2)
}

export function downloadText(content: string, filename: string, mimeType = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = filename
  document.body.appendChild(a); a.click()
  document.body.removeChild(a); URL.revokeObjectURL(url)
}

// ─── Export Manager ───────────────────────────────────────────────────────

export class ExportManager {
  async export(
    format: IExportOptions['format'],
    stageRef: any,
    projectName: string,
    elements: unknown[],
    viewBox = { minX: 0, minY: 0, maxX: 10000, maxY: 10000 }
  ): Promise<void> {
    switch (format) {
      case 'png': {
        const dataUrl = await exportToPNG(stageRef)
        const a = document.createElement('a')
        a.href = dataUrl; a.download = `${projectName}_floor-plan.png`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        break
      }
      case 'svg': {
        const svg = exportToSVG(elements as any, viewBox)
        downloadText(svg, `${projectName}_floor-plan.svg`, 'image/svg+xml')
        break
      }
      case 'pdf':
        await exportToPDF(stageRef, projectName)
        break
      case 'obj':
        downloadText('# BuildFlow OBJ Export\n# 3D export not yet implemented', `${projectName}.obj`)
        break
      default:
        console.warn(`[ExportManager] Format '${format}' not yet implemented`)
    }
  }
}

export const exportManager = new ExportManager()
