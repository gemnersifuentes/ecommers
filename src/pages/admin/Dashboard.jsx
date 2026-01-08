import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportesService, productosService } from '../../services';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadarController,
  RadialLinearScale
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadarController,
  RadialLinearScale
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState('12M'); // Estado para el período del gráfico
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  const periods = [
    { id: '7D', label: '7D' },
    { id: '1M', label: '1M' },
    { id: '6M', label: '6M' },
    { id: '12M', label: '12M' },
    { id: '24M', label: 'Todo' }
  ];


  useEffect(() => {
    cargarDatos();
  }, [chartPeriod]);

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDark(document.documentElement.classList.contains('dark'));
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const cargarDatos = async () => {
    try {
      const [dashboardData, productosResponse] = await Promise.all([
        reportesService.getDashboard(chartPeriod),
        productosService.getAll()
      ]);
      setData(dashboardData);
      // Handle both response formats: { data: [], total: N } or just []
      if (productosResponse && productosResponse.data) {
        setProductos(productosResponse.data);
      } else if (Array.isArray(productosResponse)) {
        setProductos(productosResponse);
      } else {
        setProductos([]);
      }
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="spinner-border text-blue-600" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Calculate REAL statistics from database
  const productosBajoStock = productos.filter(p => (p.stock || 0) <= 5).length;
  const totalProductos = productos.length;




  // Sparkline Options (Mini charts in cards) - WITH TOOLTIPS
  const sparklineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: isDark ? '#1e293b' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDark ? '#fff' : '#000',
        bodyColor: isDark ? '#cbd5e1' : '#000',
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB',
        borderWidth: 1,
        padding: 8,
        displayColors: false,
        titleFont: {
          size: 11,
          weight: 'normal'
        },
        bodyFont: {
          size: 13,
          weight: 'bold'
        },
        callbacks: {
          title: () => '',
          label: (context) => {
            const value = context.parsed.y;
            return value >= 1000
              ? `S/ ${(value / 1000).toFixed(1)}k`
              : `S/ ${value.toFixed(0)}`;
          }
        }
      }
    },
    scales: { x: { display: false }, y: { display: false } },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 5,
        hitRadius: 30,
        hoverBackgroundColor: '#6366f1',
        hoverBorderColor: '#fff',
        hoverBorderWidth: 2
      },
      line: {
        borderWidth: 3,
        tension: 0.4,
        borderColor: '#6366f1',
        capBezierPoints: true
      }
    }
  };

  // Revenue Chart (Ingresos mensuales) - SIEMPRE 12 MESES
  const ventasPorMes = data?.ventasPorMes || [];
  const recentOrderData = {
    labels: ventasPorMes.map(v => {
      const parts = v.mes.split('-');
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

      // Si tiene 3 partes es fecha completa (YYYY-MM-DD)
      if (parts.length === 3) {
        const [year, month, day] = parts;
        const monthAbbr = monthNames[parseInt(month) - 1];
        return `${day} ${monthAbbr}`;
      }

      // Si tiene 2 partes es solo mes (YYYY-MM)
      if (parts.length === 2) {
        const [year, month] = parts;
        const monthAbbr = monthNames[parseInt(month) - 1];
        return chartPeriod === '24M' ? `${monthAbbr} ${year.slice(2)}` : monthAbbr;
      }

      return v.mes;
    }),
    datasets: [{
      label: 'Ventas',
      data: ventasPorMes.map(v => parseFloat(v.total)),
      fill: true,
      backgroundColor: (context) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.2)');
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
        return gradient;
      },
      borderColor: '#6366f1',
      pointBackgroundColor: '#fff',
      pointBorderColor: '#6366f1',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      tension: 0.4
    }]
  };

  // AOV Trend Chart (Average Order Value per Month)
  const aovTrendData = {
    labels: recentOrderData.labels,
    datasets: [{
      label: 'Venta Promedio (S/)',
      data: ventasPorMes.map(v => v.pedidos > 0 ? parseFloat(v.total) / parseInt(v.pedidos) : 0),
      borderColor: '#10b981',
      backgroundColor: 'transparent',
      borderWidth: 2,
      pointRadius: 3,
      tension: 0.3,
      fill: false
    }]
  };

  // Custom HTML Tooltip Handler
  const getOrCreateTooltip = (chart) => {
    let tooltipEl = chart.canvas.parentNode.querySelector('div.chartjs-tooltip');

    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.className = 'chartjs-tooltip';
      tooltipEl.style.background = isDark ? '#1e293b' : '#fff';
      tooltipEl.style.borderRadius = '8px';
      tooltipEl.style.opacity = 1;
      tooltipEl.style.pointerEvents = 'none';
      tooltipEl.style.position = 'absolute';
      tooltipEl.style.transform = 'translate(-50%, 0)';
      tooltipEl.style.transition = 'all .1s ease';
      tooltipEl.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
      tooltipEl.style.border = isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E5E7EB';
      tooltipEl.style.zIndex = '100';

      const table = document.createElement('table');
      table.style.margin = '0px';
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';

      tooltipEl.appendChild(table);
      chart.canvas.parentNode.appendChild(tooltipEl);
    }

    return tooltipEl;
  };

  const externalTooltipHandler = (context) => {
    // Tooltip Element
    const { chart, tooltip } = context;
    const tooltipEl = getOrCreateTooltip(chart);

    // Hide if no tooltip
    if (tooltip.opacity === 0) {
      tooltipEl.style.opacity = 0;
      return;
    }

    // Set Text
    if (tooltip.body) {
      const titleLines = tooltip.title || [];
      const bodyLines = tooltip.body.map(b => b.lines);

      const tableHead = document.createElement('thead');

      titleLines.forEach(title => {
        const tr = document.createElement('tr');
        tr.style.backgroundColor = isDark ? '#334155' : '#F3F4F6'; // Header background

        const th = document.createElement('th');
        th.style.borderBottom = isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E5E7EB';
        th.style.padding = '8px 12px';
        th.style.textAlign = 'left';
        th.style.color = isDark ? '#94a3b8' : '#6B7280';
        th.style.fontSize = '12px';
        th.style.fontWeight = '500';
        th.innerText = title;

        tr.appendChild(th);
        tableHead.appendChild(tr);
      });

      const tableBody = document.createElement('tbody');
      bodyLines.forEach((body, i) => {
        const tr = document.createElement('tr');
        tr.style.backgroundColor = isDark ? '#1e293b' : 'white';

        const td = document.createElement('td');
        td.style.padding = '8px 12px';
        td.style.fontSize = '14px';
        td.style.fontWeight = 'bold';
        td.style.color = isDark ? '#f8fafc' : '#1F2937';
        td.style.display = 'flex';
        td.style.alignItems = 'center';

        // Blue dot
        const span = document.createElement('span');
        span.style.background = '#2F80ED';
        span.style.borderRadius = '50%';
        span.style.marginRight = '8px';
        span.style.height = '10px';
        span.style.width = '10px';
        span.style.display = 'inline-block';

        const textNode = document.createTextNode(body);

        td.appendChild(span);
        td.appendChild(textNode);
        tr.appendChild(td);
        tableBody.appendChild(tr);
      });

      const tableRoot = tooltipEl.querySelector('table');
      while (tableRoot.firstChild) {
        tableRoot.firstChild.remove();
      }
      tableRoot.appendChild(tableHead);
      tableRoot.appendChild(tableBody);
    }

    const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;

    // Display, position, and set styles for font
    tooltipEl.style.opacity = 1;
    tooltipEl.style.left = positionX + tooltip.caretX + 'px';
    tooltipEl.style.top = positionY + tooltip.caretY - tooltipEl.offsetHeight - 10 + 'px';
  };

  // Plugin personalizado para línea vertical punteada y resaltar mes
  const crosshairPlugin = {
    id: 'crosshair',
    afterDatasetsDraw(chart) {
      if (chart.tooltip?._active?.length) {
        const activePoint = chart.tooltip._active[0];
        const ctx = chart.ctx;
        const x = activePoint.element.x;
        const topY = chart.scales.y.top;
        const bottomY = chart.scales.y.bottom;

        // Línea vertical punteada
        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.moveTo(x, topY);
        ctx.lineTo(x, bottomY);
        ctx.lineWidth = 1;
        ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.1)' : '#D1D5DB';
        ctx.stroke();
        ctx.restore();

        // Resaltar mes en el eje X con diseño de burbuja (flecha arriba)
        const xScale = chart.scales.x;
        const activeIndex = activePoint.index;
        const label = chart.data.labels[activeIndex];

        if (label && xScale.ticks[activeIndex]) {
          const labelX = xScale.getPixelForTick(activeIndex);
          const topY = xScale.top; // Línea superior del eje X

          ctx.save();

          // Configuración de fuente y medidas
          ctx.font = 'bold 12px sans-serif';
          const metrics = ctx.measureText(label);
          const paddingX = 12;
          const paddingY = 6;
          const boxWidth = metrics.width + (paddingX * 2);
          const boxHeight = 26;
          const arrowHeight = 6;
          const borderRadius = 4;

          // Coordenadas
          const startY = topY + arrowHeight; // Inicio del rectángulo (debajo de la flecha)
          const left = labelX - boxWidth / 2;
          const right = labelX + boxWidth / 2;
          const bottom = startY + boxHeight;

          // Dibujar el camino (Path) de la burbuja
          ctx.beginPath();
          ctx.moveTo(left + borderRadius, startY);

          // Borde superior (izquierda a flecha)
          ctx.lineTo(labelX - 6, startY);
          // Flecha apuntando arriba
          ctx.lineTo(labelX, topY);
          ctx.lineTo(labelX + 6, startY);

          // Borde superior (flecha a derecha)
          ctx.lineTo(right - borderRadius, startY);

          // Esquina superior derecha
          ctx.quadraticCurveTo(right, startY, right, startY + borderRadius);

          // Borde derecho
          ctx.lineTo(right, bottom - borderRadius);

          // Esquina inferior derecha
          ctx.quadraticCurveTo(right, bottom, right - borderRadius, bottom);

          // Borde inferior
          ctx.lineTo(left + borderRadius, bottom);

          // Esquina inferior izquierda
          ctx.quadraticCurveTo(left, bottom, left, bottom - borderRadius);

          // Borde izquierdo
          ctx.lineTo(left, startY + borderRadius);

          // Esquina superior izquierda
          ctx.quadraticCurveTo(left, startY, left + borderRadius, startY);

          ctx.closePath();

          // Estilo de relleno y borde
          ctx.fillStyle = isDark ? '#1e293b' : '#F3F4F6'; // Fondo
          ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.2)' : '#9CA3AF'; // Borde
          ctx.lineWidth = 1;

          ctx.fill();
          ctx.stroke();

          // Dibujar texto del mes
          ctx.fillStyle = isDark ? '#f8fafc' : '#1F2937'; // Texto
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(label, labelX, startY + boxHeight / 2);

          ctx.restore();
        }
      }
    }
  };

  const recentOrderOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: { display: false },
      crosshair: true,
      tooltip: {
        enabled: false, // Desactivar tooltip nativo
        external: externalTooltipHandler, // Usar tooltip HTML personalizado
        callbacks: {
          title: (context) => context[0].label,
          label: (context) => `S/:  ${Math.round(context.parsed.y)}`
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: true
        },
        ticks: {
          color: isDark ? '#64748b' : '#9CA3AF',
          padding: 10,
          font: { size: 12 }
        },
        border: { display: true, color: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }
      },
      y: {
        display: true,
        grid: {
          display: true,
          color: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6',
          lineWidth: 1,
          drawBorder: false
        },
        ticks: { display: false },
        min: 0,
        border: { display: false }
      }
    }
  };

  // Top Products - DATOS REALES
  const topProducts = data?.productosMasVendidos?.slice(0, 5).map(p => ({
    id: p.id,
    name: p.nombre || 'Producto',
    items: `${p.total_vendido || 0} Vendidos`,
    price: `S/ ${parseFloat(p.price || 0).toFixed(2)}`,
    image: p.imagen || p.imagen_url || null
  })) || [];

  // Low Stock Products - DATOS REALES de la base de datos
  const lowStockProducts = productos
    .filter(p => (p.stock || 0) <= 5)
    .slice(0, 5)
    .map(p => ({
      name: p.nombre || 'Producto',
      stock: p.stock || 0,
      status: (p.stock || 0) === 0 ? 'out' : 'low'
    }));

  // --- NEW ANALYTICS DATASETS ---

  // 1. Order Status Distribution (Doughnut)
  const orderStatusData = {
    labels: data?.pedidosPorEstado?.map(p => {
      const configs = {
        'pendiente': 'Pendiente',
        'pendiente_verificacion': 'P. Verificación',
        'pagado': 'Pagado',
        'en_preparacion': 'En Preparación',
        'enviado': 'Enviado',
        'listo_recoger': 'Listo Recoger',
        'entregado': 'Entregado',
        'completado': 'Completado',
        'cancelado': 'Cancelado',
        'devuelto': 'Devuelto'
      };
      return configs[p.estado] || p.estado;
    }) || [],
    datasets: [{
      data: data?.pedidosPorEstado?.map(p => parseInt(p.cantidad)) || [],
      backgroundColor: data?.pedidosPorEstado?.map(p => {
        const colors = {
          'pendiente': '#f59e0b',             // Amber
          'pendiente_verificacion': '#f97316', // Orange
          'pagado': '#22c55e',                // Green
          'en_preparacion': '#6366f1',        // Indigo
          'enviado': '#3b82f6',               // Blue
          'listo_recoger': '#8b5cf6',         // Purple
          'entregado': '#10b981',             // Teal
          'completado': '#0ea5e9',            // Sky
          'cancelado': '#ef4444',             // Red
          'devuelto': '#9ca3af'               // Gray
        };
        return colors[p.estado] || '#cad1d7';
      }) || [],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  // 2. Sales by Brand (Bar)
  const brandSalesData = {
    labels: data?.ventasPorMarca?.map(m => m.marca) || [],
    datasets: [{
      label: 'Ventas por Marca',
      data: data?.ventasPorMarca?.map(m => parseFloat(m.total_ventas)) || [],
      backgroundColor: 'rgba(139, 92, 246, 0.8)',
      borderRadius: 6,
      hoverBackgroundColor: '#8b5cf6'
    }]
  };

  // 3. Weekly Activity Patterns (Radar)
  const dayLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const weeklyActivityData = {
    labels: dayLabels,
    datasets: [{
      label: 'Ventas Semanales',
      data: dayLabels.map((_, i) => {
        const found = data?.ventasPorDiaSemana?.find(v => parseInt(v.num_dia) === (i + 1));
        return found ? parseFloat(found.total) : 0;
      }),
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
      borderColor: '#10b981',
      pointBackgroundColor: '#10b981',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#10b981',
      borderWidth: 2,
      fill: true
    }]
  };

  // 4. Hourly Peaks (Line)
  const hourlyPeaksData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [{
      label: 'Actividad por Hora',
      data: Array.from({ length: 24 }, (_, h) => {
        const found = data?.ventasPorHora?.find(v => parseInt(v.hora) === h);
        return found ? parseFloat(found.total) : 0;
      }),
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      borderWidth: 2,
      tension: 0.4,
      fill: true,
      pointRadius: 0,
      pointHoverRadius: 4
    }]
  };

  // 5. Customer Retention Trend (Stacked Area)
  const retentionTrendData = {
    labels: data?.clientesTrend?.map(t => t.mes) || [],
    datasets: [
      {
        label: 'Nuevos',
        data: data?.clientesTrend?.map(t => parseInt(t.nuevos)) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: '#3b82f6',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Recurrentes',
        data: data?.clientesTrend?.map(t => parseInt(t.recurrentes)) || [],
        backgroundColor: 'rgba(139, 92, 246, 0.6)',
        borderColor: '#8b5cf6',
        fill: true,
        tension: 0.4
      }
    ]
  };

  // 6. Payment Method Distribution (Doughnut)
  const paymentMethodsData = {
    labels: data?.metodosPago?.map(m => m.metodo) || [],
    datasets: [{
      data: data?.metodosPago?.map(m => parseFloat(m.total)) || [],
      backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ec4899'],
      borderWidth: 0,
      hoverOffset: 10
    }]
  };


  // --- END OF NEW ANALYTICS DATASETS ---


  // BI Stats Cards (Strategic Perspective)
  const statsCards = [
    {
      title: "Ganancia Estimada",
      value: `S/ ${(data?.estadisticas?.margenEstimado || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      trend: "25% de lo vendido",
      trendUp: true,
      icon: "fas fa-chart-line",
      iconColor: "text-purple-500",
      iconBg: "bg-purple-100",
      chartColor: "#A855F7",
      link: "/admin/reportes",
      chartData: (data?.ventasPorDia || []).map(v => parseFloat(v.total) * 0.25)
    },
    {
      title: "Promedio por Venta",
      value: `S/ ${(data?.estadisticas?.ticketPromedio || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      trend: "Monto promedio por compra",
      trendUp: true,
      icon: "fas fa-receipt",
      iconColor: "text-indigo-500",
      iconBg: "bg-indigo-100",
      chartColor: "#6366F1",
      link: "/admin/reportes",
      // Cambiamos a tendencia MENSUAL para que la forma sea distinta al Margen (que es diario)
      chartData: (data?.ventasPorMes || []).slice(-6).map(v => {
        const ped = parseInt(v.pedidos) || 1;
        return parseFloat(v.total) / ped;
      })
    },
    {
      title: "Clientes que Regresan",
      value: `${(data?.estadisticas?.tasaRetencion || 0).toFixed(1)}%`,
      trend: "Compraron +1 vez",
      trendUp: (data?.estadisticas?.tasaRetencion || 0) > 20,
      icon: "fas fa-sync-alt",
      iconColor: "text-teal-500",
      iconBg: "bg-teal-100",
      chartColor: "#14B8A6",
      link: "/admin/clientes",
      // Cambiamos a usar tendencia mensual para que se vea DIFERENTE (curva más suave)
      chartData: (data?.clientesTrend || []).map(v => {
        const total = parseInt(v.total_usuarios) || 1;
        const rec = parseInt(v.recurrentes) || 0;
        return (rec / total) * 100;
      })
    },
    {
      title: "Crecimiento del Mes",
      value: `${data?.estadisticas?.ventasTrend || "0.00%"}`,
      trend: "vs Mes Anterior",
      trendUp: !data?.estadisticas?.ventasTrend?.startsWith('-'),
      icon: "fas fa-rocket",
      iconColor: "text-fuchsia-500",
      iconBg: "bg-fuchsia-100",
      chartColor: "#D946EF",
      link: "/admin/reportes",
      chartData: (data?.ventasPorMes && data.ventasPorMes.length > 0)
        ? data.ventasPorMes.map(v => parseFloat(v.total) || 0)
        : []
    }
  ];


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <Link key={index} to={card.link} className="bg-white dark:bg-[#111c44] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all border border-transparent dark:border-white/5 block group">
            <div className="flex items-start gap-4 mb-4">
              {/* Icon Circle on Left */}
              <div className={`w-14 h-14 rounded-2xl ${card.iconBg} dark:bg-white/5 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110`}>
                <i className={`${card.icon} ${card.iconColor} text-xl`}></i>
              </div>

              {/* Title, Value, Trend on Right */}
              <div className="flex-1">
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{card.title}</p>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{card.value}</h2>
                  <div className={`flex items-center gap-1 text-[10px] font-bold ${card.trendUp ? 'text-green-500' : 'text-red-500'}`}>
                    <i className={`fas fa-arrow-${card.trendUp ? 'up' : 'down'}`}></i>
                    {card.trend}
                  </div>
                </div>
              </div>
            </div>

            {/* Mini Sparkline with Gradient */}
            <div className="h-12 w-full">
              <Line
                data={{
                  labels: ['1', '2', '3', '4', '5', '6', '7'],
                  datasets: [{
                    data: card.chartData,
                    borderColor: card.chartColor,
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 0,
                    fill: true,
                    backgroundColor: (context) => {
                      const ctx = context.chart.ctx;
                      const gradient = ctx.createLinearGradient(0, 0, 0, 48);
                      const color = card.chartColor;
                      gradient.addColorStop(0, `${color}33`); // 20% opacity
                      gradient.addColorStop(1, `${color}00`); // 0% opacity
                      return gradient;
                    }
                  }]
                }}
                options={sparklineOptions}
              />
            </div>
          </Link>
        ))
        }
      </div >

      {/* SECTION: FINANCIAL INTELLIGENCE */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-[#111c44] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Resumen de tus Ingresos</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Evolución de tus ventas y pedidos</p>
              </div>
              <div className="flex bg-gray-50 dark:bg-white/5 p-1 rounded-xl">
                {periods.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setChartPeriod(p.id)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${chartPeriod === p.id
                      ? 'bg-white dark:bg-orange-600 text-indigo-600 dark:text-white shadow-sm border border-gray-100 dark:border-transparent'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                      }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[300px] w-full relative">
              <Line data={recentOrderData} options={recentOrderOptions} plugins={[crosshairPlugin]} />
            </div>
          </div>

          <div className="lg:col-span-1 bg-white dark:bg-[#111c44] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5 flex flex-col">
            <div className="mb-6">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Ticket Promedio</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Evolución del valor de pedido</p>
            </div>
            <div className="flex-1 h-[200px] w-full">
              <Line
                data={aovTrendData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { grid: { display: false }, ticks: { font: { size: 9 } } },
                    y: { border: { dash: [5, 5] }, grid: { color: '#f3f4f6' }, ticks: { font: { size: 9 } } }
                  }
                }}
              />
            </div>
            <div className="mt-4 pt-4 border-t border-gray-50 dark:border-white/5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 dark:text-gray-400">Valor Actual:</span>
                <span className="font-bold text-gray-900 dark:text-white">S/ {data?.estadisticas?.ticketPromedio?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Status */}
          <div className="bg-white dark:bg-[#111c44] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5 flex flex-col">
            <div className="mb-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Estado de Pedidos</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Distribución operativa</p>
            </div>
            <div className="flex-1 flex items-center justify-center relative">
              <div className="h-[180px] w-full">
                <Doughnut
                  data={orderStatusData}
                  options={{
                    maintainAspectRatio: false,
                    cutout: '75%',
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: { usePointStyle: true, padding: 10, font: { size: 9 } }
                      }
                    }
                  }}
                />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{data?.estadisticas?.totalPedidos || 0}</span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase">Total</span>
              </div>
            </div>
          </div>

          {/* Brand Sales */}
          <div className="bg-white dark:bg-[#111c44] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5">
            <div className="mb-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Ventas por Marca</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Volumen por fabricante</p>
            </div>
            <div className="h-[200px] w-full">
              <Bar
                data={brandSalesData}
                options={{
                  indexAxis: 'y',
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { display: false, grid: { display: false } },
                    y: { grid: { display: false }, ticks: { font: { size: 9 } } }
                  }
                }}
              />
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white dark:bg-[#111c44] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5">
            <div className="mb-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Métodos de Pago</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Preferencia de clientes</p>
            </div>
            <div className="h-[200px] w-full">
              <Doughnut
                data={paymentMethodsData}
                options={{
                  maintainAspectRatio: false,
                  cutout: '60%',
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: { boxWidth: 8, font: { size: 9 } }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: GEOGRAPHIC ANALYSIS (Expanded) */}
      <div className="bg-white dark:bg-[#111c44] rounded-3xl p-8 shadow-md border border-gray-100 dark:border-white/5 ring-4 ring-indigo-50/50 dark:ring-indigo-500/10">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <i className="fas fa-map-marked-alt text-indigo-500"></i>
              Análisis Geográfico de Rendimiento
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Distribución de ingresos y volumen operativo por región</p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
              {data?.ventasPorUbicacion?.length} Regiones Activas
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Chart 1: Revenue Breakdown */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Ingresos por Región (S/)</h4>
              <i className="fas fa-chart-bar text-gray-300 dark:text-gray-600"></i>
            </div>
            <div className="h-[300px] w-full">
              <Bar
                data={{
                  labels: data?.ventasPorUbicacion?.map(v => v.region) || [],
                  datasets: [{
                    label: 'Ventas (S/)',
                    data: data?.ventasPorUbicacion?.map(v => parseFloat(v.total)) || [],
                    backgroundColor: 'rgba(99, 102, 241, 0.8)',
                    borderRadius: 12,
                    hoverBackgroundColor: 'rgba(99, 102, 241, 1)',
                  }]
                }}
                options={{
                  indexAxis: 'y',
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { grid: { color: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6' }, ticks: { color: isDark ? '#64748b' : '#9CA3AF', font: { size: 10 } } },
                    y: { grid: { display: false }, ticks: { color: isDark ? '#cbd5e1' : '#111827', font: { weight: 'bold', size: 11 } } }
                  }
                }}
              />
            </div>
          </div>

          {/* Chart 2: Order Volume Breakdown */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Volumen de Pedidos</h4>
              <i className="fas fa-shopping-cart text-gray-300 dark:text-gray-600"></i>
            </div>
            <div className="h-[300px] w-full">
              <Bar
                data={{
                  labels: data?.ventasPorUbicacion?.map(v => v.region) || [],
                  datasets: [{
                    label: 'Pedidos',
                    data: data?.ventasPorUbicacion?.map(v => v.pedidos) || [],
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderRadius: 12,
                    hoverBackgroundColor: 'rgba(16, 185, 129, 1)',
                  }]
                }}
                options={{
                  indexAxis: 'y',
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { grid: { color: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6' }, ticks: { color: isDark ? '#64748b' : '#9CA3AF', font: { size: 10 } } },
                    y: { grid: { display: false }, ticks: { color: isDark ? '#cbd5e1' : '#111827', font: { weight: 'bold', size: 11 } } }
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Region stats table below */}
        <div className="mt-10 pt-8 border-t border-gray-100 dark:border-white/5">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {data?.ventasPorUbicacion?.map((loc, i) => (
              <div key={i} className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 hover:shadow-sm transition-shadow">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 truncate">{loc.region}</p>
                <p className="text-sm font-black text-gray-900 dark:text-white">S/ {parseFloat(loc.total).toLocaleString()}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{loc.pedidos} ord.</span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                    {Math.round((parseFloat(loc.total) / data?.ventasPorUbicacion?.reduce((a, b) => a + parseFloat(b.total), 0)) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION: CUSTOMER INTELLIGENCE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#111c44] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5">
          <div className="mb-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Ciclo de Vida del Cliente</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Nuevos vs Recurrentes por mes</p>
          </div>
          <div className="h-[250px] w-full">
            <Line
              data={retentionTrendData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top', labels: { usePointStyle: true, font: { size: 10 } } }
                },
                scales: {
                  x: { grid: { display: false }, ticks: { color: isDark ? '#64748b' : '#9CA3AF' } },
                  y: { border: { dash: [5, 5] }, grid: { color: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6' }, ticks: { color: isDark ? '#64748b' : '#9CA3AF' } }
                }
              }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-[#111c44] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Top Clientes por Gasto</h3>
            <button className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">Ver reporte</button>
          </div>
          <div className="space-y-4">
            {data?.topClientes?.length > 0 ? data.topClientes.map((cliente, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors border-b border-gray-50 dark:border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-br ${idx === 0 ? 'from-yellow-400 to-orange-500' :
                    idx === 1 ? 'from-gray-300 to-gray-500' :
                      idx === 2 ? 'from-orange-300 to-orange-600' :
                        'from-indigo-400 to-purple-500'
                    }`}>
                    {cliente.nombre.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">{cliente.nombre}</h4>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">{cliente.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">S/ {parseFloat(cliente.total_gastado).toLocaleString()}</p>
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">{cliente.pedidos} pedidos</p>
                </div>
              </div>
            )) : (
              <p className="text-gray-400 text-center py-4">Cargando datos de clientes...</p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION: OPERATIONAL PATTERNS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#111c44] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5">
          <div className="mb-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Patrón de Actividad Semanal</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Intensidad de demanda</p>
          </div>
          <div className="h-[250px] w-full flex justify-center">
            <Radar
              data={weeklyActivityData}
              options={{
                maintainAspectRatio: false,
                scales: {
                  r: {
                    grid: { color: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6' },
                    angleLines: { color: isDark ? 'rgba(255,255,255,0.1)' : '#f3f4f6' },
                    pointLabels: { color: isDark ? '#94a3b8' : '#111827', font: { size: 10, weight: 'bold' } },
                    ticks: { display: false }
                  }
                },
                plugins: { legend: { display: false } }
              }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-[#111c44] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5">
          <div className="mb-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Picos de Venta por Hora</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Análisis operativo 24h</p>
          </div>
          <div className="h-[250px] w-full">
            <Line
              data={hourlyPeaksData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false }, ticks: { color: isDark ? '#64748b' : '#9CA3AF', font: { size: 9 } } },
                  y: { display: false }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* SECTION: INVENTORY & SALES MIX */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#111c44] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Productos Más Vendidos</h3>
          </div>
          <div className="space-y-4">
            {topProducts.map((product, idx) => (
              <Link key={idx} to={`/admin/productos/ver/${product.id}`} className="flex items-center justify-between gap-3 group block">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 dark:bg-white/5 flex items-center justify-center flex-shrink-0 border border-transparent dark:border-white/10 group-hover:border-indigo-500/30 transition-colors">
                    {product.image ? (
                      <img src={product.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <i className="fas fa-box text-gray-300"></i>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" title={product.name}>{product.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{product.items}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">{product.price}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-[#111c44] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Alerta de Stock Bajo</h3>
          </div>
          <div className="space-y-3">
            {lowStockProducts.slice(0, 4).map((product, idx) => (
              <Link key={idx} to={`/admin/productos/editar/${product.id}`} className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 hover:border-orange-500/30 transition-all block group">
                <div className="min-w-0 mr-3">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-orange-600 transition-colors" title={product.name}>{product.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${product.status === 'out' ? 'bg-red-100 dark:bg-red-500/10 text-red-600' : 'bg-orange-100 dark:bg-orange-500/10 text-orange-600'}`}>
                      Stock: {product.stock}
                    </span>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${product.status === 'out' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]'}`}></div>
              </Link>
            ))}
            {lowStockProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <i className="fas fa-check-circle text-2xl mb-2 text-green-500/50"></i>
                <p className="text-xs">Todo el inventario está al día</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-[#111c44] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Mix de Categorías</h3>
          <div className="h-[180px] w-full flex items-center justify-center mb-6">
            <Doughnut
              data={{
                labels: data?.ventasPorCategoria?.map(cat => cat.categoria) || [],
                datasets: [{
                  data: data?.ventasPorCategoria?.map(cat => parseFloat(cat.total_ventas)) || [],
                  backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
                  hoverOffset: 15,
                  cutout: '75%',
                  borderWidth: 0
                }]
              }}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (context) => ` S/ ${context.parsed.toLocaleString()}`
                    }
                  }
                }
              }}
            />
          </div>
          <div className="space-y-2 mt-auto">
            {data?.ventasPorCategoria?.slice(0, 4).map((cat, i) => (
              <div key={i} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'][i] }}></div>
                  <span className="text-gray-500 dark:text-gray-400 truncate">{cat.categoria}</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white ml-2">S/ {Math.round(parseFloat(cat.total_ventas)).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION: RECENT ACTIVITY - SPLIT TABLES */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Product Orders Table */}
        <div className="bg-white dark:bg-[#111c44] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Pedidos Recientes</h3>
              <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600">
                <i className="fas fa-shopping-bag text-xs"></i>
              </div>
            </div>
            <Link to="/admin/pedidos" className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Ver todo</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-100 dark:border-white/5">
                  <th className="pb-3 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="pb-3 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="pb-3 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="pb-3 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-right">Total</th>
                  <th className="pb-3 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                {data?.ultimosPedidos?.map((pedido, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                    onClick={() => window.location.href = `/admin/pedidos/ver/${pedido.id}`}
                  >
                    <td className="py-4 text-xs font-bold text-gray-900 dark:text-white">
                      <span className="group-hover:text-indigo-600 transition-colors">#{pedido.id}</span>
                    </td>
                    <td className="py-4 text-xs text-gray-600 dark:text-gray-300">{pedido.cliente_nombre || 'N/A'}</td>
                    <td className="py-4 text-xs text-gray-400 dark:text-gray-500">{new Date(pedido.fecha).toLocaleDateString()}</td>
                    <td className="py-4 text-xs font-bold text-right text-gray-900 dark:text-white">S/ {parseFloat(pedido.total).toFixed(2)}</td>
                    <td className="py-4 text-center">
                      <span className={`px-2 py-1 rounded-lg text-[9px] font-bold ${pedido.estado === 'pagado' || pedido.estado === 'Completado' ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-500' :
                          pedido.estado === 'en_preparacion' || pedido.estado === 'En proceso' ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-500' :
                            'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-500'
                        }`}>
                        {pedido.estado === 'en_preparacion' ? 'En proceso' : pedido.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Service Tickets Table */}
        <div className="bg-white dark:bg-[#111c44] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tickets de Servicio</h3>
              <div className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-500/10 text-orange-600">
                <i className="fas fa-tools text-xs"></i>
              </div>
            </div>
            <Link to="/admin/servicios/reservaciones" className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Ver todo</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-100 dark:border-white/5">
                  <th className="pb-3 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="pb-3 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="pb-3 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="pb-3 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-right">Costo</th>
                  <th className="pb-3 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                {data?.ultimasReservaciones?.map((ticket, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                    onClick={() => window.location.href = `/admin/servicios/reservaciones`}
                  >
                    <td className="py-4 text-xs font-bold text-gray-900 dark:text-white">
                      <span className="group-hover:text-orange-600 transition-colors">#{ticket.id}</span>
                    </td>
                    <td className="py-4 text-xs text-gray-600 dark:text-gray-300">{ticket.cliente_nombre || 'N/A'}</td>
                    <td className="py-4 text-xs text-gray-400 dark:text-gray-500">{new Date(ticket.fecha).toLocaleDateString()}</td>
                    <td className="py-4 text-xs font-bold text-right text-gray-900 dark:text-white">S/ {parseFloat(ticket.total).toFixed(2)}</td>
                    <td className="py-4 text-center">
                      <span className={`px-2 py-1 rounded-lg text-[9px] font-bold ${ticket.estado === 'Completado' ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-500' :
                          ticket.estado === 'En proceso' ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-500' :
                            'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-500'
                        }`}>
                        {ticket.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
