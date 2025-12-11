import { useState, useEffect } from 'react';
import { reportesService, productosService } from '../../services';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
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
  Filler
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
  Filler
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState('4M'); // Estado para el período del gráfico

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [dashboardData, productosResponse] = await Promise.all([
        reportesService.getDashboard(),
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


  // Debug: Ver datos reales
  console.log('📊 Dashboard Data:', {
    productos: productos.length,
    productosBajoStock,
    totalVentas: data.estadisticas?.totalVentas,
    ventasDia: data.estadisticas?.ventasDia,
    totalClientes: data.estadisticas?.totalClientes,
    productosConStock: productos.map(p => ({ nombre: p.nombre, stock: p.stock })),
    estadisticas: data.estadisticas
  });

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
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#000',
        bodyColor: '#000',
        borderColor: '#E5E7EB',
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
              ? `$${(value / 1000).toFixed(1)}k`
              : value.toFixed(0);
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
        hoverBackgroundColor: '#2F80ED',
        hoverBorderColor: '#fff',
        hoverBorderWidth: 2
      },
      line: { borderWidth: 2 }
    }
  };

  // Revenue Chart (Ingresos mensuales) - SIEMPRE 12 MESES
  const ventasPorMes = data?.ventasPorMes || [];
  const recentOrderData = {
    labels: ventasPorMes.slice(-12).map(v => {
      const [year, month] = v.mes.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return monthNames[parseInt(month) - 1];
    }),
    datasets: [{
      label: 'Revenue',
      data: ventasPorMes.slice(-12).map(v => parseFloat(v.total) || 0),
      borderColor: '#2F80ED',
      backgroundColor: (context) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(47, 128, 237, 0.2)');
        gradient.addColorStop(1, 'rgba(47, 128, 237, 0)');
        return gradient;
      },
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 6,
      pointHoverBackgroundColor: '#2F80ED',
      pointHoverBorderColor: '#ffffff',
      pointHoverBorderWidth: 3
    }]
  };

  // Custom HTML Tooltip Handler
  const getOrCreateTooltip = (chart) => {
    let tooltipEl = chart.canvas.parentNode.querySelector('div.chartjs-tooltip');

    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.className = 'chartjs-tooltip';
      tooltipEl.style.background = '#fff';
      tooltipEl.style.borderRadius = '8px';
      tooltipEl.style.opacity = 1;
      tooltipEl.style.pointerEvents = 'none';
      tooltipEl.style.position = 'absolute';
      tooltipEl.style.transform = 'translate(-50%, 0)';
      tooltipEl.style.transition = 'all .1s ease';
      tooltipEl.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
      tooltipEl.style.border = '1px solid #E5E7EB';
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
        tr.style.backgroundColor = '#F3F4F6'; // Gray header background

        const th = document.createElement('th');
        th.style.borderBottom = '1px solid #E5E7EB';
        th.style.padding = '8px 12px';
        th.style.textAlign = 'left';
        th.style.color = '#6B7280';
        th.style.fontSize = '12px';
        th.style.fontWeight = '500';
        th.innerText = title;

        tr.appendChild(th);
        tableHead.appendChild(tr);
      });

      const tableBody = document.createElement('tbody');
      bodyLines.forEach((body, i) => {
        const tr = document.createElement('tr');
        tr.style.backgroundColor = 'white';

        const td = document.createElement('td');
        td.style.padding = '8px 12px';
        td.style.fontSize = '14px';
        td.style.fontWeight = 'bold';
        td.style.color = '#1F2937';
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
        ctx.strokeStyle = '#D1D5DB';
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
          ctx.fillStyle = '#F3F4F6'; // Fondo gris claro
          ctx.strokeStyle = '#9CA3AF'; // Borde gris
          ctx.lineWidth = 1;

          ctx.fill();
          ctx.stroke();

          // Dibujar texto del mes
          ctx.fillStyle = '#1F2937'; // Texto oscuro
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
          label: (context) => `$:  ${Math.round(context.parsed.y)}`
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
          color: '#9CA3AF',
          padding: 10,
          font: { size: 12 }
        },
        border: { display: true, color: '#E5E7EB' }
      },
      y: {
        display: true,
        grid: {
          display: true,
          color: '#F3F4F6',
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
    name: p.nombre || 'Producto',
    items: `${p.total_vendido || 0} Vendidos`,
    price: `S/ ${parseFloat(p.precio || 0).toFixed(2)}`,
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

  // Stats Cards Data (Using ONLY real data from DB - Last 6 days)
  const statsCards = [
    {
      title: "Ventas Totales",
      value: `S/ ${(data?.estadisticas?.totalVentas || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      trend: data?.estadisticas?.ventasTrend || "0.00%",
      trendUp: parseFloat(data?.estadisticas?.ventasTrend || "0") >= 0,
      icon: "fas fa-shopping-bag",
      iconColor: "text-green-500",
      iconBg: "bg-green-100",
      chartColor: "#22C55E", // Green
      chartData: (data?.ventasPorDia && data.ventasPorDia.length > 0)
        ? data.ventasPorDia.map(v => parseFloat(v.total) || 0)
        : []
    },
    {
      title: "Productos Vendidos",
      value: `${(data?.estadisticas?.productosVendidos || 0).toLocaleString('en-US')}`,
      trend: data?.estadisticas?.productosVendidosTrend || "0.00%",
      trendUp: parseFloat(data?.estadisticas?.productosVendidosTrend || "0") >= 0,
      icon: "fas fa-box",
      iconColor: "text-orange-500",
      iconBg: "bg-orange-100",
      chartColor: "#F97316", // Orange
      chartData: (data?.productosVendidosPorDia && data.productosVendidosPorDia.length > 0)
        ? data.productosVendidosPorDia.map(v => parseInt(v.cantidad) || 0)
        : []
    },
    {
      title: "Pedidos Pagados",
      value: `${(data?.estadisticas?.totalPedidos || 0).toLocaleString('en-US')}`,
      trend: data?.estadisticas?.pedidosTrend || "0.00%",
      trendUp: parseFloat(data?.estadisticas?.pedidosTrend || "0") >= 0,
      icon: "fas fa-file-alt",
      iconColor: "text-gray-500",
      iconBg: "bg-gray-100",
      chartColor: "#9CA3AF", // Gray
      chartData: (data?.pedidosPorDia && data.pedidosPorDia.length > 0)
        ? data.pedidosPorDia.map(p => parseInt(p.cantidad) || 0)
        : []
    },
    {
      title: "Nuevos Clientes",
      value: `${(data?.estadisticas?.clientesNuevos || 0).toLocaleString('en-US')}`,
      trend: data?.estadisticas?.clientesNuevosTrend || "0.00%",
      trendUp: parseFloat(data?.estadisticas?.clientesNuevosTrend || "0") >= 0,
      icon: "fas fa-user-plus",
      iconColor: "text-blue-500",
      iconBg: "bg-blue-100",
      chartColor: "#3B82F6", // Blue
      chartData: (data?.clientesNuevosPorDia && data.clientesNuevosPorDia.length > 0)
        ? data.clientesNuevosPorDia.map(c => parseInt(c.cantidad) || 0)
        : []
    }
  ];

  return (
    <div className="space-y-6" >
      {/* Stats Cards Row */}
      < div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" >
        {
          statsCards.map((card, index) => (
            <div key={index} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                {/* Icon Circle on Left */}
                <div className={`w-14 h-14 rounded-2xl ${card.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <i className={`${card.icon} ${card.iconColor} text-xl`}></i>
                </div>

                {/* Title, Value, Trend on Right */}
                <div className="flex-1">
                  <p className="text-gray-500 text-sm font-medium mb-1">{card.title}</p>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-gray-900">{card.value}</h2>
                    <div className={`flex items-center gap-1 text-xs font-bold ${card.trendUp ? 'text-green-500' : 'text-red-500'}`}>
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
            </div>
          ))
        }
      </div >

      {/* Middle Row: Recent Order (40%), Top Products (40%), Top Countries (20%) */}
      < div className="grid grid-cols-1 lg:grid-cols-10 gap-6" >
        {/* Revenue Chart - Takes 4 columns (40%) */}
        < div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-sm" >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-gray-900">Resumen de Ingresos (Últimos 12 Meses)</h3>
          </div>
          <div className="h-[300px] w-full relative">
            <Line data={recentOrderData} options={recentOrderOptions} plugins={[crosshairPlugin]} />
          </div>
        </div >

        {/* Top Products List - Takes 4 columns (40%) */}
        < div className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-sm" >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-gray-900">Productos Más Vendidos</h3>
            <button className="text-xs text-gray-400 hover:text-blue-600">Ver todo <i className="fas fa-chevron-down ml-1"></i></button>
          </div>
          <div className="space-y-4">
            {topProducts.length > 0 ? topProducts.map((product, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 truncate">{product.name}</h4>
                    <p className="text-xs text-gray-500">{product.items}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-indigo-600">{product.price}</span>
              </div>
            )) : (
              <p className="text-gray-400 text-center py-4">No products data</p>
            )}
          </div>
        </div >

        {/* Low Stock Alert - DATOS REALES */}
        < div className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-sm" >
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <i className="fas fa-exclamation-triangle text-white text-xl"></i>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Alerta de Stock Bajo</h3>
                <p className="text-xs text-gray-500">Productos necesitan atención</p>
              </div>
            </div>
          </div>

          <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Productos con Stock Bajo</span>
              <span className="text-3xl font-bold text-red-600">{productosBajoStock}</span>
            </div>
          </div>

          <div className="space-y-3">
            {lowStockProducts.length > 0 ? lowStockProducts.map((product, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${product.status === 'out' ? 'bg-red-500 animate-pulse' : 'bg-orange-500'}`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.status === 'out' ? 'Sin stock' : 'Stock bajo'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${product.status === 'out'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-orange-100 text-orange-700'
                    }`}>
                    {product.stock} {product.status === 'out' ? 'unidades' : 'quedan'}
                  </span>
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <i className="fas fa-check-circle text-green-500 text-4xl mb-2"></i>
                <p className="text-gray-600 font-medium">¡Todos los productos tienen stock!</p>
                <p className="text-gray-400 text-sm">No se necesita reabastecimiento</p>
              </div>
            )}
          </div>
        </div >
      </div >

      {/* Bottom Row: Sales by Category & Recent Orders */}
      < div className="grid grid-cols-1 lg:grid-cols-3 gap-6" >
        {/* Sales by Category - Donut Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Ventas por Categoría</h3>
              <p className="text-xs text-gray-500">Total 20 Mar, 2023</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <i className="fas fa-ellipsis-h"></i>
            </button>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-gray-900">S/ {(data?.ventasPorCategoria?.reduce((sum, cat) => sum + parseFloat(cat.total_ventas || 0), 0) || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            </div>
            <p className="text-xs text-gray-500">Total Histórico</p>
          </div>

          <div className="h-[200px] w-full flex items-center justify-center mb-4">
            <Doughnut
              data={{
                labels: data?.ventasPorCategoria?.map(cat => cat.categoria || 'Sin categoría') || ['Sin datos'],
                datasets: [{
                  data: data?.ventasPorCategoria?.map(cat => parseFloat(cat.total_ventas || 0)) || [0],
                  backgroundColor: data?.ventasPorCategoria?.map((_, index) => {
                    const colors = [
                      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#6366F1',
                      '#EC4899', '#8B5CF6', '#14B8A6', '#F97316', '#06B6D4',
                      '#84CC16', '#A855F7', '#FB7185', '#22D3EE', '#F472B6'
                    ];
                    return colors[index % colors.length];
                  }) || ['#3B82F6'],
                  borderWidth: 0,
                  cutout: '70%'
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false }
                }
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 max-h-[150px] overflow-y-auto custom-scrollbar">
            {data?.ventasPorCategoria?.map((cat, index) => {
              const colors = [
                '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#6366F1',
                '#EC4899', '#8B5CF6', '#14B8A6', '#F97316', '#06B6D4',
                '#84CC16', '#A855F7', '#FB7185', '#22D3EE', '#F472B6'
              ];
              const color = colors[index % colors.length];
              return (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                  <span className="text-xs text-gray-600 truncate" title={cat.categoria}>{cat.categoria}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Orders Table */}
        < div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm" >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Pedidos Recientes</h3>
            <button className="text-xs text-gray-400 hover:text-blue-600">Ver todo <i className="fas fa-chevron-right ml-1"></i></button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">ID Pedido</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Cliente</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Fecha</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600">Total</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600">Estado</th>
                </tr>
              </thead>
              <tbody>
                {data?.ultimosPedidos?.slice(0, 8).map((pedido, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">#{pedido.id}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{pedido.cliente_nombre || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{new Date(pedido.fecha).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-sm font-bold text-right text-gray-900">S/ {parseFloat(pedido.total).toFixed(2)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${pedido.estado === 'Completado' ? 'bg-green-100 text-green-700' :
                        pedido.estado === 'En proceso' ? 'bg-blue-100 text-blue-700' :
                          pedido.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                        }`}>
                        {pedido.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div >
      </div >
    </div >
  );
};

export default Dashboard;
