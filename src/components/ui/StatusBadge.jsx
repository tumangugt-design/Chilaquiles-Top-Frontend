const classes = {
  recibido: 'bg-[#FFEB3B] text-[#856404] border-[#FBC02D]',
  en_proceso: 'bg-[#FF9800] text-white border-[#E65100]',
  listo_para_despacho: 'bg-[#4CAF50] text-white border-[#2E7D32]',
  recolectado: 'bg-[#FF9800] text-white border-[#E65100]',
  en_camino: 'bg-[#FF9800] text-white border-[#E65100]',
  entregado: 'bg-[#4CAF50] text-white border-[#1B5E20]',
  pending: 'bg-[#FFEB3B] text-[#856404] border-[#FBC02D]',
  approved: 'bg-[#4CAF50] text-white border-[#2E7D32]',
  rejected: 'bg-[#F44336] text-white border-[#B71C1C]',
}

const StatusBadge = ({ value }) => (
  <span className={`inline-flex rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border border-current opacity-90 ${classes[value] || 'bg-ui-muted/10 text-ui-muted'}`}>
    {String(value).replaceAll('_', ' ')}
  </span>
)

export default StatusBadge
