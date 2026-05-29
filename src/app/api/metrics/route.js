import { NextResponse } from 'next/server'
import os from 'os'

// Simple metrics endpoint — Prometheus-compatible format
export async function GET(request) {
  const uptime    = process.uptime()
  const memUsage  = process.memoryUsage()
  const cpuLoad   = os.loadavg()
  const timestamp = Date.now()

  // Prometheus text format
  const metrics = `
# HELP process_uptime_seconds How long the process has been running
# TYPE process_uptime_seconds gauge
process_uptime_seconds ${uptime.toFixed(2)}

# HELP process_heap_used_bytes Node.js heap memory used
# TYPE process_heap_used_bytes gauge
process_heap_used_bytes ${memUsage.heapUsed}

# HELP process_heap_total_bytes Node.js heap memory total
# TYPE process_heap_total_bytes gauge
process_heap_total_bytes ${memUsage.heapTotal}

# HELP process_rss_bytes Node.js resident set size
# TYPE process_rss_bytes gauge
process_rss_bytes ${memUsage.rss}

# HELP system_load_average_1m System CPU load average 1 minute
# TYPE system_load_average_1m gauge
system_load_average_1m ${cpuLoad[0].toFixed(4)}

# HELP system_load_average_5m System CPU load average 5 minutes
# TYPE system_load_average_5m gauge
system_load_average_5m ${cpuLoad[1].toFixed(4)}

# HELP system_free_memory_bytes System free memory
# TYPE system_free_memory_bytes gauge
system_free_memory_bytes ${os.freemem()}

# HELP system_total_memory_bytes System total memory
# TYPE system_total_memory_bytes gauge
system_total_memory_bytes ${os.totalmem()}

# HELP nodejs_version_info Node.js version info
# TYPE nodejs_version_info gauge
nodejs_version_info{version="${process.version}"} 1
`.trim()

  return new NextResponse(metrics, {
    status: 200,
    headers: { 'Content-Type': 'text/plain; version=0.0.4' },
  })
}