const classes = {
  recibido: 'bg-slate-100 text-slate-700',
  en_proceso: 'bg-amber-100 text-amber-700',
  listo_para_despacho: 'bg-blue-100 text-blue-700',
  en_camino: 'bg-purple-100 text-purple-700',
  entregado: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700'
};

const StatusBadge = ({ value }) => (
  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${classes[value] || 'bg-gray-100 text-gray-700'}`}>
    {String(value).replaceAll('_', ' ')}
  </span>
);

export default StatusBadge;
