const classes = {
  recibido: 'bg-slate-500/10 text-slate-500',
  en_proceso: 'bg-amber-500/10 text-brand-orange',
  listo_para_despacho: 'bg-blue-500/10 text-brand-blue',
  recolectado: 'bg-cyan-500/10 text-cyan-500',
  en_camino: 'bg-purple-500/10 text-purple-500',
  entregado: 'bg-green-500/10 text-green-600',
  pending: 'bg-amber-500/10 text-brand-orange',
  approved: 'bg-green-500/10 text-green-600',
  rejected: 'bg-red-500/10 text-brand-red'
};

const StatusBadge = ({ value }) => (
  <span className={`inline-flex rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border border-current opacity-90 ${classes[value] || 'bg-ui-muted/10 text-ui-muted'}`}>
    {String(value).replaceAll('_', ' ')}
  </span>
);

export default StatusBadge;
