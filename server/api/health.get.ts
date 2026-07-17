import type { HealthCheckResponse } from '#shared/types/healthApi'

export default defineEventHandler((): HealthCheckResponse => {
    return {
        status: 'ok',
        timestamp: new Date().toISOString(),
    }
})
